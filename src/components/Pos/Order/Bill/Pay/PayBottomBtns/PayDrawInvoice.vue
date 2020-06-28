<template>
  <Dialog
    name="PosDialog.PayDrawInvoice"
    :title="$t('Dict.Btn.DrawInvoice')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :hotkeys="PayDrawInvoice"
    :append-to-body="true"
    :showSubmit="true"
    @submit="submit"
    width="700px"
    top="20vh"
  >
  <div class="wrapper-drawinvoice">
    <div class="form" v-keyboard:keyboard>
      <div class="form-header">
        <!--建福说屏蔽掉应收金额 -183-->
        <!--<div class="form-info">-->
          <!--<strong class="form-info-left">应收金额:</strong>-->
          <!--<strong class="amount-receivable form-info-right">{{ baseBsOrigtotal }}</strong>-->
        <!--</div>-->
        <div class="form-info">
          <strong class="form-info-left">{{$t('Biz.Settlement.CanPayDrawInvoice')}}</strong>
          <strong class="form-info-left red">({{$t('Biz.Settlement.Tip34')}})</strong>
          <strong class="invoices-opened form-info-right amount-receivable">{{ canUseInvoice }}</strong>
        </div>
        <div class="form-info">
          <strong class="form-info-left">{{$t('Biz.Settlement.Invoiced')}}</strong>
          <strong class="invoices-opened form-info-right">{{ invoicesOpened | keepTwo }}</strong>
        </div>
      </div>
      <div class="form-main">
        <h2>{{$t('Biz.Settlement.SelectInvoiceType')}}:</h2>
        <el-radio-group v-model="radio">
          <div class="form-info">
            <p class="form-info-left">
              <el-radio  :label="1" :disabled="isEleRadioDisable">
                {{$t('Biz.Settlement.ElectronicInvoice')}}
                <span class="electronic-tip">({{$t('Biz.Settlement.Tip35')}})</span>
              </el-radio>
            </p>
          </div>
          <div class="form-info">
            <p class="form-info-left">
              <el-radio :label="2">{{$t('Biz.Settlement.HandInvoice')}}</el-radio>
            </p>
            <div class="invoice-value form-info-right">
              <el-input class="text-right"
                v-model="handInvoice"
                ref="handInvoiceDom"
                :placeholder="$t('Biz.Settlement.EnterInvoiceAmount')"
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
              <el-input class="text-right"
                v-model="machineInvoice"
                ref="machineInvoiceDom"
                :placeholder="$t('Biz.Settlement.EnterInvoiceAmount')"
                size="medium"
                :disabled="isMachineDisabled"
                v-judge
              ></el-input>
            </div>
          </div>
         </el-radio-group>
        <el-form :model="form" label-width="80px"  label-position='top'>
          <el-form-item :label="$t('Biz.Settlement.InvoiceRemark')" label-position='top'>
            <el-input
              type="textarea"
              :maxlength="80"
              :rows="2"
              v-model="form.remark"
              @focus="showAndroidInput('form.remark')"/>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="draw-invoice-keyboard">
      <KeyBoard :isDisabled="isHandDisabled && isMachineDisabled" class="keybord" ref="keyboard"></KeyBoard>
    </div>
  </div>
    <AndroidInput ref="AndroidInput"></AndroidInput>
  </Dialog>
</template>

<script>
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import AndroidInput from '@/components/Pos/Common/AndroidInput';
import AndroidInputMixin from '@/components/Pos/Common/AndroidInputMixin';
import numberformat from '@/common/js/numberformat';

export default {
  components: { Dialog, KeyBoard, AndroidInput },
  mixins: [DialogMixin, AndroidInputMixin],
  props: {
    electronicInvoiceData: {
      type: Object,
    },
    bsData: {
      type: Object,
    },
  },
  data() {
    return {
      machineInvoice: 0, // 机打发票
      handInvoice: 0, // 手撕发票
      invoicesOpened: 0, // 已开发票
      baseBsOrigtotal: 0, // 应收金额
      radio: 2, // 选中按钮,1为电子发票，2为手撕发票,3为机打发票
      // isOpenElectronicInvoice:false,// 是否开通电子发票业务,默认没有开通
      // isDefaultChecked:false,// 后台是否默认勾选电子发票,默认不勾选
      isHandDisabled: false, // 手撕发票输入框是否禁用
      isMachineDisabled: false, // 机打发票输入框是否禁用
      isEleRadioDisable: false, // 电子发票按钮是否可点击
      payWayList: [], // 结算方式
      canUseInvoice: 0, // 可开发票
      form: {
        remark: '', // 备注
      },
    };
  },
  computed: {
    // 添加快捷键
    PayDrawInvoice() {
      return {
        PgDn: () => {
          this.submit();
        },
      };
    },
  },
  filters: {
    keepTwo(val) {
      return numberformat(val) == '' ? 0 : numberformat(val);
    },
  },
  watch: {
    radio(val) {
      if (+val === 1) {
        // 单选按钮选中电子发票
        // 手撕发票输入框禁止输入
        this.isHandDisabled = true;
        // 机打发票输入框禁止输入
        this.isMachineDisabled = true;
        // 切换电子发票后, 手撕和机打进行有值转换数字, 无值清零
        setTimeout(() => {
          if (this.handInvoice === '') {
            this.handInvoice = 0;
          } else {
            this.handInvoice = +this.handInvoice;
          }
          if (this.machineInvoice === '') {
            this.machineInvoice = 0;
          } else {
            this.machineInvoice = +this.machineInvoice;
          }
        }, 0);
      } else if (+val === 2) {
        // 单选按钮选中手撕发票
        // 手撕发票输入可以输入
        this.isHandDisabled = false;
        // 机打发票输入框禁止输入
        this.isMachineDisabled = true;
        // 转换为数字(去除首位0)
        this.machineInvoice = +this.machineInvoice;
        // 当另一项input为空时,切换后置零,却当前input选中
        setTimeout(() => {
          this.machineInvoice === '' && (this.machineInvoice = 0);
          this.$refs.handInvoiceDom.focus();
        }, 0);
      } else if (+val === 3) {
        // 单选按钮选中机打发票
        // 手撕发票输入框禁止输入
        this.isHandDisabled = true;
        // 机打发票输入框禁止输入
        this.isMachineDisabled = false;
        // 转换为数字(去除首位0)
        this.handInvoice = +this.handInvoice;
        // 当另一项input为空时,切换后置零,却当前input选中
        setTimeout(() => {
          this.handInvoice === '' && (this.handInvoice = 0);
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
  },
  methods: {
    // 查询可开发票
    searchDrawInvoice() {
      ajax('canyin.pos.settlement.electronicinvoice', {
        contentType: 'paramsEncoded',
        needToken: true,
        data: {
          bsId: this.bsData.id,
          payway_list: this.payWayList,
        },
      }).then((res) => {
        this.canUseInvoice = res.needInvoiceMoney;
      });
    },
    onOpen() {
      this.machineInvoice = this.resData.machineInvoice;
      this.handInvoice = this.resData.handInvoice;
      this.invoicesOpened = this.resData.invoicesOpened;
      this.payWayList = this.resData.payWayList;
      // 显示应收金额
      this.baseBsOrigtotal = this.resData.baseBsOrigtotal;
      // 查询可开发票
      this.searchDrawInvoice();
    },
    submit() {
      // 点击确认更改已开发票
      if (this.handInvoice === '' || this.machineInvoice === '') {
        this.$message({
          message: `${this.$t('Biz.Settlement.Error75')}`,
          type: 'error',
        });
        return false;
      }
      const reg = /^[0-9]{0,6}(\.[0-9]{1,2})?$/g;
      if (!reg.test(Number(this.handInvoice))) {
        this.$message({
          message: `${this.$t('Biz.Settlement.Error75')}`,
          type: 'error',
        });
        return false;
      }
      // 多次重复使用同一正则,重置下一次匹配起始位置
      reg.lastIndex = 0;
      if (!reg.test(Number(this.machineInvoice))) {
        this.$message({
          message: `${this.$t('Biz.Settlement.Error75')}`,
          type: 'error',
        });
        return false;
      }
      // 可开发票金额 >= 已开发票金额 + 输入的金额
      const totalInputNumner = Number(this.machineInvoice) + Number(this.handInvoice);
      if (this.canUseInvoice < totalInputNumner) {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning44')}`);
        return false;
      }
      let isElectronicInvoice;
      if (+this.radio === 1) {
        // 是否选中了电子发票按钮
        isElectronicInvoice = true;
      } else {
        isElectronicInvoice = false;
      }
      ajax('canyin.pos.printsettle.getissettleprintinvoice', {
        contentType: 'paramsEncoded',
        needToken: true,
        data: {
          bsId: this.bsData.id,
          invoiceRemark: this.form.remark,
          isElectronicInvoice,
        },
      }).then((res) => {
        // 不做任何处理
      });
      // handInvoice
      this.$emit('drawInvoice', {
        invoicesOpened: Number(this.machineInvoice) + Number(this.handInvoice),
        machineInvoice: this.machineInvoice,
        handInvoice: this.handInvoice,
        invoiceRemark: this.form.remark,
        // "isElectronicInvoice":isElectronicInvoice
      });
      this.close();
    },
    onClose() {
      this.machineInvoice = 0; //机打发票
      this.handInvoice = 0; //手撕发票
      this.invoicesOpened = 0; //已开发票
      this.baseBsOrigtotal = 0; //应收金额
      this.isHandDisabled = false; // 手撕发票输入框是否禁用
      this.isMachineDisabled = false; // 机打发票输入框是否禁用
      this.isEleRadioDisable = false; // 电子发票按钮是否可点击
      this.form.remark = ''; // 清空备注
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.wrapper-drawinvoice {
  display: flex;
  > .form {
    max-width: 60%;
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
        > .amount-receivable {
          color: #0babb9;
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
          > .form-info-left {
            flex-grow: 1;
            font-weight: bolder;
            font-size: 14px;
            line-height: 2.5;
            // margin-right: 35px;
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
    max-width: 40%;
    flex: 1;
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
.wrapper-drawinvoice {
  .form-info-left {
    align-items: center;
    .el-radio {
      display: flex;
      align-items: center;
      height: 100%;
      white-space: inherit;
    }
  }
  .invoice-value {
    .text-right {
      .el-input__inner {
        text-align: right;
        font-weight: bolder;
        font-size: 15px;
      }
    }
  }
}
</style>
