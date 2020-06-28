<template>
  <div class="content">
    <div class="chart-info" ref="scrollContent">
      <el-row :gutter="14">
        <div class="table-wrap">
          <table border="1">
            <thead>
            <tr>
              <th colspan="3">{{$t('Biz.UserDesktop.SearchPrint.AbandonQFBZTh1')}}</th>
            </tr>
            </thead>
            <tbody v-for="(item, index) in reportData.DS2" :key="index">
              <tr class="strong">
                <td colspan="3">{{$t('Biz.UserDesktop.SearchPrint.AbandonQFBZTd1')}}{{ item.code }}</td>
              </tr>
              <tr>
                <td>{{$t('Dict.ItemName')}}</td>
                <td>{{$t('Dict.ChargebackNum')}}</td>
                <td>{{$t('Dict.ChargebackAmount')}}</td>
              </tr>
              <tr v-for="(item2, index2) in item.children" :key="`${index}_${index2}`">
                <td>{{ item2.itemName }}</td>
                <td>{{ item2.qty }}</td>
                <td>{{ item2.subtotal }}</td>
              </tr>
            </tbody>
            <tr class="strong">
              <td colspan="3">{{$t('Dict.Total')}}</td>
            </tr>
            <tr class="strong text-left">
              <td>{{$t('Biz.UserDesktop.SearchPrint.AbandonQFBZTd5')}}{{  formatValue(reportData.DS3[0], 'abBillCount') }}</td>
              <td>{{$t('Biz.UserDesktop.SearchPrint.AbandonQFBZTd6')}}{{ formatValue(reportData.DS3[0], 'abItemCount') }}</td>
              <td>{{$t('Dict.WasteAmount01')}}{{ formatValue(reportData.DS3[0], 'abMoney') }}</td>
            </tr>
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
    this.$von('searchForQFBZAbandon', (data) => {
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
