<template>
  <div class="content">
    <div class="chart-info" ref="scrollContent">
      <el-row :gutter="14">
        <div class="table-wrap">
          <table border="1">
            <thead>
            <tr>
              <th v-for="item in tableHead" :key="item">{{ item }}</th>
            </tr>
            </thead>
            <tbody>
              <tr v-for="item in reportData" :key="item.id">
                <td>{{ item.name }}</td>
                <td>{{ item.dayPresentAmt }}</td>
                <td>{{ item.dayPresentValue }}</td>
                <td>{{ item.monthPresentAmt }}</td>
                <td>{{ item.monthPresentValue }}</td>
              </tr>
              <tr class="strong">
                <td>{{$t('Dict.Total')}}</td>
                <td>{{ getTotal(reportData, 'dayPresentAmt') }}</td>
                <td>{{ getTotal(reportData, 'dayPresentValue') }}</td>
                <td>{{ getTotal(reportData, 'monthPresentAmt') }}</td>
                <td>{{ getTotal(reportData, 'monthPresentValue') }}</td>
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
      tableHead: [
        '姓名',
        '当日可用额度',
        '当日剩余额度',
        '当月可用额度',
        '当月剩余额度',
      ],
    };
  },
  mounted() {
    this.$von('reportGift', (data) => {
      this.reportData = data;
    });
  },
  methods: {
    getTotal(arr, key) {
      if (Array.isArray(arr) && arr.length > 0) {
        return arr.reduce((total, item) => add(total, item[key]), 0);
      }
      return 0;
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
