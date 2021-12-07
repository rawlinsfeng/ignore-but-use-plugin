const getexportVariables = require('./utils/astFile').getexportVariables;

module.exports = function (source) {
  const exportVariableList = getexportVariables(this.query.ignoreButUseFile);
  return `
    ${exportVariableList[0].name} = ${exportVariableList[0].value}
    ${source}
  `
}