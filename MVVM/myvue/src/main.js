import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import directives from '@/utils/directives'

import './assets/css/common.css'

import api from './api/api'
Vue.prototype.$api = api; //挂到全局上
Vue.config.productionTip = false

Vue.use(directives);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
