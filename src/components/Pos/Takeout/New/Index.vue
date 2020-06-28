<template>
  <div class="pos-takeout-window">
    <OrderList :takeOutList="takeOutList" :requestType="requestType" @getItem="getItem" @cancelLast="cancelLast" ref="orderList"></OrderList>
    <div class="pos-takeout-control">
      <Search @getSearchText="getSearchText"></Search>
      <button type="button" class="btn btn-default" @click="refreshList">{{$t('Dict.Btn.Refresh')}}</button>
      <Pager class="pos-pager" :total="total" :limit="limit" @getPager="getPager" ref="pager"></Pager>
    </div>
    <div class="pos-takeout-preview">
      <div class="pos-takeout-wrapper" v-show="takeOutList.length">
        <Buttons :orderItem="orderItem" :takeOutListCount="takeOutList.length" @updateOrderList="updateOrderList" v-if="orderItem"></Buttons>
        <ItemList :orderItem="orderItem" :distributionItemName="distributionItemName" :lunchboxItemName="lunchboxItemName" v-if="orderItem"></ItemList>
      </div>
    </div>
  </div>
</template>

<script>
import ajax from '@/common/js/ajax.js';
import OrderList from '@/components/Pos/Takeout/Base/OrderList';
import Search from '@/components/Pos/Takeout/Base/Search';
import Pager from '@/components/Pos/Takeout/Base/Pager';
import Buttons from '@/components/Pos/Takeout/Base/Buttons';
import ItemList from '@/components/Pos/Takeout/Base/ItemList';
import { ERR_OK, NEW_ORDER, INIT_PAGER } from '@/common/api/takeoutConfig.js';
import TakeoutMixin from '@/components/Pos/Takeout/Base/TakeoutMixin.js';

export default {
  components: {
    OrderList, Search, Pager, Buttons, ItemList,
  },
  mixins: [TakeoutMixin],
  data() {
    return {
      takeOutList: [],
      orderItem: {},
      distributionItemName: this.$t('Dict.DistributionFee'),
      lunchboxItemName: this.$t('Dict.LunchCoxFee'),
      total: 0,
      limit: 4,
      requestType: NEW_ORDER,
      currentPager: INIT_PAGER,
      multiQuery: '',
    };
  },
  created() {
    this.$von('refreshNewOrder', () => {
      this.refreshData();
    });
    this.$von('refreshTakeoutState', () => {
      this.refreshData();
    });
    // 自动接单 状态变化
    this.$von('autoAcceptNewOrder', (autoAccept) => {
      if (autoAccept) {
        this.$vonce('refreshAutoAcceptOrder', () => {
          this.refreshData();
        });
      } else {
        this.$vonce('refreshAutoAcceptOrder', () => {

        });
      }
    });

    this.refreshData();
  },
  methods: {
    // 获取外卖列表
    getOrderList(pager, callback) {
      ajax('canyin.takeout.takeoutview.takeoutorderlist', {
        params: {
          requestType: NEW_ORDER,
          page: pager,
          limit: this.limit,
          multiQuery: this.multiQuery,
        },
      })
        .then((res) => {
          if (res.data.code === ERR_OK) {
            const { data } = res.data;
            this.lunchboxItemName = data.lunchboxItemName;
            this.distributionItemName = data.distributionItemName;
            this.takeOutList = data.takeOutList;
            this.total = data.total;
            this.$vemit('getNewTotal', this.total);
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
    updateOrderList({ isLastOrder }) {
      if (isLastOrder && this.currentPager > 1) {
        this.currentPager = this.currentPager - 1;
      }
      this.getOrderList(this.currentPager, () => {
        if (this.$refs.pager) {
          this.$refs.pager.set(this.currentPager);
        }
      });
    },
  },
};
</script>
