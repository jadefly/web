<template>
  <!-- $t-做法数量修改 -->
  <Dialog
    name="PosDialog.changeMethodQty"
    :title="$t('Biz.BizComm.ChangeMethodQty')"
    ref="dialog"
    :showSubmit="true"
    width="480px"
    @open="onOpen"
    @close="onClose"
    @submit="submitChangeMethodQty"
    append-to-body
    :hotkeys="hotKeySet"
    submitId="PosDialogChangeMethodQty"
  >
    <div class="pos-dialog-content">
      <div class="ordering-changeprice-wrap">
        <el-form
          :model="method"
          size="small"
          label-position="left"
          class="ordering-changeprice-form"
          :rules="methodRules"
          ref="changeMethodQtyForm"
          label-width="78px"
          @submit.native.prevent
        >
          <!-- $t-制作方法 -->
          <el-form-item :label="$t('Biz.BizComm.MakingMethod')">{{method.name}}</el-form-item>
          <!-- $t-数量 -->
          <el-form-item :label="$t('Dict.AmountLabel')" prop="qty">
            <el-input
              ref="changeQty"
              v-keyboard:keyboard="{ mode: 'simple', autoSelect: true }"
              v-model="method.qty"
              v-judge
              v-autotest
            ></el-input>
          </el-form-item>
        </el-form>
        <div class="ordering-changeprice-keyboard">
          <KeyBoard ref="keyboard"></KeyBoard>
        </div>
      </div>
    </div>
  </Dialog>
</template>
<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import i18n from '@/locales/index';

const validateMethodQty = (rule, value, callback) => {
  const methodQty = Number(value);
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(methodQty)) {
    // callback(new Error('请输入正确数字'));
    callback(new Error(i18n.t('Dict.Validate.NumberMessage')));
  } else if (methodQty <= 0 || methodQty > 999999.9) {
    // callback(new Error('请输入大于0小于999999.99的数字'));
    callback(new Error(i18n.t('Dict.Validate.NumberRangeMessage', [0, 999999.9])));
  } else if ((`${methodQty}`).indexOf('.') !== -1 && (`${methodQty}`).split('.')[1].length > 1) {
    // callback(new Error('小数点后保留一位数'));
    callback(new Error(i18n.t('Dict.Validate.DecimalPlacesMessage', ['一'])));
  } else {
    callback();
  }
};

export default {
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin],
  data() {
    return {
      method: {
      },
      methodRules: {
        qty: [
          // { required: true, message: '请输入做法数量', trigger: 'change' },
          { required: true, message: this.$t('Biz.BizComm.BizCommTip06'), trigger: 'change' },
          { validator: validateMethodQty, trigger: 'change' },
        ],
      },
      repeatMark: false, // 防重复提交标识
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.submitChangeMethodQty();
        },
      };
    },
  },
  methods: {
    onOpen() {
      this.method = this.resData;
      this.repeatMark = false;
      this.$nextTick(() => {
        this.$refs.changeQty.focus();
        if (this.$refs.keyboard) {
          this.$refs.keyboard.reSelect();
        }
      });
    },
    onClose() {
      // 初始化下重置
      this.$refs.changeMethodQtyForm.resetFields();
    },
    submitChangeMethodQty() {
      if (!this.repeatMark) {
        this.repeatMark = true;
        this.$refs.changeMethodQtyForm.validate((valid) => {
          if (valid) {
            const submitQty = this.method.qty;
            // 如果存在限定的数量则判断提示下
            if (
              (this.method.maxQty || this.method.maxQty === 0)
              && submitQty > this.method.maxQty
            ) {
              this.repeatMark = false;
              // this.$message.error('超出当前做法组限定的数量');
              this.$message.error(this.$t('Biz.BizComm.BizCommTip07'));
            } else {
              this.close();
              this.submit(submitQty);
            }
          } else {
            this.repeatMark = false;
          }
        });
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.ordering-changeprice-wrap {
  padding-top: 12px;
  padding-bottom: 25px;
  background-color: @white;
  .clearfix();
}
.ordering-changeprice-form {
  width: 245px;
  float: left;
  padding: 20px;
  > p {
    width: 100%;
    overflow: hidden;
    height: 32px;
    margin: 5px;
    > span {
      display: inline-block;
    }
    > .changePrice {
      width: 80px;
    }
    > label {
      font-weight: 100;
      position: relative;
      > sub {
        position: absolute;
        top: 8px;
        color: red;
      }
    }
    > input::-webkit-outer-spin-button,
    > input::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }
    > input {
      -moz-appearance: textfield;
    }
  }
}
.ordering-changeprice-keyboard {
  float: right;
  margin-right: 15px;
  width: 186px;
  overflow: hidden;
}

.price-prefix {
  font-style: normal;
  color: rgb(51, 51, 51);
}
</style>
