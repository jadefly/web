<template>
  <div v-if="orderItem.cancelReason === 0">
    <div v-if="orderItem.refundApply === 0">
      <!-- 新订单 -->
      <div class="pos-takeout-btns" v-if="orderItem.dealState === 0">
        <div class="pos-takeout-btns-single-line">
          <button type="button" class="btn btn-full btn-new"
            :disabled="confirmOrderDisable"
            @click="beforeConfirmOrder({ isConfirmAndMake: false })">{{$t('Dict.Receipt')}}</button>
        </div>
        <div class="pos-takeout-btns-single-line">
          <button type="button" class="btn btn-left btn-large btn-adopt"
            :disabled="confirmAndMakeDisable"
            @click="beforeConfirmOrder({ isConfirmAndMake: true })">
              {{$t('Biz.Pos.Takeout.TakeoutMsg012')}}
          </button>
          <button type="button"
            class="btn btn-right btn-smaller btn-refuse"
            @click="refuseOrder">{{$t('Dict.Refuse')}}</button>
        </div>
      </div>
      <!-- 待制作 -->
      <div class="pos-takeout-btns" v-if="orderItem.dealState === 1">
        <div class="pos-takeout-btns-single-line">
          <button
            type="button"
            class="btn btn-full btn-adopt"
            :disabled="makeOrderDisable"
            @click="makeOrder"
          >{{ $t('Dict.Cook') }}</button>
        </div>
        <div class="pos-takeout-btns-single-line" v-if="cancelOrderDisplay">
          <button
            type="button"
            class="btn btn-left btn-middle btn-refuse"
            @click="cancelOrder"
          >{{ $t('Dict.CancellationOfOrder') }}</button>
          <button
            type="button"
            class="btn btn-right btn-middle btn-more"
            @click="openOrderDetail"
          >{{ $t('Dict.MoreInformation') }}</button>
        </div>
        <div class="pos-takeout-btns-single-line" v-else>
          <button
            type="button"
            class="btn btn-full btn-more"
            @click="openOrderDetail"
          >{{ $t('Dict.MoreInformation') }}</button>
        </div>
      </div>
      <!-- 制作中 -->
      <div class="pos-takeout-btns" v-if="orderItem.dealState === 2">
        <div class="pos-takeout-btns-single-line">
          <button type="button" class="btn btn-full btn-makedone" @click="makeDone">制作完成</button>
        </div>
        <div class="pos-takeout-btns-single-line" v-if="cancelOrderDisplay">
          <button type="button" class="btn btn-left btn-middle btn-refuse" @click="cancelOrder">取消订单</button>
          <button type="button" class="btn btn-right btn-middle btn-more" @click="openOrderDetail">更多信息</button>
        </div>
        <div class="pos-takeout-btns-single-line" v-else>
          <button type="button" class="btn btn-full btn-more" @click="openOrderDetail">更多信息</button>
        </div>
      </div>
      <!-- 制作中 -->
      <div class="pos-takeout-btns" v-if="orderItem.dealState === 2">
        <div class="pos-takeout-btns-single-line">
          <button type="button" class="btn btn-full btn-makedone" @click="makeDone">制作完成</button>
        </div>
        <div class="pos-takeout-btns-single-line" v-if="cancelOrderDisplay">
          <button type="button" class="btn btn-left btn-middle btn-refuse" @click="cancelOrder">取消订单</button>
          <button type="button" class="btn btn-right btn-middle btn-more" @click="openOrderDetail">更多信息</button>
        </div>
        <div class="pos-takeout-btns-single-line" v-else>
          <button type="button" class="btn btn-full btn-more" @click="openOrderDetail">更多信息</button>
        </div>
      </div>
      <!-- 待配送 -->
      <div class="pos-takeout-btns" v-if="orderItem.dealState === 3">
        <div class="pos-takeout-btns-single-line">
          <button v-if="orderItem.selfGetOrderCheckoutMode" type="button" class="btn btn-left btn-full btn-delivery" @click="selfGetOrder">自提核销</button>
          <template v-else>
            <button v-if="!orderItem.viewSend && orderItem.canSendOrder" type="button" class="btn btn-left btn-full btn-warn" @click="delivery">配送发单</button>
            <button v-else type="button" class="btn btn-full btn-warn" :disabled="checkDistributionDisable" @click="checkDistribution">配送</button>
          </template>
        </div>
        <div class="pos-takeout-btns-single-line" v-if="cancelOrderDisplay">
          <button
            type="button"
            class="btn btn-left btn-middle btn-refuse"
            @click="cancelOrder"
          >{{$t('Dict.CancellationOfOrder')}}</button>
          <button
            type="button"
            class="btn btn-right btn-middle btn-more"
            @click="openOrderDetail"
          >{{$t('Dict.MoreInformation')}}</button>
        </div>
        <div class="pos-takeout-btns-single-line" v-else>
          <button
            type="button"
            class="btn btn-full btn-more"
            @click="openOrderDetail"
          >{{$t('Dict.MoreInformation')}}</button>
        </div>
      </div>
      <!-- 配送中 -->
      <div class="pos-takeout-btns" v-if="orderItem.dealState === 6">
        <div class="pos-takeout-btns-single-line">
          <button v-if="orderItem.selfGetOrderCheckoutMode" type="button" class="btn btn-left btn-full btn-delivery" @click="selfGetOrder">自提核销</button>
          <button
            v-else
            type="button"
            class="btn btn-full btn-delivery"
            @click="checkIsNeedSettlement"
            :disabled="confirmArriveDisable"
          >{{$t('Dict.ConfirmationService')}}</button>
        </div>
        <div class="pos-takeout-btns-single-line" v-if="cancelOrderDisplay">
          <button
            type="button"
            class="mybtn btn-left btn-small btn-warn"
            :disabled="distributeAndPrintDisable"
            @click="distributeAndPrint"
          >
            {{ $t('Biz.Pos.Takeout.TakeoutMsg013') }}（{{
              orderItem.o2oTakeoutPrintDTOList[0].distributionPrintTimes
            }}）
          </button>
          <button
            type="button"
            class="btn btn-left btn-smaller btn-refuse m"
            @click="cancelOrder"
          >{{$t('Dict.CancellationOfOrder')}}</button>
          <button
            type="button"
            class="btn btn-right btn-smaller btn-more"
            @click="openOrderDetail"
          >{{$t('Dict.MoreInformation')}}</button>
        </div>
        <div class="pos-takeout-btns-single-line" v-else>
          <button
            type="button"
            class="btn btn-left btn-middle btn-warn"
            :disabled="distributeAndPrintDisable"
            @click="distributeAndPrint"
          >
            {{ $t('Biz.Pos.Takeout.TakeoutMsg013') }}（{{
              orderItem.o2oTakeoutPrintDTOList[0].distributionPrintTimes
            }}）
          </button>
          <button
            type="button"
            class="btn btn-right btn-middle btn-more"
            @click="openOrderDetail"
          >{{$t('Dict.MoreInformation')}}</button>
        </div>
      </div>
      <!-- 已送达 -->
      <div class="pos-takeout-btns" v-if="orderItem.dealState === 7 || orderItem.dealState === 10">
        <div class="pos-takeout-btns-single-line">
          <button
            type="button"
            class="btn btn-full btn-warn"
            :disabled="distributeAndPrintDisable"
            @click="distributeAndPrint"
          >
            {{ $t('Biz.Pos.Takeout.TakeoutMsg013') }}（{{
              orderItem.o2oTakeoutPrintDTOList[0].distributionPrintTimes
            }}）
          </button>
        </div>
        <div class="pos-takeout-btns-single-line" v-if="cancelOrderDisplay">
          <button
            type="button"
            class="btn btn-left btn-middle btn-refuse"
            @click="cancelOrder"
          >{{ $t('Dict.CancellationOfOrder') }}</button>
          <button
            type="button"
            class="btn btn-right btn-middle btn-more"
            @click="openOrderDetail"
          >{{ $t('Dict.MoreInformation') }}</button>
        </div>
        <div class="pos-takeout-btns-single-line" v-else>
          <button
            type="button"
            class="btn btn-full btn-more"
            @click="openOrderDetail"
          >{{ $t('Dict.MoreInformation') }}</button>
        </div>
      </div>
      <!-- 更多 -->
      <OrderDetail ref="orderDetail" :orderId="orderId"></OrderDetail>
      <!-- 输入原因 -->
      <ReasonDialog ref="reasonDialog" @getReason="getReason"></ReasonDialog>
      <!-- 选择骑手 -->
      <SelectRider
        ref="selectRider"
        :oprateTitle="$t('Dict.ChooseRiders')"
        @handleRider="handleRider"
      ></SelectRider>
      <!-- 订单结算 -->
      <Settlement
        ref="settlement"
        :propOrderId="orderId"
        :propOrderItem="orderItem"
        @settleDone="settleDone"
      ></Settlement>
      <!-- 接单处理 -->
      <ConfirmOrderHandling
        ref="confirmOrderHandling"
        @normalConfirmOrder="normalConfirmOrder"
        @confirmNotPrintOrder="confirmNotPrintOrder"
      ></ConfirmOrderHandling>
      <!-- 配送发单 -->
      <DeliveryOrderDialog ref="DeliveryOrderDialog"></DeliveryOrderDialog>
    </div>
    <div v-else-if="orderItem.refundApply === 1">
      <!-- 退单 -->
      <div class="pos-takeout-btns back">
        <div class="pos-takeout-btns-single-line">
          <button
            type="button"
            class="btn btn-left btn-smaller btn-new"
            @click="agreeCustomer"
          >{{ $t('Dict.Agree') }}</button>
          <button
            type="button"
            class="btn btn-right btn-large btn-refuse"
            @click="refuseCustomer"
          >{{ $t('Dict.Refuse') }}</button>
        </div>
      </div>
      <!-- 输入原因 -->
      <ReasonDialog
        ref="reasonDialog"
        @getReason="getReason"
        :dinerRefundReason="dinerRefundReason"
      ></ReasonDialog>
      <!-- 退单异常弹框 -->
      <AbnormalBack ref="abnormalBack" :operateMsg="operateMsg"
        :abnormalMsg="abnormalMsg"
        :orderId="orderId"
        :reason="reason" :refundId="refundId"
        @refreshBackOrder="refreshBackOrder"></AbnormalBack>
    </div>
  </div>
  <div v-else-if="orderItem.cancelReason">
    <div class="pos-takeout-btns">
      <!-- 取消状态 -->
      <div class="pos-takeout-btns-single-line">
        <button
          type="button"
          class="btn btn-full btn-default"
          @click="openOrderDetail"
        >{{ $t('Dict.MoreInformation') }}</button>
      </div>
    </div>
    <!-- 更多 -->
    <OrderDetail ref="orderDetail" :orderId="orderId"></OrderDetail>
  </div>
  <div v-else>
    <!-- 默认空白 -->
    <div class="pos-takeout-btns"></div>
  </div>
</template>

<script>
import ajax from '@/common/js/ajax';
import { ERR_OK } from '@/common/api/takeoutConfig';

const OrderDetail = (resolve) => {
  import('@/components/Pos/Takeout/Base/OrderDetail').then((module) => {
    resolve(module);
  });
};
const ReasonDialog = (resolve) => {
  import('@/components/Pos/Takeout/Base/ReasonDialog').then((module) => {
    resolve(module);
  });
};
const AbnormalBack = (resolve) => {
  import('@/components/Pos/Takeout/Base/AbnormalBack').then((module) => {
    resolve(module);
  });
};
const SelectRider = (resolve) => {
  import('@/components/Pos/Takeout/Base/SelectRider').then((module) => {
    resolve(module);
  });
};

const Settlement = (resolve) => {
  import('@/components/Pos/Takeout/Base/Settlement').then((module) => {
    resolve(module);
  });
};

const ConfirmOrderHandling = (resolve) => {
  import('@/components/Pos/Takeout/Base/ConfirmOrderHandling').then((module) => {
    resolve(module);
  });
};
// 配送发单
const DeliveryOrderDialog = (resolve) => {
  import('./DeliveryOrderDialog').then((module) => {
    resolve(module);
  });
};
export default {
  props: {
    orderItem: {
      type: Object,
      default: () => {},
    },
    takeOutListCount: {
      type: Number,
      default: 1,
    },
    cancelOrderDisplay: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    OrderDetail,
    ReasonDialog,
    AbnormalBack,
    SelectRider,
    Settlement,
    ConfirmOrderHandling,
    DeliveryOrderDialog,
  },
  data() {
    return {
      reason: '',
      buttonState: '',
      operateMsg: '',
      abnormalMsg: '',
      distributorId: '',
      confirmOrderDisable: false,
      confirmAndMakeDisable: false,
      makeOrderDisable: false,
      checkDistributionDisable: false,
      confirmArriveDisable: false,
      distributeAndPrintDisable: false,
      isConfirmAndMake: false,
    };
  },
  computed: {
    orderId() {
      return this.orderItem.id;
    },
    refundId() {
      return this.orderItem.partRefundFlg === 1
        ? this.orderItem.o2oTakeoutRefundDTOList[0].id
        : null;
    },
    dinerRefundReason() {
      return this.orderItem.o2oTakeoutRefundDTOList[0] ? this.orderItem.o2oTakeoutRefundDTOList[0].dinerRefundReason : '';
    },
  },
  methods: {
    // 接单和我接单并厨打之前 对平台已接单状态校验
    beforeConfirmOrder({ isConfirmAndMake }) {
      // 判断是接单 还是 接单并厨打
      this.isConfirmAndMake = isConfirmAndMake;
      // 已接单校验 弹出选择框
      if (this.orderItem.platState === 1) {
        this.$refs.confirmOrderHandling.open();
      } else if (this.isConfirmAndMake) { // 正常接单
        this.confirmAndMake({ acceptNoPrint: null });
      } else {
        this.confirmOrder({ acceptNoPrint: null });
      }
    },
    // 已接单 —— 正常接单
    normalConfirmOrder() {
      if (this.isConfirmAndMake) {
        this.confirmAndMake({ acceptNoPrint: null });
      } else {
        this.confirmOrder({ acceptNoPrint: null });
      }
    },
    // 已接单 —— 接单不打印
    confirmNotPrintOrder() {
      if (this.isConfirmAndMake) {
        this.confirmAndMake({ acceptNoPrint: 1 });
      } else {
        this.confirmOrder({ acceptNoPrint: 1 });
      }
    },
    // 接单
    confirmOrder({ acceptNoPrint }) {
      this.confirmOrderDisable = true;
      ajax('canyin.takeout.takeoutorder.confirmtakeoutorder', {
        params: {
          orderId: this.orderId,
          acceptNoPrint,
        },
      }).then((res) => {
        if (res.data.code === ERR_OK) {
          this.confirmOrderDisable = false;
          this.$message.success(res.data.msg);
          // 接单成功向外派送事件
          if (+this.takeOutListCount === 1) {
            this.$emit('updateOrderList', { isLastOrder: true });
          } else {
            this.$emit('updateOrderList', { isLastOrder: false });
          }
          this.$vemit('refreshBussinessData');
        } else {
          this.confirmOrderDisable = false;
          this.$message.error(res.data.msg);
        }
      }).catch((err) => {
        this.confirmOrderDisable = false;
        this.$message.error(err);
      });
    },
    // 接单并厨打
    confirmAndMake({ acceptNoPrint }) {
      this.confirmAndMakeDisable = true;
      ajax('canyin.takeout.takeoutmake.takeoutordermake', {
        params: {
          orderId: this.orderId,
          acceptNoPrint,
          isConfirmOrder: 1,
        },
      }).then((res) => {
        if (res.data.code === ERR_OK) {
          this.confirmAndMakeDisable = false;
          this.$message.success(res.data.msg);
          if (+this.takeOutListCount === 1) {
            this.$emit('updateOrderList', { isLastOrder: true });
          } else {
            this.$emit('updateOrderList', { isLastOrder: false });
          }
          this.$vemit('refreshBussinessData');
        } else {
          this.$message.error(res.data.msg);
        }
      }).catch((err) => {
        this.confirmAndMakeDisable = false;
        this.$message.error(err);
      });
    },
    // 点击拒绝接单按钮 打开对话框
    refuseOrder() {
      this.$refs.reasonDialog.open();
      this.buttonState = 'refuseOrder';
    },
    // 拒接接单API
    doRefuseOrder() {
      ajax('canyin.takeout.takeoutorder.refusetakeoutorder', {
        params: {
          orderId: this.orderId,
          refundReason: this.reason,
        },
      }).then((res) => {
        if (res.data.code === ERR_OK) {
          this.$message.success(res.data.msg);
          if (+this.takeOutListCount === 1) {
            this.$emit('updateOrderList', { isLastOrder: true });
          } else {
            this.$emit('updateOrderList', { isLastOrder: false });
          }
          this.$vemit('refreshBussinessData');
        } else {
          this.$message.error(res.data.msg);
        }
      }).catch((err) => {
        this.$message.error(err);
      });
    },
    // 厨打
    makeOrder() {
      this.makeOrderDisable = true;
      ajax('canyin.takeout.takeoutmake.takeoutordermake', {
        params: {
          orderId: this.orderId,
          isConfirmOrder: 0,
        },
      }).then((res) => {
        if (res.data.code === ERR_OK) {
          this.makeOrderDisable = false;
          this.$message.success(res.data.msg);
          this.$emit('updateOrderList');
        } else {
          this.makeOrderDisable = false;
          this.$message.error(res.data.msg);
        }
      }).catch((err) => {
        this.makeOrderDisable = false;
        this.$message.error(err);
      });
    },
    // 制作完成
    makeDone() {
      ajax('canyin.takeout.takeoutmake.finishmake', {
        params: {
          orderId: this.orderId,
        },
      }).then((res) => {
        if (res.data.code === ERR_OK) {
          this.$message.success(res.data.msg);
          this.$emit('updateOrderList');
        } else {
          this.$message.error(res.data.msg);
        }
      }).catch((err) => {
        this.$message.error(err);
      });
    },
    // 制作完成
    makeDone() {
      ajax('canyin.takeout.takeoutmake.finishmake', {
        params: {
          orderId: this.orderId,
        },
      }).then((res) => {
        if (res.data.code === ERR_OK) {
          this.$message.success(res.data.msg);
          this.$emit('updateOrderList');
        } else {
          this.$message.error(res.data.msg);
        }
      }).catch((err) => {
        this.$message.error(err);
      });
    },
    // 点击取消订单按钮
    cancelOrder() {
      this.$refs.reasonDialog.open();
      this.buttonState = 'cancelOrder';
    },
    // 取消订单API
    doCancelOrder() {
      ajax('canyin.takeout.takeoutorder.canceltakeoutorder', {
        params: {
          orderId: this.orderId,
          refundReason: this.reason,
        },
      }).then((res) => {
        if (res.data.code === ERR_OK) {
          this.$message.success(res.data.msg);
          this.$emit('updateOrderList');
          this.$vemit('refreshBussinessData');
        } else {
          this.$message.error(res.data.msg);
        }
      }).catch((err) => {
        this.$message.error(err);
      });
    },
    // 检查配送方式 商家配送：弹选择骑手框; 自配送：不弹
    checkDistribution() {
      this.checkDistributionDisable = true;
      ajax('canyin.takeout.takeoutdistriset.querytakeoutdistriset', {
        params: {
          orderId: this.orderId,
        },
      }).then((res) => {
        if (res.data.code === ERR_OK) {
          this.checkDistributionDisable = false;
          if (+this.orderItem.isSetRide === 1) {
            // 电话外卖已设置骑手
            this.distributorId = this.orderItem.o2oTakeoutDistributionDTOList[0].empId;
            this.distributeAndPrint();
          } else if (
            +res.data.data.takeOutOrderIsMerDistri === 1
            && (
              !this.orderItem.viewSend
              || (
                !this.orderItem.o2oTakeoutSendDTOList
                || this.orderItem.o2oTakeoutSendDTOList.length === 0
              )
            )
          ) {
            // 平台配送 弹骑手对话框
            this.$refs.selectRider.open();
          } else {
            // 商家配送无骑手
            this.distributorId = ''; // 电话外卖需要拿取骑手
            this.distributeAndPrint();
          }
        } else {
          this.checkDistributionDisable = false;
          this.$message.error(res.data.msg);
        }
      }).catch(() => {
        this.checkDistributionDisable = false;
      });
    },
    // 确认拿到骑手ID
    handleRider(id) {
      this.distributorId = id;
      this.distributeAndPrint();
    },
    // 配送并打印
    distributeAndPrint() {
      this.distributeAndPrintDisable = true;
      ajax('canyin.takeout.takeoutdistribution.takeoutordedistribution', {
        params: {
          orderId: this.orderId,
          distributorId: this.distributorId,
        },
      }).then((res) => {
        if (res.data.code === ERR_OK) {
          this.distributeAndPrintDisable = false;
          this.$message.success(res.data.msg);
          this.$emit('updateOrderList');
        } else {
          this.distributeAndPrintDisable = false;
          this.$message.error(res.data.msg);
        }
      }).catch((err) => {
        this.distributeAndPrintDisable = false;
        this.$message.error(err);
      });
    },
    // 点击确认送达 检查是否为电话外卖判断弹出结算窗口
    checkIsNeedSettlement() {
      if (this.orderItem.manualSettFlg == ERR_OK) {
        this.$refs.settlement.open();
      } else {
        this.confirmArrive();
      }
    },
    // 确认送达
    confirmArrive() {
      this.confirmArriveDisable = true;
      ajax('canyin.takeout.takeoutorder.confirmarrive', {
        params: {
          orderId: this.orderId,
        },
      }).then((res) => {
        if (res.data.code === ERR_OK) {
          this.confirmArriveDisable = false;
          this.$message.success(res.data.msg);
          this.$emit('updateOrderList');
        } else {
          this.confirmArriveDisable = false;
          this.$message.error(res.data.msg);
        }
      }).catch((err) => {
        this.confirmArriveDisable = false;
        this.$message.error(err);
      });
    },
    // 电话外卖结算成功
    settleDone() {
      this.$emit('updateOrderList');
    },
    // 点击同意食客取消外卖单按钮
    agreeCustomer() {
      this.$refs.reasonDialog.open();
      this.buttonState = 'agreeCustomer';
    },
    // 同意食客取消外卖单API
    doAgreeCustomer() {
      ajax('canyin.takeout.takeoutdispute.customercancelagree', {
        params: {
          orderId: this.orderId,
          refundId: this.refundId,
          agreeReason: this.reason,
        },
      }).then((res) => {
        if (res.data.code === ERR_OK) {
          this.$message.success(res.data.msg);
          this.$emit('updateOrderList');
          this.$vemit('refreshBussinessData');
        } else if (res.data.errCode === null) {
          this.$alert(res.data.msg, {
            confirmButtonText: this.$t('Dict.Sure'),
            type: 'error',
          });
          // this.$message.error(res.data.msg)
        } else {
          this.operateMsg = this.$t('Dict.Agree');
          this.abnormalMsg = res.data.msg;
          this.openAbnormalBack();
        }
      }).catch((err) => {
        this.$message.error(err);
      });
    },
    // 拒绝食客取消外卖单API
    refuseCustomer() {
      ajax('canyin.takeout.takeoutdispute.customercancelrefuse', {
        params: {
          orderId: this.orderId,
          refundId: this.refundId,
        },
      }).then((res) => {
        if (res.data.code === ERR_OK) {
          this.$message.success(res.data.msg);
          this.$emit('updateOrderList');
          this.$vemit('refreshBussinessData');
        } else if (res.data.errCode === null) {
          this.$message.error(res.data.msg);
        } else {
          this.operateMsg = this.$t('Dict.Refuse');
          this.abnormalMsg = res.data.msg;
          this.openAbnormalBack();
        }
      }).catch((err) => {
        this.$message.error(err);
      });
    },
    // 更多信息
    openOrderDetail() {
      this.$refs.orderDetail.open();
    },
    // 退单异常信息
    openAbnormalBack() {
      this.$refs.abnormalBack.open();
    },
    // 点击确认提交原因
    getReason(reason) {
      this.reason = reason;
      switch (this.buttonState) {
        case 'refuseOrder':
          this.doRefuseOrder();
          break;
        case 'cancelOrder':
          this.doCancelOrder();
          break;
        case 'agreeCustomer':
          this.doAgreeCustomer();
          break;
        default:
          this.$message.error(this.$t('Biz.Pos.Takeout.TakeoutMsg015'));
          break;
      }
    },
    // 异常点击继续同意/拒绝 刷新退单数据
    refreshBackOrder() {
      this.$emit('updateOrderList');
      this.$vemit('refreshBussinessData');
    },
    // 打开部分退提示
    openPartRefundTip() {
      this.$alert(this.$t('Biz.Pos.Takeout.TakeoutMsg014'), {
        confirmButtonText: this.$t('Dict.Sure'),
        type: 'error',
      });
    },
    delivery() {
      this.$refs.DeliveryOrderDialog.open(this.orderItem, {
        submit: () => {
          this.$emit('updateOrderList');
        },
      });
    },
    // 自提核销
    selfGetOrder() {
      ajax('canyin.takeout.takeoutorder.checkoutselforder', {
        contentType: 'json',
        data: {
          orderId: this.orderId,
        },
      }).then((res) => {
        console.info('自提核销', res);
        this.$message.success(res.msg);
        this.$emit('updateOrderList');
      }).catch((err, msg) => {
        this.$message.error(msg);
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-takeout-btns {
  position: absolute;
  top: 0;
  left: 0;
  padding: 24px 28px;
  .size(100%, 121px);
  background-color: white;
  z-index: 1;
  button {
    height: 38px;
    margin-bottom: 8px;
  }
  &.back {
    .size(100%, 90px);
  }
}

// 自定义外卖按钮样式
.btn-left {
  float: left;
}

.btn-right {
  float: right;
}

.btn-full {
  width: 100%;
}

.btn-large {
  width: 180px;
}

.btn-middle {
  width: 130px;
}

.btn-small {
  width: 96px;
}

.btn-smaller {
  width: 80px;
  &.m {
    margin-left: 4px;
  }
}

.btn-adopt {
  .button-variant(white, #3f77ce, #3f77ce);
}

.btn-refuse {
  .button-variant(white, #eb6d6d, #eb6d6d);
}

.btn-new {
  .button-variant(white, #5bb85d, #5bb85d);
}

.btn-warn {
  .button-variant(white, #f0b017, #f0b017);
}

.btn-makedone {
  .button-variant(white, #53b1e1, #53b1e1);
}

.btn-delivery {
  .button-variant(white, #b54bdc, #b54bdc);
}

.btn-more {
  .button-variant(#333, white, #ccc);
}

.mybtn {
  border: 1px solid transparent;
  border-radius: 4px;
  line-height: 1.2;
}
</style>
