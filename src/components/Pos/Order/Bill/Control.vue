<template>
  <div class="pos-order-bill-control" v-if="posOrderBill">
    <template v-if="ordering">
      <!-- 国际化：共{0}份，合计： -->
      <div class="i">
        <h2><span v-if="addOrderSum > 0">{{ $t('Biz.Order.AllCopies', [addOrderSum]) }}，</span>{{$t('Dict.Total01')}}</h2>
        <strong> {{ lastTotal }}</strong>
        <del v-if="lastTotal !== originalTotal"> {{ originalTotal }}</del>
      </div>
      <div class="b">
        <!-- 国际化：返回 -->
        <button
          type="button"
          class="a"
          @click="back"
          id="backOrder">
          <strong>{{$t('Dict.Return')}}</strong>
          <span>(PgUp)</span>
        </button>
        <!-- 国际化：提交 -->
        <button
          ref="addBill"
          type="button"
          class="o"
          @click="add"
          id="submitBill">
          <strong>{{$t('Dict.SubmitBtn')}}</strong>
          <span>(PgDn)</span>
        </button>
      </div>
    </template>
    <template v-else>
      <div class="i">
        <!-- 国际化：共{0}份，合计： -->
        <h2><span v-if="orderBillSum > 0">{{ $t('Biz.Order.AllCopies', [orderBillSum]) }}，</span>{{$t('Dict.Total01')}}</h2>
        <strong id="orderBillLastTotal"
          :style="itemIncomeTotalZoomFont(posOrderBill.bsData.itemIncomeTotal)">
             {{ posOrderBill.bsData.itemIncomeTotal }}
        </strong>
        <del v-if="posOrderBill.bsData.itemOrigMoney != posOrderBill.bsData.itemIncomeTotal">
           {{ posOrderBill.bsData.itemOrigMoney }}
        </del>
      </div>
      <div class="b">
        <button type="button"
          class="a"
          :class="{addBillnoClick:isCanAdd}"
          :disabled="isCanAdd"
          @click="order"
          id="addBill">
          <!-- 国际化：加单 -->
            <strong>{{$t('Dict.Btn.AddBill')}}</strong>
            <span>（+）</span>
        </button>
        <button type="button"
          v-if="posBaseInfo.controlMode !=2"
          class="o"
          @click="prepay"
          id="payOrder">
          <!-- 国际化：结算 -->
            <strong>{{$t('Dict.Btn.Settlement')}}</strong>
            <span>（ * ）</span>
        </button>
        <button
          type="button"
          v-if="posBaseInfo.controlMode ==2"
          class="o"
          @click="checkNoWeight"
          id="discountedKnot">
          <!-- 国际化：打折预结 -->
            <strong>{{$t('Dict.Btn.DiscountSettlement')}}</strong>
            <span>（ * ）</span>
        </button>
      </div>
    </template>
    <DiscountedKnot ref="DiscountedKnot" v-if="posOrderBill"></DiscountedKnot>
    <UnPaylock ref="unPaylock"></UnPaylock>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { find, isEmpty } from 'lodash';
import ajax from '@/common/js/ajax';
import DiscountedKnot from './DiscountedKnot';
import checkSystemTime from '@/common/js/checkSystemTime';
// 结算手动解锁
const UnPaylock = () => import('./BillBtnsFunc/UnPaylock');
export default {
  components: {
    DiscountedKnot,
    UnPaylock,
  },
  data() {
    return {
      scIdStr: '',
      settleType: 2, // 是否全部结算
      isCanAdd: false, // 加单按钮是否能点击默认可点
      addOrderSum: 0,
    };
  },
  props: {
    ordering: {
      type: Boolean,
      default: false,
    },
    lastTotal: {
      type: Number,
      default: 0,
    },
    originalTotal: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    ...mapGetters(['getCustomListBtn', 'posOrderBill', 'posBaseInfo', 'posDevice', 'getVuexPointData', 'getMultisettleArr', 'posInfo', 'allPosModule', 'getIsbatchOperation', 'orderBillSum', 'posSettings']),
  },
  created() {
    this.$vonce('control_addorder', (pointId, orderId, addBillData) => { // addBillData 开台数据
      // 自助餐-【开台后，自动加单提交，并打开结算页面】开关如果打开,加单并结算
      if (addBillData && addBillData.autoOpenSettlePage) {
        this.check(addBillData.pointId, this.posOrderBill.bsData.is_team);
        return;
      }
      this.order(pointId, orderId); // 跳转到加单界面
    });
    // 多次结算有很大问题待沟通完善
    this.$von('selectItemScIdStrBus', (data) => {
      this.scIdStr = data.scIdStr;
      this.settleType = data.settleType;
    });
    this.$von('noAddBus', (data) => {
      // 加单按钮是否可以点击
      this.isCanAdd = data;
      this.$emit('isCanAddbtn', data);
    });
    this.$vonce('getitemsNumberSum', (sum) => {
      this.addOrderSum = sum;
    });
  },
  methods: {
    // 账单显示的合计金额的字体，由于存在百万级数值，做字体缩小处理
    itemIncomeTotalZoomFont(price) {
      if (price && (`${price}`).length >= 9) {
        return 'padding-left: 0; font-size: 15px';
      }
      return '';
    },
    order(pointId, orderId) {
      if (!this.posOrderBill) return;
      this.$router.push({
        name: 'ordering',
        path: `/pos/order/${this.posOrderBill.bsData.pointId}`,
        params: {
          tableId: this.posOrderBill.bsData.pointId,
          bookingData: { orderId },
        },
      });
      this.$emit('clearGuestList'); // 清空已加的品项
      if (this.posDevice.enableVice && this.$route.name === 'ordering') {
        this.$devices.SubMonitor.send({
          moduleName: 'SubMonitor',
          method: 'ordering',
          result: 'order',
        });
      }
    },
    prepay() {
      // 打开结算页面强制性关闭客位搜索处的虚拟键盘
      this.$vemit('closeKeyboardPayPageBus');
      // 后台校验系统时间，失败跳到登录页
      checkSystemTime().then(() => {
        this.verfiyUnservedDishBeforeSubmit();
      });
    },
    // 结算前验证是否有未上菜品
    verfiyUnservedDishBeforeSubmit() {
      ajax('canyin.pos.serving.servecheck', { params: { teamBsIdsStr: this.getVuexPointData.bsId } })
        .then(() => {
          this.pay();
        })
        .catch(() => {
          this.$confirm(this.$t('Biz.Order.LongMsg023'), this.$t('Dict.Tips'), {
            confirmButtonText: this.$t('Dict.Sure'),
            cancelButtonText: this.$t('Dict.Cancel'),
            type: 'warning',
          }).then(() => {
            this.pay();
          }).catch(() => false);
        });
    },
    // 得到优惠类型和结算方式数据  pointId当前的客位, isTeamBill 是否是团队客位
    getDiscPlanAndPayWay(Id, isTeam) {
      return new Promise((resolve) => {
        ajax('canyin.pos.settlement.settle.getdiscplanandpayway', { params: {
          pointId: Id,
          isTeamBill: isTeam,
          controlMode: this.posBaseInfo.controlMode }
        }).then((data) => resolve(data));
      });
    },
    // 结算前校验 公用方法提出来
    async check(pointId, isTeam, scIdStr = '', settleType) {
      const discPlanAndPayWayData = await this.getDiscPlanAndPayWay(pointId, isTeam);
      ajax('canyin.pos.settlement.settlecheck', {
        params: {
          pointId,
          scIdStr,
          // isCheckItemMustAdd: this.isCheckItemMustAdd,
          isCheckItemMustAdd: 0, // 校验结算前必点品项和人数(0-校验,1-不校验) 目前写死0
        },
      }).then((data) => {
        const { lockState } = data;
        // 优先校验 必点品项(开启且含有必点品项,则校验品项和人数)
        if (!isEmpty(data.itemMustAdd)) {
          this.$confirm(data.itemMustAdd, this.$t('Dict.Tips'), {
            closeOnClickModal: false,
            closeOnPressEscape: false,
            type: 'warning',
          }).then(() => {
            if (discPlanAndPayWayData) {
              this.$vemit('pay', {
                pointId,
                scIdStr,
                lockState,
                settleType,
                discPlanAndPayWayData,
              });
            }
          })
        }
        // 校验折扣和结算信息,不校验必点品项,进入结算页面
        if (discPlanAndPayWayData
          && isEmpty(data.itemMustAdd)
        ) {
          this.$vemit('pay', {
            pointId,
            lockState,
            /* discPlanAndPayWayData 内含所有折扣和结算信息: 所有的折扣和优惠,内含组装的所有分组内的打折方案
              ## 所有的结算,另一个集合为所有分组内的结算方式 */
            discPlanAndPayWayData,
            scIdStr,
            settleType,
          });
        }
      }).catch((errCode, msg) => {
        if (errCode === '416') {
          const showWarnText = this.$t('Biz.Order.LongMsg025');
          this.$confirm(showWarnText, {
            confirmButtonText: this.$t('Dict.Sure'),
            cancelButtonText: this.$t('Dict.Cancel'),
            showCancelButton: true, // 是否显示取消按钮
            type: 'warning',
            showClose: true, // 是否显示关闭按钮
            closeOnClickModal: true, // 点击遮罩是否关闭
            closeOnPressEscape: false, // esc是否关闭
          }).then(() => {
            this.$refs.unPaylock.open({
              pointId,
              msg,
            });
          });
        } else {
          this.$message.error(msg);
        }
      });
    },
    pay() {
      // 如果有未称重品项 弹出称重确认弹框
      let confirmWeightItem = false;
      let scListArr = this.posOrderBill.scList;
      if (this.posInfo.hasMultiSettle) {
        if (this.getMultisettleArr.length) {
          scListArr = this.getMultisettleArr;
        }
      } else {
        scListArr = this.posOrderBill.scList;
      }
      confirmWeightItem = find(scListArr, { confirmWeighType: 1 });
      if (confirmWeightItem) {
        this.$vemit('openConfirmWeight');
        return;
      }
      if (!this.getMultisettleArr.length && this.getIsbatchOperation) {
        this.$message.error(this.$t('Biz.Order.LongMsg024'));
        return;
      }
      // 结算前校验
      this.check(this.posOrderBill.bsData.pointId, this.posOrderBill.bsData.is_team, this.scIdStr, this.settleType);
    },
    back() {
      this.$router.push('/pos/order');
      // 点击客位的时候更新客显
      this.$devices.CDI.price(this.posOrderBill.bsData.itemIncomeTotal);
    },
    add() {
      if (this.lastTotal + this.posOrderBill.bsData.lastTotal < 0) {
        this.$message.error(this.$t('Biz.Order.LongMsg026'));
      } else if (
        this.posSettings.submitDoodConstraintSelectWaiter
        && this.addOrderSum > 0
      ) { // 后台设置 加单强制选择点菜员
        this.$vemit('forceSelectWaiter');
      } else {
        this.$vemit('clearSearch');
        this.$vemit('submitAddOrderBtnEvent');
      }
    },
    // 检查是否存在未称重品项
    checkNoWeight() {
      if (this.posSettings.noWeighingItemAllowDiscountPrejunction) {
        const confirmWeightItem = find(this.posOrderBill.scList, { confirmWeighType: 1 });
        if (confirmWeightItem) {
          this.$confirm(this.$t('Biz.Order.LongMsg027'), this.$t('Dict.Tips'), {
            confirmButtonText: this.$t('Dict.Sure'),
            cancelButtonText: this.$t('Dict.Cancel'),
            type: 'warning',
          }).then(() => {
            this.discountedKnot();
          });
        } else {
          this.discountedKnot();
        }
      } else {
        this.discountedKnot();
      }
    },
    discountedKnot() {
      // 预结前校验
      ajax('canyin.pos.inputBillSaleandPrint.checkPointExistssc', {
        params: {
          pointId: this.posOrderBill.bsData.pointId,
        },
      }).then(() => {
        const { pointId } = this.posOrderBill.bsData;
        ajax('canyin.pos.inputBillSaleandPrint.view', {
          params: {
            pointId: this.posOrderBill.bsData.pointId,
          },
        }).then((data) => {
          this.$refs.DiscountedKnot.open({
            pointId,
            hasCheckBillAuthMsg: data.hasCheckBillAuthMsg,
            hasUndoPayBillAthMsg: data.hasUndoPayBillAthMsg,
          });
        }).catch((errCode, msg) => {
          this.$message.error(msg);
        });
      }).catch((errCode, msg) => {
        this.$message.error(msg);
      });
    },
  },
  watch: {
    // this.ordering 这个不知道谁写的看着语义是加单。我想要的是存于加单页面所以添加个 this.$route.name === 'ordering'
    lastTotal: {
      immediate: true,
      handler(newValue) {
        if (this.ordering && this.posDevice.enableVice && this.$route.name === 'ordering') {
          this.$devices.SubMonitor.send({
            moduleName: 'SubMonitor',
            method: 'upDataPriceOrdering',
            result: {
              lastTotal: newValue,
              originalTotal: this.originalTotal,
            },
          });
        }
      },
      deep: true,
    },
    originalTotal: {
      immediate: true,
      handler(newValue) {
        if (this.ordering && this.posDevice.enableVice && this.$route.name === 'ordering') {
          this.$devices.SubMonitor.send({
            moduleName: 'SubMonitor',
            method: 'upDataOriginalOrdering',
            result: newValue,
          });
        }
      },
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

@pos-order-bill-control-box-shadow: 0 -2px 2px rgba(178, 179, 188, 0.75);
@pos-order-bill-control-info-width: 118px;
@pos-order-bill-control-info-padding-left: 12px;
@pos-order-bill-control-info-border-color: #dddce2;
@pos-order-bill-control-info-title-height: 26px;
@pos-order-bill-control-info-title-font-size: 12px;
@pos-order-bill-control-info-text-height: 18px;
@pos-order-bill-control-strong-font-size: 18px;
@pos-order-bill-control-info-amount-text-color: #000;
@pos-order-bill-control-small-font-size: 12px;
@pos-order-bill-control-info-del-text-color: #999;
@pos-order-bill-control-font-left-padding: 4px;

.pos-order-bill-control {
  position: absolute;
  bottom: 0;
  left: 0;
  .size(100%, @pos-order-bill-control-height);
  .box-shadow(@pos-order-bill-control-box-shadow);
  padding-left: @pos-order-bill-control-info-width;
  background-color: @white;

  > .i {
    position: absolute;
    left: 0;
    top: 0;
    .size(@pos-order-bill-control-info-width, @pos-order-bill-control-height);
    padding-left: @pos-order-bill-control-info-padding-left;
    border-right: 1px solid @pos-order-bill-control-info-border-color;

    > h2 {
      height: @pos-order-bill-control-info-title-height;
      line-height: @pos-order-bill-control-info-title-height;
      font-size: @pos-order-bill-control-info-title-font-size;
      overflow: hidden;
      > .sum {
        padding-left: 4px;
      }
    }

    > strong,
    > del {
      display: block;
      height: @pos-order-bill-control-info-text-height;
      line-height: @pos-order-bill-control-info-text-height;
      padding-left: @pos-order-bill-control-font-left-padding;
      overflow: hidden;
    }

    > strong {
      font-size: @pos-order-bill-control-strong-font-size;
      color: @pos-order-bill-control-info-amount-text-color;
      font-weight: normal;
    }

    > del {
      font-size: @pos-order-bill-control-small-font-size;
      color: @pos-order-bill-control-info-del-text-color;
    }
  }

  > .b {
    height: 100%;

    > .a,
    > .o {
      float: left;
      height: 100%;
      border: none;

      > strong,
      > span {
        display: block;
      }

      > strong {
        font-weight: normal;
        font-size: @pos-order-bill-control-strong-font-size;
      }

      > span {
        font-size: @pos-order-bill-control-small-font-size;
      }
    }

    > .a {
      width: 40%;
      background-color: @white;
      color: @brand-primary;
    }
    > .addBillnoClick {
      cursor:not-allowed;
    }

    > .o {
      width: 60%;
      background-color: @brand-primary;
      color: @white;
    }
  }
}

.lang-enUS {
  .pos-order-bill-control > .b > .a {
    width: 55%;
  }
  .pos-order-bill-control > .b > .o {
    width: 45%;
  }
  .pos-order-bill-control > .b > .a > strong, .pos-order-bill-control > .b > .o > strong {
    font-size: 14px;
  }
}
</style>
