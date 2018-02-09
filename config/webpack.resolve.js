const path = require('path');

const srcPath = path.join(__dirname, '../src');

module.exports = {
  modules: [
    path.resolve(__dirname, '../node_modules'),
    srcPath,
  ],
  alias: {
    vcs: path.resolve('./src'),
    plotly: path.resolve('./node_modules/plotly.js/dist/plotly'),
    ParaViewWeb: path.resolve('./node_modules/paraviewweb/src'),
  },
};
