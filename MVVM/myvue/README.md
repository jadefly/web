# myvue

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### 目录结构
静态资源目录: assets
本地数据模拟目录: mocks
公共函数方法目录: utils 
单元测试目录: test
常量目录: consts
icon目录: icons
公共混合函数目录: mixin
路由目录: router
组件目录: components
页面目录： views
配置目录： config
服务api接口管理目录： api
vuex 状态管路目录： store

### 语法约束
一、 组件化命名规则
  1. 按照功能命名：比如头部就是 Header,就是头部导航栏
  2. 按照页面来分组件：比如文章列表 NewsItem，即可用于文章列表，也可以用在详情页的内容推荐
    1. 组件的文件名始终是单词大写开头 如：(PascalCase)
    2. 在声明 prop 的时候，其命名应该始终使用 驼峰命名法
    3. 组件名应该是完整单词而不是缩写
二、VUE规范
  1. 总是用 key 配合 v-for
  2. 不要把 v-if 和 v-for 同时用在同一个元素上。
  3. Object.freeze 方法来冻结一个不会有任何改变的对象，减少组件初始化的时间
  4. 每个组件 export default {} 内的方法顺序一致，方便查找对应的方法。
  按照 data、props、钩子、watch、computed、components
  5. props里加数据类型，是否必传，以及默认值，便于排查错误，让传值更严谨
  6. 使用定时器，要在beforeDestroy()生命周期内清除定时器
三、CSS命名
  随着项目模块增多，防止因为不同页面或者组件中定义的css冲突，所以规范css语法也变得至关重要，
  推荐:BEM，分别代表着:Block(块)、Element(元素)、Modifier(修饰符)
  .user-info {} # user-info 是一个块，我理解是一个模块
  .user-info--feature {} # user-info--feature 是一个修饰符，用来表示这个块的不同状态
  .user-info__title{} # user-info__title 是一个元素，属于userinfo模块下的，多个元素组成块
四、开发工具规范
  eslint 一个插件化的 javascript 代码检测工具，它可以用于检查常见的 JavaScript 代码错误，也可以进行代码风格检查
  Prettier 是格式化代码工具。用来保持团队的项目风格统一