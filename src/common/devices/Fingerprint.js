export default class Fingerprint {
  constructor(controller) {
    this.controller = controller;
    this.name = 'Fingerprint';
    this.tempId = '';
    this.callback = null;
    this.status = false;
  }

  register(callback) {
    this.tempId = this.controller.send(this.name, 'tcsl.Finger.RegisterEmp'); // 注册指纹
    if (callback) {
      this.callback = callback;
    }
  }

  identifyEmp(callback) {
    this.status = true;
    this.tempId = this.controller.send(this.name, 'tcsl.Finger.IdentifyEmp'); // 识别指纹
    if (callback) {
      this.callback = callback;
    }
  }

  close(callback = '') {
    this.status = false;
    this.tempId = this.controller.send(this.name, 'tcsl.Finger.Close');
    if (callback) {
      this.callback = callback;
    }
  }

  registerEmp(result) {
    this.callback(result);
  }

  message(id, data) {
    const messageType = {
      RegisterEmp: (result) => {
        this.registerEmp(result);
      },
      IdentifyEmp: (result) => {
        this.callback(result);
      },
    };
    if (id === this.tempId && data.cmdType) {
      if (messageType[data.cmdType]) {
        messageType[data.cmdType](data);
      }
    }
  }
}
