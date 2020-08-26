# 空间测绘前端项目

##环境依赖
node v8.9+

## 安装配置

``` bash
$ cd new_project
# 安装依赖
$ npm install
# 启动项目
$ npm run serve
```
## 产品（发布）

``` bash
# 替换环境变量中打包环境的baseurl
# build for production with minification
yarn run build

```

## 目录说明
```
src/api 
    资源api目录 请求方法。

src/assets 资源目录
    资源目录 assets 用于组织未编译的静态资源如 SASS 或 images

src/components 组件目录
    组件目录 components 用于组织应用的 Vue.js 组件。与页面耦合度较低。
    通用组件 放置于 src/components/common 目录下，如通用的echarts图表，表格等

src/pages 页面目录
    页面目录 pages 用于组织应用的视图。对应路由配置。

src/router 路由目录
    路由目录 router 用于组织应用的路由。应与 src/pages 目录下的 .vue 文件对应。

src/store 目录
    store 目录用于组织应用的 Vuex 状态树 文件。

static 静态文件目录
    静态文件目录 static 用于存放应用的静态文件，此类文件不会被调用 Webpack 进行构建编译处理。 服务器启动的时候，该目录下的文件会映射至应用的根路径 / 下。
举个例子: /static/favicon.ico 映射至 /favicon.ico。 注意：图片手动压缩后再放入 工具推荐：[https://tinypng.com/](https://tinypng.com/)


package.json 文件
    package.json 文件用于描述应用的依赖关系和对外暴露的脚本接口。
```


## 最佳实践

> 样式使用 [SCSS](http://sass-lang.com/)
>
> node包管理工具使用 [npm]
>
> js语法版本使用[ES6（ES2015）](https://babeljs.io/learn-es2015/) 代码格式校验工具使用[ESLint](http://eslint.org/) 校验规则使用[standard](https://standardjs.com/rules-zhcn.html)
>
> [mock平台](https://www.easy-mock.com)  [动态模拟数据编写示例](http://mockjs.com/examples.html)
>
