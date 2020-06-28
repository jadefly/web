<template>
  <Framework :moduleName="moduleName" :tabs="tabs" ref="framework"></Framework>
</template>

<script>
import Framework from '../base/Framework';
import frameworkMinxin from '../base/frameworkMinxin';
import {
  POS_IPLOGIN_ID, POS_UNBIND_ID, PHONE_MODULE_ID, DATA_MODULE_ID,SMART_POS_ID, FISH_COOL_ID
} from '../base/moudle-ids';

export default {
  name: 'SystemTools',
  components: { Framework },
  mixins: [frameworkMinxin],
  data() {
    return {
      moduleName: this.$t('Dict.SystemTools'),
      tabs: [
        {
          modulePid: POS_IPLOGIN_ID,
          label: this.$t('Dict.TerminalIP'),
          name: 'posIpLogin',
        },
        {
          modulePid: POS_UNBIND_ID,
          label: this.$t('Biz.UserDesktop.SystemTools.STIndexLabel2'),
          name: 'posModule',
        },
        {
          modulePid: PHONE_MODULE_ID,
          label: this.$t('Biz.UserDesktop.SystemTools.STIndexLabel3'),
          name: 'phoneModule',
        },
        {
          modulePid: SMART_POS_ID,
          label: this.$t('Biz.UserDesktop.SystemTools.STIndexLabel4'),
          name: 'smartposModule',
        },
        {
          modulePid: DATA_MODULE_ID,
          label: this.$t('Biz.UserDesktop.SystemTools.DataModuleTitle1'),
          name: 'dataModule',
        },
        {
          modulePid: FISH_COOL_ID,
          label: '鱼酷数据补传',
          name: 'fishCoolDataUploadModule',
        },
      ],
    };
  },
};
</script>
