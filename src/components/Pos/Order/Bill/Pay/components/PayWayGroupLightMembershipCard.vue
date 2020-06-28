<template>
  <Dialog
    name="PosDialog.PayWayGroupLightMembershipCard"
    :title="$t('Biz.Settlement.PayWayGroupLightMembershipCard')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="close()"
    :showSubmit="true"
    :showClose="false"
    :hotkeys="ration"
    :append-to-body="true"
    width="800px"
    height="605px"
  >
    <div class="payWayRGJcrm">
      <!-- 左：金额 -->
      <div class="payWayRGJcrm-pay" v-keyboard:keyboard="{ autoSelect: true }">
        <div class="mb12 flex">
          <span>{{$t('Biz.Settlement.CardAndPhone')}}</span>
          <input
            class="inputStyle width50"
            v-model="accountNum"
            @focus="focusHandler('cardInput')"
            ref="cardInput"
          />
          <el-button type="primary" @click="readCard">
            {{$t('Dict.Search')}}/{{$t('Dict.CardReading')}}<br />(Enter)
          </el-button>
        </div>
        <!--卡明细-->
        <div class="card-info" v-if="verifyThrough">
          <span>{{$t('Dict.CardNumberLabel')}}{{hyUserInfo.cardNo}}</span>
          <span>{{$t('Dict.CardType1')}}{{hyUserInfo.typeName}}</span>
          <span>{{$t('Dict.FullNameLabel')}}{{ hyUserInfo.name }}</span>
          <span>{{$t('Dict.TermOfValidityLabel')}}{{ transferDataEnd(hyUserInfo.dateEnd) }}</span>
          <span>{{$t('Dict.BalanceLabel')}}{{hyUserInfo.czkye ? hyUserInfo.czkye : '0'}}</span>
        </div>
        <!--支付金额输入框-->
        <div class="margin" v-show="verifyThrough">
          <span class="inlineBlock">{{$t('Biz.Settlement.PaymentAmount')}}</span>
          <input
            class="w266 inputStyle"
            v-model="payMoney"
            ref="inputValue"
            @focus="focusHandler('inputValue')"
            maxlength="16" />
          <el-button class="pay-button" :disabled="!btnCanClick" @click="onSubmit">{{$t('Dict.Sure')}}</el-button>
        </div>
        <!--软键盘-->
        <div class="keybord-content">
          <KeyBoard class="keybord" @chopstickenter="chopstickenter" ref="keyboard"></KeyBoard>
        </div>
        <!--选择卡号-->
        <PayGroupLightIntegralChooseCard
          ref="payGroupLightIntegralChooseCard"></PayGroupLightIntegralChooseCard>
      </div>
      <div class="content-right">
        <div class="content-right-sidebar-top">
          <p class="tobePay-word">{{$t('Biz.Settlement.AmountToPaid01')}}</p>
          <p class="line-through">
            <span class="tobePay-money">{{amountToBePaid}}</span>
          </p>
        </div>
        <div class="content-right-sidebar-middle">
          <div class="right-title-info">
            <h3>
              <span>{{$t('Biz.Settlement.UsedCardAmount')}}:</span>
              <span>{{ settleAmount }}</span>
            </h3>
            <span
              v-if="settleList && settleList.length > 0">{{$t('Biz.Settlement.UsedCard1Detail')}}（{{$t('Dict.Altogether')}}{{ settleList.length }}{{$t('Dict.Leaf')}}）</span>
          </div>
          <div class="voucherContent">
            <div class="voucher-coupon" v-for="(item,index) in cancelledShowList" :key="index">
              <div class="ticket-message">
                <p class="ticket-name">{{$t('Dict.CardNumber')}}: {{ item.cardNo }}</p>
                <p class="ticket-number">{{$t('Dict.CardType')}}: {{ item.typeName }}</p>
                <p class="ticket-date">{{$t('Biz.Booking.ConsumeMoney')}}: {{ item.payMoney }}</p>
                <i class="el-icon-remove ticket-sum" @click="deleteCard(item)"></i>
              </div>
            </div>
          </div>
          <div class="pos-pager pos-pager-right">
            <div class="pos-takeout-pager">
              <span class="page-info">{{
                $t('Dict.PageStyle.Text1', {
                  length: settleList.length,
                  currentPage,
                  totalPage: pageCount(settleList || []),
                })
              }}</span>
              <button href="javascript:;" class="prev" @click="upPage">
                <i class="el-icon-arrow-up"></i>
              </button>
              <button href="javasctipt:;" class="next" @click="downPage(settleList)">
                <i class="el-icon-arrow-down"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import { isNaN } from 'lodash';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import PageMixin from '@/common/util/PaginationMixin';
import PayGroupLightIntegralChooseCard from '../PayBottomBtns/PayGroupLightIntegralChooseCard';

export default {
  components: {
    Dialog,
    KeyBoard,
    PayGroupLightIntegralChooseCard,
  },
  mixins: [DialogMixin, PageMixin],
  props: {
    // 待付金额
    amountToBePaid: {
      default: 0,
    },
    // 营业流水Id
    bsId: {
      default: '',
    },
    // 客位Id
    pointId: {
      default: '',
    },
  },
  data() {
    return {
      hyUserInfo: {}, // 已选择卡的信息
      accountNum: '', // 手机号/卡号
      cacheAccountNum: '', // 缓存的手机号/卡号
      payMoney: '', // 支付金额
      verifyThrough: false, // 是否显示支付金额输入框false默认不显示
      prePageSize: 4,
      currentPage: 1,
      settleList: [], // 已核销卡券列表
      btnCanClick: true, // 确认按钮是否可点击
      currentInput: '', // 当前聚焦的input框
      isInputChange: false, // 是否是手动输入导致的支付金额改变
    };
  },
  computed: {
    ...mapGetters(['posBaseInfo', 'posDevice']),
    // 添加快捷键
    ration() {
      return {
        PgDn: () => {
          this.close();
        },
        Enter: () => {
          // 支付金额输入框获取焦点状态时屏蔽enter快捷键
          const hasFocus = this.$refs.inputValue === document.activeElement;
          if (!hasFocus) {
            this.readCard();
          }
        },
      };
    },
    cancelledShowList() {
      // 已核销券信息
      return this.pagination(
        this.currentPage,
        this.prePageSize,
        this.settleList || [],
      );
    },
    // 已核销卡券的总金额
    settleAmount() {
      let str = 0;
      if (this.settleList && this.settleList.length > 0) {
        this.settleList.map((item) => {
          str += item.payMoney;
          return item;
        });
      }
      return str;
    },
  },
  watch: {
    payMoney(newV) {
      if (!this.isInputChange) return;
      this.$nextTick(() => {
        this.payMoney = this.onlyNumber(newV, 1);
        if (this.payMoney > this.amountToBePaid) {
          this.payMoney = this.amountToBePaid;
        } else if (this.payMoney > this.hyUserInfo.czkye) {
          this.payMoney = this.hyUserInfo.czkye;
          this.$message.warning(`${this.$t('Biz.Settlement.Warning21')}`);
        }
      });
    },
  },
  methods: {
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
    hasUseSameCard() {
      let bool = false;
      this.settleList.map((item) => {
        if (item.cardNo === this.hyUserInfo.cardNo) {
          bool = true;
        }
        return item;
      });
      return bool;
    },
    // 撤回已核销的卡
    deleteCard(item) {
      ajax('canyin.pos.settlement.pay.grouplight.unsettle', {
        contentType: 'URLEncoded',
        data: {
          bsId: this.bsId, // 营业流水号
          pointId: this.pointId, // 客位Id
          pwDetailId: item.pwDetailId,
        },
      }).then((res) => {
        if (res.result === 1) {
          this.$message.success(`${this.$t('Biz.Settlement.Success9')}`);
          // 更新营业流水相关信息
          this.$emit('refreshBill', '1');
          this.getSettleList();
          this.clearLeftUserInfo();
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    // 查询储值消费列表
    getSettleList() {
      ajax('canyin.pos.settlement.pay.grouplight.getsettlelist', {
        contentType: 'URLEncoded',
        data: {
          bsId: this.bsId, // 营业流水号
          pointId: this.pointId, // 客位Id
        },
      }).then((res) => {
        const { result, data, msg } = res;
        if (+result === 1) {
          const { settleList } = data;
          this.settleList = settleList || [];
        } else {
          this.$message.error(`${msg}`);
        }
      });
    },
    clearLeftUserInfo() {
      this.hyUserInfo = {};
      this.accountNum = '';
      this.cacheAccountNum = '';
      this.payMoney = '';
      this.verifyThrough = false;
    },
    focusHandler(type) {
      this.currentInput = type;
      if (type === 'inputValue') {
        this.isInputChange = true;
      }
    },
    onOpen() {
      // 初始化输入框获取焦点
      this.$nextTick(() => {
        this.$refs.cardInput.focus();
      });
      this.getSettleList();
      // 初始化支付金额
      this.payMoney = '';
    },
    // 虚拟键盘回车事件
    chopstickenter() {
      this.isInputChange = false;
      if (this.currentInput === 'cardInput') {
        this.readCard();
      } else if (this.currentInput === 'inputValue') {
        this.onSubmit();
      } else {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning22')}`);
      }
    },
    // 查询读卡
    readCard() {
      this.isInputChange = false;
      // 获取会员卡读卡需要用到的参数
      const { groupLightReadCardOpt } = this.posDevice;
      if (groupLightReadCardOpt) {
        if (this.accountNum) {
          this.querycardmessage();
        } else {
          this.$devices.Cardop.readRGJ((card) => {
            if (+card.returnCode === 0) {
              this.querycardmessage(card.CardNo);
            } else {
              this.$message.error(`${this.$t('Biz.Settlement.Error5')}`);
            }
          }, {
            ...groupLightReadCardOpt, // 群光读卡所需数据
          });
        }
      } else {
        this.querycardmessage();
      }
    },
    querycardmessage(CardNo = '') {
      let tmpStr = '';
      if (CardNo !== '') {
        tmpStr = CardNo;
      } else {
        tmpStr = this.accountNum;
      }
      if (tmpStr === '') {
        this.$message.error(`${this.$t('Biz.Settlement.Error6')}`);
        return;
      }
      const reg = /^[0-9]*$/;
      if (!reg.test(tmpStr)) {
        this.$message.error(`${this.$t('Biz.Settlement.Error7')}`);
        return;
      }
      ajax('canyin.pos.settlement.pay.grouplight.querymember', {
        contentType: 'URLEncoded',
        data: {
          cardNo: tmpStr, // 卡号
          pointId: this.pointId, // 客位Id
          isGetCouponList: 0, // 是否查询会员卡列表 1 查 0 不查
        },
      }).then((res) => {
        if (res.result === 1) {
          // 只有一个卡号
          if (res.data.length === 1) {
            // 显示支付金额输入框和卡信息
            this.verifyThrough = true;
            const [firstEle] = res.data;
            this.hyUserInfo = firstEle;
            // 卡号替换查询输入的手机号
            this.cacheAccountNum = firstEle.cardNo;
            this.accountNum = '';
            // 查询成功后支付金额默认显示待支付金额
            // 待支付金额大于余额时，显示余额
            if (this.amountToBePaid > this.hyUserInfo.czkye) {
              this.payMoney = (+this.hyUserInfo.czkye).toFixed(1);
            } else {
              this.payMoney = this.amountToBePaid.toFixed(1);
            }
          } else if (res.data.length > 1) { // 有多张卡
            // 有多个卡号
            const cardList = res.data;
            this.$refs.payGroupLightIntegralChooseCard.open(cardList, {
              submit: (currentCardData) => {
                // 显示支付金额输入框和卡信息
                this.verifyThrough = true;
                // 可以点击确认按钮
                this.isCanDisabled = false;
                this.showCardInfo = true;
                const [firstEle] = currentCardData;
                // 获取卡积分数据
                this.hyUserInfo = {
                  cardNo: firstEle.cardNo, // 卡号
                  typeName: firstEle.typeName, // 卡类型
                  name: firstEle.name, // 会员名称
                  mobile: firstEle.mobile, // 手机号
                  dateEnd: firstEle.dateEnd, // 有效期
                  czkye: firstEle.czkye, // 卡余额
                };
                // 卡号替换查询输入的手机号
                this.cacheAccountNum = firstEle.cardNo;
                this.accountNum = '';
                // 查询成功后支付金额默认显示待支付金额
                // 待支付金额大于余额时，显示余额
                if (this.amountToBePaid > this.hyUserInfo.czkye) {
                  this.payMoney = (+this.hyUserInfo.czkye).toFixed(1);
                } else {
                  this.payMoney = this.amountToBePaid.toFixed(1);
                }
              },
            });
          }
          this.$message.success(res.msg);
          this.getSettleList();
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    onSubmit() {
      this.btnCanClick = false;
      setTimeout(() => {
        this.btnCanClick = true;
      }, 5000);
      if (!this.verifyThrough) {
        this.$message.error(`${this.$t('Biz.Settlement.Error8')}`);
        return;
      }
      if (!this.watchPayMoney(this.payMoney, this.amountToBePaid)) {
        this.$message.error(`${this.$t('Biz.Settlement.Error9')}`);
        return;
      }
      if (Number(this.payMoney) > Number(this.hyUserInfo.czkye)) {
        this.$message.error(`${this.$t('Biz.Settlement.Error10')}`);
        return;
      }
      if (this.hasUseSameCard()) {
        this.$message.error(`${this.$t('Biz.Settlement.Error11')}`);
        return;
      }
      this.xrjSettle();
    },
    xrjSettle() { // 结算
      const params = {
        payMoney: Number(this.payMoney).toFixed(1), // 支付金额
        cardNo: this.cacheAccountNum, // 卡号
        bsId: this.bsId, // 营业流水号
        pointId: this.pointId, // 客位id
      };
      ajax('canyin.pos.settlement.pay.grouplight.settle', {
        contentType: 'URLEncoded',
        data: params,
      }).then((res) => {
        if (res.result === 1) {
          this.$message.success(`${this.$t('Biz.Settlement.Success9')}`);
          this.clearLeftUserInfo();
          this.getSettleList();
          // 刷新流水账单
          this.$emit('refreshBill', '1');
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    onClose() {
      // 清空已核销卡
      this.settleList = [];
      // 关闭页面清空会员动态码
      this.accountNum = '';
      this.cacheAccountNum = '';
      // 清除上一次卡信息
      this.hyUserInfo = {};
      // 隐藏支付金额输入框和卡信息
      this.verifyThrough = false;
      // 清除当前选中的input框的节点
      this.currentInput = '';
    },
    watchPayMoney(payMoney, amountToBePaid) { // payMoney支付金额,amountToBePaid待支付金额
      if (this.verifyThrough && payMoney === '') {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning23')}`);
        return false;
      }
      const n1 = Number(payMoney);
      const toBePaid = amountToBePaid.toFixed('1');
      // 当待支付金额有两位小数时支付金额输入框默认也只显示一位小数
      const n2 = Number(toBePaid);
      if (isNaN(n1)) {
        this.payMoney = n2;
        this.$message.warning(`${this.$t('Biz.Settlement.Warning23')}`);
        return false;
      }
      const n3 = Number(this.hyUserInfo.czkye);// 卡余额
      if (n1 > n2) {
        if (n2 > n3) {
          this.payMoney = n3;
        } else {
          this.payMoney = n2;
        }
        this.$message.warning(`${this.$t('Biz.Settlement.Warning24')}`);
        return false;
      } if (n1 === n2) {
      // 此处等于 是为了处理初始化时，支付金额等于待支付金额,支付金额默认填充待支付金额,此时支付金额仍需和卡余额进行比较取三者最小值填充支付金额
        if (n2 > n3) {
          this.payMoney = n3;
        } else {
          this.payMoney = n2;
        }
      }
      if (n1.toString().indexOf('.') !== -1 && n1 !== 0) {
        const i = n1.toString().indexOf('.');
        if (n1.toString().substr(i + 1).length >= 2 && !isNaN(Number(n1))) {
          this.$message.warning(`${this.$t('Biz.Settlement.Warning25')}`);
          this.payMoney = n1.toString().substr(0, i + 2);
          return false;
        }
      }
      return true;
    },
    // 转化时间格式
    transferDataEnd(dateEnd = '') {
      const year = dateEnd.substr(0, 4);
      const month = dateEnd.substr(4, 2);
      const day = dateEnd.substr(6);
      return `${year}-${month}-${day}`;
    },
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .payWayRGJcrm{
    display: flex;
    position: relative;
    height: 100%;
    /*padding-right: 224px;*/
    background: #f7f7f7;


    .content-right {
      background-color: #f5f5f5;
      flex-grow: 1;
      order: 2;
      > .content-right-sidebar-top {
        padding: 16px 16px;
        display: flex;
        justify-content: space-between;
        border-bottom: 1px dashed #ddd;
        > p {
          font-size: 14px;
          font-weight: bolder;
        }
        > .tobePay-word {
          order: 1;
          color: #333;
        }
        .line-through {
          order: 2;
          color: #ffffff;
          text-decoration: line-through;
        }
        .tobePay-money {
          color: #0babb9;
        }
      }
      > .content-right-sidebar-middle {
        padding: 10px 16px;
        .right-title-info {
          > h3 {
            display: flex;
            justify-content: space-between;
            > span {
              font-size: 15px;
              color: #666;
              font-weight: bolder;
            }
          }
          > span {
            color: #bbbbbb;
            display: block;
            margin-top: 10px;
          }
        }
        > .voucherContent {
          margin-top: 10px;
          height: 335px;
          > .voucher-coupon {
            height: 70px;
            display: flex;
            border-radius: 5px;
            margin-bottom: 10px;
            padding: 8px 10px;
            color: #666666;
            border: 1px solid #ccc;
            background-color: #ffffff;
            > .ticket-money {
              flex-basis: 65px;
              font-size: 18px;
              font-weight: 400;
              line-height: 3.5;
              text-align: center;
            }
            > .ticket-message {
              flex-grow: 1;
              position: relative;

              > .ticket-name {
                font-weight: bolder;
                font-size: 13px;
              }

              > .ticket-number {
                font-size: 12px;
              }

              > .ticket-date {
                font-size: 12px;
              }

              > .ticket-sum {
                position: absolute;
                top: 12px;
                right: 6px;
                font-size: 25px;
                line-height: 28px;
                color: #ccc;
              }
            }
          }
        }

        > .pos-pager-right {
          text-align: right;
        }
      }
      > .content-right-sidebar-bottom {
        padding: 10px 16px 16px 16px;
      }
    }
    .pos-pager {
      display: flex;
      justify-content: flex-end;
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


    .payWayRGJcrm-pay {
      width:500px;
      height: 100%;
      background: #fff;
      padding-left: 20px;
      padding-top: 20px;
      .card-info {
        background-color: #f5f5f5;
        padding: 10px;
        border-radius: 3px;
        display: flex;
        flex-direction: column;
        height: 130px;
        margin-right: 15px;
        > span {
          flex: 1;
          color: black;
        }
      }
      .waitPayMoney{
        font-size: 18px;
        font-weight: bold;
        .money{
          color: #0babb9;
        }
      }
      .pay-button {
        width: 80px;
        height: 40px;
        background-color: transparent;
        border-radius: 3px;
        border: 1px solid #33abb6;
        color: #33abb6;
      }
    }
    .payWayRGJcrm-info{
      position: absolute;
      top: 0;
      right: 0;
      width: 224px;
      height: 100%;
      background: url('../images/vip_bg.png') no-repeat;
      padding: 10px;
      padding-top: 50px;
      .infoBox{
        height: 100%;
        background: #fff;
        border-radius: 10px;
        position: relative;
        padding-top: 30px;
      }
      img{
        position: absolute;
        top: -30px;
        left: 73px;
      }
      .tip{
        text-align: center;
        color: #999;
        padding-top: 20px;
      }
    }
    .userInfoStyle{
      padding: 10px;
      padding-top: 0;
      .name, .phone, .cardNum{
        font-weight: bolder;
      }
      .phone {
        margin-bottom: 30px;
      }
      .cardNum{
        padding: 5px 0;
        font-size: 16px;
        margin-bottom: 80px;
      }
      .colorGold {
        color: #F1D16F;
      }
      .flex{
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        font-weight: bold;
      }
      .time{
        margin-top: 10px;
      }
      .remark {
        height: 80px;
        line-height: 20px;
        overflow: hidden;

        .textRight {
          display: -webkit-box;
          word-break: break-all;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          overflow: hidden;
        }
      }
    }
    .keybord-content {
      margin-bottom: 20px;
    }
    .keyboard{
      margin: auto;
    }
    .sart{
      color: #F56C6C;
    }
    .w110{
      width: 110px;
    }
    .w200{
      width: 200px;
    }
    .w266{
      width: 266px;
    }
    .w300{
      width: 300px;
    }
    .mb25{
      margin-bottom: 25px;
    }
    .margin {
      margin: 10px 0;
    }
    .mb12{
      margin-bottom: 12px;
    }
    .flex {
      display: flex;
      align-items: center;
    }
    .inlineBlock{
      display: inline-block;
    }
    .block {
      display: block;
    }
    .textRight{
      text-align: right;
    }
    .textCenter{
      text-align: center;
    }
    .width70 {
      width: 70%;
    }
    .width50 {
      width: 50%;
    }
    .width74 {
      width: 72.3%;
    }
    .inputStyle{
      -webkit-appearance: none;
      background-color: #fff;
      background-image: none;
      border-radius: 4px;
      border: 1px solid #dcdfe6;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      color: #606266;
      display: inline-block;
      font-size: inherit;
      height: 40px;
      line-height: 40px;
      outline: none;
      padding: 0 15px;
      -webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
      transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    }
    .inputStyle:focus{
      border-color: #0096a4;
    }
  }
  .el-button {
    padding: 5px 15px!important;
    vertical-align: bottom;
    margin-left: 10px;
  }
</style>
