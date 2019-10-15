const util = require('util'); // eslint-disable-line
const path = require('path');

module.exports = (baseConfig, env, defaultConfig) => {
  defaultConfig.module.rules = defaultConfig.module.rules.map(rule => {
    if (rule.loader && rule.loader.includes('babel-loader')) {
      // Fixes the inability for babel-loader to process the components that are part of this monorepo
      rule.include.push(path.join(__dirname, '../../../components'));
      rule.include.push(path.join(__dirname, '../../../packages'));
      rule.include.push(path.join(__dirname, '../../../knapsack/src'));
      return rule;
    }

    return rule;
  });

  defaultConfig.resolve.mainFields = ['module', 'main'];
  // console.log(util.inspect(defaultConfig, false, null));
  return defaultConfig;
};
