const koa = require('koa');
const app = new koa();
// const Router = require('koa-router');
const Router = require('./middlewares/router');
const router = new Router();


router.get('/',async (ctx,next)=>{
    ctx.body= '111';
    await next();
})
router.get('/',async (ctx,next)=>{
    ctx.body= '222';
    await next();
})
router.get('/user',async (ctx,next)=>{
    ctx.body= 'hello22';
    await next();
})

router.get('/a/:name',function(ctx,next){
    console.log(ctx.params);
    ctx.body = ctx.params
  })

app.use(router.routes())
app.use(async(ctx,next)=>{
    console.log('end')
})
app.listen(4000);