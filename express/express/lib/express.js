//真正的express文件夹
//创建应用
console.log('my-express');
const Application = require('./application.js')

function createAplication(){
    return new Application();
}

module.exports = createAplication;
