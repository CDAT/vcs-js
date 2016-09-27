var webpack = require('webpack');

var loaders = require('./config/webpack.loaders');
var resolve = require('./config/webpack.resolve');

var entry = require.resolve('./src/index');

var pluginList = [];

if (process.env.NODE_ENV === 'production') {
  console.log('==> Production build');
  pluginList.push(new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production'),
    },
  }));
}

module.exports = {
  cache: true,
  devtool: 'source-map',
  plugins: pluginList,
  entry: entry,
  output: {
    path: './dist',
    filename: 'vcs.js',
    library: 'vcs',
    libraryTarget: 'umd',
    publicPath: '/dist/',
  },
  isparta: {
    embedSource: true,
    noAutoWrap: true,
    babel: {
      presets: ['es2015-nostrict'],
    },
  },
  resolve: resolve,
  module: {
    preLoaders: [{
      test: /\.js$/,
      loader: 'eslint-loader',
      exclude: /node_modules/,
    }, {
      test: /.js$/,
      include: /src\/*\.js/,
      loader: 'isparta',
    }],
    loaders: [
      { test: require.resolve('jquery'), loader: 'expose?$!expose?jQuery' },
    ].concat(loaders),
  },
  eslint: {
    configFile: 'src/.eslintrc.js',
  },
};

