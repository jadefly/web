<template>
  <el-form
    size="medium"
    :model='changeData'
    :rules="rules"
    @submit.native.prevent
  >
    <el-form-item :label="labelName" prop="inputNum">
      <button class="subtractBtn" @click="changeBtn('-')" :class="{disable: +this.minNum === +changeData.inputNum}"><i class="icon icon-subtract"></i></button>
      <el-input
        :style="{width:'50px', height: '36px'}"
        v-model.trim="changeData.inputNum"
        class="number-input"
        v-judge
        @input="updateInput"
      ></el-input>
      <button class="addBtn" @click="changeBtn('+')"><i class="icon icon-add"></i></button>
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  data() {
    return {
      rules: {
        inputNum: [
          { validator: this.inputNumber, trigger: ['blur', 'change'] },
        ],
      },
    };
  },
  props: {
    // key值
    labelName: {
      type: String,
      default: '',
    },
    // 数据
    changeData: {
      type: Object,
      default: null,
    },
    maxNum: {
      type: Number,
      default: 99,
    },
    minNum: {
      type: Number,
      default: 1,
    },
  },
  computed: {
  },
  methods: {
    inputNumber(rule, value, callback) {
      const val = Number(value);
      const taleNumTest = /^[1-9]\d*$/g;
      if (val === 0) { // 清空或者输入0时，值置位1
        if (this.minNum !== 0) {
          this.$message.warning(this.$t('Dict.MinmumMessage', [this.minNum])); // 最小数判断
        }
        // callback(new Error(this.$t('Dict.MinmumMessage', [1]))); // 最大值为9999999.99
        this.$set(this.changeData, 'inputNum', this.minNum);
        this.$forceUpdate();
      // eslint-disable-next-line no-restricted-globals
      } else if (isNaN(val) || !val || !taleNumTest.test(value)) { // 禁止输入数字外的字符
        this.$message.warning(this.$t('Dict.Validate.NumberMessage')); // 请输入正确数量
        this.$set(this.changeData, 'inputNum', value.toString().substr(0, value.toString().length - 1));
        // callback(new Error(this.$t('Dict.Validate.NumberMessage'))); // 请输入正确数量
      }
      if (val && val > this.maxNum) { // 限制最大输入值
        // callback(new Error(this.$t('Dict.MaximumMessage', [`${this.maxNum}`])));
        this.$message.warning(this.$t('Dict.MaximumMessage', [`${this.maxNum}`]));
        this.$set(this.changeData, 'inputNum', value.toString().substr(0, value.toString().length - 1));
        this.$forceUpdate();
      }
    },
    changeBtn(btnName) {
      const num = Number(this.changeData.inputNum);
      switch (btnName) {
        case '-':
          this.$set(this.changeData, 'inputNum', num - 1);
          this.$forceUpdate();
          break;
        default:

          this.$set(this.changeData, 'inputNum', num + 1);
          this.$forceUpdate();
          break;
      }
    },
    updateInput() {
      this.$forceUpdate();
    },
  },
};
</script>

<style lang="less" scoped>
.subtractBtn , .addBtn {
  width: 36px;
  height: 36px;
  border: 1px solid #999;
  background-color: transparent;
  border-radius: 3px;
  line-height: 33px;
  >i {
    color: #999999;
  }
  &.disable {
    border-color: #ccc;
    cursor: not-allowed;
    >i {
      color: #ccc;
    }
  }
}
.el-form-item__content {
  .number-input {
    >.el-input__inner {
      height: 37px;
    }
  }
}
</style>
