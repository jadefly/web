<template>
  <Dialog
      name="PosDialog.ScanCodePaymentCode"
      :title="$t('Biz.Settlement.SuperScanCodeTitle')"
      ref="dialog"
      @close="onClose"
      @open="onOpen"
      @handleBeforeClose="cancelSettle"
      :hotkeys="ScanCodePaymentCode"
      :showClose="false"
      :isPaymentCode="true"
      :append-to-body="true"
      width="700px"
      height="590px"
    >
    <div class="ScanCode">
      <div class="ScanCodeLeft">
        <div class="scancode-title">
          <img src="../images/Alipay2.png" :alt="$t('Dict.Alipay')">
          <span class="name">{{$t('Dict.Alipay')}}</span>
          <img src="../images/WeChat2.png" :alt="$t('Dict.WeChat')">
          <span class="name">{{$t('Biz.Settlement.WeChatOrCodePayment')}}</span>
        </div>
        <div class="line-through">
          <div class="price">{{ shouldPayMoney }}</div>
        </div>
        <div v-if="!scanned">
          <form action="javascript:void(0)" v-keyboard:keyboard>
            <div class="left-tip">{{$t('Biz.Settlement.Tip40')}}</div>
            <input type="text" ref="codeInput" v-model="code" :placeholder="$t('Biz.Settlement.Tip41')" v-judge>
          </form>
        </div>
        <div v-if="!scanned" class="ScanCodeLeft-keyboard">
          <KeyBoard @chopstickenter="enterHandle" ref="keyboard"></KeyBoard>
        </div>
        <div v-if="scanned" class="scanned">
          <div class="module-onlinepay" v-if="!scannedError">
            <h4>
              <i class="icon icon-loading"></i>
              <span :class="isOvertime ? 'overtimecolor':null">
                {{isOvertime ? `${this.$t('Biz.Settlement.GetDealStatusOverTime')}` : `${this.$t('Biz.Settlement.AlipayTipsText01')}`}}
              </span>
            </h4>
            <strong v-show="!isOvertime">{{$t('Biz.Settlement.AlipayTipsText02')}}</strong>
          </div>
          <div class="module-onlinepay" v-if="scannedError">
            <h4>
              <i class="icon icon-error"></i>
              <span>{{$t('Dict.AnErrorHasOccurred')}}</span>
            </h4>
            <strong>{{scannedErrorMsg}}</strong>
          </div>
          <button type="button" @click="backToScanPage">{{$t('Biz.Settlement.SweepCodeReturnBtn')}}(Enter)</button>
        </div>
      </div>
      <div class="ScanCodeRight">
        <div class="ScanCodeRight-tip">
          <i class="icon icon-tishi"></i>
          {{$t('Biz.Settlement.AlipayErrorMsg01')}}
        </div>
        <div class="right-btn cursor" @click="manualSettle">
          <div>
            <span class="manualConfirmation">{{$t('Dict.ManualValidation')}}</span>
            <span class="shortcutKey">(PgUp)</span>
          </div>
          <div class="right-btn-tip">{{$t('Biz.Settlement.SpCodePaySuccessMsg')}}</div>
        </div>
        <div class="right-btn cursor" @click="enforceSettle">
          <div>
            <span class="manualConfirmation">{{$t('Biz.Settlement.CompulsorySettlement')}}</span>
            <span class="shortcutKey">(F1)</span>
          </div>
          <div class="right-btn-tip">{{$t('Biz.Settlement.SpCodePaySuccessMsg01')}}</div>
        </div>
        <div class="right-btn cursor" @click="cancelSettle">
          <div>
            <span class="manualConfirmation">{{$t('Dict.CancellationOfPayment')}}</span>
            <span class="shortcutKey">(Esc)</span>
          </div>
          <div class="right-btn-tip">{{$t('Biz.Settlement.AlipayTipsText03')}}</div>
        </div>
      </div>
      <div class="tip-inner" ref="tipInner">
        <div class="CancellationOfPayment">
          <div v-html="$t('Biz.Settlement.IndexMsg6')"></div>
          <div class="tip">{{$t('Biz.Settlement.AlipayTipsText04')}}</div>
          <div class="tip">
            {{$t('Biz.Settlement.AlipayTipsText05')}}
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import ajax from '@/common/js/ajax';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

export default {
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin],
  data() {
    return {
      scanned: false, // 已经扫过码
      preclose: false, // 准备关闭弹窗状态
      scannedError: false, // 失败
      scannedErrorMsg: `${this.$t('Dict.TryAgain')}`, // 失败信息  默认（请返回重试）
      isOvertime: false, // 是否超时
      code: '', // 输入的支付码
      timer: null, // 交易超时的timer
      shouldPayMoney: '', // 支付金额
      depositOrder: '', // 押金单号
      buffetOrTakeOut: 'buffet',
      isEnforce: false,
      isOpen: false, // 页面是否处于显示状态
    };
  },
  computed: {
    ...mapGetters([
      'posInfo',
    ]),
    // 添加快捷键
    ScanCodePaymentCode() {
      return {
        // 手动确认
        PgUp: () => {
          this.manualSettle();
        },
        // 强制结算
        F1: () => {
          this.enforceSettle();
        },
        // 回车
        Enter: () => {
          this.checkScanned();
        },
      };
    },
  },
  created() {
    this.$von('buffetPaySuccess', (res) => {
      if (this.buffetOrTakeOut !== 'takeOut') {
        this.$message.success(`${res.message}`);
        this.$nextTick(() => {
          this.$emit('closeRegisterDeposit'); // 结算成功后关闭登记押金页面，刷新押金列表
        });
      } else {
        if (!this.isOpen) return;
        this.addTakeOutPayWay(res);
      }
      this.close();
    });
    this.$von('buffetPayFailed', (msg) => {
      this.$message.error(`${msg}`);
      clearTimeout(this.timer);
      this.backToScanPage();
    });
  },
  methods: {
    // 订单外卖添加结算方式
    addTakeOutPayWay(res) {
      const { name, id, paywayTypeId } = this.resData.payWayInfo;
      const data = { // 结算成功后刷新电话外卖
        name,
        payway_id: id,
        payway_type_id: paywayTypeId,
        take_money: Number(this.shouldPayMoney),
        payorderDTO: res.payorderDTO,
        autoSubmit: true,
      };
      if (this.isEnforce) {
        data.isEnforce = true;
      }
      this.$emit('add-pay-way', data);
    },
    onOpen() {
      this.isOpen = true;
      this.isEnforce = false;
      this.shouldPayMoney = this.resData.shouldPayMoney;
      this.depositOrder = this.resData.depositOrder;
      this.buffetOrTakeOut = this.resData.takeOut ? 'takeOut' : 'buffet';
      this.$nextTick(() => {
        this.$refs.codeInput.focus();
      });
      this.$vemit('payWayScanModalStatus', true); // 传递扫码付页面打开状态
    },
    onClose() {
      this.isOpen = false;
      this.clearCacheData();
      this.$emit('clearActivePayWayTypeIndex'); // 清空登记押金页面选中的支付方式
      this.$vemit('payWayScanModalStatus', false); // 传递扫码付页面关闭状态
    },
    // 执行扫码支付
    doScanCodePay() {
      this.isEnforce = false;
      this.isOvertime = false;
      this.scanned = true;
      const { code, shouldPayMoney, depositOrder } = this;
      const data = {
        bizType: this.buffetOrTakeOut === 'takeOut' ? 5 : 1, // 押金是1  外卖是5
        paywayId: 37, // 固定37
        linkData: this.buffetOrTakeOut === 'takeOut' ? this.resData.bsCode : depositOrder, // 营业流水或押金单号
        barCode: `${code}` || '', // 支付码
        payMoney: shouldPayMoney || 0, // 支付金额
      };
      let url = 'canyin.pos.buffetdeposit.depositscancodepay'; // 押金的扫码付
      if (this.buffetOrTakeOut === 'takeOut') {
        url = 'canyin.pos.payservice.pay.scancodepay'; // 外卖的扫码付
      }
      ajax(url, {
        contentType: 'json',
        data,
      }).then((res) => {
        const { resultCode, msg } = res;
        this.scannedErrorMsg = msg || null;
        if (+resultCode !== 1) {
          clearTimeout(this.timer);
          this.scannedError = true;
          this.scannedErrorMsg = res.msg ? res.msg : `${this.$t('Dict.TryAgain')}`;
        } else {
          this.timer = setTimeout(() => {
            this.isOvertime = true;
          }, 30000);
        }
      });
    },
    // 手动确认
    manualSettle(authData = {}) {
      this.isEnforce = false;
      const { shouldPayMoney, depositOrder } = this;
      const data = {
        bizType: this.buffetOrTakeOut === 'takeOut' ? 5 : 1, // 押金是1  外卖是5
        paywayId: 37, // 固定37
        linkData: this.buffetOrTakeOut === 'takeOut' ? this.resData.bsCode : depositOrder, // 营业流水或押金单号
        payMoney: shouldPayMoney || 0, // 支付金额
        ...authData,
      };
      let url = 'canyin.pos.buffetdeposit.depositscancodecheckandsettle'; // 押金的手动确认
      if (this.buffetOrTakeOut === 'takeOut') {
        url = 'canyin.pos.payservice.pay.scancodecheckandsettle'; // 外卖的手动确认
      }
      ajax(url, {
        contentType: 'json',
        data,
      }).then((res) => {
        const { resultCode, msg } = res;
        if (+resultCode !== 1) {
          this.$message.warning(`${msg}`);
        } else if (this.buffetOrTakeOut !== 'takeOut') {
          this.$message.success(`${msg}`);
          this.close();
          this.$nextTick(() => {
            this.$emit('closeRegisterDeposit'); // 结算成功后关闭登记押金页面，刷新押金列表
          });
        }
      });
    },
    // 强制结算
    enforceSettle(authData = {}) {
      this.isEnforce = true;
      this.$vonce('authCode', (code) => {
        this.enforceSettle(code);
      });
      const { shouldPayMoney, depositOrder } = this;
      const data = {
        bizType: this.buffetOrTakeOut === 'takeOut' ? 5 : 1, // 押金是1  外卖是5
        paywayId: 37, // 固定37
        linkData: this.buffetOrTakeOut === 'takeOut' ? this.resData.bsCode : depositOrder, // 营业流水或押金单号
        payMoney: shouldPayMoney || 0, // 支付金额
        ...authData,
      };
      if (this.buffetOrTakeOut === 'takeOut') {
        data.isEnforce = true;
      }
      let url = 'canyin.pos.buffetdeposit.depositscancodeenfore'; // 押金的强制结算
      if (this.buffetOrTakeOut === 'takeOut') {
        url = 'canyin.pos.payservice.pay.scancodeenfore'; // 外卖的强制结算
      }
      ajax(url, {
        contentType: 'json',
        data,
      }).then((res) => {
        const { resultCode, msg } = res;
        if (+resultCode === 1) {
          if (this.buffetOrTakeOut !== 'takeOut') {
            this.$message.success(`${msg}`);
            this.close();
            this.$nextTick(() => {
              this.$emit('closeRegisterDeposit'); // 结算成功后关闭登记押金页面，刷新押金列表
            });
          }
        } else if (+resultCode === -1) {
          this.$message.warning(`${msg}`);
        } else if (+resultCode === -2) {
          this.$vemit('posAuthCheck', { message: res.msg });
        }
      });
    },
    // 取消支付
    cancelSettle() {
      this.preclose = true;
      const tip = this.$refs.tipInner.innerHTML;
      this.$confirm(tip, `${this.$t('Dict.Tips')}`, {
        dangerouslyUseHTMLString: true,
        confirmButtonText: `${this.$t('Dict.Sure')}`,
        cancelButtonText: this.$t('Dict.Cancel'),
        type: 'warning',
      }).then(() => {
        this.$message({
          type: 'success',
          message: `${this.$t('Biz.Settlement.CancelSuccess')}`,
        });
        this.close();
      }).catch(() => {
        this.preclose = false;
        this.$message({
          type: 'info',
          message: this.$t('Dict.OperationCancelled'),
        });
      });
    },
    // 回车事件
    checkScanned() {
      if (this.scanned) { // 判断是否扫码过，如果没有扫过走确认流程，如果扫过了关闭错误页面
        this.backToScanPage();
      } else {
        this.enterHandle();
      }
    },
    // 执行扫码支付前的确认操作
    enterHandle() {
      if (!this.code) {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning46')}`);
        return;
      }
      if (!this.preclose) { // 是否弹出了取消支付提示
        this.doScanCodePay();
      }
    },
    // 返回扫码页面
    backToScanPage() {
      this.scanned = false;
      this.scannedError = false;
      this.code = '';
    },
    // 清空缓存数据
    clearCacheData() {
      this.code = '';
      this.scanned = false;
      this.preclose = false;
      this.scannedError = false;
      this.scannedErrorMsg = '请返回重试';
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.cursor{
  cursor: pointer;
}
.overtimecolor{
  color:#f00 !important;
}
.ScanCode {
  height: 100%;
  display: flex;
}
.ScanCodeLeft {
  width: 430px;
  height: 100%;
  background: #fff;
  padding: 20px;
  text-align: center;
  .scancode-title img {
    height: 40px;
  }
  .name {
    font-size: 20px;
    font-weight: bold;
    vertical-align: middle;
  }
  .line-through {
    color: #ffffff;
    text-decoration: line-through;
  }
  .price {
    font-size: 37px;
    font-weight: bold;
    margin-top: 20px;
    margin-bottom: 25px;
  }
  .ScanCodeLeft-keyboard {
    width: 248px;
    margin: auto;
    margin-top: 30px;
  }
  .left-tip {
    color: #b5b5b5;
  }
  input {
    width: 320px;
    height: 40px;
    text-align: center;
    border: 1px solid #b5b5b5;
    border-radius: 5px;
  }
}
.ScanCodeRight {
  width: 270px;
  padding: 20px 15px;
  i.icon {
    display: inline-block;
    margin-bottom: 2px;
    margin-right: 5px;
  }
  .right-btn {
    border: 1px solid #b5b5b5;
    border-radius: 5px;
    width: 228px;
    min-height: 80px;
    margin: auto;
    text-align: center;
    padding: 15px;
    background: #fff;
    margin-bottom: 20px;
    cursor: pointer;
    .right-btn-tip {
      font-size: 12px;
      color: #a2a2a2;
    }
    .manualConfirmation {
      font-size: 17px;
      font-weight: bold;
    }
    .shortcutKey {
      color: #a2a2a2;
    }
  }
}
.ScanCodeRight-tip {
  font-size: 12px;
  margin-bottom: 30px;
}

.CancellationOfPayment {
  .cancellation {
    color: #0babb9;
    font-weight: bold;
  }
  .tip {
    font-size: 13px;
    color: #616363;
  }
}
.module-onlinepay{
  h4{
    height: 44px;
    line-height: 44px;
    span{
      vertical-align: middle;
      font-size: 20px;
      color: #2f2f2f;
      font-weight: bold;
    }
  }
  strong {
    display: inline-block;
    line-height: 24px;
    padding-top: 3px;
    padding-bottom: 3px;
    font-size: 12px;
    color: #333;
  }
}
.scanned{
  button {
    display: inline-block;
    width: 280px;
    height: 46px;
    font-size: 18px;
    color: #2f2f2f;
    border: 1px solid #ccc;
    border-radius: 3px;
    margin-top: 60px;
    background-color: #fff;
  }
}
.tip-inner {
  display: none;
}
</style>
