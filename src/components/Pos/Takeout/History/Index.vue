<template>
  <div class="pos-takeout-window takeout-history">
    <DatePicker
      @getStartValue="getStartValue"
      @getEndValue="getEndValue"
      @clickSeach="clickSeach">
    </DatePicker>
    <OrderFilter
    filterId="historyFilter"
    @searchSource="searchSource"
    @searchState="searchState"
    @searchRecordBs="searchRecordBs"
    @searchOrderedState="searchOrderedState"
    @searchCanceledState="searchCanceledState"
    @searchPayType="searchPayType"
    @searchSort="searchSort"
    @searchRider="searchRider">
    </OrderFilter>
    <OrderList
      :takeOutList="takeOutList"
      :requestType="requestType"
      @getItem="getItem"
      @cancelLast="cancelLast"
      ref="orderList">
    </OrderList>
    <div class="pos-takeout-control">
      <Search @getSearchText="getSearchText"></Search>
      <button
        type="button"
        class="btn btn-default"
        @click="refreshList"
      >{{$t('Dict.Btn.Refresh')}}</button>
      <Pager
        class="pos-pager"
        :total="total"
        :limit="limit"
        @getPager="getPager"
        ref="pager">
      </Pager>
    </div>
    <div class="pos-takeout-preview">
      <div class="pos-takeout-wrapper" v-show="takeOutList.length">
        <!-- 发单前展示 -->
        <template v-if="orderItem && orderItem.viewSend">
          <el-tabs v-model="activeName" :stretch=true>
            <el-tab-pane label="配送跟踪" name="delivery">
              <DeliveryButtons
                v-if="orderItem && (orderItem.canSendOrder || orderItem.canCancelAllSend)"
                :orderItem="orderItem"
                @updateOrderList="updateOrderList"
              ></DeliveryButtons>
              <DeliveryDetail
                v-if="orderItem"
                :orderItem="orderItem"
                @updateOrderList="updateOrderList"
              ></DeliveryDetail>
            </el-tab-pane>
            <el-tab-pane label="订单详情" name="detail">
              <Buttons
                v-if="orderItem"
                :orderItem="orderItem"
                @updateOrderList="updateOrderList"
              ></Buttons>
              <ItemList
                v-if="orderItem"
                :orderItem="orderItem"
                :distributionItemName="distributionItemName"
                :lunchboxItemName="lunchboxItemName"
                :requestType="requestType"
              ></ItemList>
            </el-tab-pane>
          </el-tabs>
        </template>
        <!-- 发单后展示 -->
        <template v-else>
          <Buttons
            v-if="orderItem"
            :orderItem="orderItem"
            @updateOrderList="updateOrderList"
          ></Buttons>
          <ItemList
            v-if="orderItem"
            :orderItem="orderItem"
            :distributionItemName="distributionItemName"
            :lunchboxItemName="lunchboxItemName"
            :requestType="requestType"
          ></ItemList>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import ajax from '@/common/js/ajax';
import OrderList from '@/components/Pos/Takeout/Base/OrderList';
import Search from '@/components/Pos/Takeout/Base/Search';
import Pager from '@/components/Pos/Takeout/Base/Pager';
import Buttons from '@/components/Pos/Takeout/Base/Buttons';
import ItemList from '@/components/Pos/Takeout/Base/ItemList';
import OrderFilter from '@/components/Pos/Takeout/Base/OrderFilter';
import DatePicker from '@/components/Pos/Takeout/Base/DatePicker';
import DeliveryButtons from '@/components/Pos/Takeout/Base/DeliveryButtons';
import DeliveryDetail from '@/components/Pos/Takeout/Base/DeliveryDetail';
import {
  ERR_OK,
  HISTORY_ORDER,
  INIT_PAGER,
  TODAY,
  TOMORROW,
  ITEMHEIGHT,
  TOPBOTTOMSIZE,
  OFFSETHEIGHT,
  DATEPICKERHEIGHT,
} from '@/common/api/takeoutConfig';
import dateFormat from '@/common/js/dateformat';
import TakeoutMixin from '@/components/Pos/Takeout/Base/TakeoutMixin';
import SearchOrderMixin from '@/components/Pos/Takeout/Base/SearchOrderMixin';

export default {
  components: {
    OrderList,
    Search,
    Pager,
    Buttons,
    ItemList,
    OrderFilter,
    DatePicker,
    DeliveryButtons,
    DeliveryDetail,
  },
  mixins: [TakeoutMixin, SearchOrderMixin],
  data() {
    return {
      takeOutList: [],
      orderItem: {},
      distributionItemName: this.$t('Dict.DistributionFee'),
      lunchboxItemName: this.$t('Dict.LunchCoxFee'),
      total: 0,
      limit: 4,
      requestType: HISTORY_ORDER,
      currentPager: INIT_PAGER,
      multiQuery: '',
      deFrom: -1,
      state: -1,
      recordBs: -1,
      dealState: -1,
      cancelReason: -1,
      payState: -1,
      orderByType: 1,
      orderBy: 'DESC',
      startDate: '',
      endDate: '',
      riderId: '', // 骑手id
      activeName: 'delivery', // 默认显示配送跟踪
    };
  },
  created() {
    this.$von('refreshTakeoutState', () => {
      this.refreshData();
    });
    this.InitDate();
    this.refreshData();
  },
  methods: {
    // 获取外卖列表
    getOrderList(pager, callback) {
      ajax('canyin.takeout.takeoutview.takeoutorderlist', {
        params: {
          requestType: HISTORY_ORDER,
          page: pager,
          limit: this.limit,
          multiQuery: this.multiQuery,
          deFrom: this.deFrom,
          state: this.state,
          recordBs: this.recordBs,
          dealState: this.dealState,
          cancelReason: this.cancelReason,
          payState: this.payState,
          orderByType: this.orderByType,
          orderBy: this.orderBy,
          startDate: this.startDate,
          endDate: this.endDate,
          riderId: this.riderId,
        },
      })
        .then((res) => {
          if (res.data.code === ERR_OK) {
            const { data } = res.data;
            this.lunchboxItemName = data.lunchboxItemName;
            this.distributionItemName = data.distributionItemName;
            this.takeOutList = data.takeOutList;
            this.total = data.total;
            if (callback) {
              callback();
            }
          } else {
            this.$message.error(res.data.msg);
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
    // 监听接单等操作 刷新数据
    updateOrderList() {
      this.getOrderList(this.currentPager);
    },
    // 获取初始时间
    InitDate() {
      const startTimeStamp = Date.parse(TODAY);
      const startTime = dateFormat('%Y-%M-%D %H:%I:%S', startTimeStamp);
      const endTimeStamp = Date.parse(TOMORROW);
      const endTime = dateFormat('%Y-%M-%D %H:%I:%S', endTimeStamp);
      this.startDate = startTime;
      this.endDate = endTime;
    },
    // 日期筛选：开始时间
    getStartValue(date) {
      this.startDate = date;
    },
    // 日期筛选：结束时间
    getEndValue(date) {
      this.endDate = date;
    },
    // 日期查找按钮
    clickSeach() {
      this.refreshData();
    },
    // 不一样的高度计算
    calculateLimit() {
      const { clientHeight } = document.documentElement;
      const takeListHeight = clientHeight - TOPBOTTOMSIZE - OFFSETHEIGHT - DATEPICKERHEIGHT;
      this.limit = Math.floor(takeListHeight / ITEMHEIGHT);
    },
  },
};
</script>

<style lang="less">
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.takeout-history {
  .pos-takeout-no-orderlist,
  .pos-takeout-list {
    height: 87.4% !important;
  }
}
.takeout-history .el-tabs{
  height: 100%;
}
.takeout-history .el-tab-pane{
  height: 100%;
}
.takeout-history .el-tabs__nav-scroll{
  background: #fff;
  font-weight: bold;
}
.takeout-history .el-tabs__nav.is-stretch{
  height: 44px;
}
.takeout-history .el-tabs__header {
  margin: 0;
}
.takeout-history .el-tabs__item{
  font-size: 14.67px;
  font-weight:bold;
}
.takeout-history .el-tabs__active-bar {
  left: 40px;
  height: 4px;
  width: 60px !important;
}
.takeout-history .el-tabs__content{
  height: calc(100% - 44px);
}
</style>
