<template>
  <Dialog
      name="PosDialog.ScanCodePaymentCode"
      :title="$t('Biz.Settlement.SuperScanCodeTitle')"
      ref="dialog"
      @close="onClose"
       @handleBeforeClose="handleBeforeClose"
      @open="onOpen"
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
          <div class="price">{{ScanCodeData.paymoney}}</div>
        </div>
        <div v-show="!scanned">
          <form action="javascript:void(0)" v-keyboard:keyboard>
            <div class="left-tip">{{$t('Biz.Settlement.Tip40')}}</div>
            <input type="text" ref="codeInput" v-model="code" :placeholder="$t('Biz.Settlement.Tip41')" v-judge>
          </form>
        </div>
        <div v-show="!scanned" class="ScanCodeLeft-keyboard">
          <KeyBoard @chopstickenter="chopstickenter" ref="keyboard"></KeyBoard>
        </div>
        <div v-show="scanned" class="scanned">
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
          <button type="button" @click="onlinepayRetryPay">{{$t('Biz.Settlement.SweepCodeReturnBtn')}}(Enter)</button>
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
        <div class="right-btn cursor" @click="enforceSettle('')">
          <div >
            <span class="manualConfirmation">{{$t('Biz.Settlement.CompulsorySettlement')}}</span>
          </div>
          <div class="right-btn-tip">{{$t('Biz.Settlement.SpCodePaySuccessMsg01')}}</div>
        </div>
        <div class="right-btn cursor" @click="CancellationOfPayment">
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
import { mapGetters, mapMutations } from 'vuex';
import ajax from '@/common/js/ajax';
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
      scannedErrorMsg: this.$t('Dict.TryAgain'), // 失败信息  默认（请返回重试）
      payStatus: 0,
      isOvertime: false,
      code: '', // 输入的支付码
      status: 0, // 状态
      timer: null,
      isOnePunch: false,
      onePunch: {
        dialogTitle: this.$t('Dict.SweepCodePayment'),
        bodyTitle: this.$t('Biz.Settlement.OnePunch'),
        inputTitle: this.$t('Biz.Settlement.ScanHandLiveCode'),
        inputPlaceHolder: this.$t('Biz.Settlement.ScanHandLiveCodeOrActive'),
      },
      queryStateTimer: null,
    };
  },
  computed: {
    ...mapGetters([
      'outDeviceSetting',
      'posInfo',
      'getVuexPosMode',
    ]),
    // 添加快捷键
    ScanCodePaymentCode() {
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
    this.$von('closeSettleDialog', () => {
      this.$log.info('中餐扫码付窗口被调用关闭');
      this.close();
    });
    this.$von('fastfoodCloseSettleDialog', () => {
      this.$log.info('快餐扫码付窗口被调用关闭');
      this.close();
    });
    this.$von('stopScanPayQueryState', () => {
      clearInterval(this.queryStateTimer);
      this.queryStateTimer = null;
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
    ...mapMutations({
      setIsBatchOperation: 'IS_BATCH_OPERATION',
    }),
    checkScanned() {
      if (this.scanned) {
        this.onlinepayRetryPay();
      } else {
        this.clickEnter();
      }
    },
    chopstickenter() {
      this.clickEnter();
    },
    handleBeforeClose() {
      this.CancellationOfPayment();
    },
    onOpen() {
      this.zero();
      this.ScanCodeData = this.resData.data;
      this.isOnePunch = this.ScanCodeData.isOnePunch || false;
      setTimeout(() => {
        this.$refs.codeInput.focus();
      }, 200);

      this.$vonce('authCode', (code) => {
        this.enforceSettle(code);
      });
    },
    onClose() {
      clearInterval(this.queryStateTimer);
      clearTimeout(this.timer);
      this.queryStateTimer = null;
    },
    enforceSettle(code = {}, dialog = 'ScanCode', ScanCodeData = this.ScanCodeData) {
      this.$emit('enforceSettle', code, dialog, ScanCodeData);
    },
    manualSettle() {
      this.$emit('manualSettle', this.ScanCodeData.paytypeid);
    },
    CancellationOfPayment() {
      this.preclose = true;
      const tip = this.$refs.tipInner.innerHTML;
      this.$confirm(tip, `${this.$t('Dict.Tips')}`, {
        dangerouslyUseHTMLString: true,
        confirmButtonText: `${this.$t('Dict.Sure')}`,
        cancelButtonText: this.$t('Dict.Cancel'),
        type: 'warning',
      }).then(() => {
        // 获取结算页面信息
        ajax('canyin.pos.settlement.cancelpresettle', {
          params: { bsId: this.ScanCodeData.bs_id },
        }).then((res) => {
          if (res.result == '1') {
            this.close();
            this.$message({
              type: 'success',
              message: `${this.$t('Biz.Settlement.CancelSuccess')}`,
            });
            this.zero();
            this.$emit('clearOnlinePayWay');
          } else {
            this.$message({
              type: 'error',
              message: res.msg,
            });
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
    clickEnter() {
      this.isOvertime = false;
      if (!this.preclose) {
        if (this.code === '') {
          this.$message.info(`${this.$t('Dict.PleaseScanCode')}`);
        } else {
          this.scancodepay();
        }
      }
    },
    scancodepay() {
      this.scanned = true;
      ajax('canyin.pos.settlement.pay.scancodepay.paymentcodepay', {
        contentType: 'URIEncoded',
        data: {
          paytypeid: this.ScanCodeData.paytypeid,
          paywayid: this.resData.payWay.id,
          orderid: this.resData.baseBs.code,
          barCode: this.code,
          money: this.ScanCodeData.paymoney,
          status: this.payStatus,
          bsId: this.resData.baseBs.id,
          printData: '',
          items: null,
          controlMode: this.posInfo.controlMode,
        },
      }).then((res) => {
        this.scannedErrorMsg = res.msg ? res.msg : null;
        this.payStatus = res.status;
        if (res.paytypeid) {
          this.ScanCodeData.paytypeid = res.paytypeid;
        }
        if (res.status !== 1) {
          clearTimeout(this.timer);
          this.scannedError = true;
          this.scannedErrorMsg = res.msg ? res.msg : `${this.$t('Dict.TryAgain')}`;
        } else {
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
        }
      });
    },
    queryState() {
      ajax('canyin.pos.settlement.pay.querybsstate', {
        loading: false,
        contentType: 'URIEncoded',
        data: { bsId: this.resData.baseBs.id },
      }).then((data) => {
        if (data.state === 1 && this.queryStateTimer) {
          this.$log.info(`主动请求的${data.bsCode}成功`);
          this.$message({
            type: 'success',
            message: this.$t('Biz.Settlement.IndexMsg8', [data.bsCode]),
            customClass: 'message-top1 message-small',
          });
          if (this.getVuexPosMode === '3') {
            console.info('TCSLCMD=AllowCloseBrowser');
            this.$vemit('fastClearEmptyBill');
            this.$vemit('fastfoodCloseSettleDialog');
          } else {
            this.$vemit('closeSettleDialog');
            if (this.$route.params.tableId) {
              this.$router.push('/pos/order');
            }
            this.setIsBatchOperation(false);
            this.$vemit('clearEmptyBill', {});
            this.$vemit('resetOrderSearchText');
          }
        }
      });
    },
    hasCashPayWay(haveUsePayWay) {
      let re = false;
      haveUsePayWay.forEach((paywayData) => {
        if (paywayData.type === 2 && paywayData.payway_type_id == '501') {
          re = true;
        }
      });
      return re;
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
      this.scannedErrorMsg = `${this.$t('Dict.TryAgain')}`;
      this.payStatus = 0;
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
    /*color: #ffffff;*/
    /*text-decoration: line-through;*/
  }
  .price {
    font-size: 37px;
    font-weight: bold;
    margin-top: 20px;
    margin-bottom: 25px;
    color: black;
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
