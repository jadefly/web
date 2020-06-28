<template>
  <Dialog
      name="PosDialog.ShekHuiQRCode"
      :title="$t('Dict.SweepCodePayment')"
      ref="dialog"
      @close="onClose"
      @open="onOpen"
      :hotkeys="ShekHuiQRCode"
      :append-to-body="true"
      width="700px"
      height="650px"
    >
    <template slot="other-button">
      <button
        id="ShekHuiQRCodeCloseBtn"
        type="button"
        class="btn btn-default"
        @click="CancellationOfPayment"
      >
        {{$t('Dict.Close')}}(Esc)
      </button>
    </template>
    <div class="ShekHui">
      <div class="ShekHuiLeft">
        <div>
          <img src="../images/ShekHui.png" alt="">
          <span class="name">{{$t('Biz.Settlement.SheHuiQr')}}</span>
        </div>
        <div class="line-through">
          <div class="price">{{qrCodeData.paymoney}}</div>
        </div>
        <div class="left-tip">{{$t('Biz.Settlement.Tip46')}}</div>
        <div class="ShekHuiLeft-QRCode">
          <img alt="" v-bind:src="'data:image/jpeg;base64,' + qrCodeData.qrcode_img">
        </div>
        <div class="printPreform" @click="printPre">
          <span>{{$t('Biz.Settlement.PrintPreM')}}</span>
          <span class="shortcutKey">(PgDn)</span>
        </div>
        <div class="bottom-tip">{{$t('Biz.Settlement.Tip39')}}</div>
      </div>
      <div class="ShekHuiRight">
        <div class="ShekHuiRight-tip">
          <i class="icon icon-tishi"></i>
          {{$t('Biz.Settlement.AlipayErrorMsg01')}}
        </div>
        <div class="right-btn cursor"  @click="manualSettle">
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
      </div>
    </div>
  </Dialog>
</template>

<script>
import $ from 'jquery';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  data() {
    return {
      qrCodeData: {},
      isTablePay: false, // 是否是桌边付二维码
    };
  },
  computed: {
    ShekHuiQRCode() {
      return {
        // 打印预结单
        PgDn: () => {
          this.printPre();
        },
        // 手动确认
        PgUp: () => {
          this.manualSettle();
        },
      };
    },
  },
  created() {
    // 监听快餐关闭结算窗口事件
    this.$von('closeSettleDialog', () => {
      this.$log.info('中餐闪惠二维码窗口被调用关闭');
      this.close();
    });
    this.$von('fastfoodCloseSettleDialog', () => {
      this.$log.info('快餐闪惠二维码窗口被调用关闭');
      this.close();
    });
  },
  methods: {
    onOpen() {
      $('#ShekHuiQRCodeCloseBtn').siblings().css('display', 'none');
      this.qrCodeData = this.resData;
      this.isTablePay = this.resData.isdeskpay === 1;
      this.$vonce('authCode', (code) => {
        this.enforceSettle(code);
      });
    },
    enforceSettle(authData = {}, dialog = 'ShekHuiQRCode') {
      if (this.isTablePay) {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning45')}`);
        return;
      }
      this.$emit('enforceSettle', authData, dialog);
    },
    manualSettle() {
      if (this.isTablePay) {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning45')}`);
        return;
      }
      this.$emit('manualSettle', this.qrCodeData.paytypeid);
    },
    CancellationOfPayment() {
      this.$emit('closeQRcodeFun');
      this.close();
    },
    printPre() {
      this.$emit('payPreformPrint');
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
  .ShekHui{
    height: 100%;
    display: flex;
  }
  .ShekHuiLeft{
    width: 430px;
    height: 100%;
    background: #fff;
    padding: 20px;
    text-align: center;
    .name{
      font-size: 20px;
      font-weight: bold;
      vertical-align: text-top;
    }
    .line-through {
      /*color: #ffffff;*/
      /*text-decoration: line-through;*/
    }
    .price{
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
    .ShekHuiLeft-QRCode{
      width: 230px;
      height: 230px;
      padding: 15px;
      margin: auto;
      border: 1px solid #b5b5b5;
      margin-top: 5px;
      img{
        width: 100%;
        height: 100%;
      }
    }
    .left-tip{
      color: #b5b5b5;
    }
    .printPreform{
      width: 230px;
      height: 50px;
      border: 1px solid #b5b5b5;
      border-radius: 5px;
      margin: 20px auto;
      line-height: 50px;
      cursor: pointer;
    }
    .shortcutKey{
        color: #A2A2A2;
      }
    .bottom-tip{
      color: #b5b5b5;
      font-size: 12px;
    }
  }
  .ShekHuiRight{
    width: 270px;
    padding: 20px 15px;
    i.icon{
      display: inline-block;
      margin-bottom: 2px;
      margin-right: 5px;
    }
    .right-btn{
      border: 1px solid #b5b5b5;
      border-radius: 5px;
      width: 228px;
      min-height: 80px;
      margin: auto;
      text-align: center;
      padding: 15px;
      background: #fff;
      margin-bottom: 20px;
      .right-btn-tip{
        font-size: 12px;
        color: #A2A2A2;
      }
      .manualConfirmation{
        font-size: 17px;
        font-weight: bold;
      }
      .shortcutKey{
        color: #A2A2A2;
      }
    }
  }
  .ShekHuiRight-tip{
    font-size: 12px;
    margin-bottom: 30px;
  }

  .CancellationOfPayment{
    .cancellation{
      color: #0babb9;
      font-weight: bold;
    }
    .tip{
      font-size: 13px;
      color: #616363;
    }
  }
</style>
