import {
  extend, each, find, concat,
} from 'lodash';
import { Notification } from 'element-ui';
import { Base64 } from 'js-base64';
import WS from './WS';

// 设备管理器版本
import Version from '../devices/Version';
// 客显
import CDI from '../devices/CDI';
// 指纹识别
import Fingerprint from '../devices/Fingerprint';
// 钱箱
import Cashbox from '../devices/Cashbox';
// 打印机
import Printer from '../devices/Printer';
// 来电显示
import IncomingTel from '../devices/IncomingTel';
// 电子秤
import Scale from '../devices/Scale';
// 智能餐盘
import ETag from '../devices/ETag';
// 手写输入
import Handwriting from '../devices/Handwriting';
// 副屏
import SubMonitor from '../devices/SubMonitor';
// 读卡器
import Cardop from '../devices/Cardop';
// 关机控制
import Shutdown from '../devices/Shutdown';
// 表格打印
import XLSPrint from '../devices/XLSPrint';
// 叫号屏
import CallNumberScreen from '../devices/CallNumberScreen';
// 快捷操作
import DesktopButton from '../devices/DesktopButton';
// 多键盘
import Keyboard from '../devices/Keyboard';

function guid() {
  const a = () => Math.floor(Math.random() * 65536).toString(16);
  return (a() + a() + a() + a() + a() + a() + a() + a());
}

const DevicesList = {
  Fingerprint,
  Version,
  CDI,
  Cashbox,
  Printer,
  IncomingTel,
  Scale,
  ETag,
  Handwriting,
  SubMonitor,
  Cardop,
  Shutdown,
  XLSPrint,
  CallNumberScreen,
  DesktopButton,
  Keyboard,
};

export default class Devices {
  constructor(settings) {
    const defaults = {
      ip: '127.0.0.1',
      port: '5414',
      protocal: 'esegece.com',
      start: true,
      onOpen: null,
      onError: null,
    };
    this.settings = {};
    this.ws = null;
    this.queueList = [];
    this.retainList = [];
    this.settings = extend(defaults, settings);
    this.retryNotify = null;
    if (this.settings.start) {
      this.start();
    }
  }

  setting(settings) {
    if (settings) {
      this.settings = extend(this.settings, settings);
    }
  }

  start() {
    this.loadDevices(() => {
      this.initWebSocket();
    });
  }

  //
  loadDevices(callback) {
    each(DevicesList, (Device, deviceName) => {
      this[deviceName] = new Device(this);
    });
    if (callback) {
      callback();
    }
  }

  initWebSocket() {
    if (this.retryNotify) {
      this.retryNotify.close();
      this.retryNotify = null;
    }
    window.resetDeviceMgr = () => {
      console.log('设备管理器发来消息，它启动成功了');
      this.close();
      this.initWebSocket();
    };
    if (window.WebSocket) {
      const options = {
        protocal: this.settings.protocal,
        enableHealth: false,
        // healthInterval: 10000,
        // healthTimeout: 15000,
        open: () => {
          if (this.settings.onOpen) {
            this.settings.onOpen();
          }
        },
        // retry: () => {
        //   Notification.closeAll();
        //   this.retryNotify = Notification.warning({
        //     title: '设备管理器正在重新启动，请稍后',
        //     position: 'bottom-right',
        //     duration: 0,
        //     onClick() {
        //       this.close();
        //       this.retryNotify = null;
        //     },
        //   });
        //   console.info('TCSLCMD=ResetDeviceMgr');
        // },
        message: (data) => {
          this.message(data);
        },
        error: () => {
          if (this.settings.onError) {
            this.settings.onError();
          }
        },
      };
      if (this.ws) {
        if (this.ws.state === 'closed') {
          this.ws = new WS(`ws://${this.settings.ip}:${this.settings.port}`, options);
        }
      } else {
        this.ws = new WS(`ws://${this.settings.ip}:${this.settings.port}`, options);
      }
    }
  }

  send(module, method, data, retain = false, isString = false) {
    if (this.ws.state === 'open') {
      const uid = guid();
      let paramsData = data;
      if (!isString) {
        paramsData = JSON.stringify(data || (Object.is(+data, 0) ? data : 0));
      }
      this.ws.send(JSON.stringify({
        jsonrpc: '2.0',
        id: uid,
        method,
        params: { v: Base64.encode(paramsData) },
      }));
      if (retain) {
        this.retainList.push({
          module,
          uid,
        });
      } else {
        this.queueList.push({
          module,
          uid,
        });
      }
      if (this.queueList.length > 50) {
        this.queueList.shift();
      }
      return uid;
    }
    return false;
  }

  message(data) {
    let findList = this.queueList;
    if (this.retainList.length) {
      findList = concat(this.retainList, this.queueList);
    }
    if (data.id) {
      const finded = find(findList, { uid: data.id });
      if (finded) {
        const item = this[finded.module];
        if (item) {
          item.message(data.id, data.result);
        }
      }
    } else if (data.moduleName) {
      const finded = find(findList, { module: data.moduleName });
      if (finded) {
        const item = this[finded.module];
        if (item) {
          item.message(data);
        }
      }
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}
