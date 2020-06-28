/**
 * @description: 判断系统权限
 * @Author: wy
 * @param {String} id 需要查找的系统权限id
 * @param {Array} authModule 默认是vuex里的ALL_POS_MODULE，注意：必须在引入此mixin的组件引入ALL_POS_MODULE，否则需手动传入
 * @return: id查到的权限
 * @Date: 2019-04-28 13:10:02
 */
export default {
  methods: {
    isServer(id, authModule = this.ALL_POS_MODULE) {
      for (let i = 0; i < authModule.length; i += 1) {
        if (id === authModule[i].id) {
          // console.log('id对应的权限的名称===', authModule[i].text);
          // console.log('id对应权限所在的对象===', authModule[i]);
          return !authModule[i].checked;
        }
        if (authModule[i].children && authModule[i].children.length) {
          const d = this.isServer(id, authModule[i].children);
          if (d !== undefined) {
            return d;
          }
        }
      }
      return undefined;
    },
  },
};
