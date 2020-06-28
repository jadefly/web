/* eslint-disable no-underscore-dangle */
import { each } from 'lodash';
/* 快捷键说明:
 * 快捷生效模块命名规范:
 *  1.路由模块-执行this.$hotKey.set('ModuleName', {'F9': ()=>{...callback() }}). ModuleName:'Pos.order'
 *  2.弹窗模块-执行Dialog name=ModuleName,并传入:hotkeys='callbackObj'. ModuleName:'PosDialog.settlement'
 *  3.说明-初始设计为键盘的'down'事件,后增加了'up'事件(本不应该使用),所有快捷键均变成了两次触发(down和up)方法会被调用两次, 目前暂不做处理.
 *  4.快捷键绑定模块名的移除： 因结算业务'主结算'页面 先于 '结算方式'(结算完成后关闭) 关闭，导致挂载在结算页面DOM树上的，各个'结算方式'分支DOM节点，均被销毁
 *       判断传入'结算页面'且执行关闭，'结算页面'挂载的各种结算方式同'结算页面'，均删除快捷键绑定名。
 */

/* 按键字典
 * 主键盘: 大写和小写字母, 数字键, 功能键
 * 小键盘: 数字键,功能键
 * F功能键
 * Ctrl-添加'.ctrl', Shift-添加'.alt'
 */
const KEYCODE = {
  // 65: "a", 66: "b", 67: "c", 68: "d", 69: "e", 70: "f", 71: "g",
  // 72: "h", 73: "i", 74: "j", 75: "k", 76: "l", 77: "m", 78: "n",
  // 79: "o", 80: "p", 81: "q", 82: "r", 83: "s", 84: "t", 85: "u",
  // 86: "v", 87: "w", 88: "x", 89: "y", 90: "z",
  65: 'A',
  66: 'B',
  67: 'C',
  68: 'D',
  69: 'E',
  70: 'F',
  71: 'G',
  72: 'H',
  73: 'I',
  74: 'J',
  75: 'K',
  76: 'L',
  77: 'M',
  78: 'N',
  79: 'O',
  80: 'P',
  81: 'Q',
  82: 'R',
  83: 'S',
  84: 'T',
  85: 'U',
  86: 'V',
  87: 'W',
  88: 'X',
  89: 'Y',
  90: 'Z',
  // 主键盘数字键
  48: '0',
  49: '1',
  50: '2',
  51: '3',
  52: '4',
  53: '5',
  54: '6',
  55: '7',
  56: '8',
  57: '9',
  // 小键盘数字键
  96: '0',
  97: '1',
  98: '2',
  99: '3',
  100: '4',
  101: '5',
  102: '6',
  103: '7',
  104: '8',
  105: '9',
  // 功能键
  16: 'Shift',
  17: 'Ctrl',
  18: 'Alt',
  // 主键盘其他
  8: 'BackSpace',
  9: 'Tab',
  13: 'Enter',
  27: 'Esc',
  32: 'Space',
  33: 'PgUp',
  34: 'PgDn',
  35: 'End',
  36: 'Home',
  45: 'Insert',
  187: '+',
  189: '-',
  188: ',',
  190: '.',
  191: '/',
  219: '{',
  220: '|',
  221: '}',
  // 小键盘其他
  108: 'Enter',
  106: '*',
  107: '+',
  109: '-',
  110: '.',
  111: '/',
  // F功能键
  112: 'F1',
  113: 'F2',
  114: 'F3',
  115: 'F4',
  116: 'F5',
  117: 'F6',
  118: 'F7',
  119: 'F8',
  120: 'F9',
  121: 'F10',
  122: 'F11',
  123: 'F12',
  38: '↑',
  40: '↓',
  37: '←',
  39: '→',
};

/* 快捷键构建类 */
export default class HotKey {
  constructor() {
    // 快捷键 存储'执行回调'的对象
    this.hotkeys = {};
    // 快捷键 模块名称合集
    this.modules = [];
    // this.currentModule = null
    this.uphotkeys = {};
  }

  static isStop = false

  stop() {
    this.constructor.isStop = true;
  }

  start() {
    this.constructor.isStop = false;
  }

  // 初始化
  init() {
    document.onkeydown = (event) => {
      // 获取事件相关属性, 阻止浏览器 BackSpace键,返回url
      let _vReadOnly;
      let _vDisabled;
      const _obj = event.target || event.srcElement;
      const _t = _obj.type || _obj.getAttribute('type');
      _vReadOnly = _obj.readOnly;
      _vDisabled = _obj.disabled;
      // 处理undefined值情况
      _vReadOnly = (_vReadOnly == undefined) ? false : _vReadOnly;
      _vDisabled = (_vDisabled == undefined) ? true : _vDisabled;
      // 事件源类型为密码或单行、多行文本的，并且readOnly属性为true或disabled属性为true的，则退格键失效
      const _flag1 = (_t === 'password' || _t === 'text' || _t === 'textarea' || _t === 'number')
        && (_vReadOnly === true || _vDisabled === true);
      // 当敲Backspace键时，事件源类型非密码或单行、多行文本的，则退格键失效
      const _flag2 = _t !== 'password' && _t !== 'text' && _t !== 'textarea' && _t !== 'number';

      // 屏蔽input和textarea的Enter键默认事件, 同时屏蔽button按钮的Enter
      if (event.keyCode === 13 || (event.keyCode === 13 && $(event.target).is('button'))) {
        // 但是 恢复 饿了么的弹框组件的确认按钮,所需要的回车键功能恢复,从这加一个判断条件如果是饿么的组件就不屏蔽
        if (!$(event.target).hasClass('el-button')) {
          event.preventDefault();
        }
      }
      // 屏蔽 F1~F11案件的浏览器默认事件
      // 键盘按下 Ctrl + F1~F6 时触发
      // BackSpace键入非input或textarea(或状态为readOnly,disabled), 阻止url返回
      if (
        event.keyCode >= 112 && event.keyCode <= 122
        || (event.keyCode >= 112 && event.keyCode <= 117 && event.ctrlKey)
        || (event.keyCode == 8 && (_flag1 || _flag2))
      ) {
        event.preventDefault();
      }
      // 执行事件触发
      this.trigger(event);
    };
    document.onkeyup = (event) => {
      this.trigger(event, 'up');
    };
  }

  // 设置模块名及回调(执行方法)
  set(moduleName, options, type = 'down') {
    const index = this.modules.indexOf(moduleName);
    if (index != -1) {
      this.modules.splice(index, 1);
    }
    this.modules.push(moduleName);
    if (type === 'down') {
      if (options) {
        each(options, (handler, name) => {
          this.hotkeys[`${moduleName}.${name}`] = handler;
        });
      }
    } else if (type === 'up') {
      if (options) {
        each(options, (handler, name) => {
          this.uphotkeys[`${moduleName}.${name}`] = handler;
        });
      }
    }
  }

  // 模块名匹配方法
  // name-键盘事件名, callback-回调
  findMethod(name, callback, moduleName = null, type = 'down') {
    if (this.modules.length) {
      let curModule = this.modules[this.modules.length - 1];
      // 如果moduleName存在了并且缓存的模板数据最后一个不是它就使用存在的
      if (!!moduleName && moduleName !== curModule) {
        const findModuleIndex = this.modules.indexOf(moduleName);
        if (findModuleIndex !== -1) {
          this.modules.splice(findModuleIndex + 1);
          curModule = moduleName;
        }
      }
      const method = `${curModule}.${name}`;
      console.log(method);
      let hotkeys = {};
      if (type === 'down') {
        hotkeys = this.hotkeys;
      } else if (type === 'up') {
        hotkeys = this.uphotkeys;
      }
      if (hotkeys[method]) {
        callback(hotkeys[method]);
      } else if (curModule.length) {
        const modules = curModule.split('.');
        modules.pop();
        const prevMethod = `${modules.join('.')}.${name}`;
        if (hotkeys[prevMethod]) {
          callback(hotkeys[prevMethod]);
        }
      }
    }
  }

  // 事件触发方法
  trigger(event, type = 'down') {
    const moduleName = event.target.getAttribute('hotkeymodulename');
    if (this.constructor.isStop || $('.el-message-box__wrapper:visible').length) {
      return;
    }
    this.findMethod(
      KEYCODE[event.keyCode] + (event.ctrlKey ? '.ctrl' : '') + (event.altKey ? '.alt' : ''),
      (handler) => {
        handler(event);
      },
      moduleName,
      type,
    );
  }

  // 移除关闭模块(基于模块名)
  removeCurrentModule(name) {
    // if (this.modules[this.modules.length-1] == name) {
    //   this.modules.pop();
    // }
    // 废弃上面方法：因结算业务'主结算'页面 先于 '结算方式'(结算完成后关闭) 关闭，导致挂载在结算页面DOM树上的，各个'结算方式'分支DOM节点，均被销毁
    // 判断传入'结算页面'且执行关闭，'结算页面'挂载的各种结算方式同'结算页面'，均删除快捷键绑定名
    if (this.modules[this.modules.length - 1] == name) {
      this.modules.pop();
    }
    if (name.indexOf('AddPayHotkey') != -1) {
      this.modules.forEach((item, index, arr) => {
        item == name && arr.splice(index, arr.length - 1);
      });
    }
  }

  /**
   * 清楚绑定快捷键(基于已缓存的快捷执行的内存数据)
   * 说明: 此方法只适用于,重新绑定相同模块的快捷键,发生了变化(有已存快捷键不能触发的情况),执行删除
   * 目前适用于结算(活动方案)业务,其他业务慎用!!!
   */
  clearBoundOperation(moduleName, options) {
    delete this.hotkeys[moduleName];
  }

  // setCurrentModule(name) {
  //   let parentModule = this.getCurrentModule()
  //   this.currentModule = name
  //   // this.currentModule = this.modules[this.modules.length - 1]
  //   return parentModule
  // }
  // getCurrentModule() {
  //   return this.currentModule
  // }
}
