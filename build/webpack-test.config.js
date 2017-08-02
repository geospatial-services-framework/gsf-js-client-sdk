const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const rootDir = path.resolve(__dirname, 'src');

module.exports = {
  context: rootDir,
  target: 'node',
  externals: [nodeExternals()],
  resolve: {
    extensions: ['.js', 'json'],
    modules: [
      rootDir,
      'node_modules'
    ]
  },
  module: {
    rules: [
      {
        test: /(\.js)$/,
        use: ['babel-loader'],
        exclude: /(node_modules|bower_components)/
      }
    ]
  },
  plugins: [
    // https://github.com/visionmedia/superagent/wiki/SuperAgent-for-Webpack
    new webpack.DefinePlugin({'global.GENTLY': false }),
    // NODE global constant
    new webpack.DefinePlugin({
      NODE: true
    })
  ]
};
