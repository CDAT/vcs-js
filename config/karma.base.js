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
    { pattern: 'test/**/*.js', included: false, served: false, watched: true },
  ],
  browsers: [
    'PhantomJS',
  ],
  reporters: [
    'spec',
    'coverage',
  ],
  frameworks: [
    'mocha', 'sinon', 'chai',
  ],
  webpack: {
    cache: true,
    devtool: 'inline-source-map',
    resolve: webpackResolve,
    module: {
      loaders: webpackLoaders,
    },
  },
  preprocessors: {
    './test/entry.js': ['webpack'],
    './src/**/*.js': ['webpack'],
  },
  coverageReporter: {
    reporters: [
      { type: 'html', dir: 'dist/coverage/', subdir: browser },
      { type: 'lcovonly', dir: 'dist/lcov/', subdir: browser },
    ],
  },
};
