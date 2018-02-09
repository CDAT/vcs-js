var path = require('path');

var webpackLoaders = require('./config/webpack.loaders.js');
var webpackResolve = require('./config/webpack.resolve.js');
var webpackLinter = require('./config/webpack.linter.js');

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'test';

module.exports = function karmaConfig(config) {
  config.set({
    basePath: '.',
    autoWatch: false,
    logLevel: config.LOG_INFO,
    files: [
      'test/entry.js',
      {
        pattern: 'test/**/*.js',
        included: false,
        served: false,
        watched: true,
      },
    ],
    browsers: ['Chrome'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox'],
      },
    },
    reporters: [
      'spec',
      'coverage-istanbul',
    ],
    frameworks: [
      'mocha', 'sinon', 'chai-as-promised', 'chai',
    ],
    webpack: {
      devtool: 'inline-source-map',
      resolve: webpackResolve,
      module: {
        rules: [
          {
            test: /\.js$/,
            include: [/test/],
            use: [{ loader: 'babel-loader', options: { presets: ['env'] } }],
          },
        ].concat(webpackLoaders, webpackLinter),
      },
    },
    preprocessors: {
      'test/entry.js': ['webpack'],
    },
    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly', 'text-summary'],
      dir: 'dist/coverage/%browser%',
      combineBrowserReports: false,
      fixWebpackSourcePaths: true,
      skipFilesWithNoCoverage: true,
      'report-config': {
        html: {
          subdir: 'html',
        },
        lcovonly: {
          subdir: 'lcov',
        },
      },
      // enforce percentage thresholds
      // anything under these percentages will cause karma to fail with an exit code of 1 if not running in watch mode
      // thresholds: {
      //   emitWarning: false, // set to `true` to not fail the test command when thresholds are not met
      //   global: { // thresholds for all files
      //     statements: 100,
      //     lines: 100,
      //     branches: 100,
      //     functions: 100,
      //   },
      //   each: { // thresholds per file
      //     statements: 100,
      //     lines: 100,
      //     branches: 100,
      //     functions: 100,
      //     // overrides: {
      //     //   'baz/component/**/*.js': {
      //     //     statements: 98
      //     //   }
      //     // }
      //   },
      // },
    },
    // proxies: {
    //   '/coverage/': '/base/dist/coverage/%browser%/',
    // },
  });
};
