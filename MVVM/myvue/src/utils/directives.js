import Vue from 'vue';
export default (Vue) => {
  // 功能：点击空白处隐藏弹层
  Vue.directive("clickoutside", {
    bind(el, binding, vnode) {
      function documentHandler(e) {
        // 点击的元素是否是本身，是本身，则返回
        if (el.contains(e.target)) return;
        // 如果绑定了函数 则调用那个函数，此处binding.value就是handleClose方法
        if (binding.expression) binding.value(e, binding.arg);
      }
      if (binding.arg && !binding.arg.isOpen) return; // 用于动态创建的列表，根据参数来开启和关闭，默认不设置为开
      // 给当前元素绑定个私有变量，方便在unbind中解除事件监听
      el.__vueClickOutside__ = documentHandler;
      document.addEventListener('click', documentHandler);
    },
    unbind(el, binding) {
      if(!binding.arg) return;
      // 解除事件监听
      document.removeEventListener('click', el.__vueClickOutside__);
      delete el.__vueClickOutside__;
    },
  });
};
