const Koa = require('./koaLibs/application'); //核心文件
const fs = require('fs');

let app = new Koa();

app.use(async (ctx,next)=>{
    // ctx.body = 'hello jadedddd';
    await next();
})
app.use(async (ctx,next)=>{
    // ctx.body = {a:1};
    //创建可读流
    ctx.body = fs.createReadStream('2.server.js');
    // throw new Error('出错');
    await next();
})

// app.on('error',(err)=>{
//     console.log('1111111',err)
// })

app.listen(4000)