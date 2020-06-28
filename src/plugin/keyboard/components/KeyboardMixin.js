import * as KeyboardUtil from '../util';

export default {
  props: {
    // 是否弹窗模式
    isPopover: {
      type: Boolean,
      default: false,
    },
    // 弹出层绑定的元素
    popoverBindElement: {},
    // 是否显示弹窗
    showPopover: {
      type: Boolean,
      default: false,
    },
    // 弹窗出现的位置
    popoverPosition: {
      default: 'right',
      validator(value) {
        return ['top', 'right', 'left', 'bottom', 'top-right', 'left-left', 'right-right', 'fixed'].indexOf(value) !== -1;
      },
    },
    // 绑定指令元素的Rect对象
    directiveRect: {
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      // 当前元素的Rect
      elRect: {
        width: 0,
        height: 0,
      },
    };
  },
  watch: {
    show() {
      this.$nextTick(() => {
        this.elRect = this.$el.getBoundingClientRect();
      });
    },
    showPopover(val) {
      if (this.isPopover) {
        if (val) {
          this.$emit('popover-show');
        } else {
          this.$emit('popover-dismiss');
          // eslint-disable-next-line no-unused-expressions
          this.resetPopover && this.resetPopover();
          const input = this.getInput();
          if (!input) return;

          KeyboardUtil.dispatchChangeEvent(input);
        }
      }
    },
  },
  computed: {
    // 是否显示弹窗
    show() {
      if (!this.isPopover) return true;
      return this.showPopover;
    },
    // 样式
    keyboardStyle() {
      if (!this.isPopover) return {};
      if (!this.showPopover) return {};
      // console.log('directiveRect', this.directiveRect)
      // console.log('elRect', this.elRect)
      switch (this.popoverPosition) {
        case 'left':
          return {
            top: `${this.directiveRect.top - this.elRect.height / 2 + this.directiveRect.height / 2}px`,
            left: `${this.directiveRect.left - 4 - 12}px`,
            transform: 'translate(-100%)',
          };
        case 'top':
          return {
            top: `${this.directiveRect.top - 4 - 12}px`,
            left: `${this.directiveRect.left - this.elRect.width / 2 + this.directiveRect.width / 2}px`,
            transform: 'translate(0, -100%)',
          };
        case 'right':
          return {
            top: `${this.directiveRect.top - this.elRect.height / 2 + this.directiveRect.height / 2}px`,
            left: `${this.directiveRect.left + this.directiveRect.width + 4 + 12}px`,
          };
        case 'bottom':
          return {
            top: `${this.directiveRect.top + this.directiveRect.height + 4 + 12}px`,
            left: `${this.directiveRect.left - this.elRect.width / 2 + this.directiveRect.width / 2}px`,
          };
        case 'top-right':
          return {
            top: `${this.directiveRect.top - 4 - 12}px`,
            left: `${this.directiveRect.left}px`,
            transform: 'translate(0, -100%)',
          };
        case 'left-left':
          return {
            top: `${this.directiveRect.top - this.elRect.height - this.directiveRect.height / 2 + 12}px`,
            left: `${this.directiveRect.left - 67 - 344 - 7}px`,
          // transform: 'translate(0, 0)',
          };
        case 'right-right':
          return {
            top: `${this.directiveRect.top - this.elRect.height - this.directiveRect.height / 2 + 12}px`,
            left: `${parseInt((this.directiveRect.left + 210 + 67 + 7), 10)}px`,
          };
        case 'fixed': // 为了解决自助押金模块下的input框全键盘下样式错乱问题
          if (this.keyboardType !== 'num' && this.letterType !== 'nine') {
            return {
              top: `${this.directiveRect.top + this.directiveRect.height + 4 + 12}px`,
              left: `${this.directiveRect.left - 430}px`,
            };
          }
          return {
            top: `${this.directiveRect.top + this.directiveRect.height + 4 + 12}px`,
            left: `${this.directiveRect.left - 65}px`,
          };
        case 'top-left-kds':
          // 全键盘
          if (this.keyboardType === 'num') {
            return {
              top: `${this.directiveRect.top - this.elRect.height - this.directiveRect.height / 2 + 12}px`,
              right: '155px',
            };
          }
          return {
            top: `${this.directiveRect.top - this.elRect.height - this.directiveRect.height / 2 + 12}px`,
            left: `${this.directiveRect.left - 67 - 344 - 7}px`,
          };
        default:
          // do nothing
          break;
      }
      return {};
    },
    // 改变虚拟键盘形状大小
    keyboardSize() {
      if (this.popoverPosition === 'left-left'
        || this.popoverPosition === 'right-right'
      ) {
        return true;
      }
      return false;
    },
  },
  methods: {
    // 是否点击我自己的元素
    isMineElement(ele) {
      return this.$el.contains(ele);
    },
    // 得到输入框
    getInput() {
      if (
        window.$_focusInput
        && document.contains(window.$_focusInput)
        && window.$_focusInput.style.display !== 'none'
        && window.$_focusInput.getAttribute('disabled') !== 'disabled') {
        return window.$_focusInput;
      }
      const allInput = document.querySelectorAll(KeyboardUtil.INPUT_SELECTOR);
      return [...allInput].find(item => item.style.display !== 'none');
    },
    // 回车
    enter() {
      const input = this.getInput();
      if (!input) return;
      input.focus();
      KeyboardUtil.dispatchEnterEvent(input);
    },
    // 輸入
    input(val) {
      const input = this.getInput();
      if (!input) return;
      input.focus();
      input.value = `${input.value}${val}`;
      KeyboardUtil.dispatchInputEvent(input);
      KeyboardUtil.dispatchChangeEvent(input);
    },
    // 删除按钮
    deleteLetter() {
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
      const input = this.getInput();
      if (!input) return;
      input.focus();
      input.value = '';
      KeyboardUtil.dispatchInputEvent(input);
    },
    // 关闭
    close() {
      this.showPopover = false;
    },
  },
};
