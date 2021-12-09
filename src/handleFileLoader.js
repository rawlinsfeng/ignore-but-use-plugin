const getexportVariables = require('./utils/astFile').getexportVariables;
const handleSource = require('./utils/astFile').handleSource;

module.exports = function (source) {
  const exportVariableList = getexportVariables(this.query.ignoreButUseFile);
  let newSource = handleSource(source, this.query.ignoreButUseFile, exportVariableList[0].value);
  return newSource;
}