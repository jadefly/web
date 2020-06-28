import browser from '@/common/js/browser';

const VueKeyboard = {};

VueKeyboard.install = (Vue) => {
  /**
   * 安卓下的input屏蔽系统自带软键盘的自定义指令
   * 主要是在使用到咱们自己写的软键盘的地方
   * 针对input、el-input、el-number-input、el-date-picker（如果date-picker加了readOnly则不需加以下指令）
   * 例子： <el-input v-judge ></el-input>
   * 不加以下指令的情况：
   * 1. 如果有input需要输入汉字则不加
   * 2. 如果没有用咱们自己写的软键盘，则不加
   */
  Vue.directive('judge', {
    inserted(element) {
      const el = element;
      if (browser.isAndroid() || browser.isIPad()) {
        if (el.tagName.toLowerCase() === 'input') {
          el.readOnly = true;
        } else {
          const inputClidren = Array.prototype.slice.call(el.getElementsByTagName('input'));
          if (inputClidren.length > 0) {
            inputClidren.forEach((elItem) => {
              const ele = elItem;
              ele.readOnly = true;
            });
          }
        }
      }
    },
  });
  /**
   * 安卓下隐藏手写板
   * 例子：
   * <button type="button" class="btn btn-default"
   *   @click="handWriting" v-hideHandwritingBoard>
   *   <i class="icon icon-edit"></i>
   *   <span>手写板</span>
   * </button>
   */
  Vue.directive('hideHandwritingBoard', {
    inserted(element) {
      const el = element;
      if (browser.isAndroid() || browser.isIPad()) {
        el.style.display = 'none';
      }
    },
  });
};

export default VueKeyboard;
