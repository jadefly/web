export default {
  install(Vue) {
    Vue.prototype.$tcsl = {
      fullScreen(control) {
        if (control === true) {
          console.info('TCSLCMD=FullScreenOn');
        } else {
          console.info('TCSLCMD=FullScreenOff');
        }
      },
      resetDeviceMgr() {
        console.info('TCSLCMD=ResetDeviceMgr');
      },
    };
  },
};
