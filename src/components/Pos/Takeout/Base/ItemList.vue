<template>
  <div v-cloak class="takeout-itemlist-wrapper">
    <div class="pos-takeout-orders" v-if="payInfo" :class="{'has-invoice': payInfo.invoice === 1, 'back': isRefund }">
      <!-- 发票抬头 -->
      <div class="invoice-wrapper" v-if="payInfo">
        <div v-if="payInfo.invoice === 1">
          <strong>{{$t('Dict.InvoiceRise')}}</strong>
          <span>{{ payInfo.invoiceTitle }}</span>
        </div>
      </div>
      <!-- 数据列表 -->
      <div class="order-list">
        <!-- 退单列表 -->
        <div v-if="isRefund" class="refund-wrapper">
          <!-- 部分退 标识: 1-->
          <div v-if="isPartRefund" class="part-refund-wrapper">
            <h4 class="title">{{$t('Biz.Pos.Takeout.TakeoutMsg023')}}</h4>
            <div class="money">
              <span>{{$t('Biz.Pos.Takeout.TakeoutMsg024')}}</span>
              <strong> {{ refundInfo.partCancelMoney }}</strong>
            </div>
            <h4 class="item-title">{{$t('Dict.Item01')}}</h4>
            <ul class="part-refund-list" id="partRefundList" :class="{'more': partRefundList.length > 6}">
              <li :key="index" v-for="(item,index) in partRefundList">
                <strong class="item-name">{{ item.itemName }}</strong>
                <span class="item-count">{{ item.qty }}{{ item.wuuItemSizeName }}</span>
                <span class="item-total">{{$t('Dict.Subtotal')}}:{{ item.qty * item.pr }}</span>
              </li>
            </ul>
            <div id="partRefundListPager" class="part-refund-pager" v-if="partRefundList.length > 6">
              <span>{{$t('Dict.PageStyle.Sim3', [partRefundList.length])}}</span>
              <Pager pagerId="partRefundList" arrowDirection="up-down" ref="partRefundListPager" :showInfo="true"></Pager>
            </div>
            <div class="reason">
              <strong>{{$t('Dict.Reason')}}</strong>
              <el-popover
                placement="top-start"
                trigger="hover"
                :content="refundInfo.dinerRefundReason"
              >
                <span class="reason-content" slot="reference">{{ refundInfo.dinerRefundReason }}</span>
              </el-popover>
            </div>
          </div>
          <!-- 全单退 标识: 0 || null-->
          <div v-else>
            <h4 class="title">{{$t('Biz.Pos.Takeout.TakeoutMsg025')}}</h4>
            <div class="reason" >
              <strong>{{$t('Dict.Reason')}}</strong>
              <el-popover
                placement="top-start"
                trigger="hover"
                :content="refundInfo.dinerRefundReason"
              >
                <span class="reason-content" slot="reference">{{ refundInfo.dinerRefundReason }}</span>
              </el-popover>
            </div>
          </div>
        </div>
        <!-- 点餐列表 -->
        <ul id="takeoutOrderList" v-if="packageList|| itemList">
          <!-- 套餐列表 -->
          <li v-for="(item, index) in packageList" :class="{'part-cancel-order': item.refundId}" :key="item.id">
            <span class="item-index">{{ index + 1 }}</span>
            <strong class="item-name">{{ item.name }}</strong>
            <span class="item-price">{{$t('Dict.UnitPrice1')}}{{ item.tcPr }}</span>
            <span class="item-count">{{ item.count }}份</span>
            <span class="item-total">{{$t('Dict.Subtotal')}}:{{ item.lastSubTotal }}</span>
            <p class="item-method" v-if="item.methodText">{{ item.methodText }}</p>
            <div v-for="(pkgItem,index2) of item.o2oTakeoutPkgDtDTOList" :key="pkgItem.id">
              <!--鱼酷称重-->
              <div
                class="pkglist-yuku cursorItem"
                v-if="posSettings.isFishCoolEnable && pkgItem.isConfirmWeigh && requestType !== '4'"
                @click="changeItemNum(pkgItem,index2,item)"
                :class="{ 'active': (tabIndex === index2 && item.id === currentPkgItem.id) }"
              >
                <i class="icon icon-dian1 pkg-icon"></i>
                <p class="pkg-item-name">{{pkgItem.name}}</p>
                <p class="pkg-item-count">{{pkgItem.count}}{{pkgItem.itemSizeName}}</p>
                <p class="pkg-item-price"><em class="give">称</em></p>
              </div>
              <!--鱼酷不承重-->
              <div class="pkglist-yuku cursorItem" v-else-if="posSettings.isFishCoolEnable && !pkgItem.isConfirmWeigh && requestType !== '4'">
                <i class="icon icon-dian1 pkg-icon"></i>
                <p class="pkg-item-name">{{pkgItem.name}}</p>
                <p class="pkg-item-count">{{pkgItem.count}}{{pkgItem.itemSizeName}}</p>
                <p class="pkg-item-price"></p>
              </div>
              <!--非鱼酷-->
              <div class="noPadding pkglist" v-else>
                <i class="icon icon-dian1 pkg-icon"></i>
                <p class="pkg-item-name">{{pkgItem.name}}</p>
                <p class="pkg-item-count">{{pkgItem.count}}{{pkgItem.itemSizeName}}</p>
                <p class="pkg-item-price"></p>
              </div>
              <p class="pkg-item-method" v-if="pkgItem.methodText">{{pkgItem.methodText}}</p>
            </div>
          </li>
          <!-- 单品项列表 -->
          <li v-for="(item, index) in itemList" :class="{'part-cancel-order': item.refundId}" :key="item.id">
            <span class="item-index">{{ packageList.length + index + 1 }}</span>
            <strong class="item-name">{{ item.itemName }}</strong>
            <span class="item-price">{{$t('Dict.UnitPrice1')}}{{ item.pr }}</span>
            <span class="item-count">{{ item.qty }}{{ item.wuuItemSizeName }}</span>
            <span class="item-total">{{$t('Dict.Subtotal')}}:{{ item.lastSubTotal }}</span>
            <p class="item-method" v-if="item.methodText">{{ item.methodText }}</p>
          </li>
        </ul>
      </div>
      <!-- 备注 -->
      <div class="pos-takeout-remark" v-if="detailInfo">
        <el-popover
          placement="top-start"
          trigger="hover"
          :content="detailInfo.remark"
          >
           <span slot="reference">{{$t('Dict.Remarkss')}}{{ detailInfo.remark }}</span>
        </el-popover>
      </div>
      <!-- 分页 -->
      <div id="takeoutItemListPager" class="takeout-item-pager" v-if="packageList || itemList">
        <Pager pagerId="takeoutOrderList" arrowDirection="up-down" ref="takeoutItemListPager" scrollMode="simple" :showInfo="true"></Pager>
      </div>
    </div>
    <!-- 支付 -->
    <div class="pos-takeout-pay">
      <ul class="pos-takeout-amount" v-if="detailInfo" :class="{'part-cancel-money': payInfo.partCancelMoney}">
        <li><strong>{{$t('Biz.Pos.Takeout.TakeoutMsg026')}}</strong><span> {{ itemTotalFee }}</span></li>
        <li><strong>{{ distributionItemName }}</strong><span> {{ detailInfo.dePrice }}</span></li>
        <li><strong>{{ lunchboxItemName }}</strong><span> {{ detailInfo.boxFee }}</span></li>
        <li><strong>{{$t('Dict.Total')}}</strong><span> {{ detailInfo.sumFee }}</span></li>
        <li v-if="payInfo.partCancelMoney">
          <strong>{{$t('Biz.Pos.Takeout.TakeoutMsg027')}}
            <el-popover
              popper-class="part-cancel-popover"
              placement="top"
              :title="$t('Biz.Pos.Takeout.TakeoutMsg028')"
              width="240"
              trigger="click"
              :offset="-24">
              <ul>
                <li>{{$t('Biz.Pos.Takeout.TakeoutMsg029')}}</li>
                <li>{{$t('Biz.Pos.Takeout.TakeoutMsg030')}}</li>
              </ul>
              <i class="icon icon-tishi" slot="reference"></i>
            </el-popover>
          </strong>
        <span> {{ payInfo.partCancelMoney }}</span>
        </li>
      </ul>
      <ul class="pos-takeout-total" v-if="payInfo">
        <li><strong>{{$t('Dict.PreferentialAmount')}}</strong><span><em>{{ payInfo.activityTotal }}</em></span></li>
        <li><strong>{{$t('Dict.ActualBusinessIncome')}}</strong><span><em>{{ payInfo.payAmount }}</em></span></li>
      </ul>
    </div>
    <ChangeNum
      ref="ChangeNum"
    ></ChangeNum>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Pager from '@/components/Pos/Common/Pager';
import { sub } from '@/common/js/math';
import ajax from '@/common/js/ajax';

// 改量
const ChangeNum = (resolve) => {
  import('./ChangeNum').then((module) => {
    resolve(module);
  });
};
export default {
  components: {
    Pager,
    ChangeNum,
  },
  props: {
    // 外卖单数据
    orderItem: {
      type: Object,
      default: null,
    },
    // 配送名称
    distributionItemName: {
      type: String,
      default() {
        return this.$t('Dict.DistributionFee');
      },
    },
    // 餐盒名称
    lunchboxItemName: {
      type: String,
      default() {
        return this.$t('Dict.LunchCoxFee');
      },
    },
    // 页面类型
    requestType: {
      type: String,
      default: '0',
    },
  },
  tabIndex: -1,
  data() {
    return {
      currentPkgItem: '',
      oldCount: '',
      tabIndex: -1,
    };
  },
  computed: {
    ...mapGetters(['posSettings']),
    // 支付信息
    payInfo() {
      return this.orderItem.o2oTakeoutBasePayDTO;
    },
    // 是否为退单
    isRefund() {
      return this.orderItem.refundApply === 1;
    },
    // 是否为部分退
    isPartRefund() {
      return this.orderItem.partRefundFlg === 1;
    },
    // 退单信息
    refundInfo() {
      return this.orderItem.o2oTakeoutRefundDTOList[0];
    },
    // 部分退列表
    partRefundList() {
      return this.orderItem.o2oTakeoutBackDTOList[0].o2oTakeoutBackDtDTOList;
    },
    // 菜品小计
    itemTotalFee() {
      const itemDetail = this.orderItem.o2oTakeoutDetailDTO;
      return sub(sub(itemDetail.sumFee, itemDetail.dePrice), itemDetail.boxFee);
    },
    // 套餐列表
    packageList() {
      return this.orderItem.o2oTakeoutPkgDTOList;
    },
    // 品项列表
    itemList() {
      return this.orderItem.o2oTakeoutItemDTOList;
    },
    // 账单细节信息
    detailInfo() {
      return this.orderItem.o2oTakeoutDetailDTO;
    },
  },
  watch: {
    // 监听数据 刷新Pager组件
    orderItem() {
      if (this.$refs.partRefundListPager) {
        this.$refs.partRefundListPager.refresh();
      }
      if (this.$refs.takeoutItemListPager) {
        this.$refs.takeoutItemListPager.refresh();
      }
    },
  },
  mounted() {},
  methods: {
    // 修改数量按钮
    changeItemNum(list, index, item) {
      let listItem = JSON.parse(JSON.stringify(list));
      this.tabIndex = index;// 记录当前点击的item下标
      this.currentPkgItem = item;// 当前套餐
      this.oldCount = listItem.count;
      this.$refs.ChangeNum.open({
        listItem, // 当前套餐中item
      }, {
        submit: (num) => {
          this.changeNum(num);
        },
      });
    },
    // 修改数量请求
    changeNum(item) {
      if (item.count == this.oldCount) {
        this.$refs.ChangeNum.close();
        return;
      }
      ajax('canyin.takeout.takeoutview.takeoutordermodifyitemqty', {
        contentType: 'json',
        data: {
          id: item.id,
          orderId: item.orderId,
          itemId: item.itemId,
          count: this.oldCount,
          modifyQty: item.count,
          pkgItemId: this.currentPkgItem.itemId,
          pkgItemQty: this.currentPkgItem.count,
          itemSizeId: item.itemSizeId,
        },
      }).then((res) => {
        // 赋值修改后的数量
        this.currentPkgItem.o2oTakeoutPkgDtDTOList[this.tabIndex].count = item.count;
        // 还原点击的item下标
        this.tabIndex = -1;
        // 关闭窗口
        this.$refs.ChangeNum.close();
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
[v-cloak]{
  display: none
}
.takeout-itemlist-wrapper {
  height: 100%;
}
.pos-takeout-orders {
  position: relative;
  padding-top: 121px;
  padding-bottom: 230px;
  height: 100%;
  &.has-invoice {
    padding-top: 161px;
  }
  &.back {
    padding-top: 90px;
  }
  &.has-invoice.back {
    padding-top: 131px;
    .invoice-wrapper {
      top: 91px;
    }
    .order-list > ul {
      min-height: 50px;
    }
  }
  .order-list {
    display: flex;
    flex-direction: column;
    height: 100%;
    > ul {
      height: 100%;
      min-height: 100px;
      margin-top: 4px;
      border-top: 1px solid #ccc;
      overflow-x: hidden;
      margin-bottom: 8px;
      > li {
        position: relative;
        border-bottom: 1px solid #ccc;
        padding: 6px 28px 6px 38px;
        font-size: 12px;
        color: #7d7d7d;
        background-color: white;
        .active{
          background: #cccccc;
        }
        .cursorItem{
          cursor: pointer;
        }
        .noPadding{
          padding:0 0 0 14px;
        }
        .pkglist-yuku{
          display: flex;
          justify-content: space-around;
          align-items: flex-start;
          position: relative;
          padding:6px 0 6px 14px;
          .pkg-icon{
            position: absolute;
            top: 3px;
            left: 0;
          }
          .pkg-item-name{
            width: 44%;
          }
          .pkg-item-count{
            width: 23%;
            text-align: right;
          }
          .pkg-item-price{
            width: 25%;
            text-align: right;
          }
          .give{
            background: #f24f64;
            display: inline-block;
            width: 16px;
            height: 16px;
            line-height: 16px;
            text-align: center;
            font-size: 12px;
            color: #fff;
            font-style: normal;
            margin-left: 2px;
            margin-right: 2px;
          }
        }
        .pkglist{
          display: flex;
          justify-content: space-around;
          align-items: flex-start;
          position: relative;
          padding-left: 14px;
          .pkg-icon{
            position: absolute;
            top: -2px;
            left: 0;
          }
          .pkg-item-name{
            width: 44%;
          }
          .pkg-item-count{
            width: 23%;
            text-align: right;
          }
          .pkg-item-price{
            width: 25%;
            text-align: right;
          }
        }
        .pkg-item-method{
          margin-left:19px
        }
        .item-index {
          position: absolute;
          top: 12px;
          left: 18px;
          display: flex;
          justify-content: center;
          align-items: center;
          .square(14px);
          border-radius: 50%;
          font-size: 12px;
          color: white;
          background-color: #7d7d7d;
        }
        .item-name {
          display: block;
          height: 20px;
          line-height: 20px;
          font-size: 14px;
          color: #333;
          overflow: hidden;
        }
        .item-price {
          display: inline-block;
          width: 48%;
        }
        .item-count {
          display: inline-block;
          width: 23%;
          text-align: right;
        }
        .item-total {
          display: inline-block;
          width: 25%;
          text-align: right;
        }
        .item-method {
          width: 100%;
          overflow: hidden;
        }
        &.part-cancel-order {
          color: red;
          .item-name {
            color: red;
          }
        }
      }
    }
    .refund-wrapper {
      padding: 8px 20px;
      line-height: 1.8;
      border-top: 1px solid #ccc;
      background-color: white;
      .title {
        font-size: 15px;
        font-weight: bold;
      }
      .reason {
        width: 100%;
        border-top: 1px dashed #ccc;
        .text-overflow();
        > strong {
          font-weight: normal;
          color: #7d7d7d;
        }
        .reason-content {
          color: red;
        }
      }
      .part-refund-wrapper {
        position: relative;
        .money {
          position: absolute;
          top: -4px;
          right: 0;
          > strong {
            color: #0babb9;
          }
        }
        .item-title {
          border-top: 1px dashed #ccc;
          margin-top: 8px;
          padding-top: 4px;
          padding-bottom: 4px;
          color: #7d7d7d;
        }
        .part-refund-list {
          max-height: 142px;
          line-height: 1.4;
          color: #7d7d7d;
          overflow: hidden;
          &.more {
            max-height: 106px;
          }
          > li:not(.item) {
            padding-left: 8px;
            strong {
              display: inline-block;
              width: 40%;
              color: #333;
              .text-overflow();
            }
            span {
              display: inline-block;
              width: 28%;
              font-size: 12px;
              text-align: center;
              .text-overflow();
            }
          }
        }
      }
    }
  }

  .pos-takeout-remark {
    position: absolute;
    bottom: 188px;
    left: 0;
    z-index: 100;
    width: 50%;
    padding: 10px 0 10px 28px;
    font-size: 14px;
    color: rgb(86, 86, 86);
    line-height: 1.2;
    text-align: left;
    .text-overflow();
  }
  .invoice-wrapper {
    position: absolute;
    top: 121px;
    left: 0;
    width: 100%;
    background-color: white;
    > div {
      height: 40px;
      line-height: 1.4;
      padding-left: 28px;
      padding-right: 28px;
      border-top: 1px solid #ccc;
      overflow: hidden;
      > span {
        font-weight: bold;
        color: rgb(255, 102, 34);
        word-break: break-all;
      }
    }
  }
  .takeout-item-pager {
    position: absolute;
    bottom: 184px;
    right: 0;
    width: 100%;
    padding-top: 8px;
    padding-bottom: 8px;
    padding-right: 8px;
    border-bottom: 1px solid #ccc;
    background-color: white;
    text-align: right;
    z-index: 1;
  }
  .part-refund-pager {
    position: relative;
    width: 100%;
    text-align: right;
    padding-top: 4px;
    padding-bottom: 4px;
    > span {
      position: absolute;
      top: 10px;
      right: 54%;
      color: #273844;
      font-size: 12px;
    }
  }
}

.pos-takeout-pay {
  position: absolute;
  bottom: 0;
  left: 0;
  .size(100%, 184px);
  background-color: white;

  .pos-takeout-amount {
    position: absolute;
    top: 0;
    left: 0;
    padding-left: 28px;
    padding-right: 28px;
    width: 100%;
    > li {
      line-height: 2;
      .clearfix();
      > strong,
      span {
        font-size: 14px;
        font-weight: bold;
        white-space: nowrap;
        overflow: hidden;
      }
      > strong {
        width: 60%;
        color: rgb(51, 51, 51);
        float: left;
        text-align: left;
      }
      > span {
        width: 40%;
        color: rgb(255, 102, 34);
        float: right;
        text-align: right;
      }
    }
    &.part-cancel-money {
      > li {
        line-height: 1.75;
        .icon-tishi {
          font-size: 19px;
          font-weight: 500;
          cursor: pointer;
          margin-left: 4px;
          color: #f0b017;
        }
      }
    }
  }

  .pos-takeout-total {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    border-top: 1px solid #ccc;
    padding-left: 28px;
    padding-right: 28px;
    height: 62px;
    line-height: 62px;

    > li {

      > strong,
      span {
        font-size: 16px;
        color: rgb(51, 51, 51);
        font-weight: bold;
        line-height: 1.2;
      }
      em {
        color: rgb(255, 102, 34);
        font-style: normal;
      }
    }
    > li:first-child {
      position: absolute;
      top: 0;
      left: 28px;
    }
    > li:last-child {
      position: absolute;
      top: 0;
      right: 28px;
    }
  }
}

</style>

<style lang="less">
.takeout-itemlist-wrapper #takeoutItemListPager,
.takeout-itemlist-wrapper #partRefundListPager {
  .pos-pager {
    > button {
      display: inline-block;
      width: 44px;
      height: 30px;
      border: 1px solid #c8c8c8;
      line-height: 28px;
      border-radius: 14px;
      text-align: center;
      margin-left: 8px;
      color: #333;
      > i {
        font-size: 16px;
      }
    }
  }
}
.part-cancel-popover {
  background-color: #fff0cc;
  border-color: #eed394;
  .el-popover__title {
    font-size: 14px;
    font-weight: bold;
  }
  ul {
    font-size: 12px;
    line-height: 1.5
  }
  .popper__arrow {
    border-top-color: #eed394 !important;
    &:after {
      border-top-color: #fff0cc !important;
    }
  }
}
</style>
