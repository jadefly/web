export default class Cashbox {
  constructor(controller) {
    this.controller = controller;
    this.name = 'Cashbox';
    this.settings = {};
    this.callback = null;
    this.tempId = null;
  }

  init(settings) {
    this.settings = settings;
  }

  open(callback) {
    this.callback = callback;
    this.tempId = this.controller.send(this.name, 'tcsl.cashbox.open', this.settings);
  }

  message(id, data) {
    if (id === this.tempId && data.returnCode !== undefined && this.callback) {
      this.callback(data);
    }
  }
}
