<template>
  <Framework :moduleName="moduleName" :tabs="tabs" ref="framework"></Framework>
</template>

<script>
import Framework from '../base/Framework';
import frameworkMinxin from '../base/frameworkMinxin';
import { CREDIT_ACOUNT_ID, CREDIT_REPAY_ID, COMMISSION_TABLE_ID, CREATE_COMMISSION_TABLE_ID } from '../base/moudle-ids';

export default {
  name: 'BussinessManagement',
  components: { Framework },
  mixins: [frameworkMinxin],
  data() {
    return {
      moduleName: this.$t('Dict.FinancialManagement'),
      tabs: [
        {
          modulePid: CREDIT_ACOUNT_ID,
          label: this.$t('Dict.LedgerAccount'),
          name: 'creditAccountMoudle',
        },
        {
          modulePid: CREDIT_REPAY_ID,
          label: this.$t('Dict.DebtRepayment'),
          name: 'creditRepayMoudle',
        },
        {
          modulePid: COMMISSION_TABLE_ID,
          label: this.$t('Biz.UserDesktop.Royaltylist'),
          name: 'commissionTableMoudle',
        },
      ],
    };
  },
};
</script>
