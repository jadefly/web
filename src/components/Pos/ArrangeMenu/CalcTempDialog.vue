<template>
  <Dialog
    name="PosDialog.CalcTempDialog"
    :title="$t('Dict.PkgPrice01')"
    ref="dialog"
    @open="onOpen"
    @close="onClose"
    @submit="onSubmit"
    width="600px"
    :append-to-body="true"
    :hotkeys="hotkeys"
    :showSubmit="true"
  >
    <div class="calc-panel">
      <span class="pull-left">{{ $t('Dict.PkgPrice') }}</span>
      <span class="pull-left totalprice-span">{{totalprice}}</span>
      <span class="equal-span pull-left">=</span>
      <div class="pull-left perprice-panel">
        <el-form
          size="small"
          :model='calcData'
          :rules="rules"
          @submit.native.prevent
        >
          <el-form-item :label="$t('Dict.PerCapita')" prop="perprice" v-if="isShowCalcKey">
            <el-input
              ref="perPrice"
              v-judge
              v-model.trim="calcData.perprice"
              v-num-keyboard:bottom-right="{focusSetKeyboardPosition:'bottom'}"
              v-autotest
              size="small"
            >
              <i class="price-prefix" slot="prefix"></i>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <span class="multi-span pull-left">x</span>
      <div class="pernum-div pull-left required">
        <el-form
          size="small"
          :model='calcData'
          :rules="rules"
          @submit.native.prevent
        >
          <el-form-item :label="$t('Dict.NumberOfPeople01')" prop="pernum">
            <span class="subtractBtn pull-left" @click="perNumberMinus">-</span>
            <el-input
              :style="{width:'55px'}"
              v-model.trim="calcData.pernum"
              ref="pernum"
              v-num-keyboard:bottom-right="{focusSetKeyboardPosition:'bottom'}"
              v-judge
              v-autotest
              v-if="isShowCalcKey"
            ></el-input>
            <span class="addBtn pull-left" @click="perNumberPlus">+</span>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import { multi } from '@/common/js/math';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  data() {
    return {
      calcData: {
        perprice: 0, // 人均价格
        pernum: 1, // 人数
      },
      isShowCalcKey: false, // 是否显示数字键盘
      rules: {
        perprice: [
          { required: true, message: this.$t('Biz.ArrangeMenu.InputPerCapitaPrice'), trigger: 'change' },
          { validator: this.validateMoney, trigger: 'change' },
        ],
        pernum: [
          { validator: this.inputTableNumber, trigger: 'change' },
        ],
      },
    };
  },
  computed: {
    hotkeys() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
    // 套餐价格总价
    totalprice() {
      const price = multi(this.calcData.perprice, this.calcData.pernum);
      // eslint-disable-next-line no-restricted-globals
      return !isNaN(price) ? price : '';
    },
  },
  methods: {
    // 校验人均，控制输入
    validateMoney(rule, value, callback) {
      const pkgPriceTest = /^[0-9]+(.[0-9]{1,2})?$/g;
      const money = Number(value);
      const i = value.indexOf('.');
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(money)) {
        callback(new Error(this.$t('Dict.Validate.NumberMessage'))); // 请输入正确数字
        if (value !== '.') {
          // eslint-disable-next-line no-restricted-globals
          this.calcData.perprice = value.toString().substr(0, value.toString().length - 1);
        }
      } else if (money > 9999999.99 || money <= 0) {
        callback(new Error(this.$t('Dict.MaximumMessage', [9999999.99]))); // 最大值为9999999.99
      } else if (!+money || !pkgPriceTest.test(money) || (i !== -1 && value.substr(i + 1).length > 2)) {
        this.$message.warning(this.$t('Biz.ArrangeMenu.TwoDecimalPlaces')); // 小数点后最多两位数字
        this.calcData.perprice = value.toString().substr(0, i + 3);
      } else {
        callback();
      }
    },
    // 校验人数
    inputTableNumber(rule, value) {
      const val = Number(value);
      const taleNumTest = /^[1-9]\d*$/g;
      if (val === 0) {
        this.$message.warning(this.$t('Dict.MaximumMessage', [9999999.99])); // 最大值为9999999.99
        this.calcData.pernum = 1;
      // eslint-disable-next-line no-restricted-globals
      } else if (isNaN(val) || !val || !taleNumTest.test(value)) {
        this.$message.warning(this.$t('Biz.ArrangeMenu.InputCorrectPepleQty')); // 请输入正确人数
        this.calcData.pernum = value.toString().substr(0, value.toString().length - 1);
      }
      if (val && val > 99) {
        this.$message.warning(this.$t('Biz.ArrangeMenu.MaxPeopleQty99')); // 人数不应大于99
        this.calcData.pernum = value.toString().substr(0, value.toString().length - 1);
      }
    },
    // 打开计算器，初始化参数
    onOpen() {
      // 新建排菜单时，重置参数值
      if (!this.resData.price) {
        this.calcData.perprice = 0;
        this.calcData.pernum = 1;
      }
      this.isShowCalcKey = true;
    },
    // 关闭计算器，注销参数
    onClose() {
      this.isShowCalcKey = false;
    },
    // 确认 计算套餐价格并返回
    onSubmit() {
      if (this.isValidateNumber()) {
        const price = multi(this.calcData.perprice, this.calcData.pernum);
        this.submit(price);
        this.close();
      }
    },
    // 人数 运算 减
    perNumberMinus() {
      this.calcData.pernum = +this.calcData.pernum;
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(this.calcData.pernum) || +this.calcData.pernum === 0) {
        this.calcData.pernum = 1;
      }
      if (
        this.calcData.pernum
        // eslint-disable-next-line no-restricted-globals
        && !isNaN(this.calcData.pernum)
        && this.calcData.pernum > 1
      ) {
        this.calcData.pernum -= 1;
      }
    },
    // 人数 运算 加
    perNumberPlus() {
      this.calcData.pernum = +this.calcData.pernum;
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(this.calcData.pernum) || +this.calcData.pernum === 0) {
        this.calcData.pernum = 1;
      }
      if (
        this.calcData.pernum
        // eslint-disable-next-line no-restricted-globals
        && !isNaN(this.calcData.pernum)
        && this.calcData.pernum < 99
      ) {
        this.calcData.pernum += 1;
      }
    },
    // 校验人均和人数
    isValidateNumber() {
      let result = true;
      // 人均价格校验规则
      const perPriceTest = /^[0-9]+(.[0-9]{1,2})?$/g;
      // 人数校验规则
      const perNumTest = /^[1-9]\d*$/g;
      // 人均价格校验
      if (
        !+this.calcData.perprice
        || !perPriceTest.test(this.calcData.perprice)
        || +this.calcData.perprice > 9999999.99
      ) {
        this.$message.error({
          // 人均价格必须为小于7位的整数或含小数点两位的数字
          message: this.$t('Biz.ArrangeMenu.PerCapitaPriceLessThan7DigitNum'),
          customClass: 'arrangeMenu-message-top',
        });
        this.$refs.perPrice.select();
        result = false;
      }
      // 人数的非法数值校验
      if (!this.calcData.pernum || !perNumTest.test(this.calcData.pernum)) {
        this.$message.error({
          message: this.$t('Biz.ArrangeMenu.InputWrongPeopleQty'), // 人数输入格式错误
          customClass: 'arrangeMenu-message-top',
        });
        this.$refs.tableNum.select();
        result = false;
      }
      if (this.calcData.pernum && this.calcData.pernum > 99) {
        this.$message.error({
          message: this.$t('Biz.ArrangeMenu.MaxPeopleQty99'), // 人数不应大于99
          customClass: 'arrangeMenu-message-top',
        });
        this.$refs.tableNum.select();
        result = false;
      }
      return result;
    },
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .calc-panel{
    padding: 80px 20px 112px 35px;
    i,span{
      font-style: normal;
      line-height: 32px;
    }
    span{
      line-height: 30px;
    }
    .el-input{
      float: left;
      width: 85px;
    }
    .totalprice-span{
      height: 32px;
      min-width: 40px;
      word-wrap: break-word;
      text-align: right;
      word-break: break-all;
    }
    .equal-span{
      margin-right: 10px;
    }
    .perprice-panel{
      width: 145px;
    }
    .multi-span{
      margin: 0 10px;
    }
    .required::before{
      content: '*';
      color: #f56c6c;
      margin-right: 4px;
      float: left;
      line-height: 32px;
    }
    .pernum-div{
      width: 196px;
      span {
        padding: 0px 13px;
        border-radius: 5px;
        border: 1px solid #ccc;
        cursor: pointer;
        background: #fff;
      }
      .subtractBtn {
        margin-right: 2px;
        vertical-align: middle;
      }
      .addBtn {
        margin-left: 2px;
        vertical-align: middle;
      }
    }
  }
</style>

<style lang="less">
.calc-panel .perprice-panel {
  .el-form-item__label {
    padding-right: 0;
  }
  .el-form-item__error {
    padding-top: 0;
  }
  .el-form-item__content{
    margin-left: 55px;
  }
}
</style>
