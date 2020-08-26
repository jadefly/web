import { Message } from 'element-ui'
import router from '@/router'
import store from '@/store'
import { getToken } from '@/utils/auth' // get token from cookie
import { getUserMsg } from '@/api/user.js'
const whiteList = ['/login', '/loopholeout'] // no redirect whitelist

router.beforeEach((to, from, next) => {
  // todolist 登录页及登出页路由跳转时相关token问题
  // todolist 获取页面title、logo、标题等相关配置数据并设置
  // todolist 是否设置页面白名单
  const hasToken = getToken()

  let ruleinfo = {
    token: hasToken,
    _t: new Date().getTime()
  }
  // console.log('beforeEach', to)
  if (hasToken) {
    // 判断是否有token

    if (store.state.role.length === 0) {
      // 判断当前用户是否已拉取完user_info信息
      getUserMsg(ruleinfo).then((res) => {
        store.dispatch('GetInfo', res)
          .then(() => {
            // 拉取info
            const roles = res.data.result.userAndRoleInfo[0].roleName
            console.log('roles', roles, res.data.result.userAndRoleInfo[0])
            store.dispatch('GenerateRoutes', roles).then(() => {
              // 生成可访问的路由表
              router.addRoutes(store.state.addRouters) // 动态添加可访问路由表
              console.log('router:',router, store.state.addRouters)
              if (to.path === '/' || to.path === '/login') {
                next('/home')
              } else {
                next({
                  ...to,
                  replace: true
                })
              }
            })
          })
      }).catch((err) => {
        console.log(err)
        // Message({
        //   message: '网络不好请稍后再试！',
        //   type: 'error'
        // })
      })
    } else {
      if (to.meta && to.meta.role) {
        // 地址栏输入时做全选判断
        next() // 当有用户权限的时候，说明所有可访问路由已生成 如访问没权限的全面会自动进入404页面
      } else if (to.path === '/' || to.path === '/login') {
        next('/home')
      } else if (to.path === '/error') {
        next()
      } else {
        // 无权跳到错误页
        router.push({
          name: 'error',
          params: {
            type: 401
          }
        })
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入     
      next()
    } else {
      next('/login') // 否则全部重定向到登录页
    }
  }
})
