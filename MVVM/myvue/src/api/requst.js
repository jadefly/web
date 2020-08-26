//fetch  封装

let baseUrl = '';
let baseURLArr = [{
    type: 'develoment',
    url: 'xxxx'
},{
    type: 'test',
    url: 'xxx'
},{
    type:'production',
    url: 'http://api.xx.com'
}];
baseURLArr.forEach(item =>{
    if(process.evn.NODE_ENV === item.type){
        baseUrl = item.url;
    }
})

export default function requst(url, options={}){
    url = baseUrl + url;

    //如果没有设置method，默认设置为get请求
    !options.method ? options.method = 'GET' : null; 
    if(options.hasOwnProperty('params')){//
        if(/^(GET|DELETE|HEAD|OPTIONS)$/i.test(option.method)){
            let ask = url.includes('?')?'&':'?';
            url += `${ask}${qs.stringify(params)}`
            delete options.params; //用完移除params参数，真实fetch请求中没有fetch参数 是json字符串形式
        }
    }

    //合并配置项
    options = Object.assign({
        credentials:'include', //允许携带跨域凭证，same-origin同源可以，omit都拒绝
        header:{} //设置请求头
    },options);
    options.header.Accept = 'application/json';

    //token校验
    const token = localStorage.getItem('token');
    token && (option.header.Authorization = token);

    //post 请求
    if(/^(POST|PUT)$/i.test(options.method)){
        !options.type ? options.type = 'urlencoded' : null;
        if(options.type === 'urlencoded'){
            options.header['Content-type'] = 'application/x-www-form-urlencoded';
            option.body = qs.stringify(options.body);
        }
        if(options.type === 'json'){
            options.header['Content-Type'] = 'application/json';
            options.body = qs.stringify(options.body);
        }
    }

    return fetch(url,options).then(response=>{
        //返回结果为非2 3 开头的状态码
        if(!/^(2|3)\d{2}$/.test(response.status)){
            switch(response.status){
                case 401:
                    break;
                case 403:
                    break;
                case 404:
                    break;
            }
            return Promise.reject(response);
        } 

        return response.json(); //返回数据
    }).catch((error)=>{
        if(!window.navigator.onLine){//无网状态
            //断网了，可以跳转到断网页面
            return;
        }
        return Promise.reject(error);
    })
}