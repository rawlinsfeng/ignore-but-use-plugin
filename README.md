## ignore-but-use-plugin
> 自定义webpack插件(内含自定义loader)，用于在编译和打包时需要忽略指定文件，但仍需用到忽略的文件中的某些变量。

### 配置项
- ignoreButUseFile
> type: string；value: 指定文件的相对路径

### 使用示例
```js
// webpack.config.js
const { IgnoreButUsePlugin, loaderPath } = require('ignore-but-use-plugin');

module: {
  rules: [
    {
      test: /main\.js/,
      use: [
        {
          loader: loaderPath(),
          options: {
            ignoreButUseFile: './test/util.test.js',
          }
        }
      ]
    }
  ]
}
plugins: [
  new IgnoreButUsePlugin({
    ignoreButUseFile: './test/util.test.js',
  }),
]
```