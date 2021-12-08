const getexportVariables = require('./utils/astFile').getexportVariables;
const handleImportProperty = require('./utils/astFile').handleImportProperty;

module.exports = function (source) {
  const exportVariableList = getexportVariables(this.query.ignoreButUseFile);
  let realVariableName = handleImportProperty(source, this.query.ignoreButUseFile);
  const varName = realVariableName || exportVariableList[0].name;
  return `
    ${varName} = ${exportVariableList[0].value}
    ${source}
  `
}