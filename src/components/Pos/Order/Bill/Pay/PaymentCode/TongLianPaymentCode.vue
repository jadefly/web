<!--通联银行卡和聚合支付公用的此页面，通过whichOpen来区分-->
<template>
  <Dialog
      name="PosDialog.TongLianPaymentCode"
      :title="whichOpen === '0' ? $t('Biz.Settlement.TongLian') : '建行Pos银行卡'"
      ref="dialog"
      @close="onClose"
      @open="onOpen"
      @submit="onSubmit"
      :beforeClose="beforeClose"
      :hotkeys="AlipayPaymentCode"
      :isPaymentCode="false"
      :append-to-body="true"
      :showSubmit="true"
      :closeByEsc="!loading"
      submit-text="确认"
      width="700px"
      height="590px"
    >
    <div class="Alipay">
      <div class="AlipayLeft">
        <form action="javascript:void(0)" v-keyboard:keyboard="{ autoSelect: true }">
          <h3>
            <span>{{$t('Biz.Settlement.AmountToPaid01')}}</span>
            <span class="line-through">
              <span class="money">{{ shouldPayMoney }}</span>
            </span>
          </h3>
          <div class="form-item">
            <span>{{ $t('Biz.Settlement.PaymentAmount') }}</span>
            <el-input
              type="text"
              ref="codeInput"
              v-model="inputMoney"
              :placeholder="$t('Dict.PleaseEnterPayAmount')"
              v-judge
            ></el-input>
          </div>
          <div class="form-item" v-if="whichOpen === '0'">
            <span>{{ $t('Dict.CardNumberLabel') }}</span>
            <el-input
              type="text"
              :disabled="isDisabled"
              v-model="cardNo"
              placeholder="$t('Biz.Settlement.EnterBankCardNumber)"
              v-judge
            ></el-input>
          </div>
        </form>
        <!--虚拟键盘-->
        <div class="AlipayLeft-keyboard">
          <KeyBoard v-show="!scanned" @chopstickenter="chopstickenter" ref="keyboard"></KeyBoard>
          <div v-show="scanned" class="scanned">
            <div class="module-onlinepay" v-if="scannedError">
              <h4><i class="icon icon-error"></i><span>出现了错误</span></h4>
              <strong>{{scannedErrorMsg}}</strong>
            </div>
            <div class="module-onlinepay" v-else>
              <h4>
                <i class="icon icon-loading"></i>
                <span :class="isOvertime ? 'overtimecolor' : null">
                {{isOvertime ? '未收到支付信息，请根据顾客支付状态选择合适操作完成结算！':'交易进行中，请等待…'}}
              </span>
              </h4>
              <strong v-show="!isOvertime">交易成功后，会自动关闭页面</strong>
            </div>
            <button type="button" @click="onlinepayRetryPay">返回扫码页面(Enter)</button>
          </div>
        </div>
      </div>
      <div class="AlipayRight">
        <div class="AlipayRight-tip">
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
            <span class="shortcutKey">(F1)</span>
          </div>
          <div class="right-btn-tip">{{$t('Biz.Settlement.SpCodePaySuccessMsg01')}}</div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import { cloneDeep } from 'lodash';
import ajax from '@/common/js/ajax';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

export default {
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin],
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      cardNo: '', // 银行卡号
      shouldPayMoney: 0, // 待支付金额
      inputMoney: 0, // 输入的支付金额
      isDisabled: true, // 禁止卡号输入
      whichOpen: '0', // '0'是通联 '1'是聚合支付
      scanned: false, // 此属性只与判断聚合支付逻辑中是否刷过卡
      scannedError: false, // 此属性只与判断聚合支付逻辑中是否刷过卡后是否出错
      scannedErrorMsg: '请返回重试', // 聚合支付刷卡后失败信息
      isOvertime: false, // 聚合支付是否超时
    };
  },
  computed: {
    ...mapGetters([
      'outDeviceSetting',
      'posInfo',
    ]),
    // 添加快捷键
    AlipayPaymentCode() {
      if (this.loading) return {};
      return {
        // 确认
        PgDn: () => {
          this.onSubmit();
        },
        // 手动确认
        PgUp: () => {
          this.manualSettle();
        },
        // 强制结算
        F1: () => {
          this.enforceSettle();
        },
      };
    },
  },
  watch: {
    inputMoney(newV) {
      this.$nextTick(() => {
        this.inputMoney = this.onlyNumber(newV);
        if (this.inputMoney > this.shouldPayMoney) {
          this.inputMoney = this.shouldPayMoney;
        }
      });
    },
  },
  created() {
    // 监听快餐关闭结算窗口事件
    this.$von('closeSettleDialog', () => {
      this.$log.info('中餐支付宝扫码付窗口被调用关闭');
      this.close();
    });
    this.$von('fastfoodCloseSettleDialog', () => {
      this.$log.info('快餐支付宝扫码付窗口被调用关闭');
      this.close();
    });
  },
  methods: {
    beforeClose(cb) {
      if (this.scanned) {
        this.$confirm(
        <div class="CancellationOfPayment">
          <div>
          交易正在进行中，确定要<span class="cancellation">关闭页面</span>?
          </div>
          <div class="tip">建议先检查顾客支付状态，</div>
        <div class="tip">
          若顾客支付成功您可以点击[手动确认]或者[强制结算]进行添加结算方式操作
        </div>
        </div>,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        },
        ).then(() => {
          cb();
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消操作',
          });
        });
      } else {
        cb();
      }
    },
    onlyNumber(val, fixed = 2) {
      let str = '';
      const tmp = new RegExp(`^(\\-)*(\\d+)\\.(\\d{0,${fixed}}).*$`, 'g');
      str += val;
      str = str.replace(/[^\d.]/g, '');
      str = str.replace(/\.{2,}/g, '.');
      str = str.replace('.', '$#$');
      str = str.replace(/\./g, '');
      str = str.replace('$#$', '.');
      str = str.replace(tmp, '$1$2.$3');
      if (str.indexOf('.') === 0 && str !== '') {
        str = '';
      }
      if (str.indexOf('.') < 0 && str !== '') {
        str = parseFloat(str);
      }
      return str;
    },
    chopstickenter() {
      this.onSubmit();
    },
    onSubmit() {
      if (this.loading) return;
      if (!this.inputMoney) {
        this.$message.warning(`${this.$t('Biz.Settlement.EnterAmount')}`);
        return;
      }
      const params = {
        money: this.inputMoney,
        cardNo: this.cardNo,
        whichOpen: this.whichOpen,
      };
      const result = this.submit(params);
      // 聚合支付返回promise对象  通联返回null
      if (result) {
        this.scanned = true;
        result.then((res) => {
          if (!res.success) {
            this.scannedError = true;
            this.scannedErrorMsg = `${res.msg}`;
          } else {
            this.scanned = false;
            this.close();
            this.$emit('refreshBill');
          }
        });
      }
    },
    onOpen() {
      this.zero();
      this.shouldPayMoney = this.resData.money;
      this.inputMoney = this.resData.money;
      this.whichOpen = this.resData.whichOpen;
      this.$nextTick(() => {
        this.$refs.codeInput.focus();
        if (this.$refs.keyboard) {
          this.$refs.keyboard.reSelect();
        }
      });
    },
    onClose() {
      clearTimeout(this.timer);
      this.cardNo = '';
      this.shouldPayMoney = 0;
      this.inputMoney = 0;
      this.whichOpen = '0';
      this.scanned = false;
      this.scannedError = false;
      this.scannedErrorMsg = '请返回重试';
    },
    enforceSettle() {
      if (this.loading) return;
      const params = {
        money: this.inputMoney,
        cardNo: this.cardNo,
        which: this.whichOpen,
      };
      this.$emit('tongLianEnforceSettle', params);
    },
    manualSettle() {
      if (this.loading) return;
      const params = {
        money: this.inputMoney,
        cardNo: this.cardNo,
        which: this.whichOpen,
      };
      this.$emit('tongLianManualSettle', params);
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
    onlinepayRetryPay() {
      this.cardNo = '';
      this.scanned = false;
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
.Alipay {
  height: 100%;
  display: flex;
}
.overtimecolor{
  color:#f00 !important;
}
.AlipayLeft {
  width: 430px;
  height: 100%;
  background: #fff;
  padding: 20px;
  text-align: center;
  form {
    > h3 {
      text-align: left;
      font-size: 15px;
      font-weight: bold;
      margin-bottom: 15px;
      .line-through {
        color: #ffffff;
        text-decoration: line-through;
      }
      span {
        color: #000000;
      }
    }
    .form-item {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      > span {
        width: 110px;
        text-align: left;
      }
      > input {
        flex: 1;
      }
    }
  }
  .name {
    font-size: 20px;
    font-weight: bold;
    vertical-align: middle;
  }
  .price {
    font-size: 37px;
    font-weight: bold;
    margin-top: 20px;
    margin-bottom: 25px;
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
</style>
