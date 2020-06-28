export default class Keyboard {
  constructor(controller) {
    this.controller = controller;
    this.name = 'Keyboard';
    this.callback = null;
  }

  init(callback) {
    this.close(() => {
      this.open(callback);
    });
  }

  open(callback) {
    this.tempId = this.controller.send(this.name, 'tcsl.keyboard.open', null, true);
    if (callback) {
      this.callback = callback;
    }
  }

  close(callback) {
    this.tempId = this.controller.send(this.name, 'tcsl.keyboard.close');
    if (callback) {
      this.callback = callback;
    }
  }

  message(id, data) {
    if (
      data.returnCode !== undefined
      && data.returnCode === 0
      && id === this.tempId
    ) {
      this.callback(data);
    }
  }
}
