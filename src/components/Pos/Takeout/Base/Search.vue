<template>
  <div>
    <div class="pos-takeout-search" v-switch-keyboard:top-right="keybordParams">
      <i class="icon icon-pos-takeout-search"></i>
      <input
        ref="input"
        v-judge
        type="text"
        :placeholder="$t('Biz.Pos.Takeout.TakeoutMsg062')"
        v-model="searchText" class="takeout-search">
    </div>
  </div>
</template>

<script>
import { debounce } from 'lodash';

export default {
  data() {
    return {
      searchText: '',
    };
  },
  computed: {
    // 键盘参数
    keybordParams() {
      if (!this.$store.state.pos || !this.$store.state.pos.posBaseInfo) {
        return {};
      }
      return {
        letterType: this.$store.state.pos.posBaseInfo.isEnableQWEKeyboard ? 'full' : 'nine',
      };
    },
  },
  watch: {
    // 节流函数搜索
    searchText: debounce(function (value) {
      // this问题：此处不使用箭头函数
      this.$emit('getSearchText', value);
    }, 600),
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-takeout-search {
  position: relative;
  float: left;
  .size(266px, 38px);
  padding-left: 38px;
  border: none;
  color: #273844;

  > i.icon {
    position: absolute;
    left: 0;
    top: 0;
    padding-left: 8px;
    .size(38px, 38px);
    font-size: 20px;
    line-height: 38px;
    text-align: center;
    color: #273844;
    background-color: #9dc1ca;
    border-radius: 20px 0 0 20px;
  }

  .takeout-search {
    display: block;
    .square(100%);
    border: none;
    padding-right: 15px;
    font-size: 12px;
    border-radius: 0 20px 20px 0;

    background-color: #9dc1ca;
    &::-webkit-input-placeholder {
      color: #273844;
    }
  }
}

.lang-enUS{
  .pos-takeout-search{
    width: 420px;
  }
}
</style>
