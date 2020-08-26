const express = require('./express');

let app = express(); //app就是一个监听函数，内部会创建一个应用

//express 内置了路由系统
app.get('/',function(req,res,next){
    // res.end('1');
    console.log('1')
    next();
})
app.get('/',function(req,res,next){
    res.end('11')
    console.log('11')
    next()
})
app.get('/user',function(req,res,next){
    res.end('222')
    console.log('/ 222')
})

app.listen(3000)
