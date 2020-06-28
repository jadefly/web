<template>
  <div class="content">
    <div class="chart-info" ref="scrollContent">
      <el-row :gutter="14">
        <el-col :span="8">
          <div class="card">
            <div class="card-title">{{$t('Dict.BusinessKpi')}}</div>
            <table v-if="reportData.DS2">
              <tr>
                <td class="table-title">{{$t('Biz.UserDesktop.SearchPrint.RBusinessBZHGTd1')}}</td>
                <td class="table-content">{{ formatValue(reportData.DS2[0], 'deskCount')}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.UserDesktop.SearchPrint.RBusinessTd17')}}</td>
                <td class="table-content">{{ formatValue(reportData.DS2[0], 'deskAvg') | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.UserDesktop.SearchPrint.RBusinessBZHGTd3')}}</td>
                <td class="table-content">{{ formatValue(reportData.DS2[0], 'deskRate') | keepTwo}}%</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Dict.PassengerFlow')}}</td>
                <td class="table-content">{{ formatValue(reportData.DS2[0], 'peopleQty')}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.UserDesktop.SearchPrint.RBusinessTd18')}}</td>
                <td class="table-content">{{ formatValue(reportData.DS2[0], 'peopleAvg') | keepTwo}}</td>
              </tr>
            </table>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="card title">
            <div class="card-title">{{$t('Biz.UserDesktop.SearchPrint.RBusinessBZHGDiv2')}}</div>
            <table>
              <thead>
                <tr>
                  <th class="block">{{$t('Dict.Item')}}</th>
                  <th>{{$t('Dict.SalesVolumes')}}</th>
                  <th>{{$t('Biz.UserDesktop.SearchPrint.RBusinessBZHGTh3')}}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in reportData.DS3" :key="index">
                  <td class="table-title block">{{ item.itemName }}</td>
                  <td class="table-content">{{ item.lastQty }}</td>
                  <td class="table-content">{{ item.rate }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="pos-pager pos-takeout-pager">
      <button href="javascript:;" class="prev" @click="upPage"><i class="el-icon-arrow-up"></i></button>
      <button href="javasctipt:;" class="next" @click="downPage"><i class="el-icon-arrow-down"></i></button>
    </div>
  </div>
</template>
<script>
import numberformat from '@/common/js/numberformat';

export default {
  data() {
    return {
      offset: 100,
      reportData: {
        DS2: [],
        DS3: [],
      },
    };
  },
  mounted() {
    this.$von('searchForBZHG', (data) => {
      this.reportData = data;
    });
  },
  filters: {
    keepTwo(val) {
      if (!val) return '0.00';
      return numberformat(val);
    },
  },
  methods: {
    formatValue(obj, key) {
      if (!obj) return 0;
      return obj[key];
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
  &.title {
    .table-content{
      text-align: center;
    }
    .block {
      display: block;
      width: 100px;
    }
    th,td {
      padding: 0;
      text-align: center;
      width: 33.33%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
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
