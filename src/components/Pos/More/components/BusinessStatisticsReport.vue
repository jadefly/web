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
            <tr v-for="item in reportData.DS2">
              <td>{{ item.col1 }}</td>
              <td>{{ item.col2 }}</td>
              <td>{{ item.col3 }}</td>
            </tr>
            </tbody>
          </table>
          <table border="1">
            <thead>
            <tr>
              <th colspan="3">{{$t('Biz.Pos.More.BusinessStatTh2')}}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="item in reportData.DS3">
              <td>{{ item.col1 }}</td>
              <td>{{ item.col2 }}</td>
              <td>{{ item.col3 }}</td>
            </tr>
            </tbody>
          </table>
          <table border="1">
            <thead>
            <tr>
              <th colspan="3">{{$t('Biz.Pos.More.BusinessStatTh3')}}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="item in reportData.DS4">
              <td>{{ item.col1 }}</td>
              <td>{{ item.col2 }}</td>
              <td>{{ item.col3 }}</td>
            </tr>
            </tbody>
          </table>
          <table border="1">
            <thead>
            <tr>
              <th colspan="3">{{$t('Biz.Pos.More.BusinessStatTh4')}}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="item in reportData.DS5">
              <td>{{ item.col1 }}</td>
              <td>{{ item.col2 }}</td>
              <td>{{ item.col3 }}</td>
            </tr>
            </tbody>
          </table>
          <table border="1">
            <thead>
            <tr>
              <th colspan="3">{{$t('Biz.Pos.More.BusinessStatTh5')}}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="item in reportData.DS6">
              <td>{{ item.col1 }}</td>
              <td>{{ item.col2 }}</td>
              <td>{{ item.col3 }}</td>
            </tr>
            </tbody>
          </table>
          <table border="1">
            <thead>
            <tr>
              <th colspan="3">{{$t('Biz.Pos.More.BusinessStatTh6')}}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="item in reportData.DS7">
              <td>{{ item.col1 }}</td>
              <td>{{ item.col2 }}</td>
              <td>{{ item.col3 }}</td>
            </tr>
            </tbody>
          </table>
          <table border="1">
            <thead>
            <tr>
              <th colspan="3">{{$t('Dict.PracticeStatistics')}}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="item in reportData.DS8">
              <td>{{ item.col1 }}</td>
              <td>{{ item.col2 }}</td>
              <td>{{ item.col3 }}</td>
            </tr>
            </tbody>
          </table>
          <table border="1">
            <thead>
            <tr>
              <th colspan="3">{{$t('Dict.SpecialOperation')}}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="item in reportData.DS9">
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
    startDate: {},
    endDate: {},
    area: {},
    settleBizDate: {},
    shift: {},
  },
  data() {
    return {
      offset: 100,
      reportData: null,
    };
  },
  watch: {
    reportData: {
      handler(val) {
        if (!val) return;
        this.$emit('businessStatisticsReport', this.reportData);
      },
      deep: true,
    },
  },
  methods: {
    verifyDate(startDate, endDate) {
      if (startDate > endDate) {
        this.$alert(this.$t('Dict.TimeVerify'), this.$t('Dict.Tips'));
        return false;
      }
      return true;
    },
    // 搜索
    search() {
      const { area, settleBizDate, shift } = this;
      // if (!this.verifyDate(startDate, endDate)) return;
      ajax('canyin.pos.businessreport.b11businessreport', {
        contentType: 'URLEncoded',
        data: {
          area,
          startDate: settleBizDate,
          endDate: settleBizDate,
          shift,
          state: 1,
        },
      })
        .then((data) => {
          this.reportData = data;
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
