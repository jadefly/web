import { round } from '../js/math';

export default class CDI {
  constructor(controller) {
    this.controller = controller;
    this.name = 'CDI';
  }

  open(options) {
    this.controller.send(this.name, 'tcsl.cdi.open', options);
  }

  close() {
    this.controller.send(this.name, 'tcsl.cdi.close', { Param: 'CloseCDI' });
  }

  clear() {
    this.controller.send(this.name, 'tcsl.cdi.clear', { Param: 'CloseCDI' });
  }

  price(num) {
    this.show('tcsl.cdi.display_price', num);
  }

  total(num) {
    this.show('tcsl.cdi.display_total', num);
  }

  pay(num) {
    this.show('tcsl.cdi.display_pay', num);
  }

  change(num) {
    this.show('tcsl.cdi.display_change', num);
  }

  show(cmd, num) {
    this.controller.send(this.name, cmd, round(num));
  }

  message() {
    return this;
  }
}
