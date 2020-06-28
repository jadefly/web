<template>
  <div class="keyboard-content-warp">
    <ul class="keyboard-item-warp">
      <li><button class="key-item" @click="input(1)">1</button></li>
      <li><button class="key-item" @click="input(4)">4</button></li>
      <li><button class="key-item" @click="input(7)">7</button></li>
      <li><button class="key-item" @click="switchLetterKeyboard">ABC</button></li>
    </ul>
    <ul class="keyboard-item-warp">
      <li><button class="key-item" @click="input(2)">2</button></li>
      <li><button class="key-item" @click="input(5)">5</button></li>
      <li><button class="key-item" @click="input(8)">8</button></li>
      <li><button class="key-item" @click="input(0)">0</button></li>
    </ul>
    <ul class="keyboard-item-warp">
      <li><button class="key-item" @click="input(3)">3</button></li>
      <li><button class="key-item" @click="input(6)">6</button></li>
      <li><button class="key-item" @click="input(9)">9</button></li>
      <li><button class="key-item" @click="input('.')">.</button></li>
    </ul>
    <ul class="keyboard-item-warp">
      <li><button class="key-item" @click="deleteTxt">
        <span class="icon-text" v-show="isNotEn()">{{ txt1() }}</span>
        <i class="icon icon-pos-keyboard-back"></i>
      </button></li>
      <li><button class="key-item" @click="clearTxt">{{ txt2() }}</button></li>
      <li><button class="key-item big-item" @click="close">{{ txt3() }}</button></li>
    </ul>
  </div>
</template>

<script>
import i18n from '@/locales/index';

export default {
  methods: {
    input(val) {
      this.$emit('input', val);
    },
    switchLetterKeyboard() {
      this.$emit('switch-letter');
    },
    deleteTxt() {
      this.$emit('delete-letter');
    },
    clearTxt() {
      this.$emit('clear-letter');
    },
    close() {
      this.$emit('close');
    },
    txt1() {
      return i18n.t('Dict.Backspace'); // 退格
    },
    txt2() {
      return i18n.t('Dict.Empty'); // 清空
    },
    txt3() {
      return i18n.t('Dict.Close'); // 关闭
    },
    isNotEn() {
      return i18n.locale !== 'enUS';
    },
  },
};
</script>
<style lang="less" scoped>
@import './keyboard-content.less';
</style>
