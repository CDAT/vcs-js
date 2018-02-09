#! /usr/bin/env node

/* eslint-disable */
const waitOn = require('wait-on');
const path = require('path');

const rootPath = path.resolve(path.join(__dirname, '../..'));
const testConfigPath = path.join(__dirname, 'config.json');
const testConfig = require(testConfigPath);

const host = testConfig.vtkwebListenHost;
const port = testConfig.vtkwebListenPort;
const resource = 'tcp:' + host + ':' + port;

var opts = {
  resources: [
    resource,
  ],
  // For more options, see:
  //    https://github.com/jeffbski/wait-on#nodejs-api-usage
};

console.log('waitOn is waiting for resource: "' + resource + '"');

waitOn(opts, function (err) {
  if (err) {
    console.log('waitOn encountered an error: ', err);
    process.exit(1);
  }

  console.log('waitOn finished waiting for ' + resource);
  process.exit(0);
});