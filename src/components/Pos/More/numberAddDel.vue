<template>
  <span class="numberAddDell">
    <button type="button" class="count-delete" :class="(disabled_del||inputNum<=limitMin)?'gray':''" @click="CountLimit('-')">-</button>
    <input
      v-num-keyboard:[keyboard_align]
      type="text"
      @input="handleInput"
      v-model="inputNumChild"
      class="count-input"
      maxlength="14"
      v-judge
      v-autotest
    >
    <button type="button" class="count-add" :class="(disabled_add||inputNum>=limitMax)?'gray':''"  @click="CountLimit('+')">+</button>
  </span>
</template>

<script>
import { mapState } from 'vuex';
import { Message } from 'element-ui';
import i18n from '@/locales/index';
import { decimal } from '@/common/util/RegExpCheck';
import { add, multi, sub } from '@/common/js/math';
export default {
  props: {
    inputNum: {
      // type: String,
      default: '',
    },
    orderedNum: { // 已点该品项的数量 用于限量
      type: Number,
      default: 0,
    },
    limitMax: {
      type: Number,
      default: Number.MAX_VALUE,
    },
    limitMin: {
      type: Number,
      default: 0,
    },
    limitNum: { // 限量，只有品项数量时使用
      type: Number,
      default: -1, // 默认为-1，无限量
    },
    isAllow0: { // 允许限量为 0 时继续加单 只有品项数量时使用
      type: Boolean,
      default: true,
    },
    showToast: { // 是否toast提示
      type: Boolean,
      default: false, // 默认不提示
    },
    keyboard_align: { // 数字键盘的方向
      type: String,
      default: 'right',
    },
    decimalDigit: { // 是否允许小数, 默认为0，为整数，如果有值则保留n位
      type: Number,
      default: 0,
    },
    setTimeoutNum: { // 设置延时，为了在限数量时，可连续输入，默认为0不延迟
      type: Number,
      default: 0,
    },
    numAllowZero: { // num是否允许为0， 数量时不能为0，变为1 ??
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      disabled_add: false,
      disabled_del: false,
      inputNumChild: '',
    }
  },
  mounted() {
    this.inputNumChild = this.inputNum;
  },
  methods: {
    // 限量-品项总数的限制
    limit_num(num) {
      let limitNum = this.limitNum - this.orderedNum;
      if (!this.isAllow0 && this.limitNum && num > limitNum) {
        num = limitNum;
        Message.warning(`限量为${this.limitNum}`); // 限量为{0}
        // Message.warning(i18n.t('Biz.BizComm.BizCommTip14', [this.limitNum])); // 限量为{0}
        return { num, tag: false };
      }
      if (num === limitNum) this.disabled_add = true; // +不可点
      return { num, tag: true };
    },
    // 最大/最小数限制 单行个数限制，有做法会分开加单
    limit_Max(num, limitMax) {
      if (limitMax && num > limitMax) {
        num = limitMax;
        if (this.showToast) {
          Message.warning(`最大数量限制为${limitMax}`); // 最大数量限制为{0}
          // Message.warning(i18n.t('Biz.BizComm.BizCommTip13', [limitMax])); // 加单最大数量限制为{0}
        }
        return { num, tag: false };
      };
      return { num, tag: true };
    },
    limite(num) {
      // console.log('limit', num, this.limitNum);
      if (num === '') return;
      if (!this.numAllowZero && +num === 0) { // 数量不能为0，变为1
        this.inputNumChild = 1;
        if (this.showToast) {
          Message.warning(`不能为0`);
        }
        return;
      }
      this.disabled_add = false;
      this.disabled_del = false;

      // 1.单数最小数量限制
      if (this.limitMin && num < this.limitMin) {
        this.disabled_del = true;
        this.inputNumChild = this.limitMin;
        if (this.showToast) {
          Message.warning(`最小数量限制为${this.limitMin}`); // 最小数量限制为{0}
          // Message.warning(i18n.t('Biz.BizComm.BizCommTip12', [this.limitMin])); // 最小数量限制为{0};
        }
        return;
      }
      // 2.限量小于最大值时，先判断限量
      let result;
      if (this.limitNum !== -1 && this.limitNum < this.limitMax) {
        result = this.limit_num(num);
        if (result.num !== num) this.$emit('changeLimit', this.inputNumChild);
        this.inputNumChild = result.num;
        if (!result.tag) {
          this.disabled_add = true;
          return;
        }
      }
      // 3.再判断最大值
      result = this.limit_Max(num, this.limitMax);
      this.inputNumChild = result.num;
      if (!result.tag) {
        this.disabled_add = true; // +不可点
        return;
      }
      // 更新数值
      this.$emit('changeLimit', num);
    },
    handleInput(e) {
      // 做延时处理--用户连续输入时
      setTimeout(() => {
        let val = e.target.value;
        if (this.decimalDigit === 0) {
          val = val.replace(/[^\d]/g, ''); // 整数
        } else { // 小数-最多n位小数
          val = decimal(val, this.decimalDigit);
        }
        this.limite(val);
      }, this.setTimeoutNum);
    },
    CountLimit(type) {
      let val = 0;
      if (type === '-') {
        if (this.disabled_del) return;
        val = !isNaN(+this.inputNumChild) && +this.inputNumChild >= 1 ? sub(parseFloat(this.inputNumChild), 1) : 0;
      } else if (type === '+') {
        if (this.disabled_add) return;
        val = !isNaN(+this.inputNumChild) ? add(parseFloat(this.inputNumChild), 1) : 0;
      }
      this.limite(val);
    },
  },
  watch: {
    inputNum(newVal) {
      this.inputNumChild = newVal;
    },
    limitMax() {
      this.limite(this.inputNumChild); // 更新限量btn+
    },
    limitNum() {
      this.limite(this.inputNumChild); // 更新限量btn+
    },
  },
};
</script>
<style lang="less">
.numberAddDell .count-input{ width: 50px; margin: 0 4px;}
</style>
<style lang="less" scoped>
.numberAddDell{
  display: flex;
  .count-add, .count-delete, .count-input{
    border-radius: 5px;
    background: #fff;
    height: 36px;
    border: 1px solid #b5b5b5;
    text-align: center;
  }
  .count-delete, .count-add{ width: 36px; font-size: 18px; line-height: 0;}
  .gray{ background: #F5F5F5; color:#ccc; cursor: not-allowed; }
}
</style>
