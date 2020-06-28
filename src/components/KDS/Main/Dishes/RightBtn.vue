<template>
  <div class="div_rightBtn">
    <button
      v-for="(item, index) in allBtn"
      :key="index"
      @click="filterList(item)"
      :class="{active: btnActive === item}"
      class="btn-wrap">
      {{item}}
    </button>
    <button
      :class="{active: btnActive === 'delete'}"
      class="btn-wrap float-left"
      @click="deleteLetter">
      <i class="icon icon-pos-keyboard-back"></i>
    </button>
    <button
      :class="{active: btnActive === 'clear'}"
      class="btn-wrap float-left"
      @click="clearLetter">
      清空
    </button>
  </div>
</template>

<script>
import * as KeyboardUtil from '@/plugin/keyboard/util';
import KeyboardMixin from '@/plugin/keyboard/components/KeyboardMixin';

export default {
  mixins: [KeyboardMixin],
  data() {
    return {
      allBtn: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
      btnActive: '',
    };
  },
  methods: {
    filterList(item) {
      this.btnActive = item;
      this.$emit('filterList', this.btnActive);
    },
    // 删除按钮
    deleteLetter() {
      this.btnActive = 'delete';
      const input = this.getInput();
      if (!input) return;
      input.focus();
      input.value = KeyboardUtil.deleteLastChar(input.value);
      input.isDelete = true;
      KeyboardUtil.dispatchInputEvent(input);
      KeyboardUtil.dispatchChangeEvent(input);
    },
    // 清空字符串
    clearLetter() {
      this.btnActive = 'clear';
      const input = this.getInput();
      if (!input) return;
      input.focus();
      input.value = '';
      KeyboardUtil.dispatchInputEvent(input);
    },
  },
};
</script>

<style lang="less" scoped>
  .div_rightBtn{
    height: 100%;
  }
.btn-wrap {
  width: 40px;
  height: calc(100% / 14);
  outline: none;
  border-top: none;
  border-left: none;
  border-right: none;
  font-size: 16px;
  color: #f0f0f0;
  border-bottom: 1px solid #516686;
  background-color: #2a4366;
  &:nth-child(odd) {
    border-right: 1px solid #516686;
  }
  &.active {
    font-weight: bold;
    color: #ffffff;
    background-color: #749ddc;
  }
  &.float-left {
    float: left;
  }
}
</style>
