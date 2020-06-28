<template>
  <div class="keyboard-content-warp">
    <ul class="keyboard-item-warp">
      <li><button class="key-item" @click="input(1)">1</button></li>
      <li><button class="key-item" @click="input('(GHI)')">GHI</button></li>
      <li><button class="key-item" @click="input('(PQRS)')">PQRS</button></li>
      <li><button class="key-item" @click="switchNumKeyboard">123</button></li>
    </ul>
    <ul class="keyboard-item-warp">
      <li><button class="key-item" @click="input('(ABC)')">ABC</button></li>
      <li><button class="key-item" @click="input('(JKL)')">JKL</button></li>
      <li><button class="key-item" @click="input('(TUV)')">TUV</button></li>
      <li><button class="key-item" @click="input(0)">0</button></li>
    </ul>
    <ul class="keyboard-item-warp">
      <li><button class="key-item" @click="input('(DEF)')">DEF</button></li>
      <li><button class="key-item" @click="input('(MNO)')">MNO</button></li>
      <li><button class="key-item" @click="input('(WXYZ)')">WXYZ</button></li>
      <li><button class="key-item" @click="input('.')">.</button></li>
    </ul>
    <ul class="keyboard-item-warp">
      <li><button class="key-item" @click="deleteTxt">
        <!-- <span class="icon-text">退格</span> -->
        <span class="icon-text" v-show="isNotEn()">{{ txt1() }}</span>
        <i class="icon icon-pos-keyboard-back"></i>
      </button></li>
      <li><button class="key-item" @click="clearTxt">{{ txt2 }}</button></li>
      <li><button class="key-item big-item" @click="close">{{ txt3 }}</button></li>
    </ul>
  </div>
</template>

<script>
import i18n from '@/locales/index';

export default {
  data() {
    return {
      txt1() {
        return i18n.t('Dict.Backspace'); // txt1: '退格',
      },
      isNotEn() {
        return i18n.locale !== 'enUS';
      },
      txt2: i18n.t('Dict.Empty'), // txt2: '清空',
      txt3: i18n.t('Dict.Close'), // txt3: '关闭',
    };
  },
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
  },
};
</script>
<style lang="less" scoped>
@import './keyboard-content.less';
</style>
