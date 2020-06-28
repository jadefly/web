/**
 * 触发(虚拟)按键事件
 * @param {*} type 事件类型
 * @param {*} keycode 键码值
 * @param {*} element 绑定的元素对象
 */
function disatchKeyEvent(type, keycode, element) {
  const evtObj = document.createEvent('UIEvents');
  Object.defineProperty(evtObj, 'keyCode', {
    get() { return this.keyCodeVal; },
  });
  Object.defineProperty(evtObj, 'which', {
    get() { return this.keyCodeVal; },
  });
  evtObj.initUIEvent(type, true, true);
  evtObj.keyCodeVal = keycode;
  element.dispatchEvent(evtObj);
}

/**
 * 检测是否为输入框
 */
export function isInput(element) {
  // if (element.tagName === 'INPUT' && !element.readOnly
  if (element.tagName === 'INPUT'
    && (element.type === 'text'
      || element.type === 'password'
      || element.type === 'email'
      || element.type === 'tel'
      || element.type === 'url'
      || element.type === 'number')) {
    return true;
  } if (element.tagName === 'TEXTAREA') {
    return true;
  }
  return false;
}

/**
 * 删除最后一个字符，如果最后一个字符是闭合的括号，则删除整个闭合括号
 */
export function deleteLastChar(str) {
  if (str.length <= 0) return '';
  // 字符串最后一个为反括号，并且之前字符串中包含正括号，则删除括号内的内容;否则删除最后一个字符
  if (str.lastIndexOf(')') === (str.length - 1) && str.lastIndexOf('(') >= 0) {
    return str.slice(0, str.lastIndexOf('('));
  }
  return str.slice(0, str.length - 1);
}

export function getLastChar(str) {
  if (str.length <= 0) return '';
  if (str.lastIndexOf(')') === (str.length - 1) && str.lastIndexOf('(') >= 0) {
    return str.slice(str.lastIndexOf('('), str.length);
  }
  return str.charAt(str.length - 1);
}

/**
 * 触发输入事件
 */
export function dispatchInputEvent(element) {
  const event = document.createEvent('HTMLEvents');
  event.initEvent('input', true, true);
  if (element.isDelete) {
    event.isDelete = true;
    element.isDelete = false;
  }
  element.dispatchEvent(event);
}

/**
 * 触发修改事件
 */
export function dispatchChangeEvent(element) {
  const event2 = document.createEvent('HTMLEvents');
  event2.initEvent('change', true, true);
  element.dispatchEvent(event2);
}

/**
 * 触发回车事件
 */
export function dispatchEnterEvent(element) {
  disatchKeyEvent('keydown', 13, element);
  disatchKeyEvent('keyup', 13, element);
}

// 输入框css选择器
export const INPUT_SELECTOR = 'textarea,input[type=text]:not([prefixicon=el-icon-date]),input[type=password],input[type=email],input[type=tel],input[type=url],input[type=number]';
