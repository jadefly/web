export default class IncomingTel {
  constructor(controller) {
    this.controller = controller;
    this.name = 'IncomingTel';
    this.callback = null;
  }

  // 初始化时打开, 电话盒设备类型参数: IT =1 纽曼,IT = 2 海风,IT = 3 子佩. DT不在使用, 写死为0
  open(callback, param) {
    this.$log.info(`来电显示初始化open参数:${param};来电显示初始加载回调:${callback}`);
    this.tempId = this.controller.send(this.name, 'tcsl.IncomingTel.cy7_open', {
      IT: param && param !== '0' ? +param : 1,
      DT: 0,
    }, true);
    if (callback) {
      this.callback = callback;
    }
  }

  message(id, data) {
    this.$log.info(`来电显示初始化-加载的msg信息:${data}`);
    if (data['IncomingTel.RD']) {
      let str = data['IncomingTel.RD'];
      if (str.length === 12 && str[0] === '0' && str[1] === '1') {
        const strArr = str.split('');
        strArr.splice(0, 1);
        str = strArr.join('');
      }
      this.callback(str);
    }
  }
}
