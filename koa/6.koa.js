//koa-bodyparse 中间件

const Koa = require('koa');
const fs = require('fs');
// const bodyparser = require('koa-bodyparser'); //中间件

const bodyparser = require('./bodyparser'); //自己封装的方法

let app = new Koa();
app.use(bodyparser());



app.use(async (ctx,next)=>{
    console.log('start:',ctx.path)
    if(ctx.path==='/form'&&ctx.method=='GET'){
        //设置上下文下载，指定下载名称
        // ctx.set("Content-Disposition","attachment;filename=FileName.txt")  //默认为下载
        
        ctx.set('Content-Type','text/html;charset=utf-8');
        ctx.body = fs.createReadStream('./form2.html'); 
    }else{
        await next()  //next执行完成后，不用等待当前的下一个中间件执行完成
    }
    
})
//所有的异步封装成promise 这样就会等待promise执行完成再执行next
app.use(async (ctx,next)=>{
    // console.log('2',ctx.req)
    if(ctx.path=='/login'&& ctx.method=='POST'){
        ctx.body = ctx.request.body;   //中间件-添加的方法ctx.request.body
    }
})

app.listen(3000);