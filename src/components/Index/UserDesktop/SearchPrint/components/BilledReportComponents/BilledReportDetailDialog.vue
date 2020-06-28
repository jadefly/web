<template>
  <Dialog
    name="BilledReport.BilledReportDetailDialog"
    ref="dialog"
    :title="$t('Biz.UserDesktop.SearchPrint.BilledDetailTitle1')"
    :showSubmit="false"
    :top="offWorkTop"
    @close="onClose"
    @open="onOpen"
    width="1024px"
    height="690px"
    bottom="0px"
    :hotkeys="hotKeySet"
    id="billedReportDetailDialog"
  >
    <template slot="other-button">
      <button
        type="button"
        :disabled="data && data.hidePrintButton"
        class="btn btn-default bar-dialog-top-button"
        @click="printps"
      >{{$t('Dict.Printing')}}</button>
    </template>
    <!-- 结班明细，复用接班业务组件 AUTHOR:WANGYU -->
    <OffWorkComponent
      v-if="data"
      ref="offworkComponent"
      :data="data"
      :posMode = "posMode"
      :isShowPrevWork = "isShowPrevWork"
      @handleGetCheckData="handleGetCheckData"
    ></OffWorkComponent>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import OffWorkComponent from '@/components/Pos/Business_commons/OffWorkComponent';
import ajax from '@/common/js/ajax';

export default {
  components: { Dialog, OffWorkComponent },
  mixins: [DialogMixin],
  props: {
    searchParams: {
      type: Object,
      // eslint-disable-next-line vue/require-valid-default-prop
      default: {},
    },
    currentEmpId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      data: null,
      offWorkTop: '0px',
      checkData: null,
      isShowPrevWork: false, // 判断是否显示上班次信息 true:显示  false:不显示
      posMode: 1, // pos模式
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
        },
      };
    },
  },
  methods: {
    onOpen() {
      const boxHeight = document.documentElement.clientHeight;
      const boxH = (boxHeight - 690) / 2;
      this.offWorkTop = boxH >= 1 ? `${boxH}px` : `${0}px`;
      this.data = this.resData;
      // 获取pos模式 3---快餐 其他---中餐
      this.posMode = +this.data.controlMode;
      // 如果有version字段【忽略值】，则不显示上班次信息，否则显示
      this.isShowPrevWork = !this.data.version;
      // 处理未结班的流水没有签退时间时，接口返回值为“-”的时间值
      this.data.closeTime = this.data.closeTime === '-' ? '' : this.data.closeTime;
      setTimeout(() => {
        this.$refs.offworkComponent.init();
      }, 200);
    },
    handleGetCheckData(data) {
      this.checkData = data;
    },
    // 打印
    printps() {
        console.info('zxzxzx',this.searchParams)
      let pritParams = { psId: this.data.psId, posId: this.data.posId };
      if (this.searchParams.isShowPsDetail) {
        pritParams.empId = this.currentEmpId;
      }
      // this.checkData 判断支付信息的纯收和非收的显示是否合并
      if (this.checkData) pritParams = Object.assign(pritParams, { printDetail: this.checkData });
      ajax('canyin.desktop.report.print', {
        contentType: 'URLEncoded',
        data: {
          params: JSON.stringify(pritParams),
        },
      }).then(() => {});
    },
  },
};
</script>

<style lang="less" scoped>
  .bar-dialog-top-button {
    min-width: 85px;
  }
</style>
