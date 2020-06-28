export default class Version {
  constructor(controller) {
    this.controller = controller;
    this.name = 'Version';
    this.tempId = '';
    this.callback = null;
    this.method = 'tcsl.devicemgr.get_version';
  }

  get(shopid, callback) {
    this.tempId = this.controller.send(this.name, this.method, { shopid });
    if (callback) {
      this.callback = callback;
    }
  }

  sendVersion(version) {
    if (this.callback) {
      this.callback(version);
    }
  }

  message(id, data) {
    if (data.method === this.method) {
      this.sendVersion(data.message.version);
    }
  }
}
