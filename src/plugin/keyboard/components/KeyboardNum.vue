<template>
  <div class="keyboard-warp" :class="{'popover-keyboard':isPopover}" @mousedown.prevent :style="keyboardStyle" v-show="show">
    <div class="keyboard-content-warp">
      <ul class="keyboard-item-warp">
        <li><button type="button" class="key-item" @click="input(1)">1</button></li>
        <li><button type="button" class="key-item" @click="input(4)">4</button></li>
        <li><button type="button" class="key-item" @click="input(7)">7</button></li>
        <li><button type="button" class="key-item" @click="input('.')">.</button></li>
      </ul>
      <ul class="keyboard-item-warp">
        <li><button type="button" class="key-item" @click="input(2)">2</button></li>
        <li><button type="button" class="key-item" @click="input(5)">5</button></li>
        <li><button type="button" class="key-item" @click="input(8)">8</button></li>
        <li><button type="button" class="key-item" @click="input(0)">0</button></li>
      </ul>
      <ul class="keyboard-item-warp">
        <li><button type="button" class="key-item" @click="input(3)">3</button></li>
        <li><button type="button" class="key-item" @click="input(6)">6</button></li>
        <li><button type="button" class="key-item" @click="input(9)">9</button></li>
        <li><button type="button" class="key-item" @click="deleteLetter">
          <!-- <span class="icon-text">退格</span> -->
          <span class="icon-text" v-show="isNotEn()">{{ txt() }}</span>
          <i class="icon icon-pos-keyboard-back"></i>
        </button></li>
      </ul>
      <ul class="keyboard-item-warp" v-if="type === 'large'">
        <li><button class="key-item" @click="clearLetter">C</button></li>
        <li><button class="key-item medium-item" @click="enter">
          <i class="icon icon-pos-keyboard-enter"></i>
        </button></li>
      </ul>
    </div>
    <img class="cursor-img" v-if="isPopover" :class="[popoverPosition]" src="@/common/images/sl-msg/keybord_cursor.png" alt="">
  </div>
</template>

<script>
import KeyboardMixin from './KeyboardMixin';
import i18n from '@/locales/index';

export default {
  props: {
    type: {
      default: 'normal',
      validator(value) {
        return ['normal', 'large'].indexOf(value) !== -1;
      },
    },
  },
  mixins: [KeyboardMixin],
  methods: {
    txt() {
      return i18n.t('Dict.Backspace');
    },
    isNotEn() {
      return i18n.locale !== 'enUS';
    },
    // txt: '退格',
  },
};
</script>
<style lang="less" scoped>
  @import './keyboard.less';
  @import './keyboard-content.less';
</style>
