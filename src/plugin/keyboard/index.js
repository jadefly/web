import Vue from 'vue';
import * as KeyboardUtil from './util';
import KeyboardNum from './components/KeyboardNum.vue';
import KeyboardSwitch from './components/KeyboardSwitch.vue';
import DirectiveKeyboard from './keyboard-directive';

const KeyboardNumConstructor = Vue.extend(KeyboardNum);
const KeyboardSwitchConstructor = Vue.extend(KeyboardSwitch);
const keyboardNum = new KeyboardNumConstructor({
  el: document.createElement('div'),
});
const keyboardSwitch = new KeyboardSwitchConstructor({
  el: document.createElement('div'),
});

// 软键盘的状态参数
keyboardNum.isPopover = true;
keyboardNum.isClose = true;
keyboardSwitch.isPopover = true;

// window对象下挂载(保存), 当前聚焦的input对象
window.$_focusInput = null;

const keyboard = {};
// 文件已引入Vue,不用形参指向.代码优化注释
// keyboard.install = (Vue, options) => {
keyboard.install = () => {
  Vue.component('KeyboardNum', KeyboardNum);
  Vue.component('KeyboardSwitch', KeyboardSwitch);

  // document.body.appendChild(keyboardNum.$el); // 改为input元素后插入
  document.body.appendChild(keyboardSwitch.$el);
  document.body.addEventListener('focus', (ev) => {
    if (KeyboardUtil.isInput(ev.target)) {
      window.$_focusInput = ev.target;
    }
  }, true);

  Vue.directive('num-keyboard', DirectiveKeyboard(keyboardNum));
  Vue.directive('switch-keyboard', DirectiveKeyboard(keyboardSwitch));
};

export default keyboard;
