import Vue from 'vue';
import $ from 'jquery';
import VideoPlayer from 'vue-video-player';
import ElementUI from 'element-ui';
import VueEvent from './vue-event';
import directives from './directives';
import VueKeyboard from './vue-keyboard';
import VueLine from './vue-line';
import VueJudge from './vue-judge';
import VueDevices from './vue-devices';
import VueHotkey from './vue-hotkey';
import VueNumberFormat from './vue-numberformat';
import VueLog from './vue-log';
import '../theme/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import router from './router';
import store from './store';
import KeyboardPlugin from './plugin/keyboard';
import ElementHotfix from './plugin/element-hotfix';
import ElementInput from './plugin/element-input';
import '@/common/js/log4web';
import '@/common/js/crmDependencies';
import 'bootstrap/dist/js/bootstrap.min';
import AutoTest from './vue-autotest';
import QuickInput from './vue-quickinput';
import i18n from './locales';
import 'icheck';
import VueTcsl from './vue-tcsl';

import 'icheck/skins/all.css';
// import zh_CN from 'vee-validate/dist/locale/zh_CN'
// import VeeValidate from 'vee-validate'

// eslint-disable-next-line import/no-extraneous-dependencies
require('video.js/dist/video-js.css');
require('vue-video-player/src/custom-theme.css');

// require('icheck/skins/all.css')
Vue.use(VideoPlayer);
Vue.use(ElementUI, { zIndex: 500 });
Vue.use(VueEvent);
Vue.use(directives);
Vue.use(VueKeyboard);
Vue.use(VueLine);
Vue.use(VueJudge);
Vue.use(VueDevices);
Vue.use(VueNumberFormat);
Vue.use(KeyboardPlugin);
Vue.use(ElementHotfix);
Vue.use(VueHotkey);
Vue.use(VueLog);
Vue.use(AutoTest);
Vue.use(QuickInput);
Vue.use(ElementInput);
Vue.use(VueTcsl);
// Validator.addLocale(zh_CN);
// Validator.extend('inputRule', {
//   messages: {
//     zh_CN:field => '请输入正确数字,输入值不能超过999999.99,并且小数不能超过2位'
//   },
//   validate: value => {
//     let inputTest = /^[0-9]{0,6}(\.[0-9]{1,2})?$/g;
//     return inputTest.test(value);
//   }
// });
// const config = {
//   delay: 0,
//   locale: 'zh_CN',
//   strict: true,
//   events: 'blur',
//   inject: true
// };
// Vue.use(VeeValidate, config);

// eslint-disable-next-line no-undef
log4web.config({
  debug: 0,
  level: 'debug',
  tagFilter: '',
  post: 1,
  postContextInfo: 1,
  postUrl: `${process.env.API_PATH}/canyin/uilog/uilog/printlog`,
});

window.$ = $;

// 注册页面全局绑定点击事件, 执行传入回调: 其他组件, 只需要在 mounted(){this.globalClick(this.本组件执行的事件方法);}
Vue.prototype.globalClick = (callback) => {
  window.addEventListener('click', callback);
};
const vm = new Vue({
  el: '#app',
  i18n,
  router,
  store,
  render: h => h(App),
});
Vue.use({
  vm,
});
