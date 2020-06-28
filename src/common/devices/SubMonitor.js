export default class SubMonitor {
  constructor(controller) {
    this.controller = controller;
    this.name = 'SubMonitor';
  }

  open(url) {
    this.controller.send(this.name, 'tcsl.submonitor.open', url);
  }

  close() {
    this.controller.send(this.name, 'tcsl.submonitor.close');
  }

  send(data) {
    this.controller.send(this.name, 'tcsl.tosubmonitor', data);
  }

  sendToMain(data) {
    this.controller.send(this.name, 'tcsl.submonitor.tomain', data);
  }

  hello(callback) {
    this.controller.send(this.name, 'tcsl.submonitor.hello');
    this.callback = callback;
  }

  helloToMain(callback) {
    this.controller.send(this.name, 'tcsl.submonitor.main.hello');
    this.callback = callback;
  }

  message(data) {
    if (this.callback) {
      this.callback(data);
    }
  }
}
