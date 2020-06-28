<template>
  <Framework :moduleName="moduleName" :tabs="tabs" ref="framework"></Framework>
</template>

<script>
import Framework from '../base/Framework';
import frameworkMinxin from '../base/frameworkMinxin';
import {
  DAILY_SETTLE_ID,
  MANAFER_LOG_ID,
  PROXY_OFFWORK_ID,
  TEMP_ITEMS_ID,
  TEMP_METHODS_ID,
  WASTEFOOD_ID,
  KITCHEN_DATA_UPLOAD_ID,
} from '../base/moudle-ids';

export default {
  name: 'BussinessManagement',
  components: { Framework },
  mixins: [frameworkMinxin],
  data() {
    return {
      moduleName: this.$t('Dict.BusinessManagement'),
      tabs: [{
        modulePid: TEMP_ITEMS_ID,
        label: this.$t('Dict.TemporaryItems'),
        name: 'tempItemsModule',
      }, {
        modulePid: TEMP_METHODS_ID,
        label: this.$t('Biz.BizComm.TempMethod'),
        name: 'tempMethodsModule',
      }, {
        modulePid: MANAFER_LOG_ID,
        label: this.$t('Biz.UserDesktop.ManagerDiary'),
        name: 'managerLogModule',
      }, {
        modulePid: WASTEFOOD_ID,
        label: this.$t('Biz.UserDesktop.StatisticsOfWasteVegetables'),
        name: 'wasteFoodModule',
      }, {
        modulePid: PROXY_OFFWORK_ID,
        label: this.$t('Biz.UserDesktop.AgencyTieUp'),
        name: 'proxyoffWork',
      }, {
        modulePid: DAILY_SETTLE_ID,
        label: this.$t('Dict.DailyKnots'),
        name: 'dailySettlementModule',
      }, {
        modulePid: KITCHEN_DATA_UPLOAD_ID,
        label: '厨房数据上传',
        name: 'kitchenDataUploadModule',
      }],
    };
  },
};
</script>
