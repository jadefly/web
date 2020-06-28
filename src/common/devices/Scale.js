export default class Scale {
  constructor(controller) {
    this.controller = controller;
    this.name = 'Scale';
    this.callback = null;
    this.settings = null;
  }

  init(settings, callback) {
    this.close(() => {
      this.settings = settings;
      this.tempId = this.controller.send(this.name, 'tcsl.scale.cy7_setconfig', this.settings);
      if (callback) {
        this.callback = callback;
      }
    });
  }

  open(callback) {
    this.tempId = this.controller.send(this.name, 'tcsl.scale.cy7_open', this.settings);
    if (callback) {
      this.callback = callback;
    }
  }

  get(callback) {
    this.tempId = this.controller.send(this.name, 'tcsl.scale.cy7_get', this.settings);
    if (this.tempId && callback) {
      this.callback = callback;
    }
  }

  setTare(callback) { // 设置皮重
    this.tempId = this.controller.send(this.name, 'tcsl.scale.cy7_set_tare', this.settings);
    if (callback) {
      this.callback = callback;
    }
  }

  setZero(callback) { // 设置清零
    this.tempId = this.controller.send(this.name, 'tcsl.scale.cy7_set_zero', this.settings);
    if (callback) {
      this.callback = callback;
    }
  }

  autoWeighStart(callback) { // 开启自动称重
    this.tempId = this.controller.send(this.name, 'tcsl.scale.cy7_auto_weigh_start', this.settings, true);
    if (callback) {
      this.callback = callback;
    }
  }

  autoWeighStop(callback) { // 停止自动称重
    this.tempId = this.controller.send(this.name, 'tcsl.scale.cy7_auto_weigh_stop', this.settings);
    if (callback) {
      this.callback = callback;
    }
  }

  close(callback) {
    this.tempId = this.controller.send(this.name, 'tcsl.scale.cy7_close', this.settings);
    if (callback) {
      this.callback = callback;
    }
  }

  message(id, data) {
    if (data.returnCode !== undefined && id === this.tempId) {
      this.callback(data);
    }
  }
}
