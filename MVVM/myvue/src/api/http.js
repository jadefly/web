//axios 二次封装
import axios from 'axios'
import qs from 'qs'

//url-不同环境下 , 断网， 错误处理

//1. 根据环境变量区分接口的默认地址
switch(process.env.NODE_ENV){
    case 'production': //线上环境
        axios.defaults.baseURL = 'http://api.a.com';
        break;
    case 'test':
        axios.defaults.baseURL = 'http://apitest.a.com';
        break;
    default:
        axios.defaults.baseURL = 'http://127.0.0.1:3000';    
}
//2. 设置超时时间和跨域是否允许携带凭证
axios.defaults.timeout = 10000;
axios.defaults.withCredentials = true;

//3. x-www-form-urlencoded 数据格式  xxx=xx&a=xx
axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded';
//只针对post请求起作用
axios.defaults.transformRequest= data=> qs.stringify(data);  //qs是第三方库，将data的值变成字符串

//4. 设置请求拦截器  （请求，响应）
//客户端发送请求 =》 [请求拦截器] -> 服务器
// TOKEN 校验（JWT） 接受服务器返回的token，存储到vuex/本地存储中，每次向服务器发请求，我们应该把token带上
axios.interceptors.request.use((config)=>{
    //携带上token
    let token = localStorage.getItem('token');
    token && (config.headers.Anthorization = token);
    return config;
},err=>{
    return Promise.reject(err);
})

//响应拦截器--服务器返回信息=> [拦截器统一处理] ->客服端js获取信息
// axios.defaults.validateStatus = status=>{//一般公司不设置
//     //自定义响应成功的http状态码
//     return /^(2|3)\d{2}$/.test(status)
// }
axios.interceptors.response.use((res)=>{
    return res.data; //响应主体部分
},err=>{
    let {response} = err;
    if(response){//服务器最起码返回了结果
        switch(response.status){
            case 401: //当前请求需要用户验证--权限
                //弹错误信息
                break;
            case 403: //服务器已经理解请求，但拒绝执行（token过期）
                break;
            case 404: //找不到页面
                //toast当前网络错误
                break;            
        }
    }else{//服务器连结果都没有返回，（客服端没网）
        if(!windw.navigator.onLine){
            //断网处理：可以跳转到断网页面带当前url地址 -- > 您的网络出现问题，请重新刷新尝试，刷新按钮，刷新成功后跳转回去
            return;
        }
        return Promise.reject(err);
    }
})


//5. 
export default axios;


console.log(axios.defaults)
// axios.get(url, {
//     params:{}
// }).then(res=>{

// }).catch(err=>{

// })