const koa = require('koa');
// 路由模块使用前需要先安装和实例化
const Router = require('koa-router')
const router = new Router();
const app = new koa();

//可以使用koa-generator
const child1 = new Router();
const child2 = new Router();


router.get('/',function(ctx,next){
  ctx.body = 'index'
})
router.get('/list/:name/:id',function(ctx,next){
  ctx.body = ctx.params; //{"name":"2","id":"1"}
})
child1.get('/a',function(ctx,next){ //访问时： /1/a
  ctx.body = '/a'; 
})
child2.get('/b',function(ctx,next){ //访问时： /2/b
  ctx.body = '/b'; 
})

router.use('/1', child1.routes());  
router.use('/2', child2.routes());

app.use(router.routes())
app.listen(3000);
