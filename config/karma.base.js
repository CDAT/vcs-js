var path = require('path');
var isparta = require('isparta');
var webpackLoaders = require('./webpack.loaders');
var webpackResolve = require('./webpack.resolve');

/**
 *  Return URL friendly browser string
 */
function browser(b) {
  return b.toLowerCase().split(/[ /-]/)[0];
}

module.exports = {
  autoWatch: false,
  files: [
    './test/entry.js',
    './node_modules/phantomjs-polyfill-object-assign/object-assign-polyfill.js',
    { pattern: 'test/**/*.js', included: false, served: false, watched: true },
    { pattern: 'dist/coverage/phantomjs/**/*', included: false },
  ],
  browsers: [
    'PhantomJS',
  ],
  reporters: [
    'spec',
    'coverage',
  ],
  frameworks: [
    'mocha', 'sinon', 'chai-as-promised', 'chai',
  ],
  webpack: {
    cache: true,
    devtool: 'inline-source-map',
    resolve: webpackResolve,
    bable: {
      presets: ['es2015'],
    },
    isparta: {
      embedSource: true,
      babel: {
        presets: ['es2015'],
      },
    },
    module: {
      loaders: webpackLoaders,
      preLoaders: [
        {
          test: /\.js$/,
          exclude: [
            path.resolve('./src/'),
            path.resolve('./node_modules/'),
          ],
          loader: 'babel?presets[]=es2015',
        },
        {
          test: /\.js$/,
          include: path.resolve('src/'),
          loader: 'isparta',
        },
      ],
    },
  },
  preprocessors: {
    './test/entry.js': ['webpack', 'sourcemap'],
  },
  coverageReporter: {
    instrumenters: {
      isparta: isparta,
    },
    instrumenter: {
      'src/**/*.js': 'isparta',
    },
    reporters: [
      { type: 'text-summary' },
      { type: 'html', dir: 'dist/coverage/', subdir: browser },
      { type: 'lcovonly', dir: 'dist/lcov/', subdir: browser },
    ],
    check: {
      global: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
    includeAllSources: true,
  },
  proxies: {
    '/coverage/': '/base/dist/coverage/phantomjs/',
  },
};
