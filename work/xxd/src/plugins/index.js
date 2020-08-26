/**
 * @description 全局 组件|插件|中间件|辅助函数 等的拓展及自定义配置
 */
import Axios from './axios'
import UI from './ui'
import * as api from './http'

const installer = function (Vue) {
  // definition global constant
  Vue.prototype.$pageLimit = 20

  // execute methods
  Axios(Vue)
  UI(Vue)
  api
}

export default installer
