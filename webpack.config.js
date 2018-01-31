const path = require('path');
const webpack = require('webpack');
const ndarray = require.resolve('ndarray');

const loaders = require('./config/webpack.loaders');
const resolve = require('./config/webpack.resolve');
const linter = require('./config/webpack.linter.js')

const entry = path.join(__dirname, './src/index');
const outputPath = path.join(__dirname, './vcs_server/js');

module.exports = {
  cache: true,
  devtool: 'source-map',
  entry: entry,
  output: {
    path: outputPath,
    filename: 'vcs.js',
    library: 'vcs',
    libraryTarget: 'var',
    publicPath: '/dist/',
  },
  resolve: resolve,
  module: {
    rules: [
      {
        test: ndarray,
        loader: 'expose-loader?ndarray',
      },
    ].concat(linter, loaders),
  },
};
