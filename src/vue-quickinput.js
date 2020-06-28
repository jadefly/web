import { each } from 'lodash';
import $ from 'jquery';

const VueQuickInput = {};
const keyCodeMap = {
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
  65: 'a',
  66: 'b',
  67: 'c',
  68: 'd',
  69: 'e',
  70: 'f',
  71: 'g',
  72: 'h',
  73: 'i',
  74: 'j',
  75: 'k',
  76: 'l',
  77: 'm',
  78: 'n',
  79: 'o',
  80: 'p',
  81: 'q',
  82: 'r',
  83: 's',
  84: 't',
  85: 'u',
  86: 'v',
  87: 'w',
  88: 'x',
  89: 'y',
  90: 'z',
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
};
VueQuickInput.install = (Vue) => {
  let start = 0;
  let end = 0;
  let str = [];
  const callbackList = [];
  $(window).on('keydown', (event) => {
    if (callbackList.length) {
      if (!start) {
        start = parseInt(event.timeStamp, 0);
        setTimeout(() => {
          start = 0;
          str = [];
          document.cookie = 'isScanCode=false;';   // 这里是为了模糊查询下扫码加单后清空搜索框
        }, 500);
      }
      if (event.keyCode === 13) {
        end = parseInt(event.timeStamp, 0);
        if (end - start < 500 && str.length) {
          document.cookie = 'isScanCode=true;';   // 这里是为了模糊查询下扫码加单后清空搜索框
          each(callbackList, (callback) => {
            callback(str.join(''));
          });
        }
        start = 0;
        end = 0;
        str = [];
      } else {
        str.push(keyCodeMap[event.keyCode]);
      }
    }
  });
  Vue.prototype.$quickinput = (callback) => {
    callbackList.push(callback);
  };
};

export default VueQuickInput;
