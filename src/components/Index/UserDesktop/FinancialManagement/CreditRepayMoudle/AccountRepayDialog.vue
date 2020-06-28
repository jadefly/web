<template>
  <Dialog
    name="PosDialog.AccountRepayDialog"
    :title="$t('Dict.BulkRepayment')"
    ref="dialog"
    @open="onOpen"
    @close="onClose"
    @submit="onSubmit"
    :showSubmit="true"
    width="840px"
    height="460px"
    :hotkeys="hotKeySet"
  >
    <div class="account-repay-wrapper">
      <div class="left-account">
        <h1 class="account">{{ accountRepayData.unpaidPersonInfo }}</h1>
        <BillRepayInfo :accountInfo="accountRepayData"></BillRepayInfo>
        <el-form
          ref="repayForm"
          :model="repayForm"
          :rules="repayRules"
          label-width="95px"
          class="account-repay-form">
          <el-form-item :label="$t('Dict.BulkRepaymentLabel')" prop="changeMoney">
            <el-input v-model="repayForm.changeMoney"></el-input>
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
        <h1 class="title">{{$t('Biz.UserDesktop.UserDesktopMsg107')}}</h1>
        <FlowRepayTable
          mode="noSelect"
          :flowRepayData="flowRepayData"></FlowRepayTable>
      </div>
      <PaywayListDialog
        ref="accountRepayPayway"
        name="accountRepayPayway"
        :bizType="bizType"
        :paywayList="paywayList"
        :crmVersion="crmVersion"
        :paywayId="repayForm.paywayId"
        :repayValue="+repayForm.changeMoney"
        @selectPayway="selectPayway"
        @doneOfPayment="doneOfPayment"></PaywayListDialog>
    </div>
  </Dialog>
</template>

<script>
import { find } from 'lodash';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import BillRepayInfo from './BillRepayInfo';
import PaywayListDialog from './PaywayListDialog';
import FlowRepayTable from './FlowRepayTable';
import dateFormat from '@/common/js/dateformat';
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
        tsId: null,
        bsId: null,
        unpaidPersonId: '',
        settleState: null,
        isRepay: null,
        code: null,
        modifyTime: null,
        unpaidPersonInfo: '',
        remainMoney: '',
        unpaidSum: '',
        changeMoney: '',
        paywayId: null,
        typeId: null,
        remark: '',
        extraInfo: null, // 支付方式的参数(键值对形式)
      },
      repayRules: {
        changeMoney: [
          { required: true, message: this.$t('Biz.UserDesktop.UserDesktopMsg108'), trigger: ['blur', 'change'] },
          {
            pattern: /^\d{1,9}(\.\d{1,2})?$/, message: this.$t('Biz.UserDesktop.UserDesktopMsg109'), trigger: ['blur', 'change'],
          },
        ],
        remark: [
          {
            min: 0, max: 200, message: this.$t('Biz.UserDesktop.UserDesktopMsg066'), trigger: ['blur', 'change'],
          },
        ],
      },
      flowRepayData: [],
      repayPaywayDict, // 支付方式-id匹配参数和执行方法(字典)
      bizType: 3, // 普通还款方式(扫码支付用)
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
  },
  mounted() {
    this.$vonce('scanCodePayOfAccountRepay', (data) => {
      this.doneOfPayment(data);
    });
  },
  methods: {
    onOpen() {
      this.$refs.repayForm.resetFields();
      Object.keys(this.repayForm).forEach((key) => {
        this.repayForm[key] = this.accountRepayData[key];
      });
      this.getPaywayList();
      this.getFlowList();
    },
    onClose() {
      // 清空显示内容, 及重置表单校验规则
      this.$refs.repayForm.resetFields();
      this.repayForm.changeMoney = null;
      this.repayForm.remark = null;
      this.paywayName = null;
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
      this.$refs.accountRepayPayway.open();
    },
    selectPayway(payway) {
      const { id, name } = payway;
      this.repayForm.paywayId = id;
      // 还款类型:批量(账户)还款,写死,如果后台不传值则设置
      if (!this.repayForm.typeId) {
        this.repayForm.typeId = '1504';
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
    // 执行挂账(标记形式)
    onSubmit(type, data) {
      // 还款类型:批量(账户)还款,写死,如果后台不传值则设置
      if (!this.repayForm.typeId) {
        this.repayForm.typeId = '1504';
      }
      // 数据校验
      if (this.checkFormIsValid() === false) { return; }

      /**
       * 拦截并打开支付页面: 根据字段repayPaywayDict,匹配当前所选的支付方式
       * 目前: 会员卡(CRM7),扫码付
       * 依靠字典匹配: 支付方式id匹配执行方法
       * 会员卡(CRM7)支付 {id: '3', openMethod: 'repayMemberCardOpen'},且限定CRM7可执行
       * 扫码付(二码合一)支付 {id: '37', openMethod: 'repayScanCodeOpen',},
       * 非支付触发onSubmit(非doneOfPayment调用): 用于选择会员卡后,直接点击本页面onSubmit
       */
      const curPayWay = find(this.repayPaywayDict, { id: this.repayForm.paywayId });
      if (type !== 'pay'
        && curPayWay
        && (!curPayWay.crmVersion
          || curPayWay.crmVersion === this.crmVersion)
      ) {
        this.$vemit(curPayWay.openMethod, {
          data: find(this.paywayList, { id: curPayWay.id }), // 所选支付方式参数
          bizType: this.bizType || null, // 还款方式(批量还款-扫码支付用)
          repayValue: +this.repayForm.changeMoney, // 还款金额
          callback: (callbackData) => {
            // crn7支付页面, 回调传入的 确定执行的方法;参数为执行回调传入的参数(支付方式参数)
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
            this.$message.success(this.$t('Biz.UserDesktop.UserDesktopMsg110'));
            this.$emit('accountRepaySuccess');
            this.close();
          });
        } else {
          console.log('error submit!!');
        }
      });
    },
    checkFormIsValid() {
      const { changeMoney, remainMoney } = this.repayForm;
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(String(changeMoney))) {
        this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg111'));
        return false;
      }
      if (Number(changeMoney) > Number(-remainMoney)) {
        this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg112'));
        return false;
      }
      if (Number(changeMoney) === 0) {
        this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg113'));
        return false;
      }
      return true;
    },
  },
};
</script>

<style lang="less" scoped>
.account-repay-wrapper {
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
    .account-repay-form {
      width: 90%;
      margin-top: 48px;
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
