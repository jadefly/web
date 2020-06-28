export default class DesktopButton {
  constructor(controller) {
    this.controller = controller;
    this.name = 'DesktopButton';
    this.tempId = '';
    this.callback = null;
  }
  // 获取列表
  getList(callback) {
    this.tempId = this.controller.send(this.name, 'tcsl.desktopbutton.list'); // 列表
    if (callback) {
      this.callback = callback;
    }
  }
  // 执行操作
  doOperation(callback,params){
    this.tempId = this.controller.send(this.name, 'tcsl.desktopbutton.click',{id:params}); // 执行
    if (callback) {
      this.callback = callback;
    }
  }

  message(id, data) {
    if (id === this.tempId && data) {
      if (this.callback) {
        this.callback(data);
      }
    }
    return this;
  }
}
