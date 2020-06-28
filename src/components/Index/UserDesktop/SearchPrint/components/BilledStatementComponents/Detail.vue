<template>
  <Dialog
    name="PosDialog.Detail"
    :title="$t('Biz.Order.Details')"
    ref="dialog"
    width="660px"
    height="670px"
    :showSubmit="false"
    top="2vh"
    @open="onOpen"
    @close="onClose">
    <button
      v-if="showPrint"
      slot="other-button"
      type="button"
      class="btn btn-default"
      v-autotest
      @click="print"
    >打印</button>
    <div class="detail-bill-area">
      <div class="bill-tab">
        <div
          class="tab-item"
          :class="{active: activeTab === 'cost'}"
          @click="changeTab('cost')">{{$t('Biz.UserDesktop.SearchPrint.DetailDiv1')}}</div>
        <div
          class="tab-item"
          :class="{active: activeTab === 'check'}"
          @click="changeTab('check')">{{$t('Dict.CheckingBills')}}</div>
        <div
          class="tab-item"
          :class="{active: activeTab === 'info'}"
          @click="changeTab('info')">{{$t('Biz.UserDesktop.SearchPrint.DetailDiv3')}}</div>
        <div
          class="tab-item"
          :class="{active: activeTab === 'other'}"
          @click="changeTab('other')">{{$t('Biz.UserDesktop.SearchPrint.DetailDiv4')}}</div>
      </div>
      <div class="detail-content">
        <BilledInfo
          v-if="activeTab === 'info'"
          :ts-data="currentTsData"
          :bill-data="currentBillDetailInfo"/>
        <BilledCost
          v-if="activeTab === 'cost'"
          :sc-list="currentBillDetailInfo.scList"/>
        <BilledCheck
          ref="BilledCheck"
          :checkData="checkData"
          v-if="activeTab === 'check'"
          />
        <OtherInfo
          ref="OtherInfo"
          :otherData="otherData"
          v-if="activeTab === 'other'" />
      </div>
    </div>
  </Dialog>
</template>


<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import ajax from '@/common/js/ajax';
import BilledCheck from './BilledCheck';
import BilledCost from './BilledCost';
import BilledInfo from './BilledInfo';
import OtherInfo from './OtherInfo';

export default {
  components: {
    Dialog,
    BilledCheck,
    BilledCost,
    BilledInfo,
    OtherInfo,
  },
  mixins: [DialogMixin],
  props: {
    showPrint: null,
  },
  data() {
    return {
      activeTab: 'cost',
      currentBillDetailInfo: {},
      checkData: null,
      currentBillPayWayInfo: null, // 当前账单使用的结算方式
      currentTsData: null,
      otherData: null,
    };
  },
  mounted() {
    this.$von('billedCheckRefresh', () => {
      this.getCheckBillAjax();
    });
  },
  watch: {
    activeTab(val) {
      if (val === 'check') {
        this.getCheckBillAjax();
      } else if (val === 'other') {
        this.getOtherInfoAjax();
      } else {
        this.getCostAndInfoAjax();
      }
    },
  },
  methods: {
    print() {
      this.$emit('printBill', this.resData.rowData);
    },
    onOpen() {
      this.activeTab = 'cost';
      this.getCostAndInfoAjax();
    },
    onClose() {
      this.currentBillDetailInfo = {};
      this.checkData = null;
    },
    onSubmit() {},
    // 切换tab
    changeTab(tabName) {
      this.activeTab = tabName;
    },
    // 消费明细，结算信息数据
    getCostAndInfoAjax() {
      const { tsId } = this.resData.rowData;
      const url = 'canyin.pos.closedaccount.shifttsinfofordesk';
      ajax(url, {
        params: {
          shiftId: '',
          tsId,
        },
      }).then((data) => {
        this.currentBillDetailInfo = data.data;
        // 当前账单使用的结算方式
        this.currentBillPayWayInfo = this.currentBillDetailInfo.payWayInfo;
        this.currentTsData = this.currentBillDetailInfo.tsList.find(item => item.tsId === tsId);
      });
    },
    // 获取核对单据数据
    getCheckBillAjax() {
      const { pointId, data0, bsId } = this.resData.rowData;
      const id = this.resData.fromType === 1 ? bsId : data0;
      ajax('canyin.pos.checkViewBill.viewbillfordesk', {
        params: {
          pointId,
          bsId: id,
          toBeInclude: 0,
        },
      }).then((res) => {
        this.checkData = res;
      });
    },
    // 获取其他信息数据
    getOtherInfoAjax() {
      const { data0, bsId } = this.resData.rowData;
      const id = this.resData.fromType === 1 ? bsId : data0;
      ajax('canyin.desktop.a11.accountbillotherinfo', {
        contentType: 'URLEncoded',
        data: {
          bsId: id,
        },
      }).then((res) => {
        this.otherData = res;
      });
    },
  },
};
</script>

<style lang="less">
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .detail-bill-area{
    width: 100%;
    height: 100%;
    background-color: @white;
    .detail-content{
      position: absolute;
      top: 100px;
      right: 16px;left: 16px;bottom: 0;
    }
  }
  // Tab区域
  .detail-bill-area .bill-tab{
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

  .lang-enUS{
    .detail-bill-area .bill-tab{
      .tab-item{
        font-size: 12px;
      }
    }
  }
</style>
