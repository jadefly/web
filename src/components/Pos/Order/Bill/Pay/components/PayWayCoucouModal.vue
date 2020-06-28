<template>
  <Dialog
    name="PosDialog.PayWayCoucouModal"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :title="payWayInfo.name"
    :hotkeys="PayWayCoucouModal"
    :append-to-body="true"
    :showSubmit="true"
    ref="dialog"
    width="750px"
    top="10vh">
  <div class="content-warp">
    <div class="form-warp">
        <div class="tab-area">
          <div class="tab-item"
          :class="{'active':currentTab === 'voucher'}"
            @click="changeTab('voucher')">
            {{$t('Biz.Settlement.OnlineGiftCertificate')}}
          </div>
          <div
            class="tab-item" :class="{'active':currentTab === 'card'}"
            @click="changeTab('card')">
            {{$t('Biz.Settlement.OnlineGiftCard')}}
          </div>
        </div>
      <div class="form-area"  v-keyboard:keyboard>
        <div class="voucher-tab" v-show="currentTab === 'voucher'">
          <div class="form-item">
            <p class="form-title">{{$t('Biz.Settlement.EnterOnlineGiftCertificate')}}</p>
            <div class="valid-area">
              <div class="valid">
                <el-input
                  v-model="voucherNo"
                  ref="voucher"
                  @keyup.enter.native="voucherEnter"
                  :placeholder="$t('Biz.Coupon.EnterTicketNumber')"
                  v-judge>
                </el-input>
              </div>
              <div class="valid-btn">
                <button
                  type="button"
                  class="btn btn-primary"
                  @click="voucherEnter"
                  @keyup.enter="voucherEnter">
                  {{$t('Dict.Btn.CheckCoupon')}}
                  <span class="btn-tip">(Enter)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="voucher-tab" v-show="currentTab === 'card'">
          <div class="form-item">
            <p class="form-title">{{$t('Biz.Settlement.EnterOnlineGiftCard')}}</p>
            <div class="valid-area">
              <div class="valid">
                <el-input
                 v-model="cardNo"
                 ref="card"
                :disabled="IsCanDisabled"
                 @keyup.enter.native="cardEnter"
                 :placeholder="$t('Biz.Settlement.EnterCardNumber')"
                 v-judge>
                </el-input>
              </div>
              <div class="valid-btn">
                <button
                  type="button"
                  class="btn btn-primary"
                  :disabled="IsCanDisabled"
                  @click="cardEnter"
                  @keyup.enter="cardEnter">
                  {{$t('Biz.Settlement.CardInspection')}}
                  <span class="btn-tip">(Enter)</span>
                </button>
              </div>
            </div>
          </div>
          <div class="form-item" v-show="IsCardInput === false">
            <p class="form-title">
              {{$t('Biz.Settlement.EnterOnlineGiftCardMoney')}}
              <span class="card-remaining">{{$t('Biz.Settlement.CardBalance')}}<span class="money">{{ cardBalance }}</span></span>
            </p>
            <div :class="{warnInfo:showRedBorder}">
              <el-input
                :placeholder="$t('Dict.PleaseEnterPayAmount')"
                @keyup.native="payCardMoney"
                ref="tobePayInput"
                v-model="waitMoney"
                v-judge>
              </el-input>
            </div>
            <p class="input-warning"
              v-show="warningMessage"
              ref="warnMessage">
              {{$t('Biz.Settlement.ReEnter1')}}
            </p>
          </div>
        </div>
      </div>
      <div class="keyboard-area">
        <KeyBoard
          class="keyboard"
          @chopstickenter="chopstickenter"
          ref="keyboard">
        </KeyBoard>
      </div>
    </div>
    <div class="info-warp">
      <div class="overview-item">
        <div class="money-item"><span class="title">
          {{$t('Biz.Settlement.RemarkInfo')}}</span><span class="money">{{ this.bsData.code }}</span>
        </div>
        <div class="money-item"><span class="title">
          <b>{{$t('Dict.RealPaidAmount001')}}</b></span><span class="money to-be-pay">{{ this.bsData.last_total }} </span>
        </div>
      </div>
      <div class="overview-item itemListPbottom">
        <div class="money-item">
          <span class="title" style="width:45%">
            <b>{{$t('Biz.Settlement.OnlineConsumption')}}</b></span><span class="money danger" style="width:55%">
            {{ cardAndTicketMoney }}
          </span>
        </div>
        <p class="list-title">{{$t('Biz.Settlement.OnlineConsumptionDetail')}}</p>
        <div class="card-list"
          v-show="showList.length > 0">
           <!-- 礼品券 -->
          <div class="card-item"
            v-for="(item , index) in showList"
            :key="index">
            <div v-if="item.charge" class="charge-wrapper">
              <div class="money-info online-card">
                <p class="title">{{$t('Biz.Settlement.OnlineGiftCard')}}</p>
                <p class="money">{{item.charge}}</p>
              </div><!-- 此处不能换行 --><div class="deduction-info">
                <i class="el-icon-remove" @click="removeCard"></i>
                <p ref="ticketCode" class="code">{{item.ticketCode}}</p>
                <p class="name"><strong>{{$t('Biz.Settlement.AvailableBalance')}}:</strong>{{item.canUseBalance}}</p>
              </div>
            </div>
            <div v-else class="charge-wrapper">
              <div class="money-info">
                <p class="title">{{$t('Biz.Settlement.OnlineGiftCertificate')}}</p>
                <p class="money">{{item.itemPay}}</p>
              </div><!-- 此处不能换行 --><div class="deduction-info">
                <i class="el-icon-remove" @click="removeVoucher"></i>
                <p class="code">{{item.goodsCode}}</p>
                <p class="name">{{item.itemName}}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="pos-pager">
          <div class="pos-takeout-pager">
            <span class="page-info">{{
              $t('Dict.PageStyle.Text1', {
                length: list.length,
                currentPage,
                totalPage: pageCount(list),
              })
            }}</span>
            <button href="javascript:;" class="prev" @click="upPage">
              <i class="el-icon-arrow-up"></i>
            </button>
            <button href="javasctipt:;"
              class="next"
              @click="downPage(list)">
              <i class="el-icon-arrow-down"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="overview-item">
        <div class="money-item">
          <span class="title">
           {{$t('Biz.Settlement.AmountToPaid01')}}
          </span>
          <span class="line-through">
            <span class="money be-paid">{{tobeMoney}}</span>
          </span>
          </div>
      </div>
    </div>
  </div>
  </Dialog>
</template>

<script>
import _ from 'lodash';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import numberformat from '@/common/js/numberformat';
import PageMixin from '@/common/util/PaginationMixin';
// requestfrom 0 中餐 快餐更多结算里 打开线上礼品卡券页面时传0，结算界面撤销传1，快餐快速结算页面传2
export default {
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin, PageMixin],
  props: {
    bsData: {
      type: Object,
    },
    // 待付金额
    amountToBePaid: {
      default: 0,
    },
  },
  data() {
    return {
      payWayInfo: {
        name: '',
      },
      prePageSize: 5,
      currentTab: 'voucher',
      voucherNo: '',
      cardNo: '',
      // currentNav: 0,// 当前页签标识,0礼品券,1礼品卡
      waitMoney: '', // 余额输入框
      IsCardInput: true, // 是否显示卡内余额 和卡内余额输入框默认不显示
      showVoucherList: [],
      bsId: null, // 营业流水Id
      pointId: null, // 客位Id
      showCardList: null, // 首次打开加载礼品卡
      IsCanDisabled: false, // 礼品卡输入框是否禁用
      cardBalance: 0, // 卡内余额
      warningMessage: false, // 是否显示待支付金额输入框提示信息 默认不显示
      showRedBorder: false, // 默认不显示红框
      cardBalanceInfo: {},
    };
  },
  filters: {
    keepTwo(val) {
      return numberformat(val);
    },
  },
  computed: {
    // 添加快捷键
    PayWayCoucouModal() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
    showList() {
      return this.pagination(this.currentPage, this.prePageSize, this.list);
    },
    list() {
      const list = [...this.showVoucherList];
      if (this.showCardList) {
        list.push(this.showCardList);
      }
      return list;
    },
    // 券消费明细
    cardAndTicketMoney() {
      // console.log(this.list, this.showCardList,"章区")
      let num = 0;
      _.each(this.list, (item) => {
        if (item.itemPay) {
          const val = Number(item.itemPay);
          num = (num * 1000 * val * 1000) / 1000;
        }
      });
      if (this.showCardList) {
        num = (Number(this.showCardList.charge) * 10000 + Number(num) * 10000) / 10000;
      }
      return num;
    },
    // 待支付金额
    tobeMoney() {
      const lastTotal = this.bsData.last_total;
      return ((Number(lastTotal) * 10000 - (this.cardAndTicketMoney) * 10000) / 10000).toFixed(2);
    },
  },
  mounted() {
    // 撤销核销后的支付方式后清除已添加的线上礼品卡和线上礼品券
    this.$von('clearCardAndVoucherBus', () => {
      // 清除线上礼品卡数据
      this.showCardList = null;
      // 清除线上礼品券数据
      this.showVoucherList = [];
    });
  },
  methods: {
    onOpen() {
      this.payWayInfo = this.resData.payWay;
      // 营业流水bsId
      this.bsId = this.resData.bsId;
      // 客位Id pointId
      this.pointId = this.resData.pointId;
      this.payWayInfo.name = this.resData.payWay.name;
      this.currentTab = 'voucher';
      this.voucherNo = '';
      this.cardNo = '';
      // 打开页面默认选中礼品券输入框
      this.$nextTick(() => {
        this.$refs.voucher.focus();
      });
      // 打开页面展现上次所选礼品卡和礼品券
      this.showVoucherAndCard();
    },
    showVoucherAndCard() {
      const params = {
        bsId: this.bsId,
      };
      ajax('canyin.pos.settlement.pay.coucoupayway.opencouponpage', {
        contentType: 'URLEncoded',
        data: params,
      }).then((res) => {
        if (res.success === true) {
          const data = JSON.parse(res.data);
          if (res.data && data.giftCard) {
            // 展现上次礼品卡
            this.showCardList = data.giftCard;
          }
          if (res.data && data.voucher) {
            // 展现上次礼品券
            this.showVoucherList = data.voucher;
          }
          // 如果有礼品卡券 则隐藏礼品卡待支付金额输入框 并置灰请输入卡号,和验卡按钮
          this.list.forEach((item) => {
            if (item.cardName !== undefined) {
              this.IsCanDisabled = true;
              // 隐藏余额输入框
              this.IsCardInput = true;
            }
          });
        } else if (res.success === false) {
          this.$message({
            type: 'error',
            message: res.message,
          });
        }
      });
    },
    // 切换tab标签
    changeTab(tab) {
      this.currentTab = tab;
      this.$nextTick(() => {
        this.$refs[tab].focus();
      });
    },

    // 点击验券
    voucherEnter() {
      const tobepaidValue = Number(this.tobeMoney);
      const params = {
        bsId: this.bsId,
        requestFrom: 0,
        ticketCode: this.voucherNo,
        pageFrom: this.currentTab === 'voucher' ? 0 : 1, // 当前页签标识,0礼品券,1礼品卡
        needToPayAmount: tobepaidValue,
      };
      ajax('canyin.pos.settlement.pay.coucoupayway.selectcoupon', {
        contentType: 'URLEncoded',
        data: params,
      }).then((res) => {
        if (res.success === true) {
          if (Number(res.data.voucher[0].itemPay) > Number(this.tobeMoney)) {
            this.$confirm(`${this.$t('Biz.Settlement.Tip4')}`, `${this.$t('Dict.Tips')}`, {
              confirmButtonText: `${this.$t('Dict.Sure')}`,
              cancelButtonText: this.$t('Dict.Cancel'),
              type: 'warning',
              showClose: false,
              showCancelButton: false,
            }).then(() => false);
          } else {
            // 清空礼品券号输入框
            this.voucherNo = '';
            this.showVoucherList.push(res.data.voucher[0]);
            this.currentPage = this.pageCount(this.list);
          }
        } else if (res.success === false) {
          // 品项券查询失败弹出提示框
          this.$message({
            type: 'error',
            message: res.message,
          });
        }
      });
    },
    // 删除礼品券
    removeVoucher(e) {
      // 过滤出所要删除的券
      const ele = e.target.nextElementSibling.innerHTML;
      const removeData = _.filter(this.showVoucherList, item => item.goodsCode === ele);
      // 剔除所要删除的券
      this.showVoucherList = _.difference(this.showVoucherList, removeData);
      this.currentPage = this.pageCount(this.list);
    },
    // 点击验卡
    cardEnter() {
      const tobepaidValue = Number(this.tobeMoney);
      const params = {
        bsId: this.bsId,
        requestFrom: 0,
        ticketCode: this.cardNo,
        pageFrom: this.currentTab === 'voucher' ? 0 : 1, // 当前页签标识,0礼品券,1礼品卡
        needToPayAmount: tobepaidValue,
      };
      ajax('canyin.pos.settlement.pay.coucoupayway.selectcoupon', {
        contentType: 'URLEncoded',
        data: params,
      }).then((res) => {
        if (res.success === true) {
          // 显示卡内余额信息
          if (res.data && res.data.giftCard != null) {
            this.cardBalance = res.data.giftCard.balance;
          }
          // 记录卡余额信息
          this.cardBalanceInfo = res.data.giftCard;
          // 显示余额和余额输入框
          this.IsCardInput = false;
          this.$nextTick(() => {
            this.$refs.tobePayInput.focus();
          });
        } else if (res.success === false) {
          // 礼品卡查询失败提示
          this.$message({
            type: 'error',
            message: res.message,
          });
        }
      });
    },
    // 删除礼品卡
    removeCard() {
      // 获取所添加的卡号
      // 删除礼品卡
      this.showCardList = null;
      // 礼品卡输入框和验卡按钮可点
      this.IsCanDisabled = false;
      this.cardNo = '';
    },
    // 输入待支付金额
    payCardMoney(e) {
      // 回车事件
      this.validationGiftInput();
      if (e.key === 'Enter') {
        // 添加礼品卡
        this.addGiftVoucher();
      }
    },
    validationGiftInput() {
      // 匹配非负浮点数 只要两位小数
      const reg = /^\d+(\.\d{1,2})?$/;
      if (!reg.test(this.waitMoney) || Number(this.waitMoney) === 0) {
        if (this.waitMoney !== '') {
          //  展示错误信息
          this.warningMessage = true;
          this.$refs.warnMessage.innerHTML = `${this.$t('Biz.Settlement.EnterValidNumber')}`;
        } else {
          // 隐藏错误信息
          this.warningMessage = false;
          // 不显示红框
          this.showRedBorder = false;
        }
      } else {
        this.warningMessage = false;
        // 不显示红框
        this.showRedBorder = false;
        // 输入格式正确后校验数值
        // 余额输入框
        const giftBalanceValue = Number(this.waitMoney);
        // 卡内余额
        const ticketBalanceValue = Number(this.cardBalance);
        // 待支付金额
        const tobepaidValue = Number(this.tobeMoney);
        // 不能大于余额
        if (giftBalanceValue > ticketBalanceValue) {
          this.warningMessage = true;
          this.$refs.warnMessage.innerHTML = `${this.$t('Biz.Settlement.EnterOverstep1')}`;
        } else {
          this.warningMessage = false;
          // 不显示红框
          this.showRedBorder = false;
        }
        // 不能大于待支付金额
        if (giftBalanceValue > tobepaidValue) {
          this.warningMessage = true;
          this.$refs.warnMessage.innerHTML = `${this.$t('Biz.Settlement.EnterOverstep2')}`;
        } else {
          this.warningMessage = false;
          // 不显示红框
          this.showRedBorder = false;
        }
      }
    },
    addGiftVoucher() {
      if (!this.warningMessage && this.waitMoney !== '') {
        // 不显示红框
        this.showRedBorder = false;
        // 线上礼品卡余额
        const giftCardBalance = Number(this.cardBalance);
        // 线上礼品卡金额
        const giftCardMoney = Number(this.waitMoney);
        // 可用余额
        const differMoney = ((giftCardBalance * 10000 - giftCardMoney * 10000) / 10000).toFixed(2);
        this.showCardList = {
          cardName: `${this.$t('Biz.Settlement.OnlineGiftCard')}`,
          charge: giftCardMoney,
          ticketCode: this.cardNo,
          canUseBalance: differMoney,
          pwDetailId: this.cardBalanceInfo.pwDetailId,
        };
        // 隐藏余额输入框,隐藏余额
        this.IsCardInput = true;
        // 防止回车重复添加
        this.cardNo = `${this.$t('Biz.Settlement.OnlySupportOneGift')}`;
        // 置灰输入框 验卡券
        this.IsCanDisabled = true;
      } else {
        // 显示红框
        this.showRedBorder = true;
      }
    },
    // 点击提交
    onSubmit() {
      if (this.showRedBorder) {
        this.$message.error(`${this.$t('Biz.Settlement.BalanceEnterWrong')}`);
        return;
      }
      const cardAndVouchers = [];
      this.list.forEach((item) => {
        cardAndVouchers.push({
          pwDetailId: item.pwDetailId,
        });
      });
      // 没有线上礼品卡时默认值为空字符串
      let charges = ' ';
      if (this.IsCanDisabled) { // 如果添加的有线上礼品卡
        this.list.forEach((item) => {
          charges = item.charge;
        });
      }
      // 获取线上礼品卡券结算按钮信息
      this.payWayInfo = this.resData.payWay;
      const data = {
        bsId: this.bsId,
        requestFrom: 0,
        pointId: this.pointId,
        params: '',
        charge: charges,
        cardAndVouchers: JSON.stringify(cardAndVouchers),
      };
      ajax('canyin.pos.settlement.pay.coucoupayway.ensurecoupon', {
        contentType: 'URLEncoded',
        data,
      }).then((res) => {
        if (res.success === true) {
          this.$emit('refreshBill', '1');
          // 核销成功关闭页面
          this.close();
          // 如果当前卡和券的消费明细为 0
          // 为0有两种情况：1,打开页面什么也不做直接点确认。2,打开页面(不添加券的情况下)添加一张卡信息,然后删除卡
          if (this.cardAndTicketMoney !== 0) {
            this.$message.success(`${this.$t('Biz.Settlement.writtenOffOk')}`);
          }
        } else if (res.success === false) {
          // 接口请求错误返回错误信息
          this.$message({
            type: 'error',
            message: res.message,
          });
        }
      });
    },
    // 软键盘回车逻辑
    chopstickenter() {
      if (this.IsCardInput) {
        return;
      }
      // 回车事件
      this.validationGiftInput();
      // 添加礼品卡
      this.addGiftVoucher();
    },
    onClose() {
      // 关闭页面后清空卡信息
      this.showCardList = null;
      // 清空券方式列表
      this.showVoucherList = [];
      // 关闭页面后清除卡余额输入框金额
      this.waitMoney = '';
      // 关闭页面后卡输入框可点,验卡按钮可点
      this.IsCanDisabled = false;
      // 隐藏余额输入框
      this.IsCardInput = true;
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

button .btn-tip {
  font-size: 12px;
  color: #eee;
}

.content-warp {
  display: table;
  width: 100%;
  font-size: 14px;
  > * {
    display: table-cell;
    vertical-align: top;
  }
}
.form-warp {
  width: 465px;
  background-color: @white;
  padding: 0 16px;
  border-right: 1px solid #ddd;
}
.tab-area {
  border-bottom: 1px solid #b5b5b5;
  color: #666;
  .tab-item {
    display: inline-block;
    line-height: 45px;
    cursor: pointer;
    &.active {
      color: #0babb9;
      border-bottom: 2px solid #0babb9;
    }
  }
  .tab-item + .tab-item {
    margin-left: 24px;
  }
}
.form-area {
  height: 200px;
  .form-item {
    padding-top: 12px;
  }
  .form-title {
    line-height: 2.4;
    color: #666;
    position: relative;
  }
}
.valid-area {
  display: table;
  width: 100%;
  > * {
    display: table-cell;
  }
  .valid {
    width: 320px;
  }
  .valid-btn {
    padding-left: 8px;
    vertical-align: middle;
    button {
      width: 100%;
      height: 40px;
    }
  }
}
.card-remaining {
  position: absolute;
  right: 0;
  top: -6px;
  .money {
    font-size: 18px;
    font-weight: bold;
    color: #0babb9;
  }
}
.input-warning {
  font-size: 12px;
  color: #f00;
  font-weight: bold;
}
.keyboard-area {
  text-align: center;
  padding: 16px;
}
.keyboard {
  margin: 0 auto;
}
.info-warp {
  background-color: #f5f5f5;
  > .overview-item {
    padding: 12px;
  }
  > .itemListPbottom {
    height: 421px;
    position: relative;
    padding-bottom: 0 !important;
  }
  .overview-item + .overview-item {
    border-top: 1px dashed #ddd;
  }
}
.money-item {
  font-size: 14px;
  line-height: 2;
  > span {
    display: inline-block;
  }
  span.title {
    color: #666;
    width: 30%;
  }
  .line-through{
    font-size: 12px;
    color: #ffffff;
    text-decoration: line-through;
  }
  .money {
    width: 70%;
    text-align: right;
    color: #666;
    font-size: 12px;
  }

  .to-be-pay,
  .danger,
  .be-paid {
    font-size: 18px;
    font-weight: bold;
  }
  .danger {
    color: #f00;
    vertical-align: top;
  }
  .line-through{
    width: 68%;
    text-align: right;
    color: #ffffff;
    text-decoration: line-through;
  }
  .be-paid {
    font-size: 20px;
    color: #0babb9;
  }
}
.list-title {
  font-size: 14px;
  color: #999;
}
.card-list {
  height: 300px;
  overflow: hidden;
}
.card-item {
  margin-top: 8px;
  > .charge-wrapper {
    > * {
      display: inline-block;
      vertical-align: middle;
      border-radius: 4px;
    }
    .online-card {
      background-color: #76cb37 !important;
    }
    .money-info {
      width: 28%;
      height: 52px;
      background-color: #ffb400;
      color: #ffffff;
      text-align: center;
      font-size: 12px;
      .title {
        line-height: 2.3;
      }
      .money {
        font-size: 18px;
        line-height: 1;
        .prefix {
          font-size: 12px;
        }
      }
    }
    .deduction-info {
      width: 72%;
      height: 50px;
      background-color: #fff;
      border: 1px solid #ddd;
      padding: 4px 8px;
      .code {
        font-size: 12;
        line-height: 1.3;
        color: #999;
      }
      .name {
        font-size: 14px;
        line-height: 1.5;
        color: #666;
      }
      .el-icon-remove {
        line-height: 36px;
        float: right;
        color: #ccc;
        font-size: 26px;
        cursor: pointer;
      }
    }
  }
}

.pos-pager {
  position: absolute;
  bottom: -10px;
  right: 10px;
  height: 52px;
}

// 箭头按钮
.pos-takeout-pager {
  > button {
    display: inline-block;
    width: 44px;
    height: 30px;
    border: 1px solid #9a9a9a;
    line-height: 28px;
    border-radius: 14px;
    text-align: center;
    margin-left: 8px;
    background-color: white;

    > i {
      color: #9a9a9a;
    }

    &[disabled] {
      color: @btn-disabled-color;
      cursor: not-allowed;
    }
  }
}
</style>

<style lang="less">
.warnInfo {
  > .el-input {
    > input {
      border: 1px solid red;
    }
  }
}
</style>
