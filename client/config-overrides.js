const { addWebpackAlias, override } = require('customize-cra');
const path = require('path');

module.exports = override(
  addWebpackAlias({
    '@mindx': path.resolve(__dirname, 'src')
  })
);