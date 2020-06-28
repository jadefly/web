export default class Cardop {
  constructor(controller) {
    this.controller = controller;
    this.name = 'Cardop';
    this.settings = {};
    this.callback = null;
    this.tempId = null;
  }

  init(settings) {
    this.settings = settings;
  }

  read(callback) {
    this.callback = callback;
    this.tempId = this.controller.send(this.name, 'tcsl.cardop.read_no', this.settings);
  }

  readRGJ(callback, rgjCrmInfo) {
    this.callback = callback;
    this.tempId = this.controller.send(this.name, 'tcsl.cardop.read_no', rgjCrmInfo);
  }

  writeNewCardRGJ(callback, rgjCrmInfo) {
    this.callback = callback;
    this.tempId = this.controller.send(this.name, 'tcsl.cardop.ygj_writenewcard', rgjCrmInfo);
  }

  cancel() {
    this.controller.send(this.name, 'tcsl.cardop.trw_card_out', this.settings);
  }

  cancelOut() {
    this.controller.send(this.name, 'tcsl.cardop.card_out', this.settings);
  }

  message(id, data) {
    if (id == this.tempId && data.returnCode != undefined) {
      this.callback(data);
    }
  }
}
