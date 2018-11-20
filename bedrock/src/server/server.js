const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { mergeSchemas, makeExecutableSchema } = require('graphql-tools');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const { join } = require('path');
const log = require('../cli/log');
const { getRoutes } = require('./rest-api');
const { enableTemplatePush } = require('../lib/features');
const { USER_SITE_PUBLIC } = require('../lib/constants');
const {
  PageBuilder,
  pageBuilderPagesTypeDef,
  pageBuilderPagesResolvers,
} = require('./page-builder');
const { Settings, settingsTypeDef, settingsResolvers } = require('./settings');
const {
  DesignTokens,
  designTokensTypeDef,
  designTokensResolvers,
} = require('./design-tokens');
const { Patterns, patternsResolvers, patternsTypeDef } = require('./patterns');

/**
 * @param {BedrockConfig} config
 * @param {BedrockMeta} meta
 * @returns {Promise<void>}
 */
async function serve(config, meta) {
  const port = 3999;

  const patterns = new Patterns({
    newPatternDir: config.newPatternDir,
    patternPaths: config.src,
    dataDir: config.data,
  });

  const metaTypeDef = gql`
    type Meta {
      websocketsPort: Int
      bedrockVersion: String
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
      ],
    }),
    // https://www.apollographql.com/docs/apollo-server/essentials/data.html#context
    context: ({ req }) => ({// eslint-disable-line
      pageBuilderPages: new PageBuilder({ dataDir: config.data }),
      settings: new Settings({ dataDir: config.data }),
      tokens: new DesignTokens({ tokenPath: config.designTokens }),
      patterns,
    }),
    // playground: true,
    // introspection: true,
  });

  const app = express();
  app.use(bodyParser.json());
  gqlServer.applyMiddleware({ app });

  app.use('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
    );
    next();
  });

  if (config.dist) {
    app.use(express.static(config.dist));
    // Since this is a Single Page App, we will send all html requests to the `index.html` file in the dist
    app.use('*', (req, res, next) => {
      const { accept = '' } = req.headers;
      const accepted = accept.split(',');
      if (accepted.includes('text/html')) {
        res.sendFile(join(config.dist, 'index.html'));
      } else {
        next();
      }
    });
  }

  if (config.public) {
    app.use(USER_SITE_PUBLIC, express.static(config.public));
  }

  // if (config.staticDirs) {
  //   config.staticDirs.forEach(staticDir =>
  //     app.use(staticDir.prefix, express.static(staticDir.path)),
  //   );
  // }

  // const designTokens = new DesignTokens({
  //   tokenPath: config.designTokens,
  // });

  // const tokens = {
  //   tokens: await designTokens.getTokens(),
  //   categories: await designTokens.allCategoriesUsed,
  // };

  const endpoints = [];

  /**
   * @param {string} pathname - URL Endpoint path
   * @param {'GET' | 'POST'} [method='GET'] - HTTP method
   * @returns {void}
   */
  function registerEndpoint(pathname, method = 'GET') {
    endpoints.push({
      pathname,
      method,
    });
  }

  const showEndpoints = true;

  const restApiRoutes = getRoutes({
    registerEndpoint,
    webroot: config.dist,
    public: config.public,
    baseUrl: '/api',
    meta,
    // designTokens: tokens.categories.map(category => {
    //   const theseTokens = tokens.tokens.filter(
    //     token => token.category === category,
    //   );
    //   return {
    //     id: category,
    //     meta: {
    //       title: category,
    //       description: `Description for ${category}`,
    //     },
    //     get: () => Promise.resolve(theseTokens),
    //   };
    // }),
    patternManifest: patterns,
    templateRenderers: config.templates,
    pageBuilder: new PageBuilder({
      dataDir: config.data,
    }),
    settingsStore: new Settings({ dataDir: config.data }),
    css: config.css,
    js: config.js,
  });

  app.use(restApiRoutes);

  /** @type {WebSocket.Server} */
  let wss;

  /**
   * @param {Object} data - Data to send to Websocket client
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
    // console.log('announcePatternChange...');
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
    if (showEndpoints) {
      log.dim(
        `Available endpoints: \n${endpoints
          .map(e => ` ${e.pathname} (${e.method})`)
          .join('\n')}`,
      );
    }
    setTimeout(() => {
      log.success(`🚀 Server listening on http://localhost:${port}`);
    }, 250);
  });

  if (enableTemplatePush && wss) {
    patterns.watch(({ event, path }) => {
      announcePatternChange({ event, path });
    });
  }
}

module.exports = {
  serve,
};
