
const IgnoreButUsePlugin = require('./IgnoreButUsePlugin');
const loaderPath = function() {
  return path.resolve(__dirname, 'node_modules/ignore-but-use-plugin/src/handleFileLoader.js');
};

module.exports = {
  IgnoreButUsePlugin,
  loaderPath,
};