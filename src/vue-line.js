import { add } from './common/js/math';

class MyLine {
  constructor() {
    this.timer = null; // 更新时的定时器 用于节流
    this.input = null; // input框
    this.bindEl = null; // input框的父元素（绑定v-line的元素）
    this.params = null; // 自定义指令传值 v-line="{width: 25, top: 0, right: 0}"
    this.shouldAppend = true; // 是否创建横线并添加到input框中
  }

  getInput = () => this.input;

  setInput = (val) => {
    this.input = val;
  };

  getPosition = () => {
    const input = this.getInput();
    return input.getBoundingClientRect();
  };

  setUpdate(bool) {
    this.shouldAppend = bool;
  }

  getMarginOrPadding = (arr, key) => {
    const obj = Object.assign({}, {
      [key]: null,
    });
    switch (arr.length) {
      case 1:
        obj[key] = {
          top: arr[0],
          bottom: arr[0],
          left: arr[0],
          right: arr[0],
        };
        break;
      case 2:
        obj[key] = {
          top: arr[0],
          bottom: arr[0],
          left: arr[1],
          right: arr[1],
        };
        break;
      case 3:
        obj[key] = {
          top: arr[0],
          bottom: arr[2],
          left: arr[1],
          right: arr[1],
        };
        break;
      case 4:
        obj[key] = {
          top: arr[0],
          bottom: arr[2],
          left: arr[3],
          right: arr[1],
        };
        break;
      default:
        break;
    }
    return obj;
  };

  // 返回input框的样式（目前仅考虑了padding）
  getComputedStyle = () => {
    const style = {};
    const input = this.getInput();
    const inputStyle = window.getComputedStyle(input, null);
    const paddingArray = inputStyle.padding.replace(/px/g, '').split(' ');
    const marginArray = inputStyle.margin.replace(/px/g, '').split(' ');
    Object.assign(style, {
      ...this.getMarginOrPadding(paddingArray, 'padding'),
      ...this.getMarginOrPadding(marginArray, 'margin'),
    });
    return style;
  };

  // 找到绑定元素下的第一个input框
  findInput = (el, binding) => {
    this.bindEl = el;
    this.params = binding.value || {};
    if (el.nodeName === 'INPUT') {
      this.setInput(el);
    } else {
      let childList = el.childNodes || [];
      if (childList && !Array.isArray(childList)) {
        childList = Array.prototype.slice.call(childList);
      }
      const elementChilds = childList.filter(node => node.nodeType === 1) || [];
      for (let i = 0; i < elementChilds.length; i += 1) {
        if (elementChilds[i].nodeName === 'INPUT') {
          this.setInput(elementChilds[i]);
          break;
        } else if (elementChilds[i].childNodes.length > 0) {
          this.setInput(this.findInput(elementChilds[i]));
        }
      }
    }
  };

  // 给绑定元素添加class，设置横线样式，添加到绑定元素中
  setStyle = () => {
    const input = this.getInput();
    const inputPos = this.getPosition();
    const style = this.getComputedStyle();
    const parentClass = this.bindEl.getAttribute('class');
    if (parentClass.indexOf('hello') < 0) {
      this.bindEl.setAttribute('class', `${parentClass} hello`);
      this.bindEl.style.position = 'relative';
    }
    let wrap = this.bindEl.querySelector('.vue-line');
    if (this.shouldAppend) {
      wrap = document.createElement('div');
      wrap.setAttribute('class', 'vue-line');
    }
    if (this.params.direction === 'leftToRight') {
      let len = 0;
      if (`${input.value}`.length > 3) {
        len += (`${input.value}`.length - 3) * 8.5;
      }
      if (`${input.value}`.indexOf('.') > -1) {
        len -= (8 + `${input.value}`.length * 0.1);
      }
      wrap.style.left = `${this.params.left || add(style.padding.left, len)}px`;
    } else {
      wrap.style.right = `${this.params.right || style.padding.right}px`;
    }
    let realLen = 0;
    if (`${input.value}`.indexOf('.') > -1) {
      realLen = 6;
    }
    wrap.style.width = `${this.params.width || add(25, realLen)}px`;
    wrap.style.top = `${this.params.top || ((inputPos.height / 2) - style.padding.top)}px`;
    if (this.shouldAppend) { // 更新时line不再重复添加
      this.bindEl.appendChild(wrap);
    }
  }
}

const VueLine = {};
const myLine = new MyLine();
VueLine.install = (Vue) => {
  Vue.directive('line', {
    inserted(el, binding) {
      myLine.setUpdate(true);
      myLine.findInput(el, binding);
      myLine.setStyle();
    },
    componentUpdated(el, binding) {
      if (myLine.timer) clearTimeout(myLine.timer);
      myLine.timer = setTimeout(() => {
        myLine.setUpdate(false);
        myLine.findInput(el, binding);
        myLine.setStyle();
      }, 200);
    },
  });
};

export default VueLine;
