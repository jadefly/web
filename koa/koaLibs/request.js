let url = require('url')
let request = {
    get url(){//属性访问器 帮助我们处理复杂的逻辑
        //ctx.request.url  this-->ctx.requst
        return this.req.url;  //ctx.request.req 去原生方法上取
    },
    get method(){
        return this.req.method;
    },
    get path(){ //扩展功能
        return url.parse(this.req.url).pathname
    }
}

module.exports = request;