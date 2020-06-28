<template>
  <div class="content">
    <div class="chart-info" ref="scrollContent">
      <el-row :gutter="14">
        <div class="table-wrap">
          <table border="1">
            <thead>
            <tr>
              <th colspan="7">{{ $t('Biz.UserDesktop.SearchPrint.SealStatistics') }}</th>
            </tr>
            </thead>
            <tbody>
            <tr class="strong center">
              <td>{{ $t('Dict.Type') }}</td>
              <td>{{ $t('Dict.NumOfBills') }}</td>
              <td>{{ $t('Dict.Cups') }}</td>
              <td>{{ $t('Dict.AmountReceivable') }}</td>
              <td>{{ $t('Dict.RealPaidAmount') }}</td>
              <td>{{ $t('Dict.AveragePrice') }}</td>
              <td>{{ $t('Dict.Cups') }}{{ $t('Dict.Proportion') }}</td>
            </tr>
            <tr v-for="(item, index) in reportData.DS2" :key="index">
              <td>{{ item.type }}</td>
              <td>{{ item.bsCount }}</td>
              <td>{{ item.qty }}</td>
              <td>{{ item.orig }}</td>
              <td>{{ item.money }}</td>
              <td>{{ item.val1 }}</td>
              <td>{{ item.val2 }}</td>
            </tr>
            <tr class="strong">
              <td>{{$t('Dict.Total')}}</td>
              <td>{{ getTotal(reportData.DS2, 'bsCount') }}</td>
              <td>{{ getTotal(reportData.DS2, 'qty') }}</td>
              <td>{{ getTotal(reportData.DS2, 'orig') }}</td>
              <td>{{ getTotal(reportData.DS2, 'money') }}</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            </tbody>
          </table>
          <table border="1">
            <thead>
            <tr>
              <th colspan="7">{{$t('Dict.Statistics')}}</th>
            </tr>
            </thead>
            <tbody>
            <tr class="strong center">
              <td colspan="2">{{$t('Dict.Type')}}</td>
              <td>{{ $t('Dict.Cups') }}</td>
              <td>{{ $t('Dict.AmountReceivable') }}</td>
              <td>{{ $t('Dict.RealPaidAmount') }}</td>
              <td>{{ $t('Dict.AveragePrice') }}</td>
              <td>{{ $t('Dict.Cups') }}{{ $t('Dict.Proportion') }}</td>
            </tr>
            <tr v-for="(item, index) in reportData.DS3" :key="index">
              <td colspan="2">{{ item.type }}</td>
              <td>{{ item.qty }}</td>
              <td>{{ item.orig }}</td>
              <td>{{ item.money }}</td>
              <td>{{ item.val1 }}</td>
              <td>{{ item.val2 }}</td>
            </tr>
            <tr class="strong">
              <td colspan="2">{{$t('Dict.Total')}}</td>
              <td>{{ getTotal(reportData.DS3, 'qty') }}</td>
              <td>{{ getTotal(reportData.DS3, 'orig') }}</td>
              <td>{{ getTotal(reportData.DS3, 'money') }}</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            </tbody>
          </table>
          <table border="1">
            <thead>
            <tr>
              <th colspan="7">{{$t('Dict.Other')}}</th>
            </tr>
            </thead>
            <tbody>
            <tr class="strong center">
              <td colspan="2">{{$t('Dict.Item')}}</td>
              <td>{{ $t('Dict.SalesVolumes') }}</td>
              <td>{{ $t('Dict.AmountReceivable') }}</td>
              <td>{{ $t('Dict.RealPaidAmount') }}</td>
            </tr>
            <tr v-for="(item, index) in reportData.DS7" :key="index">
              <td colspan="2">{{ item.type }}</td>
              <td>{{ item.qty }}</td>
              <td>{{ item.orig }}</td>
              <td>{{ item.money }}</td>
            </tr>
            <tr class="strong">
              <td colspan="2">合计</td>
              <td>{{ getTotal(reportData.DS7, 'qty') }}</td>
              <td>{{ getTotal(reportData.DS7, 'orig') }}</td>
              <td>{{ getTotal(reportData.DS7, 'money') }}</td>
            </tr>
            </tbody>
          </table>
          <table border="1">
            <thead>
            <tr>
              <th colspan="7">{{ $t('Dict.GiftStatistics') }}</th>
            </tr>
            </thead>
            <tbody>
            <tr class="strong center">
              <td colspan="2">{{ $t('Dict.Reason2') }}</td>
              <td>{{ $t('Dict.NumOfBills') }}</td>
              <td>{{ $t('Dict.Cups') }}</td>
              <td>{{ $t('Dict.GiveAmountLable') }}</td>
              <td>{{ $t('Dict.Bill') }}{{ $t('Dict.Proportion') }}</td>
              <td>{{ $t('Dict.Cups') }}{{ $t('Dict.Proportion') }}</td>
            </tr>
            <tr
                v-for="(item, index) in reportData.DS4"
                :key="index"
            >
              <td colspan="2">{{ item.type }}</td>
              <td>{{ item.bsCount }}</td>
              <td>{{ item.qty }}</td>
              <td>{{ item.money }}</td>
              <td>{{ item.val1 }}</td>
              <td>{{ item.val2 }}</td>
            </tr>
            <tr class="strong">
              <td colspan="2">{{$t('Dict.Total')}}</td>
              <td>{{ getTotal(reportData.DS4, 'bsCount') }}</td>
              <td>{{ getTotal(reportData.DS4, 'qty') }}</td>
              <td>{{ getTotal(reportData.DS4, 'money') }}</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            </tbody>
          </table>
          <table border="1">
            <thead>
            <tr>
              <th colspan="7">{{ $t('Biz.UserDesktop.SearchPrint.PreferentialStatistics') }}</th>
            </tr>
            </thead>
            <tbody>
            <tr class="strong center">
              <td colspan="2">{{ $t('Dict.Type') }}</td>
              <td>{{ $t('Dict.NumOfBills') }}</td>
              <td>{{ $t('Dict.Cups') }}</td>
              <td>{{ $t('Dict.PreferentialAmount') }}</td>
              <td>{{ $t('Dict.Bill') }}{{ $t('Dict.Proportion') }}</td>
              <td>{{ $t('Dict.Cups') }}{{ $t('Dict.Proportion') }}</td>
            </tr>
            <tr v-for="(item, index) in reportData.DS5" :key="index">
              <td colspan="2">{{ item.type }}</td>
              <td>{{ item.bsCount }}</td>
              <td>{{ item.qty }}</td>
              <td>{{ item.money }}</td>
              <td>{{ item.val1 }}</td>
              <td>{{ item.val2 }}</td>
            </tr>
            <tr class="strong">
              <td colspan="2">{{$t('Dict.Total')}}</td>
              <td>{{ getTotal(reportData.DS5, 'bsCount') }}</td>
              <td>{{ getTotal(reportData.DS5, 'qty') }}</td>
              <td>{{ getTotal(reportData.DS5, 'money') }}</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            </tbody>
          </table>
          <table border="1">
            <thead>
            <tr>
              <th colspan="7">{{ $t('Dict.SettlementMethod') }}</th>
            </tr>
            </thead>
            <tbody>
            <tr class="strong center">
              <td colspan="2">{{ $t('Dict.SettlementMethod') }}</td>
              <td>{{ $t('Dict.Numbers') }}</td>
              <td>{{ $t('Dict.RealPaidAmount') }}</td>
              <td>{{ $t('Biz.BizComm.NetIncome01') }}</td>
              <td>{{ $t('Dict.NetIncome') }}</td>
              <td>{{ $t('Biz.UserDesktop.SearchPrint.RBusinessQFBZTd5') }}</td>
            </tr>
            <tr
                v-for="(item, index) in reportData.DS6"
                :key="index">
              <td colspan="2">{{ item.type }}</td>
              <td>{{ item.bsCount }}</td>
              <td>{{ item.orig }}</td>
              <td>{{ item.money }}</td>
              <td>{{ item.val1 }}</td>
              <td>{{ item.val2 }}</td>
            </tr>
            <tr class="strong">
              <td colspan="2">{{$t('Dict.Total')}}</td>
              <td>{{ getTotal(reportData.DS6, 'bsCount') }}</td>
              <td>{{ getTotal(reportData.DS6, 'orig') }}</td>
              <td>{{ getTotal(reportData.DS6, 'money') }}</td>
              <td>{{ getTotal(reportData.DS6, 'val1') }}</td>
              <td>&nbsp;</td>
            </tr>
            </tbody>
          </table>
        </div>
      </el-row>
    </div>
    <div class="pos-pager pos-takeout-pager">
      <button href="javascript:;" class="prev" @click="upPage"><i class="el-icon-arrow-up"></i></button>
      <button href="javasctipt:;" class="next" @click="downPage"><i class="el-icon-arrow-down"></i></button>
    </div>
  </div>
</template>
<script>

import { add } from '@/common/js/math';

export default {
  data() {
    return {
      offset: 100,
      reportData: {},
    };
  },
  mounted() {
    this.$von('reportBusinessXGSJ', (data) => {
      this.reportData = data;
    });
  },
  methods: {
    getTotal(arr, key) {
      if (!Array.isArray(arr)) return 0;
      return arr.reduce((total, obj) => add(total, obj[key]), 0);
    },
    upPage() {
      if (this.$refs.scrollContent.scrollTop < this.offset) {
        this.$refs.scrollContent.scrollTop = 0;
        return;
      }
      this.$refs.scrollContent.scrollTop -= this.offset;
    },
    downPage() {
      if ((this.$refs.scrollContent.scrollTop + this.$refs.scrollContent.clientHeight) > this.$refs.scrollContent.scrollHeight) return;
      this.$refs.scrollContent.scrollTop += this.offset;
    },
  },
};
</script>
<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .content {
    flex: 1;
    overflow: hidden;
  }
  .chart-info{
    margin-top: 20px;
    height: calc(100% - 60px);
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
            font-size: 16px;
            background-color: #ddf1f6;
          }
          td {
            padding: 5px;
          }
        }
        .center {
          text-align: center;
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
    right: 25px;
    bottom: 25px;
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
