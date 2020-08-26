import Vue from 'vue'
import VueRouter from 'vue-router'
import Index from '../views/index.vue'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'index',
    redirect: '/home',
    component: Index,
    children: [{
      path: '/home',
      name: 'home',
      component: Home,
    }, {
      path: '/about',
      name: 'about',
      component: () => import(/* webpackChunkName: "about" */ '@/views/About.vue')
    }, {
      path: '/chat',
      name: 'chat',
      component: () => import(/* webpackChunkName: "chat" */ '@/views/chat.vue')
    }, {//购物车功能
      path:'/shopingCart',
      name:'shopingCart',
      component: () => import('@/views/shopingCart.vue')
    },{
      path:'/test',
      name:'test',
      component: () => import('@/views/test.vue')
    },]
  },{
    path: '/t1',
    name: 't1',
    component: () => import(/* webpackChunkName: "about" */ '@/views/1.vue')
  },
  {
    path: '/t2',
    name: 't2',
    component: () => import(/* webpackChunkName: "about" */ '@/views/2.vue')
  },
  { // css 滚动条
    path: '/scrollBar',
    name: 'scrollBar',
    component: () => import(/* webpackChunkName: "scrollBar" */ '@/views/cssPage/scrollBar.vue')
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
