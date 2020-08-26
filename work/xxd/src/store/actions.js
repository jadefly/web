import {
  routerAsyncMap
} from '@/router'

function hasPermission(roles, route) {
  let rolesArr = roles.split(',');
  // console.log('route-mata-rale:', route.meta)
  for (let i = 0; i < rolesArr.length; i++) {
    const role = rolesArr[i];
    if (route.meta && route.meta.role && route.meta.role.indexOf(role) !== -1) {
      return true;
    }
    return false;
  }
}
function diff(roles, v) {
  if (hasPermission(roles, v)) {
    if (v.children && v.children.length > 0) {
      v.children = v.children.filter((child) => {
        if (hasPermission(roles, child)) {
          return diff(roles, child)
        }
        return false
      })
      return v
    } else {
      return v
    }
  }
  return false
}
export default {
  updateTimestamp(dis, val) {
    dis.commit('UPDATE_TIMESTAMP', val)
  },
  GenerateRoutes({ commit }, roles) {
    return new Promise((resolve) => {
      const accessedRouters = routerAsyncMap.filter((v) => {
        return diff(roles, v)
        // if (hasPermission(roles, v)) {
        //   if (v.children && v.children.length > 0) {
        //     v.children = v.children.filter((child) => {
        //       if (hasPermission(roles, child)) {
        //         return child
        //       }
        //       return false
        //     })
        //     return v
        //   } else {
        //     return v
        //   }
        // }
        // return false
      })
      
      console.log('router', roles, accessedRouters)
      // console.warn(roles, accessedRouters) 不刷新页面登录路由表会有问题，先做刷新处理
      commit('SET_ROUTERS', accessedRouters)
      resolve()
    })
  },
  // 获取用户角色信息，及用户昵称数据
  GetInfo(dis, res) {
    return new Promise((resolve) => {
      dis.commit('SET_USERINFO', res.data.result.userAndRoleInfo[0])
      dis.commit('SET_ROLE', res.data.result.userAndRoleInfo[0].roleName)
      dis.commit('SET_USER_NAME', res.data.result.userAndRoleInfo[0].username)
      resolve()
    })
  },
  updateLoading(dis, val) {
    dis.commit('UPDATE_LOADING', val)
  },
  updateHtml(dis, val) {
    dis.commit('UPDATE_HTML', val)
  },
  updateCertificate(dis, val) {
    dis.commit('UPDATA_CERTIFICATE', val)
  },
  updateScanTaskId(dis, val) {
    dis.commit('UPDATA_SCAN_TASK_ID', val)
  },
  updatePocTaskId(dis, val) {
    dis.commit('UPDATA_POC_TASK_ID', val)
  },
  updateIpResult(dis, val) {
    dis.commit('UPDATA_IP_RESULT', val)
  },
  updateConfirm(dis, val) {
    dis.commit('UPDATE_CONFIRM', val)
  },
  updateisCollapse(dis, val) {
    dis.commit('UPDATE_ISCOLLAPSE', val)
  }
}
