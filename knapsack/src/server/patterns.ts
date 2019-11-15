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
import fs, { readJSONSync, readFile } from 'fs-extra';
import { join, relative, resolve, parse } from 'path';
import globby from 'globby';
import {
  validateSchemaAndAssignDefaults,
  validateUniqueIdsInArray,
} from '@knapsack/schema-utils';
import chokidar from 'chokidar';
import { version as iframeResizerVersion } from 'iframe-resizer/package.json';
import {
  createDemoUrl,
  writeJson,
  fileExists,
  fileExistsOrExit,
  isRemoteUrl,
  readYamlSync,
} from './server-utils';
import { knapsackEvents, EVENTS, emitPatternsDataReady } from './events';
import { FileDb2 } from './dbs/file-db';
import * as log from '../cli/log';
import { FILE_NAMES } from '../lib/constants';
import {
  KnapsackPattern,
  KnapsackPatternTemplate,
  KnapsackPatternTemplateCode,
  KnapsackTemplateStatus,
  KnapsackPatternsConfig,
  KnapsackTemplateData,
  KnapsackTemplateDemo,
} from '../schemas/patterns';
import { GenericResponse } from '../schemas/misc';
import {
  KnapsackTemplateRenderer,
  KnapsackTemplateRenderResults,
} from '../schemas/knapsack-config';
import {
  KnapsackAssetSet,
  KnapsackAssetSetConfig,
} from '../schemas/asset-sets';

export class Patterns {
  configDb: FileDb2<KnapsackPatternsConfig>;

  dataDir: string;

  templateRenderers: {
    [id: string]: KnapsackTemplateRenderer;
  };

  allPatterns: KnapsackPattern[];

  byId: {
    [id: string]: KnapsackPattern;
  };

  private assetSets: import('./asset-sets').AssetSets;

  constructor({
    dataDir,
    templateRenderers,
    assetSets,
  }: {
    dataDir: string;
    templateRenderers: KnapsackTemplateRenderer[];
    assetSets: import('./asset-sets').AssetSets;
  }) {
    this.configDb = new FileDb2<KnapsackPatternsConfig>({
      dbDir: dataDir,
      name: 'knapsack.patterns',
      defaults: {
        templateStatuses: [
          {
            id: 'draft',
            title: 'Draft',
            color: '#9b9b9b',
          },
          {
            id: 'inProgress',
            title: 'In Progress',
            color: '#FC0',
          },
          {
            id: 'ready',
            title: 'Ready',
            color: '#2ECC40',
          },
        ],
      },
    });

    this.assetSets = assetSets;
    this.dataDir = dataDir;
    this.templateRenderers = {};

    // @todo should probably convert this at a higher level later
    templateRenderers.forEach(templateRenderer => {
      this.templateRenderers[templateRenderer.id] = templateRenderer;
    });
    this.updatePatternsData();
  }

  updatePatternsData() {
    const patternDataFiles = globby.sync(
      `${join(this.dataDir, 'knapsack.pattern.*.json')}`,
      {
        expandDirectories: false,
        onlyFiles: true,
      },
    );
    const byId = {};
    patternDataFiles.forEach(fileName => {
      const pattern: KnapsackPattern = readJSONSync(fileName);
      // @todo validate: template path exists, has template render that exists, using assetSets that exist
      byId[pattern.id] = pattern;
    });
    this.byId = byId;
    this.allPatterns = Object.values(byId);
    this.getAllTemplatePaths().forEach(path => {
      const absPath = join(this.dataDir, path);
      fileExistsOrExit(
        absPath,
        `This file should exist but it doesn't:
File path in config: ${path}
Looking relative to ${this.dataDir}
Resolved absolute path: ${absPath}
      `,
      );
    });
    emitPatternsDataReady(this.allPatterns);
  }

  getPattern(id: string): KnapsackPattern {
    return this.byId[id];
  }

  getPatterns(): KnapsackPattern[] {
    return this.allPatterns;
  }

  /**
   * Get all the pattern's template file paths
   * @return - paths to all template files
   */
  getAllTemplatePaths({ relativeTo }: { relativeTo?: string } = {}): string[] {
    const allTemplatePaths = [];
    this.allPatterns.forEach(pattern => {
      pattern.templates.forEach(template => {
        allTemplatePaths.push(
          relativeTo ? join(relativeTo, template.path) : template.path,
        );
      });
    });
    return allTemplatePaths;
  }

  getTemplateAbsolutePath({ patternId, templateId }): string {
    const pattern = this.byId[patternId];
    if (!pattern) throw new Error(`Could not find pattern ${patternId}`);
    const template = pattern.templates.find(t => t.id === templateId);
    if (!template)
      throw new Error(
        `Could not find template ${templateId} in pattern ${patternId}`,
      );
    const path = join(this.dataDir, template.path);
    if (!fileExists(path)) throw new Error(`File does not exist: ${path}`);
    return path;
  }

  getTemplateStatuses(): KnapsackTemplateStatus[] {
    return this.configDb.getConfig().templateStatuses;
  }

  // watch(): void {
  //   const configFilesToWatch = [];
  //   this.allPatterns.forEach(pattern => {
  //     configFilesToWatch.push(
  //       join(pattern.dir, FILE_NAMES.PATTERN_CONFIG),
  //       join(pattern.dir, FILE_NAMES.PATTERN_META),
  //       ...pattern.templates
  //         .filter(t => t.docPath)
  //         .map(t => join(pattern.dir, t.docPath)),
  //     );
  //   });
  //   const watcher = chokidar.watch(configFilesToWatch, {
  //     ignoreInitial: true,
  //   });
  //
  //   watcher.on('ready', () => {
  //     log.silly(
  //       `Core Patterns is watching these files:`,
  //       watcher.getWatched(),
  //       'patterns',
  //     );
  //   });
  // }

  /**
   * Render template
   */
  async render({
    patternId,
    templateId = '',
    wrapHtml = true,
    // demoDataId,
    demo,
    isInIframe = false,
    websocketsPort,
    assetSetId,
  }: {
    patternId: string;
    templateId: string;
    /**
     * Should it wrap HTML results with `<head>` and include assets?
     */
    wrapHtml?: boolean;
    /**
     * Demo data to pass to template
     */
    demo?: KnapsackTemplateDemo;
    /**
     * Demo data id to pass to template
     */
    demoDataId?: string;
    /**
     * Will this be in an iFrame?
     */
    isInIframe?: boolean;
    websocketsPort?: number;
    assetSetId?: string;
  }): Promise<KnapsackTemplateRenderResults> {
    const pattern = this.getPattern(patternId);
    if (!pattern) {
      const message = `Pattern not found: '${patternId}'`;
      return {
        ok: false,
        html: `<p>${message}</p>`,
        message,
      };
    }

    const template = pattern.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(
        `Could not find template ${templateId} in pattern ${patternId}`,
      );
    }

    const renderer = this.templateRenderers[template.templateLanguageId];

    // const demoData = null;
    // @todo restore
    // const demoData = demoDataId ? template.demosById[demoDataId] : null;

    const renderedTemplate = await renderer.render({
      pattern,
      template,
      // data: demoData || data || {},
      // data,
      demo,
      patternManifest: this,
    });

    if (!renderedTemplate.ok) return renderedTemplate;

    if (wrapHtml) {
      const assetSet = assetSetId
        ? this.assetSets.getAssetSet(assetSetId)
        : this.assetSets.getGlobalAssetSets()[0];

      const {
        assets,
        inlineJs = '',
        inlineCss = '',
        inlineFoot = '',
        inlineHead = '',
      } = assetSet;

      const inlineJSs = [inlineJs];

      if (isInIframe) {
        inlineJSs.push(`
/**
  * Prevents the natural click behavior of any links within the iframe.
  * Otherwise the iframe reloads with the current page or follows the url provided.
  */
const links = Array.prototype.slice.call(document.querySelectorAll('a'));
links.forEach(function(link) {
  link.addEventListener('click', function(e){e.preventDefault();});
});
        `);
      }

      if (!isInIframe && websocketsPort) {
        inlineJSs.push(`
if ('WebSocket' in window && location.hostname === 'localhost') {
  var socket = new window.WebSocket('ws://localhost:8000');
  socket.addEventListener('message', function() {
    window.location.reload();
  });
}
          `);
      }
      const wrappedHtml = renderer.wrapHtml({
        html: renderedTemplate.html,
        headJsUrls: [
          isInIframe
            ? `https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/${iframeResizerVersion}/iframeResizer.contentWindow.min.js`
            : '',
        ].filter(x => x),
        cssUrls: assets
          .filter(asset => asset.type === 'css')
          // .map(asset => asset.publicPath),
          .map(asset => this.assetSets.getAssetPublicPath(asset.src)),
        jsUrls: assets
          .filter(asset => asset.type === 'js')
          // .map(asset => asset.publicPath),
          .map(asset => this.assetSets.getAssetPublicPath(asset.src)),
        inlineJs: inlineJSs.join('\n'),
        inlineCss,
        inlineHead,
        inlineFoot,
      });
      return {
        ...renderedTemplate,
        html: wrappedHtml,
      };
    }
    return renderedTemplate;
  }
}
