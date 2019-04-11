#! /usr/bin/env node
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
const { readFile } = require('fs-extra');
const portfinder = require('portfinder');
const { resolve } = require('path');
const {
  validateUniqueIdsInArray,
  validateDataAgainstSchema,
} = require('@knapsack/schema-utils');
const { KnapsackRendererBase } = require('../server/renderer-base');
const log = require('../cli/log');
const { knapsackEvents, EVENTS } = require('../server/events');
const { version } = require('../../package.json');
const { dirExistsOrExit } = require('../server/server-utils');
const {
  knapsackDesignTokensSchema,
} = require('../schemas/knapsack-design-tokens.schema');

/**
 * Handle backwards compatibility of config
 * @param {KnapsackUserConfig} config
 * @return {KnapsackConfig}
 */
function convertOldConfig(config) {
  // @deprecated - remove in v1.0.0
  if (config.templates) {
    log.warn(
      'knapsack.config.js prop "templates" is deprecated and has been renamed to "templateRenderers", please rename with no change to config needed. The bots have moved your config to correct spot for now, but this will stop working at 1.0.0',
    );
    config.templateRenderers = config.templates;
    delete config.templates;
  }

  if (config.css || config.js) {
    const assetSet = {
      id: 'default',
      title: 'Default',
      assets: [],
    };
    if (config.css) {
      config.css.forEach(src => assetSet.assets.push({ src }));
      delete config.css;
    }
    if (config.js) {
      config.js.forEach(src => assetSet.assets.push({ src }));
      delete config.js;
    }
    config.assetSets = [assetSet];
  }

  return config;
}

/**
 * @param {KnapsackConfig} config
 * @returns {boolean}
 * @todo validate with schema and assign defaults
 */
function validateConfig(config) {
  const templateRendererResults = validateUniqueIdsInArray(
    config.templateRenderers,
  );
  if (!templateRendererResults.ok) {
    log.error(
      `Each templateRenderer must have a unique id, these do not: ${
        templateRendererResults.duplicateIdList
      }`,
    );
    process.exit(1);
  }

  config.templateRenderers.forEach((templateRenderer, i) => {
    if (templateRenderer instanceof KnapsackRendererBase === false) {
      log.error(
        `Each templateRenderer must be an instance of "KnapsackRenderer" and ${templateRenderer.id ||
          `number ${i + 1}`} is not`,
      );
      process.exit(1);
    }
  });

  // @todo check if `config.patterns` exists; but can't now as it can contain globs
  dirExistsOrExit(config.public);
  if (config.docsDir) dirExistsOrExit(config.docsDir);

  {
    const { message, ok } = validateDataAgainstSchema(
      knapsackDesignTokensSchema,
      config.designTokens.data,
    );

    if (!ok) {
      log.error(message);
      process.exit(1);
    }
  }

  {
    const { ok, message } = validateUniqueIdsInArray(
      config.designTokens.data.tokens,
      'name',
    );
    if (!ok) {
      log.error(`Error in Design Tokens. ${message}`);
      process.exit(1);
    }
  }

  if (config.designTokens.createCodeSnippet) {
    config.designTokens.data.tokens = config.designTokens.data.tokens.map(
      token => {
        if (token.code) return token;
        return {
          ...token,
          code: config.designTokens.createCodeSnippet(token),
        };
      },
    );
  }

  return true;
}

/**
 * Prepare user config: validate, convert all paths to absolute, assign defaults
 * @param {KnapsackUserConfig} userConfig
 * @param {string} from
 * @returns {KnapsackConfig}
 */
function processConfig(userConfig, from) {
  const {
    patterns,
    public: publicDir,
    dist,
    docsDir,
    ...rest
  } = convertOldConfig(userConfig);

  const config = {
    patterns: patterns.map(p => resolve(from, p)),
    public: resolve(from, publicDir),
    dist: resolve(from, dist),
    docsDir: docsDir ? resolve(from, docsDir) : null,
    assetSets: userConfig.assetSets || [],
    ...rest,
  };

  const ok = validateConfig(config);
  if (!ok) process.exit(1);

  knapsackEvents.emit(EVENTS.CONFIG_READY, config);

  return config;
}

/**
 * @param {KnapsackConfig} config
 * @return {Promise<KnapsackMeta>}
 */
async function getMeta(config) {
  return {
    websocketsPort: await portfinder.getPortPromise(),
    knapsackVersion: version,
    changelog: config.changelog
      ? await readFile(config.changelog, 'utf8')
      : null,
    version: config.version,
  };
}

module.exports = {
  processConfig,
  getMeta,
};
