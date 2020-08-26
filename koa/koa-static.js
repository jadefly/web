const fs = require('fs').promises;
const {createReadStream, readFile} = require('fs');
const path = require('path');
const minetypes = require('./util/minetypes')

function extname(url){//获取文件后缀名
    let arr = url.split('.');
    return arr[arr.length-1].toLowerCase();
}
function getFilePath(url){//获取文件的本地路径
    //没有做配置，直接写死的，其实本地是没有 static 这个目录，而是放在 ./public 目录中。
    //因此需要将 /static/ 去掉，拼上 public/
    const staticStr = '/static/';
    const public = 'public';
    let filePath='';
    if(url.indexOf(staticStr)!=-1){
        filePath= url.substr(staticStr.length)
    }else{
        filePath = url;
    }
    return `${public}${filePath}`;
}
function getFileContent(url){//读取文件内容
    // console.log('fileName:',url)
    return new Promise((resolve,reject)=>{
        readFile(url,(err,data)=>{
            if(err) reject(err);
            resolve(data);
        })
    })
    // return createReadStream(url)
} 

async function getStatic(ctx){//返回文件的内容、类型
    //中间件在处理的时候，如果能够获取到文件，并且请求的文件是图片类型，则直接通过原生的 node.js 的 ctx.res.write(obj.file, 'binary'); 进行二进制输出。其他的则输出字符串内容（readFile 读取的是 <Buffer>）。
    
    try{
        const ext = extname(ctx.url); //'js/1.js' --> js
        const minetype = minetypes[ext]; //类型
        let filePath = path.resolve(__dirname,getFilePath(ctx.url));

        let file = await getFileContent(filePath);
        console.log(file)
        return {code:0,file,minetype}
    }catch(err){
        return {code:-1,err}
    }
}

  

//读取文件，显示在页面上
module.exports = () => {
    return async (ctx,next) => {
        // console.log(ctx,next)
        let obj = await getStatic(ctx); 
        if(obj.code === -1) return ctx.res.writeHead(404);
        if(obj.minetype) ctx.type = obj.minetype;
        if(obj.minetype && obj.minetype.startsWith("image/")){//图片
            console.log(111)
            ctx.res.writeHead(200);
            ctx.res.write(obj.file, 'binary');
            ctx.res.end();
        }else{
            console.log(222)
            ctx.set('Content-type',obj.minetype+';charset=utf-8')
            ctx.body = obj.file;
        }
        await next();
    }
};