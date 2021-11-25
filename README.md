## ignore-but-use-plugin
> 一个webpack插件，用于在编译和打包时需要忽略指定文件，但仍需用到忽略的文件中的某些变量。

### 配置项
- ignoreButUseFile
> type: string；value: 指定文件的相对路径

### 使用示例
```js
plugins: [
  new IgnoreWebpackPlugin({
    ignoreButUseFile: './test/util.test.js',
  }),
]
```