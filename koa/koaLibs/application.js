const http = require('http');

let context = require('./context');
let request = require('./request');
let response = require('./response');

let Stream = require('stream'); 


//需要导出一个koa类
class Application{
    constructor(req,res){
        this.context = context;
        this.request = request;
        this.response = response;
        this.middlewares = []; //存放回调函数fn   use(fn)
    }
    use(fn){//注册方法
        // this.fn = fn;
        this.middlewares.push(fn);
    }
    createContext(req,res){
        let context = Object.create(this.context); //每次都创建一个全新的context
        context.request = this.request; //自己封装
        context.response = this.response; //自己封装
        context.req = context.request.req = req;
        context.res = context.request.res = res;
        return context;
    }
    compose(ctx){//返回promise
        //this.middlewares  [fn,fn,fn]
        let dispatch = (index)=>{
            //如果没有函数，返回一个空的promise
            if(index===this.middlewares.length) return Promise.resolve();
            let middle = this.middlewares[index];
            //返回promise,
            //方法如果不是promise把他变为promise，外层包一层Promise.resolve(）
            //fn(ctx,next)
            return Promise.resolve(middle(ctx,(()=> dispatch(index+1))));
        }
        return dispatch(0)
    }
    //compose sync + await 写法 ???
    //compose 中next方法，如果避免多次调用
    handleRequest(req,res){
        let ctx = this.createContext(req,res);
        // this.fn(ctx); //函数执行
        this.compose(ctx).then(()=>{ //compose 函数组合 
            let _body = ctx.body;
            //body如果没有赋值 怎么处理
            if(!_body) return res.end('Not Found');
            if(_body instanceof Stream){ //如果是数据流
                // 设置编码为 utf8。
                console.log('Stream:',_body)
                _body.setEncoding('UTF-8');
                _body = _body.pipe(res); //管道读写操作
            }else if(typeof _body == 'object'){
                console.log('object:',_body)
                _body = JSON.stringify(_body);
            }
            res.end(_body)
            
        }).catch(err=>{
            console.log(err)
        })
    }
    listen(...args){//监听端口号
        let server = http.createServer(this.handleRequest.bind(this));
        server.listen(...args);
    }
}

module.exports = Application;