//主要工作：创建应用
const http = require('http')
const url = require('url');
let Router = require('./router')
//应用和路由分离


//提供应用
function Application(){
    this.router = new Router;
    // this.router = [
    //     {path:'*',method:"*",handler(req,res){
    //         res.end(`connot ${req.method} ${req.url}`)
    //     }}
    // ]
}
Application.prototype.get = function(path,handler){
    this.router.get(path,handler)
    // this.router.push({
    //     path,
    //     method: 'get',
    //     handler
    // })
}
Application.prototype.listen = function(){
    let server = http.createServer((req,res)=>{
        // let m = req.method.toLowerCase();
        // let pathname = url.parse(req.url).pathname;//
        // for(let i=1;i<this.router.length;i++){
        //     let {method,path,handler} = this.router[i];
        //     if(m===method&& pathname===path){
        //         return handler(req,res);
        //     }
        // }
        //如果找不到对应的就调用默认的404逻辑
        // return this.router[0].handler(req,res);

        function out(){//如果找不到，执行
            res.end(`connot ${req.method} ${req.url}`)
        }
        this.router.handler_request(req,res,out);
    })
    server.listen(...arguments);
}

module.exports = Application