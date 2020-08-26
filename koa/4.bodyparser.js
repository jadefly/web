const Koa = require('koa');
const app = new Koa();
const bodyparser = require('koa-bodyparser');
const fs = require('fs');

app.use(bodyparser());

app.use(async (ctx,next)=>{
    console.log(ctx.path, ctx.method)
    if(ctx.path=='/form' && ctx.method==='GET'){
        ctx.set("Content-Type","text/html;charset=utf-8");
        ctx.body = fs.createReadStream('./4.form.html');
    }else{
        await next();
    }
})
app.use(async (ctx,next)=>{
    if(ctx.path=='/login' && ctx.method==='POST'){
        //需要统一处理请求体 -- 中间件koa-bodyparser
        ctx.body = ctx.request.body;
    }else{
        await next();
    }
})

app.listen(3000);
