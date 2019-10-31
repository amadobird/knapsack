/**
 *  Copyright (C) 2018 Basalt
    This file is part of Knapsack.
    Knapsack is free software; you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by the Free
    Software Foundation; either version 2 of the License, or (at your option)
    any later version.

    Knapsack is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
    FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
    more details.

    You should have received a copy of the GNU General Public License along
    with Knapsack; if not, see <https://www.gnu.org/licenses>.
 */
import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import { mergeSchemas, makeExecutableSchema } from 'graphql-tools';
import WebSocket from 'ws';
import bodyParser from 'body-parser';
import { join } from 'path';
import * as log from '../cli/log';
import { knapsackEvents, EVENTS } from './events';
import { getRoutes } from './rest-api';
import { enableTemplatePush } from '../lib/features';
import { getRole } from './auth';
import { PERMISSIONS, apiUrlBase } from '../lib/constants';
import {
  pageBuilderPagesTypeDef,
  pageBuilderPagesResolvers,
} from './page-builder';
import { settingsTypeDef, settingsResolvers } from './settings';
import { customPagesResolvers, customPagesTypeDef } from './custom-pages';
import { docsTypeDef, docsResolvers } from './docs';
import { designTokensTypeDef, designTokensResolvers } from './design-tokens';
import { patternsResolvers, patternsTypeDef } from './patterns';
import { getBrain } from '../lib/bootstrap';
import { KnapsackMeta, GraphQlContext } from '../schemas/misc';

export async function serve({ meta }: { meta: KnapsackMeta }): Promise<void> {
  const {
    patterns,
    customPages,
    pageBuilderPages,
    settings,
    tokens,
    docs,
    config,
  } = getBrain();
  const port = process.env.KNAPSACK_PORT || 3999;
  const knapsackDistDir = join(__dirname, '../../dist/client');

  const metaTypeDef = gql`
    type Meta {
      websocketsPort: Int!
      knapsackVersion: String
      changelog: String
      version: String
    }

    type Query {
      meta: Meta
    }
  `;

  const metaResolvers = {
    Query: {
      meta: () => meta,
    },
  };

  const gqlServer = new ApolloServer({
    schema: mergeSchemas({
      schemas: [
        makeExecutableSchema({
          typeDefs: pageBuilderPagesTypeDef,
          resolvers: pageBuilderPagesResolvers,
        }),
        makeExecutableSchema({
          typeDefs: settingsTypeDef,
          resolvers: settingsResolvers,
        }),
        makeExecutableSchema({
          typeDefs: designTokensTypeDef,
          resolvers: designTokensResolvers,
        }),
        makeExecutableSchema({
          typeDefs: patternsTypeDef,
          resolvers: patternsResolvers,
        }),
        makeExecutableSchema({
          typeDefs: metaTypeDef,
          resolvers: metaResolvers,
        }),
        makeExecutableSchema({
          typeDefs: docsTypeDef,
          resolvers: docsResolvers,
        }),
        makeExecutableSchema({
          typeDefs: customPagesTypeDef,
          resolvers: customPagesResolvers,
        }),
      ],
    }),
    // https://www.apollographql.com/docs/apollo-server/essentials/data.html#context
    context: ({ req }) => {
      // const { host, origin } = req.headers;
      // log.verbose('request received', { host, origin }, 'graphql');
      const role = getRole(req);
      const canWrite = role.permissions.includes(PERMISSIONS.WRITE);

      const context: GraphQlContext = {
        pageBuilderPages,
        settings,
        tokens,
        docs,
        patterns,
        canWrite,
        customPages,
        config,
      };

      return context;
    },
    playground: true,
    introspection: true,
  });

  const app = express();
  app.use(
    bodyParser.json({
      limit: '5000kb',
    }),
  );
  gqlServer.applyMiddleware({ app });

  app.use('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
    );
    next();
  });

  app.use(
    express.static(knapsackDistDir, {
      maxAge: '1d',
    }),
  );

  if (config.dist) {
    app.use(
      express.static(config.dist, {
        maxAge: '1d',
      }),
    );
  }

  if (config.public) {
    app.use(express.static(config.public));
  }

  // if (config.staticDirs) {
  //   config.staticDirs.forEach(staticDir =>
  //     app.use(staticDir.prefix, express.static(staticDir.path)),
  //   );
  // }

  const endpoints = [];

  function registerEndpoint(
    pathname: string,
    method: 'GET' | 'POST' = 'GET',
  ): void {
    endpoints.push({
      pathname,
      method,
    });
  }

  const restApiRoutes = getRoutes({
    registerEndpoint,
    webroot: config.dist,
    public: config.public,
    baseUrl: apiUrlBase,
    meta,
    patternManifest: patterns,
    templateRenderers: config.templateRenderers,
    pageBuilder: pageBuilderPages,
    settingsStore: settings,
  });

  app.use(restApiRoutes);

  // This page is mainly so IE can get a list of links to view the individual templates outside of the system
  app.route('/demo-urls').get((req, res) => {
    const patternDemos = patterns.getPatternsDemoUrls();

    /* eslint-disable prettier/prettier */
    // disabling prettier so it's possible to keep indenting semi-similar to how it'd be done with templates, please try and keep it tidy and consistent!
    res.send(`
<ul>
${patternDemos
        .map(
          patternDemo => `
  <li>
    Pattern: ${patternDemo.title}
    <ul>
      ${patternDemo.templates
              .map(
                template => `
        <li>
          Template: ${template.title}
          <br>
            ${template.demoUrls
                    .map(
                      (demoUrl, i) => `
              <a href="${demoUrl}" target="_blank">Demo Data ${i +
                        1}</a>
            `,
                    )
                    .join(' - ')}
        </li>
      `,
              )
              .join('\n')}
    </ul>
  </li>
`,
        )
        .join('\n')}
</ul>
    `);
    /* eslint-enable prettier/prettier */
  });

  // Since this is a Single Page App, we will send all html requests to the `index.html` file in the dist
  app.use('*', (req, res, next) => {
    const { accept = '' } = req.headers;
    const accepted = accept.split(',');
    // this is for serving up a Netlify CMS folder if present
    if (!req.baseUrl.startsWith('/admin') && accepted.includes('text/html')) {
      res.sendFile(join(knapsackDistDir, 'index.html'));
    } else {
      next();
    }
  });

  /** @type {WebSocket.Server} */
  let wss;

  /**
   * @param {object} data - Data to send to Websocket client
   * @returns {boolean} - if successful
   * @todo improve `data` definition
   */
  function announcePatternChange(data) {
    if (!wss) {
      console.error(
        'Attempted to fire "announcePatternChange" but no WebSockets Server setup due to lack of "websocketsPort" in config',
      );
      return false;
    }
    log.verbose('announcePatternChange', data, 'server');
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
    return true;
  }

  if (meta.websocketsPort && enableTemplatePush) {
    wss = new WebSocket.Server({
      port: meta.websocketsPort,
      clientTracking: true,
    });
  }

  app.listen(port, () => {
    log.silly('Available endpoints', endpoints, 'server');

    // want url to not get buried with info
    // @todo show this after event is fired from WebPack being ready
    setTimeout(() => {
      log.info(
        `🚀 Server listening on http://localhost:${port}`,
        null,
        'server',
      );
    }, 250);
  });

  if (enableTemplatePush && wss) {
    knapsackEvents.on(EVENTS.PATTERN_TEMPLATE_CHANGED, ({ path }) => {
      setTimeout(() => {
        announcePatternChange({ event: 'changed', path });
      }, 100);
    });

    knapsackEvents.on(EVENTS.PATTERN_ASSET_CHANGED, ({ path }) => {
      setTimeout(() => {
        announcePatternChange({ event: 'changed', path });
      }, 100);
    });
  }
}
