import HotKey from '@/common/js/HotKey';

const VueHotKey = {};
VueHotKey.install = (Vue) => {
  const VueSelf = Vue;
  VueSelf.prototype.$hotKey = new HotKey();
};
export default VueHotKey;
