export default class Printer {
  constructor(controller) {
    this.controller = controller;
    this.name = 'Printer';
    this.settings = {};
  }

  print(data) {
    this.controller.send(this.name, 'tcsl.report.print', data);
  }

  message() {
    return this;
  }
}
