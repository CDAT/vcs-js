module.exports = [
  {
    test: /\.svg$/,
    loader: 'svg-sprite',
    exclude: /fonts/,
  }, {
    test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    loader: 'url-loader?limit=60000&mimetype=application/font-woff',
  }, {
    test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    loader: 'url-loader?limit=60000',
    include: /fonts/,
  }, {
    test: /\.(png|jpg)$/,
    loader: 'url-loader?limit=8192',
  }, {
    test: /\.css$/,
    loader: 'style!css!postcss',
  }, {
    test: /\.c$/i,
    loader: 'shader',
  }, {
    test: /\.glsl$/i,
    loader: 'shader',
  }, {
    test: /\.json$/,
    loader: 'json-loader',
  }, {
    test: /\.html$/,
    loader: 'html-loader',
  }, {
    test: /\.js$/,
    exclude: /node_modules/,
    loader: 'babel?presets[]=es2015',
  },
];
