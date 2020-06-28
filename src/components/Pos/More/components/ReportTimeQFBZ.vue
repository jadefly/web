<template>
  <div class="content">
    <div class="chart-info" ref="scrollContent">
      <el-row :gutter="14">
        <div class="table-wrap">
          <table border="1">
            <thead>
            <tr>
              <th colspan="3"> {{$t('Biz.UserDesktop.SearchPrint.RTimeQFBZTh1')}}{{ formatValue(reportData.DS2[0], 'timeStr') }}</th>
            </tr>
            </thead>
            <tbody>
              <tr class="strong">
                <td>{{$t('Dict.Type')}}</td>
                <td>{{$t('Dict.SalesVolumes')}}</td>
                <td>{{$t('Dict.RealPaidAmount')}}</td>
              </tr>
              <tr class="strong text-left" v-for="(item, index) in reportData.DS2" :key="index">
                <td>{{ item.saleType }}</td>
                <td>{{ item.qty }}</td>
                <td>{{ item.money }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-wrap">
          <table border="1">
            <thead>
            <tr>
              <th colspan="3"> {{$t('Biz.UserDesktop.SearchPrint.RTimeQFBZTh1')}}{{ formatValue(reportData.DS3[0], 'timeStr') }}</th>
            </tr>
            </thead>
            <tbody>
            <tr class="strong">
              <td>{{$t('Dict.Type')}}</td>
              <td>{{$t('Dict.SalesVolumes')}}</td>
              <td>{{$t('Dict.RealPaidAmount')}}</td>
            </tr>
            <tr class="strong text-left" v-for="(item, index) in reportData.DS3" :key="index">
              <td>{{ item.saleType }}</td>
              <td>{{ item.qty }}</td>
              <td>{{ item.money }}</td>
            </tr>
            </tbody>
          </table>
        </div>
        <div class="table-wrap">
          <table border="1">
            <thead>
            <tr>
              <th colspan="3"> {{$t('Biz.UserDesktop.SearchPrint.RTimeQFBZTh1')}}{{ formatValue(reportData.DS4[0], 'timeStr') }}</th>
            </tr>
            </thead>
            <tbody>
            <tr class="strong">
              <td>{{$t('Dict.Type')}}</td>
              <td>{{$t('Dict.SalesVolumes')}}</td>
              <td>{{$t('Dict.RealPaidAmount')}}</td>
            </tr>
            <tr class="strong text-left" v-for="(item, index) in reportData.DS4" :key="index">
              <td>{{ item.saleType }}</td>
              <td>{{ item.qty }}</td>
              <td>{{ item.money }}</td>
            </tr>
            </tbody>
          </table>
        </div>
        <div class="table-wrap">
          <table border="1">
            <thead>
            <tr>
              <th colspan="3"> {{$t('Biz.UserDesktop.SearchPrint.RTimeQFBZTh1')}}{{ formatValue(reportData.DS5[0], 'timeStr') }}</th>
            </tr>
            </thead>
            <tbody>
            <tr class="strong">
              <td>{{$t('Dict.Type')}}</td>
              <td>{{$t('Dict.SalesVolumes')}}</td>
              <td>{{$t('Dict.RealPaidAmount')}}</td>
            </tr>
            <tr class="strong text-left" v-for="(item, index) in reportData.DS5" :key="index">
              <td>{{ item.saleType }}</td>
              <td>{{ item.qty }}</td>
              <td>{{ item.money }}</td>
            </tr>
            </tbody>
          </table>
        </div>
        <div class="table-wrap">
          <table border="1">
            <thead>
            <tr>
              <th colspan="3"> {{$t('Biz.UserDesktop.SearchPrint.RTimeQFBZTh1')}}{{ formatValue(reportData.DS6[0], 'timeStr') }}</th>
            </tr>
            </thead>
            <tbody>
            <tr class="strong">
              <td>{{$t('Dict.Type')}}</td>
              <td>{{$t('Dict.SalesVolumes')}}</td>
              <td>{{$t('Dict.RealPaidAmount')}}</td>
            </tr>
            <tr class="strong text-left" v-for="(item, index) in reportData.DS6" :key="index">
              <td>{{ item.saleType }}</td>
              <td>{{ item.qty }}</td>
              <td>{{ item.money }}</td>
            </tr>
            </tbody>
          </table>
        </div>
        <div class="table-wrap">
          <table border="1">
            <thead>
            <tr>
              <th colspan="3"> {{$t('Biz.UserDesktop.SearchPrint.RTimeQFBZTh1')}}{{ formatValue(reportData.DS7[0], 'timeStr') }}</th>
            </tr>
            </thead>
            <tbody>
            <tr class="strong">
              <td>{{$t('Dict.Type')}}</td>
              <td>{{$t('Dict.SalesVolumes')}}</td>
              <td>{{$t('Dict.RealPaidAmount')}}</td>
            </tr>
            <tr class="strong text-left" v-for="(item, index) in reportData.DS7" :key="index">
              <td>{{ item.saleType }}</td>
              <td>{{ item.qty }}</td>
              <td>{{ item.money }}</td>
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
import ajax from '@/common/js/ajax';
import numberformat from '@/common/js/numberformat';

export default {
  props: {
    settleBizDate: {},
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
      },
    };
  },
  watch: {
    reportData: {
      handler() {
        this.$emit('businessStatisticsReport', this.reportData);
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
      ajax('canyin.pos.businessreport.b05timereport', {
        contentType: 'URLEncoded',
        data: {
          area: this.area,
          startDate: this.settleBizDate,
          endDate: this.settleBizDate,
          shift: this.shift,
          state: 1,
        },
      })
        .then((data) => {
          this.reportData = data;
          this.$emit('reportData', data);
        });
    },
    reduce(arr, key) {
      return arr.reduce((sum, item) => sum + item[key], 0);
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
      max-width: 700px;
      min-width: 700px;
      background: #ffffff;
      table {
        width: 100%;
        color: #606266;
        border: 1px solid #ddf1f6;
        tr {
          th {
            padding: 5px 10px;
            text-align: center;
            background-color: #ddf1f6;
          }
          td {
            padding: 5px;
            text-align: center;
          }
          .text-center {
            text-align: center;
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
