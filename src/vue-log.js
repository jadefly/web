import UILog from './common/js/crmDependencies/UILog';

const Log = new UILog();
const VueLog = {};
VueLog.install = (Vue) => {
  const VueSelf = Vue;
  VueSelf.prototype.$log = {
    debug(msg) {
      Log.debug(msg);
    },
    warn(msg) {
      Log.warn(msg);
    },
    info(msg) {
      Log.info(msg);
    },
    error(msg) {
      Log.error(msg);
    },
    submit() {
      Log.submit();
    },
  };
};

// module.exports = VueDevices
export default VueLog;
