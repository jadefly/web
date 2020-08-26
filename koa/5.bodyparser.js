//koa-bodyparse 中间件

const Koa = require('koa');
const fs = require('fs');
// const bodyparser = require('koa-bodyparser'); //中间件  不支持图片

/*中间件特点：
1.可以扩展公共属性和方法
2.决定是否向下执行
3.可以实现权限校验
4.一般放在执行逻辑的上面
*/
const bodyparser = function(){
    return async (ctx,next)=>{
        await new Promise((resolve,reject)=>{
            let arr = [];
            ctx.req.on('data',function(chunck){
                arr.push(chunck)
            })
            ctx.req.on('end',function(chunck){
                let result = Buffer.concat(arr).toString();
                console.log(result);
                // ctx.body = result;
                ctx.request.body = result;
                resolve();
            })
        })
        await next();
    }
}

let app = new Koa();
app.use(bodyparser());

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
        ctx.body = ctx.request.body;   //中间件-添加的方法ctx.request.body
    }
})

app.listen(3000);