<template>
<!-- title--扫码付 -->
  <Dialog
      name="PosDialog.AlipayPaymentCode"
      :title="$t('Dict.SweepCodePayment')"
      ref="dialog"
      @handleBeforeClose="handleBeforeClose"
      @close="onClose"
      @open="onOpen"
      :hotkeys="AlipayPaymentCode"
      :showClose="false"
      :append-to-body="true"
      :isPaymentCode="true"
      width="700px"
      height="590px"
    >
    <template slot="other-button">
    </template>
    <div class="Alipay">
      <div class="AlipayLeft">
        <div>
          <img src="@/components/Pos/Order/Bill/Pay/images/Alipay.png" alt="">
          <!-- 支付宝付款码支付 -->
          <span class="name">{{$t('Biz.Settlement.AlipayCodePay')}}</span>
        </div>
        <div class="line-through">
          <div class="price">{{ScanCodeData.paymoney}}</div>
        </div>
        <div v-if="!scanned">
          <form action="javascript:void(0)" v-keyboard:keyboard>
            <!-- 请扫描或手工输入顾客支付宝支付码 -->
            <div class="left-tip">{{$t('Biz.Settlement.AlipayAlertText')}}</div>
            <!-- 手工输入支付宝付款码 -->
            <input type="text" ref="codeInput" v-model="code" :placeholder="$t('Biz.Settlement.AlipayPlaceholder')">
          </form>
        </div>
        <div v-if="!scanned" class="AlipayLeft-keyboard">
          <KeyBoard @chopstickenter="chopstickenter" ref="keyboard"></KeyBoard>
        </div>
        <div v-if="scanned" class="scanned">
         <div class="module-onlinepay" v-if="!scannedError">
           <!-- 未收到支付信息，请根据顾客支付状态选择合适操作完成结算！ -->
           <!--  交易进行中，请等待…-->
            <h4>
              <i class="icon icon-loading"></i>
              <span :class="isOvertime ? 'overtimecolor':null">
                {{isOvertime ? $t('Biz.Settlement.AlipayTipsText') : $t('Biz.Settlement.AlipayTipsText01') }}
              </span>
            </h4>
            <!-- 交易成功后，会自动关闭页面 -->
            <strong v-show="!isOvertime">{{ $t('Biz.Settlement.AlipayTipsText02') }}</strong>
         </div>
          <div class="module-onlinepay" v-if="scannedError">
            <!-- 出现了错误 -->
            <h4><i class="icon icon-error"></i><span>{{ $t('Dict.AnErrorHasOccurred') }}</span></h4>
            <strong>{{scannedErrorMsg}}</strong>
          </div>
          <!-- 返回扫码页面 -->
          <button type="button" @click="onlinepayRetryPay">{{ $t('Biz.Settlement.SweepCodeReturnBtn') }}(Enter)</button>
        </div>
      </div>
      <div class="AlipayRight">
        <!-- 若支付异常，请根据顾客手机支付状态、店内网络状态，选择合适的操作： -->
        <div class="AlipayRight-tip">
          <i class="icon icon-tishi"></i>
          {{ $t('Biz.Settlement.AlipayErrorMsg01') }}
        </div>
        <div class="right-btn cursor" @click="manualSettle">
          <div>
            <!-- 手动确认 -->
            <span class="manualConfirmation">{{ $t('Dict.ManualValidation') }}</span>
            <span class="shortcutKey">(PgUp)</span>
          </div>
          <!-- 确认顾客支付成功，且店内网络正常 -->
          <div class="right-btn-tip">{{ $t('Biz.Settlement.SpCodePaySuccessMsg') }}</div>
        </div>
        <div class="right-btn cursor" @click="enforceSettle">
          <div>
            <!-- 强制结算 -->
            <span class="manualConfirmation">{{ $t('Biz.Settlement.CompulsorySettlement') }}</span>
          </div>
          <!-- 确认顾客支付成功，且店内网络异常 -->
          <div class="right-btn-tip">{{ $t('Biz.Settlement.SpCodePaySuccessMsg01') }}</div>
        </div>
        <div class="right-btn cursor" @click="CancellationOfPayment">
          <div>
            <!-- 取消支付 -->
            <span class="manualConfirmation">{{ $t('Dict.CancellationOfPayment') }}</span>
            <span class="shortcutKey">(Esc)</span>
          </div>
          <!-- 顾客放弃支付,更换支付方式 -->
          <div class="right-btn-tip">{{ $t('Biz.Settlement.AlipayTipsText03') }}</div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import ajax from '@/common/js/ajax';
import { add } from '@/common/js/math';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

export default {
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin],
  data() {
    return {
      ScanCodeData: {},
      scanned: false, // 已经扫过码
      preclose: false, // 准备关闭弹窗状态
      scannedError: false, // 失败
      scannedErrorMsg: '请返回重试', // 失败信息  默认（请返回重试）
      payStatus: 0,
      isOvertime: false,
      // 当面付支付状态
      // 状态值描述：
      // 0：未调用吾享接口，业务验证失败
      // 1：调用支付接口成功，并且查询到支付成功信息
      // 2：调用接口本地错误（未进入服务端接口：超时、404等客户端错误），【暂未使用，保留】
      // 3：调用接口返回失败（500、线上逻辑失败等），【目前所有错误都归结为此类错误】
      // 4：支付未成功，调用支付接口成功，但是为查询到支付成功信息
      // 现存问题：关闭当面付支付窗口，再次重新打开之后，支付状态会重置成0
      code: '', // 输入的支付码
      status: 0, // 状态
      timer: null,
      queryStateTimer: null,
    };
  },
  computed: {
    ...mapGetters(['outDeviceSetting']),
    // 添加快捷键
    AlipayPaymentCode() {
      const hotKey = {};
      Object.assign(hotKey, {
        // 手动确认
        PgUp: () => {
          this.manualSettle();
        },
        // 回车
        Enter: () => {
          this.checkScanned();
        },
      });
      this.initHotKeyToFocus(hotKey);
      return hotKey;
    },
  },
  created() {
    // 监听快餐关闭结算窗口事件
    this.$von('fastfoodCloseSettleDialog', () => {
      this.$log.info('快捷支付宝扫码付窗口被调用关闭');
      this.close();
    });
  },
  methods: {
    initHotKeyToFocus(hotKeyObj) {
      const str = '0123456789';
      const arr = str.split('');
      arr.forEach((item) => {
        hotKeyObj[item] = () => {
          if (document.hasFocus() && document.activeElement === this.$refs.codeInput) return;
          this.$refs.codeInput.focus();
        };
      });
    },
    checkScanned() {
      if (this.scanned) {
        this.onlinepayRetryPay();
      } else {
        this.clickEnter();
      }
    },
    handleBeforeClose() {
      this.CancellationOfPayment();
    },
    chopstickenter() {
      this.clickEnter();
    },
    onOpen() {
      this.zero();
      this.ScanCodeData = this.resData;
      // 如果含有押金,则付款金额累加押金(自助餐已开启)
      if (this.resData.buffetDeposit) {
        this.ScanCodeData.paymoney = add(this.ScanCodeData.paymoney, this.ScanCodeData.buffetDeposit);
      }
      setTimeout(() => {
        this.$refs.codeInput.focus();
      }, 200);
    },
    onClose() {
      this.setSettleBsCode(null);
      clearInterval(this.queryStateTimer);
      clearTimeout(this.timer);
      this.queryStateTimer = null;
    },
    enforceSettle() {
      // typeId:6代表微信二维码;typeId:8代表支付宝付款码;typeId:18代表云闪付付款码
      this.$emit('enforceSettle', { payData: this.ScanCodeData, typeId: 8 });
    },
    manualSettle() {
      // typeId:6代表微信二维码;typeId:8代表支付宝付款码;typeId:18代表云闪付付款码
      this.$emit('manualSettle', { payData: this.ScanCodeData, typeId: 8 });
    },
    CancellationOfPayment() {
      this.preclose = true;
      this.$confirm(
        `<div class="CancellationOfPayment">
          <div>
           ${this.$t('Biz.Settlement.IndexMsg6')}
          </div>
          <div style="font-size: 13px;color: #616363;">${this.$t('Biz.Settlement.AlipayTipsText04')}</div>
          <div style="font-size: 13px;color: #616363;">
            ${this.$t('Biz.Settlement.AlipayTipsText05')}
          </div>
        </div>`,
        this.$t('Dict.Tips'),
        {
          confirmButtonText: this.$t('Dict.Sure'),
          cancelButtonText: this.$t('Dict.Cancel'),
          type: 'warning',
          dangerouslyUseHTMLString: true,
        },
      ).then(() => {
        // 获取结算页面信息
        ajax('canyin.pos.settlement.cancelpresettle', {
          contentType: 'URLEncoded',
          data: { bsId: this.ScanCodeData.bsId },
        }).then((res) => {
          if (res.result == 1) {
            this.close();
            this.$message.success(`${this.$t('Biz.Settlement.CancelSuccess')}`);
            this.zero();
          } else {
            this.$message.error(res.msg);
          }
        });
      }).catch(() => {
        this.preclose = false;
        this.$message({
          type: 'info',
          message: this.$t('Dict.OperationCancelled'),
        });
      });
    },
    // 回车快捷键
    clickEnter() {
      this.isOvertime = false;
      if (!this.preclose) {
        if (this.code === '') {
          // 请扫码
          this.$message.info(this.$t('Dict.PleaseScanCode'));
        } else {
          this.scancodepay();
        }
      }
    },
    scancodepay() {
      this.scanned = true;
      const params = {
        paytypeid: this.ScanCodeData.paytypeid,
        paywayid: this.ScanCodeData.paywayid,
        orderid: this.ScanCodeData.orderid,
        barCode: this.code,
        money: this.ScanCodeData.paymoney,
        status: this.payStatus,
        bsId: this.ScanCodeData.bsId,
        printData: this.ScanCodeData.printData,
        items: this.ScanCodeData.items,
      };
      ajax('canyin.pos.settlement.pay.scancodepay.scancodepay', {
        contentType: 'URIEncoded',
        data: params,
      }).then((res) => {
        this.scannedErrorMsg = res.msg ? res.msg : null;
        this.payStatus = res.status;
        if (res.status === 1) { // 调用接口返回成功
          clearInterval(this.queryStateTimer);
          if (this.$refs.dialog.dialogVisible) {
            this.queryStateTimer = setInterval(() => {
              this.queryState();
            }, 2000);
          }
          this.timer = setTimeout(() => {
            clearInterval(this.queryStateTimer);
            this.queryStateTimer = null;
            this.isOvertime = true;
          }, 70000);
        } else {
          clearTimeout(this.timer);
          this.scannedError = true;
          // 请返回重试
          this.scannedErrorMsg = res.msg ? res.msg : this.$t('Dict.TryAgain');
        }
      });
    },
    queryState() {
      ajax('canyin.pos.settlement.pay.querybsstate', {
        loading: false,
        contentType: 'URIEncoded',
        data: { bsId: this.ScanCodeData.bsId },
      }).then((data) => {
        if (data.state === 1 && this.queryStateTimer) {
          this.$log.info(`快餐主动请求的${data.bsCode}成功`);
          this.$message({
            type: 'success',
            message: this.$t('Biz.Settlement.IndexMsg8', [data.bsCode]),
            customClass: 'message-top1 message-small',
          });
          this.$vemit('fastClearEmptyBill');
          this.$vemit('fastfoodCloseSettleDialog');
        }
      });
    },
    onlinepayRetryPay() {
      clearInterval(this.queryStateTimer);
      this.queryStateTimer = null;
      this.scanned = false;
      this.scannedError = false;
      this.code = '';
    },
    zero() {
      // 清空数据
      this.code = '';
      this.scanned = false;
      this.preclose = false;
      this.scannedError = false;
      this.scannedErrorMsg = this.$t('Dict.TryAgain');
      this.payStatus = 0;
    },
    ...mapMutations({
      setSettleBsCode: 'SET_SETTLE_BS_CODE',
    }),
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.cursor {
  cursor: pointer;
}
.overtimecolor{
  color:#f00 !important;
}
.Alipay {
  height: 100%;
  display: flex;
}
.AlipayLeft {
  width: 430px;
  height: 100%;
  background: #fff;
  padding: 20px;
  text-align: center;
  .name {
    font-size: 20px;
    font-weight: bold;
    vertical-align: middle;
  }
  .line-through {
    /*color: #ffffff;*/
    /*text-decoration: line-through;*/
  }
  .price {
    font-size: 37px;
    font-weight: bold;
    margin-top: 20px;
    margin-bottom: 25px;
    color: #000000;
    position: relative;
    &:before {
      content: '';
      position: absolute;
      display: block;
      width: 100%;
      height: 1px;
      top: 50%;
      background-color: #ffffff;
    }
  }
  .AlipayLeft-keyboard {
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
.AlipayRight {
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
.AlipayRight-tip {
  font-size: 12px;
  margin-bottom: 30px;
}

.module-onlinepay {
  h4 {
    height: 44px;
    line-height: 44px;
    span {
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
.scanned {
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
