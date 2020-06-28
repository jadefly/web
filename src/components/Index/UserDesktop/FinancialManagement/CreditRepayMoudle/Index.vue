<template>
  <SystemContent :title="$t('Dict.DebtRepayment')">
    <div class="credit-repay-warpper">
      <div class="header">
        <el-select
          class="account-select"
          v-model="selectedAccountId"
          @change="refreshFirstPage"
          filterable
        >
          <el-option
            v-for="item in accountList"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <BillRepayInfo :accountInfo="accountInfo" v-if="selectedAccountId"></BillRepayInfo>
      </div>
      <div class="operation" v-if="selectedAccountId">
        <!-- $t-手动挂账,普通还款,批量还款,指定还款,补打还款凭证  -->
        <button class="btn btn-primary" @click="manualCredit">{{$t('Dict.ManualPayment')}}</button>
        <button class="btn btn-primary" @click="flowRepay">{{$t('Dict.OrdinaryRepayment')}}</button>
        <button class="btn btn-primary" @click="accountRepay">{{$t('Dict.BulkRepayment')}}</button>
        <button
          class="btn btn-primary"
          @click="assignRepay"
        >{{$t('Dict.DesignatedRepayment')}}</button>
        <button
          class="btn btn-primary"
          :disabled="printRepayBtnStatus || false"
          :class="printRepayBtnStatus ? 'disabledBtn' : ''"
          @click="printRepay"
        >{{$t('Dict.RePrintRepay')}}</button>
      </div>
      <div class="system-table-body" ref="systemTableBody">
        <el-table
          ref="accountTable"
          :data="tableData"
          @row-click="chooseListItem"
          highlight-current-row
          style="width: 100%">
            <el-table-column v-for="item of tableColumns"
              :key="item.prop"
              :label="item.label"
              :width="item.width"
              :prop="item.prop"
              align="center"
              class-name="no-wrap">
              <template slot-scope="scope">
                <div v-if="item.prop === 'isRepay1'">
                  <span
                    :class="[
                      {'repay': scope.row.isRepay1 === 1},
                      {'not-repay': scope.row.isRepay1 === 0 || scope.row.isRepay1 === 2}
                    ]">
                    {{ getRepayStatus(scope.row.isRepay1) }}
                  </span>
                </div>
                <div v-else-if="item.prop === 'serial'">
                  <span class="orange">{{ item.tsCode }}</span>
                  <br>
                  <span class="green">{{ item.bsCode }}</span>
                </div>
                <div v-else>
                  {{ scope.row[item.prop] === null ? '-' : scope.row[item.prop] }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              align="center"
              class-name="no-wrap">
              <template slot-scope="scope">
                <span
                  v-if="scope.row.typeId === '1501'"
                  @click="handleClick(scope.row)"
                  class="green pointer">
                  {{$t('Dict.See')}}
                </span>
              </template>
            </el-table-column>
        </el-table>
      </div>
      <div slot="foot" class="footer" v-if="selectedAccountId">
        <Pagination
          :total="total"
          :limit="limit"
          :page="page"
          @handleChangePage="handleChangePage"></Pagination>
      </div>
      <!-- 手动挂账-组件 -->
      <ManualCreditDialog
        ref="manualCreditDialog"
        :manualCreditData="manualCreditData"
        @manualCreditSuccess="refreshFirstPage"></ManualCreditDialog>
      <!-- 批量还款 -->
      <AccountRepayDialog
        ref="accountRepayDialog"
        :crmVersion="crmVersion"
        :accountRepayData="accountRepayData"
        @accountRepaySuccess="refreshFirstPage"></AccountRepayDialog>
      <!-- 普通还款 -->
      <FlowRepayDialog
        ref="flowRepayDialog"
        :crmVersion="crmVersion"
        :accountRepayData="flowAccountData"
        @flowRepaySuccess="refreshFirstPage"></FlowRepayDialog>
      <!-- 指定还款 -->
      <AppointRepayDialog
        ref="appointRepayDialog"
        :crmVersion="crmVersion"
        :assignRepayData="assignRepayData"
        @assignRepaySuccess="refreshFirstPage"></AppointRepayDialog>
      <RepayMemberCardCrm7
        ref="repayMemberCard"></RepayMemberCardCrm7>
      <RepayScanCode
        ref="repayScanCode"></RepayScanCode>
      <Detail ref="detail"></Detail>
    </div>
  </SystemContent>
</template>

<script>

import { mapGetters } from 'vuex';
import { debounce } from 'lodash';
import ajax from '@/common/js/ajax';
import WS from '@/common/js/WS';
import tableColumns from './repayTableColumns';
import dateFormat from '@/common/js/dateformat';
import BillRepayInfo from './BillRepayInfo';
import SystemContent from '@/components/Index/UserDesktop/base/SystemContent';
import Pagination from '@/components/Index/UserDesktop/base/Pagination';
import Detail from '@/components/Index/UserDesktop/SearchPrint/components/BilledStatementComponents/Detail';

// 手动挂账
const ManualCreditDialog = (resolve) => {
  import('./ManualCreditDialog').then((module) => {
    resolve(module);
  });
};
/**
 * 还款类型:
 * 1.普通还款(流水还款), 2.批量(账户)还款, 3.指定还款
 * 改造为执行统一接口,以方便支付方式(crm7一卡通,付款码)统一调用
 * 还挂账方式: 类型区别-typeId
    * 1502: 普通(流水)还款
    * 1504: 批量(账户)还款(调账)
    * 1506: 指定还款
 */
// 普通还款(流水还款)
const FlowRepayDialog = (resolve) => {
  import('./FlowRepayDialog').then((module) => {
    resolve(module);
  });
};
// 批量(账户)还款
const AccountRepayDialog = (resolve) => {
  import('./AccountRepayDialog').then((module) => {
    resolve(module);
  });
};
// 指定还款
const AppointRepayDialog = (resolve) => {
  import('./AppointRepayDialog').then((module) => {
    resolve(module);
  });
};
// 还挂账-支付方式-一卡通方式(CRM7)
const RepayMemberCardCrm7 = (resolve) => {
  import('./RepayComps/RepayMemberCardCrm7').then((module) => {
    resolve(module);
  });
};
// 还挂账-支付方式-付款码
const RepayScanCode = (resolve) => {
  import('./RepayComps/RepayScanCode').then((module) => {
    resolve(module);
  });
};

export default {
  components: {
    SystemContent,
    Pagination,
    BillRepayInfo,
    ManualCreditDialog,
    AccountRepayDialog,
    FlowRepayDialog,
    AppointRepayDialog,
    RepayMemberCardCrm7,
    RepayScanCode,
    Detail,
  },
  data() {
    return {
      total: 0,
      limit: 10,
      page: 1,
      tableColumns: tableColumns(),
      debounceFn: null,
      tableData: [],
      accountInfo: {},
      accountList: [],
      selectedAccountId: '',
      manualCreditData: {},
      accountRepayData: {},
      flowAccountData: {},
      assignRepayData: {}, // 指定还款 - 结算流水列表数据
      wsContextPath: '',
      // 扫码支付三种(普通/批量/指定])还挂账方式,支付完成,执行挂账触发的vemit命令对象
      emitMethodOfScanRepay: {
        1502: 'scanCodePayOfFlowRepay', // 普通
        1504: 'scanCodePayOfAccountRepay', // 批量
        1506: 'scanCodePayOfAppointRepay', // 指定
      },
      // crm环境版本
      crmVersion: null,
      // 当前选中列表项
      chosenItem: {},
      // 补打凭证按钮状态
      printRepayBtnStatus: true,
      onlinePayWebSocket: null,
    };
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.getAccountList();
      vm.initGetData();
    });
  },
  beforeRouteLeave(to, from, next) {
    window.removeEventListener('resize', this.debounceFn, false);
    this.closeWebSocket();
    next();
  },
  mounted() {
    // 打开 还挂账的'会员卡'支付方式(组件), 从根组件执行跨组件触发.
    this.$vonce('repayMemberCardOpen', (data) => {
      this.$refs.repayMemberCard.open({
        data: data.data,
        bizType: data.bizType,
        repayValue: data.repayValue,
        callback: data.callback,
      });
    });
    // 打开 还挂账的'付款码'支付方式(组件), 从根组件执行跨组件触发.
    this.$vonce('repayScanCodeOpen', (data) => {
      this.$refs.repayScanCode.open({
        data: data.data,
        bizType: data.bizType,
        repayValue: data.repayValue,
        // 完成挂账方法:扫码和手动,从扫码付页面执行,而是依靠推送活的支付成功状态, 再执行完成挂账
        callback: data.callback,
      });
    });
    this.debounceFn = debounce(() => {
      this.page = 1;
      const id = this.selectedAccountId;
      if (id) {
        this.getAllBillData(id);
      }
    }, 500);
    window.addEventListener('resize', this.debounceFn, false);
  },
  computed: {
    ...mapGetters(['getCreditAccount']),
    start() {
      return (this.page - 1) * this.limit;
    },
  },
  methods: {
    handleClick(row) {
      this.$refs.detail.open({
        rowData: row,
        fromType: 1,
      });
    },
    initGetData() {
      // return new Promise( (res) => {
      ajax('platform.login.login.login').then((res) => {
        this.crmVersion = res.crmVersion;
        this.initWebSocket(res);
      });
      // });
    },
    // 初始化用户桌面-还挂账支付推送
    initWebSocket(res) {
      this.onlinePayWebSocket = new WS(`${res.WSContextPath}/websocket/onlinepay`, {
        message: (message) => {
          // 还挂账-支付推送类型判断
          if (message.method === 'query_unpaid_state') {
            if (+message.returnCode === 1) { // 支付成功
              const {
                code,
                typeId,
                paywayId,
                authEmpId,
                isEnforce,
                scancodePayorderId,
              } = message;
              /** 执行扫码支付的完成挂账
                  推送回调指向,需要指定的完成挂账的方式 */
              this.$vemit(this.emitMethodOfScanRepay[typeId], {
                scancodePayorderId, // 支付订单ID
                isEnforce, // 是否是强制结算（0：非强制结算；1：强制结算）
                authEmpId, // 强制结算授权人（默认为null）
                paywayId, // 实际使用的支付方式(微信||支付宝)id,回传给挂账接口使用
                code, // 还挂账的还款的流水
              });
              // 关闭扫码付窗口
              this.$vemit('closeRepayScanCodeDialog');
            } else if (+message.returnCode === 0) { // 支付失败
              this.$message.warning(this.$t('Dict.FailureToPay'));
              this.$log.info(`挂账还款[${message.code}]线上支付失败`);
            } else {
              this.$log.info(`挂账还款[${message.code}]线上支付失败`);
              this.$message.warning(`${message.message}`);
            }
          }
        },
      });
    },
    closeWebSocket() {
      if (this.onlinePayWebSocket) {
        this.onlinePayWebSocket.close();
      }
    },
    getBillInfo(id) {
      ajax('canyin.desktop.financialManagement.unpaidbill.getaccountinfo', {
        contentType: 'URLEncoded',
        data: { id },
      }).then((data) => {
        this.accountInfo = data;
      });
    },
    getBillList(id) {
      this.limit = Math.floor((this.$refs.systemTableBody.clientHeight) / 64);
      ajax('canyin.desktop.financialManagement.unpaidbill.list', {
        contentType: 'URLEncoded',
        data: {
          id,
          start: this.start,
          limit: this.limit > 0 ? this.limit : 0,
        },
      }).then((data) => {
        this.tableData = data.list.map((item, index) => ({
          ...item,
          index: this.start + index + 1,
          modifyTime: this.formatDate(item.modifyTime),
        }));
        this.total = data.total;
      });
    },
    getAllBillData(id) {
      this.getBillList(id);
      this.getBillInfo(id);
    },
    getAccountList() {
      ajax('canyin.desktop.financialManagement.unpaidbill.listunpaidpersons').then((data) => {
        this.accountList = data.map(item => ({
          value: item.id,
          label: item.name,
        }));
        this.setAccountId();
      });
    },
    // 首次进来账户名进行回显
    setAccountId() {
      if (this.getCreditAccount) {
        const { id } = this.getCreditAccount;
        this.selectedAccountId = id;
        this.getAllBillData(id);
      } else if (this.accountList.length > 0) {
        const { value: id } = this.accountList[0];
        this.selectedAccountId = id;
        this.getAllBillData(id);
      } else {
        this.selectedAccountId = '';
      }
    },
    handleChangePage(page) {
      this.page = page;
      this.getAllBillData(this.selectedAccountId);
    },
    formatDate(time) {
      return dateFormat('%Y-%M-%D %H:%I:%S', Date.parse(time));
    },
    manualCredit() {
      ajax('canyin.desktop.financialManagement.unpaidbill.loadnew', {
        contentType: 'URLEncoded',
        data: {
          personId: this.selectedAccountId,
          unpaidType: 'manualPayment',
        },
      }).then((data) => {
        this.manualCreditData = data;
        this.$refs.manualCreditDialog.open();
      });
    },
    accountRepay() {
      ajax('canyin.desktop.financialManagement.unpaidbill.loadnew', {
        contentType: 'URLEncoded',
        data: {
          personId: this.selectedAccountId,
          unpaidType: 'batchPayment',
        },
      }).then((data) => {
        this.accountRepayData = data;
        this.$refs.accountRepayDialog.open();
      });
    },
    flowRepay() {
      ajax('canyin.desktop.financialManagement.unpaidbill.loadnew', {
        contentType: 'URLEncoded',
        data: { personId: this.selectedAccountId },
      }).then((data) => {
        this.flowAccountData = data;
        this.$refs.flowRepayDialog.open();
      });
    },
    // 指定还款
    assignRepay() {
      ajax('canyin.desktop.financialManagement.unpaidbill.loadnew', {
        contentType: 'URLEncoded',
        data: { personId: this.selectedAccountId },
      }).then((data) => {
        this.assignRepayData = data;
        this.$refs.appointRepayDialog.open();
      });
    },
    refreshFirstPage() {
      this.page = 1;
      this.getAllBillData(this.selectedAccountId);
    },
    getRepayStatus(code) {
      if (code === 0) {
        return this.$t('Dict.NoRepayment');
      }
      if (code === 1) {
        return this.$t('Dict.Reimbursement');
      }
      if (code === 2) {
        return this.$t('Dict.PartialRepayment');
      }
      return '';
    },
    chooseListItem(item) {
      this.chosenItem = item;
      // 只有'还款||指定还款||批量还款 类型', 才能设置 打印按钮是否可用
      if (item.typeId === '1502'
        || item.typeId === '1504'
        || item.typeId === '1506'
      ) {
        this.printRepayBtnStatus = false;
      } else {
        this.printRepayBtnStatus = true;
      }
    },
    // 补打还款凭证: '打印'按钮功能正常(即列表项均为还款||指定还款||批量还款 类型), 才能执行补打还款凭证
    printRepay() {
      if (!this.printRepayBtnStatus) {
        this.doPrintRepay(this.chosenItem);
      }
    },
    doPrintRepay(data) {
      ajax('canyin.desktop.financialManagement.unpaidbill.supplementprintunpaidbill', {
        params: { id: data.id },
      }).then((data) => {
        this.$message.success('打印成功');
      });
    },
  },
};
</script>

<style lang="less" scoped>
.credit-repay-warpper {
  position: relative;
  width: 100%;
  height: 100%;
  color: #333;
  .header {
    .account-select {
      margin-right: 20px;
    }
  }

  .operation {
    margin-top: 16px;
  }

  .system-table-body {
    height: calc(100% - 130px);
    overflow: hidden;
    .repay::before {
      content: '';
      background-color: #56d68f;
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .not-repay::before {
      content: '';
      background-color: #f5222d;
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
  }
  .footer {
    height: 40px;
    position: relative;
  }
  .disabledBtn {
    background-color: #999;
    border-color: #4c4c4c;
  }
  .green {
    color: #039eac;
  }
  .orange {
    color: orange;
  }
  .pointer {
    cursor: pointer;
  }
}
</style>

<style lang="less">
.credit-repay-warpper {
  .footer .page-context {
    position: absolute;
    top: 5px;
    right: 12px;
  }
  .el-table td {
    padding: 6px 0 !important;
  }
}
</style>
