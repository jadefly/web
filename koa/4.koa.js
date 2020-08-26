//中间件
//eggjs的基础 讲koa的思想
//外部接口，

const Koa = require('koa');
const fs = require('fs');

let app = new Koa();
//koa作用：web服务 接收用户请求的数据， 来解析返回数据
//一个表单 当我访问的时候，显示表单
//当我点击按钮时能提交书
//可以组合
//koa 原理：会将use里的方法组合起来，返回promise
app.use(async (ctx,next)=>{
    console.log('start:',ctx.path)
    if(ctx.path==='/form'&&ctx.method=='GET'){
        //设置上下文下载，指定下载名称
        // ctx.set("Content-Disposition","attachment;filename=FileName.txt")

        ctx.set('Content-Type','text/html;charset=utf-8');
        ctx.body = fs.createReadStream('./form.html'); //默认为下载
    }else{
        await next()  //next执行完成后，不用等待当前的下一个中间件执行完成
    }
    
})
//所有的异步封装成promise 这样就会等待promise执行完成再执行next
app.use(async (ctx,next)=>{
    // console.log('2',ctx.req)
    if(ctx.path=='/login'&& ctx.method=='POST'){
        return new Promise((resolve,reject)=>{
            let arr = [];
            ctx.req.on('data',function(chunck){
                arr.push(chunck)
            })
            ctx.req.on('end',function(chunck){
                let result = Buffer.concat(arr).toString();
                console.log(result);
                ctx.body = result;
                resolve();
            })
            
        })
    }
    // await next()
})

app.listen(3000)

