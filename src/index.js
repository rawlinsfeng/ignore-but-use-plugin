/**
 * 功能：对指定的文件不进行编译及打包，但使用其中定义的某些变量
 * 1. 对指定的文件进行ast处理，拿到export的变量名及其值
 * 2. 对指定的文件不发起编译请求
 * 3. 处理import，两种方案
 * 3.1. 优化依赖时删除依赖
 * 3.2. 对依赖于指定文件的文件（issuer）进行ast处理，删除引入指定文件的import
 * 4. 对1中的变量名进行替换，两种方案
 * 4.1 优化依赖时更改ast进行替换
 * 4.2 编译完成后对1中的变量名进行替换，直接替换为其值
 * 替换方案有缺陷，比如全局替换不能完全匹配，变量值内容特别多的情况容易出错等等。
 * +++补充方案1：
 * 使用自定义Loader改变文件内容，在用到依赖变量的文件的最上方对该变量进行（伪）声明，
 * 由于该文件已经import该变量，所以直接声明的话会报错重复声明，所以在生成的assets中再给它加上let。
 * +++补充方案2：
 * 补充方案1在development环境编译和打包都能按预期产出结果，但是在production环境会报错，production环境会将代码进行混淆。
 * 所以，将变量的处理都放在loader里，在最上面对变量进行var声明并将import该变量的语句删掉,
 * 这样就不需要自定义webpack插件了，因为webpack运行过程中在beforeResolve时候就会执行loader，而该自定义loader已经将依赖文件的import删掉了。
 */

const path = require('path');
const getexportVariables = require('./utils/astFile').getexportVariables;
const replaceVariable = require('./utils/astFile').replaceVariable;
const variableNames = require('./utils/astFile').variableNames;

const issuerFiles = [];

class IgnoreButUsePlugin {
  static defaultOptions = {
    ignoreButUseFile: '',
  }
  constructor(options = {}) {
    this.options = {...IgnoreButUsePlugin.defaultOptions, ...options};
  }
  apply(compiler) {
    const pluginName = IgnoreButUsePlugin.name;
    const { webpack } = compiler;
    const { Compilation } = webpack;
    const { RawSource } = webpack.sources;

    compiler.hooks.normalModuleFactory.tap(pluginName, (normalModuleFactory) => {
      normalModuleFactory.hooks.beforeResolve.tapPromise(pluginName, (resolveData) => {
        let requestFile = resolveData.request.includes('/') ? resolveData.request.split('/').slice(-1)[0] : resolveData.request;

        return new Promise((resolve, reject) => {
          // 收集指定文件的issuers，并忽略指定文件的解析请求
          if (this.options.ignoreButUseFile.includes(requestFile)) {
            issuerFiles.push(resolveData.contextInfo.issuer);
            resolve(false);
          } else resolve(undefined);
        })
      })
    })

    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      compilation.hooks.optimizeDependencies.tap(pluginName, modules => {
        modules.forEach(module => {
          // 删除对指定文件的依赖
          const newDependencies = module.dependencies.filter(dependency => {
            if (dependency.request) {
              let requestFile = dependency.request.includes('/') ? dependency.request.split('/').pop() : dependency.request;
              return !this.options.ignoreButUseFile.includes(requestFile);
            }
            return true;
          });
          module.dependencies = newDependencies;
        });
      })

      /*
      // 用module的source对应的ast替换，module的source能正确替换成功，但是生成的asset总是报错，还没搞清楚原因
      compilation.hooks.optimizeModules.tap(pluginName, modules => {
        // mock
        issuerFiles.push('/test/tool.test.js')
        this.options.ignoreButUseFile = '/test/util.test.js'
        // mock
        
        modules.forEach(module => {
          if (issuerFiles.includes(module.request)) {
            let rawSrc = new RawSource(replaceVariable(module._source._value, this.options.ignoreButUseFile));
            module._source = rawSrc;
          }
        })
      })
      */

      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE, // 用某个靠后的资源处理阶段，确保所有资源已被插件添加到 compilation
        },
        (assets) => {
          const exportVariableList = getexportVariables(this.options.ignoreButUseFile);

          Object.keys(assets).forEach(assetKey => {
            let sourceContent = assets[assetKey].source();
            variableNames.forEach(variableName => {
              if (sourceContent.includes(variableName.localName)) {
                // let exportVariableVal = exportVariableList.find(item => item.name == variableName.importedName);
                sourceContent = sourceContent.replace(new RegExp(variableName.localName, 'i'), `let ${variableName.localName}`);
              }
            })
            assets[assetKey] = new RawSource(sourceContent);
          })
        }
      );
    })

    /*
    // 注意：No more changes should happen to Compilation.assets after sealing the Compilation.
    compiler.hooks.emit.tapAsync(pluginName, (compilation,callback) => {
      const exportVariableList = getexportVariables(this.options.ignoreButUseFile);
      let assets = compilation.assets;
      
      Object.keys(assets).forEach(assetKey => {
        let sourceContent = assets[assetKey].source();
        exportVariableList.forEach(exportVariable => {
          if (sourceContent.includes(exportVariable.name)) {
            sourceContent = sourceContent.replace(new RegExp(exportVariable.name, 'g'), exportVariable.value);
          }
        })
        assets[assetKey] = new RawSource(sourceContent);
      })
      callback();
    })
    */
  }
}

const loaderPath = function() {
  return path.resolve(__dirname, 'handleFileLoader.js');
}

module.exports = {
  IgnoreButUsePlugin,
  loaderPath,
};