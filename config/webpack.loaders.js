const autoprefixer = require('autoprefixer');

module.exports = [
  {
    test: /\.svg$/,
    loader: 'svg-sprite-loader',
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
    loader: 'url-loader?limit=1048576',
  }, {
    test: /\.css$/,
    use: [
      { loader: 'style-loader' },
      { loader: 'css-loader' },
      {
        loader: 'postcss-loader',
        options: {
          plugins: () => [autoprefixer('last 2 version', 'ie >= 10')],
        },
      },
    ],
  }, {
    test: /\.c$/i,
    loader: 'shader-loader',
  }, {
    test: /\.glsl$/i,
    loader: 'shader-loader',
  }, {
    test: /\.json$/,
    loader: 'json-loader',
  }, {
    test: /\.html$/,
    loader: 'html-loader',
  }, {
    test: /\.js$/,
    include: [
      /src/,
      /node_modules\/paraviewweb/,
    ],
    use: [
      { loader: 'babel-loader', options: { presets: ['env'] } },
    ],
  },
];
