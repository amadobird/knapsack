/**
 *  Copyright (C) 2018 Basalt
    This file is part of Bedrock.
    Bedrock is free software; you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by the Free
    Software Foundation; either version 2 of the License, or (at your option)
    any later version.

    Bedrock is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
    FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
    more details.

    You should have received a copy of the GNU General Public License along
    with Bedrock; if not, see <https://www.gnu.org/licenses>.
 */
const express = require('express');
const urlJoin = require('url-join');
const fs = require('fs-extra');
const md = require('marked');
const highlight = require('highlight.js');
const { wrapHtml } = require('./templates');
const { BASE_PATHS } = require('../lib/constants');
const { enableUiSettings } = require('../lib/features');

const router = express.Router();

// https://marked.js.org/#/USING_ADVANCED.md
md.setOptions({
  highlight: code => highlight.highlightAuto(code).value,
});

function getRoutes(config) {
  const {
    registerEndpoint,
    patternManifest,
    pageBuilder,
    settingsStore,
  } = config;

  router.get(config.baseUrl, (req, res) => {
    res.json({
      ok: true,
      message: 'Welcome to the API!',
    });
  });

  // if (config.designTokens) {
  //   config.designTokens.forEach(designToken => {
  //     const url = urlJoin(config.baseUrl, 'design-token', designToken.id);
  //     // console.log(`Setting up "${url}" api endpoint...`);
  //     registerEndpoint(url);
  //     router.get(url, async (req, res) => {
  //       try {
  //         const tokens = await designToken.get(req.query);
  //         // console.log(`Responding on "${url}" api endpoint with: `, tokens);
  //         res.send({
  //           ok: true,
  //           data: tokens,
  //         });
  //       } catch (err) {
  //         res.send({
  //           ok: false,
  //           message: err.toString(),
  //         });
  //       }
  //     });
  //   });
  //
  //   const url2 = urlJoin(config.baseUrl, 'design-tokens');
  //   registerEndpoint(url2);
  //   router.get(url2, async (req, res) => {
  //     res.send(config.designTokens);
  //   });
  // }

  if (config.templateRenderers) {
    const url = urlJoin(config.baseUrl, '/render');
    // console.log(`Setting up "${url}" api endpoint...`);
    registerEndpoint(url, 'POST');
    router.post(url, async (req, res) => {
      const { body } = req;
      const { type } = req.query;
      if (!type) {
        console.error('Error: not enough info to render template');
        res.status(400).send({
          ok: false,
          message: 'Request not formatted correctly.',
        });
      }

      const {
        /** @type {string} */
        template,
        /** @type {Object} */
        data,
      } = body;

      let results;
      switch (type) {
        // case 'renderString': {
        //   // @todo determine how to figure out what renderer to use if it's a `renderString` request since we can't look at the `template` string and use file extension (since it's a template string and not a template name/path string). best idea so far is to add an `id` to each template renderer, but then it gets more complicated when it's used elsewhere. will probably get more fleshed out as other template languages land. see https://github.com/basaltinc/bedrock/issues/33
        //   const renderer = config.templateRenderers.find(t =>
        //     t.id(body.rendererId),
        //   );
        //   if (!renderer) {
        //     console.error(
        //       'Error: no template renderer found to handle this template',
        //     );
        //     res.status(400).send({
        //       ok: false,
        //       message: 'No template renderer found to handle this template',
        //     });
        //   }
        //   results = await renderer.renderString(template, data);
        //   break;
        // }
        case 'renderFile': {
          const renderer = config.templateRenderers.find(t => t.test(template));
          if (!renderer) {
            console.error(
              'Error: no template renderer found to handle this template',
            );
            res.status(400).send({
              ok: false,
              message: 'No template renderer found to handle this template',
            });
          }
          results = await renderer.render(template, data);
          break;
        }
        default:
          results = {
            ok: false,
            message: 'No valid "type" of request sent.',
          };
      }

      // @todo allow query param on API request to toggle
      const wrapHtmlResults = true;
      if (results.ok && wrapHtmlResults) {
        results.html = wrapHtml(results.html, config.css, config.js);
      }

      res.json(results);
    });
  }

  if (patternManifest) {
    const url1 = urlJoin(config.baseUrl, 'pattern/:id');
    registerEndpoint(url1);
    router.get(url1, async (req, res) => {
      const results = await patternManifest.getPattern(req.params.id);
      res.send(results);
    });

    const url2 = urlJoin(config.baseUrl, 'patterns');
    registerEndpoint(url2);
    router.get(url2, async (req, res) => {
      const results = await patternManifest.getPatterns();
      res.send(results);
    });

    const url3 = urlJoin(config.baseUrl, 'pattern-meta/:id');
    registerEndpoint(url3);
    router.get(url3, async (req, res) => {
      const results = await patternManifest.getPatternMeta(req.params.id);
      res.send(results);
    });

    const url4 = urlJoin(config.baseUrl, 'pattern-meta/:id');
    registerEndpoint(url4, 'POST');
    router.post(url4, async (req, res) => {
      const results = await patternManifest.setPatternMeta(
        req.params.id,
        req.body,
      );
      res.send(results);
    });

    const url5 = urlJoin(config.baseUrl, 'new-pattern');
    registerEndpoint(url5, 'POST');
    router.post(url5, async (req, res) => {
      const results = await patternManifest.createPatternFiles(req.body);
      res.send(results);
    });
  }

  if (pageBuilder) {
    const url1 = urlJoin(config.baseUrl, `${BASE_PATHS.PAGES}/:id`);
    registerEndpoint(url1);
    router.get(url1, async (req, res) => {
      try {
        const page = await pageBuilder.getPageBuilderPage(req.params.id);
        res.send({
          ok: true,
          page,
        });
      } catch (error) {
        if (error.code === 'ENOENT') {
          res.send({
            ok: false,
            message: `Example "${req.params.id}" not found.`,
          });
        } else {
          res.send({
            ok: false,
            message: error.toString(),
          });
        }
      }
    });

    const url2 = urlJoin(config.baseUrl, `${BASE_PATHS.PAGES}/:id`);
    registerEndpoint(url2, 'POST');
    router.post(url2, async (req, res) => {
      const results = await pageBuilder.setPageBuilderPage(
        req.params.id,
        req.body,
      );
      res.send(results);
    });

    const url3 = urlJoin(config.baseUrl, BASE_PATHS.PAGES);
    registerEndpoint(url3);
    router.get(url3, async (req, res) => {
      const results = await pageBuilder.getPageBuilderPages();
      res.send(results);
    });
  } else {
    router.get(urlJoin(config.baseUrl, BASE_PATHS.PAGES), async (req, res) => {
      res.send([]);
    });
  }

  if (config.sections) {
    config.sections.forEach(section => {
      const url = urlJoin(config.baseUrl, `section/${section.id}/:id`);
      registerEndpoint(url);
      router.get(url, async (req, res) => {
        const item = section.items.find(x => x.id === req.params.id);
        if (!item) {
          res.send({
            ok: false,
            message: `Item ${req.params.id} not found`,
          });
        }
        const contents = await fs.readFile(item.src, 'utf8');
        const isMarkdown = item.src.endsWith('.md');
        res.send({
          ok: true,
          data: {
            ...item,
            contents: isMarkdown ? md(contents) : contents,
          },
        });
      });
    });
  }

  const url2 = urlJoin(config.baseUrl, 'sections');
  registerEndpoint(url2);
  router.get(url2, async (req, res) => {
    const { sections = [] } = config;
    res.send(sections);
  });

  const url3 = urlJoin(config.baseUrl, 'settings');
  registerEndpoint(url3);
  router.get(url3, async (req, res) => {
    const settings = settingsStore.getSettings();
    res.send(settings);
  });

  if (enableUiSettings) {
    const url4 = urlJoin(config.baseUrl, 'settings');
    registerEndpoint(url4, 'POST');
    router.post(url4, async (req, res) => {
      const results = settingsStore.setSettings(req.body);
      res.send(results);
    });
  }

  const url5 = urlJoin(config.baseUrl, 'meta');
  registerEndpoint(url5);
  router.get(url5, (req, res) => {
    res.send(config.meta);
  });

  return router;
}

module.exports = {
  getRoutes,
};
