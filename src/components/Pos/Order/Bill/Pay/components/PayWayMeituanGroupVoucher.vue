<template>
  <Dialog
    name="PosDialog.PayWayMeituanGroupVoucher"
    :title="payWayInfo.name"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :append-to-body="true"
    :hotkeys="hotKeySet"
    top="10vh"
    width="760px"
  >
    <div class="verificationbutton" slot="other-button">
      <button class="verification btn btn-default" @click="onSubmit" type="button">{{$t('Dict.Btn.WriteOff')}}(PgDn)</button>
    </div>
    <div class="wrapper">
      <div class="content-left">
        <div class="top-sidebar">
          <p>{{$t('Biz.Coupon.CouponsSources')}}</p>
          <form v-for="(item , index) in sellerList" :key="index">
            <button
              class="btn btn-default meituan-groupbuying"
              :class="{active:isActive == index}"
              type="button"
              @click="meituanGrounpClick(index,item)"
              :key="index"
            >{{ item.name }}</button>
            <!-- <button class="btn btn-default other-groupbuying"
            :class="{active:!isActive}" type="button"
            @click="otherGrounpClick">其他团购</button> -->
          </form>
          <p>{{$t('Biz.Coupon.EnterTicketNumberLabel')}}</p>
          <form v-keyboard:keyboard>
            <label>
              <input
                type="text"
                name
                class="input-number btn btn-default"
                ref="voucherInput"
                v-model="voucherInputValue"
                :placeholder="$t('Biz.Coupon.EnterTicketNumber')"
                v-judge
              >
              <i class="icon icon-quxiao" @click="clearInput" v-if="cancleValue"></i>
            </label>
            <button
              class="btn btn-default"
              :class="{btnActive:isVoucherBtnActive}"
              type="button"
              @click="enterVoucherClick"
            >{{$t('Dict.Btn.CheckCoupon')}}(Enter)</button>
            <button
              class="btn btn-default"
              :class="{btnActive:!isVoucherBtnActive}"
              type="button"
              @click="offlineVoucherClick"
            >{{$t('Dict.Btn.OfflineCheckVoucher')}}</button>
          </form>
          <UnOnlineCheckVoucher
            :sellerId="sellerId"
            @on-check-offline="onCheckOffline"
            ref="UnOnlineCheckVoucher"
          ></UnOnlineCheckVoucher>
        </div>
        <div class="bottom-sidebar" v-if="currentVouncher">
          <div class="voucherInfo">
            <div class="voucherType">
              <p class="ticket-type">{{$t('Dict.Btn.Voucher')}}</p>
              <p class="ticket-money">{{ ticketMarketPrice }}</p>
            </div>
            <div class="voucherNumber">
              <p class="ticket-number">{{ ticketCode }}</p>
              <p class="ticket-name">{{ ticketName }}</p>
            </div>
          </div>
          <div v-if="currentVouncher.ticketCount > 1">
            <p class="how-many-ticks" v-html="$t('Biz.Settlement.P01', [currentVouncher.ticketCount])"></p>
            <div class="form-group">
              <label for="iChangeNum">{{$t('Biz.Settlement.Consumption')}}</label>
              <div class="ordering-changenum-num">
                <button
                  type="button"
                  class="subtract"
                  :disabled="cutDisabled"
                  @click="changeNumHandle('-')"
                >
                  <i class="icon icon-subtract"></i>
                </button>
                <input
                  v-judge
                  id="999Input"
                  type="text"
                  name="changeNum"
                  v-model="chooseTickNum"
                  v-keyboard:keyboard="{ mode: 'simple', autoSelect: true }"
                  ref="changeNum"
                >
                <button
                  type="button"
                  class="add"
                  :disabled="addDisabled"
                  @click="changeNumHandle('+')"
                >
                  <i class="icon icon-add"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="havedInsteadAmount">
            <p class="havedInsteadAmount-word">{{$t('Biz.Settlement.AlreadyAmount')}}:</p>
            <p class="havedInsteadAmount-money">
              {{
                currentVouncher.marketPrice ?
                (currentVouncher.marketPrice * chooseTickNum).toFixed(2) :
                currentVouncher.market_price }}
            </p>
          </div>
        </div>
      </div>
      <div class="content-right">
        <div class="content-right-sidebar-top">
          <p class="tobePay-word">{{$t('Biz.Settlement.AmountToPaid01')}}</p>
          <p class="line-through">
            <span class="tobePay-money">{{ amountToBePaid }}</span>
          </p>
        </div>
        <div class="content-right-sidebar-middle">
          <h3>
            <!-- 已核销券： -->
            <span>{{$t('Biz.Coupon.CertifiedTicket')}}</span>
            <span>{{$t('Dict.Altogether')}}{{list.length}}{{$t('Dict.Strip')}}</span>
          </h3>
          <div class="voucherContent" v-if="showList.length">
            <div
              class="voucherInfo"
              v-for="(item,index) in showList"
              :key="index"
            >
              <div class="voucherType">
                <p class="ticket-type">{{$t('Dict.Btn.Voucher')}}</p>
                <p class="ticket-money">
                  {{ Number(item.ticket_value) * Number(item.ticket_count)}}
                </p>
              </div>
              <div class="voucherNumber">
                <p class="ticket-number">{{item.ticket_code }}</p>
                <p class="ticket-name">{{item.ticketName }}</p>
                <div class="ticket-sum">X<span class="accum">{{ item.ticket_count}}</span></div>
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
              <button href="javasctipt:;" class="next" @click="downPage(list)">
                <i class="el-icon-arrow-down"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="content-right-sidebar-bottom">
          <KeyBoard ref="keyboard"></KeyBoard>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>

import { Message } from 'element-ui';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import PageMixin from '@/common/util/PaginationMixin';
import UnOnlineCheckVoucher from '@/components/Pos/Order/Bill/Pay/components/UnOnlineCheckVoucher';

export default {
  components: { Dialog, KeyBoard, UnOnlineCheckVoucher },
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
      prePageSize: 3,
      isActive: 0, // 券来源按钮激活状态
      isVoucherBtnActive: true, // 请输入券号按钮激活状态
      cancleValue: false, // 控制叉号是否显示消失
      voucherInputValue: '', // 请输入券号输入框的内容
      sellerList: null, // 团购代金券券来源
      sellerId: null, // 线上来源Id
      paywayId: null, // 支付方式Id
      comeType: 1, // 是否在线验券 1代表在线验券, 2 代表离线验券
      ticketCode: '', // 已查询的券号
      currentVouncher: null, // 当前团队代金券
      ticketPrice: '', // 代金券可代金额
      ticketName: '', // 代金券名称
      ticketMarketPrice: '', // 代金券面值
      list: [], // 已核销券信息
      chooseTickNum: 1, // 已选券张数
    };
  },
  watch: {
    voucherInputValue(val) {
      // 监听输入框值的变化
      if (!val) {
        this.cancleValue = false;
        this.currentVouncher = null;
        this.chooseTickNum = 1;
      } else {
        this.cancleValue = true;
      }
    },
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
        Enter: () => {
          this.enterVoucherClick();
        },
      };
    },
    showList() {
      return this.pagination(this.currentPage, this.prePageSize, this.list);
    },
    addDisabled() {
      // 增加按钮
      if (this.currentVouncher) {
        return this.chooseTickNum >= this.currentVouncher.ticketCount;
      }
      return false;
    },
    cutDisabled() {
      // 减少按钮
      return this.chooseTickNum <= 1;
    },
  },
  methods: {
    getFocus() {
      // 打开进行input 聚焦
      setTimeout(() => {
        this.$refs.changeNum.focus();
        if (this.$refs.keyboard) {
          this.$refs.keyboard.reSelect();
        }
      }, 200);
    },
    checkServedNum() {
      // 判断当前的数值 情况 为零或者是空的时候提示
      if (this.chooseTickNum === '' || this.chooseTickNum === '0') {
        const messageString = this.chooseTickNum === '' ? `${this.$t('Biz.Settlement.AmountCantNull')}` : `${this.$t('Biz.Settlement.AmountCantZero')}`;
        this.isShowMessage(messageString);
        this.$refs.changeNum.focus();
        return false;
      }
      if (this.chooseTickNum > this.currentVouncher.ticketCount) {
        this.isShowMessage(`${this.$t('Biz.Settlement.MaxDishes')}${this.currentVouncher.ticketCount}`);
        return false;
      }
      return true;
    },
    // 加加 减减 按钮事件
    changeNumHandle(btnName) {
      if (!+this.chooseTickNum) {
        this.chooseTickNum = 1;
      }
      if (btnName === '-') {
        this.chooseTickNum = (this.chooseTickNum * 1000 - 1000) / 1000;
      } else {
        this.chooseTickNum = (this.chooseTickNum * 1000 + 1000) / 1000;
      }
    },
    isShowMessage(message, type, duration) {
      const options = {
        message: message || 'message', // 提示的内容
        type: type || 'error', // 类型 success/warning/info/error
        duration: duration || 1500, // 显示的时间
        center: true, // 中间显示
      };
      Message(options); // 需要多的可以查看element-ui 的官网 Message组件
    },
    onOpen() {
      // 初始化输入框获取焦点
      this.$nextTick(() => {
        this.$refs.voucherInput.focus();
        // 每次打开美团点评团购清空券号
        this.voucherInputValue = '';
      });
      this.payWayInfo.name = this.resData[0].name;
      ajax('canyin.pos.gbticketbill.gbticketbillview', {
        params: {
          pointId: this.resData[1],
        },
      }).then((data) => {
        // 所需券来源
        // 打开页面券来源Id默认为第一个
        this.sellerId = data.sellerList[0].o2oId;
        // 打开页面券来源支付方式Id默认为第一个
        this.paywayId = data.sellerList[0].paywayId;
        this.sellerList = data.sellerList;
        this.list = data.pwGbVoucherList.concat(data.bizTsPwGbList);
        this.currentPage = this.pageCount(this.list);
      });
    },
    // 美团点评团购点击事件
    meituanGrounpClick(index, item) {
      this.isActive = index;
      // 线上来源Id
      this.sellerId = item.o2oId;
      // 支付方式Id
      this.paywayId = item.paywayId;
    },
    // 验券点击事件
    enterVoucherClick() {
      // 让验券按钮选中
      this.isVoucherBtnActive = true;
      if (this.sellerId == null) {
        this.$message.error(`${this.$t('Biz.Settlement.ChooseOnlineSource')}`);
        return;
      }
      if (!this.voucherInputValue || this.voucherInputValue === '') {
        this.$message.error(`${this.$t('Biz.Settlement.CouponsCantNull')}`);
        return;
      }
      ajax('canyin.pos.gbticketbill.checkticket', {
        contentType: 'URLEncoded',
        data: {
          bsId: this.bsData.id,
          sellerId: this.sellerId,
          ticketCode: this.voucherInputValue,
        },
      }).then((data) => {
        // 展现团队代金券信息
        if (data.flag) {
          // 是否是在线验券
          this.comeType = 1;
          // 获取已选代金券券号
          this.ticketCode = this.voucherInputValue;
          Object.assign(data.ticket, {
            ticketCount: data.ticketCount,
          });
          this.currentVouncher = data.ticket;
          // 代金券名称
          this.ticketName = data.ticket.title;
          // 代金券可代金额
          this.ticketPrice = data.ticket.price;
          // 代金券面值
          this.ticketMarketPrice = data.ticket.marketPrice;
        } else {
          this.$message.error(data.msg);
          // 清空券号输入框
          this.voucherInputValue = '';
        }
      });
    },
    // 离线验券点击事件
    offlineVoucherClick() {
      if (this.sellerId == null) {
        this.$message.error(`${this.$t('Biz.Settlement.ChooseOnlineSource')}`);
        return;
      }
      if (!this.voucherInputValue || this.voucherInputValue === '') {
        this.$message.error(`${this.$t('Biz.Settlement.CouponsCantNull')}`);
        return;
      }
      this.isVoucherBtnActive = false;
      this.$refs.UnOnlineCheckVoucher.open({
        ticketCode: this.voucherInputValue,
      });
    },
    // 离线验券确认事件
    onCheckOffline(data) {
      // 是否是在线验券
      this.comeType = 2;
      const [firstEle, secondEle] = data;
      this.currentVouncher = firstEle;
      // 代金券可代金额
      this.ticketPrice = firstEle.price;
      // 代金券名称
      this.ticketName = firstEle.title;
      // 代金券面值
      this.ticketMarketPrice = firstEle.market_price;
      this.ticketCode = secondEle;
    },
    // 点击核销按钮前验证操作是否合法
    verfiyBeforeSubmit() {
      // 核销前先验券号
      if (!this.voucherInputValue) {
        this.$message.error(this.$t('Biz.Coupon.EnterTicketNumber'));
        return false;
      }
      // 是否点击验券按钮
      if (!this.currentVouncher) {
        this.$message.error(this.$t('Biz.Settlement.VoucherBeforeWriteOff'));
        return false;
      }
      // 核销前请先验券
      if (!this.ticketCode || this.voucherInputValue !== this.ticketCode) {
        this.$message.error(this.$t('Biz.Settlement.VoucherBeforeWriteOff'));
        return false;
      }
      // 验证输入券的数量是否合法
      if (!this.chooseTickNum) {
        this.$message.error(this.$t('Biz.Settlement.Error16'));
        return false;
      }
      // 验证输入券的数量是否为数字
      if (!+this.chooseTickNum) {
        this.$message.error(this.$t('Biz.Settlement.Error17'));
        return false;
      }
      // 验证输入券的数量不能为小数
      if (this.chooseTickNum.toString().indexOf('.') > -1) {
        this.$message.error(this.$t('Biz.Settlement.Error18'));
        return false;
      }
      // 验证输入券的数量是否超过可用数量
      if (this.chooseTickNum > this.currentVouncher.ticketCount) {
        this.$message.error(this.$t('Biz.Settlement.Error19'));
        return false;
      }
      // （输入券的数量*券单张金额） 大于 （待付金额 + 1*券单张金额）
      if ((this.currentVouncher.marketPrice * (this.chooseTickNum - 1)) > this.amountToBePaid) {
        this.$message.error(this.$t('Biz.Settlement.Error20'));
        return false;
      }
      return true;
    },
    // 核销
    onSubmit() {
      if (!this.verfiyBeforeSubmit()) return;
      const mealTotal = (
        Number(this.ticketMarketPrice) * Number(this.chooseTickNum)
      ).toFixed(2);
      const chooseTickNum = Number(this.chooseTickNum);
      const params = {
        pointId: this.resData[1],
        bsId: this.bsData.id,
        paywayId: this.paywayId,
        mealTotal,
        ticketValue: this.ticketMarketPrice, // 券面值
        ticketId: this.currentVouncher.deal_id
          ? this.currentVouncher.deal_id
          : this.currentVouncher.dealId,
        ticketSale: this.ticketMarketPrice, // 券售价
        ticketType: 2, // 2代表代金券
        sellerId: this.sellerId,
        // isOnline: this.isOnline,
        comeType: this.comeType,
        // 修改后的请求参数(后台接口设计如此)
        ticketCodes: [{ ticketCodes: [this.ticketCode] }], // 核销券的code
        verifyNums: [{ verifyNums: [chooseTickNum] }], // 核销券的数量
      };
      ajax('canyin.pos.gbticketbill.verify', {
        contentType: 'paramsEncoded',
        needToken: true,
        data: params,
      }).then((data) => {
        if (data.success && data.result === 1) {
          if (data.data.flag) {
            // 清空券号
            this.voucherInputValue = '';
            // 第二个参数代表 团购代金券,一筷捞,线上礼品卡类的需要核销添加的结算方式类型为值统一为"1"
            this.$emit('refreshBill', '1');
            // 核销成功关闭团购代金券弹框
            this.$message.success(`${this.$t('Biz.Settlement.writtenOffOk')}`);
            this.close();
          } else {
            this.$message.error(data.data.errorMsg);
          }
        } else {
          this.$message.error(data.msg);
        }
      });
    },
    // 清除输入框的值
    clearInput() {
      // 点击叉号清除输入框的值
      this.voucherInputValue = '';
      // 隐藏叉号
      this.cancleValue = false;
    },
    InputCancleValue() {
      if (this.voucherInputValue !== '') {
        this.cancleValue = true;
      } else {
        this.cancleValue = false;
      }
    },
    onClose() {
      // 清空已选代金券
      this.currentVouncher = null;
      this.chooseTickNum = 1;
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.verificationbutton {
  display: inline-block;
  > .verification {
    height: 44px;
    color: #fff;
    background-color: #0babb9;
  }
}
.wrapper {
  display: flex;
  > .content-left {
    width: 490px;
    order: 1;
    display: flex;
    background-color: #ffffff;
    padding: 10px 16px 30px 16px;
    flex-direction: column;
    > .top-sidebar {
      height: 205px;
      > p {
        padding-top: 10px;
        font-size: 14px;
        font-weight: bolder;
      }
      > form {
        padding: 10px 0;
        > .meituan-groupbuying {
          padding: 0px !important;
        }
        > button {
          width: 100px;
          height: 40px;
          font-size: 13px;
        }

        > .active {
          color: #fff;
          background-color: #0babb9;
        }
        > .btnActive {
          color: #fff;
          background-color: #0babb9;
        }
        > label {
          position: relative;
          > .input-number {
            width: 235px;
            height: 40px;
            font-size: 14px;
            font-weight: bold;
            background-color: #fff;
            text-align: left;
          }
          > .icon-quxiao {
            position: absolute;
            top: 2px;
            right: 0;
            color: #ccc;
            font-size: 28px;
          }
        }
      }
    }
    > .bottom-sidebar {
      height: 362px;
      padding: 10px;
      background-color: #f5f5f5;

      > .voucherInfo {
        width: 260px;
        height: 56px;
        display: flex;
        > .voucherType {
          width: 73px;
          order: 1;
          background-color: #ffb400;
          color: #fff;
          border-radius: 5px;
          text-align: center;
          padding: 9px;
          > .ticket-type {
            font-size: 15px;
            font-weight: 600;
          }
          > .ticket-money {
            font-size: 17px;
            font-weight: bolder;
          }
        }
        > .voucherNumber {
          flex-grow: 1;
          order: 2;
          border: 1px solid #ddd;
          background-color: #fff;
          border-radius: 5px;
          padding: 8px 11px 11px 11px;
          text-align: left;

          > .ticket-number {
            font-size: 14px;
            color: #99999a;
            font-weight: 400;
          }
          > .ticket-name {
            font-size: 16px;
            color: #666;
            font-weight: 800;
            overflow: hidden;
            height: 20px;
          }
        }
      }
      > .havedInsteadAmount {
        width: 260px;
        display: flex;
        justify-content: flex-start;
        margin-top: 10px;
        margin-bottom: 10px;
        > .havedInsteadAmount-word {
          font-size: 14px;
          font-weight: 400;
          color: #333;
          margin-right: 20px;
        }
        > .havedInsteadAmount-money {
          font-size: 15px;
          color: #ff0000;
          font-weight: bold;
        }
      }
      .how-many-ticks {
        margin: 20px 0;
        font-size: 14px;
        color: gray;
        > strong {
          margin: 0 4px;
          font-size: 16px;
          font-weight: bold;
          color: #000000;
        }
      }
      .form-group {
        display: flex;
        align-items: center;
        .ordering-changenum-num {
          position: relative;
          padding: 0 40px;
          .size(130px, 36px);
          > button {
            position: absolute;
            top: 0;
            .square(36px);
            border: 1px solid #999;
            background-color: transparent;
            border-radius: 3px;

            > i.icon {
              color: #999;
            }

            &.subtract {
              left: 0;
            }

            &.add {
              right: 0;
            }

            &:disabled {
              border-color: #ccc;
              cursor: not-allowed;

              > i.icon {
                color: #ccc;
              }
            }
          }
          > input {
            display: block;
            .size(100%, 36px);
            border: 1px solid #999;
            border-radius: 3px;
            text-align: center;
          }
        }
        label {
          margin: 0;
          font-size: 14px;
          color: gray;
        }
      }
    }
  }
  > .content-right {
    background-color: #f5f5f5;
    // height:340px;
    flex-grow: 1;
    order: 2;
    > .content-right-sidebar-top {
      padding: 24px 16px;
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
      > h3 {
        display: flex;
        justify-content: space-between;
        > span {
          font-size: 15px;
          color: #666;
          font-weight: bolder;
        }
      }
      > .voucherContent {
        margin-top: 10px;
        margin-bottom: 10px;
        height: 180px;
        > .voucherInfo {
          width: 245px;
          height: 56px;
          display: flex;
          margin-bottom: 5px;
          > .voucherType {
            width: 68px;
            padding: 8px;
            text-align: center;
            order: 1;
            background-color: #ffb400;
            color: #fff;
            border-radius: 5px;
            > .ticket-type {
              font-size: 13px;
              font-weight: 600;
            }
            > .ticket-money {
              font-size: 14px;
              font-weight: bolder;
            }
          }
          > .voucherNumber {
            position: relative;
            padding: 8px 10px 10px 10px;
            text-align: left;
            flex-grow: 1;
            order: 2;
            border: 1px solid #ddd;
            background-color: #fff;
            border-radius: 5px;
            > .ticket-number {
              font-size: 13px;
              color: #99999a;
              font-weight: 400;
            }
            > .ticket-name {
              font-size: 14px;
              color: #666;
              font-weight: 800;
              overflow: hidden;
              width: 155px;
              height: 20px;
            }
            > .ticket-sum {
              position: absolute;
              top: 12px;
              right: 6px;
              width: 28px;
              height: 28px;
              background-color: #999;
              border-radius: 14px;
              font-size: 10px;
              text-align: center;
              line-height: 28px;
              font-weight: bolder;
              color: #ffffff;

              > .accum {
              vertical-align: bottom;
              font-size: 16px;
              }
            }

          }
        }
      }
      > .pos-pager {
        display: flex;
        justify-content: flex-end;
      }
      // 箭头按钮
      .pos-takeout-pager {
        display: flex;
        align-items: center;
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
    }
    > .content-right-sidebar-bottom {
      padding: 10px 16px 16px 16px;
    }
  }
}
</style>
