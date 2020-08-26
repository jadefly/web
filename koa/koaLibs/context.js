let context = {

}

//实现代理功能 封装的一个方法
function defineGetter(property,key){
    context.__defineGetter__(key,function(){
        //这的this指的是context 谁调用this就是谁
        return this[property][key]
    })
}
function defineSetter(property,key){
    context.__defineSetter__(key,function(newVal){
        //这的this指的是context 谁调用this就是谁
        return this[property][key] = newVal;
        //ctx.response.body
    })
}

defineGetter('request','url');
defineGetter('request','method');
defineGetter('request','path');

defineGetter('response','body');
defineSetter('response','body'); //设置值

//ctx.url => ctx.request.url
// context.__defineGetter__('url',function(){
//     //这的this指的是context
//     return this.request.url
// })
module.exports = context