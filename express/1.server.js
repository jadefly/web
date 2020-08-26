const express = require('express');
const app = express();



//express.static 内置中间件函数--静态文件
//public 目录下的图片、CSS 文件、JavaScript 文件对外开放访问了
app.use(express.static('public'));
app.use('/static',express.static('public')); //通过带有 /static 前缀地址来访问 public 目录中的文件了

app.get('/',(req,res)=>{
    console.log(req.app.locals.title)
    res.send('hello')
})
app.get('/user/:id', function (req, res) {
    console.log('this matches too' + req.params.id);
    res.end('params:'+ req.params.id);
});

// app.get('*',function(req,res){
//     console.log(__dirname,req.path)
//     res.sendFile(__dirname + req.path); //res.sendFile()渲染纯 HTML 文件
// });

app.use(function(req,res,next){
    res.status(404).send('404错误！')
})
app.use(function(req,res,next){
    res.status(500).send('Something broke 500!')
})


app.listen(3000,()=>{
    console.log('服务器已启动：http://localhost:3000')
})