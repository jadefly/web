const Router = require('koa-router');
const aboutRouter = new Router();

aboutRouter.get('/about',async (ctx,next)=>{
    ctx.body = 'about us';
    await next();
})

module.exports = aboutRouter;