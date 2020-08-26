const koa = require('koa');
const fs = require('fs');
const path = require('path');
// const static = require('koa-static'); //中间件

const static = require('./koa-static.js')

const app = new koa();

// console.log(path.resolve(__dirname,'./publish'))
// 配置静态web服务的中间件
app.use(static(path.join(__dirname,'./publish')))
app.listen(4000)