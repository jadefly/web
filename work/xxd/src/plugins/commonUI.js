import myBreadcrumb from '@/components/base/Breadcrumb'

// 这里是重点
const commonUI = {
  install: function(Vue) {
    Vue.component('myBreadcrumb', myBreadcrumb) // 面包屑
  }
}

export default commonUI
