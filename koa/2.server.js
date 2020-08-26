const Koa = require('./koaLibs/application'); //核心文件

let app = new Koa();

app.use((ctx)=>{
    console.log(ctx.url)  //自己封装的
    console.log(ctx.request.req.url) 

    console.log(ctx.req.url) 
    console.log(ctx.request.url); //自己封装

    console.log(ctx.request.path)
    console.log(ctx.path)
    
    // res.end('hello jadedddd')
    ctx.body = 'hello jadedddd'
    console.log('body:',ctx.body)
})
app.listen(4000)