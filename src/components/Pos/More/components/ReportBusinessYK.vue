<template>
  <div class="content">
    <div class="chart-info" ref="scrollContent">
      <el-row :gutter="14">
        <div class="table-wrap" v-if="reportData">
            <table border="1">
                <thead>
                <tr>
                    <th colspan="3">{{$t('Dict.BusinessKpi')}}</th>
                </tr>
                </thead>
                <tbody>
                <tr class="strong">
                    <td class="text-center">{{$t('Dict.Quota')}}</td>
                    <td class="text-center">{{$t('Dict.Amount')}}</td>
                    <td class="text-center">{{$t('Dict.Amount0')}}</td>
                </tr>
                <tr class="strong text-left" v-for="(item, index) in reportData.DS2" :key="index">
                    <td>{{ item.col1 }}</td>
                    <td>{{ item.col2 }}</td>
                    <td>{{ item.col3 }}</td>
                </tr>
                </tbody>
            </table>
            <table border="1">
                <thead>
                <tr>
                    <th colspan="3">{{$t('Biz.UserDesktop.SearchPrint.TypeStatistics')}}</th>
                </tr>
                </thead>
                <tbody>
                <tr class="strong text-left" v-for="(item, index) in reportData.DS3" :key="index">
                    <td>{{ item.col1 }}</td>
                    <td>{{ item.col2 }}</td>
                    <td>{{ item.col3 }}</td>
                </tr>
                </tbody>
            </table>
            <table border="1">
                <thead>
                <tr>
                    <th colspan="3">{{$t('Biz.UserDesktop.SearchPrint.PreferentialStatistics')}}</th>
                </tr>
                </thead>
                <tbody>
                <tr class="strong">
                    <td>{{$t('Biz.UserDesktop.SearchPrint.PreferentialName')}}</td>
                    <td>{{$t('Dict.Numbers')}}</td>
                    <td>{{$t('Biz.UserDesktop.SearchPrint.RDishInfoQFBZTd3')}}</td>
                </tr>
                <tr class="strong text-left" v-for="item in reportData.DS4">
                    <td>{{ item.col1 }}</td>
                    <td>{{ item.col2 }}</td>
                    <td>{{ item.col3 }}</td>
                </tr>
                </tbody>
            </table>
            <table border="1">
                <thead>
                <tr>
                    <th colspan="3">{{$t('Biz.UserDesktop.SearchPrint.PaymentStatistics')}}</th>
                </tr>
                </thead>
                <tbody>
                <tr class="strong">
                    <td>{{$t('Dict.SettlementMethod')}}</td>
                    <td>{{$t('Dict.Numbers')}}</td>
                    <td>{{$t('Biz.UserDesktop.SearchPrint.RDishInfoQFBZTd3')}}</td>
                </tr>
                <tr class="strong text-left" v-for="item in reportData.DS5">
                    <td>{{ item.col1 }}</td>
                    <td>{{ item.col2 }}</td>
                    <td>{{ item.col3 }}</td>
                </tr>
                </tbody>
            </table>
            <table border="1">
                <thead>
                <tr>
                    <th colspan="3">{{$t('Biz.UserDesktop.SearchPrint.ShiftsStatistics')}}</th>
                </tr>
                </thead>
                <tbody>
                <tr class="strong">
                    <td>{{$t('Dict.Shift')}}</td>
                    <td>{{$t('Dict.Numbers')}}</td>
                    <td>{{$t('Biz.UserDesktop.SearchPrint.RDishInfoQFBZTd3')}}</td>
                </tr>
                <tr class="strong text-left" v-for="item in reportData.DS6">
                    <td>{{ item.col1 }}</td>
                    <td>{{ item.col2 }}</td>
                    <td>{{ item.col3 }}</td>
                </tr>
                </tbody>
            </table>
            <table border="1">
                <thead>
                <tr>
                    <th colspan="3">{{$t('Biz.UserDesktop.SearchPrint.SealStatistics')}}</th>
                </tr>
                </thead>
                <tbody>
                <tr class="strong">
                    <td>{{$t('Dict.Item')}}</td>
                    <td>{{$t('Dict.weight')}}</td>
                    <td>{{$t('Dict.Number')}}</td>
                </tr>
                <tr class="strong text-left" v-for="item in reportData.DS7">
                    <td>{{ item.col1 }}</td>
                    <td>{{ item.col2 }}</td>
                    <td>{{ item.col3 }}</td>
                </tr>
                </tbody>
            </table>
            <table border="1">
                <thead>
                <tr>
                    <th colspan="3">{{$t('Biz.UserDesktop.SearchPrint.TicketStatistics')}}</th>
                </tr>
                </thead>
                <tbody>
                <tr class="strong">
                    <td>{{$t('Dict.SettlementMethod')}}</td>
                    <td>{{$t('Dict.Amount')}}</td>
                    <td>{{$t('Dict.Amount0')}}</td>
                </tr>
                <tr class="strong text-left" v-for="item in reportData.DS8">
                    <td>{{ item.col1 }}</td>
                    <td>{{ item.col2 }}</td>
                    <td>{{ item.col3 }}</td>
                </tr>
                </tbody>
            </table>
        </div>
      </el-row>
    </div>
    <div class="pos-pager pos-takeout-pager">
      <button
        href="javascript:;"
        class="prev"
        @click="upPage"
      ><i class="el-icon-arrow-up"></i></button>
      <button
        href="javasctipt:;"
        class="next"
        @click="downPage"
      ><i class="el-icon-arrow-down"></i></button>
    </div>
  </div>
</template>
<script>
import ajax from '@/common/js/ajax';
import numberformat from '@/common/js/numberformat';

export default {
  props: {
    startDate: {},
    endDate: {},
    shift: {},
  },
  data() {
    return {
      offset: 100,
      reportData: {
        DS2: [],
        DS3: [],
        DS4: [],
        DS5: [],
        DS6: [],
        DS7: [],
        DS8: [],
      },
      printData: '', // 打印数据
    };
  },
  filters: {
    keepTwo(val) {
      if (!val) return '0.00';
      return numberformat(val);
    },
  },
  watch: {
    reportData: {
      handler() {
        this.$emit('businessStatisticsReport', this.printData);
      },
      deep: true,
    },
  },
  methods: {
    formatValue(obj, key) {
      if (!obj) return 0;
      return obj[key];
    },
    // 搜索
    search() {
      if (this.startDate > this.endDate) {
        this.$alert('开始时间不能大于结束时间', '提示');
        return;
      }
      ajax('canyin.pos.businessreport.b13businessreport', {
        contentType: 'URLEncoded',
        data: {
          startDate: this.startDate,
          endDate: this.endDate,
          shift: this.shift,
        },
      }).then((data) => {
        // 打印数据和 表格数据格式不同，分别赋值
        this.printData = data.printResult;
        this.reportData = data.reportResult;
        this.$emit('reportData', data.reportResult);
      });
    },
    upPage() {
      if (this.$refs.scrollContent.scrollTop < this.offset) {
        this.$refs.scrollContent.scrollTop = 0;
        return;
      }
      this.$refs.scrollContent.scrollTop -= this.offset;
    },
    downPage() {
      if (
        this.$refs.scrollContent.scrollTop + this.$refs.scrollContent.clientHeight
        > this.$refs.scrollContent.scrollHeight
      ) return;
      this.$refs.scrollContent.scrollTop += this.offset;
    },
  },
};
</script>
<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";

  .chart-info{
    margin-top: 20px;
    height: 574px;
    overflow: auto;
    overflow-x: hidden;
    .table-wrap {
      margin-left: 60px;
      max-width: 800px;
      min-width: 800px;
      background: #ffffff;
      table {
        width: 100%;
        color: #606266;
        border: 1px solid #ddf1f6;
        tr {
          th {
            padding: 5px;
            text-align: center;
            background-color: #ddf1f6;
          }
          td {
            padding: 5px;
            text-align: center;
            width: 175px;
          }
          td:first-child {
            width: 450px;
          }
        }
        tr.text-left {
          th, td {
              text-align: left;
          }
        }
        .strong {
          font-weight: bold;
        }
      }
    }
  }
  @media screen and (max-height: 900px) and (min-height: 768px) {
    .chart-info{
      height: 460px;
    }
  }
  @media screen and (max-height: 767px) and (min-height: 650px) {
    .chart-info{
      height: 350px;
    }
  }
  .card{
    font-size: 12px;
    padding-bottom: 12px;
    .card-title{
      background-color: @brand-primary;
      color: @white;
      line-height: 2;
      padding-left: 8px;
    }
    table{
      background-color: @white;
      width: 100%;
    }
    td{
      line-height: 2.3;
    }
    .table-title{
      text-align: left;
      padding-left: 8px;
    }
    .table-content{
      text-align: right;
      padding-right: 8px;
    }
    .w25{
      width: 25%;
    }
    .w50{
      width: 50%;
    }
  }

  // 箭头按钮
  .pos-takeout-pager {
    position: absolute;
    right: 12px;
    bottom: 12px;
    > button {
      display: inline-block;
      width: 44px;
      height: 30px;
      border: 1px solid #9a9a9a;
      line-height: 28px;
      border-radius: 14px;
      text-align: center;
      margin-left: 8px;
      background-color: white;

      > i {
        color : #9a9a9a;
      }

      &[disabled] {
        color: @btn-disabled-color;
        cursor: not-allowed;
      }
    }
  }
</style>
