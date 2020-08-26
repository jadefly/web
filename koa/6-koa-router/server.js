const koa = require('koa');
const fs = require('fs');
const path = require('path');
// 路由模块使用前需要先安装和实例化
const Router = require('koa-router')
const router = new Router();

const app = new koa();

// 首页
app.use(async (ctx, next) => {
    if (ctx.request.path === '/') {
      ctx.response.status = 200
      ctx.response.body = 'index'
    }
    await next()
})

// 其他页面通过 router 加载  访问：home/list
let urls = fs.readdirSync(__dirname + '/urls')
console.log('读取 urls 目录下的所有文件名:',urls)
urls.forEach((element) => {
    let module = require(__dirname + '/urls/' + element)
    /*urls 下面的每个文件负责一个特定的功能，分开管理
      通过 fs.readdirSync 读取 urls 目录下的所有文件名，挂载到 router 上面*/
    router.use('/' + element.replace('.js', ''), module.routes(), module.allowedMethods())
})

router.get('/a/:name/:id',function(ctx,next){
  ctx.body = ctx.params; //{"name":"2","id":"1"}
})

app.use(router.routes())
app.listen(3000);
