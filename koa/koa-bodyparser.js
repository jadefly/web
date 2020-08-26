const fs = require('fs');
const path = require("path");
const uuid = require('uuid'); //第三方插件
Buffer.prototype.split = function(sep){ //sep 分隔符
    let len = Buffer.from(sep).length; //分隔符的长度
    let offset = 0; //查找的起始位置
    let result = [];
    let current;
    //把找到的位置赋给current，看一下是否为-1，如果没有
    while((current = this.indexOf(sep,offset)) != -1){
        result.push(this.slice(offset,current));
        offset = current + len;
    }
    result.push(this.slice(offset)); //最后一段追加进去
    return result;
}

const bodyparser = ()=>{
     return async (ctx,next)=>{
        await new Promise((resolve,reject)=>{
            let arr = [];
            ctx.req.on('data',function(chunck){
                arr.push(chunck);
            })
            ctx.req.on('end',function(){
                let type = ctx.get('Content-Type');
                //type='multipart/form-data; boundary=----WebKitFormBoundaryyF1WxPAmVV5vg1MH'
                // console.log(type)
                
                if(type.includes('multipart/form-data')){
                    let buff = Buffer.concat(arr);
                    let boundary = type.split(('='))[1];
                    boundary = '--' + boundary;
                    let lines = buff.split(boundary).slice(1,-1);
                    let obj = {}
                    lines.forEach((line)=>{
                        let [head,content] = line.split('\r\n\r\n'); //分割开
                        head = head.toString();
                        let key = head.match(/name="(.+?)"/)[1];

                        if(head.includes('filename')){//如果是文件
                            let filename = uuid.v4();
                            fs.writeFileSync(path.resolve(__dirname,'upload',filename),content.slice(0,-2),'utf8');
                            obj[key] = filename;
                        }else{
                            obj[key] = content.slice(0,-2).toString();
                        }
                    })
                    ctx.request.body = obj;
                }else{
                    let result = Buffer.concat(arr).toString();
                    ctx.request.body = result;
                }
                resolve();
            })
        })
        await next();
    }
}

module.exports = bodyparser;