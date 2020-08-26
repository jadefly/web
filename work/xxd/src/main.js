import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import utils from '@/utils/common'
import filter from '@/plugins/filter'
// plugins
import plugins from './plugins'
// 字体图标
import '@/assets/fonts/iconfont.css'
// 路由权限管理
import '@/router/engine'
import './assets/css/index.scss'
// 时间格式化
import moment from 'moment'
import 'moment/locale/zh-cn'
moment.locale('zh-cn')

Vue.use(plugins)
Vue.prototype.utils = utils; // 公用方法
Vue.prototype.moment = moment;// 赋值使用

// 全局导入过滤器
Object.keys(filter).forEach(key => Vue.filter(key, filter[key]))

if (module.hot) {
  module.hot.accept();
}

new Vue({
  render: (h) => h(App),
  router,
  store
}).$mount('#app')
