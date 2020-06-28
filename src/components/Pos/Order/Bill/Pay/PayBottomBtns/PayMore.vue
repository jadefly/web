<template>
  <Dialog
    name="PosDialog.PayMoreHotkey"
    :title="$t('Biz.Settlement.MoreOperation')"
    ref="dialog"
    :hotkeys="PayMoreHotkey"
    :append-to-body="true"
    @close="onClose"
    @open="onOpen">
    <div class="pos-dialog-content">
      <div class="more-table-wrap">
        <ul class="row">
          <li v-for="(item,index) in moreFunctions" class="col-xs-2" :key="index" :id="item">
            <button
              class="btn-money"
              :disabled="getBtnIsEnable(item) || addPayAuthority(item) || wipeBtnOperable(item)"
              @click="clickHandler(item)"
              v-html="finallyFormat(item)">
              <!-- {{ formatName(findBtn(item)) }} -->
            </button>
          </li>
        </ul>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import { find } from 'lodash';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import btnOptions from '@/common/dictionary/pos-order-btnoptions';
import * as tableState from '@/common/dictionary/pos-order-table-state';

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
  '执行抹零/取消抹零': 'wipeOpration',
  // 导游提成: 'billedTourGuideFee', // 已结账单里已经有导游提成了，这里还有必要加么
};
export default {
  components: { Dialog },
  mixins: [DialogMixin],
  props: [
    'bsData',
    'billData',
    'invoicesOpened',
    'buffetDataForSettle',
    'prePayBtnBusinessType',
    'depositMoney',
    'isTeamBill',
    'wipeState'],
  data() {
    return {
      basePayBtns: [],
      moreFunctions: [],
      openBuffetDeposit: false, // 是否开启自助押金模块，开启了禁用押金按钮
    };
  },
  computed: {
    ...mapGetters(['posInfo', 'CUSTOM_BUTTONS', 'allPosModuleOper', 'ALL_POS_MODULE', 'posSettings', 'posOrderBill']),
    PayMoreHotkey() {
      const tmpArr = this.getPayMoreBtns();
      const tmpObj = {};
      this.moreFunctions.map((item) => {
        // 预付和埋单需要特别判断下
        switch (true) {
          case Object.is(item, 'payPayAdvance') || Object.is(item, 'undoPayPayAdvance'):
            this.payAdvanceJudge(tmpObj, tmpArr);
            break;
          case Object.is(item, 'payPayBill') || Object.is(item, 'undoPayPayBill'):
            this.payBillJudge(tmpObj, tmpArr);
            break;
          default:
            // 二级权限
            const isNoAuth = this.addPayAuthority(item);
            // 业务权限
            const getBtnIsEnable = this.getBtnIsEnable(item);
            const moduleItem = this.findBtn(item);
            const hotkey = this.getHotKey(moduleItem.tipHotkeys || moduleItem.text);
            Object.assign(tmpObj, {
              [hotkey]: () => {
                if (getBtnIsEnable) return;
                if (isNoAuth) return;
                // 自助餐业务后 不显示'押金','最低消费'等按钮
                if (this.openBuffetDeposit
                  && item === 'payDesposit'
                  && item === 'payMinimumConsumption'
                  // && item === 'payServiceCharge'
                ) {
                  return false;
                };
                if (this.isTeamBill === 1) { // 如果是团队 禁用服务费和最低消费补齐
                  if (item === 'payServiceCharge' || item === 'payMinimumConsumption') return;
                }
                this.clickHandler(moduleItem, true);
              },
            });
        }
      });
      return tmpObj;
      // return {
      // // 服务费
      //   F4: tmpArr.indexOf('payServiceCharge') > -1 ? () => {
      //     this.$emit('payFunction', 'payServiceCharge')
      //   } : () => {},
      //   // 最低消费补齐
      //   F5: tmpArr.indexOf('payMinimumConsumption') > -1 ? () => {
      //     this.$emit('payFunction', 'payMinimumConsumption');
      //   } : () => {},
      //   // 包房费
      //   //  'F6':() => {
      //   // 三期开发
      //   //  }
      //   // 预付
      //   Insert: tmpArr.indexOf('payPayAdvance') > -1 || tmpArr.indexOf('undoPayPayAdvance') > -1 ? () => {
      //     if (this.moreFunctions.indexOf('payPayAdvance') > -1) { // 预付
      //       this.$emit('payNoDialogFunction', this.findBtn('payPayAdvance'));
      //     } else if (this.moreFunctions.indexOf('undoPayPayAdvance') > -1) { // 撤销预付
      //       this.$emit('payNoDialogFunction', this.findBtn('undoPayPayAdvance'));
      //     }
      //     this.close();
      //     // this.isPayPayAdvance("payPayAdvance");
      //   }: () => {},
      // };
    },
  },
  watch: {
    prePayBtnBusinessType(val) {
      if (val == 3) {
        this.close();
      } else if (val == 4) {
        this.close();
      }
    },
  },
  mounted() {
    this.$von('payMoreCloseBus', (data) => {
      this.close();
    });
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
      let tmpArr = [];
      settleMenu.forEach((item) => {
        if (item.text === '导游提成' || item.btn_name === 'billedTourGuideFee') return; // 结算更多操作里不需要导游提成
        if (item.btn_name) {
          tmpArr.push(item.btn_name);
        } else if (allBtns[item.text]) {
          tmpArr.push(allBtns[item.text]);
        }
      });
      if (this.openBuffetDeposit) { // 开启自助押金模块后不显示原押金按钮
        tmpArr = tmpArr.filter(item =>
          item !== 'payDesposit'
          && item !== 'payMinimumConsumption'
          // && item !== 'payServiceCharge'
        );
      }
      this.basePayBtns = tmpArr;
    },
    // 埋单/撤销埋单的快捷键判断
    payBillJudge(tmpObj, tmpArr) {
      Object.assign(tmpObj, {
        PgUp: tmpArr.indexOf('payPayBill') > -1 || tmpArr.indexOf('undoPayPayBill') > -1 ? () => {
          const pointState = this.bsData.point_state; // 接口返回 bsData是流水数据 point_state 3为埋单
          if (pointState === 3) {
            const isNoAuth = this.addPayAuthority('undoPayPayBill');
            if (isNoAuth) return;
            this.$emit('payNoDialogFunction', this.findBtn('undoPayPayBill'));
          } else if (pointState === 2) {
            const isNoAuth = this.addPayAuthority('payPayBill');
            if (isNoAuth) return;
            this.$emit('payNoDialogFunction', this.findBtn('payPayBill'));
          }
          this.close();
        } : () => {},
      });
    },
    // 预付/撤销预付的快捷键判断
    payAdvanceJudge(tmpObj, tmpArr) {
      const { isPrePayEnable } = this.billData;
      if (Object.is(+isPrePayEnable, 1)) {
        Object.assign(tmpObj, {
          Insert: tmpArr.indexOf('payPayAdvance') > -1 || tmpArr.indexOf('undoPayPayAdvance') > -1 ? () => {
            if (this.moreFunctions.indexOf('payPayAdvance') > -1) { // 预付
              const isNoAuth = this.addPayAuthority('payPayAdvance');
              if (isNoAuth) return;
              this.$emit('payNoDialogFunction', this.findBtn('payPayAdvance'));
              this.close();
            } else if (this.moreFunctions.indexOf('undoPayPayAdvance') > -1) { // 撤销预付
              const isNoAuth = this.addPayAuthority('undoPayPayAdvance');
              if (isNoAuth) return;
              this.$emit('payNoDialogFunction', this.findBtn('undoPayPayAdvance'));
              this.close();
            }
            // this.isPayPayAdvance("payPayAdvance");
          } : () => {},
        });
      } else {
        return tmpObj.Insert = () => {};
      }
    },
    // 截取数组第8个之后的数据
    getPayMoreBtns() {
      const tmpArr = [...this.basePayBtns];
      if (tmpArr.length > 8) {
        return tmpArr.splice(8);
      }
      return [];
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
    clickHandler(item, isRealData = false) {
      const { method, isNeedDialog } = isRealData ? item : this.findBtn(item);
      if (method) {
        if (isNeedDialog === 0) {
          this.$emit('payNoDialogFunction', isRealData ? item : this.findBtn(item));
        } else {
          this.$emit('payFunction', isRealData ? item.method : this.findBtn(item).method);
        }
      }
      this.close(); // 为了重新渲染按钮状态和文字 逻辑在onOpen方法
    },
    // 判断预付还是撤销预付
    isPayPayAdvance(item) {
      this.$emit('payNoDialogFunction', this.findBtn(item));
      // if(item == "payPayAdvance"){
      //     // 如果此时结算页面有支付方式就是预付始终触发预付方法
      //     // this.resData == 1代表有结算方式
      //     if(this.resData.isExistPayWay == 1){
      //       this.$emit("payPayAdvance")
      //     }else{
      //       let pointState = this.bsData.point_state;
      //       // 如果没有结算方式判断当前客位是否为预付状态
      //       if (pointState === 6) {
      //         this.$emit("undoPayPayAdvance");
      //       } else{
      //         this.$emit("payPayAdvance")
      //       }
      //     }

      //   }else{
      //     this.$emit("payNoDialogFunction", this.findBtn(item));
      //   }
    },
    onOpen() {
      if (!this.moreFunctions.length) {
        this.moreFunctions = [...this.basePayBtns];
      }
      let tmpArr = [...this.moreFunctions];
      if (tmpArr.length === this.basePayBtns.length) { // 当两个数组长度相等时，说明是第一个打开窗口，这时候8位后的数组才属于更多里
        tmpArr.splice(0, 8);
      }
      const { isWithdrawCashEnable } = this.billData;
      if (!isWithdrawCashEnable) { // 是否可提现
        tmpArr = tmpArr.filter(item => item.name !== 'payWithdrawDeposit');
      }
      if (+this.posInfo.controlMode === 3) { // 快餐模式化
        // 这里注释掉是因为快餐下目前固定5个按钮，快餐下不会进入到此页
        // const { isWithdrawCashEnable } = this.billData;
        // if (isWithdrawCashEnable) {
        //   this.moreFunctions = tmpArr;
        // } else {
        //   this.moreFunctions = tmpArr.filter(item => item.name !== 'payWithdrawDeposit');
        // }
      } else { // 收银模式
        // 预付和撤销预付的判断
        this.isPayAdvance(tmpArr);
        // 埋单和撤销埋单的判断
        this.moreFunctions = this.isPayBill(tmpArr);
      }
      this.$hotKey.set('PosDialog.PayMoreHotkey', this.PayMoreHotkey);
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
        const position = this.getArrayIndexOf(tmpArr, 'undoPayPayBill'); // 撤销埋单
        if (!Object.is(position, -1)) {
          tmpArr[position] = 'payPayBill'; // 埋单
        }
      }
      if (+this.posInfo.controlMode === 3) { // 快餐模式下 不能有预结单打印和埋单
        tmpArr = tmpArr.filter(item => item !== 'payPreformPrint' || item !== 'payPayBill');
        return tmpArr;
      }
      return tmpArr;
    },
    getBtnName(name) {
      const { text } = this.findBtn(name);
      const result = text.match(/\(([^)]*)\)/);
      if (result) {
        const arr = text.split('(');
        return arr[0];
      }
      return text;
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
    // 按钮是否可点击 主要考虑多次结算和非多次结算下的限制 埋单和打印等
    getBtnIsEnable(item) {
      const pointState = this.bsData.point_state;
      const { hasMultiSettle } = this.posInfo;
      const { settleType, billData } = this;
      const { isWithdrawCashEnable } = billData;
      const { isPrePayEnable } = billData;
      if (this.isTeamBill === 1) { // 如果是团队
        if (item === 'payMinimumConsumption') {
          return true;
        }
      }
      // 如果开启自助 且 使用了自助押金, 不可使用埋单(但可以撤销埋单)
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
          || Object.is(item, 'payWithdrawDeposit')
        ) {
          return true;
        } if ( // 预结单打印,埋单
          Object.is(item, 'payPayBill')
          || Object.is(item, 'payPreformPrint')
        ) {
          if (Object.is(settleType, 1)) { // 当前如果为部分品相结算不允许埋单
            return true;
          } if (Object.is(settleType, 2)) { // 全部结算允许埋单 埋单状态下才允许预结单打印
            if (Object.is(item, 'payPreformPrint')) {
              if (pointState === 3) {
                return false;
              }
              return true;
            }
            return false;
          }
        } else { // 其他按钮正常使用
          return false;
        }
      } else { // 不是多次结算
        // 非多次结算下，后台是否开启了自助方案，如开启押金按钮不可点击，181自助押金需求
        if (this.openBuffetDeposit && Object.is(item, 'payDesposit')) {
          return true;
        }
        // 是否开启了预付功能
        if ((Object.is(item, 'payPayAdvance') || Object.is(item, 'undoPayPayAdvance')) && Object.is(+isPrePayEnable, 0)) {
          return true;
        }
        if (Object.is(item, 'payPreformPrint')) { // 如果是预结打印单，埋单后可以点，撤销埋单后不能点
          if (Object.is(pointState, 3)) { // 撤销埋单
            return true;
          }
          if (pointState && Object.is(pointState, 3)) { // 埋单
            return false;
          }
          return true;
        }
        if (Object.is(pointState, tableState.PRE_PAY) && Object.is(item, 'payDesposit')) { // 如果是预付，押金不能点
          return true;
        }
        if (Object.is(item, 'payWithdrawDeposit')) { // 如果是提现
          if (Object.is(+isWithdrawCashEnable, 1)) {
            return false;
          }
          return true;
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
    // 最终格式化
    finallyFormat(name) {
      const { depositMoney, invoicesOpened } = this;
      const obj = this.findBtn(name);
      let showMoney = '';
      if (name === 'payDesposit') {
        showMoney = `[${depositMoney}]`;
      } else if (name === 'payDrawInvoice') {
        showMoney = `[${invoicesOpened}]`;
      }
      let tmpText = '';
      let tmpTipHotKeys = '';
      const { text, tipHotkeys } = obj;
      const result = text.match(/\(([^)]*)\)/);
      // obj.text是否有括号
      if (result) {
        const arr = text.split('(');
        // obj有没有tipHotKeys
        if (tipHotkeys) {
          tmpText = arr[0];
          tmpTipHotKeys = tipHotkeys;
        } else {
          tmpText = arr[0];
          tmpTipHotKeys = `(${arr[1]}`;
        }
      } else {
        tmpText = text || `${this.$t('Biz.Settlement.UnKnow')}`;
        tmpTipHotKeys = tipHotkeys || '';
      }
      // 根据账单接口返回当前抹零执行状态, 设置显示相应的抹零按钮的文字内容
      // (结算成功到刷账单成功期间,'posOrderBill'被置空,此时响应数据(vuex)会报错)
      if (name === 'cancelWipe' && this.posOrderBill) {
        tmpText = this.posOrderBill.bsData.wipeFlg ? `${this.$t('Dict.Btn.CancelWipe')}` : `${this.$t('Dict.Btn.DoWipe')}`;
      }
      if (showMoney) {
        return `${tmpText}<br>${showMoney}`;
      }
      return `${tmpText}<br>${tmpTipHotKeys}`;
    },
    // 名字类似最低消费(F5)的这种   去掉(F5)
    formatName(obj) {
      const { text, tipHotkeys } = obj;
      const index = text.indexOf('(');
      if (index > -1) {
        return text;
      }
      if (tipHotkeys) {
        return text + tipHotkeys;
      }
      return text;
    },
    // 获取小括号里的内容
    getHotKey(str) {
      const result = str.match(/\(([^)]*)\)/);
      if (result && result[1]) {
        if (result[1].indexOf('+')) {
          result[1].replace('+', '.');
        }
        return result[1];
      }
      return '';
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
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.more-table-wrap {
  padding: 25px 30px;

  > ul {
    margin-bottom: 10px;

    button {
      .size(100%, 80px);
      margin-top: 10px;
      margin-bottom: 10px;
      background-color: @white;
      border: none;
      border-radius: 4px;
      color: #344b5b;

      &[disabled] {
        cursor: not-allowed;
        color: #666;
      }

      &:hover {
        background-color: #defcff;
      }
    }
    button[disabled] {
      cursor: not-allowed;
    }
  }
}

.lang-enUS {
  .col-xs-2 {
    width: 25%;
  }
  .more-table-wrap > ul button {
    font-size: 13px;
  }
}
</style>
