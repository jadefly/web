const koa = require('koa');
const app = new koa();

function logger(){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            console.log('logger')
            resolve();
        },1000)
    })
}
//node 原生 req res 
//request response(koa封装的) 增加了很多方法
//ctx 代理了req res request response
app.use(async (ctx,next) => {// ctx上下文
    console.time('start') //计算器的起始方法
    // console.log('path:', ctx.path)
    console.log(ctx.url)  //自己封装的
    console.log(ctx.req.url)

    //ctx.request.url是 ctx.request.req.url 的简写(自己封装的)
    console.log(ctx.request.url); 
    console.log(ctx.request.req.url)
    
    
    ctx.body = 'hello world';
    console.log(ctx.response.body) //相当于 ctx.body
    // console.log(ctx.response.res)
    // ctx.res.end('1111') //原生的写法，不建议使用
    
    await next() //往下执行  一般会天津await/return 让该函数执行完
    //与await 的区别：用return 之后，后面的语句不再执行

    console.timeEnd('start')
})
app.use(async (ctx,next)=>{
    console.log(2)
    await logger()
    // ctx.body = '2222222222'
    ctx.body = {a:1}
    await next()
})

//koa 里面有个compose方法，会将所有的方法组合成一个大的promise，如果其中一个执行完，其他就不再执行
app.listen(3000)