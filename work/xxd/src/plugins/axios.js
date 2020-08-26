import axios from 'axios'
import qs from 'qs'
import router from '@/router'

import {
  clearToken
} from '@/utils/auth'
import {
  Message
} from 'element-ui'
import {
  getToken
} from '../utils/auth'
import store from '@/store'
import { format } from 'core-js/fn/date'

// 请求超时时长
axios.defaults.timeout = 15000
// 超时请求次数，请求的间隙
axios.defaults.retry = 4
axios.defaults.retryDelay = 1000
// 请求头设置

axios.defaults.headers['Content-Type'] = 'application/json;charset=UTF-8'
axios.defaults.headers['Cache-Control'] = 'no-cache'
axios.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest'
axios.defaults.baseURL = process.env.VUE_APP_BASE_API
// 错误提示 页面
function showErrorPage(type, params) {
  if (params) {
    params.type = type
  }
  router.push({
    name: 'error',
    params: params
  })
}

// request拦截器 这里可以添加请求发起后的操作
axios.interceptors.request.use(
  (cfg) => {
    // console.log(111, cfg)
    // 动态设置每个请求的token参数
    cfg.headers['X-Access-Token'] = getToken()
    // 参数序列化相关处理
    if (['post', 'put', 'patch'].indexOf(cfg.method) !== -1) {
      if (cfg.url === '/task/addExploreTask') {
        //cfg.data = JSON.stringify(cfg.data)
        cfg.data = cfg.data 
      } else {
        //cfg.data = qs.stringify(cfg.data)
        cfg.data = cfg.data
      }
    }
    return cfg
  },
  (error) => {
    // 请求错误处理
    console.warn('错误的请求参数')
    console.error(error)
    return Promise.reject(error)
  }
)

// respone拦截器 这里可以添加请求结束后的操作
axios.interceptors.response.use(
  (response) => {
    // 请求成功
    if (response.status >= 200 && response.status < 300) {
      // 请求错误弹窗提示，页面
      if (response.data.code === 400) {
        if (!document.querySelector('.error-ajax')) {
          Message({
            showClose: true,
            message: response.data.message,
            type: 'error'
          })
        }
        // 关闭loading
        store.dispatch('updateLoading', false)
        // 跳错误页
      } else if (response.data.code === 500) {
        // showErrorPage(response.data.code, response.data)
        console.log('500')
        if (!document.querySelector('.error-ajax')) {
          Message({
            showClose: true,
            message: response.data.message,
            type: 'error'
          })
        }
        // 用户异地被踢出，清空token跳转登录页
      } else if (response.data.code === 1000) {
        if (!document.querySelector('.error-ajax')) {
          Message({
            showClose: true,
            message: response.data.message,
            type: 'error'
          })
        }
        
        clearToken()
        router.push({
          name: 'login'
        })
        // 直接跳登录页
      } else if (response.data.code === 10000) {
        Message({
          showClose: true,
          message: response.data.message,
          type: 'error'
        })
        clearToken()
        router.push({
          name: 'login'
        })
      } else if (response.data.code === 200 || response.data.code === 0) {
        return response
      } else {
        return response
      }
      // return false
    } else if ([401, 403, 500, 501, 502, 504].indexOf(response.status) !== -1) {
      // 未认证 提示
      showErrorPage(response.status, response.data)
    } else {
      // error 提示
      if (!document.querySelector('.error-ajax')) {
        Message({
          showClose: true,
          message: response.data || response.statusText,
          type: 'error',
          duration: 15000
        })
      }
      // 关闭loading
      store.dispatch('updateLoading', false)
    }
    return Promise.reject(response)
  }, (err) => {
    var config = err.config
    if (!document.querySelector('.error-ajax')) {
      Message({
        message: '网络不好请稍后再试',
        type: 'error',
        duration: 15000
      })
    }
    
    // If config does not exist or the retry option is not set, reject
    if (!config || !config.retry) return Promise.reject(err)

    // Set the variable for keeping track of the retry count
    config.__retryCount = config.__retryCount || 0

    // Check if we've maxed out the total number of retries
    if (config.__retryCount >= config.retry) {
      // Reject with the error
      return Promise.reject(err)
    }

    // Increase the retry count
    config.__retryCount += 1

    // Create new promise to handle exponential backoff
    var backoff = new Promise(function(resolve) {
      setTimeout(function() {
        resolve()
      }, config.retryDelay || 1)
    })

    // Return the promise in which recalls axios to retry the request
    return backoff.then(function() {
      return axios(config)
    })
  }
)

// 封装实现 api路径的变量注入
const fetch = function(_api) {
  // 发起实际请求
  return axios(_api)
}

export default function(Vue) {
  return !Vue ? fetch : (Vue.prototype.$http = fetch)
}
