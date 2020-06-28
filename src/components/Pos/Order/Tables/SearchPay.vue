<template>
  <div class="pos-order-tables-search-wrap">
    <div
      class="pos-order-tables-search"
      v-switch-keyboard:left-left="keybordParams">
      <slot name="model"></slot>
      <label for=""><i class="icon icon-search"></i></label>
      <input
        :id="searchId"
        :showPanel="showPanel"
        :placeholder="placeholderText"
        v-on:focus="toggleInputClear"
        ref="input"
        type="text"
        maxlength="25"
        v-model.trim="searchText"
        autocomplete="off"
        clearable
        v-autotest>
      <i
        class="el-icon-circle-close my-style"
        v-show="clearable"
        @click= "clearAble"
        @mouseover="clearable = true"></i>
    </div>
  </div>
</template>

<script>
import * as KeyboardUtil from '@/plugin/keyboard/util';
import { mapGetters, mapActions } from 'vuex';

export default {
  model: {
    prop: 'duplexValue',
    event: 'change',
  },
  data() {
    return {
      searchText: '',
      // 任何点菜的操作都会让combo变为true，
      // 如果是true的话再输入的时候就应该清空重新查找。
      combo: false,
      model: 1,
      clearable: false,
      // 键盘参数
      keybordParams: {
        letterType: 'nine',
      },
    };
  },
  props: {
    placeholderText: {
      type: String,
      default() {
        return this.$t('Biz.Order.SearchPayWay');
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
  },
  created() {
    // this.$vonce('clearSearch', () => {
    //   this.clearSearchText();
    // });
  },
  mounted() {
    this.$nextTick(() => {
      this.searchText = this.duplexValue ? this.duplexValue : '';
    });
    // this.$von('combo', () => {
    //   if (this.posSettings.isAutoClearKey) {
    //     this.searchText = '';
    //   } else {
    //     this.combo = true;
    //   }
    // });
    // this.$vonce('clearSearchText', () => {
    //   this.searchText = '';
    // });
    // 挂载-搜索框及软键盘-功能重置方法
    this.$vonce('cancelSearchPaywayFocusBus', () => {
      this.cancelSearchPaywayFocus();
    });
    // 清空-结算方式-搜索input内容
    this.$vonce('resetSearchPayText', () => {
      this.searchText = '';
    });
  },
  watch: {
    duplexValue(val) {
      this.searchText = val || '';
    },
    searchText(value, oldValue) {
      const { searchMode } = this.posSettings;
      if ((searchMode !== 3) && (/[^a-zA-Z0-9.()]/g.test(oldValue))) {
        // 被干掉字符之后不要重新查询
        return 0;
      }
      if (this.combo) {
        this.combo = false;
        if (value !== value.replace(oldValue, '')) {
          this.searchText = value.replace(oldValue, '');
          return 0;
        }
      }
      try {
        if (value !== '') {
          if (searchMode !== 3) {
            // 干掉无用的字符
            if ((value.match(/[a-zA-Z0-9.()]/g).join('')) === value) {
              this.searchText = value;
            } else {
              this.searchText = value.match(/[a-zA-Z0-9.()]/g).join('');
              return 0;
            }
          } else {
            this.searchText = value;
          }
        }
      } catch (e) {
        this.searchText = '';
        return 0;
      }
      if (value.length < 25) {
        this.$emit('search', value);
        this.$emit('change', value);
      } else {
        this.searchText = oldValue.slice(0, 25);
      }

      // 如果输入框为空分页按钮默认显示在第一页
      if (value === '') {
        // this.$vemit('selectPayWayPageOrderOneBus');
        this.$emit('resetHandler', true);
      }
      return '';
    },
  },
  computed: {
    ...mapGetters(['posSettings']),
  },
  methods: {
    ...mapActions([
      'getOrderBill',
    ]),
    clearSearchText() {
      this.searchText = '';
    },
    clearAble() {
      this.searchText = '';
      this.clearable = false;
    },
    
    // 下面两个方法, 根本不起作用
    // // 在没有焦点情况下添加文本
    // addWordInBlur(key) {
    //   if (document.hasFocus() && document.activeElement === this.$refs.input) return;
    //   this.searchText = `${this.searchText}${key}`;
    // },
    // // 在没有焦点情况下删除最后一个文本
    // delWordInBlur() {
    //   if (document.hasFocus() && document.activeElement === this.$refs.input) return;
    //   this.searchText = KeyboardUtil.deleteLastChar(this.searchText);
    // },

    // 搜索框及软键盘-功能重置(从结算pay\index组件一直而来,功能拆分后处理执行)
    cancelSearchPaywayFocus() {
      // 关闭虚拟键盘清空输入空内容
      this.searchText = '';
      // 让输入框失去焦点
      this.$refs.input.blur();
      // 重置分页-按钮及显示内容
      this.$emit('resetHandler');

      // // 重置分页按钮
      // this.payWayPageOrder = 1;
      // // 重置分页 按钮及显示内容
      // this.pageForWard('payWayType', this.payWayPageOrder);
    },
    // 聚焦(切换为当前)时,清空结算方式搜索input内容
    toggleInputClear() {
      this.$vemit('resetSearchDisPlanText');
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
    background-color: rgba(237, 254, 255, 0.5);
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
      }
    }

    > input {
      display: block;
      .size(100%, @pos-order-tables-search-height);
      border: none;
      background: none;
      padding-left: @pos-order-tables-search-input-padding-left;
      padding-right: @pos-order-tables-search-padding-horizontal;
      color: @pos-order-tables-search-color;
      font-size: @pos-order-tables-search-input-font-size;
      width: 170px;
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
