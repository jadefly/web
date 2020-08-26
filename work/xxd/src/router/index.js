import Vue from 'vue'
import Router from 'vue-router'

import routerBase from './map/base'
import routerAsync from './map/async'
import subRouter from './map/subRouter'

Vue.use(Router)

// 路由数据
export const constantRouterMap = routerBase
export const routerAsyncMap = routerAsync

// 构建基础路由
export default new Router({
  mode: 'history',
  routes: constantRouterMap.concat(subRouter)
})
