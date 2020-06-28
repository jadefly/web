<template>
  <div class="pos-order-tables-search-wrap">
    <div class="pos-order-tables-search" v-switch-keyboard:top-left-kds="keybordParams">
      <slot name="model"></slot>
      <label for=""><i class="icon icon-search"></i></label>
      <input
        type="text"
        :readOnly="!isReadOnly"
        :showPanel="showPanel"
         clearable
        :placeholder="placeholderText"
        ref="input"
        maxlength="25"
        v-model="searchText"
        :id="searchId"
        autocomplete="off"
        v-autotest
        @focus="showAndroidInput('searchText',isReadOnly)"
        @keydown="filterSomeEvent"
        @input="searchInputHandler">
      <i class="el-icon-circle-close my-style" v-show="clearable"
      @click = "clearAble" @mouseover="clearable = true"></i>
    </div>
    <div :id="clearSearchTextId" @click="clearSearchText"></div>
    <AndroidInput ref="AndroidInput"></AndroidInput>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { debounce } from 'lodash';
import * as KeyboardUtil from '@/plugin/keyboard/util';
import AndroidInput from '@/components/Pos/Common/AndroidInput';
import AndroidInputMixin from '@/components/Pos/Common/AndroidInputMixin';

export default {
  model: {
    prop: 'duplexValue',
    event: 'change',
  },
  mixins: [AndroidInputMixin],
  components: {
    AndroidInput,
  },
  data() {
    return {
      searchText: '',
      // 任何点菜的操作都会让combo变为true，
      // 如果是true的话再输入的时候就应该清空重新查找。
      combo: false,
      model: 1,
      clearable: false,
      isReadOnly: false, // 非安卓下可以输入
      timeStart: '',
      timeEnd: '',
      isEnterAdd: false,
    };
  },
  props: {
    placeholderText: {
      type: String,
      default() {
        return this.$t('Dict.QuickSearch');
      },
    },
    duplexValue: {},
    searchId: {
      type: String,
      default: null,
    },
    showPanel: {
      type: Boolean,
      default: false,
    },
    focusSetKeyboardPosition: {
      type: String,
      default: '',
    },
    defaultKeyBoardPage: {
      type: Number,
      default: 0,
    },
    // 仅支持汉字类精准搜索传true，用于客位、菜品以外的组件
    unSearchMode: {
      type: Boolean,
      default: false,
    },
    scanCode: {
      type: Boolean,
      default: false,
    },
    shouldSetHotKey: { // 0 是默认，1是快餐，2是中餐
      type: Number,
      default: 0,
    },
    // 结果集长度，为了做结果集长度为1后停止输入
    resultLength: {
      type: Number,
      default: 8,
    },
  },
  created() {
    // 安卓下
    if (window.browser.isAndroid() || window.browser.isIPad()) {
      if (+this.searchModel === 3 && this.showPanel) {
        this.isReadOnly = true;
      } else {
        this.isReadOnly = false;
      }
    } else {
      this.isReadOnly = true;
    }
    this.$von('clearSearch', () => {
      this.clearSearchText();
    });
  },
  mounted() {
    this.$nextTick(() => {
      this.searchText = this.duplexValue ? this.duplexValue : '';
    });
    this.$von('combo', () => {
      if (this.posSettings.isAutoClearKey) {
        this.searchText = '';
      } else {
        this.combo = true;
      }
    });
    this.$von('clearSearchText', () => {
      this.searchText = '';
    });
    this.initHotKeys();
    // 以下的判断是，如果开启了模糊下的精准查询并且是 加单界面的search组件+this.shouldSetHotKey
    // 才执行节流方式，来提高模糊下的扫码加单的速度
    if (this.posSettings.isAllowDarkScan && +this.shouldSetHotKey) {
      this.searchDaly = debounce(this.searchDaly, 200);
    }
    const inputEL = this.$refs.input;
    inputEL.addEventListener('focus', this.onFocus, false);
    inputEL.addEventListener('blur', this.onBlur, false);
    inputEL.addEventListener('keydown', (e) => {
      if (e.keyCode === 13) inputEL.blur();
    }, false);
  },
  watch: {
    duplexValue(val) {
      this.searchText = val || '';
    },
    searchModel(data) {
      // 安卓下
      if (window.browser.isAndroid() || window.browser.isIPad()) {
        if (this.showPanel) {
          if (data === 3) {
            this.isReadOnly = true;
          } else {
            this.isReadOnly = false;
          }
        } else {
          this.isReadOnly = false;
        }
      }
    },
    // searchText: debounce(function (value, oldValue) {
    //   this.$emit('search', value);
    //   this.$emit('change', value);
    // }, 200),
    searchText() {
      // 是否开启了模糊下的精准
      const { isAllowDarkScan } = this.posSettings;
      // 如果是进行才可以执行enter回车加单事件
      if (isAllowDarkScan) {
        this.isEnterAdd = true;
        this.searchDaly();
      } else {
        this.isEnterAdd = false;
        this.searchDaly();
      }
    },
  },
  computed: {
    clearSearchTextId() {
      const caseSearchId = `${this.searchId}`.substring(0, 1).toUpperCase() + `${this.searchId}`.substring(1);
      return `clear${caseSearchId}`;
    },
    ...mapGetters(['posSettings', 'searchModel']),
    // 键盘参数
    keybordParams() {
      return (
        {
          model: this.model,
          letterType: 'full',
          defaultKeyBoardPage: this.defaultKeyBoardPage,
          focusSetKeyboardPosition: this.focusSetKeyboardPosition,
        }
      );
    },
  },
  methods: {
    onFocus(params) {
      this.$emit('onFocus', params);
    },
    onBlur(params) {
      this.$emit('onBlur', params);
    },
    searchDaly() {
      this.$emit('search', this.searchText);
      this.$emit('change', this.searchText);
      this.isEnterAdd = false;
    },
    filterSomeEvent(e) {
      const { key } = e;
      if (key === '+' || key === '-' || key === 'ArrowRight' || key === 'ArrowLeft' || key === 'ArrowDown' || key === 'ArrowUp') {
        e.preventDefault();
      }
    },
    searchInputHandler(e) {
      const { value } = e.target;
      // 以下的代码是发现聚焦的时候删除到空的时候没有给this.searchText 赋值
      if (value === '') {
        this.searchText = value;
      }
      const searchMode = this.unSearchMode ? 3 : this.posSettings.searchMode;
      if ((searchMode !== 3) && (/[^a-zA-Z0-9.()]/g.test(value))) {
        // 被干掉字符之后不要重新查询
        return 0;
      }
      if (this.combo) {
        this.combo = false;
        this.searchText = value.charAt(value.length - 1);
        return 0;
      }
      try {
        if (value !== '') {
          if (searchMode !== 3) {
            // 干掉无用的字符
            this.searchText = value.match(/[a-zA-Z0-9.()]/g).join('');
          } else {
            this.searchText = value;
          }
          if (this.resultLength <= 1 && !e.isDelete) {
            this.searchText = KeyboardUtil.deleteLastChar(this.searchText);
          }
        }
      } catch (err) {
        this.searchText = '';
        return 0;
      }
      return this.searchText;
    },
    initHotKeys() {
      if (!this.shouldSetHotKey) return;
      let str = '';
      switch (+this.shouldSetHotKey) {
        case 1:
          str = 'fastFood';
          break;
        case 2:
          str = 'Ordering';
          break;
        default:
          break;
      }
      this.$hotKey.set(`Pos.${str}`, {
        Enter: () => {
          if (this.isEnterAdd) {
            this.$emit('search', this.searchText);
          }
          this.$emit('enter');
        },
      });
    },
    clearSearchText() {
      this.searchText = '';
    },
    clearAble() {
      this.searchText = '';
      this.clearable = false;
    },
    // 在没有焦点情况下添加文本
    addWordInBlur() {
      if (document.hasFocus() && document.activeElement === this.$refs.input) return;
      this.$refs.input.focus();
    },
    // 在没有焦点情况下删除最后一个文本
    delWordInBlur() {
      if (document.hasFocus() && document.activeElement === this.$refs.input) return;
      this.searchText = KeyboardUtil.deleteLastChar(this.searchText);
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

@pos-order-tables-search-height: @pos-order-tables-control-height;
@pos-order-tables-search-icon-width: 30px;
@pos-order-tables-search-padding-horizontal: 10px;
@pos-order-tables-search-color: #273844;
@pos-order-tables-search-icon-size: 20px;
@pos-order-tables-search-input-padding-left: 3px;
@pos-order-tables-search-input-font-size: 12px;
.pos-order-tables-search-wrap {
  position: relative;
  flex: 1;
  .pos-order-tables-search {
    float: left;
    /*<!--padding-left: @pos-order-tables-search-padding-horizontal;-->*/
    // background-color: rgba(237, 254, 255, 0.5);
    background-color: #2d303e;
    height: @pos-order-tables-search-height;
    border-radius: @pos-order-tables-search-height / 2;
    display: flex;
    align-items: center;
    > div {
      display: flex;
      /*width: 240px;*/
    }
    > label {
      // position: absolute;
      // left: 0;
      // top: 0;
      .size(@pos-order-tables-search-icon-width + @pos-order-tables-search-padding-horizontal,
      @pos-order-tables-search-height);
      padding-left: @pos-order-tables-search-padding-horizontal;
      text-align: center;
      line-height: @pos-order-tables-search-height;
      color: @pos-order-tables-search-color;

      > i.icon {
        font-size: @pos-order-tables-search-icon-size;
        color: #6E7389;
      }
    }

    > input {
      display: block;
      .size(100%, @pos-order-tables-search-height);
      border: none;
      background: none;
      padding-left: @pos-order-tables-search-input-padding-left;
      padding-right: @pos-order-tables-search-padding-horizontal;
      // color: @pos-order-tables-search-color;
      color: #ffffff;
      font-size: @pos-order-tables-search-input-font-size;
      width: 140px;

      &::-webkit-input-placeholder{
        color: rgb(200, 200, 200);
      }
    }
    > .my-style {
      position: absolute;
      left: 350px;
      z-index: 999;
      cursor: pointer;
      color: gray;
      transition: all .3s;
    }
  }
}
</style>
