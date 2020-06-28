<template>
  <div class="pos-takeout-window takeout-abnormal">
    <OrderFilter
      filterId="abnormalFilter"
      @searchSource="searchSource"
      @searchState="searchState"
      @searchRecordBs="searchRecordBs"
      @searchOrderedState="searchOrderedState"
      @searchCanceledState="searchCanceledState"
      @searchPayType="searchPayType"
      @searchSort="searchSort"
      @searchRider="searchRider"
    ></OrderFilter>
    <OrderList
      ref="orderList"
      :takeOutList="takeOutList"
      :requestType="requestType"
      @getItem="getItem"
      @cancelLast="cancelLast"
      @clearWarn="clearWarn"
    ></OrderList>
    <div class="pos-takeout-control">
      <Search @getSearchText="getSearchText"></Search>
      <button type="button" class="btn btn-default" @click="refreshList">刷新</button>
      <Pager
        ref="pager"
        class="pos-pager"
        :total="total"
        :limit="limit"
        @getPager="getPager"
      ></Pager>
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
              <DeliveryDetail v-if="orderItem" :orderItem="orderItem" @updateOrderList="updateOrderList"></DeliveryDetail>
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
          ></ItemList>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { ERR_OK, ABNORMAL_ORDER, INIT_PAGER } from '@/common/api/takeoutConfig';
import ajax from '@/common/js/ajax';
import OrderList from '@/components/Pos/Takeout/Base/OrderList';
import Search from '@/components/Pos/Takeout/Base/Search';
import Pager from '@/components/Pos/Takeout/Base/Pager';
import Buttons from '@/components/Pos/Takeout/Base/Buttons';
import ItemList from '@/components/Pos/Takeout/Base/ItemList';
import OrderFilter from '@/components/Pos/Takeout/Base/OrderFilter';
import TakeoutMixin from '@/components/Pos/Takeout/Base/TakeoutMixin.js';
import SearchOrderMixin from '@/components/Pos/Takeout/Base/SearchOrderMixin.js';
import DeliveryButtons from '@/components/Pos/Takeout/Base/DeliveryButtons';
import DeliveryDetail from '@/components/Pos/Takeout/Base/DeliveryDetail';

export default {
  components: {
    OrderList, Search, Pager, Buttons, ItemList, OrderFilter, DeliveryButtons, DeliveryDetail,
  },
  mixins: [TakeoutMixin, SearchOrderMixin],
  data() {
    return {
      takeOutList: [],
      orderItem: {},
      distributionItemName: '配送费',
      lunchboxItemName: '餐盒费',
      total: 0,
      limit: 4,
      requestType: ABNORMAL_ORDER,
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
      riderId: '', // 骑手id
      activeName: 'delivery', // 默认显示配送跟踪
    };
  },
  created() {
    this.$von('refreshTakeoutState', () => {
      this.refreshData();
    });
    // 监听异常信息变化
    this.$von('refreshSendWarnChange', () => {
      this.refreshData();
    });
    this.refreshData();
  },
  methods: {
    // 获取外卖列表
    getOrderList(pager, callback) {
      ajax('canyin.takeout.takeoutview.takeoutorderlist', {
        params: {
          requestType: ABNORMAL_ORDER,
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
          riderId: this.riderId,
        },
      }).then((res) => {
        if (res.data.code === ERR_OK) {
          // this.$message.success(res.data.msg)
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
      }).catch((err) => {
        this.$message.error(err);
      });
    },
    // 监听接单等操作 刷新数据
    updateOrderList() {
      this.getOrderList(this.currentPager);
    },
    // 刷新异常信息查看状态
    clearWarn() {
      ajax('canyin.takeout.takeoutsend.clearsendwarn', {
        contentType: 'json',
        data: {
          orderId: this.orderItem.id,
        },
      }).then(() => {});
    },
  },
};
</script>

<style lang="less">
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.takeout-abnormal {
  .pos-takeout-no-orderlist,
  .pos-takeout-list {
    height: 94% !important;
  }
}

.pos-takeout-wrapper .el-tabs {
  height: 100%;
}

.pos-takeout-wrapper .el-tab-pane {
  height: 100%;
}

.pos-takeout-wrapper .el-tabs__nav-scroll {
  background: #fff;
  font-weight: bold;
}

.pos-takeout-wrapper .el-tabs__nav.is-stretch {
  height: 44px;
}

.pos-takeout-wrapper .el-tabs__header {
  margin: 0;
}

.pos-takeout-wrapper .el-tabs__item {
  font-size: 14.67px;
  font-weight: bold;
}

.pos-takeout-wrapper .el-tabs__active-bar {
  left: 40px;
  height: 4px;
  width: 60px !important;
}

.pos-takeout-wrapper .el-tabs__content {
  height: calc(100% - 44px);
}
</style>
