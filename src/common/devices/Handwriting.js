export default class Handwriting {
  constructor(controller) {
    this.controller = controller;
    this.name = 'Handwriting';
    this.status = false;
  }

  open() {
    this.controller.send(this.name, 'tcsl.execute.open', {
      whichExe: 1,
      event: 1,
    });
    this.status = true;
  }

  close() {
    this.controller.send(this.name, 'tcsl.execute.open', {
      whichExe: 1,
      event: 0,
    });
    this.status = false;
  }

  message() {
    return this;
  }
}
