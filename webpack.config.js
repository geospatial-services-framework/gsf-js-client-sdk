const webpack = require('webpack');
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
const path = require('path');
const env = require('yargs').argv.env;
const libraryName = 'GSF';

let plugins = [], outputFile;

// Dev command line flag build non-minified bundle.
if (env === 'dev') {
  outputFile = libraryName + '.js';
} else {
  var uglifyOptions = {
    minimize: true,
    sourceMap: true,
    compress: {
      warnings: true
    }
  };
  plugins.push(new UglifyJsPlugin(uglifyOptions));
  outputFile = libraryName + '.min.js';
}

module.exports = {
  entry: [path.resolve(__dirname, 'src', 'GSF.js')],
  devtool: 'source-map',
  output: {
    path: __dirname + '/dist',
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true // AMD module name
  },
  module: {
    rules: [
      {
        test: /(\.js)$/,
        use: ['babel-loader'],
        exclude: /(node_modules|bower_components)/
      },
      {
        test: /(\.js)$/,
        use: ['eslint-loader'],
        enforce: 'pre',
        exclude: /(node_modules|bower_components)/
      }
    ]
  },
  resolve: {
    extensions: ['.js', 'json'],
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules'
    ]
  },
  plugins: plugins
};
