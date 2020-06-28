<template>
  <div class="content">
    <div class="check-list">
      <span class="title">{{$t('Dict.ShowReport')}}</span>
      <el-checkbox-group class="list" v-model="checkList">
        <el-checkbox label="1">{{$t('Dict.BigClassReport')}}</el-checkbox>
        <el-checkbox label="2">{{$t('Dict.SmallClassReport')}}</el-checkbox>
        <el-checkbox label="3">{{$t('Dict.ItemsCount')}}</el-checkbox>
        <el-checkbox label="4">{{$t('Dict.ItemPresentation')}}</el-checkbox>
        <el-checkbox label="5">{{$t('Dict.ItemsChargeBack')}}</el-checkbox>
        <el-checkbox label="6">{{$t('Dict.AuxiliaryUnitCount')}}</el-checkbox>
      </el-checkbox-group>
    </div>
    <div class="chart-info" ref="scrollContent">
      <el-row :gutter="14">
        <el-col :span="8">
          <div class="card" v-show="checkList.indexOf('3') >= 0">
            <div class="card-title">{{$t('Dict.ItemsCount')}}</div>
            <table>
              <tr class="row-head">
                <th class="w50">{{$t('Dict.ItemName')}}</th>
                <th class="w25">{{$t('Dict.SalesVolumes')}}</th>
                <th class="w25">{{$t('Dict.RealPaidAmount')}}</th>
              </tr>
              <tr v-for="item in reportData.DS4">
                <td class="w50">{{item.name}}<template v-if="item.sizeName">({{item.sizeName}})</template></td>
                <td class="w25">{{item.count | keepTwo}}</td>
                <td class="w25">{{item.lastTotal | keepTwo}}</td>
              </tr>
              <tr v-if="reportData.DS7 && reportData.DS7[0]">
                <th class="w50">{{$t('Dict.Total')}}</th>
                <th class="w25">{{reportData.DS7[0].sumQty | keepTwo}}</th>
                <th class="w25">{{reportData.DS7[0].sumVal | keepTwo}}</th>
              </tr>
            </table>
          </div>
          <div class="card" v-show="checkList.indexOf('6') >= 0">
            <div class="card-title">{{ $t('Dict.AuxiliaryUnitCount') }}</div>
            <table>
              <tr class="row-head">
                <th class="w50">{{$t('Dict.ItemName')}}</th>
                <th class="w25">{{$t('Dict.AuxiliaryUnitQty')}}</th>
                <th class="w25">{{$t('Dict.AuxiliaryUnitName')}}</th>
              </tr>
              <tr v-for="(item, index) in reportData.DS8" :key="index">
                <td class="w50">{{item.name}}<template v-if="item.sizeName">({{item.sizeName}})</template></td>
                <td class="w25">{{item.auxiliaryUnitQty | keepTwo}}</td>
                <td class="w25">{{item.auxiliaryUnitName}}</td>
              </tr>
              <tr v-if="reportData.DS7 && reportData.DS7[0]">
                <th class="w50">{{$t('Dict.Total')}}</th>
                <th class="w25">{{reportData.DS7[0].auxiliaryUnitSumQty | keepTwo}}</th>
              </tr>
            </table>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="card" v-show="checkList.indexOf('1') >= 0">
            <div class="card-title">{{$t('Dict.BigClassCount')}}</div>
            <table>
              <tr class="row-head">
                <th class="w50">{{$t('Biz.UserDesktop.SearchPrint.RBusinessQFBZTd8')}}</th>
                <th class="w25">{{$t('Dict.SalesVolumes')}}</th>
                <th class="w25">{{$t('Dict.RealPaidAmount')}}</th>
              </tr>
              <tr v-for="item in reportData.DS2">
                <td class="w50">{{item.name}}<template v-if="item.sizeName">({{item.sizeName}})</template></td>
                <td class="w25">{{item.count | keepTwo}}</td>
                <td class="w25">{{item.lastTotal | keepTwo}}</td>
              </tr>
              <tr v-if="reportData.DS7 && reportData.DS7[0]">
                <th class="w50">{{$t('Dict.Total')}}</th>
                <th class="w25">{{reportData.DS7[0].sumQty | keepTwo}}</th>
                <th class="w25">{{reportData.DS7[0].sumVal | keepTwo}}</th>
              </tr>
            </table>
          </div>
          <div class="card" v-show="checkList.indexOf('2') >= 0">
            <div class="card-title">{{$t('Dict.SmallClassCount')}}</div>
            <table>
              <tr class="row-head">
                <th class="w50">{{$t('Dict.SmallClassName')}}</th>
                <th class="w25">{{$t('Dict.SalesVolumes')}}</th>
                <th class="w25">{{$t('Dict.RealPaidAmount')}}</th>
              </tr>
              <tr v-for="item in reportData.DS3">
                <td class="w50">{{item.name}}<template v-if="item.sizeName">({{item.sizeName}})</template></td>
                <td class="w25">{{item.count | keepTwo}}</td>
                <td class="w25">{{item.lastTotal | keepTwo}}</td>
              </tr>
              <tr v-if="reportData.DS7 && reportData.DS7[0]">
                <th class="w50">{{$t('Dict.Total')}}</th>
                <th class="w25">{{reportData.DS7[0].sumQty | keepTwo}}</th>
                <th class="w25">{{reportData.DS7[0].sumVal | keepTwo}}</th>
              </tr>
            </table>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="card" v-show="checkList.indexOf('4') >= 0">
            <div class="card-title">{{$t('Dict.ItemPresentation')}}</div>
            <table>
              <tr class="row-head">
                <th class="w40">{{$t('Dict.ItemName')}}</th>
                <th class="w20">{{$t('Dict.PresentationNum')}}</th>
                <th class="w20">{{$t('Dict.GiveAmountLable')}}</th>
                <th class="w20">{{$t('Biz.BizComm.GiveDishReason01')}}</th>
              </tr>
              <tr v-for="item in reportData.DS5">
                <td class="w50">{{item.name}}<template v-if="item.sizeName">({{item.sizeName}})</template></td>
                <td class="w25">{{item.count | keepTwo}}</td>
                <td class="w25">{{item.lastTotal | keepTwo}}</td>
                <td class="w20">{{item.reasonName}}</td>
              </tr>
              <tr v-if="reportData.DS7 && reportData.DS7[0]">
                <th class="w50">{{$t('Dict.Total')}}</th>
                <th class="w25">{{reportData.DS7[0].presentSumQty | keepTwo}}</th>
                <th class="w25">{{reportData.DS7[0].presentSumVal | keepTwo}}</th>
              </tr>
            </table>
          </div>
          <div class="card" v-show="checkList.indexOf('5') >= 0">
            <div class="card-title">{{$t('Dict.ItemsChargeBack')}}</div>
            <table>
              <tr class="row-head">
                <th class="w40">{{$t('Dict.ItemName')}}</th>
                <th class="w20">{{$t('Dict.ChargebackNum')}}</th>
                <th class="w20">{{$t('Dict.ChargebackAmount')}}</th>
                <th class="w20">{{$t('Dict.BackReason')}}</th>
              </tr>
              <tr v-for="item in reportData.DS6">
                <td class="w50">{{item.name}}<template v-if="item.sizeName">({{item.sizeName}})</template></td>
                <td class="w25">{{item.count | keepTwo}}</td>
                <td class="w25">{{item.lastTotal | keepTwo}}</td>
                <td class="w20">{{item.reasonName}}</td>
              </tr>
              <tr v-if="reportData.DS7 && reportData.DS7[0]">
                <th class="w50">{{$t('Dict.Total')}}</th>
                <th class="w25">{{reportData.DS7[0].exitBillSumQty | keepTwo}}</th>
                <th class="w25">{{reportData.DS7[0].exitBillSumVal | keepTwo}}</th>
              </tr>
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
import ajax from '@/common/js/ajax';
import numberformat from '@/common/js/numberformat';

export default {
  data() {
    return {
      // 1大类 2小类 3统计 4赠送 5退单 6辅助数量统计
      checkList: ['1', '2', '3', '4', '5', '6'],
      offset: 100,
      reportData: {},
    };
  },
  mounted() {
    this.$von('searchForSale', (data) => {
      this.reportData = data;
    });
  },
  watch: {
    checkList: {
      handler(val) {
        this.$vemit('saleReportIsChecked', val);
      },
      deep: true,
    },
  },
  filters: {
    keepTwo(val) {
      if (!val) return '0.00';
      return numberformat(val);
    },
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

.check-list{
  padding: 18px 0 12px;
  .title,.list{
    display: inline-block;
  }
}

.chart-info{
  height: calc(100% - 100px);
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
    border-right:8px solid @white;
    border-left:8px solid @white;
  }
  td{
    line-height: 2.3;
  }
  .row-head{
    font-size: 12px;
    line-height: 2.6;
    color: #666;
    border-bottom: 1px solid #ccc;
    th{
      font-weight: normal;
    }
  }
  .w25{
    width: 25%;
  }
  .w50{
    width: 50%;
  }
  .w20{
    width: 20%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .w40{
    width: 40%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
