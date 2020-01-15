const webpack = require('webpack');
const { relative } = require('path');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// const Stylish = require('webpack-stylish');
const Visualizer = require('webpack-visualizer-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const cssnano = require('cssnano');
const DashboardPlugin = require('webpack-dashboard/plugin');
const postcssPresetEnv = require('postcss-preset-env');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { resolve } = require('path');

const isProd = process.env.NODE_ENV === 'production';

/**
 * @private
 * @param {object} opt
 * @param {string[]} [opt.mainEntries=[] - absolute paths to main entry points
 * @param {string} opt.dist - The absolute path to where files will be written.
 * @param {string} opt.webRootDir - path to directory that site is served from
 * @param {string[]} opt.[extraSrcDirs] - extra directories where it is ok to pass through Babel
 * @param {number} opt.[maxAssetSize=610000] - maximum asset size in bytes; if files are larger it will fail on prod builds
 * @param {boolean} opt.[injectCssChanges=true] - if `false`, always generate a CSS file
 * @param {webpack.Plugin[]} [opt.extraPlugins=[]] - Extra WebPack plugins to include
 * @param {string} opt.tsConfigFile Path to `tsconfig.json` for TypeScript config
 * @param {boolean} opt.outputStats - if a `stats.html` file should get outputted so you can see why your WebPack bundle is too big
 * @param {string} [opt.outputFilename='[name].bundle.[hash].js'] - format of file name that is outputted
 * @return {object} - WebPack config
 */
function createWebPackConfig({
  mainEntries = [],
  dist,
  webRootDir = '',
  injectCssChanges = true,
  extraSrcDirs = [],
  maxAssetSize = 610000,
  extraPlugins = [],
  tsConfigFile = '',
  outputStats = false,
  outputFilename = '[name].bundle.[hash].js',
}) {
  // The public URL of the output directory when referenced in a browser. The value of the option is prefixed to every URL created by the runtime or loaders. Because of this the value of this option ends with `/` in most cases.
  // Simple rule: The URL of your output.path from the view of the HTML page.
  const publicPath = webRootDir ? `/${relative(webRootDir, dist)}/` : '/';

  /** @type {webpack.Configuration} */
  const webpackConfig = {
    entry: {
      main: mainEntries,
    },
    output: {
      filename: outputFilename,
      path: dist,
      publicPath,
      chunkFilename: '[name].chunk.[hash].js',
    },
    module: {
      rules: [
        {
          // https://github.com/graphql/graphiql/issues/617
          test: /\.flow$/,
          loader: require.resolve('ignore-loader'),
        },
        {
          test: /\.(js|jsx|mjs|ts|tsx)$/,
          include: [
            // resolve(process.cwd()),
            ...extraSrcDirs,
          ],
          exclude: [/(node_modules)/],
          use: [
            {
              loader: require.resolve('babel-loader'),
              options: {
                extends: require.resolve('@knapsack/babel-config/es'),
                cacheDirectory: true,
              },
            },
            tsConfigFile
              ? {
                  loader: require.resolve('react-docgen-typescript-loader'),
                  options: {
                    tsconfigPath: tsConfigFile,
                  },
                }
              : null,
          ].filter(Boolean),
        },
        {
          test: [/\.jpeg?$/, /\.jpg?$/, /\.svg?$/, /\.png?$/],
          loader: require.resolve('url-loader'),
        },
        {
          test: [/\.css?$/],
          use: [
            {
              loader: require.resolve('style-loader'),
            },
            {
              loader: require.resolve('css-loader'),
            },
          ],
        },
        {
          test: /\.scss?$/,
          exclude: /\.css?$/,
          use: [
            {
              // @todo refactor for readability
              /* eslint-disable no-nested-ternary */
              loader: injectCssChanges
                ? isProd
                  ? MiniCssExtractPlugin.loader
                  : 'style-loader'
                : MiniCssExtractPlugin.loader,
              /* eslint-enable no-nested-ternary */
            },
            {
              loader: 'css-loader',
              options: {
                importLoaders: 2,
                sourceMap: true,
                // import: false,
                // url: false,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: () => [
                  postcssPresetEnv({
                    browsers: ['last 2 versions'],
                  }),
                ],
              },
            },
            {
              loader: 'resolve-url-loader',
              options: {
                debug: false,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  sourceMap: true,
                  // includePaths: [],
                  // scss data that will be available to ALL files
                  // data: '',
                  outputStyle: isProd ? 'compressed' : 'expanded',
                  // Enables the line number and file where a selector is defined to be emitted into the compiled CSS as a comment. Useful for debugging, especially when using imports and mixins.
                  sourceComments: false,
                },
              },
            },
          ],
        },
        {
          test: /\.(woff(2)?|ttf|eot)?$/,
          use: [
            {
              loader: require.resolve('file-loader'),
              options: {
                name: '[name].[ext]',
                outputPath: 'fonts/',
              },
            },
          ],
        },
      ],
    },
    devtool: isProd ? 'source-map' : 'eval-source-map',
    resolve: {
      // symlinks: false, // @todo consider, but be careful
      extensions: ['.mjs', '.js', '.tsx', '.ts', '.jsx', '.css', '.json'],
      mainFields: ['module', 'main'],
      modules: ['node_modules', resolve(__dirname, 'node_modules')],
      alias: {
        react: require.resolve('react'),
      },
    },
    // stats: 'none',
    plugins: [
      // new Stylish(), @todo consider re-enabling later, needed to for debugging
      new webpack.NamedModulesPlugin(),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        },
      }),
      new DashboardPlugin(),
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: '[name].css',
        chunkFilename: '[id].css',
      }),
      new OptimizeCssAssetsPlugin({
        // assetNameRegExp: /\.optimize\.css$/g,
        cssProcessor: cssnano,
        cssProcessorPluginOptions: {
          preset: ['default', { discardComments: { removeAll: true } }],
        },
        canPrint: true,
      }),
    ],
    performance: {
      hints: isProd ? 'error' : false,
      maxAssetSize,
      maxEntrypointSize: maxAssetSize,
      // if this function returns false it is not included in performance calculation
      assetFilter: assetFilename => {
        if (assetFilename.includes('graphiql')) {
          return false;
        }
        if (/\.map$/.test(assetFilename)) {
          return false;
        }
        return true;
      },
    },
    optimization: {
      minimize: isProd,
      namedModules: true,
      namedChunks: true,
      runtimeChunk: 'single',
      // https://itnext.io/react-router-and-webpack-v4-code-splitting-using-splitchunksplugin-f0a48f110312
      // https://webpack.js.org/plugins/split-chunks-plugin/
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 30,
        maxAsyncRequests: 50,
        maxSize: 300000,
      },
    },
    externals: {
      // 'aws-sdk': 'aws-sdk',
    },
    node: {
      fs: 'empty',
    },
    // watchOptions: {
    //   ignored: [/node_modules/, '!**@knapsack/**'],
    // },
  };

  if (isProd) {
    webpackConfig.mode = 'production';
    webpackConfig.optimization = {
      ...webpackConfig.optimization,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          sourceMap: true,
          terserOptions: {
            // ecma: 6,
            // warnings: true,
            module: true,
            keep_classnames: true,
            keep_fnames: true,
          },
        }),
      ],
    };
  } else {
    webpackConfig.mode = 'development';
    webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
  }

  // view at output-dir/stats.html
  if (outputStats) webpackConfig.plugins.push(new Visualizer());

  return {
    ...webpackConfig,
    plugins: [...webpackConfig.plugins, ...extraPlugins],
    // devServer: {
    //   overlay: true,
    //   hot: true,
    //   contentBase: [resolve(config.dist), resolve(config.public)],
    //   historyApiFallback: {
    //     index: '/index.html',
    //   },
    // },
  };
}

module.exports = {
  createWebPackConfig,
};
