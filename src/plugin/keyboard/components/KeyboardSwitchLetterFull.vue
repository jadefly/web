<template>
  <div class="keyboard-content-warp">
    <ul class="keyboard-item-warp">
      <li><button class="key-item" @click="input('Q')">Q</button></li>
      <li><button class="key-item" @click="input('A')">A</button></li>
      <li><button class="key-item" @click="switchNumKeyboard">123</button></li>
    </ul>
    <ul class="keyboard-item-warp">
      <li><button class="key-item" @click="input('W')">W</button></li>
      <li><button class="key-item" @click="input('S')">S</button></li>
      <li><button class="key-item" @click="input('Z')">Z</button></li>
    </ul>
    <ul class="keyboard-item-warp">
      <li><button class="key-item" @click="input('E')">E</button></li>
      <li><button class="key-item" @click="input('D')">D</button></li>
      <li><button class="key-item" @click="input('X')">X</button></li>
    </ul>
    <ul class="keyboard-item-warp">
      <li><button class="key-item" @click="input('R')">R</button></li>
      <li><button class="key-item" @click="input('F')">F</button></li>
      <li><button class="key-item" @click="input('C')">C</button></li>
    </ul>
    <ul class="keyboard-item-warp">
      <li><button class="key-item" @click="input('T')">T</button></li>
      <li><button class="key-item" @click="input('G')">G</button></li>
      <li><button class="key-item" @click="input('V')">V</button></li>
    </ul>
    <ul class="keyboard-item-warp">
      <li><button class="key-item" @click="input('Y')">Y</button></li>
      <li><button class="key-item" @click="input('H')">H</button></li>
      <li><button class="key-item" @click="input('B')">B</button></li>
    </ul>
    <ul class="keyboard-item-warp">
      <li><button class="key-item" @click="input('U')">U</button></li>
      <li><button class="key-item" @click="input('J')">J</button></li>
      <li><button class="key-item" @click="input('N')">N</button></li>
    </ul>
    <ul class="keyboard-item-warp">
      <li><button class="key-item" @click="input('I')">I</button></li>
      <li><button class="key-item" @click="input('K')">K</button></li>
      <li><button class="key-item" @click="input('M')">M</button></li>
    </ul>
    <ul class="keyboard-item-warp">
      <li><button class="key-item" @click="input('O')">O</button></li>
      <li><button class="key-item" @click="input('L')">L</button></li>
      <li><button class="key-item" @click="clearTxt">{{ txt2() }}</button></li>
    </ul>
    <ul class="keyboard-item-warp">
      <li><button class="key-item" @click="input('P')">P</button></li>
      <li><button class="key-item" @click="deleteTxt">
        <span class="icon-text" v-show="isNotEn()">{{ txt1() }}</span>
        <i class="icon icon-pos-keyboard-back"></i>
      </button></li>
      <li><button class="key-item" @click="close">{{ txt3() }}</button></li>
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
    switchNumKeyboard() {
      this.$emit('switch-num');
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
      // 退格
      return i18n.t('Dict.Backspace');
    },
    txt2() {
      // 清空
      return i18n.t('Dict.Empty');
    },
    txt3() {
      // 关闭
      return i18n.t('Dict.Close');
    },
    isNotEn() {
      return i18n.locale !== 'enUS';
    },
  },
};
</script>
<style lang="less" scoped>
@import './keyboard-content.less';
.keyboard-content-warp{
  padding: 2px 5px;
  .key-item{
    margin: @item-margin;
  }
}
</style>
