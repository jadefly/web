<template>
  <div class="app-wrap">
    <router-view></router-view>
    <AuthCheck ref="authCheck"></AuthCheck>
  </div>
</template>

<style lang="less">
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

// Reset and dependencies
@import "~@/common/less/normalize.less";
@import "~@/common/less/iconfont.less";
@import "~@/common/less/iconfont-kds.less";

// Core CSS
@import "~@/common/less/type.less";
@import "~@/common/less/scaffolding.less";

// Components

// Components w/ JavaScript

// Utility classes
@import "~@/common/less/utilities.less";
html {
  overflow: hidden;
}

html,
body,
.app-wrap {
  height: 100%;
}

// 结算二级界面输入框中横线样式
.hello .vue-line {
  position: absolute;
  width: 0;
  height: 1px;
  background-color: #ffffff;
  transition: all .3s linear;
}
// 修改滚动条样式
::-webkit-scrollbar-track-piece {
  width: 5px;
  background-color: transparent;
}

::-webkit-scrollbar {
  width: 5px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  height: 50px;
  background: #999;
  border-radius: 3px;
}

.btn.active.focus, .btn.active:focus, .btn.focus, .btn:active.focus, .btn:active:focus, .btn:focus {
  outline: none;
}

.btn-primary {
  background-color: #039eac;
  border-color: #047d88;

  &:hover,
  &:focus,
  &:active,
  &:active:hover {
    background-color: #027a85;
    border-color: #047d88;
  }
}

.pos-vk{
  /*width:230px; */
  height:230px;
}

/* 键盘按钮样式 */
.pos-vk-btn{
  font-size: 20px;
  color: #333333;
  vertical-align: middle;
  cursor: pointer;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 4px;
  border-color: #c0c0c0;
}

.pos-vk-btn-number:hover,
.pos-vk-btn-number:focus,
.pos-vk-btn-number:active,
.pos-vk-btn-number.active,
.open .dropdown-toggle.pos-vk-btn-number,
.pos-vk-btn-text:hover,
.pos-vk-btn-text:focus,
.pos-vk-btn-text:active,
.pos-vk-btn-text.active,
.open .dropdown-toggle.pos-vk-btn-text,
.pos-vk-btn-qwe:hover,
.pos-vk-btn-qwe:focus,
.pos-vk-btn-qwe:active{
  color: #328cb1;
  background-color: #fff;
  border-color: #a6c5e2;
}

.pos-vk-btn:focus{
  outline: none;
}
/* 数字键盘区域 */
.pos-vk-number{
  position: relative;
  width:175px;
  height:230px;
  float:left;
}

.pos-vk-number.key-qwe {
  width: 586px;
}
.key-qwe-line1, key-qwe-line2 {
  padding: 15px 0 20px;
}
.pos-vk-number.key-qwe .pos-vk-btn-clear {
  /*width: 114px;注释css*/
  font-size: 20px;
}

/* 数字键盘按钮 */
.pos-vk-btn-number{
  width: 55px;
  height: 55px;
  margin-bottom: 3px;
  /*border-radius: 54.5px; 修改虚拟键盘css*/
}

/* 文字键盘按钮 */
.pos-vk-btn-text{
  width: 55px;
  height: 55px;
  margin-bottom:3px;
  /*border-radius: 54.5px 54.5px 54.5px 54.5px; 修改虚拟键盘css*/
  font-size: 17px;
  padding-top: 3px;
  line-height: 1;
}

.pos-vk-btn-qwe {
  width: 55px;
  height: 55px;
  border-radius: 5px;
  font-size: 18px;
  padding-top: 3px;
  line-height: 1;
}

.pos-vk-btn-lock {
  font-size: 24px;
}

.lock .pos-vk-btn-lock {
  color: #3871c4;
}

/* 清除按钮 */
.pos-vk-btn-clear{
  font-size: 20px;
}
/* 切换按钮 */
.pos-vk-btn-switch{
  font-size:15px;
}
/* 回车键盘区域 */
.pos-vk-enter{
  width:55px;
  height:230px;
  float:left;
}

/* 回车按钮 */
.pos-vk-btn-enter{
  width: 55px;
  height: 230px;
  font-size: 13px;
  /*border-radius: 54.5px;修改虚拟键盘css*/
}
/*** 登陆/开班键盘面板 */
.pos-numberpad{
 width:180px;
 height:230px;
 float:left;
}
.pos-enterpad{
  width:60px;
  height:230px;
  float:left;
}
.pos-keypad{
  width:250px;
  height:230px;
  margin: 13px;
}

/* Radial In */
.hvr-radial-in {
  display: inline-block;
  vertical-align: middle;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  box-shadow: 0 0 1px rgba(0, 0, 0, 0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -moz-osx-font-smoothing: grayscale;
  position: relative;
  overflow: hidden;
  background: #2098d1;
  -webkit-transition-property: color;
  transition-property: color;
  -webkit-transition-duration: 0.3s;
  transition-duration: 0.3s;
}
.hvr-radial-in:before {
  content: "";
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #e1e1e1;
  border-radius: 100%;
  -webkit-transform: scale(2);
  transform: scale(2);
  -webkit-transition-property: transform;
  transition-property: transform;
  -webkit-transition-duration: 0.3s;
  transition-duration: 0.3s;
  -webkit-transition-timing-function: ease-out;
  transition-timing-function: ease-out;
}
.hvr-radial-in:hover, .hvr-radial-in:focus, .hvr-radial-in:active {
  color: white;
}
.hvr-radial-in:hover:before, .hvr-radial-in:focus:before, .hvr-radial-in:active:before {
  -webkit-transform: scale(0);
  transform: scale(0);
}

input:read-only:focus {
  background-color: #e5e5e5;
}

.el-message,
.el-message-box__wrapper,
.ajax-loading {
  z-index: 999999 !important;
}

.el-dialog {
  margin-bottom: 36px;
}

</style>

<script>
import axios from 'axios';
import { find } from 'lodash';
import { mapGetters, mapMutations } from 'vuex';
import $ from 'jquery';
import { setup } from '@/locales/index';
import langTable from '@/common/dictionary/lang-table';

const AuthCheck = (resolve) => {
  import('@/components/Pos/AuthCheck').then((module) => {
    resolve(module);
  });
};

export default {
  components: {
    AuthCheck,
  },
  created() {
    this.loadConfig();
    this.$hotKey.init();
    $(document).on('click', '.ajax-loading', () => {
      if (this.config.showLoadingMessage) {
        this.$message.info(this.$t('Dict.LoadingMessage'));
      }
    });
    window.addEventListener('mousewheel', (e) => {
      if (e.deltaY === 1) {
        e.preventDefault();
      }
    });
  },
  mounted() {
    this.$von('posAuthCheck', (options) => {
      this.$refs.authCheck.open(options);
    }, true);
  },
  computed: {
    ...mapGetters(['config', 'locale']),
  },
  methods: {
    loadConfig() {
      axios.get('./static/config/index.json').then((data) => {
        this.setConfig(data.data);
      });
    },
    ...mapMutations({
      setConfig: 'SET_CONFIG',
    }),
  },
  watch: {
    locale: {
      handler(lang) {
        const finded = find(langTable, { lang });
        if (finded) {
          setup(finded.name);
        }
      },
    },
  },
};
</script>
