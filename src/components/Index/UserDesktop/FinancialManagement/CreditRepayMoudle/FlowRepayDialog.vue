<template>
  <Dialog
    name="PosDialog.FlowRepayDialog"
    :title="$t('Dict.OrdinaryRepayment')"
    ref="dialog"
    @open="onOpen"
    @close="onClose"
    @submit="onSubmit"
    :showSubmit="true"
    width="840px"
    height="600px"
    :hotkeys="hotKeySet"
  >
    <div class="flow-repay-wrapper">
      <div class="left-account">
        <h1 class="account">{{ accountRepayData.unpaidPersonInfo }}</h1>
        <BillRepayInfo :accountInfo="accountRepayData"></BillRepayInfo>
        <el-form
          ref="repayForm"
          :model="repayForm"
          :rules="repayRules"
          label-width="120px"
          class="flow-repay-form">
          <el-form-item :label="$t('Biz.UserDesktop.UserDesktopMsg113')">
            <el-input v-model="repayForm.unpaidMoney" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item :label="$t('Dict.RepaymentAmountLabel')">
            <el-input v-model="lastPaidMoney" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item :label="$t('Dict.PreferentialAmountLabel')" prop="discountMoney">
            <el-input v-model="repayForm.discountMoney"></el-input>
          </el-form-item>
          <el-form-item :label="$t('Dict.SettlementMethodLabel')">
            <el-button style="width: 100%" @click="openPaywayDialog">
              {{ paywayName }}
            </el-button>
          </el-form-item>
          <el-form-item :label="$t('Dict.Remarkss')" prop="remark">
            <el-input v-model="repayForm.remark"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="right-table">
        <h1 class="title">{{$t('Biz.UserDesktop.UserDesktopMsg114')}}</h1>
        <FlowRepayTable
          mode="select"
          ref="flowRepayTable"
          :flowRepayData="flowRepayData"
          @handleSelectionChange="handleSelectionChange"></FlowRepayTable>
      </div>
      <PaywayListDialog
        ref="flowRepayPayway"
        name="flowRepayPayway"
        :bizType="bizType"
        :crmVersion="crmVersion"
        :paywayList="paywayList"
        :repayValue="+lastPaidMoney"
        :paywayId="repayForm.paywayId"
        @selectPayway="selectPayway"
        @doneOfPayment="doneOfPayment"></PaywayListDialog>
    </div>
  </Dialog>
</template>

<script>
import { find } from 'lodash';
import { add, sub } from '@/common/js/math';
import dateFormat from '@/common/js/dateformat';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import BillRepayInfo from './BillRepayInfo';
import PaywayListDialog from './PaywayListDialog';
import FlowRepayTable from './FlowRepayTable';
import repayPaywayDict from './RepayComps/repayPaywayDictionary';


export default {
  components: {
    Dialog, BillRepayInfo, FlowRepayTable, PaywayListDialog,
  },
  mixins: [DialogMixin],
  props: {
    accountRepayData: {
      type: Object,
      default: () => {},
    },
    crmVersion: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      paywayList: [],
      paywayName: null,
      repayForm: {
        id: null,
        unpaidBillIds: '',
        unpaidPersonId: '',
        isBatchRepay: '',
        modifyTime: null,
        isRepay: '',
        unpaidPersonInfo: '',
        remainMoney: '', // 账户余额
        unpaidSum: '', // 信用额度
        unpaidMoney: '', // 应还金额
        discountMoney: '', // 优惠金额
        paidMoney: '', // 还款金额
        paywayId: null,
        typeId: null, // 还款类型(普通,批量,指定)
        remark: '',
        extraInfo: null, // 支付方式的参数(键值对形式)
      },
      repayRules: {
        discountMoney: [
          {
            pattern: /^(-|\+)?\d{1,9}(\.\d{1,2})?$/,
            message: this.$t('Biz.UserDesktop.UserDesktopMsg121'),
            trigger: ['blur', 'change'],
          },
        ],
        remark: [
          {
            min: 0,
            max: 200,
            message: this.$t('Biz.UserDesktop.UserDesktopMsg066'),
            trigger: ['blur', 'change'],
          },
        ],
      },
      flowRepayData: [],
      repayPaywayDict, // 支付方式-id匹配参数和执行方法(字典)
      bizType: 2, // 普通还款方式(扫码支付用)
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
    lastPaidMoney() {
      const { unpaidMoney, discountMoney } = this.repayForm;
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(String(discountMoney))) {
        return 0;
      }
      return sub(unpaidMoney, discountMoney);
    },
  },
  mounted() {
    this.$vonce('scanCodePayOfFlowRepay', (data) => {
      this.doneOfPayment(data);
    });
  },
  methods: {
    onOpen() {
      Object.keys(this.repayForm).forEach((key) => {
        this.repayForm[key] = this.accountRepayData[key];
      });
      this.getPaywayList();
      this.getFlowList();
      setTimeout(() => {
        this.$refs.repayForm.resetFields();
      }, 0);
    },
    onClose() {
      // 清空显示内容, 及重置表单校验规则
      this.$refs.repayForm.resetFields();
      this.repayForm.discountMoney = null;
      this.repayForm.unpaidMoney = null;
      this.repayForm.remark = null;
      this.paywayName = null;
      this.$refs.flowRepayTable.clean();
    },
    getPaywayList() {
      ajax('canyin.desktop.financialManagement.unpaidbill.paywaylist').then((data) => {
        if (data.length > 0) {
          const { id, name } = data[0];
          this.paywayList = data;
          this.repayForm.paywayId = id;
          this.paywayName = name;
        }
      });
    },
    getFlowList() {
      const { unpaidPersonId: accountId } = this.accountRepayData;
      ajax('canyin.desktop.financialManagement.unpaidbill.gettslist', {
        contentType: 'URLEncoded',
        data: { accountId },
      }).then((data) => {
        if (data.length > 0) {
          this.flowRepayData = data.map(item => ({
            ...item,
            settleTime: this.formatDate(item.settleTime),
          }));
        } else {
          this.flowRepayData = [];
        }
      });
    },
    openPaywayDialog() {
      if (this.checkFormIsValid() === false) { return; }
      this.$refs.flowRepayPayway.open();
    },
    handleSelectionChange(bills) {
      let sum = 0;
      const ids = [];
      bills.forEach((item) => {
        sum = add(sum, item.unPaymenntMoney);
        ids.push(item.unpaidBillId);
      });
      this.repayForm.unpaidMoney = sum;
      this.repayForm.unpaidBillIds = ids.join(',');
    },
    selectPayway(payway) {
      const { id, name } = payway;
      this.repayForm.paywayId = id;
      // 还款类型(普通(流水)还款写死),如果后台不传值则设置
      if (!this.repayForm.typeId) {
        this.repayForm.typeId = '1502';
      }
      this.paywayName = name;
    },
    formatDate(time) {
      return dateFormat('%Y-%M-%D %H:%I:%S', Date.parse(time));
    },
    // 付款并挂账(非标记形式)-支付方式调用
    doneOfPayment(data) {
      // 调用执行挂账
      this.onSubmit('pay', data);
    },
    onSubmit(type, data) {
      // 还款类型(普通(流水)还款写死),如果后台不传值则设置
      if (!this.repayForm.typeId) {
        this.repayForm.typeId = '1502';
      }
      this.repayForm.paidMoney = this.lastPaidMoney;
      // 数据校验
      if (this.checkFormIsValid() === false) { return; }

      /**
       * 拦截并打开支付页面: 根据字段repayPaywayDict,匹配当前所选的支付方式
       * 目前: 会员卡(CRM7),扫码付
       * 依靠字典匹配: 支付方式id匹配执行方法
       * 会员卡(CRM7)支付 {id: '3', openMethod: 'repayMemberCardOpen'},且限定CRM7可执行
       * 扫码付(二码合一)支付 {id: '37', openMethod: 'repayScanCodeOpen',},
       * 非支付触发onSubmit(非doneOfPayment调用): 用于选择并打开支付方式页面后,返回再直接点击本页面onSubmit
       */
      const curPayWay = find(this.repayPaywayDict, { id: this.repayForm.paywayId });
      if (type !== 'pay'
        && curPayWay
        && (!curPayWay.crmVersion
          || curPayWay.crmVersion === this.crmVersion)
      ) {
        this.$vemit(curPayWay.openMethod, {
          data: find(this.paywayList, { id: curPayWay.id }), // 所选支付方式参数
          bizType: this.bizType || null, // 还款方式(普通还款-扫码支付用)
          repayValue: +this.lastPaidMoney, // 还款金额
          callback: (callbackData) => {
            // 支付页面,回调传入的 确定执行的方法;参数为执行回调传入的参数(支付方式参数)
            this.doneOfPayment(callbackData);
          },
        });
        return;
      }

      // 判断还挂账方式是支付,还是标记,添加参数
      if (type === 'pay') {
        // 扫码付(二合一)paywayId:37,入库需要拆分,区别为微信 || 支付宝, 这时候由推送传来真实paywayId
        if (`${this.repayForm.paywayId}` === '37') {
          this.repayForm.paywayId = data.paywayId;
        }
        this.repayForm.extraInfo = JSON.stringify(data);
      }
      // 验证表单,并执行挂账
      this.$refs.repayForm.validate((valid) => {
        if (valid) {
          ajax('canyin.desktop.financialManagement.unpaidbill.insertorupdatebmrecord', {
            contentType: 'URLEncoded',
            data: this.repayForm,
          }).then(() => {
            this.$message.success(this.$t('Biz.UserDesktop.UserDesktopMsg122'));
            this.$emit('flowRepaySuccess');
            this.close();
          });
        } else {
          console.log('error submit!!');
        }
        return '';
      });
    },
    checkFormIsValid() {
      const { unpaidBillIds, discountMoney, unpaidMoney } = this.repayForm;
      if (!unpaidBillIds) {
        this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg116'));
        return false;
      }
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(String(discountMoney))) {
        this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg123'));
        return false;
      }
      if (discountMoney > unpaidMoney) {
        this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg124'));
        return false;
      }
      return true;
    },
  },
};
</script>

<style lang="less" scoped>
.flow-repay-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: white;
  overflow: hidden;
  .left-account {
    width: 40%;
    height: 100%;
    float: left;
    padding: 14px;
    .account {
      font-size: 16px;
      margin-bottom: 24px;
    }
    .flow-repay-form {
      width: 96%;
      margin-top: 36px;
    }
  }
  .right-table {
    width: 60%;
    height: 100%;
    float: left;
    padding: 14px;
    border-left: 1px solid #c2c2c2;
    .title {
      color: #666;
      margin-bottom: 14px;
    }
  }
}
</style>
