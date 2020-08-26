import store from '@/store'
// set token
export function setToken(token) {
  window.sessionStorage.setItem('token', token)
}
// 是否存在token
export function hasToken() {
  return getToken()
}

// 获取已有token值（获取token的接口同时返回用户权限）
export function getToken() {
  return window.sessionStorage.getItem('token')
}

// 清空token（同时清空router）
export function clearToken() {
  window.sessionStorage.removeItem('token')
  store.dispatch('GetInfo', {
    data: {
      role: ['']
    }
  })
}
