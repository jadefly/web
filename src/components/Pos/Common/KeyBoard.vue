<template>
  <div
    class="keyboard keyboard-static"
    :class="{
      'keyboard-bordered': settings.bordered,
      'keyboard-simple': settings.mode == 'simple',
    }"
  >
    <ul class="keyboard-nums">
      <li><button type="button" @click="input(1)">1</button></li>
      <li><button type="button" @click="input(2)">2</button></li>
      <li><button type="button" @click="input(3)">3</button></li>
      <li><button type="button" @click="input(4)">4</button></li>
      <li><button type="button" @click="input(5)">5</button></li>
      <li><button type="button" @click="input(6)">6</button></li>
      <li><button type="button" @click="input(7)">7</button></li>
      <li><button type="button" @click="input(8)">8</button></li>
      <li><button type="button" @click="input(9)">9</button></li>
      <li><button type="button" @click="input('.')">.</button></li>
      <li><button type="button" @click="input(0)">0</button></li>
      <li>
        <button type="button" @click="backspace">
          <!-- <span>退格</span> -->
          <span v-show="isNotEn()">{{ $t('Dict.Backspace') }}</span>
          <i class="icon icon-pos-keyboard-back"></i>
        </button>
      </li>
    </ul>
    <ul class="keyboard-control" v-if="settings.mode == 'normal'">
      <li><button type="button" @click="clear">C</button></li>
      <li>
        <button type="button" @click="enter"><i class="icon icon-pos-keyboard-enter"></i></button>
      </li>
    </ul>
  </div>
</template>

<script>
import Vue from 'vue';
import $ from 'jquery';
import {
  extend,
  isString,
  isBoolean,
  isElement,
  delay,
  map,
} from 'lodash';

export default {
  props: {
    // 录单模式下禁止用软键盘功能
    isDisabled: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  data() {
    return {
      form: null,
      focusInput: null,
      settings: {
        mode: 'normal',
        autoFocus: true,
        bordered: true,
        autoSelect: false,
      },
    };
  },
  methods: {
    isNotEn() {
      return Vue.config.lang !== 'enUS';
    },
    isEnable() {
      return !this.isDisabled && this.focusInput && this.focusInput.length;
    },
    input(num) {
      if (this.isEnable()) {
        const valueLength = this.focusInput.val().length;
        const maxLength = this.focusInput.attr('maxLength');
        const selectText = this.selectText();
        let selectLength = 0;
        if (selectText) {
          selectLength = selectText.length;
        }
        // 输入框如果存在了最大输入值，做下校验
        if (+maxLength && (valueLength - selectLength) >= maxLength) {
          return;
        }
        if (this.focusInput.data('selected')) {
          this.focusInput.val('');
        }
        const cursorPos = this.getCursorPosition(this.focusInput[0]);
        if (selectText) {
          const textPos = this.getSelectTextPosition(this.focusInput[0]);
          const val1 = this.focusInput.val().substring(0, textPos[0]);
          const val2 = this.focusInput.val().substring(textPos[1]);
          this.focusInput.val(val1 + num + val2);
          this.reFocusInput();
          this.setCaretPosition(this.focusInput[0], textPos[0] + 1);
        } else {
          const val3 = this.focusInput.val().substring(0, cursorPos);
          const val4 = this.focusInput.val().substring(cursorPos);
          this.focusInput.val(val3 + num + val4);
          this.reFocusInput();
          this.setCaretPosition(this.focusInput[0], cursorPos + 1);
        }
      }
    },
    // 检测是否有选中的文字
    selectText() {
      if (document.Selection) {
        return document.selection.createRange().text;
      }
      return window.getSelection().toString();
    },
    // 获取选中文字的开始结束位置
    getSelectTextPosition(input) {
      if (input) {
        return [input.selectionStart, input.selectionEnd];
      }
      return [0, 0];
    },
    // 获取输入框中光标位置
    getCursorPosition(obj) {
      let cursorIndex = 0;
      if (document.selection) {
        obj.focus();
        const range = document.selection.createRange();
        range.moveStart('character', -obj.value.length);
        cursorIndex = range.text.length;
      } else if (obj.selectionStart || obj.selectionStart === 0) {
        cursorIndex = obj.selectionStart;
      }
      return cursorIndex;
    },
    // 设置光标位置
    setCaretPosition(textDom, pos) {
      if (textDom.setSelectionRange) {
        textDom.focus();
        textDom.setSelectionRange(pos, pos);
      } else if (textDom.createTextRange) {
        const range = textDom.createTextRange();
        range.collapse(true);
        range.moveEnd('character', pos);
        range.moveStart('character', pos);
        range.select();
      }
    },
    backspace() {
      if (this.isEnable()) {
        if (this.focusInput.data('selected')) {
          this.focusInput.val('');
        } else {
          const s = this.focusInput.val();
          this.focusInput.val(s.substring(0, s.length - 1));
        }
        this.reFocusInput();
      }
    },
    clear() {
      if (this.isEnable()) {
        this.focusInput.val('');
        this.reFocusInput();
      }
    },
    enter() {
      if (this.isEnable()) {
        this.$emit('chopstickenter', this.focusInput.get(0).name);
        this.focusInput.focus();
        const inputs = this.form.find(this.getQueryString());
        let to = 0;
        inputs.each((index, element) => {
          if ($(element).is(':focus')) {
            if (index + 1 < inputs.length) {
              to = index + 1;
            } else {
              to = 0;
              this.form.get(0).dispatchEvent(new Event('submit'));
            }
            return false;
          }
          return true;
        });
        if (inputs.get(0)) {
          inputs.get(to).focus();
        }
      }
    },
    reFocusInput() {
      if (this.focusInput) {
        this.focusInput.focus().get(0).dispatchEvent(new Event('input'));
      }
      if (this.focusInput.data('selected')) {
        this.focusInput.data('selected', false);
      }
    },
    bind(form, settings) {
      this.settings = extend(this.settings, settings);
      this.form = $(form);
      this.reSelect();
    },
    getQueryString() {
      const types = ['input:text', 'input:password', 'input[type="number"]', 'textarea'];

      if (this.settings.onlybind) {
        const re = map(types, item => `${item}[data-keyboard="${this.settings.onlybind}"]`).join(',');
        console.log(re);
        return re;
      }
      return types.join(',');
    },
    getFirstInput(inputs, index = 0) { // 如果disabled设置为true，则找下一个
      if (inputs.eq(index)[0].disabled) {
        if (index < inputs.length) index += 1;
        return this.getFirstInput(inputs, index);
      }
      return inputs.eq(index);
    },
    reSelect() {
      // console.log(this.form);
      if (this.form.is('input')) {
        this.focusInput = this.form;
      } else {
        if (isBoolean(this.settings.autoFocus)) {
          // console.log(this.getQueryString());
          // console.log(this.form.find(this.getQueryString()));
          this.focusInput = this.form.find(this.getQueryString()).first();
          // this.focusInput = this.getFirstInput(this.form.find(this.getQueryString()));
        } else if (isString(this.settings.autoFocus)) {
          const finded = this.form.find(`#${this.settings.autoFocus}`);
          // console.log(finded);
          if (finded && finded.length) {
            this.focusInput = finded;
          } else {
            this.focusInput = this.form.find(this.getQueryString()).first();
          }
        } else if (isElement(this.settings.autoFocus)) {
          this.focusInput = $(this.settings.autoFocus);
        }
        this.form.find(this.getQueryString()).on('focus', (event) => {
          this.focusInput = $(event.target);
        });
      }
      if (!isBoolean(this.settings.autoFocus) || this.settings.autoFocus) {
        this.focusInput.focus();
      }
      if (this.settings.autoSelect) {
        delay(() => {
          const toSelect = this.focusInput.data('selected', true).get(0);
          if (toSelect) {
            toSelect.select();
          }
        }, 20);
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

@keyboard-size: 62px;
@keyboard-padding: 4px;
@keyboard-border-radius: 3px;

.keyboard {
  .clearfix();
}

.keyboard-static {
  width: @keyboard-size * 4;

  .keyboard-nums {
    float: left;
    width: @keyboard-size * 3;
  }

  li {
    float: left;
    .square(@keyboard-size);
    padding: @keyboard-padding;

    > button {
      .square(@keyboard-size - @keyboard-padding * 2);
      border: none;
      background: @white;
      border-radius: @keyboard-border-radius;

      > span {
        display: block;
        height: 24px;
        padding-top: 6px;
      }
    }
  }

  .keyboard-control {
    float: left;
    width: @keyboard-size;

    > li:last-child {
      height: @keyboard-size * 3;

      > button {
        height: @keyboard-size * 3 - @keyboard-padding * 2;
      }
    }
  }
}

.keyboard-bordered li > button {
  border: 1px solid #b5b5b5;
}

.keyboard-simple {
  width: @keyboard-size * 3;
}
</style>
