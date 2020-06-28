<template>
  <Dialog
    name="PosDialog.BilledCompInovicModal2"
    :title="$t('Biz.UserDesktop.SearchPrint.BilledStatementBtn2')"
    ref="dialog"
    @open="onOpen"
    @close="onClose"
    @submit="onSubmit"
    :hotkeys="addHotkeys"
    :append-to-body="true"
    :showSubmit="true"
    width="700px"
    top="20vh"
  >
  <div class="content billed-complnvoic-modal">
    <div class="form" v-keyboard:keyboard>
      <div class="form-header">
        <div class="form-info">
          <strong class="form-info-left">{{$t('Biz.Settlement.CanPayDrawInvoice')}}</strong>
          <strong class="form-info-left red">{{$t('Biz.UserDesktop.SearchPrint.BilledCModalStrong2')}}</strong>
          <strong class="form-info-right">{{ canUseInvoice }}</strong>
        </div>
        <div class="form-info">
          <strong class="form-info-left">{{$t('Biz.Settlement.Invoiced')}}:</strong>
          <strong class="form-info-right">{{ showMoney | keepTwo }}</strong>
        </div>
      </div>
      <div class="form-main">
        <h2>{{$t('Biz.Settlement.SelectInvoiceType')}}:</h2>
        <el-radio-group v-model="radio">
          <div class="form-info">
            <p class="form-info-left">
              <el-radio  :label="1" :disabled="isEleRadioDisable">{{$t('Biz.Settlement.ElectronicInvoice')}}
                <span class="electronic-tip">&nbsp;&nbsp;&nbsp;&nbsp;{{$t('Biz.UserDesktop.SearchPrint.BilledCModalSpan1')}}</span>
              </el-radio>
            </p>
          </div>
          <div class="form-info">
            <p class="form-info-left">
              <el-radio :label="2">{{$t('Biz.Settlement.HandInvoice')}}</el-radio>
            </p>
            <div class="invoice-value form-info-right">
              <el-input
                class="text-right"
                v-model="form.handInvoice"
                ref="handInvoiceDom"
                :placeholder="$t('Biz.UserDesktop.SearchPrint.BilledCModalPh1')"
                size="medium"
                :disabled="isHandDisabled"
                v-judge
              ></el-input>
            </div>
          </div>
          <div class="form-info">
            <p class="form-info-left">
              <el-radio  :label="3">{{$t('Biz.Settlement.MachineInvoice')}}</el-radio>
            </p>
            <div class="invoice-value form-info-right">
              <el-input
                class="text-right"
                v-model="form.machineInvoice"
                ref="machineInvoiceDom"
                :placeholder="$t('Biz.UserDesktop.SearchPrint.BilledCModalPh1')"
                size="medium"
                :disabled="isMachineDisabled"
                v-judge
              ></el-input>
            </div>
          </div>
        </el-radio-group>
        <el-form label-width="80px"  label-position='top'>
          <el-form-item :label="$t('Biz.UserDesktop.SearchPrint.BilledCModalLabel1')" label-position='left'>
            <el-input type="textarea" resize="none" :maxlength="80" :rows="2"
            v-model="form.remark" @focus="showAndroidInput('form.remark')"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <AndroidInput ref="AndroidInput"></AndroidInput>
    <div class="draw-invoice-keyboard">
      <KeyBoard
        class="keybord"
        ref="keyboard"
        :isDisabled="isMachineDisabled && isHandDisabled"></KeyBoard>
    </div>
  </div>
  </Dialog>
</template>

<script>
import { MessageBox } from 'element-ui';
import AndroidInput from '@/components/Pos/Common/AndroidInput';
import AndroidInputMixin from '@/components/Pos/Common/AndroidInputMixin';
import ajax from '@/common/js/ajax';
import * as MathUtil from '@/common/js/math';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import numberformat from '@/common/js/numberformat';

export default {
  components: { Dialog, KeyBoard, AndroidInput },
  mixins: [DialogMixin, AndroidInputMixin],
  props: {
  },
  data() {
    return {
      showMoney: 0, // 已开发票金额
      radio: 2, // 选中按钮,1为电子发票，2为手撕发票,3为机打发票
      electronicInvoiceData: {}, // 电子发票业务基础数据
      isHandDisabled: false, // 手撕发票输入框是否禁用
      isMachineDisabled: false, // 机打发票输入框是否禁用
      isEleRadioDisable: false, // 电子发票按钮是否可点击
      rowData: {},
      form: {
        machineInvoice: 0, // 机打发票
        remark: '', // 备注
        handInvoice: 0, // 手撕发票
      },
      canUseInvoice: 0, // 可开发票
    };
  },
  filters: {
    keepTwo(val) {
      return numberformat(val) == '' ? 0 : numberformat(val);
    },
  },
  computed: {
    addHotkeys() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  watch: {
    radio(val) {
      if (val == 1) {
        // 单选按钮选中电子发票
        // 手撕发票输入框禁止输入
        this.isHandDisabled = true;
        // 机打发票输入框禁止输入
        this.isMachineDisabled = true;
        // 切换电子发票后, 手撕和机打进行有值转换数字, 无值清零
        setTimeout(() => {
          if (this.form.handInvoice == '') {
            this.form.handInvoice = 0;
          } else {
            this.form.handInvoice = +this.form.handInvoice;
          }
          if (this.form.machineInvoice == '') {
            this.form.machineInvoice = 0;
          } else {
            this.form.machineInvoice = +this.form.machineInvoice;
          }
        }, 0);
      } else if (+val === 2) {
        // 单选按钮选中手撕发票
        // 手撕发票输入可以输入
        this.isHandDisabled = false;
        // 机打发票输入框禁止输入
        this.isMachineDisabled = true;
        // 转换为数字(去除首位0)
        this.form.machineInvoice = +this.form.machineInvoice;
        // 当另一项input为空时,切换后置零,却当前input选中
        setTimeout(() => {
          if (this.form.machineInvoice == '') {
            this.form.machineInvoice = 0;
          }
          this.$refs.handInvoiceDom.focus();
        }, 0);
      } else if (+val === 3) {
        // 单选按钮选中机打发票
        // 手撕发票输入框禁止输入
        this.isHandDisabled = true;
        // 机打发票输入框禁止输入
        this.isMachineDisabled = false;
        // 转换为数字(去除首位0)
        this.form.handInvoice = +this.form.handInvoice;
        // 当另一项input为空时,切换后置零,却当前input选中
        setTimeout(() => {
          if (this.form.handInvoice == '') {
            this.form.handInvoice = 0;
          }
          this.$refs.machineInvoiceDom.focus();
        }, 0);
      }
    },
    electronicInvoiceData(val) {
      if (!val.isOpenElectronicInvoice) { // 如果没有开启电子发票选项 电子发票按钮禁用
        this.isEleRadioDisable = true;
      }
      switch (+val.defaultInvoiceType) {
        case 0:
          // 默认无
          this.radio = 0;
          this.isHandDisabled = true; // 手撕发票输入框是否禁用
          this.isMachineDisabled = true; // 机打发票输入框是否禁用
          break;
        case 1:
          if (!val.isOpenElectronicInvoice) {
            this.radio = 0;
          } else {
            this.radio = 1;
          }
          this.isHandDisabled = true; // 手撕发票输入框是否禁用
          this.isMachineDisabled = true; // 机打发票输入框是否禁用
          break;
        case 2:
          this.radio = 2;
          this.isHandDisabled = false; // 手撕发票输入框是否禁用
          this.isMachineDisabled = true; // 机打发票输入框是否禁用
          break;
        case 3:
          this.radio = 3;
          this.isHandDisabled = true; // 手撕发票输入框是否禁用
          this.isMachineDisabled = false; // 机打发票输入框是否禁用
          break;
        default:
          this.radio = 0;
          this.isHandDisabled = true; // 手撕发票输入框是否禁用
          this.isMachineDisabled = true; // 机打发票输入框是否禁用
          break;
      }
    },
    'form.handInvoice': {
      handler(val) {
        this.$nextTick(() => {
          this.form.handInvoice = this.onlyNumber(val, 2);
        });
      },
      deep: true,
    },
    'form.machineInvoice': {
      handler(val) {
        this.$nextTick(() => {
          this.form.machineInvoice = this.onlyNumber(val, 2);
        });
      },
      deep: true,
    },
  },
  methods: {
    // 查询可开发票
    searchDrawInvoice() {
      ajax('canyin.pos.settlement.electronicinvoice', {
        contentType: 'paramsEncoded',
        data: {
          bsId: this.rowData.data0,
        },
      }).then((res) => {
        this.canUseInvoice = res.needInvoiceMoney;
      });
    },
    onOpen() {
      this.rowData = this.resData.rowData;
      this.showMoney = this.rowData.invoice;
      this.form = {
        machineInvoice: 0, // 机打发票
        remark: '', // 备注
        handInvoice: 0, // 手撕发票
      };
      ajax('canyin.pos.fillininvoice.tsinvoicemoney', {
        contentType: 'URLEncoded',
        data: {
          tsId: this.rowData.tsId,
          bsId: this.rowData.data0,
        },
      }).then((data) => {
        this.electronicInvoiceData = {
          isDefaultChecked: data.isDefaultChecked, // 是否默认选中xxx (不以这个字段判断了)
          isOpenElectronicInvoice: data.isOpenElectronicInvoice, // 是否启用了电子发票
          defaultInvoiceType: data.defaultInvoiceType, // 默认选中那个单选框
        };
        // 增加电子发票金额计算
        if (data.tearingInvoiceMoney === undefined
          && data.invoiceMoney === undefined
          && data.electronicInvoiceMoney === undefined) {
          this.showMoney = 0;
        } else {
          const tearingInvoiceMoney = data.tearingInvoiceMoney ? data.tearingInvoiceMoney : 0;
          const invoiceMoney = data.invoiceMoney ? data.invoiceMoney : 0;
          const electronicInvoiceMoney = data.electronicInvoiceMoney ? data.electronicInvoiceMoney : 0;
          const money = MathUtil.add(tearingInvoiceMoney, invoiceMoney);
          this.showMoney = MathUtil.add(money, electronicInvoiceMoney);
        }

        if (
          data.tearingInvoiceMoney !== undefined
          && data.invoiceMoney !== undefined
        ) {
          this.form.machineInvoice = data.invoiceMoney;
          this.form.handInvoice = data.tearingInvoiceMoney;
        }

        // 在补开发票界面显示结算界面中输入的结算备注
        if (data.invoiceRemark != undefined || data.invoiceRemark != null || data.invoiceRemark != '') {
          this.form.remark = data.invoiceRemark;
        }
      }).catch((code, msg) => {
        this.close();
        MessageBox.alert(msg, this.$t('Dict.WrongInfo'));
      });
      this.$vonce('authCode', (code) => {
        this.onSubmit(code);
      });
      // 查询可开发票
      this.searchDrawInvoice();
    },
    onClose() {
      this.radio = 0;
      this.showMoney = 0; // 已开发票金额
      this.rowData = {};
      this.from = {
        machineInvoice: 0,
        handInvoice: 0,
        remark: '',
      };
      this.canUseInvoice = 0;
    },
    onSubmit(authData = {}) {
      // 点击确认更改已开发票
      if (this.form.handInvoice === '' || this.form.machineInvoice === '') {
        this.$message({
          message:
          this.$t('Biz.UserDesktop.SearchPrint.BilledCModalMsg2'),
          type: 'error',
        });
        return;
      }
      const reg = /^[0-9]{0,6}(\.[0-9]{1,2})?$/g;
      if (!reg.test(Number(this.form.handInvoice))) {
        this.$message({
          message:
          this.$t('Biz.UserDesktop.SearchPrint.BilledCModalMsg2'),
          type: 'error',
        });
        return;
      }
      // 多次重复使用同一正则,重置下一次匹配起始位置
      reg.lastIndex = 0;
      if (!reg.test(Number(this.form.machineInvoice))) {
        this.$message({
          message:
          this.$t('Biz.UserDesktop.SearchPrint.BilledCModalMsg3'),
          type: 'error',
        });
        return;
      }
      // 可开发票金额 >= 已开发票金额 + 输入的金额
      const totalInputNumner = Number(this.form.machineInvoice) + Number(this.form.handInvoice);
      if (this.canUseInvoice < totalInputNumner) {
        this.$message.warning(this.$t('Biz.Settlement.Warning44'));
        return;
      }
      if (!isNaN(Number(this.form.machineInvoice)) || !isNaN(Number(this.form.handInvoice))) {
        // const data = {
        //   invoiceMoney: this.form.machineInvoice || 0,
        //   tearingInvoiceMoney: this.form.handInvoice || 0,
        //   invoiceRemark: this.form.remark,
        // };
        // data.params = JSON.stringify({
        //   invoiceType: this.radio,
        //   invoiceMoney: this.form.machineInvoice || 0,
        //   tearingInvoiceMoney: this.form.handInvoice || 0,
        //   this.rowData.tsId,
        //   invoiceRemark: this.form.remark,
        //   // settleRemark: this.remark,
        //   isReport: true,
        //   ...authData,
        // });
        ajax('canyin.pos.fillininvoice.doinvoicemoney', {
          contentType: 'paramsEncoded',
          data: {
            invoiceType: this.radio,
            invoiceMoney: this.form.machineInvoice || 0,
            tearingInvoiceMoney: this.form.handInvoice || 0,
            tsId: this.rowData.tsId,
            invoiceRemark: this.form.remark,
            isReport: true,
            ...authData,
          },
        }).then((res) => {
          if (res.success && res.result === 1) {
            this.$message.success(`${res.data.msg}`);
            this.$emit('refreshTableList');
            this.close();
          } else {
            this.$message.warning(`${res.msg}`);
          }
        });
      } else {
        this.$message.warning(this.$t('Biz.UserDesktop.SearchPrint.BilledCModalMsg5'));
      }
    },
    // 输入框辅助函数
    onlyNumber(val, fixed = 2) {
      let str = '';
      const tmp = new RegExp(`^(\\-)*(\\d+)\\.(\\d{0,${fixed}}).*$`, 'g');
      str += val;
      str = str.replace(/[^\d.]/g, '');
      str = str.replace(/\.{2,}/g, '.');
      str = str.replace('.', '$#$');
      str = str.replace(/\./g, '');
      str = str.replace('$#$', '.');
      str = str.replace(tmp, '$1$2.$3');
      if (str.indexOf('.') === 0 && str !== '') {
        str = '';
      }
      if (str.indexOf('.') < 0 && str !== '') {
        str = parseFloat(str);
      }
      return str;
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.billed-complnvoic-modal {
  display: flex;
  > .form {
    background-color: #fff;
    flex: 1;
    > .form-header {
      padding: 10px 16px;
      border-bottom: 1px dashed #ccc;
      > .form-info {
        width: 100%;
        padding-top: 10px;
        padding-bottom: 5px;
        font-size: 15px;
        display: table;
        > .form-info-left {
          display: table-cell;
          vertical-align: middle;
        }
        > .red {
          color: red;
          font-size: 10px;
        }
        > .form-info-right {
          display: table-cell;
          text-align: right;
          vertical-align: middle;
        }
      }
    }
    > .form-main {
      width: 100%;
      padding: 16px 16px 16px 16px;
      > h2 {
        font-size: 15px;
        font-weight: bolder;
      }
      > .el-radio-group {
        width: 100%;
        > .form-info {
          width: 100%;
          padding-top: 10px;
          padding-bottom: 10px;
          display: flex;
          /*align-items: center;*/
          > .form-info-left {
            flex-grow: 1;
            font-weight: bolder;
            font-size: 14px;
            line-height: 2.5;
            // margin-right: 35px;
          }
          > .require {
            position: relative;
            &:before {
              content: '*';
              position: absolute;
              left: -8px;
              top: 2px;
              color: #f56c6c;
            }
          }
          > .form-info-right {
            flex-grow: 1;
            font-weight: bolder;
            text-align: right;
            vertical-align: middle;
          }
        }
      }
    }
  }
  .draw-invoice-keyboard {
    flex-basis: 300px;
    > .keybord {
      margin: 25px auto 0 auto;
    }
  }
  .electronic-tip {
    color: red;
    font-size: 13px;
    font-weight: 400;
  }
}
</style>
<style lang="less">
.billed-complnvoic-modal {
  .form-info-left {
    align-items: center;
    .el-radio {
      display: flex;
      align-items: center;
      height: 100%;
      white-space: inherit;
    }
  }
  .text-right {
    .el-input__inner {
      text-align: right;
      font-weight: bolder;
      font-size: 15px;
    }
  }
  .el-form-item {
    display: flex;
    label {
      display: inline-block;
      margin-right: 10px;
      color: #333;
    }
    .el-form-item__content {
      flex: 1;
    }
  }
}
</style>
