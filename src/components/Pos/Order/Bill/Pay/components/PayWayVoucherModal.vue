<template>
  <Dialog
    name="PosDialog.PayWayVoucherModal"
    :title="payWayInfo.name"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :hotkeys="PayWayVoucherModal"
    :append-to-body="true"
    :showSubmit="true"
    width="602px"
  >
  <div class="content payway-voucher-modal">
    <div class="form">
      <div class="money-item">
        <label class="item-title">{{$t('Biz.Coupon.CouponFaceValue01')}}</label>
        <div class="item-content">
          {{ticketValue | keepTwo}}
        </div>
      </div>
      <div class="money-item">
        <label class="item-title">{{$t('Biz.Settlement.NumberOfSheets')}}</label>
        <div class="item-content">
          <div class="count-item"
            :class="{'disable':countNum < 1}"
            @click="subCount">-</div>
          <input
            type="text"
            class="count-item count-num"
            v-num-keyboard:bottom
            v-model="countNum"
            v-judge
            v-autotest>
          <div class="count-item" @click="addCount">+</div>
        </div>
      </div>
      <div class="remark-item">
        <label class="item-title">{{$t('Dict.Remarkss')}}</label>
        <div>
          <el-input
            v-autotest
            type="textarea"
            v-model="remark"
            :maxlength="80"
            :autosize="{ minRows: 2, maxRows: 4}"
            :placeholder="$t('Dict.EnterSomething')">
          </el-input>
        </div>
      </div>
    </div>
    <div class="info-keybord">
      <div class="money-info">
        <span class="title">{{$t('Biz.Settlement.AmountToPaid01')}}</span>
        <span class="line-through">
          <span class="money">{{amountToBePaid | keepTwo}}</span>
        </span>
      </div>
      <div class="voucher-info">
        <div class="voucher-item" v-if="ticketUseData">
          <span class="title">{{$t('Biz.Settlement.AmountPayable')}}</span>
          <span class="money danger">{{usePrice | keepTwo}}</span>
        </div>
        <div class="voucher-item" v-if="ticketUseData">
          <span class="title">{{$t('Biz.Settlement.CanUserSheets')}}</span>
          <span class="money danger">{{useNum | keepTwo}}</span>
        </div>
        <div class="voucher-item">
          <span class="title">{{$t('Biz.Settlement.AmountPaid')}}</span>
          <span class="money danger">{{couponPaymentAmount | keepTwo }}</span>
        </div>
        <div class="voucher-item">
          <span class="title">{{$t('Biz.Settlement.UsedSheets')}}</span>
          <span class="money">{{countNum}}</span>
        </div>
        <div class="voucher-item">
          <span class="title">{{$t('Biz.Settlement.NoChangeAmount')}}</span>
          <span class="money">{{noChangeAmount | keepTwo}}</span>
        </div>
      </div>
    </div>
  </div>
  </Dialog>
</template>

<script>
import { isNaN } from 'lodash';
import ajax from '@/common/js/ajax';
import * as MathUtil from '@/common/js/math';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import numberformat from '@/common/js/numberformat';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  props: {
    bsData: {
      type: Object,
    },
    // 已付金额
    amountPaid: {
      default: 0,
    },
    // 是否快餐模式下
    isBillWin: {
      default: false,
    },
    // 已加结算方式
    currPayWayList: {
      type: Array,
      default() {
        return [];
      },
    },
  },

  data() {
    return {
      payWayInfo: {
        name: '代金券',
      },
      countNum: 0,
      remark: '',
      ticketValue: false, // 券面值
      usePrice: 0, // 可支付金额
      lastSubtotal: 0, // 券可支付金额
      useNum: 0, // 可使用张数
      ticketUseData: null, // 是否有后台返回券设置数据 同时确定是否显示可支付金额和可使用张数
      noGiveMoney: 0, // 不找零金额
      ticketRule: true, // 根据是否满足券使用规则,来决定是否可以添加代金券结算方式
      errorMessage: '',
      payway: null,
      amountToBePaid: 0, // 待付金额
    };
  },

  computed: {
    // 确认
    PayWayVoucherModal() {
      return {
        // 确认
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
    // 券支付金额
    couponPaymentAmount() {
      const { ticketValue } = this;
      let money = MathUtil.multi(Number(ticketValue), this.countNum);
      // 如果输入的券金额大于可使用金额,让已支付金额等于可使用金额
      if (this.ticketUseData) {
        if (money > this.usePrice) {
          money = this.usePrice;
        }
      }
      // 如果待付金额小于已支付金额默认待付金额
      return Number(money) > Number(this.amountToBePaid) ? Number(this.amountToBePaid) : money;
    },
    // 券实际输入钱数
    couponPaymentInputAmout() {
      const { ticketValue } = this;
      const money = MathUtil.multi(Number(ticketValue), this.countNum);
      return money;
    },
    // 不找零金额
    noChangeAmount() {
      // 计算不找零金额首先要看当前是否有后台设置的券数据,如果有减去可支付金额没有减待付金额
      let money;
      if (this.ticketUseData) {
        // money = MathUtil.sub(this.couponPaymentInputAmout, this.ticketUseData.usePrice);
        money = MathUtil.sub(this.couponPaymentInputAmout, this.couponPaymentAmount);
      } else {
        money = MathUtil.sub(this.couponPaymentInputAmout, this.amountToBePaid);
      }
      // 记录不找零金额
      money = money < 0 ? 0 : money;
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.noGiveMoney = money;
      // 仅能超出一张券,即不找零金额不能大于等于券面值
      if (!this.ticketUseData || this.countNum <= this.useNum) {
        this.JudgeNoGiveMoney();
      }
      return money;
    },
  },

  watch: {
    countNum(val) {
      const number = parseInt(val, 10);
      if (isNaN(number)) {
        this.countNum = '';
      } else if (number < 0) {
        this.countNum = '';
      } else if (number > 999999) {
        this.countNum = 999999;
      } else {
        this.countNum = number;
      }
      // 首先判断后台是否开启有关券分类设置(即使用小类限定券)
      if (this.ticketUseData) { // 后台开启券分类设置
        // 可支付金额
        this.usePrice = this.ticketUseData.usePrice;
        // 可使用张数
        this.useNum = this.ticketUseData.useNum;
        // 如果券实际使用张数大于可使用张数
        if (this.countNum > this.useNum) {
          this.errorMessage = `${this.$t('Biz.Settlement.CouponErrorMsg')}`;
          this.$message.error(this.errorMessage);
          this.ticketRule = false;
        } else {
          this.ticketRule = true;
        }
      }
    },
  },

  methods: {
    subCount() {
      if (this.countNum <= 1) return;
      this.countNum -= 1;
    },
    addCount() {
      this.countNum += 1;
    },
    onOpen() {
      // 每次打开代金券初始化张数
      this.countNum = 0;
      this.remark = '';
      const [first, second] = this.resData;
      this.payWayInfo = first;
      this.amountToBePaid = second;
      const params = {
        payway_id: this.payWayInfo.id,
        bsId: this.bsData.id,
        teamBsIds: this.resData[2], // 团队暂无数据，传空字符串
        isBillWin: this.isBillWin,
        paywayListMoney: Number(this.amountPaid),
        // 已使用和将要使用的代金券类型的结算方式传回后台
        payway_list: [],
      };

      // 1.数据先添加已使用了的代金券
      if (this.currPayWayList.length > 0) {
        this.currPayWayList.forEach((item) => {
          if (item.payway_type_id === '506') {
            params.payway_list.push({
              payway_id: item.payway_id,
              ticket_name: item.name,
              ticket_count: item.ticket_count,
            })
          }
        })
      }
      // 2.再添加当前打开的代金券
      params.payway_list.push({
        payway_id: this.payWayInfo.id,
        ticket_name: this.payWayInfo.name,
      });
      ajax('canyin.pos.settlement.pay.tickettypepayway', {
        contentType: 'paramsEncoded',
        data: params,
      }).then((data) => {
        this.$log.info(`获取到的代金券信息：${JSON.stringify(data)}`);
        this.payway = data.payway;
        this.ticketValue = data.payway.ticketValue;
        this.ticketUseData = data.ticketUseData;
        // 代金券右侧数据初始化
        // 首先判断后台是否开启有关券分类设置(即使用小类限定券)
        if (this.ticketUseData) { // 后台开启券分类设置
          // 可支付金额
          this.usePrice = this.ticketUseData.usePrice;
          // 可使用张数
          this.useNum = this.ticketUseData.useNum;
          // 可使用数量 >= 1时, 打开页面后 设置默认代金券数量 1
          if (this.useNum >= 1) {
            this.countNum = 1;
          }
        } else {
        // 不分类的代金券, 打开页面后 设置默认代金券数量 1
          this.countNum = 1;
        }
      }).catch((errCode, errMsg) => {
        if (errMsg) this.$message.error(errMsg);
        if (!errMsg) this.$message.error(`${this.$t('Biz.Settlement.Error31')}`);
        this.close();
      });
    },
    onClose() {
      // 清空交互数据
      this.countNum = 0;
      this.remark = '';
      this.ticketValue = false;
      this.usePrice = 0;
      this.lastSubtotal = 0;
      this.useNum = 0;
      this.ticketUseData = null;
      this.noGiveMoney = 0;
      this.ticketRule = true;
      this.errorMessage = '';
      this.payway = null;
      this.amountToBePaid = 0;
    },
    JudgeNoGiveMoney() {
      if (+this.ticketValue !== 0 && this.noGiveMoney >= this.ticketValue) {
        // ticketValue!=0是防止结算页面打开,代金券页面未打开时,该计算属性就会提前执行然后出现不必要提示
        this.errorMessage = `${this.$t('Biz.Settlement.CouponErrorMsg01')}`;
        this.$message.error(this.errorMessage);
        this.ticketRule = false;
      } else {
        this.ticketRule = true;
      }
    },

    // 点击提交
    onSubmit() {
      if (+this.countNum === 0) {
        this.$message.error(`${this.$t('Biz.Settlement.CouponErrorMsg02')}`);
        return;
      }
      if (!this.ticketRule) {
        this.$message.error(this.errorMessage);
        return;
      }
      const { couponPaymentAmount, amountToBePaid } = this;
      if (this.ticketValue === false) {
        this.$message.error(`${this.$t('Biz.Settlement.Error32')}`);
        return false;
      }
      const params = {
        name: this.payWayInfo.name,
        payway_id: this.payWayInfo.id,
        payway_type_id: this.payWayInfo.payway_type_id,
        take_money: Number(couponPaymentAmount) < Number(amountToBePaid)
          ? Number(couponPaymentAmount)
          : Number(amountToBePaid),
        is_confirm_delete: this.payWayInfo.isconfirmdelete,
        use_alone: this.payWayInfo.is_use_alone,
        isolpayway: this.payWayInfo.isolpayway,
        ticket_value: this.ticketValue,
        ticket_count: this.countNum,
        no_give_chan: this.noChangeAmount,
        isUseTicketFirst: this.payWayInfo.isUseTicketFirst, // 折扣率代金券特殊标识(鱼酷)
        remark: this.remark,
      };
      this.$emit('add-pay-way', params);
      this.$log.info(`使用的代金券信息：${JSON.stringify(params)}`);
      this.close();
    },
  },
  filters: {
    keepTwo(val) {
      return numberformat(val);
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.content{
  display: table;
  width: 100%;
  >*{
    display: table-cell;
    vertical-align: top;
  }
}
.form{
  width: 356px;
  background-color: @white;
  padding: 16px;
  border-right: 1px solid #ddd;
}
.money-item{
  margin-bottom: 16px;
  display: table;
  width: 100%;
  >*{
    display: table-cell;
  }
}
.count-item{
  display: inline-block;
  line-height: 36px;
  border: 1px solid #999;
  border-radius: 4px;
  font-size: 16px;
  color: #999;
  width: 36px;
  text-align: center;
  font-size: 20px;
  vertical-align: middle;
  cursor: pointer;
  &.count-num{
    font-size: 16px;
    width: 50px;
    cursor: auto;
    color: #333;
  }
  &.disable{
    cursor: not-allowed;
    border-color: #ccc;
    color: #ccc;
  }
}
.item-title{
  font-size: 14px;
  color: #333;
  font-weight: normal;
  width: 58px;
}
.info-keybord{
  background-color: #f5f5f5;
}
.money-info{
  line-height: 60px;
  border-bottom: 1px dashed #b5b5b5;
  padding: 0 16px;
  font-weight: bold;
  font-size: 14px;

  .title{
    color: #333;
  }
  .line-through {
    float: right;
    color: #ffffff;
    text-decoration: line-through;
  }
  .money{
    color: #0babb9;
  }
}
.voucher-info{
  padding: 10px 16px;
  .voucher-item{
    line-height: 36px;
  }
  color: #333;
  .danger{
    color: #f00;
  }
  .title{
    font-size: 14px;
  }
  .money{
    font-size: 16px;
    font-weight: bold;
    float: right;
  }
}
</style>
<style lang="less">
.payway-voucher-modal{
  .text-right{
    .el-input__inner{
      text-align: right;
    }
  }
}
</style>
