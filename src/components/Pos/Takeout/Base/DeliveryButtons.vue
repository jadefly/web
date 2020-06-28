<template>
  <div>
    <div v-if="orderItem.viewSend">
      <div class="pos-takeout-btns">
        <div class="pos-takeout-btns-single-line" v-if="orderItem.canSendOrder && orderItem.canCancelAllSend">
          <button type="button" class="btn btn-left btn-middle btn-adopt" @click="cancel">全部取消</button>
          <button type="button" class="btn btn-right btn-middle btn-warn" @click="delivery">再次发单</button>
        </div>
        <div class="pos-takeout-btns-single-line" v-else-if="orderItem.canSendOrder">
          <button type="button" class="btn btn-left btn-full btn-warn" @click="delivery">配送发单</button>
        </div>
        <div class="pos-takeout-btns-single-line" v-else-if="orderItem.canCancelAllSend">
          <button type="button" class="btn btn-left btn-full btn-adopt" @click="cancel">全部取消</button>
        </div>
      </div>
    </div>
    <div v-else>
      <!-- 默认空白 -->
      <div class="pos-takeout-btns"></div>
    </div>
    <DeliveryOrderDialog ref="DeliveryOrderDialog"></DeliveryOrderDialog>
  </div>
</template>

<script>
import ajax from '@/common/js/ajax';
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
  components: { DeliveryOrderDialog },
  data() {
    return {
      deliveryState: false,
    };
  },
  computed: {
  },
  methods: {
    delivery() {
      this.$refs.DeliveryOrderDialog.open(this.orderItem, {
        submit: () => {
          this.$emit('updateOrderList');
        },
      });
    },
    //  全部取消配送单
    cancel() {
      // 整理可取消数据
      const o2oTakeoutSendDTOList = this.orderItem.o2oTakeoutSendDTOList.filter(item => item.readOnly === 0 && item.canCancel);
      this.$confirm('是否取消全部正在发单的配送订单？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        ajax('canyin.takeout.takeoutsend.cancelsend', {
          contentType: 'json',
          data: {
            orderId: this.orderItem.id,
            o2oTakeoutSendDTOList,
          },
        }).then((res) => {
          if (res.code === '1') {
            this.$emit('updateOrderList');
            this.$message.success('取消成功');
          } else {
            this.$message.success('取消失败');
          }
        });
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.pos-takeout-btns {
  padding: 12px 14px;
  .size(100%, 60px);
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
  width: 140px;
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
  .button-variant(white, #3f77ce, #169BD5);
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
