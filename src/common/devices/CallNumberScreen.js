export default class CallNumberScreen {
  constructor(controller) {
    this.controller = controller;
    this.name = 'CallNumberScreen';
    this.tempId = '';
    this.callback = null;
  }

  open() {
    this.tempId = this.controller.send(this.name, 'tcsl.submonitor.open', '/mvc/callNumber.html');
  }

  close() {
    this.tempId = this.controller.send(this.name, 'tcsl.submonitor.close');
  }

  send(data, callback) {
    this.tempId = this.controller.send(this.name, 'tcsl.tosubmonitor', data);
    this.callback = callback;
  }

  hello(callback) {
    this.tempId = this.controller.send(this.name, 'tcsl.submonitor.hello');
    this.callback = callback;
  }

  message(data) {
    if (this.callback) {
      this.callback(data);
      this.callback = null;
    }
  }
}
