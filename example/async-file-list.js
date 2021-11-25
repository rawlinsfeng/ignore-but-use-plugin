function AsyncFileListPlugin(options) {
  this.options = options || {};
  this.filename = this.options.filename || 'fileList.md'
}

AsyncFileListPlugin.prototype.apply = function (compiler) {
  compiler.hooks.emit.tapPromise(AsyncFileListPlugin.name, (compilation) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 1000)
    }).then(() => {
      const fileListName = this.filename;
      let len = Object.keys(compilation.assets).length;
      let content = `# 一共有${len}个文件\n\n`;
      for (const filename in compilation.assets) {
        content += `- ${filename}\n`;
      }
      compilation.assets[fileListName] = {
        source: function () {
          return content;
        },
        size: function () {
          return content.length;
        }
      }
    })
  })
}

module.exports = AsyncFileListPlugin;