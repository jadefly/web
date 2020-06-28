export default class Shutdown {
  constructor(controller) {
    this.controller = controller;
    this.name = 'Shutdown';
    this.settings = {};
  }

  init(settings) {
    this.settings = settings;
  }

  open() {
    this.controller.send(this.name, 'tcsl.shutdown.shutdown', this.settings);
  }

  message(id, data) {}
}
