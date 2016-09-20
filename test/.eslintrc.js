module.exports = {
  env: {
    mocha: true,
    phantomjs: true,
  },
  plugins: [
    "chai-expect",
  ],
  settings: {
    'import/resolver': 'webpack',
  },
  rules: {
    'no-unused-expressions': 0,
    'arrow-body-style': 0,
  },
  globals: {
    sinon: true,
    document: true,
  },
};
