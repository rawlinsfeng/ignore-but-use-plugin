const babel = require('@babel/core');
const generate = require('@babel/generator').default;
const template = require('@babel/template').default;
const traverse = require('@babel/traverse').default;
const types = require('@babel/types');
const path = require('path');

function getFileAstBody(filePath) {
  let transformFileResult = babel.transformFileSync(filePath,{
    presets: ["@babel/preset-typescript"],
  });
  let fileAst = babel.parseSync(transformFileResult.code);
  return fileAst.program.body;
}

function getexportVariables(optionFile, exportVariableList = []) {
  let fileAstBody = getFileAstBody(path.resolve(process.cwd(), '..', '..', '..', optionFile));
  // TODO: 用traverse优化
  for (let index = 0; index < fileAstBody.length; index++) {
    if (fileAstBody[index].type === 'ExportNamedDeclaration') {
      let declarations = fileAstBody[index].declaration.declarations;
      declarations.forEach(item => {
        exportVariableList.push({
          name: item.id.name,
          value: generate(item.init, {compact:true}, generate(item.init).code).code
        });
      });
    }
  }
  return exportVariableList;
}

function replaceVariable(sourceValueCode,optionFile) {
  let codeAst = babel.parseSync(sourceValueCode)
  const exportVariableList = getexportVariables(optionFile);
  traverse(codeAst, {
    Identifier(path) {
      if (path.parent.type != 'ImportSpecifier') {
        exportVariableList.forEach(exportVariable => {
          if (exportVariable.name == path.node.name) {
            path.node.name = exportVariable.value;
          }
        })
      }
    }
  })
  return generate(codeAst).code; // generate(codeAst, {compact:true}, generate(codeAst).code).code;
}

module.exports = {
  getexportVariables,
  replaceVariable,
};