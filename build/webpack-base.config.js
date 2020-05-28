const webpack = require('webpack');
const path = require('path');

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
      umdNamedDefine: true // AMD module name
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
      minimize: true
    },
    plugins: [
      // https://github.com/visionmedia/superagent/wiki/SuperAgent-for-Webpack // todo
      new webpack.DefinePlugin({'global.GENTLY': false }),
      // NODE global constant
      new webpack.DefinePlugin({
        NODE: JSON.stringify(target === 'node')
      }),
      // UglifyJS
      // new webpack.optimize.UglifyJsPlugin({
      //   minimize: true,
      //   sourceMap: true,
      //   include: /\.min\.js$/
      // })
    ]
  };
  
};
