const VueKeyboard = {};

VueKeyboard.install = (Vue) => {
  Vue.directive('keyboard', {
    inserted(el, binding, vnode) {
      const settings = binding.value;
      if (
        binding.value
          && binding.value.autoFocus
          && vnode.context.$refs[binding.value.autoFocus]
      ) {
        settings.autoFocus = vnode.context.$refs[binding.value.autoFocus];
      }
      vnode.context.$refs[binding.arg].bind(el, settings);
    },
  });
};

module.exports = VueKeyboard;
