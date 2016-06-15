var context = require.context('.', true, /((?!^entry\.js$).)*\.js$/);
context.keys().forEach(context);
module.exports = context;
