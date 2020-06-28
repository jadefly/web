export default class XLSPrint {
  constructor(controller) {
    this.controller = controller;
    this.name = 'XLSPrint';
    this.settings = {};
  }

  print(data) {
    this.controller.send(this.name, 'tcsl.xlsprint.print', data, false, true);
  }

  preview(data) {
    this.controller.send(this.name, 'tcsl.xlsprint.preview', data, false, true);
  }

  message() {
    return this;
  }
}
