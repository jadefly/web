<template>
  <Framework
    :moduleName="moduleName"
    :tabs="tabs"
    :isSearchPrint="isSearchPrint"
    :reportList="reportList"
    ref="framework"/>
</template>

<script>
import { mapGetters } from 'vuex';
import i18n from '@/locales/index';
import Framework from '../base/Framework';
import frameworkMinxin from '../base/frameworkMinxin';
import * as allId from '../base/moudle-ids';

export default {
  name: 'SearchPrint',
  components: { Framework },
  mixins: [frameworkMinxin],
  data() {
    return {
      moduleName: this.$t('Dict.BusinessReport'),
      tabs: [],
      isSearchPrint: true,
      tmpTabs: [],
      reportList: [],
    };
  },
  computed: {
    ...mapGetters([
      'deskPageAuthModules',
    ]),
  },
  mounted() {
    this.checkAuth();
  },
  methods: {
    initTmpTabs() {
      this.tmpTabs = [{
        modulePid: allId.REPORT_BUSINESS_ID,
        label: i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel1'),
        name: 'reportBusiness',
      }, {
        modulePid: allId.REPORT_SALES_ID,
        label: i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel2'),
        name: 'reportSales',
      }, {
        modulePid: allId.BILLED_STATEMENT_ID,
        label: i18n.t('Dict.Btn.ClosedAccount'),
        name: 'billedStatement',
      }, {
        modulePid: allId.BILLED_REPORT_ID,
        label: i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel4'),
        name: 'billedReport',
      }, {
        modulePid: allId.REPORT_BUSINESS_BZHG_ID, // 权限id
        label: `${i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel5')}（BZHG）`, // 显示text
        name: 'reportBusinessBZHG', // 路由
      }, {
        modulePid: allId.BUSINESS_STATISTICS_REPORT_ID,
        label: `${i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel6')}（XYX）`,
        name: 'businessStatisticsReport',
      }, {
        modulePid: allId.SETTLE_STATISTICS_REPORT_ID,
        label: `${i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel7')}（XYX）`,
        name: 'settleStatisticsReport',
      }, {
        modulePid: allId.REPORT_MEAL_ID,
        label: i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel8'),
        name: 'reportMeal',
      }, {
        modulePid: allId.REPORT_BUSINESS_QFBZ_ID,
        label: `${i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel1')}（QFBZ）`,
        name: 'reportBusinessQFBZ',
      }, {
        modulePid: allId.REPORT_TIME_QFBZ_ID,
        label: `${i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel10')}（QFBZ）`,
        name: 'reportTimeQFBZ',
      }, {
        modulePid: allId.REPORT_DISH_INFO_QFBZ_ID,
        label: `${i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel11')}（QFBZ）`,
        name: 'reportDishInfoQFBZ',
      }, {
        modulePid: allId.ABANDON_REPORT_QFBZ_ID,
        label: `${i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel12')}（QFBZ）`,
        name: 'abandonReportQFBZ',
      }, {
        modulePid: allId.REPORT_BUSINESS_YK_ID,
        label: i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel13'),
        name: 'reportBusinessYK',
      }, {
        modulePid: allId.REPORT_GIFT_ID,
        label: '赠送额度报表',
        name: 'reportGift',
      }, {
        modulePid: allId.REPORT_BUSINESS_XGSJ_ID,
        label: `${i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel1')}（XGSJ）`,
        name: 'reportBusinessXGSJ',
      }, {
        modulePid: allId.REPORT_TIME_XGSJ_ID,
        label: `${i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel10')}（XGSJ）`,
        name: 'reportTimeXGSJ',
      }];
    },
    /**
     *  报表权限的相关方法
     */
    // 获取报表权限的集合
    checkAuth() {
      const tmp = this.deskPageAuthModules.authByModules.filter(item => item.id === '1345');
      if (tmp && tmp.length > 0 && tmp[0].children) {
        if (!tmp[0].children.some(item => item.checked)) {
          this.$confirm(this.$t('Biz.UserDesktop.SearchPrint.IndexConfirm'), {
            confirmButtonText: this.$t('Dict.Sure'),
            cancelButtonText: this.$t('Dict.Cancel'),
            showCancelButton: false, // 是否显示取消按钮
            type: 'warning',
            showClose: false, // 是否显示关闭按钮
            closeOnClickModal: false, // 点击遮罩是否关闭
            closeOnPressEscape: false, // esc是否关闭
          }).then(() => {
            this.$router.go(-1);
          });
        }
        const obj = {};
        tmp[0].children.forEach((item) => {
          obj[item.id] = item.checked;
        });
        this.initTmpTabs();
        this.tabs = this.tmpTabs.filter(item => obj[item.modulePid]);
        this.reportList = this.deskPageAuthModules.reportList;
      }
      this.reportList = data.reportList || [];
    },
  },
};
</script>
