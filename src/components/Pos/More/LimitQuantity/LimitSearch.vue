<template>
  <div>
    <div class="limitsearch" v-switch-keyboard:top="keybordParams">
      <label for=""><i class="icon icon-search"></i></label>
      <input
        type="text"
        :placeholder="$t('Dict.QuickSearch')"
        maxlength="18"
        ref="input"
        v-model.trim="searchText"
        :id="idName + 'Search'"
        v-autotest
        v-judge
        @keydown="filterSomeEvent"
        @input="searchInputHandler"
      >
    </div>
  </div>
</template>
<script>
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import { deleteLastChar } from '@/plugin/keyboard/util';

export default {
  props: {
    idName: {
      type: String,
      default: 'limit',
    },
    // 结果集长度，为了做结果集长度为1后停止输入
    resultLength: {
      type: Number,
      default: 8,
    },
    focusSetKeyboardPosition: {
      type: String,
      default: 'top',
    },
  },
  // eslint-disable-next-line vue/no-unused-components
  components: { KeyBoard },
  data() {
    return {
      searchText: '',
    };
  },
  computed: {
    // 键盘参数
    keybordParams() {
      if (!this.$store.state.pos || !this.$store.state.pos.posBaseInfo) {
        return {
          focusSetKeyboardPosition: this.focusSetKeyboardPosition,
        };
      }
      return {
        letterType: this.$store.state.pos.posBaseInfo.isEnableQWEKeyboard ? 'full' : 'nine',
        focusSetKeyboardPosition: this.focusSetKeyboardPosition,
      };
    },
  },
  watch: {
    searchText(value) {
      // eslint-disable-next-line no-multi-assign
      const tmpText = this.searchText = value.replace(/[\u4E00-\u9FA5]/g, '').trim();
      this.$emit('search', tmpText);
    },
  },
  methods: {
    filterSomeEvent(e) {
      const { key } = e;
      // const searchMode = this.unSearchMode ? 3 : this.posSettings.searchMode;
      // if ((searchMode !== 3) && (/[^a-zA-Z0-9.()]/g.test(key))) {
      //   // 被干掉字符之后不要重新查询
      //   e.preventDefault();
      // }
      if (key === '+' || key === '-' || key === 'ArrowRight' || key === 'ArrowLeft' || key === 'ArrowDown' || key === 'ArrowUp') {
        e.preventDefault();
      }
    },
    searchInputHandler(e) {
      if (this.resultLength <= 0 && !e.isDelete) {
        this.searchText = deleteLastChar(this.searchText);
      }
    },
    searchTextClean() {
      this.searchText = '';
    },
    // 在没有焦点情况下添加文本
    addWordInBlur() {
      if (document.hasFocus() && document.activeElement === this.$refs.input) return;
      this.$refs.input.focus();
      // this.searchText = `${this.searchText}${key}`;
    },
    clearSearchText() {
      this.searchText = '';
    },
    // 在没有焦点情况下删除最后一个文本
    delWordInBlur() {
      if (document.hasFocus() && document.activeElement === this.$refs.input) return;
      this.searchText = deleteLastChar(this.searchText);
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.limitsearch{
  float: left;
  padding-left: 40px;
  background-color: rgba(255, 255, 255, 0.16);
  height: 36px;
  border-radius: 18px;
  background-color: #f5f5f5;
  border: 1px solid #b5b5b5;
  margin-top: 10px;
  margin-left: 16px;
  >label{
    position: absolute;
    left: 30px;
    top: 10px;
    width: 40px;
    height: 36px;
    padding-left: 10px;
    text-align: center;
    line-height: 36px;
    color: #ccc;
  }
  >input{
    display: block;
    width: 100%;
    height: 36px;
    border: none;
    background: none;
    padding-left: 3px;
    padding-right: 10px;
    color: #666;
    font-size: 12px;
  }
}

.pull-left .limitsearch {
  margin-left: 0;
  margin-top: 0;

  > label {
    top: 0;
    left: 12px;
  }
}
</style>
