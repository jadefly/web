/*中间件特点：
1.可以扩展公共属性和方法
2.决定是否向下执行
3.可以实现权限校验
4.一般放在执行逻辑的上面
*/
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');

Buffer.prototype.split = function(sep){
    let len = Buffer.from(sep).length; // 分割符的长度
    let offset = 0;
    let result = [];
    let current;
    // 把找到的位置赋给current  看一下是否为-1
    while((current = this.indexOf(sep,offset))!==-1){
        result.push(this.slice(offset,current)); // 把每次的记过push到数组中
        offset = current + len // 增加查找偏移量
    }
    result.push(this.slice(offset)); // 最后一段追加进去
    return result;
}

const bodyparser = function(){
    return async (ctx,next)=>{
        await new Promise((resolve,reject)=>{
            let arr = [];
            ctx.req.on('data',function(chunck){
                arr.push(chunck)
            })
            ctx.req.on('end',function(chunck){
                let type = ctx.get('content-type');  //multipart/form-data; boundary=----WebKitFormBoundaryedrhNSWUSsBrWQSk
                if(type.includes('multipart/form-data')){
                    //根据返回的数据，处理数据/转换   arr.toString() 
                    /*
                    ------WebKitFormBoundaryjfFM5b2vygSWpt6i
                    Content-Disposition: form-data; name="name"

                    1
                    ------WebKitFormBoundaryjfFM5b2vygSWpt6i
                    Content-Disposition: form-data; name="password"

                    2
                    ------WebKitFormBoundaryjfFM5b2vygSWpt6i
                    */
                    let boundary = type.split('=')[1]  //----WebKitFormBoundaryedrhNSWUSsBrWQSk
                    let buff = Buffer.concat(arr);
                    let line = buff.split(boundary).slice(1,-1); //slice 去掉数组的首位
                    let obj = {} //存放结果数据 {user:1, password:1}
                    line.forEach(item=>{
                        let [head,content] = item.split('\r\n\r\n');
                        head = head.toString();
                        let key = head.match(/name="(.+?)"/)[1]; //取到name的值 
                        if(head.includes('filename')){
                            //文件
                            let filename = uuid.v4(); //生成随机文件名
                            fs.writeFileSync(path.resolve(__dirname,'upload',filename).content.slice(0,-2),'utf8');
                            obj[key] = filename;
                        }else{
                            obj[key] = content.slice(0,-2).toString();  //slice(0,-2) 后面两个为换行 \r\n
                        }
                    })
                    console.log(obj)
                    ctx.request.body = obj;
                    resolve();
                }else{
                    let result = Buffer.concat(arr).toString();
                    console.log(type);
                    // ctx.body = result;
                    ctx.request.body = result;
                    resolve();
                }
                
            })
        })
        await next();
    }
}

module.exports = bodyparser;