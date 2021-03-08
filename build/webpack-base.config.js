const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const LIB_NAME = 'GSF';
const ROOT_DIR = path.resolve(__dirname, '..');
const SOURCE_DIR = path.resolve(ROOT_DIR, 'src');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');

module.exports = function (target, entryPoints, addSuffix, minify) {

  let entries = {};
  let entry = LIB_NAME;

  if (addSuffix) {
    entry += `-${target}`;
  }

  entries[entry] = entryPoints;

  if (minify) {
    entries[`${entry}.min`] = entryPoints;
  }

  return {
    context: SOURCE_DIR,
    target: target,
    entry: entries,
    devtool: 'source-map',
    mode: 'production',
    output: {
      path: DIST_DIR,
      filename: '[name].js',
      library: LIB_NAME,
      libraryTarget: 'umd',
      umdNamedDefine: true, // AMD module name
      libraryExport: 'default'
    },
    module: {
      rules: [
        // Pre-loader: ESLint
        {
          enforce: 'pre',
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'eslint-loader',
        },
        // Loader: Babel
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
      ]
    },
    resolve: {
      extensions: ['.js', 'json'],
      modules: [
        SOURCE_DIR,
        'node_modules'
      ]
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          sourceMap: true,
          extractComments: false
        }),
      ],
    },
    plugins: [
      // https://github.com/visionmedia/superagent/wiki/SuperAgent-for-Webpack
      new webpack.DefinePlugin({'global.GENTLY': false }),
      // NODE global constant
      new webpack.DefinePlugin({
        NODE: JSON.stringify(target === 'node')
      })
    ]
  };
  
};
