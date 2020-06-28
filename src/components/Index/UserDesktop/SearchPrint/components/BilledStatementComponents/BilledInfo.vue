<template>
  <div class="all-wrap" ref="scrollContent">
    <div class="billed-info-wrap">
      <div class="billed-info">
        <div class="billed-info-item">
          <div class="card">
            <div class="card-title">{{$t('Dict.Receivable')}}</div>
            <table>
              <tr>
                <td class="table-title">{{$t('Dict.ItemConsume')}}</td>
                <td class="table-content">{{tsData.origMoney | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Dict.Btn.ServiceCharge')}}</td>
                <td class="table-content">{{tsData.serviceFee | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Dict.MinMakeUp')}}</td>
                <td class="table-content">{{tsData.minFee | keepTwo}}</td>
              </tr>
              <tr>
                <th class="table-title">{{$t('Dict.Total')}}</th>
                <th class="table-content">{{tsData.origTotal | keepTwo}}</th>
              </tr>
            </table>
          </div>
          <div class="card">
            <div class="card-title">{{$t('Dict.Offer')}}</div>
            <table>
              <tr>
                <td class="table-title w25">{{$t('Biz.BizComm.Offer04')}}</td>
                <td class="table-content w25">{{tsData.discMoney | keepTwo}}</td>
                <td class="table-title w25">{{$t('Biz.BizComm.Offer05')}}</td>
                <td class="table-content w25">{{tsData.discFixMoney | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title w25">{{$t('Biz.BizComm.Offer02')}}</td>
                <td class="table-content w25">{{tsData.promoteMoney | keepTwo}}</td>
                <td class="table-title w25">{{$t('Biz.UserDesktop.SearchPrint.BilledInfoTd7')}}</td>
                <td class="table-content w25">{{tsData.memberMoney | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title w25">{{$t('Biz.UserDesktop.SearchPrint.BilledInfoTd8')}}</td>
                <td class="table-content w25">{{tsData.presentMoney | keepTwo}}</td>
                <td class="table-title w25">{{$t('Biz.UserDesktop.SearchPrint.BilledInfoTd9')}}</td>
                <td class="table-content w25">{{tsData.wipeMoney | keepTwo}}</td>
              </tr>
              <tr>
                <th class="table-title">{{$t('Dict.Total')}}</th>
                <th colspan="3" class="table-content">{{tsData.discTotal | keepTwo}}</th>
              </tr>
            </table>
          </div>
          <div class="card">
            <div class="card-title">{{$t('Dict.Other')}}</div>
            <table>
              <tr>
                <td class="table-title">{{$t('Biz.Order.ChargePos')}}</td>
                <td class="table-content w75">{{tsData.posName || ""}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.Order.ChargeTime')}}</td>
                <td class="table-content w75">{{tsData.shiftName || ""}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.Order.ChargeOper')}}</td>
                <td class="table-content w75">{{tsData.modifierName || ""}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Dict.SettlementNote')}}</td>
                <td class="table-content w75">{{tsData.tsRemark || ""}}</td>
              </tr>
              <tr v-if="!isShowelecInvoice">
                <td class="table-title">{{$t('Biz.Settlement.MachineInvoice')}}</td>
                <td class="table-content w75">{{invoiceMoney}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.Settlement.HandInvoice')}}</td>
                <td class="table-content w75">{{tearingInvoiceMoney}}</td>
              </tr>
              <!--181需求新增电子发票，发票号码和发票代码-->
              <tr v-if="isShowelecInvoice">
                <td class="table-title">{{$t('Biz.Settlement.ElectronicInvoice')}}</td>
                <td class="table-content w75">{{ tsData.elecInvoiceMoney || '0.00' }}</td>
              </tr>
              <tr v-if="isShowelecInvoice">
                <td class="table-title">{{$t('Biz.UserDesktop.SearchPrint.BilledInfoTd17')}}</td>
                <td class="table-content w75 space-around">
                  <span>{{ tsData.invoiceNo }}</span>
                  <span>{{$t('Biz.UserDesktop.SearchPrint.BilledInfoSpan1')}}<strong>{{ tsData.invoiceCode }}</strong></span>
                </td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.UserDesktop.SearchPrint.BilledInfoTd18')}}</td>
                <td class="table-content w75" v-html="discountInfoStr"></td>
              </tr>
            </table>
          </div>
        </div>
        <div class="billed-info-item">
          <div class="card">
            <div class="card-title">{{$t('Dict.NetReceipts')}}</div>
            <table>
              <tbody class="margin-bottom-8" v-for="(item, index) in billData.payWayInfo" :key="index">
                <tr>
                  <td class="table-title">{{item.payWayName }}</td>
                  <td class="table-content">{{item.payMoney | keepTwo}}</td>
                </tr>
                <!--备注信息-->
                <tr v-if="item.paywayRemark">
                  <td colspan="2" class="table-title remark">{{$t('Dict.Notes01')}}{{item.paywayRemark}}</td>
                </tr>
              </tbody>
              <tr>
                <th class="table-title">{{$t('Dict.Total')}}</th>
                <th class="table-content" data-autotest="billedInfoLastTotal">{{tsData.lastTotal | keepTwo}}</th>
              </tr>
            </table>
          </div>
          <div class="card" v-if="billData.allTicketMessage">
            <div class="card-title">{{$t('Biz.Order.MemberCardDetail')}}</div>
            <table>
              <tr v-for="(value, name) in billData.allTicketMessage" :key="name">
                <td class="table-title w50">{{name}}</td>
                <td class="table-content w25">{{value.ticketCount}}{{$t('Dict.Leaf')}}</td>
                <td class="table-content w25">{{value.ticketMoney | keepTwo}}</td>
              </tr>
              <tr>
                <th class="table-title">{{$t('Dict.Total')}}</th>
                <th colspan="2" class="table-content">{{allTicketMoney | keepTwo}}</th>
              </tr>
            </table>
          </div>
          <!--<div class="card" v-if="billData.crmSettleData">-->
          <div class="card" v-if="billData.groupLightSettleData && billData.groupLightSettleData.length > 0">
            <div class="card-title">{{$t('Biz.Order.CardChargeCred')}}</div>
            <table v-for="(item, index) in billData.groupLightSettleData" :key="index">
              <tr>
                <td class="table-title">{{$t('Dict.CardNumber')}}</td>
                <td class="table-content">{{item.cardno}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Dict.CardType2')}}</td>
                <td class="table-content">{{item.cardkindtype}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.Order.MemberName')}}</td>
                <td class="table-content">{{item.memberName}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.Order.MemberPhone')}}</td>
                <td class="table-content">{{item.mobile}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.Order.ChargeStoreMoney')}}</td>
                <td class="table-content">{{item.consumeUseMoney | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.Order.ChargeSendMoney')}}</td>
                <td class="table-content">{{item.consumePeruseMoney | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.Order.ChargeCouponTotal')}}</td>
                <td class="table-content">{{item.consumeTicketMoney}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.Order.DelScore')}}</td>
                <td class="table-content">{{item.consumeScore}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.Order.AddScore')}}</td>
                <td class="table-content">{{item.addScore}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Dict.CardLeaveMoney')}}</td>
                <td class="table-content">{{item.balanceMoney | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Dict.RemainingPoints')}}</td>
                <td class="table-content">{{item.balanceScore}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.Order.LeftCoupon')}}</td>
                <td class="table-content">{{item.balanceTicketMoney}}</td>
              </tr>
              <tr>
                <td class="line" colspan="2">-------------------------------------------------------</td>
              </tr>
            </table>
          </div>
          <div class="card" v-else-if="billData.crmSettleData">
            <div class="card-title">{{$t('Biz.Order.CardChargeCred')}}</div>
            <table>
              <tr>
                <td class="table-title">{{$t('Dict.CardNumber')}}</td>
                <td class="table-content">{{billData.crmSettleData.cardno}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Dict.CardType2')}}</td>
                <td class="table-content">{{billData.crmSettleData.cardkindtype}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.Order.MemberName')}}</td>
                <td class="table-content">{{billData.crmSettleData.memberName}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.Order.MemberPhone')}}</td>
                <td class="table-content">{{billData.crmSettleData.mobile}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.Order.ChargeStoreMoney')}}</td>
                <td class="table-content">{{billData.crmSettleData.consumeUseMoney | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.Order.ChargeSendMoney')}}</td>
                <td class="table-content">{{billData.crmSettleData.consumePeruseMoney | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.Order.ChargeCouponTotal')}}</td>
                <td class="table-content">{{billData.crmSettleData.consumeTicketMoney}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.Order.DelScore')}}</td>
                <td class="table-content">{{billData.crmSettleData.consumeScore}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.Order.AddScore')}}</td>
                <td class="table-content">{{billData.crmSettleData.addScore}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Dict.CardLeaveMoney')}}</td>
                <td class="table-content">{{billData.crmSettleData.balanceMoney | keepTwo}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Dict.RemainingPoints')}}</td>
                <td class="table-content">{{billData.crmSettleData.balanceScore}}</td>
              </tr>
              <tr>
                <td class="table-title">{{$t('Biz.Order.LeftCoupon')}}</td>
                <td class="table-content">{{billData.crmSettleData.balanceTicketMoney}}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
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
      scrollTop: 0,
      offset: 100,
    };
  },
  props: {
    billData: {
      type: Object,
    },
    tsData: {
      type: Object,
    },
  },
  filters: {
    keepTwo(val) {
      if (!val) return '0.00';
      return numberformat(val);
    },
  },
  computed: {
    // 机打发票
    invoiceMoney() {
      const { isGiveInvoice } = this.tsData;
      if (isGiveInvoice == '-1') {
        return this.tsData.invoiceMoney;
      } if (isGiveInvoice == '0') {
        return '0.00';
      }
      return this.tsData.invoiceMoney || '0.00';
    },
    // 手撕发票
    tearingInvoiceMoney() {
      const { isGiveInvoice } = this.tsData;
      if (isGiveInvoice == '-1') {
        return this.tsData.tearingInvoiceMoney;
      }
      return '0.00';
    },
    // 电子发票
    isShowelecInvoice() {
      if (!(`${this.tsData.isGiveInvoice}` === '-1' || `${this.tsData.isGiveInvoice}` === '0')) {
        return true;
      }
      return false;
    },
    // 优惠信息
    discountInfoStr() {
      let discountStr = '';
      let discMoney = 0;
      const { discountInfo } = this.billData;
      if (discountInfo && discountInfo.length > 0) {
        for (let i = 0; i < discountInfo.length; i++) {
          discMoney += discountInfo[i].discMoney;
          if (discountInfo[i].dpName) {
            discountStr += `【${discountInfo[i].dpName}】<br>`;
          }
        }
        discountStr = discountStr.substring(0, discountStr.length - 4);
      }
      return discountStr;
    },
    // 会员卡总计金额
    allTicketMoney() {
      if (!this.billData.allTicketMessage) return '0.00';
      return Object.values(this.billData.allTicketMessage).reduce((total, item) => total + item.ticketMoney, 0);
    },
  },
  methods: {
    upPage() {
      if (this.scrollTop < this.offset) return;
      this.scrollTop -= this.offset;
      this.$refs.scrollContent.scrollTop = this.scrollTop;
    },
    downPage() {
      if ((this.scrollTop + this.$refs.scrollContent.clientHeight) > this.$refs.scrollContent.scrollHeight) return;
      this.scrollTop += this.offset;
      this.$refs.scrollContent.scrollTop = this.scrollTop;
    },
  },
};
</script>
<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .all-wrap {
    overflow: auto;
    height: 90%;
    .billed-info-wrap {
      .billed-info {
        display: flex;
        .billed-info-item {
          flex: 1;
        }
      }
    }
  }
  .card{
    font-size: 12px;
    .card-title{
      background-color: @brand-primary;
      color: @white;
      line-height: 2;
      padding-left: 8px;
    }
    table{
      width: 100%;
      margin-top: 4px;
      table-layout:fixed;
    }
    td{
      line-height: 2.3;
    }
    .table-title{
      text-align: left;
      padding-left: 8px;
    }
    .table-content{
      word-break: break-all;
      text-align: right;
      padding-right: 8px;
    }
    .remark{
      padding-right: 50px;
      padding-bottom: 8px;
      line-height: 1.2;
      color: #0babb9;
    };
    .w25{
      width: 25%;
    }
    .w50{
      width: 50%;
    }
    .w75{
      width: 75%;
    }
    .space-around {
      display: flex;
      justify-content: space-around;
      width: 100%;
      padding-right: 8px;
      > span:first-child {
        margin-left: -8px;
      }
      > span:last-child {
        flex: 1;
      }
      strong {
        margin-left: 8px;
        font-weight: normal;
      }
    }
  }
  .card+.card{
    margin-top: 10px;
  }
  // 箭头按钮
  .pos-takeout-pager {
    position: absolute;
    right: 12px;
    // bottom: 12px;
    bottom: 5px;
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
