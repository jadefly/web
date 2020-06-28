// axios 二次封装
import axios from 'axios';
import qs from 'qs';
import { find } from 'lodash';
import { Message, MessageBox, Loading } from 'element-ui';
import i18n from '@/locales/index';
// 国际化-多语言
import langTable from '@/common/dictionary/lang-table';
import getToken from '@/common/http/getToken';
import HotKey from '@/common/js/HotKey';
import Vue from 'vue';
import returnpointandsettle from '../js/logic/canyin/pos/returnpointandsettle';

const hotKey = new HotKey();

let apiUrl = null;
let loading = null;
// 缓存下url,和params数据
const copeyRequestData = new Map();

function backToHome() {
  if (process.env.NODE_ENV === 'development') {
    window.location.href = '/';
  } else {
    window.location.href = `${process.env.API_PATH}${process.env.DIST_PATH}/`;
  }
}
function catchCallback(errcode, msg, title, showDetails) {
  if (showDetails) {
    MessageBox.alert(`${msg}<br><small>(${errCode} - ${apiUrl})</small>`, title, {
      dangerouslyUseHTMLString: true,
      customClass: 'ajax-error-alert',
    });
  } else {
    MessageBox.alert(msg, title, {
      customClass: 'ajax-error-alert',
    });
  }
}
function errorHandler(errCode, msg) {
  // 前置方法
  catchCallback(errCode, msg || i18n.t('Dict.AjaxMessage.Message7'));
}

function startLoading() {
  loading = Loading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)',
    // target: document.querySelector('.loading-area')//设置加载动画区域
  });
}
function endLoading() {
  loading.close();
}
// 声明一个对象用于存储请求个数
let needLoadingRequestCount = 0;
function showFullScreenLoading() {
  if (needLoadingRequestCount === 0) {
    startLoading();
  }
  needLoadingRequestCount += 1;
}
function tryHideFullScreenLoading() {
  if (needLoadingRequestCount <= 0) return;
  needLoadingRequestCount -= 1;
  if (needLoadingRequestCount === 0) endLoading();
}

// url-不同环境下 , 断网， 错误处理
// 1. 根据环境变量区分接口的默认地址
// axios.defaults.baseURL = process.env.API_PATH;
// switch(process.env.NODE_ENV){
//     case 'production': //线上环境
//         axios.defaults.baseURL = process.env.API_PATH;
//         break;
//     default:
//         axios.defaults.baseURL = 'http://127.0.0.1:3000';
// }
// 2. 设置超时时间和跨域是否允许携带凭证
axios.defaults.timeout = 10000;
axios.defaults.withCredentials = true;

// 3. x-www-form-urlencoded 数据格式  xxx=xx&a=xx
axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded';
// 只针对post请求起作用
// axios.defaults.transformRequest = data => qs.stringify(data);  // qs是第三方库，将data的值变成字符串

// 4. 设置请求拦截器  （请求，响应） -> 服务器
// TOKEN 校验（JWT） 接受服务器返回的token，存储到vuex/本地存储中，每次向服务器发请求，我们应该把token带上
axios.interceptors.request.use((config) => {
  // console.log(config);
  // 携带上token
  // let token = localStorage.getItem('token');
  // token && (config.headers.Anthorization = token);
  apiUrl = config.url;
  // console.log('config:', config);
  return config;
}, err => Promise.reject(err), // 请求超时
);

axios.interceptors.response.use((res) => {
  const { data } = res;
  if (data.data.result === -2) { // 去授权
    console.log('去授权--', res);
    const copeyRes = res;
    (new Vue()).$vemit('posAuthCheck', {
      message: res.msg,
      requestData: {
        url: copeyRes.config.url,
      },
      callback: (code, requestData) => {
        // 根据缓存的url来找到对应的数据
        const url = requestData.url.split(process.env.API_PATH)[1];
        const requestNeedData = copeyRequestData.get(url);
        // 获取到就删除缓存
        copeyRequestData.delete(url);
        // 回调
        requestNeedData.params.callback({ authCode: code });
      },
    });
  } else {
    // 删除缓存
    copeyRequestData.delete(res.config.url);
  }
  // console.log('res', apiUrl, res);
  // 如果不是 login 接口的请求失败，返回的 msg 信息为'platform/login/login/loginNew'，则强制跳转到登录页
  if (data.msg === 'closePs-redirect-loginPage') {
    if (data.data) {
      MessageBox.alert(data.data, i18n.t('Dict.Tips'), {
        callback: () => {
          backToHome();
        },
      });
    } else {
      backToHome();
    }
  } else if (data.code !== '1'
    && apiUrl !== '/platform/login/login/loginv2'
    && apiUrl !== '/canyin/pos/reception/receptionbusiness/exitreceptionbusinessv2'
    && (
      data.msg === 'platform/login/login/loginNew'
      || JSON.stringify(data).includes('redirect:/canyin/pos/opening/page')
    )
  ) {
    backToHome();
  }
  return res;
}, (error) => {
  // console.log('error:', error);
  const { response } = error;
  if (response) { // 服务器最起码返回了结果
    // errCode -2 需要授权
    switch (response.status) {
      case 401: // 当前请求需要用户验证--权限
        // 弹错误信息
        break;
      case 403: // 服务器已经理解请求，但拒绝执行（token过期）
        break;
      case 404: // 找不到页面 当前网络错误
        catchCallback(
          '404',
          i18n.t('Dict.AjaxMessage.Message2'),
          i18n.t('Dict.SystemError'),
          true,
        );
        break;
      case 405:
        catchCallback(
          '405',
          i18n.t('Dict.AjaxMessage.Message3'),
          i18n.t('Dict.Tips'),
          true,
        );
        break;
      case 406:
        MessageBox.alert(i18n.t('Dict.AjaxMessage.Message4'),
          i18n.t('Dict.Tips'),
          {
            callback: () => backToHome(),
          });
        break;
      case 410:
        errorHandler('410', (response.data && response.data.msg ? response.data.msg : ''));
        break;
      case 500:
        errorHandler('500', (response.data && response.data.msg ? response.data.msg : ''));
        break;
      default:
        const msg = error.message || response.data.msg;
        break;
    }
  } else { // 服务器连结果都没有返回，（客服端没网）
    // if(!windw.navigator.onLine){
    //     //断网处理：可以跳转到断网页面带当前url地址 -- > 您的网络出现问题，请重新刷新尝试，刷新按钮，刷新成功后跳转回去
    //     return;
    // }
    catchCallback(
      'error',
      i18n.t('Dict.AjaxMessage.Message1'),
      i18n.t('Dict.SystemError'),
      true,
    );
    return Promise.reject(error);
  }
});

// 为了不影响之前到逻辑，添加到函数里，只有调用post和get方法才生效
async function startCondition(url, params, method) {
  // 国际化
  const finded = find(langTable, { name: i18n.locale });
  axios.defaults.headers.cy_locale = finded.lang;
  // console.log('axios.defaults.headers:', axios.defaults.headers);

  hotKey.stop();
  if (params.loading) {
    if (params.loading) showFullScreenLoading();
  }

  // 如果需要token，获取token并添加到data中
  if (params.needToken) {
    const tokenId = await getToken();
    this.$set(params, 'data.token_id', tokenId);
  }
  copeyRequestData.set(url, { params, method });
}
function endCondition(url, params) {
  hotKey.start();
  if (params.loading) tryHideFullScreenLoading();
}
/**
* get方法，对应get请求
* @param {String} url [请求的url地址]
* @param {Object} params [请求时携带的参数]
*/
function get(url, params) {
  startCondition(url, params, 'get');
  return new Promise((resolve, reject) => {
    axios.get(process.env.API_PATH + url, {
      params: params.data,
    }).then((res) => {
      endCondition(url, params);
      resolve(res.data);
    }).catch((err) => {
      endCondition(url, params);
      catchCallback(
        'timeout',
        i18n.t('Dict.AjaxMessage.Message6'),
        i18n.t('Dict.WrongInfo'),
        true,
      );
      reject(err.data);
    });
  });
}
/**
* post方法，对应post请求
* @param {String} url [请求的url地址]
* @param {Object} params [请求时携带的参数]
*/
function post(url, params) {
  if (params.contentType === 'paramsEncoded') {
    axios.defaults.transformRequest = [data => `params=${encodeURIComponent(JSON.stringify(data))}`];
  } else if (params.contentType === 'URIEncodedToken') {
    axios.defaults.transformRequest = [data => qs.stringify({ params: JSON.stringify(data) })];
  } else if (params.contentType === 'json') {
    axios.defaults.headers['Content-Type'] = 'application/json';
    axios.defaults.transformRequest = [data => JSON.stringify(data)];
  } else if (params.contentType === 'diy') {
    axios.defaults.transformRequest = [data => data];
  } else {
    axios.defaults.transformRequest = data => qs.stringify(data); // qs是第三方库，将data的值变成字符串
  }
  startCondition(url, params, 'post');
  return new Promise((resolve, reject) => {
    axios.post(process.env.API_PATH + url, params.data).then((res) => {
      endCondition(url, params);
      resolve(res.data);
    }).catch((err) => {
      endCondition(url, params);
      catchCallback(
        'timeout',
        i18n.t('Dict.AjaxMessage.Message6'),
        i18n.t('Dict.WrongInfo'),
        true,
      );
      reject(err.data);
    });
  });
}

// 5. 导出
export {
  axios,
  get,
  post,
};
// console.log(axios.defaults);
