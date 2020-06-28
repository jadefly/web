<template>
  <div class="content">
    <div class="chart-info" ref="scrollContent">
      <el-row :gutter="14">
        <div class="table-wrap" v-if="reportData">
          <table border="1">
            <thead>
              <tr>
                <th colspan="3">{{$t('Dict.SettlementNetIncome')}}</th>
              </tr>
            </thead>
            <tbody>
            <tr v-for="item in reportData.DS2">
              <td>{{ item.col1 }}</td>
              <td>{{ item.col2 }}</td>
              <td>{{ item.col3 }}</td>
            </tr>
            <tr class="strong">
              <td>{{$t('Dict.Total01')}}</td>
              <td>{{ reportData.DS5[0].csCount }}</td>
              <td>{{ reportData.DS5[0].csMoney }}</td>
              </tr>
            </tbody>
          </table>
          <table border="1">
            <thead>
              <tr>
                <th colspan="3">{{$t('Dict.SettlementNonIncome')}}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in reportData.DS3">
                <td>{{ item.col1 }}</td>
                <td>{{ item.col2 }}</td>
                <td>{{ item.col3 }}</td>
              </tr>
              <tr class="strong">
                <td>{{$t('Dict.Subtotal1')}}</td>
                <td>{{ reportData.DS5[0].fsrCount }}</td>
                <td>{{ reportData.DS5[0].fsrMoney }}</td>
              </tr>
            </tbody>
          </table>
          <table border="1">
            <thead>
              <tr>
                <th colspan="3">{{$t('Biz.UserDesktop.SearchPrint.SettleStatisticsRTh3')}}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in reportData.DS4">
                <td>{{ item.col1 }}</td>
                <td>{{ item.col2 }}</td>
                <td>{{ item.col3 }}</td>
              </tr>
              <tr class="strong">
                <td>{{$t('Dict.Subtotal')}}</td>
                <td>{{ reportData.DS5[0].yhxjCount }}</td>
                <td>{{ reportData.DS5[0].yhxjMoney }}</td>
              </tr>
              <tr class="strong">
                <td>{{$t('Dict.Total')}}</td>
                <td>{{ reportData.DS5[0].yhhjCount }}</td>
                <td>{{ reportData.DS5[0].yhhjMoney }}</td>
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
  data() {
    return {
      offset: 100,
      reportData: null,
    };
  },
  mounted() {
    this.$von('searchForXYXSettle', (data) => {
      this.reportData = data;
    });
  },
  methods: {
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
    /*margin-left: 60px;*/
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
