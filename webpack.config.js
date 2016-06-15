var webpack = require('webpack');

var loaders = require('./config/webpack.loaders.js');
var entry = require.resolve('./src/index.js');

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
  plugins: pluginList,
  entry: entry,
  output: {
    path: './dist',
    filename: 'vcs.js',
  },
  isparta: {
    embedSource: true,
    noAutoWrap: true,
    babel: {
      presets: ['es2015'],
    },
  },
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
      { test: entry, loader: 'expose?vcs' },
    ].concat(loaders),
  },
  eslint: {
    configFile: 'src/.eslintrc.js',
  },
};

