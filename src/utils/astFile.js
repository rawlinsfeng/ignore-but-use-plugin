const babel = require('@babel/core');
const generate = require('@babel/generator').default;
const template = require('@babel/template').default;
const traverse = require('@babel/traverse').default;
const types = require('@babel/types');
const path = require('path');

const variableNames = [];

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

/**
 * 处理import有as的情况，即import的变量重命名
 * @param {*} source 转换前的源代码
 * @param {*} option loader的option值，即需要忽略的文件路径
 */
 function handleImportProperty(source, option) {
  let codeAst = babel.parseSync(source);
  let realImportVariable = ''
  traverse(codeAst, {
    ImportDeclaration(path) {
      let tempValue = path.node.source.value;
      let fileName = tempValue.split('/').pop();
      if (option.includes(fileName)) {
        realImportVariable = path.node.specifiers[0].local.name;
        variableNames.push({ // path.node.specifiers.imported.name为重命名前的变量name
          importedName: path.node.specifiers[0].imported ? path.node.specifiers[0].imported.name : '',
          localName: realImportVariable,
        });
      }
    }
  });
  return realImportVariable;
}

module.exports = {
  getexportVariables,
  replaceVariable,
  handleImportProperty,
  variableNames,
};