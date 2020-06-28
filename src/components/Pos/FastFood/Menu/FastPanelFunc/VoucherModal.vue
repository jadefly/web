<template>
  <Dialog
    name="PosDialog.VoucherModal"
    :title="payWayInfo.name"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :hotkeys="VoucherModal"
    :append-to-body="true"
    :showSubmit="true"
    width="602px"
  >
  <div class="content payway-voucher-modal">
    <div class="form">
      <div class="money-item">
        <!--提示- 券面值： -->
        <label class="item-title">{{ $t('Biz.Coupon.CouponFaceValue') }}</label>
        <div class="item-content">
          {{ticketValue | keepTwo}}
        </div>
      </div>
      <div class="money-item">
        <!-- 张数： -->
        <label class="item-title">{{ $t('Biz.Settlement.NumberOfSheets') }}</label>
        <div class="item-content">
          <div class="count-item" :class="{'disable':countNum < 1}" @click="subCount">-</div>
          <input
            type="text"
            class="count-item count-num"
            v-num-keyboard:bottom
            v-model="countNum"
            v-judge
            v-autotest
          >
          <div class="count-item"  @click="addCount">+</div>
        </div>
      </div>
      <div class="remark-item">
        <label class="item-title">{{ $t('Dict.Remarkss') }}</label>
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
        <!-- 待付金额： -->
        <span class="title">{{ $t('Biz.Settlement.AmountToPaid') }}</span>
        <span class="line-through">
          <span class="money">{{amountToBePaid | keepTwo}}</span>
        </span>
      </div>
      <div class="voucher-info">
        <div class="voucher-item" v-if="ticketUseData">
          <!-- 可支付金额： -->
          <span class="title">{{ $t('Biz.Settlement.AmountPayable') }}</span>
          <span class="money danger">{{usePrice | keepTwo}}</span>
        </div>
        <div class="voucher-item" v-if="ticketUseData">
          <!-- 可使用张数： -->
          <span class="title">{{ $t('Biz.Settlement.CanUserSheets') }}</span>
          <span class="money danger">{{useNum | keepTwo}}</span>
        </div>
        <div class="voucher-item">
          <!-- 已支付金额： -->
          <span class="title">{{ $t('Biz.Settlement.AmountPaid') }}</span>
          <span class="money danger">{{couponPaymentAmount | keepTwo }}</span>
        </div>
        <div class="voucher-item">
          <!-- 已使用张数： -->
          <span class="title">{{ $t('Biz.Settlement.UsedSheets') }}</span>
          <span class="money">{{countNum}}</span>
        </div>
        <div class="voucher-item">
          <!-- 不找零金额： -->
          <span class="title">{{ $t('Biz.Settlement.NoChangeAmount') }}</span>
          <span class="money">{{noChangeAmount | keepTwo}}</span>
        </div>
      </div>
    </div>
  </div>
  </Dialog>
</template>

<script>
import { isNaN } from 'lodash';
import { mapGetters } from 'vuex';
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
    // // 待付金额
    // amountToBePaid: {
    //   default: 0
    // },
    // 已付金额
    amountPaid: {
      default: 0,
    },
    // 是否快餐模式下
    isBillWin: {
      default: true,
    },
  },
  filters: {
    keepTwo(val) {
      return numberformat(val);
    },
  },
  data() {
    return {
      payWayInfo: {
        name: this.$t('Biz.Coupon.CashCoupon'), // 代金券
      },
      countNum: 0,
      remark: '',
      ticketValue: 0, // 券面值
      usePrice: 0, // 可支付金额
      lastSubtotal: 0, // 券可支付金额
      useNum: 0, // 可使用张数
      ticketUseData: null, // 是否有后台返回券设置数据 同时确定是否显示可支付金额和可使用张数
      ticketRule: true, // 根据是否满足券使用规则,来决定是否可以添加代金券结算方式
      errorMessage: '',
      payway: null,
      amountToBePaid: 0, // 待付金额
    };
  },
  computed: {
    ...mapGetters(['getFastFoodBillData']),
    // 快捷键 确认
    VoucherModal() {
      return {
        // 确认
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
    // 券支付金额
    couponPaymentAmount() {
      let money = MathUtil.multi(Number(this.ticketValue), this.countNum);
      // 如果输入的券金额大于可使用金额,让已支付金额等于可使用金额
      if (this.ticketUseData) {
        if (money > this.usePrice) {
          money = this.usePrice;
        }
      }
      return money;
    },
    // 券实际输入钱数
    couponPaymentInputAmout() {
      const money = MathUtil.multi(Number(this.ticketValue), this.countNum);
      return money;
    },
    // 不找零金额
    noChangeAmount() {
      // 计算不找零金额首先要看当前是否有后台设置的券数据,如果有减去可支付金额没有减待付金额
      let money;
      if (this.ticketUseData) {
        money = MathUtil.sub(this.couponPaymentInputAmout, this.ticketUseData.usePrice);
      } else {
        money = MathUtil.sub(this.couponPaymentInputAmout, this.amountToBePaid);
      }
      // 记录不找零金额
      money = money < 0 ? 0 : money;
      // 仅能超出一张券,即不找零金额不能大于等于券面值
      // if(!this.ticketUseData || this.countNum <= this.useNum) {
      //   this.JudgeNoGiveMoney();
      // }
      return money;
    },
    // 不找零金额
    noGiveMoney() {
      return this.noChangeAmount;
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
      // 快餐-快速按钮-代金券:不能使用小类限定券,所以该判断不会进入,但保留逻辑以防扩展业务
      if (this.ticketUseData) { // 后台开启券分类设置
        // 可支付金额
        this.usePrice = this.ticketUseData.usePrice;
        // 可使用张数
        this.useNum = this.ticketUseData.useNum;
        // 如果券实际使用张数大于可使用张数
        if (this.countNum > this.useNum) {
          // 提示--券使用张数超出可使用张数
          this.errorMessage = this.$t('Biz.Settlement.CouponErrorMsg');
          this.$message.error(this.errorMessage);
          this.ticketRule = false;
        } else {
          this.ticketRule = true;
        }
      } else {
      // 使用不限定券时,券数量变化时,判断应付和可使用金额(即数量)逻辑
        this.JudgeNoGiveMoney();
      }
    },
  },
  methods: {
    onOpen() {
      /*
        this.resData - {
          data: {
            paywayInfo: item,
            stayPayMoney: this.resData.stayPayMoney
          }, addVoucher
        }
        * item-代金券列表,所选子项的数据对象
        * stayPayMoney-账单待支付金额
        * addVoucher-回调: 执行添加 账单结算的折扣和优惠方案
      */
      // 简化数据显示
      this.pageData = this.resData.data;
      // 待付金额
      this.amountToBePaid = this.pageData.billData.payMoney;
      // 参数整理
      const params = {
        payway_id: this.pageData.paywayInfo.id,
        bsId: this.getFastFoodBillData.bsData.id,
        teamBsIds: '', // 无团队,传空
        isBillWin: this.isBillWin, // 这是个奇葩字段,有用却没啥用
        paywayListMoney: 0,
        // 当前代金券(不存在已用代金券)
        payway_list: [{
          payway_id: this.pageData.paywayInfo.id,
          ticket_name: this.pageData.paywayInfo.name,
        }],
      };

      ajax('canyin.pos.settlement.pay.tickettypepayway', {
        contentType: 'paramsEncoded',
        data: params,
      }).then((data) => {
        // this.$log.info(`获取到的代金券信息：${JSON.stringify(data)}`);
        this.payway = data.payway;
        this.ticketValue = data.payway.ticketValue;
        this.ticketUseData = data.ticketUseData;
        // 代金券右侧数据初始化
        // 首先判断后台是否开启有关券分类设置(即使用小类限定券)
        // 快餐-快速按钮-代金券:不能使用小类限定券,所以该判断不会进入,但保留逻辑以防扩展业务
        if (this.ticketUseData) { // 后台开启券分类设置
          // 可支付金额
          this.usePrice = this.ticketUseData.usePrice;
          // 可使用张数
          this.useNum = this.ticketUseData.useNum;
          // 可使用数量 >= 1时, 打开页面后 设置默认代金券数量 1
          if (this.useNum >= 1) {
            this.countNum = 1;
          }
        }
        if (this.amountToBePaid > 0) {
          // 不分类的代金券 且 待付金额>0, 打开页面后 设置默认代金券数量 1
          this.countNum = 1;
        }
      });
    },
    onClose() {
      this.cleanData();
    },
    // 选择张数 加 减 业务处理
    subCount() {
      if (this.countNum <= 1) return;
      this.countNum -= 1;
    },
    addCount() {
      this.countNum += 1;
    },
    // 判断选择代金券总金额业务逻辑
    JudgeNoGiveMoney() {
      if (+this.ticketValue !== 0 && this.noGiveMoney >= this.ticketValue) {
        // ticketValue!=0是防止结算页面打开,代金券页面未打开时,该计算属性就会提前执行然后出现不必要提示
        // 提示 -- 不找零金额超出券面值,请重新输入张数
        this.errorMessage = this.$t('Biz.Settlement.CouponErrorMsg01');
        this.$message.error(this.errorMessage);
        this.ticketRule = false;
      } else {
        this.ticketRule = true;
      }
    },
    // 清空重置当前组件数组
    cleanData() {
      this.countNum = 0;
      this.remark = '';
    },
    // 点击提交
    onSubmit(authCode = {}) {
      this.$vonce('authCode', (code) => {
        this.onSubmit(code);
      });
      if (this.countNum === 0) {
        // 提示--券可支付金额为0,无法使用该券,请选择其他结算方式
        this.$message.error(this.$t('Biz.Settlement.CouponErrorMsg02'));
        return false;
      }
      if (!this.ticketRule) {
        this.$message.error(this.errorMessage);
        return false;
      }
      let params = null;
      // 显示找零客显
      // TDevices.cusDisplay.change(0)
      // setTimeout(function() {TDevices.cusDisplay.clear(); }, 2000);
      // 当添加 代金券金额 少于待付金额时, 执行添加折扣和优惠结算方式
      if (this.couponPaymentAmount < this.amountToBePaid) {
        params = {
          name: this.pageData.paywayInfo.name,
          price: this.couponPaymentAmount,
          voucherId: 'voucherId1', // 写死, 做账单添加折后和优惠方案删除时用
          disBgc: '#6acb48', // 写死色值
          ticket_value: this.ticketValue,
          ticket_count: this.countNum,
          no_give_chan: this.noChangeAmount,
          remark: this.remark,
          pay_money: this.couponPaymentAmount,
          dis_name: '',
          payway_id: this.pageData.paywayInfo.id,
          payway_Name: this.pageData.paywayInfo.name,
          payway_type_id: this.pageData.paywayInfo.paywayTypeId,
        };
        this.resData.addVoucher(params);
        this.$log.info(`使用的代金券信息：${JSON.stringify(params)}`);
        // 关闭窗口
        this.cleanData();
        this.close();
      } else {
        // 代金券金额  大于等于 待付金额时, 直接结算
        params = {
          ...authCode,
          point_id: this.getFastFoodBillData.bsData.pointId,
          bsId: this.getFastFoodBillData.bsData.id,
          controlMode: '3', // 收银-1, 录单-2, 快餐-3, 这里写死
          isLog: false,
          items: this.pageData.billData.items,
          orderCodeMode: this.pageData.billData.orderCodeMode,
          orderCode: this.pageData.billData.orderCode,
          peopleQty: this.pageData.billData.peopleQty,
          payMoney: this.pageData.billData.payMoney,
          takeMoney: this.pageData.billData.payMoney,
          lastTotal: this.pageData.billData.payMoney,
          giveMoney: '0',
          giveChange: '0',
          discountPlanId: this.pageData.billData.discountPlanId,
          saleTypeId: this.pageData.billData.saleTypeId,
          paywayId: this.pageData.paywayInfo.id,
          paywayTypeId: this.pageData.paywayInfo.paywayTypeId,
          /* 快餐模式支付是否还有会员卡支付信息
          * 会员卡不能和代金券组合混合结算 所以isCrmMixSettle写死
          * isCrmMixSettle: $("#crminformationDiv").is(":hidden") ? '0' : '1',
          */
          isCrmMixSettle: '0',
          // printData: JSON.stringify(printData),
          ssRemark: this.remark,
          ticketSettleData: JSON.stringify({
            ticket_value: this.ticketValue,
            ticket_count: this.countNum,
            no_give_chan: this.noChangeAmount,
            remark: this.remark,
            pay_money: this.pageData.billData.payMoney,
            dis_name: '',
            payway_id: this.pageData.paywayInfo.id,
            payway_Name: this.pageData.paywayInfo.name,
            payway_type_id: this.pageData.paywayInfo.paywayTypeId,
          }),
        };
        this.$log.info(`使用的代金券信息：${JSON.stringify(params)}`);
        // 执行结算
        ajax('canyin.pos.settlement.cashfastsettle', {
          contentType: 'paramsEncoded',
          data: params,
        }).then((data) => {
          // data.success && this.$message.success('结算成功')
          if (data.success) {
            const fastPanel = this.$parent.$parent.$refs.payAndDiscount;
            this.$message.success(this.$t('Dict.SuccessfulSettlement'));
            if (data.data.bsId != null) {
              fastPanel.printSettle(data.data.bsId);
            }
            if (data.data.bizPrintLeaveTableParamsList) {
              fastPanel.printLeaveTable(data.data.bizPrintLeaveTableParamsList);
            }
            if (!data.data.isReturnPointAndSettle && data.data.bsId != null) {
              fastPanel.printAddBill(data.data.bsId);
            }
            // 清空刷新账单: 参数 this.getPointId()-客位id, give-找零金额
            // 结算成功, 执行账单刷新
            this.$vemit('fastFoodLoadBs', { buffetPointId: this.pageData.billData.buffetPointId, give: 0 });
            // 清除已用代金券数据
            this.$emit('clearTicket');
            // 关闭窗口
            this.cleanData();
            this.close();
          } else {
            this.$message.error(`${data.msg}`);
          }
        });
      }
      return false;
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
