import {
  INIT_PAGER, ITEMHEIGHT, TOPBOTTOMSIZE, OFFSETHEIGHT,
} from '@/common/api/takeoutConfig';
import i18n from '@/locales';

export default {
  methods: {
    // 点击外卖列表 获得此单数据
    getItem(item) {
      this.orderItem = item;
    },
    // 获取Pager翻页后的页数 发送后台请求
    getPager(currentPager) {
      this.currentPager = currentPager;
      this.getOrderList(currentPager);
      this.$refs.orderList.dispatchData(this.takeOutList[0], 0);
    },
    // 边界情况：拒绝接单至外卖列表为空时 清空右侧渲染
    cancelLast() {
      this.orderItem = {};
    },
    // 刷新按钮
    refreshList() {
      this.refreshData(() => {
        this.$message.success(this.$t('Dict.RefreshListSucceeded'));
      });
    },
    calculateLimit() { // 计算外卖列表容器高度
      const { clientHeight } = document.documentElement;
      const takeListHeight = clientHeight - TOPBOTTOMSIZE - OFFSETHEIGHT;
      this.limit = Math.floor(takeListHeight / ITEMHEIGHT);
    },
    getSearchText(value) { // 获取搜索框内容
      this.multiQuery = value;
      this.refreshData();
    },
    refreshData(callback) { // 计算高度 刷新数据 还原分页
      this.calculateLimit();
      this.getOrderList(INIT_PAGER, callback);
      if (this.$refs.pager) {
        this.$refs.pager.init();
      }
    },
  },
};
