export default {
  methods: {
    // 筛选框：搜索来源
    searchSource(deFrom) {
      this.deFrom = deFrom;
      this.refreshData();
    },
    // 筛选框：搜索状态
    searchState(state) {
      this.state = state;
      this.recordBs = -1; // 恢复为录单状态
      this.cancelReason = -1;
      this.dealState = -1;
      this.refreshData();
    },
    // 筛选框：搜索未录单状态
    searchRecordBs(recordBs) {
      this.recordBs = recordBs;
      this.state = -1;
      this.cancelReason = -1;
      this.dealState = -1;
      this.refreshData();
    },
    // 筛选框：搜索已接单子状态
    searchOrderedState(dealState) {
      this.dealState = dealState;
      this.refreshData();
    },
    // 筛选框：搜索已取消子状态
    searchCanceledState(cancelReason) {
      this.cancelReason = cancelReason;
      this.refreshData();
    },
    // 筛选框：搜索支付类型
    searchPayType(payState) {
      this.payState = payState;
      this.refreshData();
    },
    // 筛选框：搜索排序
    searchSort(orderByType, orderBy) {
      this.orderByType = orderByType;
      this.orderBy = orderBy;
      this.refreshData();
    },
    // 筛选框：搜索骑手
    searchRider(riderId) {
      this.riderId = riderId;
      this.refreshData();
    },
  },
};
