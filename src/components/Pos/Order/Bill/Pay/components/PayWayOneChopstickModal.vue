<template>
  <Dialog
    name="PosDialog.PayWayOneChopstickModal"
    :title="payWayInfo.name"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :hotkeys="PayWayOneChopstickModal"
    :append-to-body="true"
    :showSubmit="showConfirm"
    width="700px"
  >
  <div class="content-warp">
    <div class="voucher-warp">
      <p class="voucher-title">{{$t('Biz.Coupon.EnterTicketNumber')}}</p>
      <div class="search-area">
        <div class="search" v-keyboard:keyboard>
          <el-input
            :placeholder="$t('Biz.Coupon.EnterTicketNumber')"
            v-model="ticketInput"
            @blur="blur"
            ref="ticketInput"
            :disabled="isCanClickBtnInput"
            v-judge
            @keyup.native="inputEnter">
          </el-input>
        </div>
        <div class="search-btn">
          <button
            type="button"
            class="btn btn-primary"
            :disabled="isCanClickBtnInput"
             @click="inquiryTicketInfo">
            {{$t('Dict.Search')}}
          </button>
        </div>
      </div>
      <div class="keyboard-area">
        <KeyBoard class="keyboard" ref="keyboard" @chopstickenter="chopstickenter"></KeyBoard>
      </div>
    </div>
    <div class="info-warp">
      <div class="amount-overview">
        <div
         class="money-item" v-if="isWaitMoney">
          <span class="title">
            <b>{{$t('Biz.Settlement.AmountToPaid01')}}</b></span>
            <span class="line-through">
              <span class="money to-be-pay">{{ amountToBePaid }}</span>
            </span>
          </div>
        <div class="money-item">
          <span class="title">
            {{$t('Biz.Settlement.TotalConsumptionAmount')}}</span><span class="money">
            {{this.bsData.orig_total}}
          </span>
        </div>
        <div class="money-item">
          <span class="title">{{$t('Biz.Settlement.NotParticipate')}}</span>
          <span class="money">{{noDiscountMoney}}</span>
        </div>
      </div>
      <div class="consumer-overview">
        <div class="money-item">
          <span class="title">{{$t('Biz.Settlement.CanBeDeducted')}}</span>
          <span class="money consumer">{{currentCanDiscountMoney}}</span>
        </div>
        <div class="money-item">
          <span class="title">{{$t('Biz.Settlement.VoucherRemainingTm')}}</span>
          <span class="money">{{leavingsConsumeMoney}}</span>
        </div>
        <p class="tips">
          <i class="el-icon-warning"></i>{{$t('Biz.Settlement.ShopDiscount')}}{{discountRate}}
        </p>
        <p class="logo-warp">
          <img class="logo" src="@/common/images/sl-msg/yikuailao2.png" alt="一筷捞">
        </p>
      </div>

    </div>
  </div>
  </Dialog>
</template>

<script>
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import numberformat from '@/common/js/numberformat';

export default {
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin],
  props: ['bsData', 'amountToBePaid'],
  data() {
    return {
      payWayInfo: {
        name: '',
      },
      ticketInput: '', // 输入框券码
      isCanClickBtnInput: false, // 输入框 和按钮禁点 默认可点
      shownPageInfo: false, // 记录当前页面是否有查询到券码信息 默认没有
      noDiscountMoney: 0, // 不参与优惠金额
      showConfirm: true, // 显示确认按钮
      isWaitMoney: true, // 是否显示待支付金额,默认显示
      currentCanDiscountMoney: 0, // 本单可抵扣金额
      discountRate: 0, // 展示本单折扣比例
      leavingsConsumeMoney: 0, // 剩余太母
    };
  },
  filters: {
    keepTwo(val) {
      return numberformat(val);
    },
  },

  computed: {
    // 添加快捷键
    PayWayOneChopstickModal() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  methods: {

    onOpen() {
      this.payWayInfo = this.resData;
      // 打开页面输入框获取焦点
      this.$nextTick(() => {
        this.$refs.ticketInput.focus();
      });
      // 打开一筷捞页面激活查询输入框和查询按钮 可编辑 可点击
      this.isCanClickBtnInput = false;
      const params = {
        bsId: this.bsData.id,
        totalAmount: this.bsData.orig_total, // 总消费金额
      };
      // 打开一筷捞结算方式时
      ajax('canyin.pos.settlement.pay.chopstickpayway.selectcoupon', {
        contentType: 'URLEncoded',
        data: params,
      }).then((res) => {
        if (res.result.code === '1') {
          // // 已核销 直接返回頁面信息
          // if (res.result.data !== null) {
          //     this.shownPageInfo = false;
          if (res.result.data.discountAmount) {
            this.shownPageInfo = true;
            // 已核销不显示确定按钮
            this.showConfirm = false;
            // 不显示待支付金额信息
            this.isWaitMoney = false;
            // 显示输入框券码
            this.ticketInput = res.result.data.couponCode;
            // 查询输入框不可编辑  查询按钮不可点击
            this.isCanClickBtnInput = true;
            // 渲染一筷捞结算页面
            this.renderYikuailao(res.result.data);
          } else {
            this.noDiscountMoney = res.result.data.unFavourableAmount;
          }
          // } else {
          //   this.shownPageInfo = false;
          //   //打开一筷捞查询界面不进行任何操作
          // }
        } else if (res.result.code === '0') {
          // 打开一筷捞查询界面不进行任何操作
          this.shownPageInfo = false;
          this.noDiscountMoney = res.result.data.unFavourableAmount;
        }
      });
    },
    // 输入框失去焦点事件
    blur() {
      this.validateTicketRule();
    },
    inputEnter(e) {
      this.validateTicketRule();
      // 验券
      if (e.keyCode === 13) {
        this.inquiryTicketInfo();
      }
    },
    // 渲染填充一筷捞结算方式页面
    renderYikuailao(pagedata) {
      // 展示不参与优惠金额
      this.noDiscountMoney = pagedata.unFavourableAmount;
      // 展示本单可抵扣金额
      this.currentCanDiscountMoney = pagedata.discountAmount;
      // 展示店铺折扣比例
      this.discountRate = pagedata.discount;
      // 展示剩余消费金额
      this.leavingsConsumeMoney = pagedata.consumeMoney;
    },
    // 验证券码输入格式方法
    validateTicketRule() {
      const reg = /\D/g;
      if (reg.test(this.ticketInput)) {
        this.$message.error(`${this.$t('Biz.Settlement.Error21')}`);
        return false;
      }
      return undefined;
    },
    // 虚拟键盘回车事件
    chopstickenter() {
      this.inquiryTicketInfo();
    },
    // 查询信息方法
    inquiryTicketInfo() {
      // 查询之前先验证券码格式是否输入正确
      this.validateTicketRule();
      // 判断输入券号长度是否为12位
      if (this.ticketInput.length !== 12) {
        this.$message.error(`${this.$t('Biz.Settlement.Error21')}`);
        return;
      }
      const params = {
        bsId: this.bsData.id,
        couponCode: this.ticketInput, // 券码
        totalAmount: this.bsData.orig_total, // 总消费金额
      };
      ajax('canyin.pos.settlement.pay.chopstickpayway.generatecoupon', {
        contentType: 'URLEncoded',
        data: params,
      }).then((res) => {
        if (res.result.code === '0') {
          this.shownPageInfo = true;
          // 获取一筷捞页面信息 渲染页面
          this.renderYikuailao(res.result.data);
          // 查询输入框不可编辑  查询按钮不可点击
          this.isCanClickBtnInput = true;
          this.$message({
            type: 'success',
            message: res.result.data.message,
          });
        } else if (res.result.code === '-1') {
          this.shownPageInfo = false;
          // 返回错误信息
          this.$message({
            type: 'error',
            message: res.result.message,
          });
        }
      });
    },
    // 点击提交 核销
    onSubmit() {
      this.ticketCancelDebt();
    },
    onClose() {
      this.ticketInput = '';// 输入框券码
      this.isCanClickBtnInput = false;// 输入框 和按钮禁点 默认可点
      this.shownPageInfo = false;// 记录当前页面是否有查询到券码信息 默认没有
      this.showConfirm = true;
      this.isWaitMoney = true;
      this.noDiscountMoney = 0;// 不参与优惠金额
      this.currentCanDiscountMoney = 0;// 本单可抵扣金额
      this.discountRate = 0;// 展示本单折扣比例
      this.leavingsConsumeMoney = 0;// 剩余太母
    },
    ticketCancelDebt() {
      // 核销之前先判断当前页面是否有可用券信息   没有不能核销
      if (!this.shownPageInfo) {
        this.$message.error(`${this.$t('Biz.Settlement.Error22')}`);
        return;
      }
      // 判断待支付金额和消费金的关系如果待支付金额小于抵扣金额 不能核销
      // 待支付金额
      const waitpay = Number(this.amountToBePaid);
      // 本单可抵扣金额
      const ccdiscountmoney = Number(this.currentCanDiscountMoney);
      // 当本单可抵扣金额可以为0时不允许核销
      if (ccdiscountmoney === 0) {
        this.$confirm(`${this.$t('Biz.Settlement.Tip5')}`, `${this.$t('Dict.Tips')}`, {
          confirmButtonText: `${this.$t('Dict.Sure')}`,
          cancelButtonText: this.$t('Dict.Cancel'),
          type: 'info',
          showClose: false,
          showConfirmButton: false,
        }).then(() => {
          // 暂不做任何处理
        }).catch(() => {

        });
      } else if (waitpay < ccdiscountmoney) {
        this.$confirm(`${this.$t('Biz.Settlement.Tip6')}`, `${this.$t('Dict.Tips')}`, {
          confirmButtonText: `${this.$t('Dict.Sure')}`,
          cancelButtonText: this.$t('Dict.Cancel'),
          type: 'info',
          showClose: false,
          showConfirmButton: false,
        }).then(() => {
          // 暂不做任何处理
        }).catch(() => {

        });
      } else {
        // 调用核销接口
        this.cancelAfterVerification(ccdiscountmoney);
      }
    },
    cancelAfterVerification(ccdiscountmoney) {
      this.payWayInfo = this.resData;
      // 进行核销
      const params = {
        bsId: this.bsData.id,
        needToPayAmount: ccdiscountmoney, // 待支付金额
      };
      ajax('canyin.pos.settlement.pay.chopstickpayway.consumecoupon', {
        contentType: 'URLEncoded',
        data: params,
      }).then((res) => {
        if (res.result.code === 0) {
          this.$log.info(`添加一筷捞结算支付信息：${this.payWayInfo}，take_money${ccdiscountmoney}`);
          this.$emit('refreshBill', '1');
          // 核销成功关闭页面
          this.close();
          this.$message({
            type: 'success',
            message: res.result.message,
          });
        } else if (res.result.code === -1) {
          // 返回错误信息 不关闭页面
          this.$message({
            type: 'error',
            message: res.result.message,
          });
        }
      });
    },
  },
};
</script>
<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.content-warp {
  display: table;
  width: 100%;
  > * {
    display: table-cell;
    vertical-align: top;
  }
}
.voucher-warp {
  padding: 16px;
  width: 440px;
  background-color: @white;
  .voucher-title {
    font-size: 14px;
    line-height: 2.2;
    color: #666;
  }
  .search-area {
    display: table;
    width: 100%;
    > * {
      display: table-cell;
    }
    .search {
      width: 282px;
    }
    .search-btn {
      padding-left: 8px;
      vertical-align: middle;
      button {
        width: 100%;
        height: 40px;
      }
    }
  }
  .keyboard-area {
    text-align: center;
    padding: 28px 0 12px;
    .keyboard {
      margin: 0 auto;
    }
  }
}

.info-warp {
  background-color: #f5f5f5;
  > div {
    padding: 12px;
  }
  .amount-overview {
    border-bottom: 1px dashed #ddd;
  }
  .money-item {
    font-size: 14px;
    line-height: 2.4;
    > span {
      display: inline-block;
    }
    span.title {
      width: 70%;
    }
    .money {
      width: 30%;
      font-size: 16px;
      font-weight: bold;
      text-align: right;
    }
  }
  .consumer-overview .money-item {
    line-height: 2.1;
  }
  .line-through {
    color: #ffffff;
    text-decoration: line-through;
  }
  .to-be-pay {
    font-size: 18px;
    color: #0babb9;
  }
  .consumer {
    font-size: 18px;
    color: #f00;
  }
  .tips {
    font-size: 13px;
    color: #999;
    .el-icon-warning {
      padding-right: 4px;
    }
  }
  .logo-warp {
    margin-top: 12px;
    text-align: center;
  }
  .logo {
    width: 142px;
  }
}
</style>
