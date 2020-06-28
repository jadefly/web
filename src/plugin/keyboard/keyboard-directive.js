/* eslint-disable no-param-reassign */
import * as KeyboardUtil from './util';

export default function (keyboardComp) {
  // 这缺心眼逻辑太奇葩了,软键盘既是组件又是插件,功能几乎不能改,服气了...
  // 键盘开启(keyboardComp.showPopover被监听处理input)
  function startPopover() {
    keyboardComp.showPopover = true;
  }

  // 重置/关闭键盘(keyboardComp.showPopover被监听处理input)
  function closePopover() {
    keyboardComp.showPopover = false;
  }

  // 获得焦点并执行软键盘开启
  function clickInputFactory({ el, binding, vnode }) {
    return () => {
      // 延后开启
      setTimeout(() => {
        keyboardComp.$store = vnode.context.$store;
        keyboardComp.popoverBindElement = el;

        const { value, arg } = binding;
        // 解决拼菜在1024屏幕下 软键盘错位问题
        if (value && value.focusSetKeyboardPosition) {
          keyboardComp.popoverPosition = value.focusSetKeyboardPosition;
        } else {
          keyboardComp.popoverPosition = arg;
        }

        keyboardComp.params = value || {};

        // 获取焦点后,开启Popover
        startPopover();

        keyboardComp.directiveRect = el.getBoundingClientRect();
        document.addEventListener('click', el.dismissHandle, true);
        // console.log(document.activeElement)
      }, 200);
    };
  }

  // 返回包装的事件和input节点
  function toggleEvent(el, binding, vnode) {
    let inputEle = el;
    if (!KeyboardUtil.isInput(el)) {
      inputEle = el.querySelector(KeyboardUtil.INPUT_SELECTOR);
    }

    if (binding.value && typeof (binding.value) === 'object') {
      Object.entries(binding.value).forEach(([key, value]) => {
        keyboardComp[key] = value;
      });
    }

    /**
     * 挂载键盘打开时需要动态处理的逻辑
     * 说明: 奇葩处理方式(定时器为了监听键盘是否可以执行关闭,动态赋值键盘位置的代码已删除)
     * */
    keyboardComp.$on('popover-show', () => {
      if (el !== keyboardComp.popoverBindElement) return;
      // eslint-disable-next-line no-unused-expressions
      el.loopPosition && clearInterval(el.loopPosition);
      keyboardComp.directiveRect = el.getBoundingClientRect();
      el.loopPosition = setInterval(() => {
        // 原代码 注释不用
        // keyboardComp.directiveRect = el.getBoundingClientRect();
        // if (keyboardComp.directiveRect.width <= 0 && keyboardComp.directiveRect.height <= 0) {
        // eslint-disable-next-line no-undef
        if (jQuery(el).width() <= 0) {
          // keyboardComp.showPopover = false;
          closePopover();
        }
      }, 50);
    });

    keyboardComp.$on('popover-dismiss', () => {
      // eslint-disable-next-line no-unused-expressions
      el.loopPosition && clearInterval(el.loopPosition);
    });

    // 获得焦点后执行,Popover的关联业务
    el.clickInputHandle = clickInputFactory({ el, binding, vnode });

    // 点击其他位置键盘的状态 keyboardComp.showPopover 不处理不消失 false消失 ,李琢让改成不消失的
    el.dismissHandle = (e) => {
      if (inputEle
        && !inputEle.contains(e.target)
        && !keyboardComp.isMineElement(e.target)
        && !inputEle.attributes.nohide
      ) {
        // 数字键盘没有关闭按钮，需要失焦关闭
        if (keyboardComp.isClose) {
          // keyboardComp.showPopover = false;
          closePopover();
        } else {
          document.removeEventListener('click', el.dismissHandle, true);
        }
      }
    };
    // 在输入框上的快捷键
    el.hotKeyHandle = (ev) => {
      switch (ev.keyCode) {
        // Del键事件
        case 46:
          inputEle.value = '';
          KeyboardUtil.dispatchInputEvent(inputEle);
          ev.preventDefault();
          break;
        // 回格键事件
        case 8:
          // eslint-disable-next-line no-case-declarations
          const text = window.getSelection
            ? window.getSelection()
            : document.selection.createRange().text; // 搜索文本选中时，删除全部
          if (text.toString().length > 1) {
            inputEle.value = '';
          } else {
            inputEle.value = KeyboardUtil.deleteLastChar(inputEle.value);
          }
          inputEle.isDelete = true;
          KeyboardUtil.dispatchInputEvent(inputEle);
          ev.preventDefault();
          break;
        default:
          // do nothing
          break;
      }
    };
    // input获取焦点或者鼠标移动到上方，显示清除按钮
    if (inputEle.attributes.clearable) {
      el.clearable = true;
      el.canClear = () => {
        const { searchText } = vnode.context;
        if (searchText.length > 0) {
          vnode.context.clearable = true;
        } else {
          vnode.context.clearable = false;
        }
      };
      el.notClear = () => {
        vnode.context.clearable = false;
      };
    } else {
      el.clearable = false;
    }

    return { el, inputEle };
  }

  // 根据model切换写字板和软键盘
  function doToggle(el, binding, vnode) {
    // 根据查询条件切换input上的绑定事件
    const {
      posSettings, $devices, showPanel,
      // $store,
    } = vnode.context;
    const model = posSettings ? posSettings.searchMode : 1;
    const { Handwriting } = $devices;
    // eslint-disable-next-line prefer-rest-params
    const obj = toggleEvent(...arguments);

    if (model === 3 && showPanel) {
      // keyboardComp.showPopover = false;
      closePopover();
      obj.inputEle.onclick = (e) => {
        e.preventDefault();
        // 根据后台设置时候开启手写板
        console.log('vnode.context.$store.getters.posInfo.isEnableHandwritingBoard', vnode.context.$store.getters.posInfo.isEnableHandwritingBoard);
        if (
          vnode.context.$store.getters.posInfo.isEnableHandwritingBoard
          && Handwriting && !Handwriting.status
        ) {
          Handwriting.open();
        }
      };
      // if(obj.el.clearable) {
      //   obj.inputEle.onfocus = obj.el.canClear;
      //   obj.inputEle.oninput = obj.el.canClear;
      // }
    } else {
      obj.inputEle.onclick = obj.el.clickInputHandle;
      obj.inputEle.onfocus = null;
      obj.inputEle.oninput = null;
      // Handwriting && Handwriting.close()
    }
  }

  return {
    bind(el, binding, vnode) {
      const obj = toggleEvent(el, binding, vnode);
      obj.inputEle.onclick = obj.el.clickInputHandle;
      obj.inputEle.onkeydown = obj.el.hotKeyHandle;
    },
    inserted(el, binding, vnode) { // 原来在body中插入，改为元素后面插入
      el.parentNode.appendChild(keyboardComp.$el);
    },
    update(el, binding) {
      // eslint-disable-next-line prefer-rest-params
      doToggle(...arguments);

      if (binding.value && typeof (binding.value) === 'object') {
        Object.entries(binding.value).forEach(([key, value]) => {
          keyboardComp[key] = value;
        });
      }
    },

    unbind(el) {
      let inputEle = el;
      if (!KeyboardUtil.isInput(el)) {
        inputEle = el.querySelector(KeyboardUtil.INPUT_SELECTOR);
      }
      inputEle.removeEventListener('click', el.clickInputHandle);
      inputEle.removeEventListener('keydown', el.hotKeyHandle);
      document.removeEventListener('click', el.dismissHandle, true);
      closePopover();
    },
  };
}
