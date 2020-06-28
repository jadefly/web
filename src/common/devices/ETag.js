export default class ETag {
  constructor(controller) {
    this.controller = controller;
    this.name = 'ETag';
    this.callback = null;
    this.settings = null;
    this.openCallback = null;
    this.opened = false; // 易盘打开标志
  }

  init(settings) {
    this.settings = settings;
    this.tempId = this.controller.send(this.name, 'tcsl.ETag.FreeETag', this.settings);
  }

  open(settings, callback) {
    if (settings) {
      this.settings = settings;
    }
    this.tempId = this.controller.send(this.name, 'tcsl.ETag.InitETag', this.settings, true);
    if (callback) {
      this.callback = callback;
      this.openCallback = callback;
    }
  }

  reload() {
    this.controller.send(this.name, 'tcsl.ETag.FreeETag', this.settings);
    setTimeout(() => {
      this.open();
    }, 600);
  }

  beginWrite(callback) {
    this.opened = true;
    this.controller.send(this.name, 'tcsl.ETag.BeginWriteETag', this.settings);
    if (callback) {
      this.callback = callback;
    }
  }

  write(params, callback) {
    if (this.opened) {
      this.controller.send(this.name, 'tcsl.ETag.WriteETag', params);
      if (callback) {
        this.callback = callback;
      }
    }
  }

  endWrite(callback) {
    if (this.opened) {
      this.controller.send(this.name, 'tcsl.ETag.EndWriteETag');
      this.callback = this.openCallback;
      if (callback) {
        this.callback = callback;
        this.opened = false;
      }
    }
  }

  help() {
    this.controller.send(this.name, 'tcsl.ETag.ShowEHelper', this.settings);
  }

  message(id, data) {
    if (data && data.returnCode === 0 && this.callback) {
      this.callback(data);
    }
  }
}
