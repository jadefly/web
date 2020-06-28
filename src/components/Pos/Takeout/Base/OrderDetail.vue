<template>
  <Dialog
    name="Dialog.OrderDetail"
    ref="dialog"
    :title="$t('Dict.OrderDetails')"
    @open="onOpen"
    :showSubmit="true"
    width="770px"
    top="6vh"
    @submit="submit"
    :hotkeys="hotKeySet"
  >

    <div class="pos-dialog-content">
      <div class="order-detail-wrapper" v-if="orderItem">
        <div class="order-number">
          <strong>{{$t('Dict.OrderNumber01')}}{{ orderItem.deNo }}</strong>
        </div>
        <!-- 订单状态时间轴 -->
        <div class="time-line">
          <div class="new-order">
            <div class="bg new-oder-bg" :class="{ active: orderItem.dealState >= 0 }"></div>
            <div class="line line-bg" :class="{ active: orderItem.dealState >= 0 }"></div>
            <em>{{$t('Dict.NewOrder')}}</em>
            <p>{{ date(orderItem.createDateTime) }}</p>
            <p>{{ time(orderItem.createDateTime) }}</p>
          </div>
          <div class="wait-make">
            <div class="bg wait-make-bg" :class="{ active: orderItem.dealState >= 1 }"></div>
            <div class="line line-bg" :class="{ active: orderItem.dealState >= 1 }"></div>
            <em>{{$t('Dict.ToBeMade')}}</em>
            <p>{{ date(orderItem.confirmOkDateTime) }}</p>
            <p>{{ time(orderItem.confirmOkDateTime) }}</p>
          </div>
          <div class="wait-make" v-if="orderItem.selfGetOrderCheckoutMode">
            <div class="bg making-bg" :class="{ active: orderItem.dealState >= 2 }"></div>
            <div class="line line-bg" :class="{ active: orderItem.dealState >= 2 }"></div>
            <em>制作中</em>
            <p>{{ date(orderItem.makingDateTime) }}</p>
            <p>{{ time(orderItem.makingDateTime) }}</p>
          </div>
          <div class="wait-delivery">
            <div class="bg wait-delivery-bg" :class="{ active: orderItem.dealState >= 3 }"></div>
            <div class="line line-bg" :class="{ active: orderItem.dealState >= 3 }"></div>
            <em>{{orderItem.selfGetOrderCheckoutMode ? '待取餐' : $t('Dict.ToBeDelivered')}}</em>
            <p>{{ date(orderItem.kitchenDateTime) }}</p>
            <p>{{ time(orderItem.kitchenDateTime) }}</p>
          </div>
          <div class="delivering" v-if="!orderItem.selfGetOrderCheckoutMode">
            <div class="bg delivering-bg" :class="{ active: orderItem.dealState >= 6 }"></div>
            <div class="line line-bg" :class="{ active: orderItem.dealState >= 6 }"></div>
            <em>{{$t('Dict.Distribution')}}</em>
            <p>{{ date(orderItem.distributionDateTime) }}</p>
            <p>{{ time(orderItem.distributionDateTime) }}</p>
          </div>
          <div class="done">
            <div class="bg done-bg" :class="{ active: orderItem.dealState === 7 || orderItem.dealState === 10 }"></div>
            <em>{{orderItem.selfGetOrderCheckoutMode ? '已取餐' : $t('Dict.DeliveryService')}}</em>
            <p>{{ date(orderItem.confirmArriveDateTime) }}</p>
            <p>{{ time(orderItem.confirmArriveDateTime) }}</p>
          </div>
        </div>
        <!-- 配送信息 -->
        <div class="delivery-info" v-if="orderItem.o2oTakeoutDistributionDTOList">
          <div class="delivery-way">
            <strong>{{$t('Dict.DistributionMode')}}</strong>
            <em>{{ distributionType }}</em>
          </div>
          <div class="rider-info" v-if="!orderItem.selfGetOrderCheckoutMode">
            <strong>{{$t('Dict.InformationOnRiders')}}</strong>
            <em>
              <span>{{ orderItem.o2oTakeoutDistributionDTOList[0].riderName }}</span>
              <span>{{ orderItem.o2oTakeoutDistributionDTOList[0].riderPhone }} </span>
            </em>
          </div>
          <div class="modify-rider">
            <button class="btn btn-default" @click="modifyRider" v-if="!orderItem.viewSend && orderItem.isEnableMerchantDistri === '1' && orderItem.dealState > 3">{{ $t('Dict.ModifyRiders') }}</button>
          </div>
        </div>
        <!-- 详细信息 -->
        <div class="abnormal-info" v-if="orderItem.o2oTakeoutLogDTOList">
          <p><strong>{{$t('Biz.Pos.Takeout.TakeoutMsg031')}}</strong></p>
          <div class="manual-recorddbs" v-if="orderItem.recordBs === 0 && orderItem.cancelReason === 0">
            <button class="btn btn-default" @click="manualRecorddbs">{{$t('Biz.Pos.Takeout.TakeoutMsg032')}}</button>
            <span> {{$t('Biz.Pos.Takeout.TakeoutMsg033')}}</span>
          </div>
          <div class="ignore-check" v-if="orderItem.recordBs === 0 && orderItem.cancelReason === 0">
            <button class="btn btn-default" @click="ignoreCheck">{{$t('Biz.Pos.Takeout.TakeoutMsg034')}}</button>
            <span>{{$t('Biz.Pos.Takeout.TakeoutMsg035')}}</span>
          </div>
          <ul class="title">
            <li>{{$t('Dict.OrderOperation')}}</li>
            <li>{{$t('Dict.OperationTime')}}</li>
            <li>{{$t('Dict.DetailedInformation')}}</li>
          </ul>
          <div class="log-list" id="logList">
            <ul v-for="item in orderItem.o2oTakeoutLogDTOList">
              <li>{{ item.businessTypeDisplay }}</li>
              <li>{{ date(item.operationTime) }} {{ time(item.operationTime) }}</li>
              <li>
                <el-popover
                  placement="bottom-start"
                  trigger="hover"
                  :content="item.logContent"
                >
                  <span slot="reference">{{ item.logContent }}</span>
                </el-popover>
              </li>

            </ul>
          </div>
          <ul class="total">
            <li class="width220">{{$t('Dict.PageStyle.Sim3', [orderItem.o2oTakeoutLogDTOList.length])}}{{$t('Dict.DetailedInformation')}}</li>
            <li class="pager-wrapper" v-if="orderItem.o2oTakeoutLogDTOList" id="takeoutLogListPager">
              <Pager pagerId="logList" itemTag="> ul" ref="pager" arrowDirection="up-down" :showInfo="true"></Pager>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <!-- 修改骑手 -->
    <SelectRider ref="selectRider"  :oprateTitle="$t('Dict.ModifyRiders')" @handleRider="handleRider"></SelectRider>
  </Dialog>
</template>

<script>
import ajax from '@/common/js/ajax';
import { ERR_OK } from '@/common/api/takeoutConfig';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import dateFormat from '@/common/js/dateformat';
import Pager from '@/components/Pos/Common/Pager';

const SelectRider = (resolve) => {
  import('@/components/Pos/Takeout/Base/SelectRider').then((module) => {
    resolve(module);
  });
};

export default {
  props: {
    orderId: {
      type: String,
      default: '',
    },
  },
  components: { Dialog, SelectRider, Pager },
  mixins: [DialogMixin],
  data() {
    return {
      distributorId: '',
      orderItem: {},
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.submit();
        },
      };
    },
    // 配送类型
    distributionType() {
      const { deType } = this.orderItem.o2oTakeoutDistributionDTOList[0];
      let str = '';
      switch (deType) {
        case 0:
          str = this.$t('Dict.Unknown');
          break;
        case 1:
          str = this.$t('Dict.PlatformDelivery');
          break;
        case 2:
          str = this.$t('Dict.MerchantDistribution');
          break;
        case 3:
          str = this.$t('Dict.SelfMention');
          break;
        default:
          str = this.$t('Dict.MerchantDistribution');
          break;
      }
      return str;
    },
    logList() {
      return this.orderItem.o2oTakeoutLogDTOList;
    },
    selectedDistributorId() {
      return this.orderItem.o2oTakeoutDistributionDTOList[0].empId;
    },
  },
  methods: {
    // 打开更多信息 同步请求数据
    onOpen() {
      this.getOrderItem();
    },
    // 获取更多信息
    getOrderItem() {
      ajax('canyin.takeout.takeoutview.takeoutorderdetail', {
        params: {
          orderId: this.orderId,
        },
      })
        .then((res) => {
          if (res.data.code === ERR_OK) {
            this.orderItem = res.data.data;
          } else {
            this.$message.error(res.data.msg);
          }
        })
        .catch((err) => {
          this.$message.error(err)();
        });
    },
    // 打开选择骑手弹框
    modifyRider() {
      this.$refs.selectRider.open({ selectedDistributorId: this.selectedDistributorId });
    },
    // 格式化日期
    date(dateString) {
      if (dateString) {
        return dateFormat('%Y-%M-%D', dateString);
      }
      return this.$t('Biz.Pos.Takeout.TakeoutMsg036');
    },
    // 格式化时间
    time(dateString) {
      if (dateString) {
        return dateFormat('%H:%I:%S', dateString);
      }
      return this.$t('Biz.Pos.Takeout.TakeoutMsg036');
    },
    // 确认拿到骑手ID
    handleRider(id) {
      this.distributorId = id;
      this.updateRider();
    },
    // 修改骑手保存
    updateRider() {
      ajax('canyin.takeout.takeoutdistribution.updatetakeoutordedistririder', {
        params: {
          orderId: this.orderItem.o2oTakeoutDetailDTO.orderId,
          distributorId: this.distributorId,
        },
      })
        .then((res) => {
          if (res.data.code === ERR_OK) {
            this.getOrderItem();
            this.$message.success(res.data.msg);
          } else {
            this.$message.error(res.data.msg);
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
    // 暂无提交逻辑处理
    submit() {
      this.close();
    },
    // 手动录单
    manualRecorddbs() {
      ajax('canyin.takeout.takeoutorder.manualrecordbs', {
        params: {
          orderId: this.orderItem.o2oTakeoutDetailDTO.orderId,
        },
      })
        .then((res) => {
          if (res.data.code === ERR_OK) {
            this.getOrderItem();
            this.$message.success(res.data.msg);
          } else {
            this.$message.error(res.data.msg);
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
    // 结班不校验
    ignoreCheck() {
      ajax('canyin.takeout.takeoutorder.updatetakeoutpscheck', {
        params: {
          orderId: this.orderItem.o2oTakeoutDetailDTO.orderId,
          isIgnoreCheck: 1,
        },
      })
        .then((res) => {
          if (res.data.code === ERR_OK) {
            this.getOrderItem();
            this.$message.success(res.data.msg);
          } else {
            this.$message.error(res.data.msg);
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
  },
  watch: {
    // 监听异常信息数据 刷新Pager组件
    logList() {
      if (this.$refs.pager) {
        this.$refs.pager.refresh();
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-dialog-header {
  font-size: 16px;
  color: rgb(102, 102, 102);
  font-weight: bold;
  line-height: 1.2;
}

.pos-dialog-control {
  .btn-close,
  .btn-submit {
    height: 36px;
    padding: 8px 16px;
    margin-top: 4px;
  }
  .btn-close {
    margin-right: 10px;
    width: 98px;
  }
  span {
    color: #aaa;
  }
}

.btn-adopt {
  .button-variant(white, #3f77ce, #3f77ce);
}

.order-detail-wrapper {
  padding: 12px;
  background-color: #dae3ec;

  .order-number {
    font-size: 14px;
    color: #333;
    font-weight: bold;
  }

  .time-line {
    position: relative;
    width: 746px;
    height: 136px;
    background: white;
    margin-top: 12px;
    padding: 20px 50px;
    .clearfix();

    .new-order,
    .wait-make,
    .wait-delivery,
    .delivering,
    .done {
      position: relative;
      float: left;
      width: 128px;
      text-align: center;

      > em {
        font-style: normal;
        font-size: 12px;
        color: rgb(51, 51, 51);
      }

      > p {
        font-size: 12px;
        color: #7d7d7d;
      }
    }

    .bg {
      width: 30px;
      height: 30px;
      margin: 0 auto;
    }

    .new-oder-bg {
      background: url("~@/common/images/pos/takeout/status.png") no-repeat -110px -110px;
    }

    .new-oder-bg.active {
      background: url("~@/common/images/pos/takeout/status.png") no-repeat -160px -10px;
    }

    .wait-make-bg {
      background: url("~@/common/images/pos/takeout/status.png") no-repeat -10px -110px;
    }

    .wait-make-bg.active {
      background: url("~@/common/images/pos/takeout/status.png") no-repeat -60px -110px;
    }

    .making-bg {
      background: url("~@/common/images/pos/takeout/status.png") no-repeat -160px -110px;
    }

    .making-bg.active {
      background: url("~@/common/images/pos/takeout/status.png") no-repeat -160px -60px;
    }

    .wait-delivery-bg {
      background: url("~@/common/images/pos/takeout/status.png") no-repeat -110px -10px;
    }

    .wait-delivery-bg.active {
      background: url("~@/common/images/pos/takeout/status.png") no-repeat -110px -60px;
    }

    .delivering-bg {
      background: url("~@/common/images/pos/takeout/status.png") no-repeat -10px -60px;
    }

    .delivering-bg.active {
      background: url("~@/common/images/pos/takeout/status.png") no-repeat -60px -60px;
    }

    .done-bg {
      background: url("~@/common/images/pos/takeout/status.png") no-repeat -10px -10px;
    }

    .done-bg.active {
      background: url("~@/common/images/pos/takeout/status.png") no-repeat -60px -10px;
    }

    .line {
      position: absolute;
      top: -25px;
      left: 80px;
      width: 86px;
      height: 132px;
    }
    .line-bg {
      background: url("~@/common/images/pos/takeout/line.png") no-repeat -10px -10px;
    }

    .line-bg.active {
      background: url("~@/common/images/pos/takeout/line.png") no-repeat -116px -10px;
    }
  }

  .delivery-info {
    .size(100%, 58px);
    line-height: 58px;
    padding-left: 12px;
    padding-right: 12px;
    margin-top: 12px;
    background-color: white;
    .clearfix();

    .delivery-way,
    .rider-info {
      float: left;
      margin-right: 36px;
      > strong,
      em {
        font-style: normal;
        font-weight: normal;
        font-size: 14px;
        color: rgb(51, 51, 51);
      }
    }

    .modify-rider {
      float: right;

      > button {
        font-size: 14px;
        color: #0babb9;
        border: 1px solid #0babb9;
      }
    }
  }

  .abnormal-info {
    margin-top: 12px;
    background-color: white;
    overflow: hidden;
    padding: 12px 12px 0 12px;

    .manual-recorddbs,
    .ignore-check {
      padding: 4px 0;

      > button {
        /*width: 96px;*/
        color: #0babb9;
      }
    }

    .log-list {
      height: 141px;
      overflow: hidden;
    }

    > p > strong {
      font-weight: normal;
      font-size: 14px;
      color: rgb(51, 51, 51);
    }

    ul {
      padding-left: 12px;
      border-bottom: 1px solid #eee;

      .clearfix();

      li {
        float: left;
        height: 46px;
        line-height: 46px;
        font-size: 14px;
        color: rgb(51, 51, 51);
        .text-overflow();

        &:first-child {
          width: 103px;
        }
        &:nth-child(2) {
          width: 168px;
        }
        &:last-child {
          width: 435px;
        }
      }

      &.title {
        margin-top: 6px;
        background-color: #f5f5f5;
        > li {
          font-size: 14px;
          color: rgb(102, 102, 102);
        }
      }

      &.total {
        border-bottom: none;
        border-top: 1px solid #ddd;

        > li {
          font-size: 14px;
          color: rgb(102, 102, 102);

          &:last-child {
            float: right;
            text-align: right;
          }
        }
      }
    }
  }
}
.lang-enUS{
  .width220{
    width: 220px !important;
  }
}
</style>

<style lang="less">

#takeoutLogListPager {
  text-align: right;
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
</style>
