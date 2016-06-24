window.Promise = require('../src/promise');

var context = require.context('./cases', true, /.*\.js$/);
context.keys().forEach(context);

var srcContext = require.context('../src', true, /.*\.js$/);
srcContext.keys().forEach(srcContext);
