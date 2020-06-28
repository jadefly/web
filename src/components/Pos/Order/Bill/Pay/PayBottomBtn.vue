<template>
  <div class="pay-bottom-btn">
    <ul class="pay-bot-btns df liW" id="payBottomBtn">
      <li
        v-for="(item,index) in payBtns"
        @click="clickHandler(item)"
        :key="index"
        :id="item"
        class="btns"
        :class="{fastbtns:getControlMode()}">
        <button
          :class="{'btn-name':true}"
          :disabled="addPayAuthority(item) || getBtnIsEnable(item) || wipeBtnOperable(item)"
          >{{ getBtnName(item) }}</button>
        <button
          class="btn-money"
          :disabled="addPayAuthority(item) || getBtnIsEnable(item) || wipeBtnOperable(item)"
          v-if="getBtnInfo(item)!=''">{{getBtnInfo(item)}}</button>
        <button
          class="btn-money"
          :disabled="addPayAuthority(item) || getBtnIsEnable(item) || wipeBtnOperable(item)"
          v-else>{{ getBtnHotKeyName(item)}}</button>
      </li>

    </ul>
  </div>
</template>

<script>
import { find, take } from 'lodash';
import { mapGetters } from 'vuex';
import * as tableState from '@/common/dictionary/pos-order-table-state';
import btnOptions from '@/common/dictionary/pos-order-btnoptions';

const allBtns = {
  押金: 'payDesposit',
  线上支付查询: 'payOnlinePayment',
  结算备注: 'paySettlementNote',
  开发票: 'payDrawInvoice',
  开钱箱: 'payMoneyBox',
  现金等额: 'payCashEquivalents',
  预结单打印: 'payPreformPrint',
  '埋单/撤销埋单': 'payPayBill',
  服务费: 'payServiceCharge',
  最低消费补齐: 'payMinimumConsumption',
  预付: 'payPayAdvance',
  提现: 'payWithdrawDeposit',
  群光积分: 'payGroupLightIntegral',
  '执行抹零/取消抹零': 'wipeOpration',
  // 导游提成: 'billedTourGuideFee', // 已结账单里已经有导游提成了，这里还有必要加么
};
const fastFoodBtns = ['payOnlinePayment', 'paySettlementNote', 'payDrawInvoice', 'payMoneyBox', 'payCashEquivalents', 'payGroupLightIntegral', 'cancelWipe'];

export default {
  props: [
    'bsData',
    'billData',
    'buffetDataForSettle',
    'invoicesOpened',
    'depositMoney',
    'isTeamBill',
    'wipeState'
  ],
  data() {
    return {
      // basePayBtns: [
      //   'payMinimumConsumption', // 最低消费
      //   'payPayAdvance', // 预付
      //   'payDesposit', // 押金
      //   'payOnlinePayment', // 线上支付查询
      //   'paySettlementNote', // 结算备注
      //   'payDrawInvoice', // 开发票
      //   'payMoneyBox', // 开钱箱
      //   'payCashEquivalents', // 现金等额
      //   'payPreformPrint', // 预结单打印
      //   'payPayBill', // 埋单
      //   'payServiceCharge', // 服务费
      // ],
      basePayBtns: [],
      tmpArr: [],
      payBtnFunctions: [],
      controlMode: null,
      openBuffetDeposit: false,
    };
  },
  computed: {
    ...mapGetters(['posInfo', 'CUSTOM_BUTTONS', 'allPosModuleOper', 'ALL_POS_MODULE', 'posOrderBill', 'posSettings', 'getFastFoodBillData']),
    payBtns() {
      if (!this.payBtnFunctions.length) {
        this.payBtnFunctions = [...this.basePayBtns];
      }
      // 开启自助押金模块后 不显示押金按钮
      let tmpArr = [...this.payBtnFunctions];
      if (this.openBuffetDeposit) {
        tmpArr = tmpArr.filter(item =>
          item !== 'payDesposit'
          && item !== 'payMinimumConsumption'
          // && item !== 'payServiceCharge'
        );
      }
      this.isPayAdvance(tmpArr);
      return this.isPayBill(tmpArr);
    },
  },
  created() {
    this.initShowBuffetDeposit();
    this.initAllBtns();
  },
  methods: {
    // 自助押金模块是否显示(后台是否开启了自助押金模块)
    initShowBuffetDeposit() {
      // this.ALL_POS_MODULE.map((item) => {
      //   if ((+item.id === 1252 || item.text === '押金管理') && item.checked) {
      //     this.openBuffetDeposit = true;
      //   }
      //   return item;
      // });
      this.openBuffetDeposit = this.posSettings.isOpenBuffetDeposit;
    },
    initAllBtns() {
      const { settleMenu } = this.CUSTOM_BUTTONS;
      const tmpArr = [];
      settleMenu.forEach((item) => {
        if (item.text === '导游提成' || item.btn_name === 'billedTourGuideFee') return; // 结算更多操作里不需要导游提成
        if (item.btn_name) {
          tmpArr.push(item.btn_name);
        } else if (allBtns[item.text]) {
          tmpArr.push(allBtns[item.text]);
        }
      });
      if (+this.posInfo.controlMode === 3) { // 快餐下固定5个按钮
        this.basePayBtns = fastFoodBtns;
      } else {
        this.basePayBtns = tmpArr;
      }
    },
    // 判断预付或者取消预付
    isPayAdvance(tmpArr) {
      // 以下主要是预付和取消预付的判断
      if (this.billData) {
        const { isPrePayEnable } = this.billData;
        const { point_state } = this.bsData;
        const position1 = this.getArrayIndexOf(tmpArr, 'payPayAdvance');
        const position2 = this.getArrayIndexOf(tmpArr, 'undoPayPayAdvance');
        if (Object.is(+isPrePayEnable, 1)) { // 是否开启了预付模式
          if (position1 > -1 || position2 > -1) { // 首先数组里要有预付或者取消预付
            if (Object.is(+point_state, 6)) { // 如果状态码是6 说明是预付状态(应该是吧)  把text改为取消预付
              if (!Object.is(position1, -1)) {
                tmpArr[position1] = 'undoPayPayAdvance'; // 撤销预付
              }
            } else { // 否则就是取消预付状态 把text改为预付
              if (!Object.is(position2, -1)) {
                tmpArr[position2] = 'payPayAdvance'; // 预付
              }
            }
          }
        }
      }
    },
    // 判断埋单或者取消埋单
    isPayBill(tmpArr) {
      const pointState = this.bsData.point_state; // 接口返回 bsData是流水数据 point_state 3为埋单
      if (pointState === 3) {
        const position = this.getArrayIndexOf(tmpArr, 'payPayBill'); // 埋单
        if (!Object.is(position, -1)) {
          tmpArr[position] = 'undoPayPayBill'; // 撤销埋单
        }
      } else if (pointState === 2) {
        const position = this.getArrayIndexOf(tmpArr, 'undoPayPayBill'); // 埋单
        if (!Object.is(position, -1)) {
          tmpArr[position] = 'payPayBill'; // 撤销埋单
        }
      }
      // 如果数组长度大于9 就显示更多按钮，小于9就不显示，这里判断如果数组长度大于9，就在index=8处插入payMore
      if (tmpArr.length > 9 && tmpArr.indexOf('payMore') < 0) {
        tmpArr.splice(8, 0, 'payMore');
      }
      this.payBtnFunctions = tmpArr;
      return take(this.payBtnFunctions, 9);
    },
    findBtn(name) {
      const finded = find(btnOptions(), { name });
      if (finded) {
        return finded;
      }
      return {
        text: `${this.$t('Biz.Settlement.UnKnow')}`,
        method: null,
      };
    },
    clickHandler(item) {
      // 按钮是否可点击
      if (this.addPayAuthority(item) || this.getBtnIsEnable(item)) return;
      const { method, isNeedDialog } = this.findBtn(item);
      if (method) {
        if (isNeedDialog === 0) {
          this.$emit('payNoDialogFunction', this.findBtn(item));
        } else {
          this.$emit('payFunction', this.findBtn(item).method);
        }
      }
    },
    getBtnName(name) {
      const { text } = this.findBtn(name);
      const result = text.match(/\(([^)]*)\)/);
      if (result) {
        const arr = text.split('(');
        return arr[0];
      }
      /**
       * 结算页面底部功能按钮之'执行抹零/取消抹零'的内容和执行
       * 1.根据账单接口返回当前抹零执行状态, 设置显示相应的抹零按钮的文字内容
       * 2.判断中餐或快餐业务,中餐走按钮自定义逻辑,快餐底部按钮写死且不会有'更多结算'按钮
       * ## 即不存在9+N按钮组合
       * 3.结算成功到刷账单成功期间,'posOrderBill/getFastFoodBillData'被置空,
       * ## 此时响应数据(vuex)会报错,所以进行判断过滤
       * 4.中餐快餐有却别,wipeFlg在中餐总会存在,快餐是预先开台未知状态所以wipeFlg会有不存在的时候,
       * ## 此时, 快餐无pointbsinfo接口无wipeFlg字段时,视为执行抹零(即默认)
       */
      if (this.posInfo.controlMode !== '3'
        && name === 'cancelWipe'
        && this.posOrderBill
      ) {
        return this.posOrderBill.bsData.wipeFlg ? `${this.$t('Dict.Btn.CancelWipe')}` : `${this.$t('Dict.Btn.DoWipe')}`;
      }
      if (this.posInfo.controlMode === '3'
        && name === 'cancelWipe'
        && this.getFastFoodBillData
      ) {
        return this.getFastFoodBillData.bsData.wipeFlg === false ? `${this.$t('Dict.Btn.DoWipe')}` : `${this.$t('Dict.Btn.CancelWipe')}`;
      }

      // 早前版本代码,注释,不再使用
      // if (name === 'cancelWipe' && this.posOrderBill) {
      //   return this.posOrderBill.bsData.wipeFlg ? '取消抹零' : '执行抹零';
      // }
      return text;
    },
    getBtnHotKeyName(name) {
      return this.findBtn(name).tipHotkeys;
    },
    getControlMode() {
      return +this.posInfo.controlMode === 3;
    },
    getBtnInfo(name) {
      let showInfo;
      if (name === 'payDesposit') {
        const showDeposit = this.depositMoney;
        showInfo = `[${showDeposit}]`;
      } else if (name === 'payDrawInvoice') {
        const { invoicesOpened } = this;
        showInfo = `[${invoicesOpened}]`;
      } else {
        showInfo = '';
      }
      return showInfo;
    },
    getArrayIndexOf(arr, name) {
      let indexOf = -1;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === name) {
          indexOf = i;
          break;
        }
      }
      return indexOf;
    },
    // 添加结算二级权限
    addPayAuthority(item) {
      if (this.allPosModuleOper) {
        const { id } = this.findBtn(item);
        const payAuthorityId = '182';
        const payAuthList = this.allPosModuleOper[payAuthorityId];
        if (payAuthList && payAuthList.children.length > 0) {
          const auth = find(payAuthList.children, { id });
          if (auth && !auth.checked) {
            return true;
          }
        }
      }
      return false;
    },
    getBtnIsEnable(item) {
      const pointState = this.bsData.point_state; // 接口返回 bsData是流水数据 point_state 3为埋单
      const { hasMultiSettle } = this.posInfo;
      const { settleType, billData } = this;
      const { isWithdrawCashEnable, isPrePayEnable } = billData;
      if (this.isTeamBill === 1) { // 如果是团队 禁用服务费和最低消费补齐
        if (item === 'payMinimumConsumption') {
          return true;
        }
      }
      // 如果开启自助 且 使用了自助押金, 不可使用埋单(但是可以撤销埋单)
      if (this.openBuffetDeposit
        && this.buffetDataForSettle.buffetDeposit
        && Object.is(item, 'payPayBill')
      ) {
        return true;
      }
      if (hasMultiSettle) { // 是多次结算
        if ( // 押金，服务费，最低消费，预付，提现，更多按钮禁止点击
          Object.is(item, 'payDesposit')
          || Object.is(item, 'payServiceCharge')
          || Object.is(item, 'payMinimumConsumption')
          || Object.is(item, 'payPayAdvance')
          || Object.is(item, 'undoPayPayAdvance')
          || Object.is(item, 'payWithdrawDeposit')
        ) {
          return true;
        }
        if ( // 预结单打印,埋单
          Object.is(item, 'payPayBill')
          || Object.is(item, 'payPreformPrint')
        ) {
          if (Object.is(settleType, 1)) { // 当前如果为部分品相结算不允许埋单
            return true;
          }
          if (Object.is(settleType, 2)) { // 全部结算允许埋单 埋单状态下才允许预结单打印
            if (Object.is(item, 'payPreformPrint')) {
              return !(+pointState === 3);
            }
            return false;
          }
        } else { // 其他按钮正常使用
          return false;
        }
      } else { // 不是多次结算
        // 是否开启了预付功能
        if ((Object.is(item, 'payPayAdvance') || Object.is(item, 'undoPayPayAdvance')) && Object.is(+isPrePayEnable, 0)) {
          return true;
        }
        if (Object.is(item, 'payPreformPrint')) { // 如果是预结打印单，埋单后可以点，撤销埋单后不能点
          if (Object.is(pointState, 3)) { // 撤销埋单
            return false;
          }
          // if (Object.is(pointState, 2)) { // 埋单
          //   return true;
          // }
          return true;
        }
        if (Object.is(pointState, tableState.PRE_PAY) && Object.is(item, 'payDesposit')) { // 如果是预付，押金不能点
          return true;
        }
        if (Object.is(item, 'payWithdrawDeposit')) { // 如果是提现
          return !Object.is(+isWithdrawCashEnable, 1);
        }
        return false;
      }
    },
    // 抹零按钮的可用状态处理
    // eslint-disable-next-line consistent-return
    wipeBtnOperable(item) {
      if (this.allPosModuleOper) {
        const { id } = this.findBtn(item);
        // 抹零按钮后台设置功能可用状态判断
        if (id === '1274'
          && !this.wipeState.operable
        ) {
          return true;
        }
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.df {
  display: flex;
  /*justify-content: space-between;*/
}
.pay-bottom-btn {
  width: 100%;
  height: 50px;
  color: #fff;
  background: #2e383b;
  position: absolute;
  bottom: 0;
  left: 0;
}
.btns,
.moreBtns {
  height: 50px;
  flex: 1;
  text-align: center;
  line-height: 50px;
  background: #3f4d51;
}
.fastbtns {
  width: 17% !important;
}
.btns {
  // width: 12%;
  margin-right: 2px;

  &:last-child {
    margin-right: 0;
  }
  > button {
    background-color: #3f4d51;
    border: none;
    display: block;
    margin: 0 auto;
  }
  > .btn-name {
    width: 100%;
    height: 25px;
    line-height: 25px;
  }
  > .preformPrint {
    cursor: not-allowed;
  }
  > .btn-money {
    width: 100%;
    height: 25px;
    line-height: 25px;
  }
}
.moreBtns {
  width: 60px;
  color: #42bbc6;
}
button[disabled] {
  cursor: not-allowed;
}

.lang-enUS {
  .pay-bottom-btn {
    font-size: 12px;
  }
   .btns > .btn-name {
    line-height: 15px;
  }
}
</style>
