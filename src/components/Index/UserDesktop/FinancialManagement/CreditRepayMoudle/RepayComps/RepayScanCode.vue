<template>
  <Dialog
    name="PosDialog.RepayScanCode"
    :title="$t('Biz.Settlement.SuperScanCodeTitle')"
    ref="dialog"
    @close="onClose"
    @handleBeforeClose="handleBeforeClose"
    @open="onOpen"
    :hotkeys="repayScanCode"
    :showClose="false"
    :isPaymentCode="true"
    :append-to-body="true"
    width="700px"
    height="540px">
    <div class="ScanCode">
      <div class="ScanCodeLeft">
        <div class="scancode-title">
          <img src="@/components/Pos/Order/Bill/Pay/images/Alipay2.png" :alt="$t('Dict.Alipay')">
          <span class="name">{{$t('Dict.Alipay')}}</span>
          <img src="@/components/Pos/Order/Bill/Pay/images/WeChat2.png" :alt="$t('Dict.WeChat')">
          <span class="name">{{$t('Dict.WeChat')}} {{$t('Dict.PaymentCodePayment')}}</span>
        </div>
        <div class="price">{{repayValue }}</div>
        <div v-if="!scanned">
          <form
            action="javascript:void(0)"
            v-keyboard:keyboard>
            <div class="left-tip">{{$t('Biz.Settlement.Tip40')}}</div>
            <input
              v-judge
              type="text"
              ref="codeInput"
              v-model="code"
              :placeholder="$t('Biz.Settlement.Tip41')">
          </form>
        </div>
        <div
          class="ScanCodeLeft-keyboard"
          v-if="!scanned">
          <KeyBoard
            @chopstickenter="chopstickenter"
            ref="keyboard"></KeyBoard>
        </div>
        <div
          class="scanned"
          v-if="scanned">
          <div
            class="module-onlinepay"
            v-if="!scannedError">
            <h4><i class="icon icon-loading"></i><span :class="isOvertime ? 'overtimecolor' : null">{{
              isOvertime
                ? $t('Biz.UserDesktop.UserDesktopMsg098')
                : $t('Biz.UserDesktop.UserDesktopMsg099') }}</span></h4>
            <strong v-show="!isOvertime">{{$t('Biz.UserDesktop.UserDesktopMsg100')}}</strong>
          </div>
          <div
            class="module-onlinepay"
            v-if="scannedError">
            <h4><i class="icon icon-error"></i><span>{{$t('Dict.AnErrorHasOccurred')}}</span></h4>
            <strong>{{ scannedErrorMsg }}</strong>
          </div>
          <button
            type="button"
            @click="onlinepayRetryPay">{{$t('Biz.UserDesktop.UserDesktopMsg101')}}(Enter)
          </button>
        </div>
      </div>
      <div class="ScanCodeRight">
        <div
          class="ScanCodeRight-tip"
        ><i class="icon icon-tishi"></i>{{$t('Biz.Settlement.AlipayErrorMsg01')}}
        </div>
        <div
          class="right-btn cursor"
          @click="manualSettle">
          <div>
            <span class="manualConfirmation">{{$t('Dict.ManualValidation')}}</span>
            <span class="shortcutKey">(PgUp)</span>
          </div>
          <div class="right-btn-tip">{{$t('Biz.UserDesktop.UserDesktopMsg103')}}</div>
        </div>
        <div
          class="right-btn cursor"
          @click="enforceSettle('')">
          <div>
            <span class="manualConfirmation">{{$t('Biz.Settlement.CompulsorySettlement')}}</span>
          </div>
          <div class="right-btn-tip">{{$t('Biz.UserDesktop.UserDesktopMsg104')}}</div>
        </div>
        <div
          class="right-btn cursor"
          @click="cancelPayment"
          ref="cancelTip">
          <div>
            <span class="manualConfirmation">{{$t('Dict.CancellationOfPayment')}}</span>
            <span class="shortcutKey">(Esc)</span>
          </div>
          <div class="right-btn-tip">{{$t('Biz.UserDesktop.UserDesktopMsg105')}}</div>
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
      repayValue: 0, // 待还款(支付)金额
      ScanCodeData: {},
      scanned: false, // 已经扫过码
      preclose: false, // 准备关闭弹窗状态
      scannedError: false, // 失败
      scannedErrorMsg: this.$t('Dict.TryAgain'), // 失败信息  默认（请返回重试）
      payStatus: 0,
      isOvertime: false,
      code: '', // 输入的支付码
      status: 0, // 状态
      timer: null,
      bizType: null, // 缓存:传来的请求支付接口类型
      typeId: null, // 缓存:传来还款方式类型(用于请求还款流水的code)
      rePayCode: null, // 缓存: 请求的还款流水code
      // isOnePunch: false,
      // onePunch: {
      //   dialogTitle: '扫码付',
      //   // bodyTitle: '一招过',
      //   // inputTitle: '请扫描顾客掌上生活付款码',
      //   // inputPlaceHolder: '请扫描顾客掌上生活付款码或手动输入条码',
      // },
    };
  },
  computed: {
    ...mapGetters([
      'outDeviceSetting',
      'posInfo',
    ]),

    // 添加快捷键
    repayScanCode() {
      return {
        // 手动确认
        PgUp: () => {
          this.manualSettle();
        },
        // 回车
        Enter: () => {
          this.checkScanned();
        },
      };
    },
  },
  mounted() {
    this.$von('closeRepayScanCodeDialog', () => {
      this.close();
    });
  },
  methods: {
    onOpen() {
      this.repayValue = this.resData.repayValue;
      this.ScanCodeData = this.resData.data;
      // 设置当前还挂账方式(普通/批量/指定)
      this.bizType = this.resData.bizType;
      if (this.bizType === 2) {
        this.typeId = 1502;
      } else if (this.bizType === 3) {
        this.typeId = 1504;
      } else {
        this.typeId = 1506;
      }
      // 获取还款流水code
      this.getRePayCode();
      // 延迟执行输入框选中
      setTimeout(() => {
        this.$refs.codeInput.focus();
      }, 100);
    },
    onClose() {
      clearTimeout(this.timer);
      setTimeout(() => {
        this.zero();
      }, 300);
    },
    // 检查是否扫码
    checkScanned() {
      if (this.scanned) {
        this.onlinepayRetryPay();
      } else {
        this.clickEnter();
      }
    },
    // 软键盘执行'回车'
    chopstickenter() {
      this.clickEnter();
    },
    // 关闭前执行'取消支付'
    handleBeforeClose() {
      this.cancelPayment();
    },
    // 扫码支付重试
    onlinepayRetryPay() {
      this.scanned = false;
      this.scannedError = false;
      this.code = '';
    },
    // 清空数据
    zero() {
      this.code = '';
      this.scanned = false;
      this.preclose = false;
      this.scannedError = false;
      this.scannedErrorMsg = this.$t('Dict.TryAgain');
      this.payStatus = 0;
      this.typeId = null;
      this.bizType = null;
      this.rePayCode = null;
    },
    // 点击键盘回车
    clickEnter() {
      this.isOvertime = false;
      if (!this.preclose) {
        if (this.code === '') {
          this.$message.info(this.$t('Dict.PleaseScanCode'));
        } else {
          this.scancodepay();
        }
      }
    },
    // 请求还款流水的code用于支付接口请求
    getRePayCode() {
      ajax('canyin.desktop.financialManagement.unpaidbill.gethkcode', {
        contentType: 'json',
        data: {
          typeId: `${this.typeId}`, // 挂账还款业务标识
        },
      }).then((res) => {
        this.rePayCode = res.code;
      }).catch((data) => {
        const massage = data.msg ? data.msg : data.errCode;
        this.$message.success(`${massage}`);
      });
    },
    // 扫码支付请求(非支付成功判断依据)
    // 不需要判断使用权限, 当前无权限, 挂账还款业务无法使用(不可见)
    // 扫码支付和手动确认, 均依靠推送的返回结果,处理支付完成,不在本组件内执行.
    scancodepay() {
      this.scanned = true;
      if (!this.code) {
        this.$message.info(this.$t('Dict.PleaseScanCode'));
        return;
      }
      ajax('canyin.desktop.financialManagement.unpaidbill.unpaidscancodepay', {
        contentType: 'json',
        data: {
          bizType: this.bizType, // 挂账还款业务标识
          paywayId: 37, // 付款码支付方式,固定传37
          barCode: this.code || '', // 扫码信息
          linkData: this.rePayCode, // 还款单号code
          payMoney: this.resData.repayValue, // 支付金额
        },
      }).then((res) => {
        const { resultCode, msg } = res;
        this.scannedErrorMsg = msg || null;
        if (+resultCode !== 1) {
          clearTimeout(this.timer);
          this.scannedError = true;
          this.scannedErrorMsg = res.msg ? res.msg : this.$t('Dict.TryAgain');
        } else {
          this.timer = setTimeout(() => {
            this.isOvertime = true;
          }, 30000);
        }
      });
    },
    // 扫码支付-手动结算
    manualSettle() {
      // 为避免关闭页面后,重新扫码导致的重复支付,不在做手动时的无码执行,有后台进行支付查询.
      // if (!this.code) {
      //   this.$message.info('请扫码');
      //   return;
      // }
      ajax('canyin.desktop.financialManagement.unpaidbill.unpaidscancodecheckandsettle', {
        contentType: 'json',
        data: {
          bizType: this.bizType, // 挂账还款业务标识
          paywayId: 37, // 付款码支付方式,固定传37
          barCode: this.code || '', // 扫码信息
          linkData: this.rePayCode, // 还款单号
          payMoney: this.resData.repayValue, // 支付金额
        },
      }).then((res) => {
        if (+res.resultCode !== 1) {
          this.$message.warning(`${res.msg}`);
        } else {
          this.$message.success(`${res.msg}`);
        }
      });
    },
    // 扫码支付-强制结算
    // 支付结果,依靠接口返回状态进行处理,不依靠推动结果.
    enforceSettle(authData = {}) {
      this.$vonce('authCode', (code) => {
        this.enforceSettle(code);
      });
      if (!this.code) {
        this.$message.info(this.$t('Dict.PleaseScanCode'));
        return;
      }
      ajax('canyin.desktop.financialManagement.unpaidbill.unpaidscancodeenfore', {
        contentType: 'json',
        data: {
          bizType: this.bizType, // 挂账还款业务标识
          paywayId: 37, // 付款码支付方式,固定传37
          barCode: this.code || '', // 扫码信息
          linkData: this.rePayCode, // 还款单号
          payMoney: this.resData.repayValue, // 支付金额
          ...authData,
        },
      }).then((res) => {
        if (+res.resultCode === 1) {
          this.$message.success(this.$t('Dict.SuccessfulPayment'));
          // 只有强制结算是接口返回成功状态后,进行再调用'完成挂账'的回调方法
          this.resData.callback({
            // cardAllMoney: this.repayValue, // 待支付金额
            // consumeMoney: this.balance, // 储值支付
            scancodePayorderId: res.scancodePayorderId, // 支付订单ID
            isEnforce: res.isEnforce, // 是否是强制结算（0：非强制结算；1：强制结算）
            authEmpId: res.authEmpId, // 强制结算授权人（默认为null）
            paywayId: res.paywayId, // 实际使用的支付方式(微信||支付宝)id,回传给挂账接口使用
            code: res.code, // 还挂账的还款的流水
          });
          this.close();
        }
        if (+res.resultCode === -1) {
          this.$message.warning(`${res.msg}`);
        }
      });
    },

    // 支付完成,并挂账完成
    // 完成挂账方法:扫码和手动,从扫码付页面执行,而是依靠推送活的支付成功状态, 再执行完成挂账,
    // 只有强制结算是接口返回成功状态后,进行再调用'完成挂账'的回调方法.

    // 取消支付
    cancelPayment() {
      this.$confirm(this.$refs.cancelTip.innerHTML, this.$t('Dict.Tips'), {
        dangerouslyUseHTMLString: true,
        confirmButtonText: this.$t('Dict.Sure'),
        cancelButtonText: this.$t('Dict.Cancel'),
        type: 'warning',
      }).then(() => {
        this.$message({
          type: 'success',
          message: this.$t('Dict.CancellationOfSuccess'),
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
  .price {
    font-size: 37px;
    font-weight: bold;
    margin-top: 12px;
    margin-bottom: 12px;
  }
  .ScanCodeLeft-keyboard {
    width: 248px;
    margin: auto;
    margin-top: 20px;
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
    height: 80px;
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

.cancelPayment {
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
</style>
