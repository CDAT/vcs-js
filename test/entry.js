import Promise from 'bluebird';

var context;
var srcContext;

Promise.onPossiblyUnhandledRejection((e) => {
  throw e;
});

context = require.context('./cases', true, /.*\.js$/);
context.keys().forEach(context);

srcContext = require.context('../src', true, /.*\.js$/);
srcContext.keys().forEach(srcContext);
