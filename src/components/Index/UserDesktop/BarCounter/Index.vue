<template>
  <Framework :moduleName="moduleName" :tabs="tabs" ref="framework"></Framework>
</template>

<script>
import Framework from '../base/Framework';
import frameworkMinxin from '../base/frameworkMinxin';
import {
  BAR_ITEMS_SETTING_ID,
  CHARGE_BILL_ID,
  TARNSFER_BILL_ID,
  CHECK_BILL_ID,
  STORES_STATUS_ID,
} from '../base/moudle-ids';

export default {
  name: 'BussinessManagement',
  components: { Framework },
  mixins: [frameworkMinxin],
  data() {
    return {
      moduleName: this.$t('Dict.BarCounting'),
      tabs: [{
        modulePid: BAR_ITEMS_SETTING_ID, // 权限id
        label: this.$t('Biz.UserDesktop.InventoryItemSettings'), // 显示text
        name: 'barItemsSettingMoudle', // 路由
      }, {
        modulePid: CHARGE_BILL_ID,
        label: this.$t('Biz.UserDesktop.RequisitionList'),
        name: 'chargeBillMoudle',
      }, {
        modulePid: TARNSFER_BILL_ID,
        label: this.$t('Biz.UserDesktop.DrawingAndDrawingList'),
        name: 'tarnsferBillMoudle',
      }, {
        modulePid: CHECK_BILL_ID,
        label: this.$t('Biz.UserDesktop.CheckList'),
        name: 'checkBillMoudle',
      }, {
        modulePid: STORES_STATUS_ID,
        label: this.$t('Dict.InventoryStatus'),
        name: 'storesStatusMoudle',
      }],
    };
  },
};
</script>

<style lang="less">
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

@bar-header-height: 40px;
@bar-footer-height: 40px;
@bar-dialog-head-height: 50px;
@bar-dialog-foot-height: 70px;
@bar-dialog-border-color: #c8c8c8;

.bar-page {
  height: 100%;
}

.bar-wrap {
  position: relative;
  height: 100%;
  padding-top: @bar-header-height;
  padding-bottom: @bar-footer-height;
}

.bar-header {
  position: absolute;
  left: 0;
  top: 0;
  .size(100%, @bar-header-height);
}

.bar-content {
  height: 100%;
}

.bar-footer {
  position: absolute;
  left: 0;
  bottom: 0;
  .size(100%, @bar-footer-height);
}

.bar-dialog-wrap {
  position: relative;
  height: 100%;
  padding: @bar-dialog-head-height 15px @bar-dialog-foot-height;
  background-color: #fff;
}

.bar-dialog-head {
  position: absolute;
  left: 0;
  top: 0;
  .size(100%, @bar-dialog-head-height);
  padding: 0 15px;
  border-bottom: 1px solid @bar-dialog-border-color;

  > .search {
    margin-top: 10px;
  }
}

.bar-dialog-info {
  float: left;
  font-size: 12px;
  line-height: @bar-dialog-head-height;

  > li {
    float: left;
    margin-right: 10px;
  }
}

.bar-dialog-content {
  height: 100%;
  overflow: auto;
}

.bar-dialog-foot {
  position: absolute;
  left: 0;
  bottom: 0;
  .size(100%, @bar-dialog-foot-height);
  padding: 8px 15px 0 60px;
  border-top: 1px solid @bar-dialog-border-color;

  > label {
    font-size: 12px;
    position: absolute;
    left: 3px;
    top: 5px;
  }
}

.bar-dialog-table .change-row {
  background-color: #f0f9eb;
}

.bar-dialog-top-button {
  min-width: 85px;
}
</style>
