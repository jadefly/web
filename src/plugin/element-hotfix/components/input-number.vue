<template>
  <div class="el-input-number"
    :class="[
      inputNumberSize ? 'el-input-number--' + inputNumberSize : '',
      { 'is-disabled': inputNumberDisabled },
      { 'is-without-controls': !controls },
      { 'is-controls-right': controlsAtRight }
    ]"
  >
    <span
      class="el-input-number__decrease"
      role="button"
      v-if="controls"
      :class="{'is-disabled': minDisabled}"
      @click="decrease"
    >
      <i :class="`el-icon-${controlsAtRight ? 'arrow-down' : 'minus'}`"></i>
    </span>
    <span
      class="el-input-number__increase"
      role="button"
      v-if="controls"
      :class="{'is-disabled': maxDisabled}"
      @click="increase"
    >
      <i :class="`el-icon-${controlsAtRight ? 'arrow-up' : 'plus'}`"></i>
    </span>
    <el-input
      ref="input"
      :value="currentValue"
      :disabled="inputNumberDisabled"
      :size="inputNumberSize"
      :max="max"
      :min="min"
      :name="name"
      :label="label"
      @keydown.up.native.prevent="increase"
      @keydown.down.native.prevent="decrease"
      @blur="handleBlur"
      @focus="handleFocus"
      @change="handleInputChange"
      @input="handleInputChange"
    >
      <template slot="prepend" v-if="$slots.prepend">
        <slot name="prepend"></slot>
      </template>
      <template slot="append" v-if="$slots.append">
        <slot name="append"></slot>
      </template>
    </el-input>
  </div>
</template>
<script>
import Focus from 'element-ui/src/mixins/focus';

export default {
  name: 'ElInputNumber',
  mixins: [Focus('input')],
  inject: {
    elForm: {
      default: '',
    },
    elFormItem: {
      default: '',
    },
  },
  props: {
    step: {
      type: Number,
      default: 1,
    },
    max: {
      type: Number,
      default: Infinity,
    },
    min: {
      type: Number,
      default: -Infinity,
    },
    value: {},
    disabled: Boolean,
    size: String,
    controls: {
      type: Boolean,
      default: true,
    },
    controlsPosition: {
      type: String,
      default: '',
    },
    name: String,
    label: String,
    numPrecision: {
      type: Number,
      validator(val) {
        return val >= 0 && val === parseInt(val, 10);
      },
    },
  },
  data() {
    return {
      currentValue: 0,
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(value) {
        let newVal = value === undefined ? value : Number(value);
        if (newVal !== undefined && isNaN(newVal)) return;
        if (newVal >= this.max) newVal = this.max;
        if (newVal <= this.min) newVal = this.min;
        if (this.numPrecision !== undefined) {
          newVal = this.toPrecision(newVal, this.numPrecision);
        }
        this.currentValue = newVal;
        this.$emit('input', newVal);
      },

    },
  },
  computed: {
    minDisabled() {
      return this._decrease(this.value, this.step) < this.min;
    },
    maxDisabled() {
      return this._increase(this.value, this.step) > this.max;
    },
    precision() {
      const { value, step, getPrecision } = this;
      return Math.max(getPrecision(value), getPrecision(step));
    },
    controlsAtRight() {
      return this.controlsPosition === 'right';
    },
    _elFormItemSize() {
      return (this.elFormItem || {}).elFormItemSize;
    },
    inputNumberSize() {
      return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
    },
    inputNumberDisabled() {
      return this.disabled || (this.elForm || {}).disabled;
    },
  },
  methods: {
    toPrecision(num, precision) {
      if (precision === undefined) precision = this.precision;
      return parseFloat(parseFloat(Number(num).toFixed(precision)));
    },
    getPrecision(value) {
      if (value === undefined) return 0;
      const valueString = value.toString();
      const dotPosition = valueString.indexOf('.');
      let precision = 0;
      if (dotPosition !== -1) {
        precision = valueString.length - dotPosition - 1;
      }
      return precision;
    },
    _increase(val, step) {
      if (typeof val !== 'number' && val !== undefined) return this.currentValue;
      const precisionFactor = Math.pow(10, this.precision);
      // Solve the accuracy problem of JS decimal calculation by converting the value to integer.
      return this.toPrecision((precisionFactor * val + precisionFactor * step) / precisionFactor);
    },
    _decrease(val, step) {
      if (typeof val !== 'number' && val !== undefined) return this.currentValue;
      const precisionFactor = Math.pow(10, this.precision);
      return this.toPrecision((precisionFactor * val - precisionFactor * step) / precisionFactor);
    },
    increase() {
      if (this.inputNumberDisabled || this.maxDisabled) return;
      const value = this.value || 0;
      const newVal = this._increase(value, this.step);
      this.setCurrentValue(newVal);
    },
    decrease() {
      if (this.inputNumberDisabled || this.minDisabled) return;
      const value = this.value || 0;
      const newVal = this._decrease(value, this.step);
      this.setCurrentValue(newVal);
    },
    handleBlur(event) {
      this.$emit('blur', event);
      const tarVal = Number(event.target.value);
      // 失去焦点要做下空值和最小值的判断，如果空值小于最小值就为0；
      const val = tarVal <= this.min || isNaN(tarVal) ? this.min : Number(event.target.value);
      this.$refs.input.setCurrentValue(val);
    },
    handleFocus(event) {
      this.$emit('focus', event);
    },
    setCurrentValue(newVal) {
      const oldVal = this.currentValue;
      if (typeof newVal === 'number' && this.numPrecision !== undefined) {
        newVal = this.toPrecision(newVal, this.numPrecision);
      }
      if (newVal !== '') {
        if (newVal >= this.max) newVal = this.max;
        if (newVal <= this.min) newVal = this.min;
        if (oldVal === newVal && +oldVal !== this.min) {
          this.$refs.input.setCurrentValue(this.currentValue);
          return;
        }
      }
      this.$emit('change', newVal, oldVal);
      this.$emit('input', newVal);
      this.currentValue = newVal;
    },
    handleInputChange(value) {
      const newVal = Number(value);
      if (!isNaN(newVal) || value === '') {
        this.setCurrentValue(value);
      } else if (+this.currentValue !== +this.min) {
        this.setCurrentValue(this.currentValue);
      }
    },
  },
  mounted() {
    const innerInput = this.$refs.input.$refs.input;
    innerInput.setAttribute('role', 'spinbutton');
    innerInput.setAttribute('aria-valuemax', this.max);
    innerInput.setAttribute('aria-valuemin', this.min);
    innerInput.setAttribute('aria-valuenow', this.currentValue);
    innerInput.setAttribute('aria-disabled', this.inputNumberDisabled);
  },
  updated() {
    const innerInput = this.$refs.input.$refs.input;
    innerInput.setAttribute('aria-valuenow', this.currentValue);
  },
};
</script>
