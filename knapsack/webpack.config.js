const { join } = require('path');
const { createWebPackConfig } = require('@knapsack/build-tools');
const WebappWebpackPlugin = require('webapp-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

const config = createWebPackConfig({
  mainEntries: [join(__dirname, './src/client/')],
  extraSrcDirs: [join(__dirname, './src')],
  dist: join(__dirname, './dist/client'),
  useHtmlWebpackPlugin: true,
  outputStats: false,
  extraPlugins: [
    // https://github.com/jaketrent/html-webpack-template
    // template: https://github.com/jaketrent/html-webpack-template/blob/master/index.ejs
    new HtmlWebpackPlugin({
      // template: HtmlTemplate,
      inject: true,
      // title: config.settings.site.title,
      title: 'Knapsack',
      appMountId: 'app',
      cache: false,
      mobile: true,
      hash: true,
      filename: 'index.html',
    }),
    new ScriptExtHtmlWebpackPlugin({
      module: ['chunk', 'bundle'],
    }),
    new CopyPlugin([
      {
        from: require.resolve('react/umd/react.development.js'),
      },
      {
        from: require.resolve('react/umd/react.production.min.js'),
      },
      {
        from: require.resolve('react-dom/umd/react-dom.development.js'),
      },
      {
        from: require.resolve('react-dom/umd/react-dom.production.min.js'),
      },
    ]),
    new HtmlWebpackTagsPlugin({
      tags: [
        'ks-design-system/ks-design-system.css',
        isProd ? 'react.production.min.js' : 'react.development.js',
        isProd ? 'react-dom.production.min.js' : 'react-dom.development.js',
      ],
      append: false,
    }),
    new WebappWebpackPlugin(
      require.resolve('@knapsack/design-system/src/assets/favicon.png'),
    ),
  ],
});

module.exports = {
  ...config,
  externals: {
    ...config.externals,
    react: 'React',
  },
};
