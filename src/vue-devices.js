import { extend } from 'lodash';
import Devices from './common/js/devices';

const VueDevices = {};
let devices = null;

VueDevices.install = (Vue) => {
  const VueSelf = Vue;
  VueSelf.prototype.$devices = {
    init(settings) {
      devices = new Devices(settings);
      extend(this, devices);
    },
    close() {
      if (devices) {
        devices.close();
      }
    },
  };
};

// module.exports = VueDevices
export default VueDevices;
