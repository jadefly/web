const url = require('url');

function Router(){
    this.stack=[];
}
Router.prototype.get= function(path,handler){
    this.stack.push({
        path,
        method: 'get',
        handler
    })
}
Router.prototype.handler_request= function(req,res,out){
    let pathname = url.parse(req.url).pathname;//
    console.log('stack:', this.stack); 

    // let m = req.method.toLowerCase();
    // for(let i=1;i<this.stack.length;i++){
    //     let {method,path,handler} = this.stack[i];
    //     if(m===method&& pathname===path){
    //         return handler(req,res);
    //     }
    // }
    // out();

    //handler 依次执行 compose--组合函数执行
    let idx = 0;
    let next = ()=>{
        if(idx>=this.stack.length) return out();
        let layer = this.stack[idx++];
        if(req.method.toLowerCase()===layer.method&& pathname===layer.path){
            layer.handler(req,res,next);
        }else{
            next();
        }
    }
    next();
    
}
module.exports = Router;


