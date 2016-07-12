var path = require('path');

module.exports = {
  alias: {
    vcs: path.resolve('./src'),
    plotly: path.resolve('./node_modules/plotly.js/dist/plotly'),
    ParaViewWeb: path.resolve('./node_modules/paraviewweb/src'),
  },
};
