<template>
  <!-- 当前组件是已结账单和账单查询共用组件，经修改后目前是用whichModal来区分 -->
  <Dialog
    :name="'PosDialog.BilledModal'+ (whichModal === '0' ? 'billSettle':'billQuery')"
    :title="title"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :showSubmit="whichModal === '0'"
    :hotkeys="whichModal === '0' ? BilledModalHotKey :{}"
    width="1024px"
    height="685px"
    bottom="0px"
    :closeByEsc="!loading"
    :top="testTops"
    :submit-text="$t('Biz.Pos.More.BilledModalText')"
  >
  <template slot="other-button" v-if="whichModal === '0'">
    <button
      type="button"
      id="tourGuideFee"
      class="btn btn-default top-button"
      @click="printAllBill"
      v-if="isShowPrintAllBill"
      v-autotest
    >{{$t('Biz.Pos.More.BilledModalBtn1')}}</button>
    <button
      type="button"
      id="tourGuideFee"
      class="btn btn-default top-button"
      @click="tourGuideFee"
      v-if="isShowTourGuideFee"
      v-autotest
    >{{$t('Dict.Btn.TourGuideFee')}}</button>
    <button
      type="button"
      id="chargeback"
      class="btn btn-default top-button"
      :disabled="!!this.isServer('984')"
      @click="chargeback"
      v-autotest>
        {{$t('Dict.Chargeback')}}(F1)
    </button>
    <button
      type="button"
      id="returnSettle"
      class="btn btn-default top-button"
      @click="returnSettle"
      v-if="getVuexPosMode != '3'"
      :disabled="!!this.isServer('244')"
      v-autotest>
        {{$t('Biz.Pos.More.BilledModalBtn4')}}(F2)
    </button>
    <button
      type="button"
      id="billedAbandonBill"
      class="btn btn-default top-button"
      @click="checkOnlinePayway({resettleFlag: false})"
      :disabled="!!this.isServer('943')"
      v-autotest
      v-if="getVuexPosMode == '3'">
        {{$t('Biz.Pos.More.BilledModalBtn5')}}(F4)
    </button>
    <button
      type="button"
      id="billedResettle"
      class="btn btn-default top-button"
      @click="checkOnlinePayway({resettleFlag: true})"
      v-autotest
      :disabled="!!this.isServer('943')"
      v-if="getVuexPosMode == '3'">
        {{$t('Biz.Pos.More.BilledModalBtn6')}}(F5)
    </button>
    <button
      type="button"
      id="compInvoic"
      class="btn btn-default top-button"
      :disabled="!!this.isServer('884')"
      @click="compInvoic">
        {{$t('Biz.Pos.More.BilledModalBtn7')}}(F3)
    </button>
  </template>
  <div class="content-area">
    <BilledQueryList
      v-if="whichModal !== '0'"
      :isClearInput="isClearInput"
      class="bill-list"
      ref="billList"
      :isShowSearch="whichModal === '0'"
      :title="whichModal === '0' ? 'billSettle':'billQuery'"
      :billed-list="billedList"
      v-model="currentBill"
    ></BilledQueryList>
    <BilledList
      ref="billList"
      v-else
      v-model="currentBill"
      :isClearInput="isClearInput"
      class="bill-list"
      :isShowSearch="whichModal === '0'"
      :title="whichModal === '0' ? 'billSettle':'billQuery'"
      :billed-list="billedList"
      :currentPager="billedParams.currentPage"
      :total="total"
      @handleChangePage="handleChangePage"
      @handleChangeInput="handleChangeInput"
      @handleChangeSelect="handleChangeSelect"
    ></BilledList>
    <div class="bill-area">
      <div class="bill-tab">
        <div
          class="tab-item"
          :class="{active: activeTab === 'cost'}"
          @click="changeTab('cost')"
        >{{$t('Biz.Pos.More.BilledModalDiv1')}}</div>
         <div
          v-if="!(this.getVuexPosMode === '3')"
          class="tab-item"
          :class="{active: activeTab === 'check'}"
          @click="changeTab('check')"
        >{{$t('Dict.CheckingBills')}}</div>
        <div
          class="tab-item"
          :class="{active: activeTab === 'info'}"
          @click="changeTab('info')"
        >{{$t('Biz.Pos.More.BilledModalDiv3')}}</div>
      </div>
      <div class="content">
        <BilledInfo
          v-if="Object.keys(currentBillDetailInfo).length > 0 && activeTab === 'info'"
          :bill-data="currentBillDetailInfo"
          :ts-data="currentTsData"
        ></BilledInfo>
        <BilledCost
          v-if="Object.keys(currentBillDetailInfo).length > 0 && activeTab === 'cost' && currentBill"
          :sc-list="currentBillDetailInfo.scList"
          :ts-id="currentBill.tsId"
        ></BilledCost>
        <BilledCheck
          ref="BilledCheck"
          v-if="currentBill && activeTab === 'check' && billedList.length"
          :bs-id="currentBill.bsId"
          :point-id="currentBill.pointId"
        ></BilledCheck>
      </div>
    </div>
  </div>
  <BilledReturnSettleModal
    ref="billedReturnSettleModal"
    v-if="currentBill && Object.keys(currentBillDetailInfo).length > 0"
    :point-name="currentBill.pointName"
    :ts-id="currentBill.tsId"
    :bs-id="currentBill.bsId"
    :sc-list="currentBillDetailInfo.scList"
    :pay-way="currentBillDetailInfo.payWayInfo"
    :bill-detail ="currentBillDetailInfo"
    :bill-detailInfo="currentBillDetailInfo"
    :point-id="currentBill.pointId"
    :modify-time="currentBill.modifyTime"
    @closeBillRetutnSettle="closeBillRetutnSettle"
  ></BilledReturnSettleModal>
  <!-- <BilledChargebackModal
    ref="billedChargebackModal"
    v-if="currentBillDetailInfo && currentTsData"
    :bill-data="currentBillDetailInfo"
    :ts-data="currentTsData"
    :default-reason="exitBillReasonMap"
    @chargeback-success="getBillInfoByTsId(currentBill.tsId)"
  ></BilledChargebackModal> -->
   <BilledChargebackModal
    pageIdType="billOrder"
    :isBillOfAcount="true"
    ref="billedChargebackModal"
    @handleRevokeSuccess="handleRevokeSuccess"
  ></BilledChargebackModal>
  <BilledCompInvoicModal
    ref="billedCompInvoicModal"
    v-if="currentBill"
    :ts-id="currentBill.tsId"
    :bs-id="currentBill.bsId"
    :pawWayList="currentBillDetailInfo.payWayInfo"
    @compinvoic-success="getBillInfoByTsId(currentBill.tsId)"
  ></BilledCompInvoicModal>
  <BilledReturnSettleConfirm
    ref="billedReturnSettleConfirm"
  ></BilledReturnSettleConfirm>
  <BilledAbandonBillReason
    ref="BilledAbandonBillReason"
  ></BilledAbandonBillReason>
  <BilledTourGuideFee
  :ts-data="currentTsData"
  ref="BilledTourGuideFee"
  @getBillInfoByTsId="getBillInfoByTsId($event)"
  ></BilledTourGuideFee>
    <div v-if="loading" class="fixed is-fullscreen">
      <div class="loading-div">
        <i class="el-icon-loading"></i>
        <p class="loading-text">{{$t('Biz.Pos.More.BilledModalP1')}}</p>
      </div>
    </div>
  </Dialog>
</template>

<script>
import _ from 'lodash';
import { MessageBox } from 'element-ui';
import { mapGetters, mapMutations } from 'vuex';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import AuthCheckMixin from '@/components/Pos/Common/AuthCheckMixin';
import BilledList from './components/BilledList';
import BilledQueryList from './components/BilledQueryList';
import BilledCheck from './components/BilledCheck';
import BilledCost from './components/BilledCost';
import BilledInfo from './components/BilledInfo';
import BilledTourGuideFee from './components/BilledTourGuideFee';
import BilledReturnSettleModal from './components/BilledReturnSettleModal';
import BilledReturnSettleConfirm from './components/BilledReturnSettleConfirm';
import BilledCompInvoicModal from './components/BilledCompInvoicModal';
import BilledAbandonBillReason from './components/BilledAbandonBillReason';
import BilledChargebackModal from '../Order/Bill/BillBtnsFunc/Revoke';

export default {
  props: {
    whichModal: {
      type: String,
      default: '0',
    },
  },
  components: {
    Dialog,
    BilledList,
    BilledCheck,
    BilledCost,
    BilledInfo,
    BilledReturnSettleModal,
    BilledCompInvoicModal,
    BilledChargebackModal,
    BilledReturnSettleConfirm,
    BilledAbandonBillReason,
    BilledTourGuideFee,
    BilledQueryList,
  },
  mixins: [DialogMixin, AuthCheckMixin],
  data() {
    return {
      activeTab: 'info',
      billedList: [],
      currentBill: null, // 当前账单
      currentBillIndex: 0,
      currentBillDetailInfo: {},
      currentBillPayWayInfo: null, // 当前账单使用的结算方式
      currentTsData: null,
      exitBillReasonMap: null,
      abandonReason: null,
      resettleFlag: false,
      tsId: null,
      testTops: '0px',
      isClearInput: false,
      hasTourGuidesCommissionmsgAuth: false,
      billedParams: {
        currentPage: 1,
        limit: 10,
        keyword: '',
        type: '',
      },
      total: 0,
      loading: false,
      title: `${this.$t('Dict.btn.ClosedAccount')}`,
      // 废单/废单重结时,是否执行询问 是否厨打: 0-未设置, 1-设置
      scrapOrScrapReSettlementPromptPrint: '',
    };
  },
  computed: {
    ...mapGetters([
      'itemsMoreBarcode',
      'posBooking',
      'getVuexPosMode',
      'getVuexPointData',
      'posBaseInfo',
      'ALL_POS_MODULE',
    ]),
    BilledModalHotKey() {
      return {
        F1: () => {
          // 新荣记不在隐藏"退单"按钮, 禅道bug-119916;至此, 所有线上预订业务, 均能正常执行退单, 且没有提示
          // if (this.posBooking && this.posBooking.bookedPlatform != 5 && !this.isServer('984')) {
          if (!this.isServer('984')) {
            this.chargeback();
          }
        },
        F2: () => {
          if (this.getVuexPosMode != '3' && !this.isServer('244')) {
            this.returnSettle();
          }
        },
        F3: () => {
          if (!this.isServer('884')) {
            this.compInvoic();
          }
        },
        F4: () => {
          if (this.getVuexPosMode == '3' && !this.isServer('943')) {
            this.checkOnlinePayway({ resettleFlag: false });
          }
        },
        F5: () => {
          if (this.getVuexPosMode == '3' && !this.isServer('943')) {
            this.checkOnlinePayway({ resettleFlag: true });
          }
        },
        PgDn: () => {
          this.onSubmit();
        },
        '↑': () => {
          const sumIdx = this.getSumIdx();
          if (sumIdx === 1) return; // 第一个
          if (this.currentBillIndex > 0) { // 上一个
            this.currentBillIndex--;
            this.currentBill = this.billedList[this.currentBillIndex];
          } else { // 上一页
            this.billedParams.currentPage--;
            this.getBilledList(this.billedParams.limit - 1);
            this.$refs.billList.init(this.billedParams.currentPage);
          }
        },
        '↓': () => {
          const sumIdx = this.getSumIdx();
          const idx = this.currentBillIndex;
          if (sumIdx >= this.total) return; // 到最后一个了
          if ((idx + 1) < this.billedParams.limit) { // 小于一页最大数量 下一个
            this.currentBillIndex++;
            this.currentBill = this.billedList[this.currentBillIndex];
          } else { // 下一页
            this.billedParams.currentPage++;
            console.log(this.billedParams, this.billedParams.currentPage)
            this.getBilledList();
            this.$refs.billList.init(this.billedParams.currentPage);
          }
        },
      };
    },
    // 生成废单和废单重结参数
    createAbandonParams() {
      return {
        tsId: this.currentBill.tsId,
        bsId: this.currentBill.bsId,
        pointId: this.currentBill.pointId,
        controlMode: 3,
        isTeamCancel: false,
        reasonId: '17',
        abandonBillReasonId: this.abandonReason.id,
        modifyTime: this.currentBill.modifyTime,
        'closedAccount-bill-itemTable-text-num': this.currentBillDetailInfo.scList.map(({ lastQty }) => lastQty).join(','),
        exitType: null,
        teamPointIds: null,
        machineEmpId: null,
        isAfterBizCheck: false,
        authId: null,
        authCode: null,
        teamBsIds: null,
      };
    },
    openTimeStr() {
      if (this.currentBillDetailInfo.bsData.openTime.length > 5) {
        return this.currentBillDetailInfo.bsData.openTime.split('T')[1].substring(0, 5);
      }
      return this.currentBillDetailInfo.bsData.openTime;
    },
    isShowTourGuideFee() {
      return this.getVuexPosMode != '3' && this.hasTourGuidesCommissionmsgAuth;
    },
    isShowPrintAllBill() {
      const s = this.isServer('1333');
      if (s === undefined) {
        return false;
      }
      return !s;
    },
  },
  watch: {
    currentBill(data) {
      if (data && data.tsId) {
        this.tsId = data.tsId;
        this.currentBillIndex = this.billedList.findIndex(el => el.tsId === data.tsId);
        this.getBillInfoByTsId(data.tsId);
      }
    },
    loading(val) {
      if (val) {
        this.$hotKey.stop();
      } else {
        this.$hotKey.start();
      }
    },

  },
  mounted() {
  },
  methods: {
    getSumIdx() { // 总计list中第几个
      return (this.billedParams.currentPage - 1) * this.billedParams.limit + (this.currentBillIndex + 1);
    },
    onClose() {
      this.isClearInput = false;
      this.billedList = [];
      this.currentBillDetailInfo = {};
      this.currentTsData = null;
    },
    ...mapMutations({
      setIsExitData: 'IS_EXIT_DATA',
      setPosPointData: 'SET_POS_POINT_DATA',
    }),
    onOpen() {
      if (+this.whichModal === 1) {
        this.title = `${this.$t('Biz.ModuleName.BillQuery')}`;
      } else {
        this.title = `${this.$t('Biz.ModuleName.ClosedAccount')}`;
      }
      this.isClearInput = true;
      const boxHeight = document.documentElement.clientHeight;
      const boxH = (boxHeight - 690) / 2;
      this.payHeight = boxHeight > 690 ? '690px' : `${boxHeight}px`;
      this.testTops = boxH > 0 ? `${boxH}px` : `${0}px`;
      this.activeTab = 'cost';
      if (this.getVuexPosMode === '3') {
        this.billedParams.type = 'orderCode';
      } else {
        this.billedParams.type = 'pointName';
      }
      this.getBilledList();
      this.$vonce('authCode', (authData) => {
        Object.assign(this.createAbandonParams, {
          ...authData,
        });
        this.doAbandonBillOrResettle();
      });
    },
    getBilledList(index = 0) { // index 默认选中第0项
      let url = 'canyin.pos.closedaccount.closedaccountview';
      let params = {};
      if (+this.whichModal !== 0) {
        url = 'canyin.pos.billquery.closedaccountview';
        params = {
          multi_settle_bsId: this.getVuexPointData.bsId,
        };
      } else {
        const {
          currentPage,
          limit,
          type,
          keyword,
        } = this.billedParams;
        this.$log.info(`已结账单左侧list参数---${JSON.stringify(this.billedParams)}`);
        params = {
          start: currentPage,
          limit,
          [type]: encodeURI(keyword),
          // isLike: true, // 是否为模糊搜索
        };
      }
      ajax(url, {
        params,
      })
        .then((data) => {
          if (data.total || data.total === 0) {
            this.total = data.total;
          }
          if (data.tsList) {
            const o = _.groupBy(data.tsList, 'basicBsId');
            const groupList = _.map(o, (v, k) => ({
              k: v,
            }));
            const newGroupList = groupList.map((item, index) => item.k.map((v) => {
              v.count = index % 2;
              return v;
            }));
            this.billedList = _.flattenDeep(newGroupList);
            this.currentBill = data.tsList[index];
            this.currentBillIndex = index;
            this.exitBillReasonMap = data.exitBillReasonMap;
            this.hasTourGuidesCommissionmsgAuth = data.hasTourGuidesCommissionmsgAuth;
            this.scrapOrScrapReSettlementPromptPrint = data.scrapOrScrapReSettlementPromptPrint;
          } else {
            this.billedList = [];
            // this.currentBill = null;
            this.currentBillDetailInfo = {};
            this.billedListInitPage();
          }
        });
    },
    // 分页
    handleChangePage(data) {
      const currentPage = data;
      this.billedParams = Object.assign({}, this.billedParams, { currentPage });
      this.getBilledList();
    },
    // 查询
    handleChangeSelect(data) {
      const type = data;
      const currentPage = 1;
      this.billedParams = Object.assign({}, this.billedParams, { currentPage, type });
      this.getBilledList();
    },
    handleChangeInput(data) {
      const keyword = data;
      const currentPage = 1;
      this.billedParams = Object.assign({}, this.billedParams, { currentPage, keyword });
      this.getBilledList();
    },
    // 对左侧账单列表进行初始化下
    billedListInitPage() {
      this.$refs.billList.init();
    },
    // 通过tsId获取账单
    getBillInfoByTsId(tsId) {
      let url = 'canyin.pos.closedaccount.shifttsinfo';
      if (+this.whichModal !== 0) {
        url = 'canyin.pos.billquery.shifttsinfo';
      }
      ajax(url, {
        params: {
          shiftId: '',
          tsId,
        },
      })
        .then((data) => {
          this.currentBillDetailInfo = data.data;
          // 当前账单使用的结算方式
          this.currentBillPayWayInfo = this.currentBillDetailInfo.payWayInfo;
          this.currentTsData = this.currentBillDetailInfo.tsList.find(item => item.tsId === tsId);
        });
    },
    // 退单成功的回调
    handleRevokeSuccess() {
      this.getBillInfoByTsId(this.tsId);
      // 退单成功之后刷新核对单据页的数据
      if (this.$refs.BilledCheck) {
        this.$refs.BilledCheck.getData();
      }
    },
    // 点击提交
    onSubmit(authData = {}) {
      if (!this.currentBill || this.currentBill.bsId === '') {
        this.$message.warning(this.$t('Biz.Pos.More.BilledModalMsg1'));
        return;
      }
      this.$vonce('authCode', (code) => {
        this.onSubmit(code);
      });
      ajax('canyin.pos.printsettle.getsettleprintdata', {
        contentType: 'paramsEncoded',
        needToken: true,
        data: {
          bsId: this.currentBill.bsId,
          styleType: '1',
          make: true,
          ...authData,
        },
      }).then((data) => {
        if (data.data.success) {
          const printData = data.data;
          if (printData.printType == 'PRINT_PARALLEL' && printData.printD && this.$devices.Printer) {
            this.$log.info(`已结账单打印${this.currentBill.bsId}`);
            this.$devices.Printer.print(printData.printD);
          }
        } else if (data.result == '-2') {
          this.$vemit('posAuthCheck', {
            message: data.msg,
          });
        } else {
          this.$message.warning(data.data.msg);
        }
      });
    },
    // 切换tab
    changeTab(tabName) {
      this.activeTab = tabName;
    },
    // 返位结算
    returnSettle() {
      if (this.currentBill) {
        // 如果存在负结算
        if (this.currentBillDetailInfo.bsData.isNegativeSettle) {
          this.$refs.billedReturnSettleConfirm.showConfirm(this.$t('Biz.Pos.NegativesettleTips'), () => {
            this.negativeSettleSubmit();
          });
        } else {
          // 正常单子的返位结算弹框提示流程
          this.normalTips();
        }
      }
    },
    // 负结算进行废单提交
    negativeSettleSubmit(authData = {}) {
      this.$vonce('authCode', (code) => {
        this.negativeSettleSubmit(code);
      });
      ajax('canyin.pos.negativesettle.abandonedbill', {
        contentType: 'paramsEncoded',
        data: {
          reasonId: '',
          tsId: this.currentBill.tsId,
          bsId: this.currentBill.bsId,
          pointId: this.currentBill.pointId,
          modifyTime: Number(this.currentBill.modifyTime),
          controlMode: this.$store.state.pos.posBaseInfo.controlMode,
          ...authData,
        },
      }).then((res) => {
        if (res.success) {
          this.$message.success(this.$t('Dict.WasteSuccess'));
          // 储存下客位信息
          const table = { id: this.currentBill.pointId };
          this.setPosPointData(table);
          // this.$vemit('loadBill', this.pointId);
          this.printSettle(this.currentBill.bsId);
          setTimeout(() => {
            this.closeBillRetutnSettle();
          }, 20);
        } else {
          MessageBox.alert(res.msg, this.$t('Dict.Tips'));
        }
      });
    },
    // 提示
    normalTips() {
      let msg = this.$t('Biz.Pos.More.BilledModalMsg6', [this.currentBill.pointName]);
      if (this.getVuexPosMode == '3') {
        msg = this.$t('Biz.Pos.More.BilledModalMsg2');
      }
      this.returnSettleConfirmPromise(msg).then(() => {
        let isMeiTuanPayway = false;
        let meiTuanPaywayName = '';
        this.currentBillPayWayInfo.forEach((item) => {
          if (item.paywayId == '9') {
            isMeiTuanPayway = true;
            meiTuanPaywayName = item.payWayName;
          }
        });
        if (isMeiTuanPayway) {
          return this.returnSettleConfirmPromise(
            this.$t('Biz.Pos.More.BilledModalMsg7', [this.currentTsData.pointName, meiTuanPaywayName]),
          );
        }
        if (this.currentTsData.isExitOnlinePayWay) {
          return this.returnSettleConfirmPromise(
            this.$t('Biz.Pos.More.BilledModalMsg8', [this.currentTsData.pointName, this.currentTsData.onlinePayWayName]),
          );
        }
        return Promise.resolve();
      }).then(() => {
        // 返位结算补打结账单,完全由后台执行,前台被迫再次改动,注释代码
        // const printData = {};
        // if (this.posBaseInfo.returnPointSettleBillPrint === '1') {
        //   printData.isReturnPointPrint = true;
        // }
        this.$refs.billedReturnSettleModal.open();
      });
    },
    // 返位结算提示Promise化
    returnSettleConfirmPromise(msg) {
      return new Promise((resolve) => {
        this.$refs.billedReturnSettleConfirm.showConfirm(msg, () => {
          resolve();
        });
      });
    },
    // 补开发票
    compInvoic() {
      this.$refs.billedCompInvoicModal.open();
    },
    // 导游提成
    tourGuideFee() {
      if (this.currentTsData.incomeTotal == null) {
        this.$message.error(this.$t('Biz.Pos.More.BilledModalMsg3'));
        return;
      }
      if (this.currentTsData.incomeTotal <= 0) {
        this.$message.error(this.$t('Biz.Pos.More.BilledModalMsg9', [this.currentTsData.incomeTotal]));
        return;
      }
      ajax('canyin.pos.tourguidescommission.tourguidescommissionview').then((data) => {
        this.$refs.BilledTourGuideFee.open();
      }).catch((errcode, msg) => {
        this.$alert(msg, {
          type: 'error',
        });
      });
    },
    // 是否是人民币单一的结算方式
    isOnlyRmbSettle() {
      let bool = true;
      this.currentBillPayWayInfo.forEach((item) => {
        if (item.paywayId !== '1') {
          bool = false;
        }
      });
      return bool;
    },
    // 结算方式是否满足线上部分退
    async canOnlineRevoke() {
      const res = await this.isContentOnlineRevoke();
      return res.data.data.onlinePayRefund || res.data.data.crmPayRefund || false;
    },
    // 结算方式是否满足线上部分退
    isContentOnlineRevoke() {
      return ajax('canyin.pos.settlement.canonlinepayrefund', {
        contentType: 'URLEncoded',
        loading: false,
        data: {
          bsCode: this.currentBillDetailInfo.bsData.code,
          from: 2,
          orderId: null,
        },
      });
    },
    // 退单
    async chargeback() {
      // 业务调整,食尚订和客必得运行执行退单,代码注释不在使用(CY7-1998,2019/089/01)
      // 根据后台参数, 线上预订(食尚订,客必得) 不可执行退单(新荣记按钮不可见,不在这里处理),弹出提示框,指示从返位结算进行退单
      // const tmp = {
      //   4: '食尚订',
      //   6: '客必得',
      // };
      // if (this.posBooking
      //       && (this.posBooking.bookedPlatform == 4
      //             || this.posBooking.bookedPlatform == 6)) {
      //   MessageBox.alert(`开通${tmp[`${this.posBooking.bookedPlatform}`]}业务，不支持已结账单的【退单】操作，可通过【返位结算】完成退单。`, '错误');
      //   return false;
      // }
      /**
       * 后台勾选部分退不支持退现金后，前台仅支持单一微信支付宝的线上退，仅支持会员卡的部分退，仅支持人民币退款
       * 不支持混付部分退
       * */
      if (this.posBaseInfo.isNonRMBRefundIsNotAllowed) {
        const bool = await this.canOnlineRevoke();
        if (!this.isOnlyRmbSettle() && !bool) { // 如果是混付 不弹出退单界面
          this.$message.error(`${this.$t('Biz.Pos.More.BilledModalMsg10')}`);
          return;
        }
      }
      ajax('canyin.pos.bill.abandonbillreason').then((data) => {
        let revokeData = {};
        if (Object.keys(this.currentBillDetailInfo).length > 0) {
          this.currentBillDetailInfo.reasonList = data.reasons;
          this.currentBillDetailInfo.currentTsData = this.currentTsData;
          this.currentBillDetailInfo.activeReason = data.reasons.find(item => item.id === data.defaultReason);
          this.currentBillDetailInfo.bsData.openTime = this.openTimeStr;
          this.currentBillDetailInfo.isShowCancelBillReason = data.isShowCancelBillReason;
          this.currentBillDetailInfo.defaultReason = data.defaultReason;
          this.currentBillDetailInfo.cancelBillNotReconfirm = data.cancelBillNotReconfirm;// 退单免二次确认标识
          if (this.getVuexPosMode !== '3') {
            revokeData = _.extend({}, this.currentBillDetailInfo, { scList: this.currentBillDetailInfo.scListNoMerge });
          } else {
            revokeData = this.currentBillDetailInfo;
          }
          this.$refs.billedChargebackModal.open({
            ...revokeData,
            isSupportCash: !this.posBaseInfo.isNonRMBRefundIsNotAllowed,
          });
        }
        this.$refs.billedChargebackModal.open(revokeData);
      });
    },
    // 废单和废单重结 按钮点击事件
    abandonBillOrResettle() {
      // 存在默认废单原因 直接废单
      if (this.exitBillReasonMap) {
        this.abandonReason = this.exitBillReasonMap; // 赋值废单原因
        this.checkPrintPrevWasteOrder();
      } else {
        // 选择废单原因
        this.$refs.BilledAbandonBillReason.open(null, {
          submit: (selectedReason) => {
            this.abandonReason = selectedReason; // 赋值废单原因
            this.checkPrintPrevWasteOrder();
          },
        });
      }
    },
    // 检查线上是否存在支付方式
    checkOnlinePayway({ resettleFlag }) {
      console.log('resettleFlag===', resettleFlag);
      this.resettleFlag = resettleFlag;
      if (this.currentTsData.isExitOnlinePayWay) {
        this.returnSettleConfirmPromise(
          this.$t('Biz.Pos.More.BilledModalMsg11', [this.currentTsData.pointName, this.currentTsData.onlinePayWayName]),
        ).then(() => {
          this.abandonBillOrResettle();
        });
      } else {
        this.abandonBillOrResettle();
      }
    },
    // 废单/返单重结时,是否执行询问 是否免厨打选择框
    checkPrintPrevWasteOrder() {
      // 0-未设置, 不询问
      if (this.scrapOrScrapReSettlementPromptPrint === '0') {
        this.doAbandonBillOrResettle(null, false);
      } else {
      // 1-设置, 询问
        this.$confirm(
          this.$t('Biz.Pos.More.BilledModalConfirm2', [this.resettleFlag ? '废单重结' : '废单']),
          this.$t('Dict.Tips'),
          {
            confirmButtonText: this.$t('Dict.Btn.KitchenPrint'),
            confirmButtonClass: 'billedModal-wasteOrderTipsDialogBtn1',
            cancelButtonText: this.$t('Dict.Btn.NoKitchenPrint'),
            cancelButtonClass: 'billedModal-wasteOrderTipsDialogBtn2',
            distinguishCancelAndClose: true,
            closeOnPressEscape: false,
            type: 'warning'
        }).then(() => {
          this.doAbandonBillOrResettle(null, false);
        }).catch((action) => {
          if (action === 'cancel') {
            this.doAbandonBillOrResettle(null, true);
          }
        });
      }
    },
    // 执行废单和废单重结 resettleFlag:false=>废单 resettleFlag:true=>废单重结
    doAbandonBillOrResettle(authData = {}, unKitchenPrinting) {
      this.$vonce('authCode', (code) => {
        this.doAbandonBillOrResettle(code);
      });
      const params = {
        unKitchenPrinting,
        ...this.createAbandonParams,
        ...authData,
      };
      let timer = null;
      const bool = this.currentBillDetailInfo.payWayInfo.some(item => item.payWayName === '通联银行卡');
      if (bool) {
        this.loading = true;
        timer = setTimeout(() => {
          this.loading = false;
        }, 70000);
      }
      ajax('canyin.pos.returnpointandabandonbill.returnpointandabandonbill', {
        timeout: 70000,
        contentType: 'paramsEncoded',
        needToken: true,
        data: params,
      }).then((data) => {
        clearTimeout(timer);
        this.loading = false;
        // 废单
        if (this.resettleFlag == false) {
          // 目前暂时不需要刷新下账单后端逻辑改
          // // 加载账单 账单返回空数组
          // this.$vemit('fastFoodLoadBs', { buffetPointId: data.buffetPointId });
          this.$message.success(this.$t('Dict.WasteSuccess'));
          // 废单成功后刷新左侧列表
          this.activeTab = 'info';
          ajax('canyin.pos.closedaccount.closedaccountview').then((data) => {
            if (data.tsList) {
              this.billedList = data.tsList;
              [this.currentBill] = data.tsList;
              this.exitBillReasonMap = data.exitBillReasonMap;
            }
          });
        } else {
          // 加载账单 渲染清除打折的数据
          const dataSclist = this.currentBillDetailInfo.scList.map((item) => {
            this.$delete(item, 'scId');
            item.discMoney = 0;
            item.discScale = 1;
            item.discType = 0;
            const finded = _.find(this.itemsMoreBarcode, {
              id: item.itemId,
              sizeId: item.itemSizeId,
            });
            const {
              discFlg,
              priceType,
              price,
              salePrice,
              stdPrice,
              promotePrice,
              memberPrice,
            } = finded;
            return Object.assign({}, item, {
              discFlg,
              priceType,
              price,
              salePrice,
              stdPrice,
              promotePrice,
              memberPrice,
              exchangeId: null,
              fullGiftId: null,
            });
          });
          // 废单重结之后重新回到订单页面
          this.$router.push('/pos/fastFood');
          // 加个延迟防止废单重结的菜品丢失
          setTimeout(() => {
            this.$vemit('fastFoodLoadBs', { buffetPointId: data.buffetPointId, existedData: dataSclist });
            this.setIsExitData(true);
          }, 200);
          this.$message.success(this.$t('Biz.Pos.More.BilledModalMsg5'));
        }
        // 退单打印
        this.printReturnAndAbandon(data.parallelPrintData);
        // 废单打印
        this.printSettle(params.bsId);
        // 关闭已结账单
        this.closeBillRetutnSettle();
        // 关闭授权框
        this.$vemit('closeAuthCheck');
      }).catch((errCode, msg) => {
        if (msg) {
          this.$message.error(msg);
        }
      });
    },
    // 打印废单
    printSettle(bsId) {
      ajax('canyin.pos.printsettle.getsettleprintdata', {
        contentType: 'paramsEncoded',
        // needToken: true,
        data: {
          bsId,
          styleType: 1,
        },
      }).then((data) => {
        if (!data.success) {
          this.$message.warning(data.msg);
          return;
        }
        if (data.data.success) {
          const printData = data.data;
          if (printData.printType == 'PRINT_PARALLEL' && printData.printD && this.$devices.Printer) {
            this.$log.info(`已结账单打印废单${bsId}`);
            this.$devices.Printer.print(printData.printD);
          }
        } else {
          this.$message.warning(data.data.msg);
        }
      });
    },
    // 打印退单
    printReturnAndAbandon(printData) {
      this.$log.info('废单重结成功');
      // 退单打印
      if (printData.length && this.$devices.Printer) {
        printData.forEach((printD) => {
          this.$devices.Printer.print(printD);
        });
      }
      // 废单打印 onSubmit函数已封装好
      // this.onSubmit();
    },
    // 关闭已结账单
    closeBillRetutnSettle() {
      this.close();
      this.$vemit('updatePoint');
    },
    // 打印全部账单 183-1842 By L.R
    printAllBill() {
      this.$confirm(this.$t('Biz.Pos.More.BilledModalConfirm1'), this.$t('Dict.Tips'), {
        confirmButtonText: this.$t('Dict.Sure'),
        cancelButtonText: this.$t('Dict.Cancel'),
        type: 'warning',
      }).then(() => {
        ajax('canyin.pos.printsettle.printallsettledbill').then(() => {}).catch(error => console.log(err));
      }).catch((err) => {
        console.log(err);
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

// 头部按钮
.top-button{
  min-width: 85px;
}
.pos-takeout-pager {
  position: absolute;
  > button {
    display: inline-block;
    width: 44px;
    height: 30px;
    border: 1px solid #9a9a9a;
    line-height: 28px;
    border-radius: 14px;
    text-align: center;
    margin-left: 8px;
    background-color: white;

    > i {
      color : #9a9a9a;
    }

    &[disabled] {
      color: @btn-disabled-color;
      cursor: not-allowed;
    }
  }
}
.no-item{
  text-align: center;
  font-size: 14px;
  color: #999999;
  padding-top: 20px;
}
.content-area{
  height: 100%;
  width: 100%;
  display: flex;
  > *{
    position: relative;
  }
  .bill-list{
    z-index: 1;
    width: 368px;
    box-shadow: 6px 0px 8px #777;
  }
  .shdow-border{
    position: absolute;
    top: 0;bottom: 0;
  }
  .bill-area{
    flex-grow: 1;
    background-color: @white;
    .content{
      position: absolute;
      top: 50px;
      right: 16px;left: 16px;bottom: 0;
    }
  }
}
// Tab区域
.bill-tab{
  border-bottom: 1px solid #b5b5b5;
  background-color: @white;
  padding: 0 16px;
  .tab-item{
    cursor: pointer;
    display: inline-block;
    padding: 10px 12px 8px;
  }
  .tab-item + .tab-item{
    margin-left: 8px;
  }
  .active{
    border-bottom: 4px solid @brand-primary;
  }
}
.fixed {
  position: fixed;
  margin: 0;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 9999999 !important;
}
.loading-text {
  color: #0096a4;
  margin: 3px 0;
  font-size: 14px;
}
.loading-div {
  margin-top: -25px;
  top: 50%;
  width: 100%;
  text-align: center;
  position: absolute;
}
</style>

<style lang="less">
.el-button.billedModal-wasteOrderTipsDialogBtn1 {
  width: 70px;
  font-weight: bold;
}
.el-button.billedModal-wasteOrderTipsDialogBtn2 {
  width: 70px;
  font-weight: bold;
}
</style>
