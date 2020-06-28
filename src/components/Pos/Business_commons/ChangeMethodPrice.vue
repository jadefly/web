<template>
<!-- $t-做法费用修改 -->
  <Dialog
    name="PosDialog.ChangePrice"
    :title="$t('Biz.BizComm.ModifyMethodCost')"
    ref="dialog"
    :showSubmit="true"
    width="480px"
    @open="onOpen"
    @close="onClose"
    @submit="submitChangePrice"
    append-to-body
    :hotkeys="hotKeySet"
  >
    <div class="pos-dialog-content">
      <div class="ordering-changeprice-wrap">
        <el-form
          :model="method" size="small"
          label-position="left"
          class="ordering-changeprice-form"
          :rules="methodRules"
          @submit.native.prevent ref="methodForm"
          label-width="82px"
        >
        <!-- $t-制作方法 -->
          <el-form-item :label="$t('Biz.BizComm.MakingMethod')">
            {{method.name}}
          </el-form-item>
          <!-- $t-费用 -->
          <el-form-item :label="$t('Biz.BizComm.Cost')" prop="fee">
            <el-input
              v-judge ref="changePrice"
              v-keyboard:keyboard="{ mode: 'simple', autoSelect: true }"
              v-model="method.fee"
            >
            </el-input>
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
import { cloneDeep } from 'lodash';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import i18n from '@/locales/index';
import KeyBoard from '@/components/Pos/Common/KeyBoard';

const validateMoney = (rule, value, callback) => {
  const money = Number(value);
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(money)) {
    // callback(new Error('请输入正确数字'));
    callback(new Error(i18n.t('Dict.Validate.NumberMessage')));
  } else if (money < 0 || money > 999999.99) {
    // callback(new Error('请输入大于0小于999999.99的数字'));
    callback(new Error(i18n.t('Dict.Validate.NumberRangeMessage', [0, 999999.99])));
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
        fee: [
          // { required: true, message: '请输入费用金额', trigger: 'change' },
          { required: true, message: this.$t('Biz.BizComm.BizCommTip04'), trigger: 'change' },
          { validator: validateMoney, trigger: 'change' },
        ],
      },
      repeatMark: false,
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.submitChangePrice();
        },
      };
    },
  },
  methods: {
    onOpen() {
      this.method = this.resData;
      this.repeatMark = false;
      this.$nextTick(() => {
        this.$refs.changePrice.focus();
      });
    },
    onClose() {
      // 重置下
      this.$refs.methodForm.resetFields();
    },
    submitChangePrice() {
      if (!this.repeatMark) {
        this.repeatMark = true;
        this.$refs.methodForm.validate((valid) => {
          if (valid) {
            this.close();
            const methodClone = cloneDeep(this.method);
            this.method = {};
            this.submit(methodClone);
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
  >p {
    width: 100%;
    overflow: hidden;
    height: 32px;
    margin: 5px;
    >span {
      display: inline-block;
    }
    >.changePrice {
      width: 80px;
    }
    >label {
      font-weight: 100;
      position: relative;
      >sub {
        position: absolute;
        top: 8px;
        color: red;
      }
    }
    >input::-webkit-outer-spin-button,
    >input::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }
    >input{
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

.price-prefix{
  font-style: normal;
  color: rgb(51,51,51);
}
</style>
