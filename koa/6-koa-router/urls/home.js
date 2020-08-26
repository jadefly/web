const Router = require('koa-router')
const homeRouter = new Router();

homeRouter.get('/',async (ctx,next)=>{
    ctx.response.status = 200;
    ctx.response.body = 'home';
    await next()
})
homeRouter.get('/list',async (ctx,next)=>{
    ctx.response.status = 200;
    ctx.response.body = 'home-list';
    await next()
})

module.exports = homeRouter;