<template>
  <Dialog
    name="PosDialog.PayWayRMBModal"
    :title="payWayInfo.name"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :hotkeys="PayWayRMBModal"
    :append-to-body="true"
    :showSubmit="true"
    width="690px"
    submitId="payWayRMBSubmit"
  >
  <div class="content payway-rmb-modal">
    <div class="form">
      <div class="money-item">
        <label class="item-title">{{$t('Biz.Settlement.PaymentAmount')}}</label>
        <div class="item-content">
          <el-input
            id="RMBMoneyInput"
            class="text-right"
            v-model="money"
            size="medium"
            :placeholder="$t('Dict.PleaseEnterPayAmount')"
            v-line
            v-judge
            v-keyboard:keyboard="{ autoSelect: true }">
          </el-input>
        </div>
        <span class="money-change">
          <span v-show="changeAmount > 0">
            {{$t('Dict.GiveChange1')}}<span class="danger">{{!isStandardMoney ? standardInfo.name : ''}} {{changeAmount | keepTwo}}</span>
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
        <div class="btn-warp">
          <button
            type="button"
            @click="changeMoney(100)"
            class="btn btn-default">
            100.00
          </button>
        </div>
        <div class="btn-warp">
          <button
            type="button"
            @click="changeMoney(50)"
            class="btn btn-default">
            50.00
          </button>
        </div>
        <div class="btn-warp">
          <button
            type="button"
            @click="changeMoney(20)"
            class="btn btn-default">
            20.00
          </button>
        </div>
        <div class="btn-warp">
          <button
            type="button"
            @click="changeMoney(10)"
            class="btn btn-default">
            10.00
          </button>
        </div>
      </div>
    </div>
    <div class="info-keybord">
      <div class="money-info">
        <span class="title">{{$t('Biz.Settlement.AmountToPaid01')}}</span>
        <span class="line-through">
          <span class="money">{{shouldPayMoney | keepTwo}}</span>
        </span>
        <!--非本位币显示计算后的汇率-->
        <span v-if="isStandardMoney === false" class="international">|{{standardInfo.name}} {{exchangeMoney | keepTwo}}|</span>
      </div>
      <div class="keybord-content">
        <!--非本位币 禁止修改金额-->
        <KeyBoard class="keybord" ref="keyboard"></KeyBoard>
      </div>
    </div>
  </div>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import { isNaN } from 'lodash';
import * as MathUtil from '@/common/js/math';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import numberformat from '@/common/js/numberformat';
import PaymentCalculation from '@/common/js/AIChange';

export default {
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin],
  props: {
    // 待付金额
    amountToBePaid: {
      default: 0,
    },
  },
  data() {
    return {
      payWayInfo: {
        name: '',
      },
      money: 0,
      isStandardMoney: true, // 是否是本位币
      standardInfo: {}, // 本位币信息
      shouldPayMoney: 0, // 待付金额
    };
  },
  filters: {
    keepTwo(val) {
      if (isNaN(Number(val))) return val;
      return numberformat(val);
    },
  },
  computed: {
    ...mapGetters(['setting']),
    // 添加快捷键
    PayWayRMBModal() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
    // 找零金额
    changeAmount() {
      if (isNaN(Number(this.money)) || Number(this.money) < 0) {
        return `${this.$t('Biz.Settlement.PriceWrong')}`;
      }
      let money = -MathUtil.sub(Number(this.shouldPayMoney), Number(this.money));
      if (this.isStandardMoney === false) {
        money = MathUtil.div(money, this.payWayInfo.exchangeRate);
      }
      return money;
    },
    // 计算出来价格列表
    caculationList() {
      const { amountToBePaid } = this;
      if (amountToBePaid <= 0) {
        return [];
      }
      const list = new PaymentCalculation(Number(this.money), 8).output();
      return list.filter(item => item !== 100 && item !== 50 && item !== 20 && item !== 10);
    },
    // 非本位币换算成本位币的金额
    exchangeMoney() {
      return MathUtil.div(this.shouldPayMoney, this.payWayInfo.exchangeRate);
    },
  },
  methods: {
    // 点击按钮修改价钱
    changeMoney(money) {
      this.money = money;
      this.$refs.keyboard.reSelect();
    },
    onOpen() {
      const { payWayInfo, payWayList, paywayInGroupList, fromWhere } = this.resData;
      // 只有从结算界面打开才是本位币功能，这里为了区分其他公用此组件的地方
      if (fromWhere === 'pay') {
        this.payWayInfo = payWayInfo;
        if (this.setting.isInternational) {
          this.isStandardMoney = payWayInfo.isStandardMoney;
        } else {
          this.isStandardMoney = true;
        }
        if (this.isStandardMoney === false) { // 如果不是本位币，那么找到本位币信息
          const findData = (list) => {
            let needData = null;
            if (!list || !Array.isArray(list)) return needData;
            for (let i = 0; i < list.length; i += 1) {
              if (needData) break;
              if (list[i].isGroup && paywayInGroupList[list[i].id]) {
                needData = findData(paywayInGroupList[list[i].id]);
              } else if (list[i].isStandardMoney) {
                needData = list[i];
                break;
              }
            }
            return needData;
          };
          const stander = findData(payWayList);
          if (!stander) {
            this.$confirm('开启了国际化增值但未设置本位币', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
            }).then(() => {
              this.close();
            }).catch(() => {
              this.close();
            });
          } else {
            this.standardInfo = stander;
          }
        }
      } else {
        this.payWayInfo = this.resData;
      }
      console.log('xxxxxxxxxxx', this.standardInfo)
      if (this.standardInfo.name) { // 不是本位币
        // 待付金额由本位币金额转换成非本位币金额  人民币100 -> 越南盾3000
        this.shouldPayMoney = MathUtil.multi(this.amountToBePaid, this.payWayInfo.exchangeRate);
        // 输入框中默认是转换成非本位币的全部待付金额 越南盾3000
        this.money = this.shouldPayMoney = this.shouldPayMoney.toFixed(2);
      } else { // 是本位币
        this.shouldPayMoney = this.amountToBePaid;
        this.money = this.amountToBePaid;
      }
      if (this.$refs.keyboard) {
        this.$refs.keyboard.reSelect();
      }
    },
    onClose() {
      this.money = 0;
      this.isStandardMoney = true; // 是否是本位币
      this.standardInfo = {}; // 本位币信息
      this.shouldPayMoney = 0; // 待付金额
    },
    // 点击提交
    onSubmit() {
      const money = Number(this.money);
      if (isNaN(money)) {
        this.$message.warning(this.$t('Biz.Settlement.Warning16'));
        return;
      }
      if ((money <= 0 || money > 999999.99) && !this.standardInfo.name) {
        this.$message.warning(this.$t('Dict.Validate.NumberRangeMessage', [0, 999999.99]));
        return;
      }
      let allStandardData = null;
      if (this.isStandardMoney === false) {
        allStandardData = {
          name: this.standardInfo.name,
          money: Number((MathUtil.div(this.money, this.payWayInfo.exchangeRate)).toFixed(2)), // 转换成本位币的值
          exchangeRate: this.payWayInfo.exchangeRate,
          foreignCurrencyMoney: this.money, // 输入框中的值
        };
      }
      this.$emit('add-pay-way', {
        name: this.payWayInfo.name,
        payway_id: this.payWayInfo.id,
        payway_type_id: this.payWayInfo.payway_type_id
          ? this.payWayInfo.payway_type_id
          : this.payWayInfo.paywayTypeId,
        take_money: allStandardData ? allStandardData.money : Number(this.money),
        is_confirm_delete: this.payWayInfo.isconfirmdelete,
        use_alone: this.payWayInfo.is_use_alone,
        isolpayway: this.payWayInfo.isolpayway,
        allStandardData, // 本位币信息 修改结算方式显示的样式
      });
      this.money = 0;
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
  position: relative;
  line-height: 60px;
  border-bottom: 1px dashed #b5b5b5;
  padding: 0 16px;
  font-weight: bold;
  font-size: 14px;

  .title{
    color: #333;
  }
  .line-through{
    float: right;
    color: #ffffff;
    text-decoration: line-through;
  }
  .money{
    color: #0babb9;
  }
  .international {
    position: absolute;
    right: 30px;
    bottom: -18px;
    color: #666666;
    font-size: 12px;
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
