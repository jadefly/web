<template>
  <Dialog
    name="PosDialog.CouponDisc"
    :title="name"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :hotkeys="CouponDisc"
    :append-to-body="true"
    :showSubmit="true"
    width="602px"
  >
  <div class="content payway-voucher-modal">
    <div class="form">
      <div class="money-item">
        <label class="item-title">券面值：</label>
        <div class="item-content">
          ¥{{ ticketValue | keepTwo }}
        </div>
      </div>
      <div class="money-item">
        <label class="item-title">张数：</label>
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
        <label class="item-title">备注：</label>
        <div>
          <el-input
            v-autotest
            resize="none"
            type="textarea"
            v-model="remark"
            :maxlength="80"
            :readonly="true"
            :disabled="true"
            :autosize="{ minRows: 2, maxRows: 4}">
          </el-input>
        </div>
      </div>
    </div>
    <div class="info-keybord">
      <div class="money-info">
        <span class="title">可用券金额：</span>
        <span class="line-through">
          <span class="money">{{ amountToBePaid | keepTwo }}</span>
        </span>
      </div>
      <div class="voucher-info">
        <div class="voucher-item">
          <span class="title">已用券金额：</span>
          <span class="money danger">{{ couponPaymentAmount | keepTwo }}</span>
        </div>
        <div class="voucher-item">
          <span class="title">已使用张数：</span>
          <span class="money">{{ countNum }}</span>
        </div>
      </div>
    </div>
  </div>
  </Dialog>
</template>

<script>
import { isNaN } from 'lodash';
import { mapGetters, mapActions } from 'vuex';
import ajax from '@/common/js/ajax';
import * as MathUtil from '@/common/js/math';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import numberformat from '@/common/js/numberformat';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  props: {
    bsId: {
      type: String,
      default: '',
    },
    pointId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      name: '优惠券方案',
      couponDiscInfo: null,
      countNum: 0,
      remark: '',
      ticketValue: 0, // 券面值
      useNum: 0, // 使用张数
      beenUsedNum: 0, // 已使用张数
      beenUsedAmount: 0, // 已使用金额
      errorMessage: '',
      amountToBePaid: 0, // 待付金额
      numRule: false, // 错误张数结果-阻止开关
    };
  },
  computed: {
    // 确认
    CouponDisc() {
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
      // 如果待付金额小于已支付金额默认待付金额
      return Number(money) > Number(this.amountToBePaid) ? Number(this.amountToBePaid) : money;
    },
    // 券实际输入钱数
    couponPaymentInputAmout() {
      const { ticketValue } = this;
      const money = MathUtil.multi(Number(ticketValue), this.countNum);
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
      // 如果券实际使用张数大于可使用张数
      if (this.countNum > this.useNum) {
        this.errorMessage = '券使用张数超出可使用张数';
        this.$message.error(this.errorMessage);
        this.numRule = true;
      } else {
        this.numRule = false;
      }
    },
  },
  methods: {
    onOpen() {
      // title
      this.name = this.resData.data.discountPlan.name;
      // baseInfo
      this.couponDiscInfo = this.resData.data.discountPlan;
      this.remark = this.couponDiscInfo.describe;
      // 优惠券右侧数据初始化-必然执行券分类(满优惠或每满)
      // 代付金额
      this.amountToBePaid = this.couponDiscInfo.disPriceLimit;
      // 券面值
      this.ticketValue = this.couponDiscInfo.ticketValue;
      // 可使用张数
      this.useNum = this.couponDiscInfo.ticketNum;
      // 已使用张数
      this.beenUsedNum = this.couponDiscInfo.useticketNum;
      // 已使用金额
      this.beenUsedAmount = MathUtil.multi(Number(this.ticketValue), this.beenUsedNum);
      // 可使用数量 >= 1 && 已使用张数为0(初始)时, 打开页面后 设置默认优惠券数量 1
      if (this.useNum >= 1
        && this.couponDiscInfo.useticketNum === 0
      ) {
        this.countNum = 1;
      }
      if (this.couponDiscInfo.useticketNum > 0) {
        this.countNum = this.couponDiscInfo.useticketNum;
      }
      this.$vonce('authCode', (code) => {
        this.onSubmit(code);
      });
    },
    onClose() {
      this.zero();
    },
    zero() {
      // 清空交互数据
      this.countNum = 0;
      this.remark = '';
      this.ticketValue = false;
      this.useNum = 0;
      this.errorMessage = '';
      this.amountToBePaid = 0;
      this.numRule = false;
    },
    subCount() {
      if (this.countNum <= 1) return;
      this.countNum -= 1;
    },
    addCount() {
      // 如果券实际使用张数大于可使用张数
      if (this.countNum >= this.useNum) {
        this.errorMessage = '券使用张数超出可使用张数';
        this.$message.error(this.errorMessage);
        this.numRule = true;
        return false;
      }
      this.countNum += 1;
    },
    // 上传优惠类型到Vuex
    setDiscTypeCache(data) {
      this.setSettleDiscType({ list: data });
    },
    ...mapActions([
      'setSettleDiscType',
    ]),
    // 优惠券打折执行
    onSubmit(authData = {}) {
      if (this.numRule) {
        this.$message({
          type: 'error',
          message: '券使用张数超出可使用张数',
          duration: 2000,
        });
        return false;
      }
      const params = {
        bsId: this.bsId,
        pointId: this.pointId,
        disctype: this.resData.discTypeId,
        planid: this.resData.discountId,
        controlMode: this.resData.controlMode,
        useTicketNum: this.countNum,
        useTicketPrice: this.couponPaymentAmount,
        ...authData,
      };
      let url = 'canyin.pos.settlement.scale';
      // 优惠券方案 暂不支持团队业务
      // const { isTeamSettlementFlg, isTeamBill } = this;
      // if (+isTeamSettlementFlg === 1 && +isTeamBill === 1) {
      //   params.teamPointIds = this.baseBs.teamPointIds;
      //   params.teamBsIds = this.baseBs.teamBsIds;
      //   url = 'canyin.pos.settlement.teamscale';
      // }
      ajax(url, {
        contentType: 'paramsEncoded',
        data: params,
      }).then((data) => {
        if (data.success) {
          // 上传优惠类型到VueX
          this.setDiscTypeCache(params);
          this.submit();
          this.$message({
            message: '打折优惠成功',
            type: 'success',
          });
          this.close();
          this.zero();
        } else {
          this.$message({
            message: data.msg,
            type: 'warning',
          });
        }
      }).catch((msgCode, msg) => {
        this.$message({
          message: msg,
          type: 'warning',
        });
        // 判断类型为失效,才执行更新折扣方案数据和关闭当前页面
        if (msgCode === '2') {
          this.close();
          this.$vemit('reGetDiscPlanAndPayWayBUS');
        }
      });
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
