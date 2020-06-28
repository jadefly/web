<template>
  <Dialog
      name="PosDialog.ShekHuiPaymentCode"
      :title="$t('Dict.SweepCodePayment')"
      ref="dialog"
      @close="onClose"
       @handleBeforeClose="handleBeforeClose"
      @open="onOpen"
      :hotkeys="ShekHuiPaymentCode"
      :showClose="false"
      :isPaymentCode="true"
      :append-to-body="true"
      width="700px"
      height="590px"
    >
    <div class="ShekHui">
      <div class="ShekHuiLeft">
        <div>
          <img src="../images/ShekHui.png" alt="">
          <span class="name">{{$t('Biz.Settlement.SheHuiPay')}}</span>
        </div>
        <div class="line-through">
          <div class="price">{{ScanCodeData.paymoney}}</div>
        </div>
        <div v-if="!scanned">
          <form action="javascript:void(0)" v-keyboard:keyboard>
            <div class="left-tip">{{$t('Biz.Settlement.Tip44')}}</div>
            <input type="text" v-model="code" ref="codeInput" :placeholder="$t('Biz.Settlement.Tip44')">
          </form>
        </div>
        <div class="ShekHuiLeft-keyboard"  v-if="!scanned">
          <KeyBoard @chopstickenter="chopstickenter" ref="keyboard"></KeyBoard>
        </div>
        <div v-if="scanned" class="scanned">
         <div class="module-onlinepay" v-if="!scannedError">
            <h4>
              <i class="icon icon-loading"></i>
              <span :class="isOvertime ? 'overtimecolor':null">
                {{isOvertime ? `${$t('Biz.Settlement.AlipayTipsText')}` : `${$t('Biz.Settlement.AlipayTipsText01')}`
                }}
             </span>
            </h4>
            <strong v-show="!isOvertime">{{$t('Biz.Settlement.AlipayTipsText02')}}</strong>
        </div>
          <div class="module-onlinepay" v-if="scannedError">
            <h4><i class="icon icon-error"></i><span>{{$t('Dict.AnErrorHasOccurred')}}</span></h4>
            <strong>{{scannedErrorMsg}}</strong>
          </div>
          <button type="button" @click="onlinepayRetryPay">{{$t('Biz.Settlement.SweepCodeReturnBtn')}}(Enter)</button>
        </div>
      </div>
      <div class="ShekHuiRight">
        <div class="ShekHuiRight-tip">
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
          <div>
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
      ScanCodeData: {},
      scanned: false, // 已经扫过码
      preclose: false, // 准备关闭弹窗状态
      scannedError: false, // 失败
      scannedErrorMsg: `${this.$t('Dict.TryAgain')}`, // 失败信息  默认（请返回重试）
      payStatus: 0,
      isOvertime: false,
      code: '', // 输入的支付码
      status: 0, // 状态
      timer: null,
    };
  },
  computed: {
    ...mapGetters(['outDeviceSetting', 'posInfo']),
    ShekHuiPaymentCode() {
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
      this.$log.info('中餐闪惠扫码付窗口被调用关闭');
      this.close();
    });
    this.$von('fastfoodCloseSettleDialog', () => {
      this.$log.info('快餐闪惠扫码付窗口被调用关闭');
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
    handleBeforeClose(done) {
      this.CancellationOfPayment(done);
    },
    chopstickenter() {
      this.clickEnter();
    },
    onOpen() {
      this.zero();
      this.ScanCodeData = this.resData.data;
      setTimeout(() => {
        this.$refs.codeInput.focus();
      }, 200);
      this.$vonce('authCode', (code) => {
        this.enforceSettle(code);
      });
    },
    onClose() {
      clearTimeout(this.timer);
    },
    enforceSettle(code = {}, dialog = 'ShekHuiPaymentCode') {
      this.$emit('enforceSettle', code, dialog);
    },
    manualSettle() {
      this.$emit('manualSettle', this.ScanCodeData.paytypeid);
    },
    CancellationOfPayment(done) {
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
        `${this.$t('Dict.Tips')}`,
        {
          confirmButtonText: `${this.$t('Dict.Sure')}`,
          cancelButtonText: this.$t('Dict.Cancel'),
          type: 'warning',
          dangerouslyUseHTMLString: true,
        },
      ).then(() => {
        // 获取结算页面信息
        ajax('canyin.pos.settlement.cancelpresettle', {
          params: { bsId: this.ScanCodeData.bs_id },
        })
          .then((res) => {
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
      })
        .catch(() => {
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
      ajax('canyin.pos.settlement.pay.scancodepay.scancodepay', {
        timeout: 40000,
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
        if (res.status !== 1) {
          clearTimeout(this.timer);
          this.scannedError = true;
          this.scannedErrorMsg = res.msg ? res.msg : `${this.$t('Dict.TryAgain')}`;
        } else {
          this.timer = setTimeout(() => {
            this.isOvertime = true;
          }, 70000);
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
.ShekHui {
  height: 100%;
  display: flex;
}
.overtimecolor{
  color:#f00 !important;
}
.ShekHuiLeft {
  width: 430px;
  height: 100%;
  background: #fff;
  padding: 20px;
  text-align: center;
  .name {
    font-size: 20px;
    font-weight: bold;
    vertical-align: text-top;
  }
  .line-through {
    /*color: #ffffff;*/
    /*text-decoration: line-through;*/
  }
  .price {
    margin-top: 20px;
    margin-bottom: 25px;
    font-size: 37px;
    font-weight: bold;
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
  .ShekHuiLeft-keyboard {
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
.ShekHuiRight {
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
.ShekHuiRight-tip {
  font-size: 12px;
  margin-bottom: 30px;
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
