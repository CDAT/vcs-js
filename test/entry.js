var context;
var srcContext;

context = require.context('./cases', true, /.*\.js$/);
context.keys().forEach(context);

srcContext = require.context('../src', true, /.*\.js$/);
srcContext.keys().forEach(srcContext);
