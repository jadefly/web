import axios from 'axios'
// import qs from 'qs'
import { Message } from 'element-ui'

/**
 * get方法，对应get请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function get (url, params = {}) {
  return new Promise((resolve, reject) => {
    axios.get(url, { params: params }).then((res) => {
      resolve(res.data)
    }).catch((err) => {
      reject(err.data)
      // Message({
      //   message: '网络不好请稍后再试！',
      //   type: 'error'
      // })
    })
  })
}

/** 
 * post方法
 * @param {String} url [请求的url地址] 
 * @param {Object} params [请求时携带的参数] 
 */
export function post(url, params = {}) {
  return new Promise((resolve, reject) => {
    axios.post(url, params).then((res) => {
      resolve(res.data)
    }, (err) => {
      reject(err)
      // Message({
      //   message: '网络不好请稍后再试！',
      //   type: 'error'
      // })
    })
  })
}

export function mydelete(url, params = {}) {
  return new Promise((resolve, reject) => {
    axios({
      method: 'delete',
      url: url,
      params: params, // 请求参数拼接在url上
      // data: params  // 请求参数放在请求体
    }).then((res) => {
      console.log(res)
      resolve(res.data)
    })
  })
}

window.post = post