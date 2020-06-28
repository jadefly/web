<template>
  <div class="menuList w30">
    <div
      class="listA"
      v-if="getfastControlMode() ? false : (tableMsg.length > 0 ? true : false)"
      ref="listA">
      <ul class="msgTitle df">
        <li class="w60">{{$t('Dict.Seat')}}</li>|
        <li class="w15">{{$t('Dict.NumberOfPeople')}}</li>|
        <li class="w25">{{$t('Dict.Waiter')}}</li>
      </ul>
      <div class="pay-roomMsg-pagerBox">
        <div class="pay-roomMsg-pager" ref="payRoomMsgPager">
          <ul id="roomMsgPagerId" class="pay-roomMsg-pager-ul">
            <li v-for="(item, key) in tableMsg" class="df" :key="key">
              <div class="w60 pl10">{{ item.pointName }}</div>
              <div class="w15 pl5">{{ item.peopleQty }}</div>
              <div class="w25 pl5">{{ item.waiterName ? item.waiterName : ""}}</div>
            </li>
          </ul>
        </div>
        <div class="df fw">
          <div class="w60 pl10" v-show="tableMsg.length">{{$t('Dict.Total')}}[{{tableMsg.length}}]</div>
          <div class="w39 pl5">{{ pointPeopleNums }}</div>
        </div>
      </div>
      <div class="tr">
        <span class="listNum" v-show="tableMsg.length">
          {{$t('Dict.PageStyle.Sim3', [tableMsg.length])}}
        </span>
        <Pager
          pagerId="roomMsgPagerId"
          itemTag="li"
          :showInfo = "true"
          arrowDirection="up-down"
          ref="roomMsgPagerId"></Pager>
      </div>
    </div>
    <div class="listB" ref="listBRef">
      <div class="listB-header">
        <ul class="msgTitle df">
          <li class="w40">{{$t('Dict.Dishes')}}</li>|
          <li class="w14">{{$t('Dict.Amount')}}</li>|
          <li class="w21">{{$t('Dict.UnitPrice')}}</li>|
          <li class="w25">{{$t('Dict.Subtotal')}}</li>
        </ul>
      </div>
      <div class="msgList" ref="msgList">
        <div class="msgListUlBox">
          <ul id="msgListUlId" class="msgList-ul" ref="msgListUlId">
            <li  v-for="( objitem , objindex) in itemsList" :key="objindex">
              <div class="df fw">
                <div
                  class="pl5"
                  style="width: 75%">{{objindex }}[{{ itemsList[objindex].length }}]</div>
                <div>{{ itemClassSum(itemsList[objindex])}}</div>
              </div>
              <div v-for="(val, key) in objitem" class="df" :key="key">
                <div class="nopkgFlgItem" v-if="!val.pkgDetail">
                    <div class="w40 pl5 msgDishName"
                      >{{
                        val.mergeScId
                          ? $t('Biz.Order.SpellFoodTag')
                          : ''
                      }}{{
                        val.itemSizeName==""
                          ? ""
                          :"(" + val.itemSizeName +")"
                      }}{{val.itemName}}</div>
                    <div class="w14">{{val.qty}}</div>
                    <div class="w21">{{val.price}}</div>
                    <div class="w25">{{val.lastSubTotal}}</div>
                 </div>
                 <!-- 代表该品项为为套餐内明细 -->
                 <div class="pkgFlgItem" v-else>
                  <div class="setMealName">
                    <div class="w40 pl5 msgDishName">{{
                      (!val.itemSizeName || val.itemSizeName=="")
                        ? ""
                        : "(" + val.itemSizeName +")"
                      }}{{val.itemName}}</div>
                    <div class="w14">{{val.qty}}</div>
                    <div class="w21">{{val.price}}</div>
                    <div class="w25">{{val.lastSubTotal}}</div>
                  </div>
                  <div
                    class="setMealName"
                    :key="itemsindex"
                    v-for="(items , itemsindex) in val.pkgDetail">
                    <div class="w40 pl5 msgDishName setmealitem"><i class="icon icon-dian1"></i>{{
                      (!items.itemSizeName || items.itemSizeName=="" )
                        ? ""
                        : "(" + items.itemSizeName +")"
                      }}{{ items.itemName }}</div>
                   <div class="w17">{{items.qty}}</div>
                 </div>
                 </div>
              </div>
            </li>
          </ul>
        </div>
        <div class="fw msgNum">
          <div class="pl10" style="width: 81%" v-show="itemsum">{{$t('Dict.Total')}}[{{itemsum}}]</div>
          <div v-show="itemsum">{{ totalmoney }}</div>
        </div>
      </div>
      <div class="tr pay-listB-pager">
        <span class="listNum">{{$t('Dict.Altogether')}}{{itemsum}}{{$t('Dict.Strip')}}</span>
        <PayPager2
            pagerId="msgListUlId"
            :showInfo = "true"
            arrowDirection="up-down"
            :amountPage="amountPage"
            @nextPager="nextPager"
            @prevPager="prevPager"
            ref="guestSeatMsg"
            :firstPager="firstPager"
        >
        </PayPager2>
      </div>
    </div>
    <div class="listC bcE4">
      <ul class="df pay-price-up bcf mt5">
        <li
          :style="zoomFont(billMap.origSubTotal)"
          class="min-w49">{{$t('Biz.Settlement.OrigSubTotal')}}{{ billMap.origSubTotal }}</li>
        <li
          :style="zoomFont(billMap.origSubTotal)"
          class="min-w51">{{$t('Biz.Settlement.MemberSubTotal')}}{{ billMap.memberSubTotal}}</li>
        <li
          :style="zoomFont(billMap.origSubTotal)"
          class="min-w49">{{$t('Biz.Settlement.CanDiscounSubtotal')}}{{ billMap.canDiscounSubtotal}}</li>
        <li
          :style="zoomFont(billMap.origSubTotal)"
          class="min-w51">{{$t('Biz.Settlement.UnCanDiscounSubtotal')}}{{ billMap.unCanDiscounSubtotal}}</li>
        <li
          :style="zoomFont(billMap.origSubTotal)"
          v-for="(tax,index) in billMap.taxList" :key="index"
          class="min-w50">
            <div class="taxName">{{tax.taxName}}</div>：{{ tax.tax}}</li>
      </ul>
      <ul class="df pay-price-down bcf">
        <!-- 中餐和快餐统一使用buffetDataForSettle传入的数据 -->
        <li class="feePrice weightFont"
          v-if="isOpenBuffetDeposit">{{ $t('Biz.Crm.CrmDeposit') }}{{
            buffetDataForSettle.buffetDeposit || 0}}</li>
        <li class="feePrice"
          >{{$t('Biz.Order.ServicePrice')}}{{ nowServiceMoney }}</li>
        <li class="minPrice"
          v-if="this.posInfo.controlMode != 3 && !isOpenBuffetDeposit">
          <span>{{$t('Dict.Btn.MinimumConsumption')}}:</span>
          <span>{{ minConsumptionMoney }}</span>
          <span v-if="leastbuy.disc_type == 1">({{ $t('Biz.Settlement.Free') }})</span>
          <span v-if="leastbuy.disc_type != 1">{{
            minConsumptionRemark === ''
              ? ' '
              : `(${$t('Biz.Settlement.Makeup')}${minConsumptionRemark})`}}</span>
        </li>
        <li class="min-w50 remarks">{{$t('Dict.SettlementNote01')}}{{settlementRemarkInfo}}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import $ from 'jquery';
import {
  groupBy, forEach, sortBy, cloneDeep,
} from 'lodash';
import Pager from '@/components/Pos/Common/Pager';
import PayPager2 from '@/components/Pos/Order/Bill/Pay/PayPager2';
import { mapGetters } from 'vuex';

export default {
  components: { Pager, PayPager2 },
  constructor(wrap, item, options) {
    this.wrap = $(wrap);
    this.item = item;
    const defaults = {
      scrollMode: 'data',
      direction: 'vertical',
      fullView: true,
      animate: 0,
    };
    this.options = $.extend(defaults, options);
    this.itemHeight = 0;
    this.itemWidth = 0;
    this.colSize = 0;
    this.pageSize = 0;
    this.rowNum = 0;
    this.totalPage = 0;
    this.currentPage = 1;
    this.wrapHeight = 0;
    this.init();
  },
  props: [
    'getSettlement',
    'settlementRemarkInfo',
    'currentServiceMoney',
    'payMinimumConsumption',
    'isOpenBuffetDeposit',
    'buffetDataForSettle',
  ],
  data() {
    return {
      itemsum: 0, // 菜品总数量
      totalmoney: 0, // 总金额小计
      amountPage: 1, // PayPager2 的总页数
      itemsList: {}, // 结算账单品项
      billMap: {}, // 账单信息数据
      tableMsg: [], // 客位列表数据
      pointPeopleNums: null,
      minConsumptionMoney: '0', // 最低消费钱数
      minConsumptionRemark: '',
      nowServiceMoney: '', // 服务费
      leastbuy: {}, // 最低消费
      firstPager: 1,
    };
  },
  watch: {
    getSettlement: {
      handler(val) {
        // 根据大类code进行排序
        // 由于后面需要修改pointBillList,所以需要深度克隆对象
        const pointBillList = cloneDeep(sortBy(val.pointBillList, item => item.bigClassCode));
        // 根据大类名称进行分组
        // bigClassName
        const results = groupBy(pointBillList, 'bigClassName');
        this.itemsList = results;
        // 如果是套餐需要对套餐里包含的品项根据itemCode进行排序
        // this.itemsList = this.sortDetail(results)
        let num = 0;
        for (const key in this.itemsList) {
          num += this.itemsList[key].length;
        }
        this.itemsum = num;
        let smoney = 0;
        for (let i = 0; i < val.pointBillList.length; i += 1) {
          smoney += Number(val.pointBillList[i].lastSubTotal) * 1000000 / 1000000;
        }
        // 品项销售价格不包含税金 0: 否(默认) 1: 是
        if (val.billMap.isItemSalesPriceExcludingTax == 0) {
          smoney -= val.billMap.bsTaxSum;
        }
        if (Number.isInteger(smoney)) { // 如果是整数不显示.00
          this.totalmoney = smoney;
        } else {
          this.totalmoney = smoney.toFixed(2);
        }
        // 初始化服务费信息
        if (val.billMap.servicefee) {
          if (+val.billMap.servicefee.disc_type === 1) {
            this.nowServiceMoney = `0(${this.$t('Biz.Settlement.Free')})`;
          } else {
            this.nowServiceMoney = `${val.billMap.servicefee.orig_fee}`;
          }
        } else {
          this.nowServiceMoney = `${0}`;
        }
        // 初始化最低消费信息
        if (val.billMap.leastbuy) {
          this.leastbuy = val.billMap.leastbuy;
          this.minConsumptionRemark = val.billMap.leastbuy.orig_fee;
          this.minConsumptionMoney = `${val.billMap.leastbuy.minimum_charge}`;
        } else {
          this.minConsumptionMoney = '0';
          this.minConsumptionRemark = 0;
        }
        // 服务费税数据调整
        if (val.billMap.taxList) {
          const serverTax = val.billMap.taxList.find(item => item.taxType === 1);
          let isCombine = false;
          if (serverTax) {
            val.billMap.taxList.forEach((item) => {
              if (item.taxType === 1) {
                item.taxName = '服务费税';
              }
              if (item.archTaxId === serverTax.archTaxId && item.taxType !== 1) {
                item.tax = (item.tax + serverTax.tax).toFixed(2);
                isCombine = true;
              }
            });
            if (isCombine) { // 如果服务费税合并到其他税里，则taxList中去掉服务费税这一项
              val.billMap.taxList = val.billMap.taxList.filter(item => item.taxType !== 1);
            }
          }
        }
        this.billMap = val.billMap;
        this.tableMsg = val.pointList;
      },
      deep: true,
    },
    tableMsg() {
      if (`${this.posInfo.controlMode}` !== '3') {
        let pointPeopleNum = 0;
        forEach(this.tableMsg, (item) => {
          pointPeopleNum += Number(item.peopleQty);
        });
        this.pointPeopleNums = pointPeopleNum;
        const ListALen = this.tableMsg.length;
        setTimeout(() => {
          if (this.$refs.payRoomMsgPager) {
            if (ListALen > 0 && ListALen < 4) {
              this.$refs.payRoomMsgPager.style.height = `${ListALen * 20}px`;
            } else if (ListALen >= 4) {
              this.$refs.payRoomMsgPager.style.height = '60px';
            }
            this.$refs.roomMsgPagerId.refresh();
          }
        }, 100);
      }
    },
    // 改变当前服务费
    currentServiceMoney: {
      handler(val) {
        this.nowServiceMoney = val;
      },
      deep: true,
    },
    payMinimumConsumption: {
      handler(val) {
        // eslint-disable-next-line prefer-destructuring
        this.minConsumptionMoney = val[0]; // 最低消费钱数
        // eslint-disable-next-line prefer-destructuring
        this.minConsumptionRemark = val[1]; //  消费是否免除
      },
      deep: true,
    },
    // 翻页
    itemsList: {
      handler(val) {
        this.firstPager = 1;
        if (!val) {
          return;
        }
        this.$refs.msgListUlId.scrollTop = 0;
        let ulH = this.$refs.listBRef.offsetHeight - 80 - 20;// 求出父元素的高 - 合计的高25
        const controlMode = this.getfastControlMode();
        if (!controlMode && !$('.listA').height() && this.tableMsg && this.tableMsg.length) {
          ulH -= (90 + 20 * this.tableMsg.length);
        }
        const keys = [];
        let values = [];
        let ListBUlLen = 0;
        for (const key in val) {
          keys.push(key);
          const items = val[key];
          values = values.concat();// 取得value
          ListBUlLen += val[key].length;
          for (let i = 0, len = items.length; i < len; i++) {
            if (items[i].pkgDetail) {
              ListBUlLen += items[i].pkgDetail.length;
            }
          }
        }
        ListBUlLen += keys.length;
        this.amountPage = Math.ceil(ListBUlLen * 20 / ulH);// 求得页数
        // eslint-disable-next-line no-unused-expressions
        if (this.amountPage <= 0) {
          this.amountPage = 1;
        }
        if (ulH < ListBUlLen * 20) { // 如果超出了父元素的高
          const ulH2 = Math.floor(ulH / 20) * 20; // 防止出现半截字
          this.$refs.msgListUlId.style.height = `${ulH2}px`;
          // this.$refs.msgListUlId.style.height = `calc(${ulH2}px - 3rem)`;
        } else {
          this.$refs.msgListUlId.style.height = `${ListBUlLen * 20}px`;
        }
      },
      deep: true,
    },

  },
  methods: {
    // 超大结算金额显示错位，执行字体缩小
    zoomFont(price) {
      if (price && (`${price}`).length >= 9) {
        return 'font-size: 12px';
      }
      return true;
    },
    itemClassSum(val) {
      let num = 0;
      for (let i = 0; i < val.length; i += 1) {
        num += Number(val[i].lastSubTotal);
      }
      // 如果是整数不显示.00
      return Number.isInteger(num) ? num : num.toFixed(2);
    },
    nextPager() {
      this.pagerFun('next');
    },
    prevPager() {
      this.pagerFun('prev');
    },
    pagerFun(type) {
      let ulH = this.$refs.listBRef.offsetHeight - 80 - 20;// 求出父元素-合计的高
      const controlMode = this.getfastControlMode();// 快餐
      if (!controlMode && !$('.listA').height() && this.tableMsg && this.tableMsg.length) {
        ulH -= (96 + 20 * this.tableMsg.length);
      }
      const ulH2 = Math.floor(ulH / 20) * 20; // 防止出现半截字
      if (type === 'next') {
        this.$refs.msgListUlId.scrollTop += ulH2;
      } else {
        this.$refs.msgListUlId.scrollTop -= ulH2;
      }
    },
    getfastControlMode() {
      return +this.posInfo.controlMode === 3;
    },
    // 清空 本组件相关数据
    cleanData() {
      this.itemsList = {};
      this.tableMsg = [];
      this.itemsum = 0;
      this.billMap = {};
      this.minConsumptionMoney = '0';
      this.minConsumptionRemark = '';
      this.nowServiceMoney = '';
      this.leastbuy = {};
    },
  },
  mounted() {
    this.firstPager = 1;
  },
  computed: {
    ...mapGetters(['posInfo']),
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.w39 {
  width: 39%;
}
.mt170 {
  margin-top: 170px;
}
.mt0 {
  margin-top: 0;
}
div.pos-pager {
  display: inline-block;
}
.cursorPointer {
  cursor: pointer;
}
.listNum {
  font-size: 12px;
  color: #9d9d9d;
}
.pay-roomMsg-pager {
  overflow: hidden;
}
.pay-roomMsg-pager-ul {
  height: 100% !important;
  overflow: hidden;
  li{
    height: 20px;
  }
}
.tc {
  text-align: center;
}
.tr {
  text-align: right;
}
.f20 {
  font-size: 20px;
}
.f24 {
  font-size: 24px;
}
.fcb {
  color: #63b3e8;
}
.fcg {
  color: #6acb48;
}
.fcr {
  color: #fe0000;
}
.df {
  display: flex;
}
.p5 {
  padding: 5px;
}
.p12 {
  padding: 12px;
}
.w15 {
  width: 15%;
}
.w19 {
  width: 19%;
}
.w40 {
  width: 40%;
}
.w21 {
  width: 21%;
}
.w14 {
  width: 14%;
}
.bcF5 {
  background-color: #f5f5f5;
}
.bcf {
  background-color: #fff;
}
.bcE4 {
  background-color: #e4e4e4;
}
.bcb {
  background: #63b3e8;
}
.bcg {
  background: #6acb48;
}
.w17 {
  width: 17%;
}
.w20 {
  width: 20%;
}
.w25 {
  width: 25%;
}
.w50 {
  width: 50%;
}
.min-w50 {
  width: 50%;
  height: 24px;
}
.min-w49 {
  width: 49%;
  height: 24px;
}
.min-w51 {
  width: 51%;
  height: 24px;
}

.w60 {
  width: 60%;
}
.w45 {
  width: 45%;
}
.pl5 {
  padding-left: 5px;
}
.pt5 {
  padding-top: 5px;
}
.pl10 {
  padding-left: 10px;
}
.mt5 {
  margin-top: 5px;
}
.mr20 {
  margin-right: 20px;
}
.fw {
  font-weight: bold;
}
.msgList-ul{
  max-height: 100%;
  overflow: hidden;
}
.menuList {
  background: #e4e4e4;
  height: 100%;
  width: 305px;
  display: flex;
  flex-direction: column;
  flex: none;
  // position: relative;
  .msgListUlBox{
    overflow: hidden;
  }
}
.msgTitle {
  background: #6f7b7f;
  color: #fff;
  padding: 0 5px;
}
.msgTitle li {
  padding-left: 5px;
}
.nopkgFlgItem{
  display: flex;
  width: 100%;
}
.pkgFlgItem{
  display: flex;
  width: 100%;
  flex-direction: column
}
.setMealName {
  display: flex;
  width: 100%;
  height: 20px;
}
.msgDishName {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.setmealitem {
  color: #678;
  font-size: 12px;
}


.borR {
  border-right: 1px solid #e4e4e4;
}
.noMarginR {
  margin-right: 0 !important;
}
.listA,
.listB,
.listC {
  padding: 12px;
  background: #fff;
}
.listA {
  width: 305px;
  flex: 1;
  padding-bottom: 0;
  // position: absolute;
}
.listB {
  flex: 2;
  position: relative;
  padding-top: 35px;
  padding-bottom: 45px;

  &-header {
    position: absolute;
    left: 0;
    top: 6px;
    width: 100%;
    height: 24px;
    padding-left: 12px;
    padding-right: 12px;
  }

  .msgList {
    position: relative;
    // padding-top: 5px;
    // padding-bottom: 5px;
    // .square(100%);
  }
  .msgNum{
    display: flex;
  }
  .pay-listB-pager {
    position: absolute;
    bottom: 8px;
    right: 11px;

  }
}
.listC {
  margin-top: 10px;
  flex: 1;
  width: 305px;
  /*height: 128px;*/
  padding-top: 8px;
}
.pay-price-up {
  flex-wrap: wrap;
  border-bottom: 1px solid #b5b5b5;
  padding-bottom: 5px;
  margin-bottom: 5px;
}
.pay-price-down {
  flex-wrap: wrap;
  .remarks{
    width: 100% !important;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .feePrice{
    width: 40%;
  }
  .weightFont {
    font-weight: bold;
  }
  .minPrice{
    width: 60%;
  }
}
.taxName{
  max-width:75px;
  white-space:nowrap;
  text-overflow:ellipsis;
  overflow:hidden;
  word-break:keep-all;
  float: left
}
</style>

<style xml:lang="en">
  .listC {
    font-size: 12px;
  }
  .msgTitle{
    font-size: 12px;
  }
</style>
