<template>
  <div class="wraper">
    <div class="content" ref="billedReportTable">
      <el-table :data="tableData" style="width: 100%" height="100%" highlight-current-row border>
        <el-table-column
          :label="$t('Dict.SerialNumber')"
          type="index"
          width="50">
        </el-table-column>
        <el-table-column
          v-for="(item ,index) in tableSettings"
          :key="index"
          :prop="item.prop"
          :label="item.label"
          :class-name="item.className"
          :min-width="item.minWidth"
          :fixed="item.fixed"
          :width="item.width"
          :align="item.align"
          :type= "item.type"
        >
          <template slot-scope="scope">
            <div v-if="item.prop === 'op'">
              <!-- 流水号，可点击查看结班明细 -->
              <span
                class="tablecode"
                @click="showDetailDialog(scope.row)"
              >{{$t('Dict.See')}}</span>
              <!-- 未结班的流水不显示该操作 -->
              <span
                class="tablecode"
                v-if="scope.row.close!=='-'"
                @click="reCacl(scope.row)"
              >{{$t('Biz.UserDesktop.SearchPrint.BilledSpan2')}}</span>
            </div>
            <div v-else>
              <span>{{scope.row[item.prop]}}</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <BilledReportDetailDialog
      :searchParams="searchParams"
      :currentEmpId="currentEmpId"
      ref="billedReportDetail"
    ></BilledReportDetailDialog>
    <BilledReCalcDialog ref="billedReCalcDialog" :data="recalcData"></BilledReCalcDialog>
  </div>
</template>

<script>
import ajax from '@/common/js/ajax';
import BilledReportDetailDialog from './BilledReportComponents/BilledReportDetailDialog';
import BilledReCalcDialog from './BilledReportComponents/BilledReCalcDialog';

export default {
  components: { BilledReportDetailDialog, BilledReCalcDialog },
  data() {
    return {
      // 查询参数
      searchParams: {},
      // 结班报表table绑定数据
      tableData: [],
      // 结班报表table列配置
      tableSettings: [{
        prop: 'code',
        label: this.$t('Biz.UserDesktop.SearchPrint.BilledTableL1'),
        width: '260',
        className: 'no-wrap',
      }, {
        prop: 'emp',
        label: this.$t('Biz.UserDesktop.SearchPrint.BilledTableL2'),
        width: '200',
        className: 'no-wrap',
      }, {
        prop: 'open',
        label: this.$t('Dict.CheckInTime'),
        width: '200',
        align: 'center',
        className: 'no-wrap',
      }, {
        prop: 'close',
        label: this.$t('Dict.SigningTime'),
        width: '200',
        align: 'center',
        className: 'no-wrap',
      }, {
        prop: 'remark',
        label: this.$t('Dict.Remarks'),
        align: 'center',
        className: 'no-wrap',
      }, {
        prop: 'op',
        label: this.$t('Dict.Operation'),
        align: 'center',
        fixed: 'right',
        width: '220',
        className: 'no-wrap',
      }],
      recalcData: {},
      currentEmpId: '',
    };
  },
  mounted() {
    // 监听Header组件发来的消息 来更新列表
    this.$von('searchBilledReport', (data, endJobForm) => {
      this.searchParams = endJobForm;
      this.tableData = data ? data.root : [];
    });
  },
  methods: {
    // 显示结班明细
    showDetailDialog(row) {
      const { psId, empId, close } = row;
      const params = {
        psId,
      };
      if (this.searchParams.isShowPsDetail) {
        params.empId = empId;
      }
      ajax('canyin.desktop.report.detail', {
        contentType: 'URLEncoded',
        data: params,
      }).then((data) => {
        this.currentEmpId = empId;
        data.hidePrintButton = close === '-';
        this.$refs.billedReportDetail.open(data);
      });
    },
    // 结班重算
    reCacl(val) {
      this.recalcData = val;
      this.$refs.billedReCalcDialog.open(null, {
        submit: () => {
          this.searchBilledReportList();
        },
      });
    },
    // 查询结班报表
    searchBilledReportList() {
      ajax('canyin.desktop.report.list', {
        contentType: 'URLEncoded',
        data: {
          data: JSON.stringify({
            psType: this.searchParams.psType,
            operator: this.searchParams.operator,
            startDate: this.searchParams.startDate,
            endDate: this.searchParams.endDate,
            state: 1,
            isShowEndJob: this.searchParams.isShowEndJob ? 'on' : 'off',
          }),
        },
      }).then((data) => {
        this.tableData = data ? data.root : [];
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.wraper {
  position: relative;
  height: calc(100% - 190px);
  overflow: auto;
  padding: 15px;
  .content {
    height: 100%;
    .tablecode{
      color:#0096A4;
      cursor: pointer;
      margin:0 5px;
    }
  }
}
</style>
