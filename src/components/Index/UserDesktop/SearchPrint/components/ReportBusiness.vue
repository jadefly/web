<template>
  <div class="content">
    <div class="chart-info" ref="scrollContent">
      <el-row :gutter="14">
        <el-col :span="8">
          <div class="card" v-if="reportData.DS2 && reportData.DS2.length>0">
            <div class="card-title">{{$t('Dict.BusinessData')}}</div>
            <table>
              <tr>
                <td class="table-title">{{$t('Dict.Turnover')}}</td>
                <td class="table-content">{{reportData.DS2[0].orig | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Dict.ItemConsume')}}</td>
                <td class="table-content">{{reportData.DS2[0].itemOrig | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Dict.Btn.ServiceCharge')}}</td>
                <td class="table-content">{{reportData.DS2[0].origServerFee | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.UserDesktop.SearchPrint.RBusinessTd4')}}</td>
                <td class="table-content">{{reportData.DS2[0].origZdxfbq | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Dict.PreferentialAmount')}}</td>
                <td class="table-content">{{reportData.DS2[0].discTotal | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.BizComm.Offer01')}}</td>
                <td class="table-content">{{reportData.DS2[0].member | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.BizComm.Offer02')}}</td>
                <td class="table-content">{{reportData.DS2[0].promote | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Dict.GiveAmountLable')}}</td>
                <td class="table-content">{{reportData.DS2[0].present | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.UserDesktop.SearchPrint.RBusinessTd9')}}</td>
                <td class="table-content">{{reportData.DS2[0].disc | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.BizComm.Offer05')}}</td>
                <td class="table-content">{{reportData.DS2[0].rptBsDisc | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.UserDesktop.SearchPrint.BilledInfoTd9')}}</td>
                <td class="table-content">{{reportData.DS2[0].wipe | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Dict.BusinessIncome')}}</td>
                <td class="table-content">{{reportData.DS2[0].last | keepTwo}}</td>
              </tr>
            </table>
          </div>
          <div class="card" v-if="reportData.DS3 && reportData.DS3.length>0">
            <div class="card-title">{{$t('Biz.BizComm.NetIncome01')}}</div>
            <table>
              <tr v-for="(item, index) in reportData.DS3" :key="index">
                <td class="table-title">{{ item.payway }}</td>
                <td class="table-content">{{ item.money | keepTwo}}</td>
              </tr>
              <tr>
                <th class="table-title">{{$t('Dict.Total')}}</th>
                <th class="table-content">{{pureHarvestTotal(reportData.DS3) | keepTwo}}</th>
              </tr>
            </table>
          </div>
          <div class="card" v-if="reportData.DS4 && reportData.DS4.length>0">
            <div class="card-title">{{$t('Dict.NetIncome')}}</div>
            <table>
              <tr v-for="(item, index) in reportData.DS4" :key="index">
                <td class="table-title">{{item.payway}}</td>
                <td class="table-content">{{item.money | keepTwo}}</td>
              </tr>
              <tr>
                <th class="table-title">{{$t('Dict.Total')}}</th>
                <th class="table-content">{{pureHarvestTotal(reportData.DS4) | keepTwo}}</th>
              </tr>
            </table>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="card" v-if="reportData.DS7 && reportData.DS7.length>0">
            <div class="card-title">{{$t('Dict.BusinessKpi')}}</div>
            <table>
              <tr>
                <td class="table-title">{{$t('Dict.NumOfBills')}}</td>
                <td class="table-content">{{reportData.DS7[0].count | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Dict.NumOfUnits')}}</td>
                <td class="table-content">{{reportData.DS7[0].bsCount | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Dict.PassengerFlow')}}</td>
                <td class="table-content">{{reportData.DS7[0].people | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.UserDesktop.SearchPrint.RBusinessTd16')}}</td>
                <td class="table-content">{{reportData.DS7[0].avgBs | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.UserDesktop.SearchPrint.RBusinessTd17')}}</td>
                <td class="table-content">{{reportData.DS7[0].avgTable | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.UserDesktop.SearchPrint.RBusinessTd18')}}</td>
                <td class="table-content">{{reportData.DS7[0].avgPeople | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Dict.OpeningRate')}}</td>
                <td class="table-content">{{reportData.DS7[0].countRate | keepTwo}}%</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Dict.PlacingRate')}}</td>
                <td class="table-content">{{reportData.DS7[0].pointRate | keepTwo}}%</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.UserDesktop.SearchPrint.RBusinessTd21')}}</td>
                <td class="table-content">{{reportData.DS7[0].overRate | keepTwo}}%</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.UserDesktop.SearchPrint.RBusinessTd22')}}</td>
                <td class="table-content">{{reportData.DS7[0].avgDinnerTime | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.UserDesktop.SearchPrint.RBusinessTd23')}}</td>
                <td class="table-content">{{reportData.DS7[0].avgArea | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.UserDesktop.SearchPrint.RBusinessTd24')}}</td>
                <td class="table-content">{{reportData.DS7[0].avgEmp | keepTwo}}</td>
              </tr>
            </table>
          </div>
          <div class="card" v-if="reportData.DS8 && reportData.DS8.length>0">
            <div class="card-title">{{$t('Dict.Other')}}</div>
            <table>
              <tr>
                <td class="table-title">{{$t('Dict.ChargebackAmount')}}</td>
                <td class="table-content">{{reportData.DS8[0].cancel | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Dict.WasteAmount')}}</td>
                <td class="table-content">{{reportData.DS8[0].fdMoney | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.Pos.More.TBillDd15')}}</td>
                <td class="table-content">{{reportData.DS8[0].invoice | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Dict.CancelCount')}}</td>
                <td class="table-content">{{reportData.DS8[0].cancelTsCount | keepTwo}}</td>
              </tr>
            </table>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="card" v-if="reportData.DS5 && reportData.DS5.length>0">
            <div class="card-title">{{$t('Biz.BizComm.MembersDetail')}}</div>
            <table>
              <tr>
                <td class="table-title">{{$t('Biz.BizComm.MembersDetail01')}}</td>
                <td class="table-content">{{reportData.DS5[0].saleCardCount | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.BizComm.MembersDetail02')}}</td>
                <td class="table-content">{{reportData.DS5[0].weixinMembers | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.BizComm.MembersDetail03')}}</td>
                <td class="table-content">{{reportData.DS5[0].cardmembers | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.BizComm.MembersDetail04')}}</td>
                <td class="table-content">{{reportData.DS5[0].alipayMembers | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.BizComm.MembersDetail05')}}</td>
                <td class="table-content">{{reportData.DS5[0].mtMembers | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.BizComm.MembersDetail06')}}</td>
                <td class="table-content">{{reportData.DS5[0].eleMembers | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.BizComm.MembersDetail07')}}</td>
                <td class="table-content">{{reportData.DS5[0].baiduMembers | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.BizComm.MembersDetail08')}}</td>
                <td class="table-content">{{reportData.DS5[0].otherMembers | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.BizComm.MembersDetail09')}}</td>
                <td class="table-content">{{reportData.DS5[0].chargeCount | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.BizComm.MembersDetail10')}}</td>
                <td class="table-content">{{reportData.DS5[0].chargeMoney | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.BizComm.MembersDetail11')}}</td>
                <td class="table-content">{{reportData.DS5[0].realChargeMoney | keepTwo}}</td>
              </tr>
              <tr>
                <th class="table-title">{{$t('Biz.BizComm.MembersDetail12')}}</th>
                <th class="table-content">{{reportData.DS5[0].sumCrm | keepTwo}}</th>
              </tr>
            </table>
          </div>
          <div class="card" v-if="reportData.DS6 && reportData.DS6.length>0">
            <div class="card-title">{{$t('Biz.UserDesktop.SearchPrint.RBusinessDiv5')}}</div>
            <table>
              <tr v-for="(item, index) in reportData.DS6" :key="index">
                <td class="table-title">{{item.name}}</td>
                <td class="table-content">{{item.sumMoney | keepTwo}}</td>
              </tr>
              <tr>
                <th class="table-title">{{$t('Dict.Total')}}</th>
                <th class="table-content">{{pureHarvestTotal2(reportData.DS6) | keepTwo}}</th>
              </tr>
            </table>
          </div>
        </el-col>
        <!--188新增 暂未和后台对接-->
        <el-col :span="8">
          <div class="card" v-if="reportData.DS9 && reportData.DS9.length>0">
            <div class="card-title">{{ $t('Biz.Order.SalesType') }}</div>
            <table class="sale-type">
              <tr class="head">
                <td class="left">{{ $t('Dict.Type') }}</td>
                <td class="center">{{ $t('Dict.Amount') }}</td>
                <td class="center">{{ $t('Dict.NetReceipts') }}</td>
                <td class="right">{{ $t('Dict.NetReceipts02') }}</td>
              </tr>
              <tr v-for="(item, index) in reportData.DS9" :key="index">
                <td class="left">{{ item.saleTypeName }}</td>
                <td class="center">{{ item.saleTypeCount }}</td>
                <td class="center">{{ item.saleTypeLast }}</td>
                <td class="right">{{ item.saleTypePercentage }}</td>
              </tr>
              <tr>
                <th class="table-title">{{$t('Dict.Total')}}</th>
                <th class="table-content center">{{ reportData.DS7[0] ? reportData.DS7[0].count : 0 | keepTwo }}</th>
                <th class="table-content center">{{ reportData.DS2[0] ? reportData.DS2[0].last : 0 | keepTwo}}</th>
                <th>&nbsp;</th>
              </tr>
            </table>
          </div>
          <div class="card" v-if="reportData.DS6 && reportData.DS6.length>0">
            <div class="card-title">{{$t('Biz.UserDesktop.SearchPrint.RBusinessDiv5')}}</div>
            <table>
              <tr v-for="(item, index) in reportData.DS6" :key="index">
                <td class="table-title">{{item.name}}</td>
                <td class="table-content">{{item.sumMoney | keepTwo}}</td>
              </tr>
              <tr>
                <th class="table-title">{{$t('Dict.Total')}}</th>
                <th class="table-content">{{pureHarvestTotal2(reportData.DS6) | keepTwo}}</th>
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
import numberformat from '@/common/js/numberformat';

export default {
  data() {
    return {
      offset: 100,
      reportData: {},
    };
  },
  mounted() {
    this.$von('searchForBusiness', (data) => {
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
    pureHarvestTotal(DS4) {
      let total = 0;
      for (let i = 0; i < DS4.length; i++) {
        total += DS4[i].money;
      }
      return total;
    },
    pureHarvestTotal2(DS6) {
      let total = 0;
      for (let i = 0; i < DS6.length; i++) {
        total += DS6[i].sumMoney;
      }
      return total;
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
  .left {
    padding-left: 8px;
    text-align: left;
  }
  .right {
    padding-right: 8px;
    text-align: right;
  }
  .center {
    text-align: center;
  }
  .strong {
    font-weight: bold;
  }
  .sale-type {
    tr {
      width: 25%;
    }
    .head td {
      border-bottom: 1px solid #cccccc;
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
