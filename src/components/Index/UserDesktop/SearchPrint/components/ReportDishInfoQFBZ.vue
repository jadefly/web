<template>
  <div class="content">
    <div class="chart-info" ref="scrollContent">
      <el-row :gutter="14">
        <div class="table-wrap">
          <table border="1">
            <thead>
              <tr>
                <th colspan="5">{{$t('Biz.UserDesktop.SearchPrint.RDishInfoQFBZTh1')}}</th>
              </tr>
            </thead>
            <tbody>
              <tr class="strong">
                <td>{{$t('Dict.ItemName')}}</td>
                <td>{{$t('Dict.Amount')}}</td>
                <td>{{$t('Dict.Amount0')}}</td>
                <td>{{$t('Biz.UserDesktop.SearchPrint.RDishInfoQFBZTd4')}}</td>
                <td>{{$t('Biz.UserDesktop.SearchPrint.RDishInfoQFBZTd5')}}</td>
              </tr>
              <tr class="strong text-left" v-for="(item, index) in reportData.DS2" :key="index">
                <td>{{ item.name }}</td>
                <td>{{ item.saleNum }}</td>
                <td>{{ item.shiShou }}</td>
                <td>{{ item.qtyZhanBi }}%</td>
                <td>{{ item.shiShouZhanBi }}%</td>
              </tr>
              <tr class="strong text-left">
                <td>{{$t('Dict.Total01')}}</td>
                <td>{{ formatValue(reportData.DS3[0], 'sumCount') }}</td>
                <td>{{ formatValue(reportData.DS3[0], 'sumMoney') }}</td>
                <td></td>
                <td></td>
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
    this.$von('searchForQFBZDish', (data) => {
      this.reportData = data;
    });
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
