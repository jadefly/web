<template>
  <Framework :moduleName="moduleName" :tabs="tabs" ref="framework"></Framework>
</template>

<script>
import Framework from '../base/Framework';
import frameworkMinxin from '../base/frameworkMinxin';
import {
  FASHION_BOOK_ID,
  CLIENT_MUST_ID,
  CODE_PAY_ID,
  HOTEL_SYSTEM_ID,
  DRAGON_DECISION_ID,
  FAST_LOGIN_ID,
  WUU_CONFIG_ID,
  AREA_CASHIER_ID,
} from '../base/moudle-ids';

export default {
  name: 'ParameterSetting',
  components: { Framework },
  mixins: [frameworkMinxin],
  data() {
    return {
      moduleName: this.$t('Dict.SystemParameter'),
      tabs: [{
        modulePid: FASHION_BOOK_ID,
        label: this.$t('Dict.ShiShangDingSetting'),
        name: 'fashionBookMoudle',
      }, {
        modulePid: CLIENT_MUST_ID,
        label: this.$t('Biz.UserDesktop.UserDesktopMsg155'),
        name: 'clientMustMoudle',
      }, {
        modulePid: CODE_PAY_ID,
        label: this.$t('Biz.UserDesktop.ParameterSetting.Setting3'),
        name: 'codePaymentMoudle',
      }, {
        modulePid: DRAGON_DECISION_ID,
        label: this.$t('Biz.UserDesktop.ParameterSetting.Setting4'),
        name: 'dragonDecisionModule',
      }, {
        modulePid: FAST_LOGIN_ID,
        label: this.$t('Dict.QuickLogin'),
        name: 'fastLoginModule',
      }, {
        modulePid: WUU_CONFIG_ID,
        label: this.$t('Biz.UserDesktop.ParameterSetting.Setting5'),
        name: 'wuuConfigModule',
      }, {
        modulePid: AREA_CASHIER_ID,
        label: '服务区域收银',
        name: 'serviceAreaCashierModule',
      }, {
        modulePid: HOTEL_SYSTEM_ID,
        label: '酒店系统对接配置',
        name: 'hotelSystemModule',
      }],
    };
  },
};
</script>
<style>
.el-message-box {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.6);
}
</style>
