## ignore-but-use-plugin
> 自定义webpack插件(内含自定义loader)，用于在编译和打包时需要忽略指定文件，但仍需用到忽略的文件中的某些变量。

### install
> npm install -D ignore-but-use-plugin

### 配置项
- ignoreButUseFile
> type: string  |  value: 指定文件的相对路径  |  支持范围：js和ts文件，支持import重命名的情况

### 使用示例
```js
// webpack.config.js
const { IgnoreButUsePlugin, loaderPath } = require('ignore-but-use-plugin');

module: {
  rules: [
    {
      test: /main\.js/, // 使用到忽略文件的文件，多个文件可以只匹配后缀并结合include使用
      /* test可以配合include使用
      test: /basic\_routes\.ts/,
      include: [
        path.resolve(__dirname, 'src/tests')
      ],
      */
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
  // IgnoreButUsePlugin可用可不用
  // new IgnoreButUsePlugin({
  //   ignoreButUseFile: './test/util.test.js',
  // }),
]
```