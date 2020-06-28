<template>
  <Dialog
    name="OldPosDialog.Settlement"
    ref="dialog"
    :title="$t('Dict.OrderSettlement')"
    @open="onOpen"
    @close="onClose"
    @submit="submit"
    :showSubmit="true"
    width="370px"
    top="7vh"
    :hotkeys="hotKeySet">
    <div class="takeout-settlement-warpper">
      <div class="paymoney-info">
        <span class="last-total">{{$t('Dict.NetReceipts01')}}<strong>{{ lastTotal }}</strong></span>
        <span class="current-money">{{$t('Dict.Receivables01')}}<strong>{{ currentMoney }}</strong></span>
        <span class="change-money">{{$t('Dict.GiveChange1')}}<strong>{{ changeMoney }}</strong></span>
      </div>
      <div class="paymoney-list">
        <ul>
          <li v-for="(item, index) in selectedPay" :key="item.paywayId" @click="deleteSelectedPay(index)">
            <strong>{{ item.paywayName }}</strong>
            <strong> {{ item.takeMoney }}</strong>
          </li>
        </ul>
      </div>
      <div class="payway-list" v-if="paywayList.length > 0">
        <ul id="takeoutPaywayList">
          <li v-for="item in paywayList" :key="item.id" @click="selectPayway(item)">{{ item.name }}</li>
        </ul>
        <div class="pager">
          <Pager arrowDirection="up-down" pagerId="takeoutPaywayList" :showInfo="true" ref="takeoutPaywayPager"></Pager>
        </div>
      </div>
    </div>
    <PayWayRMBModal
      ref="payWayRMBModal"
      :amount-to-be-paid="resetMoney"
      @add-pay-way="addPayWay"
    ></PayWayRMBModal>
    <PayWayBankModal
      ref="payWayBankModal"
      :amount-to-be-paid="resetMoney"
      @add-pay-way="addPayWay"
    ></PayWayBankModal>
    <PayWayScanModal ref="payWayScanModal" @add-pay-way="addPayWay"></PayWayScanModal>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';
import ajax from '@/common/js/ajax';
import { ERR_OK } from '@/common/api/takeoutConfig';
import { add, sub, round } from '@/common/js/math';

// 结算-人民币
const PayWayRMBModal = (resolve) => {
  import('@/components/Pos/Order/Bill/Pay/components/PayWayRMBModal').then((module) => {
    resolve(module);
  });
};
// 结算-银行卡
const PayWayBankModal = (resolve) => {
  import('@/components/Pos/Order/Bill/Pay/components/PayWayBankModal').then((module) => {
    resolve(module);
  });
};
// 结算-扫码付
const PayWayScanModal = (resolve) => {
  import('@/components/Pos/Order/Bill/Pay/PaymentCode/BuffetScanCode').then((module) => {
    resolve(module);
  });
};

const CASHOROHTER = '501';
const BANKCARD = '502';
const SCANDODE = '507';

export default {
  components: {
    Dialog, Pager, PayWayRMBModal, PayWayBankModal, PayWayScanModal,
  },
  mixins: [DialogMixin],
  props: {
    propOrderId: {
      type: String,
      default: '',
    },
    propOrderItem: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      lastTotal: 0, // 实收
      selectedPay: [], // 已选择的支付类型和金额
      paywayList: [], // 结算方式列表
      paywayListParams: [], // 结算方式提交参数
      cachePayWayData: null, // 当前新添加的结算方式数据
      orderId: '',
      orderItem: '',
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.submit();
        },
        Esc: () => {
          this.close();
        },
      };
    },
    // 收款
    currentMoney() {
      const total = this.selectedPay.reduce((sum, item) => add(sum, Number(item.takeMoney)), 0);
      return round(total);
    },
    // 找零
    changeMoney() {
      return sub(this.currentMoney, Number(this.lastTotal));
    },
    // 待付
    resetMoney() {
      return -this.changeMoney;
    },
  },
  methods: {
    onOpen() {
      this.orderId = this.propOrderId;
      this.orderItem = this.propOrderItem;
      this.getPaywayList();
      this.initPayInfo();
    },
    // 获取结算方式列表
    getPaywayList() {
      ajax('canyin.takeout.takeoutview.querypayway')
        .then((data) => {
          this.paywayList = data.paywayList;
          this.$nextTick(() => {
            this.$refs.takeoutPaywayPager.refresh();
          });
        });
    },
    // 赋值结算信息
    initPayInfo() {
      const { payAmount } = this.orderItem.o2oTakeoutBasePayDTO;
      this.lastTotal = payAmount;
      this.selectedPay = [];
    },
    // 选择结算方式弹窗
    selectPayway(item) {
      // 对金额和结算方式进行校验
      if (this.changeMoney >= 0) {
        this.$message.error(this.$t('Biz.Pos.Takeout.TakeoutMsg066'));
        return;
      }
      const isExist = this.selectedPay.findIndex(
        selectedItem => selectedItem.paywayId === item.id,
      ) >= 0;
      if (isExist) {
        this.$message.error(this.$t('Biz.Pos.Takeout.TakeoutMsg067'));
        return;
      }
      this.openPaywayDialog(item);
    },
    // 扫码付必须是最后一个添加的结算方式
    scanCodeIsLastAdd() {
      // 是否已经添加了扫码付结算方式
      return this.selectedPay.some(item => item.paywayTypeId === '507' && item.id === '37');
    },
    // 打开特定结算方式弹窗
    openPaywayDialog(item) {
      if (this.scanCodeIsLastAdd()) {
        this.$message.warning(this.$t('Biz.Pos.Takeout.TakeoutMsg068'));
        return;
      }
      switch (item.paywayTypeId) {
        case CASHOROHTER:
          this.$refs.payWayRMBModal.open(item);
          break;
        case BANKCARD:
          this.$refs.payWayBankModal.open({ payWay: item });
          break;
        case SCANDODE:
          if (item.id === '37') {
            this.$refs.payWayScanModal.open({
              takeOut: true,
              shouldPayMoney: this.resetMoney,
              depositOrder: null,
              bsCode: this.orderItem.bsCode,
              payWayInfo: item,
            });
          }
          break;
        default:
          this.$refs.payWayRMBModal.open(item);
          break;
      }
    },
    // 添加结算方式
    addPayWay(item) {
      this.cachePayWayData = item;
      const {
        payway_id: paywayId, name: paywayName, take_money: takeMoney,
        payway_type_id: paywayTypeId, autoSubmit, isEnforce,
      } = item;
      let paywayData = {
        paywayId,
        paywayTypeId,
        paywayName,
        takeMoney,
      };
      if (paywayTypeId === BANKCARD) {
        const { card_no: cardNo, type_id: typeId, remark } = item;
        paywayData = Object.assign({}, paywayData, {
          paramsMap: {
            cardNo,
            typeId,
            remark,
          },
        });
      }
      this.selectedPay.push(paywayData);
      if (autoSubmit) { // 线上支付成功后自动提交
        this.$nextTick(() => {
          this.submit(isEnforce);
        });
      }
    },
    // 删除已有结算信息
    deleteSelectedPay(index) {
      this.selectedPay.splice(index, 1);
    },
    // 确认订单结算
    submit(isEnforce) {
      if (+this.changeMoney < 0) {
        this.$message.error(this.$t('Biz.Pos.Takeout.TakeoutMsg069'));
        return;
      }
      const data = {
        orderId: this.orderId,
        paywayList: this.paywayListParams,
        payorderDTO: this.cachePayWayData.payorderDTO,
      };
      if (isEnforce) {
        data.isEnforce = true;
      }
      ajax('canyin.takeout.takeoutorder.confirmarriveforsett', {
        contentType: 'json',
        data,
      }).then(() => {
        this.paywayListParams = [];
        this.selectedPay = [];
        this.$message.success(this.$t('Dict.SuccessfulSettlement'));
        this.$emit('settleDone');
        this.close();
      });
    },
  },
  watch: {
    // 实收生成结算方式参数
    selectedPay(value) {
      let resetTotal = this.lastTotal;
      let payMoney = 0;
      let giveChange = 0;
      this.paywayListParams = value.map((item, index) => {
        const { takeMoney } = item;
        if (takeMoney < resetTotal) {
          resetTotal = sub(resetTotal, takeMoney);
          payMoney = takeMoney;
          giveChange = 0;
        } else {
          payMoney = resetTotal;
          giveChange = sub(takeMoney, resetTotal);
        }
        return {
          ...item,
          payMoney,
          giveChange,
          setOrder: index + 1,
        };
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.takeout-settlement-warpper {
  background-color: white;
  padding: 12px 20px;
  .paymoney-info {
    position: relative;
    padding: 0 0 24px 8px;
    line-height: 1.6;
    .clearfix();

    span {
      font-size: 16px;
    }

    strong {
      padding-left: 12px;
    }

    .last-total {
      display: block;
      font-weight: bold;
      margin-bottom: 6px;
      > strong {
        font-size: 20px;
        font-weight: bold;
        color: #039eac;
      }
    }
    .current-money {
      display: block;
      float: left;
      max-width: 140px;
      .text-overflow();
      > strong {
        font-size: 16px;
        font-weight: bold;
        color: #039eac;
      }
    }
    .change-money {
      display: block;
      position: absolute;
      bottom: 24px;
      left: 160px;
      max-width: 160px;
      .text-overflow();
      > strong {
        font-size: 18px;
        font-weight: bold;
        color: rgb(251, 54, 54);
      }
    }
  }
  .paymoney-list {
    position: relative;
    padding-top: 10px;
    padding-bottom: 10px;
    border-top: 1px dashed #ccc;
    border-bottom: 1px dashed #ccc;
    > ul {
      height: 224px;
      overflow: hidden;
      .clearfix();
      > li {
        float: left;
        width: 158px;
        height: 50px;
        line-height: 50px;
        text-align: center;
        margin: 3px;
        border-radius: 5px;
        color: white;
        background: #6acb48;
        .text-overflow();
        cursor: pointer;
      }
    }
  }
  .payway-list {
    position: relative;
    padding-top: 10px;
    padding-bottom: 10px;
    > ul {
      height: 160px;
      overflow: hidden;
      .clearfix();
      > li {
        float: left;
        width: 100px;
        height: 42px;
        line-height: 42px;
        text-align: center;
        margin: 5px;
        border: 1px solid #ccc;
        border-radius: 4px;
        .text-overflow();
        cursor: pointer;
      }
    }
    > .pager {
      text-align: right;
      margin-top: 10px;
      margin-bottom: 10px;
      padding-right: 20px;
      button {
        background-color: white;
      }
    }
  }
}
</style>
