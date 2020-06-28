
<template>
<!-- "CalcSettle": "手工操作", -->
  <Dialog
    name="PosDialog.handDoSettle"
    :title="$t('Dict.Btn.CalcSettle')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :hotkeys="handDoSettle"
    :append-to-body="true"
    :showSubmit="true"
    width="690px"
  >
  <div class="content payway-rmb-modal">
    <div class="form">
      <div class="money-item">
        <label class="item-title">{{$t('Biz.Settlement.PaymentAmount')}}</label>
        <div class="item-content">
          <!-- "EnterPayAmount": "请输入支付金额" -->
          <el-input
            id="RMBMoneyInput"
            class="text-right"
            v-model="pay"
            size="medium"
            :placeholder="$t('Dict.PleaseEnterPayAmount')"
            v-keyboard:keyboard="{ autoSelect: true }"
            v-judge
          ></el-input>
        </div>
        <span class="money-change">
          <!-- "GiveChange1": "找零：" -->
          <span v-show="changeAmount > 0">
            {{ $t('Dict.GiveChange1') }}<span class="danger">{{changeAmount | keepTwo}}</span>
          </span>
        </span>
      </div>
      <div class="money-btnarea">
        <div class="btn-warp" v-for="item in caculationList" :key="item">
          <button
            type="button"
            @click="changeMoney(item)"
            class="btn btn-default calculation-money"
          >{{item | keepTwo}}</button>
        </div>
      </div>
      <div class="money-btnarea">
        <!-- 国际化遗留 货币 -->
        <div class="btn-warp">
          <button type="button" @click="changeMoney(100)" class="btn btn-default">100.00</button>
        </div>
        <div class="btn-warp">
          <button type="button" @click="changeMoney(50)" class="btn btn-default">50.00</button>
        </div>
        <div class="btn-warp">
          <button type="button" @click="changeMoney(20)" class="btn btn-default">20.00</button>
        </div>
        <div class="btn-warp">
          <button type="button" @click="changeMoney(10)" class="btn btn-default">10.00</button>
        </div>
      </div>
    </div>
    <div class="info-keybord">
      <div class="money-info">
        <!-- "AmountToPaid": "待付金额：", -->
        <span class="title">{{ $t('Biz.Settlement.AmountToPaid01') }}</span>
        <span class="line-through">
          <span class="money">{{amountToBePaid | keepTwo}}</span>
        </span>
      </div>
      <div class="keybord-content">
        <KeyBoard class="keybord" ref="keyboard"></KeyBoard>
      </div>
    </div>
  </div>
  </Dialog>
</template>

<script>
import * as MathUtil from '@/common/js/math';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import numberformat from '@/common/js/numberformat';
import PaymentCalculation from '@/common/js/AIChange';

export default {
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin],
  data() {
    return {
      pay: 0, // 收款金额
      amountToBePaid: 0, // 待支付金额
      paidMoney: 0, // 已支付的金额
      lastTotal: 0, // 账单实收
    };
  },
  filters: {
    keepTwo(val) {
      if (isNaN(Number(val))) return val;
      return numberformat(val);
    },
  },
  computed: {
    // 添加快捷键
    handDoSettle() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
    // 找零金额
    changeAmount() {
      if (isNaN(Number(this.pay)) || Number(this.pay) < 0) {
        // "PriceWrong": "价格错误",
        return `${this.$t('Biz.Settlement.PriceWrong')}`;
      }
      return -MathUtil.sub(Number(this.amountToBePaid), Number(this.pay));
    },
    // 计算出来价格列表
    caculationList() {
      const { amountToBePaid } = this;
      if (amountToBePaid <= 0) {
        return [];
      }
      const list = new PaymentCalculation(Number(amountToBePaid), 8).output();
      return list.filter(item => item !== 100 && item !== 50 && item !== 20 && item !== 10);
    },
  },
  methods: {
    // 点击按钮修改价钱
    changeMoney(money) {
      this.pay = money;
      this.$refs.keyboard.reSelect();
    },
    onOpen() {
      // first 待支付金额,second 已支付金额, third 账单实收
      const [first, second, third] = this.resData;
      // 待支付金额
      this.amountToBePaid = Number(first.toFixed(2));
      // 打开页面支付金额默认等于待支付金额
      this.pay = Number(first.toFixed(2));
      // 如果存在已支付的金额(和会员卡混合结算时产生),存储起来
      if (second !== 0) {
        this.paidMoney = second;
      } else { // 如果不存在已支付金额,每次打开页面清除paidMoney,防止上一笔结算产生的缓存
        this.paidMoney = 0;
      }
      // 账单实收
      this.lastTotal = third;
      if (this.$refs.keyboard) {
        this.$refs.keyboard.reSelect();
      }
    },
    // 点击提交
    onSubmit() {
      const money = Number(this.pay);
      if (isNaN(money)) {
        // "Warning16": "请输入正确数字格式",
        this.$message.warning(`${this.$t('Biz.Settlement.Warning16')}`);
        return;
      }
      if (money <= 0 || money > 999999.99) {
        this.$message.warning(this.$t('Dict.Validate.NumberRangeMessage', [0, 999999.99]));
        return;
      }
      // 匹配非负浮点数 只要两位小数
      const reg = /^\d+(\.\d{1,2})?$/;
      if (!reg.test(money)) {
        // "DecimalTips": "最多输入两位小数",
        this.$message.warning(this.$t('Dict.DecimalTips'));
        return;
      }
      // 支付金额小于待支付金额
      if (money < Number(this.amountToBePaid)) {
        // "Error46": "支付金额不足，请输入足够的支付金额后再结算",
        this.$message.error(this.$t('Biz.Settlement.Error46'));
        return;
      }
      this.$log.info(`手工操作输入框输入金额money:${money},已支付金额paidMoney:${this.paidMoney}`);
      // 实际支付金额:paidMoney不为0时是会员卡和手工结算混付,为0手工结算单一支付
      const pay = Number(MathUtil.add(money, this.paidMoney).toFixed(2));
      // 找零金额
      const give = MathUtil.round((pay - this.lastTotal));
      this.$log.info(`手工操作实际支付金额pay:${pay},账单实收lastTotal:${this.lastTotal},找零金额give:${give}`);
      const arg = {
        btnMoney: null,
        pay, // 现支付的money加上已支付的money是总的支付money
        give,
      };
      // 调用手工结算方法
      this.$vemit('cashSettleBus', arg);
      this.close();
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
  width: 428px;
  background-color: @white;
  padding: 16px;
  border-right: 1px solid #ddd;
}
.money-item{
  margin-bottom: 36px;
  display: table;
  width: 100%;
  >*{
    display: table-cell;
  }
}
.item-title{
  font-size: 14px;
  color: #333;
  font-weight: normal;
  width: 88px;
}
.item-content{
  width: 156px;
}
.money-change{
  padding-left: 18px;
}
.danger{
  color: #FE0000;
  font-weight: bold;
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
.money-btnarea{
  margin: 10px -6px 0;
  overflow: hidden;
  .btn-warp{
    padding: 6px;
    float: left;
    width: 25%;
  }
  button{
    font-size: 16px;
    height: 52px;
    width: 100%;
  }
  .calculation-money{
    border-color: #0babb9;
    color: #0babb9;
  }
}
.keybord-content{
  padding: 20px 0;
  .keybord{
    text-align: center;
    margin: 0 auto;
  }
}
</style>
<style lang="less">
.payway-rmb-modal{
  .text-right{
    .el-input__inner{
      text-align: right;
    }
  }
}
</style>
