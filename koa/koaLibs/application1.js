const http = require('http')
let context = require('./context');
let request = require('./request');
let response = require('./response');

//需要导出一个koa类
class Application{
    constructor(req,res){
        this.context = context;
        this.request = request;
        this.response = response;
    }
    use(fn){//注册方法
        this.fn = fn;
    }
    createContext(req,res){
        let context = Object.create(this.context); //每次都创建一个全新的context
        context.request = this.request; //自己封装
        context.response = this.response; //自己封装
        context.req = context.request.req = req;
        context.res = context.request.res = res;
        return context;
    }
    handleRequest(req,res){
        let ctx = this.createContext(req,res);
        this.fn(ctx); //函数执行
    }
    listen(...args){//监听端口号
        let server = http.createServer(this.handleRequest.bind(this));
        server.listen(...args);
    }
}

module.exports = Application;