import { KnapsackRendererBase } from '@basalt/knapsack';
import { KnapsackTemplateRenderer } from '@basalt/knapsack/src/schemas/knapsack-config';
import fs from 'fs-extra';

/* eslint-disable class-methods-use-this */

export default class KnapsackHtmlRenderer extends KnapsackRendererBase
  implements KnapsackTemplateRenderer {
  constructor() {
    super({
      id: 'html',
      extension: '.html',
    });
  }

  async render({ template }) {
    try {
      return {
        ok: true,
        html: await fs.readFile(template.absolutePath, 'utf8'),
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
  }

  async getUsage({ template }) {
    return fs.readFile(template.absolutePath, 'utf8');
  }
}