import axios from 'axios';

let enable = true;

axios.get('./static/autotest.config').then((data) => {
  if (!data.data) {
    enable = false;
  }
});

const VueAutoTest = {};

function autoTestGetClassName(className) {
  if (className) {
    const classArr = className.split(' ');
    const toClassArr = classArr.filter(item => item.indexOf('fade') === -1);
    if (toClassArr.length) {
      return `.${toClassArr.join('.')}`;
    }
    return '';
  }
  return '';
}

/**
 * 获取一个 DOM 的 ID，规则为 标签名+#ID名+.类名，如果被隐藏尾部拼接[n]
 * @param {Element} elm DOM 元素
 */
function autoTestGetTagId(elm) {
  // 元素的 ID 号，如果没有 ID 则为空
  const id = elm.id ? `#${elm.id}` : '';
  // 元素的类名，如果没有类名则为空，否则用“.”分割为类名字符串
  const className = autoTestGetClassName(elm.className);
  // 判断元素是否显示，显示则为空，隐藏则为“[n]”
  const isShow = elm.style.display === 'none' ? '[n]' : '';
  // 拼接结果
  return `${elm.tagName}${id}${className}${isShow}`;
}

/**
 * 尾递归获取自动化测试ID，从<body>一直拼接到目标元素
 * @param {Element} elm 第一个调用的参数会是 Vue 中的 VNode，后面是 DOM
 * @param {*} id 尾递归用的目标参数
 */
function autoTestGetTestId(elm, id) {
  if (elm) {
    // 如果为<body>则结束，返回目标结果
    if (elm.tagName === 'BODY') {
      return id;
    }
    // 判断第一个参数是否为 VNode，如果是 VNode对象特殊处理为 DOM 元素
    const e = elm.elm ? elm.elm : elm;
    // 拼接规则为斜杠分割
    const d = id === '' ? '' : `/${id}`;
    // 递归调用，传入父元素
    return autoTestGetTestId(e.parentNode, `${autoTestGetTagId(e)}${d}`);
  }
  // 如果第一个参数为空直接返回空字符串
  return '';
}

// 自动化测试 ID 被生成在 HTML 标签中的 data-autotest 属性内
VueAutoTest.install = (Vue) => {
  Vue.directive('autotest', {
    inserted(el, binding, vnode) {
      if (enable) {
        el.setAttribute('data-autotest', autoTestGetTestId(vnode, ''));
      }
    },
    componentUpdated(el, binding, vnode) {
      if (enable) {
        setTimeout(() => {
          el.setAttribute('data-autotest', autoTestGetTestId(vnode, ''));
        }, 400);
      }
    },
  });
};

export default VueAutoTest;
