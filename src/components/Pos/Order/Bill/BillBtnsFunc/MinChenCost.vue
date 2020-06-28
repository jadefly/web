<template>
  <div class="cost-table">
    <!-- <div class="table-head">
      <table>
        <tr>
          <th class="item-col">
            <div class="package-item">品项</div>
          </th>
          <th class="count-col">数量</th>
        </tr>
      </table>
    </div> -->
    <div class="table-body" ref="scrollContent">
      <div class="costInfo-content" v-if="lastPay.length > 0">
        <div class="costInfo">
          <!-- $t-流水号 -->
          <span class="costInfo-left">{{ $t('Biz.Order.SerialNum') }}:</span>
          <span class="costInfo-right">{{ costList.logSeq }}</span>
        </div>
        <div class="costInfo">
          <!-- $t-交易门店编号, -->
          <span class="costInfo-left">{{ $t('Biz.Order.TradeStoreNum') }}:</span>
          <span class="costInfo-right">{{ costList.shopName }}</span>
        </div>
        <div class="costInfo">
          <!-- $t-交易门店地址 -->
          <span class="costInfo-left">{{ $t('Biz.Order.TradeStoreAddr') }}:</span>
          <span class="costInfo-right">{{ costList.shopAddress }}</span>
        </div>
        <div class="costInfo">
          <!-- $t-交易金额 -->
          <span class="costInfo-left">{{ $t('Biz.Order.TradeAmount') }}:</span>
          <span class="costInfo-right">{{ costList.transAmt }}</span>
        </div>
        <div class="costInfo">
          <!-- $t-交易总金额 -->
          <span class="costInfo-left">{{ $t('Biz.Order.TradeTotalAmount') }}:</span>
          <span class="costInfo-right">{{ costList.totalAmt }}</span>
        </div>
        <div class="costInfo">
          <!-- $t-交易日期 -->
          <span class="costInfo-left">{{ $t('Biz.Order.TradeDate') }}:</span>
          <span class="costInfo-right">{{ costList.transDate }}</span>
        </div>
        <div class="costInfo">
          <!-- $t-交易时间 -->
          <span class="costInfo-left">{{ $t('Biz.Order.TradeTime') }}:</span>
          <span class="costInfo-right">{{ costList.transTime }}</span>
        </div>
        <div class="costInfo">
          <!-- $t-交易单号 -->
          <span class="costInfo-left">{{ $t('Biz.Order.TradeOddNum') }}:</span>
          <span class="costInfo-right">{{ costList.orderNo }}</span>
        </div>
      </div>
      
      <!-- <table>
        <tr :class="{'normal-item':!item.ispkgitem,'package-detail':item.ispkgitem}"
          v-for="item in costList" :key="item.key">
          <template v-if="!item.ispkgitem"> 
            <td class="item-col">
              <div class="package-item package-item-col">
                {{ item.mergeScId ? '[拼]' : '' }}{{item.name}} <p v-if="item.methodText">注:{{item.methodText}}</p>
              </div>
            </td>
            <td class="count-col">{{item.lastQty}}{{item.unitName}}</td>
          </template>
          <template v-else>
            <td colspan="6">
               <tr v-for="pkgItem in item.pkgList" :key="pkgItem.key" class="package-tr">
                 <td class="package-col">
                    <div class="package-item ml25">
                       {{pkgItem.name}} <p v-if="pkgItem.methodText">注:{{pkgItem.methodText}}</p>
                    </div>
                  </td>
                  <td class="count-col pl0">{{pkgListLastQty(item,pkgItem)}}{{pkgItem.unitName}}</td>
               </tr>
            </td>
          </template>
        </tr>
      </table> -->
      <div class="no-item" v-if="lastPay.length <= 0">
        <!-- <p>暂无消费信息</p> -->
        <p>{{ $t('Biz.Order.NoTradeInfo') }}</p>
      </div>
    </div>
    <div class="pos-pager pos-takeout-pager">
      <button href="javascript:;" class="prev" @click="upPage"><i class="el-icon-arrow-up"></i></button>
      <button href="javasctipt:;" class="next" @click="downPage"><i class="el-icon-arrow-down"></i></button>
    </div>
  </div>
</template>
<script>
import numberformat from '@/common/js/numberformat'
import {mapGetters} from 'vuex'
import { add, sub, multi, zeroize } from '@/common/js/math'
export default {
  props: {
    lastPay: {
      default () {
        return [];
      }
    },
    tsId: {
    }
  },
  filters: {
    keepTwo (val) {
      if (!val) return "0.00";
      return numberformat(val);
    },
  },
  watch : {
    tsId () {
      if(this.$refs.scrollContent){
        this.$refs.scrollContent.scrollTop = 0;
      }
    }
  },
  computed: {
   ...mapGetters([
     'getVuexPosMode'
   ]),
    // 列表数据
    costList () {
      const [ first ] = this.lastPay;
      return first
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
  // data () {
  //   return {
  //     scrollTop: 0,
  //     offset: 100,
  //   }
  // }
}
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.cost-table{
  height: 100%;
  position: relative;
  table{
    width: 100%;
  }
  th,td{
    padding-left: 6px;
    font-weight: normal;
  }
  .table-head{
    padding: 4px 0;
    background-color: #7bcad6;
    color: @white;
    th {
      font-size: 12px;
      line-height: 1.1;
    }
    th+th{
      border-left: 1px solid @white;
    }
  }
  .table-body{
    position: absolute;
    overflow: auto;
    top: 20px;
    bottom: 40px;
    left: 0;
    right: 0;
    margin-top: 6px;
    color: @gray-dark;
    // border-bottom:1px solid #c2c2c2;
    td{
      font-size: 12px;
      line-height: 3;
    }
    tr{
      border-bottom: 1px solid #7bcad6;
    }
    tr.normal-item{
      counter-increment: itemindex;
    }
    .item-col{
      .package-item-col::before{
        content: counter(itemindex);
        font-weight: bold;
        padding-right: 12px;
      }
      p {
        padding-left: 20px;
      }
    }
    > .costInfo-content {
      width: 100%;
      height: 100%;
      > .costInfo {
        display: flex;
        > span {
          flex: 1;
          margin-bottom: 10px;
        }

        > .costInfo-right {
          text-align: right;
          font-weight: bolder;
        }
      }
    }
  }
  .item-col{
    width: 28%;
  }
  .count-col{
    width: 13%;
  }
  .package-detail{
    background-color: #f5f5f5;
    color: #0babb9;
  }
}
.package-item{
    line-height: 1.8;
    // width: 269px;
  }
.no-item{
  text-align: center;
  font-size: 14px;
  color: #999999;
  padding-top: 120px;
  color: #0babb9;
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
.package-tr {
  width: 100%;
  display: flex;
  align-items: center;
  > .totle-col{
    padding-left: 3px;
  }
}
.package-col{
  width: 28%;
}
.pl0{
  padding-left: 0 !important;
}
.ml25{
  margin-left: 25px !important;
}
.pl3{
  padding-left: 3px !important;
}
</style>

