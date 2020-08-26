import error from '@/pages/error/index.vue'
import login from '@/pages/current-user/login.vue'
import loopholeout from '@/pages/loopholeout/index.vue'

// 基础路由（白名单，正常router结构）
export default [{
  path: '/error',
  name: 'error',
  component: error,
  props: true
},
{
  path: '/login',
  name: 'login',
  component: login,
  props: true
},
{
  path: '/logout',
  name: 'logout',
  component: login,
  props: true
}, {
  path: '/loopholeout',
  name: 'loopholeout',
  component: loopholeout,
  props: true
}]