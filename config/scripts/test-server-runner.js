#! /usr/bin/env node

/* eslint-disable */
const program = require('commander');
const path = require('path');
const shell = require('shelljs');

const rootPath = path.resolve(path.join(__dirname, '../..'));
const testServer = path.join(rootPath, 'scripts', 'vcs-test-server.py');
const testConfigPath = path.join(__dirname, 'config.json');
const testConfig = require(testConfigPath);

program
  .option('-e, --env [environment path]', 'Absolute path to conda environment directory to use')
  .option('-d, --display [display number]', 'Pass this option to set DISPLAY environment variable')
  .parse(process.argv);

let envPath = program.env;
const setDisplay = program.display;
const port = testConfig.vtkwebListenPort;

const condaPrefix = shell.env['CONDA_PREFIX'];
if (condaPrefix) {
  if (envPath) {
    console.log('Found CONDA_PREFIX environment variable (' + condaPrefix +
      '), overriding command line option');
  }
  envPath = condaPrefix;
}

if (!envPath) {
  console.error('Please provide path to uvcdat conda environment.  You may ' +
    'either set CONDA_PREFIX environment variable, or else pass the "-e ' +
    '[environment path]" argument to this script');
  process.exit(1);
}

const envBin = path.join(envPath, 'bin');
const vtkPythonExe = path.join(envBin, 'vtkpython');

if (!shell.test('-f', vtkPythonExe)) {
  console.error('Unable to find vtkpython executable, exiting');
  process.exit(1);
}

const environment = {
  PATH: envBin + ':' + shell.env['PATH'],
  PYTHONPATH: rootPath,
};

if (setDisplay) {
  environment.DISPLAY = setDisplay;
}

// Now build the launcher command line to be run
const serverCmdLine = [
  vtkPythonExe,
  testServer,
  '--host',
  '0.0.0.0',
  '--port',
  port
];

function finishedCallback(code, stdout, stderr) {
  console.log('Exit code:', code);
  console.log('Program output:', stdout);
  console.log('Program stderr:', stderr);
}

// Show a summary of what we have gathered and will run
console.log('\n===============================================================================');
console.log('|');
console.log('| Using: ');
console.log('|   environment path: ' + envPath);
console.log('|   listen port: ' + port);
console.log('|');
console.log('| Client/Server communication port can be changed by editing: "' + testConfigPath + '"');
console.log('|');
console.log('| Environment: {');

Object.keys(environment).forEach((envKey) => {
  console.log('|   ' + envKey + ' -> ' + environment[envKey]);
});

console.log('| }');
console.log('|');
console.log('| Running command line:');
console.log('| $', serverCmdLine.join('\n|\t'));
console.log('===============================================================================\n');

// Run the launcher asynchronously
shell.exec(serverCmdLine.join(' '), {
  async:true,
  env: environment,
}, finishedCallback);
