class Router{
    constructor(){
        this.middlewares = [];  
    }
    get(path,middleware){
        this.middlewares.push({
            path,
            middleware,
            method: 'get'
        })
    }
    compose(arr,next,ctx){ //组合函数 
        //arr=[ { path: '/', middleware: [AsyncFunction], method: 'get' },{ path: '/', middleware: [AsyncFunction], method: 'get' } ]
        function dispatch(index){
            if(index>=arr.length) return Promise.resolve(next());
            let middle = arr[index++]; //先取出第一个路由执行
            return Promise.resolve(middle.middleware(ctx,()=>dispatch(index++)))
        }
        return dispatch(0)
    }
    routes(){
        return async(ctx,next)=>{
            let method = ctx.method.toLowerCase();
            let path = ctx.path;
            //过滤出匹配的路由
            let arr = this.middlewares.filter(middleware=>{
                return middleware.method===method && middleware.path===path;
            })
            console.log(222,arr)
            this.compose(arr,next,ctx);
        }
    }
}

module.exports =  Router;