<template>
  <Dialog
    name="PosDialog.PayWayGroupLightVoucher"
    :title="$t('Biz.Settlement.PayWayGroupLightVoucher')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :append-to-body="true"
    :hotkeys="hotKeySet"
    top="10vh"
    width="690px"
  >
    <div class="wrapper">
      <div class="content-left" v-keyboard:keyboard="{ autoSelect: true }">
        <div class="top-sidebar">
          <p>{{$t('Biz.Settlement.Error6')}}:</p>
          <form>
            <label>
              <input
                type="text"
                name
                class="input-number btn btn-default"
                ref="voucherInput"
                v-model="phoneOrCardNumber"
                :placeholder="$t('Biz.Settlement.Error6')"
                v-judge
              >
              <i class="icon icon-quxiao" @click="clearInput" v-if="cancleValue"></i>
            </label>
            <button
              class="btn btn-default btnActive"
              type="button"
              @click="enterVoucherClick"
            >{{$t('Dict.Search')}}/{{$t('Dict.CardReading')}}</button>
          </form>
        </div>
        <h4>{{$t('Biz.Settlement.ChooseElectronicCoupons')}}:</h4>
        <div class="bottom-sidebar">
          <div
            class="electronic-ticket"
            v-for="(item,index) in unwrittenOffShowList"
            :key="index"
            :class="{
              selectActive: item ? item.checked : false,
              limitSelect: !!item.ifCanChoose
            }"
            @click="selectActive(item, item.couponKey, !!item.ifCanChoose)"
          >
            <div class="ticket-top">
              <p class="ticket-namedate">
                <span class="ticket-name">{{ item.couponName }}</span>
                <span class="ticket-date">{{$t('Dict.TermOfValidity')}}:{{ transferDataEnd(item.dateEnd) }}</span>
              </p>
              <p class="ticket-number">{{$t('Biz.Settlement.CouponsNumber')}}:{{ item.couponType }}</p>
            </div>
            <div class="ticket-bottom">
              <div class="ticket-bottom-left">
                <p class="ticket-balance">{{$t('Dict.BalanceLabel')}}{{ item.balance }}</p>
                <p class="ticket-canusebalance">{{$t('Biz.Settlement.AvailableBalance')}}:{{ item.amount }}</p>
              </div>
              <div class="ticket-bottom-right">
                <p>{{$t('Biz.Crm.ConsumeMoney')}}</p>
                <input
                  class="ticket-monetary"
                  :key="item.couponKey"
                  @click.stop
                  @keyup="InputNumber(item, 1)"
                  @input="InputNumber(item, 1)"
                  @focus="setCurrentInput"
                  :disabled="item.ifCanChoose === 1"
                  :id="(item.couponKey)"
                  type="text"
                  :placeholder="+(Number(item.amount).toFixed(1))"
                  v-model="item.moneyconsum"
                >
              </div>
            </div>
          </div>

          <div class="verification">
            <button class="btn btn-default" :disabled="!buttonLimit" @click="onSubmit" type="button">{{$t('Dict.Btn.WriteOff')}}</button>
          </div>
        </div>
        <div class="pos-pager pos-pager-left">
          <div class="pos-takeout-pager">
            <span class="page-info">{{
              $t('Dict.PageStyle.Text1', {
                length: couponList.length,
                currentPage,
                totalPage: pageCount(couponList),
              })
            }}</span>
            <button href="javascript:;" class="prev" @click="upPage">
              <i class="el-icon-arrow-up"></i>
            </button>
            <button href="javasctipt:;" class="next" @click="downPage(couponList)">
              <i class="el-icon-arrow-down"></i>
            </button>
          </div>
        </div>
        <PayGroupLightIntegralChooseCard
          ref="payGroupLightIntegralChooseCard"></PayGroupLightIntegralChooseCard>
      </div>
      <div class="content-right">
        <div class="content-right-sidebar-top">
          <p class="tobePay-word">{{$t('Biz.Settlement.AmountToPaid01')}}</p>
          <p class="line-through">
            <span class="tobePay-money">{{ amountToBePaidCalc }}</span>
          </p>
        </div>
        <div class="content-right-sidebar-middle">
          <!-- 已核销券： -->
          <h3><span>{{$t('Biz.Coupon.CertifiedTicket')}}</span></h3>
          <div class="voucherContent">
            <div class="voucher-coupon" v-for="(item,index) in cancelledShowList" :key="index">
              <div class="ticket-money">{{item.payAmount}}</div>
              <div class="ticket-message">
                <p class="ticket-name">{{ item.couponName }}</p>
                <p class="ticket-number">{{$t('Biz.Settlement.CouponsNumber')}}:{{item.couponType }}</p>
                <p class="ticket-number">{{$t('Dict.CardNumber')}}:{{item.cardNo }}</p>
                <p class="ticket-date">{{$t('Dict.TermOfValidity')}}:{{ transferDataEnd(item.dateEnd) }}</p>
                <i class="el-icon-remove ticket-sum" @click="removeCancelledVoucher(item)"></i>
              </div>
            </div>
          </div>
          <div class="pos-pager pos-pager-right">
            <div class="pos-takeout-pager">
              <span class="page-info">{{
                $t('Dict.PageStyle.Text1', {
                  length: cancelledList.length,
                  currentPage: currentPage2,
                  totalPage: pageCount2(cancelledList),
                })
              }}</span>
              <button href="javascript:;" class="prev" @click="upPage2">
                <i class="el-icon-arrow-up"></i>
              </button>
              <button href="javasctipt:;" class="next" @click="downPage2(cancelledList)">
                <i class="el-icon-arrow-down"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="content-right-sidebar-bottom">
          <KeyBoard ref="keyboard" @chopstickenter="chopstickenter"></KeyBoard>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import _ from 'lodash';
import $ from 'jquery';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import PageMixin from '@/common/util/PaginationMixin';
import PageMixin2 from '@/common/util/PaginationMixin2';
import PayGroupLightIntegralChooseCard from '../PayBottomBtns/PayGroupLightIntegralChooseCard';
import { add, sub } from '@/common/js/math';

export default {
  components: { Dialog, KeyBoard, PayGroupLightIntegralChooseCard },
  mixins: [DialogMixin, PageMixin, PageMixin2],
  props: {
    bsData: {
      type: Object,
    },
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
      prePageSize: 2,
      prePageSize2: 2,
      cancleValue: false, // 控制叉号是否显示消失
      phoneOrCardNumber: '', // 请输入券号输入框的内容
      cachePhoneOrCardNumber: '', // 缓存的请输入券号输入框的内容
      couponList: [], // 未核销券信息
      updateCouponList: [], // 未核销券信息副本
      cancelledList: [], // 已核销券信息
      vipId: '', // 卡VIPId
      selectedCancelled: 0, // 已选已核销的券支付金额
      selectedUncancelled: 0, // 已选未核销的券支付金额
      ownerAmountToBePaid: 0, // 待支付金额
      buttonLimit: true, // 核销按钮和快捷键是否可用
    };
  },
  watch: {
    phoneOrCardNumber(val) {
      // 监听输入框值的变化
      if (!val) {
        this.cancleValue = false;
      } else {
        this.cancleValue = true;
      }
    },
    couponList: {
      deep: true,
      handler(val) {
        // 当已核销券数组有变化时实时更新页面数据
        this.updateCouponList = val;
      },
    },
  },
  computed: {
    ...mapGetters([
      'posDevice',
    ]),
    hotKeySet() {
      return {
        PgDn: () => {
          if (!this.buttonLimit) return;
          this.onSubmit();
        },
        Enter: () => {
          this.enterVoucherClick();
        },
      };
    },
    unwrittenOffShowList() {
      if (this.updateCouponList && this.updateCouponList.length > 0) {
        // 未核销券信息
        return this.pagination(
          this.currentPage,
          this.prePageSize,
          this.updateCouponList,
        );
      }
      return [];
    },
    cancelledShowList() {
      // 已核销券信息
      return this.pagination2(
        this.currentPage2,
        this.prePageSize2,
        this.cancelledList,
      );
    },
    // 计算后的待支付金额
    amountToBePaidCalc() {
      // 如果没有已选已核销券
      if (this.selectedCancelled === 0) {
        return this.amountToBePaid;
      }
      const tobePay = (this.amountToBePaid * 100000 - this.selectedCancelled * 100000)
          / 100000;
      return tobePay.toFixed(1);
    },
  },
  methods: {
    // 设置当前的input，服务于虚拟键盘
    setCurrentInput(e) {
      this.$refs.keyboard.focusInput = $(e.target);
    },
    // 初始化待支付金额
    formatOwnerAmountToBePaid() {
      const tobePay = (this.amountToBePaid * 100000 - this.selectedCancelled * 100000)
          / 100000;
      return tobePay.toFixed(1);
    },
    onOpen() {
      // 清空未核销券信息
      this.couponList = [];
      // 初始化输入框获取焦点
      this.$nextTick(() => {
        this.$refs.voucherInput.focus();
      });
      this.ownerAmountToBePaid = this.formatOwnerAmountToBePaid();
      ajax('canyin.pos.settlement.pay.grouplight.getcouponlist', {
        contentType: 'URLEncoded',
        data: {
          bsId: this.bsData.id,
          pointId: this.pointId,
          strSalem: this.amountToBePaidCalc, // 待支付金额
        },
      }).then((res) => {
        if (res.result === 1) {
          if (res.data.grouplightResult !== null) {
            // 添加已核销券
            const { grouplightResult } = res.data;
            this.cancelledList = grouplightResult;
            // 用卡号填充手机号输入框
            // this.phoneOrCardNumber = res.data.cardNo;
            this.cachePhoneOrCardNumber = res.data.cardNo;
            // 储存vipId这个变量
            this.vipId = res.data.vipId;
            // 如果有未核销券
            if (res.data.couponList !== null) {
              this.couponList = res.data.couponList.map((item) => {
                // eslint-disable-next-line no-param-reassign
                item.checked = false;
                // 定义消费金额字段
                // eslint-disable-next-line no-param-reassign
                item.moneyconsum = Number(item.amount).toFixed(1);
                // 单笔
                return item;
              });
              // 单笔账单下已经核销过的券，不能再次核销
              // this.limitCancelledVoucher();
            }
          }
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    // 单笔账单下已经核销过的券，不能再次核销
    limitCancelledVoucher() {
      const { cancelledList, couponList } = this;
      if (cancelledList.length > 0 && couponList.length > 0) {
        cancelledList.map((item1) => {
          couponList.map((item2) => {
            if (+item1.couponType === +item2.couponType) {
              this.$set(item2, 'limitSelect', true);
            }
            return item2;
          });
          return item1;
        });
      }
    },
    // 虚拟键盘回车事件
    chopstickenter() {
      this.enterVoucherClick();
    },
    // 验券点击事件
    enterVoucherClick() {
      // 获取会员卡读卡需要用到的参数
      const { groupLightReadCardOpt } = this.posDevice;
      if (groupLightReadCardOpt) {
        if (this.phoneOrCardNumber) {
          this.querycardmessageTask();
        } else {
          this.$devices.Cardop.readRGJ((card) => {
            if (+card.returnCode === 0) {
              this.querycardmessageTask(card.CardNo);
            } else {
              this.$message.error(`${this.$t('Biz.Settlement.Error5')}`);
            }
          }, {
            ...groupLightReadCardOpt, // 群光读卡所需数据
          });
        }
      } else {
        this.querycardmessageTask();
      }
    },
    querycardmessageTask(CardNo = '') {
      let tmpStr = '';
      if (CardNo !== '') {
        tmpStr = CardNo;
      } else {
        tmpStr = this.phoneOrCardNumber;
      }
      // 刷新后初始化分页当前页为第一页
      this.currentPage = 1;
      this.currentPage2 = 1;
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
          bsId: this.bsData.id,
          pointId: this.pointId,
          cardNo: tmpStr,
          strSalem: this.amountToBePaidCalc, // 待支付金额
          isGetCouponList: 1, // 是否查询会员卡列表 1 查 0 不查
        },
      }).then((res) => {
        if (res.result === 1) {
          // 只有一个卡号
          if (res.data.length === 1) {
            const [firstEle] = res.data;
            // 用卡号填充手机号输入框
            this.cachePhoneOrCardNumber = firstEle.cardNo;
            this.phoneOrCardNumber = '';
            // 储存vipId这个变量
            this.vipId = firstEle.vipId;
            this.couponList = firstEle.couponList.map((item) => {
              // eslint-disable-next-line no-param-reassign
              item.checked = false;
              // 定义消费金额字段
              // eslint-disable-next-line no-param-reassign
              item.moneyconsum = Number(item.amount).toFixed(1);
              return item;
            });
            // 单笔账单下已经核销过的券，不能再次核销
            // this.limitCancelledVoucher();
          } else if (res.data.length > 1) {
            // 有多张卡
            // 有多个卡号
            const cardList = res.data;
            this.$refs.payGroupLightIntegralChooseCard.open(cardList, {
              submit: (currentCardData) => {
                const [firstEle] = currentCardData;
                // 卡号替换查询输入的手机号
                this.cachePhoneOrCardNumber = firstEle.cardNo;
                this.phoneOrCardNumber = '';
                // 储存vipId这个变量
                this.vipId = firstEle.vipId;
                this.couponList = firstEle.couponList.map((item) => {
                  // eslint-disable-next-line no-param-reassign
                  item.checked = false;
                  // 定义消费金额字段
                  // eslint-disable-next-line no-param-reassign
                  item.moneyconsum = Number(item.amount).toFixed(1);
                  return item;
                });
                // 单笔账单下已经核销过的券，不能再次核销
                // this.limitCancelledVoucher();
              },
            });
          }
          this.$message.success(res.msg);
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    // 核销
    onSubmit() {
      // 每次核销之前清除已支付金额防止缓存
      this.selectedUncancelled = 0;
      // 消费券列表
      const couponList = [];
      const selectItems = this.couponList.filter(item => item.checked === true);
      selectItems.forEach((item) => {
        // 计算券已支付金额
        this.selectedUncancelled += Number(item.moneyconsum);
        const data = {
          couponName: item.couponName, // 券名称
          couponType: item.couponType, // 券类型
          payAmount: item.moneyconsum, // 券金额
          dateEnd: item.dateEnd, // 有效期
          payId: item.payId, // 支付方式id
        };
        couponList.push(data);
      });
      if (this.selectedUncancelled > this.amountToBePaidCalc) {
        this.$message.error(`${this.$t('Biz.Settlement.Error12')}`);
        return;
      }
      if (this.selectedUncancelled === 0) {
        this.$message.error(`${this.$t('Biz.Settlement.Error13')}`);
        return;
      }
      if (couponList.length === 0) {
        this.$message.error(`${this.$t('Biz.Settlement.Error14')}`);
        return;
      }
      if (!this.verfiyBeforeSubmit()) return;
      this.buttonLimit = false;
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => {
        this.buttonLimit = true;
      }, 3000);
      const params = {
        pointId: this.pointId, // 客位Id
        bsId: this.bsId, // 营业流水Id
        vipId: this.vipId,
        couponList: JSON.stringify(couponList), // 券列表
        cardNo: this.cachePhoneOrCardNumber, // 卡号
      };
      ajax('canyin.pos.settlement.pay.grouplight.couponpay', {
        contentType: 'URLEncoded',
        data: params,
      }).then((res) => {
        if (!this.buttonLimit) {
          this.buttonLimit = true;
        }
        if (res.result === 1) {
          // 添加已核销券
          const { grouplightResult } = res.data;
          this.cancelledList = grouplightResult;
          // 核销成功关闭团购代金券弹框
          this.$message.success(`${this.$t('Biz.Settlement.writtenOffOk')}`);
          // 刷新流水账单
          this.$emit('refreshBill', '1');
          // 刷新当前券信息
          this.$nextTick(() => {
            this.refreshCardInfo(res.data.cardNo, 1);
          });
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    // 删除已核销券
    removeCancelledVoucher(item) {
      // let moneyStr = e.target.parentElement.previousElementSibling.innerHTML;
      // moneyStr = moneyStr.substr(1);
      // let ele = e.target.previousElementSibling.previousElementSibling.innerHTML;
      // const index = ele.indexOf(':');
      // ele = ele.substr(index + 1);
      const {
        payAmount, couponType, pwDetailId, cardNo, dateEnd,
      } = item;
      const resultCouponKey = `${cardNo}#${couponType}#${dateEnd}`;
      ajax('canyin.pos.settlement.pay.grouplight.uncouponpayeach', {
        contentType: 'URLEncoded',
        data: {
          pointId: this.pointId, // 客位Id
          bsId: this.bsId, // 营业流水Id
          couponType, //  券号
          payAmount, // 支付金额
          pwDetailId,
        },
      }).then((res) => {
        if (res.result === 1) {
          this.selectedUncancelled = payAmount;
          // 删除已核销的券
          // 过滤出所要删除的券
          const removeData = _.filter(
            this.cancelledList,
            (obj) => {
              const itemCouponKey = `${obj.cardNo}#${obj.couponType}#${obj.dateEnd}`;
              return itemCouponKey === resultCouponKey;
            },
          );
            // // 剔除所要删除的券
          this.cancelledList = _.difference(this.cancelledList, removeData);
          this.currentPage2 = this.pageCount2(this.cancelledList);
          // 刷新流水账单
          this.$emit('refreshBill', '1');
          // 核销成功关闭团购代金券弹框
          this.$message.success(`${this.$t('Biz.Settlement.Success10')}`);
          // 刷新当前券信息
          this.$nextTick(() => {
            this.refreshCardInfo(res.data.cardNo, 0);
          });
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    // 刷新当前券信息
    refreshCardInfo(phoneOrCardNumber, type) {
      // 带支付金额为本地的待支付金额减去已选券的金额
      let shouldPay = 0;
      if (type) {
        shouldPay = sub(this.ownerAmountToBePaid, this.selectedUncancelled);
      } else {
        shouldPay = add(this.ownerAmountToBePaid, this.selectedUncancelled);
      }
      // 刷新后初始化分页当前页为第一页
      this.currentPage = 1;
      this.currentPage2 = 1;
      ajax('canyin.pos.settlement.pay.grouplight.querymember', {
        contentType: 'URLEncoded',
        data: {
          bsId: this.bsId,
          pointId: this.pointId,
          cardNo: phoneOrCardNumber,
          // strSalem: this.amountToBePaidCalc, // 待支付金额
          strSalem: shouldPay, // 待支付金额
          isGetCouponList: 1, // 是否查询会员卡列表 1 查 0 不查
        },
      }).then((res) => {
        if (res.result === 1) {
          const [firstEle] = res.data;
          // 储存vipId这个变量
          this.vipId = firstEle.vipId;
          this.couponList = firstEle.couponList.map((item) => {
            // eslint-disable-next-line no-param-reassign
            item.checked = false;
            // 定义消费金额字段
            // eslint-disable-next-line no-param-reassign
            item.moneyconsum = Number(item.amount).toFixed('1');
            return item;
          });
          // 核销完成后重新初始化带支付金额
          this.ownerAmountToBePaid = this.formatOwnerAmountToBePaid();
          // 单笔账单下已经核销过的券，不能再次核销
          // this.limitCancelledVoucher();
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    selectActive(item, index, bool) {
      // 单笔账单下已经核销的券不能再次核销
      if (bool) return;
      // 单击选中 双击取消
      this.couponList.forEach((item) => {
        if (item.couponKey === index) {
          if (item.checked) {
            item.checked = false;
          } else {
            item.checked = true;
          }
        }
      });
    },
    // 限制输入数字保留2位小数
    InputNumber(item, fixed) {
      // 输入框绑定的值
      let str = item.moneyconsum;
      // 获取当前输入框对应电子券的可用消费金额
      const canusebala = item.amount;
      // 获取当前输入框对应电子券的余额
      const { balance } = item;
      // 获取余额和可用余额的最小值
      let minBala;
      if (Number(canusebala) > Number(balance)) {
        minBala = balance;
      } else {
        minBala = canusebala;
      }
      // 待支付金额
      const amountToBePaid = Number();
      // 获取支付金额,余额,可用余额三者之间的最小值
      let tempVal;
      if (+minBala > +this.amountToBePaid) {
        tempVal = amountToBePaid;
      } else {
        // 若可用余额小于待支付金额则取可用余额。
        tempVal = minBala;
      }
      // 输入金额大于临时比较值
      if (str > tempVal) {
        this.$message.error(`${this.$t('Biz.Settlement.Error15')}`);
        str = tempVal;
      }
      this.$nextTick(() => {
        // eslint-disable-next-line no-param-reassign
        item.moneyconsum = this.onlyNumber(str, fixed);
      });
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
    // 清除输入框的值
    clearInput() {
      // 点击叉号清除输入框的值
      this.phoneOrCardNumber = '';
      // 隐藏叉号
      this.cancleValue = false;
    },
    // 点击核销按钮前验证操作是否合法
    verfiyBeforeSubmit() {
      // 核销前先验券号
      if (!this.cachePhoneOrCardNumber) {
        this.$message.error(this.$t('Biz.Coupon.EnterTicketNumber'));
        return false;
      }
      return true;
    },
    onClose() {
      // 清空手机号或者卡号
      this.phoneOrCardNumber = '';
      this.cachePhoneOrCardNumber = '';
      // 清空未核销券信息
      this.couponList = [];
      // 清空已核销券信息
      this.cancelledList = [];
      // 清空未核销券副本信息
      this.updateCouponList = [];
      // 清空VIPID这个变量
      this.vipId = '';
      // 分页当前页数
      this.currentPage = 1;
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
  .verificationbutton {
    display: inline-block;
    > .verification {
      height: 44px;
      background-color: #0babb9;
      > button {
        color: #fff;
      }
    }
  }
  .wrapper {
    display: flex;
    > .content-left {
      width: 410px;
      order: 1;
      display: flex;
      background-color: #ffffff;
      padding: 10px 16px 20px 16px;
      flex-direction: column;
      > h4 {
        margin-bottom: 10px;
      }
      > .top-sidebar {
        > p {
          padding-top: 10px;
          font-size: 14px;
          font-weight: bolder;
        }
        > form {
          padding: 10px 0;
          > button {
            min-width: 120px;
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
        position: relative;
        height: 372px;
        padding: 18px 22px;
        background-color: #f5f5f5;
        > .selectActive {
          border: 2px solid #0babb9 !important;
          position: relative;
        }
        > .selectActive::after {
          content: "✔";
          width: 18px;
          height: 18px;
          border-radius: 9px;
          color: #0babb9;
          border: 2px solid #0babb9;
          line-height: 15px;
          font-size: 14px;
          text-align: center;
          position: absolute;
          top: -6px;
          right: -4px;
          background-color: #fff;
        }
        > .electronic-ticket {
          width: 335px;
          height: 140px;
          border-radius: 5px;
          border: 2px solid #ccc;
          display: flex;
          flex-direction: column;
          font-weight: 400;
          margin-bottom: 15px;

          > .ticket-top {
            background-color: #d5eff1;
            flex-basis: 60px;
            padding: 10px 15px 5px 15px;
            border-radius: 5px 5px 0 0;
            border-bottom: 1px solid #ccc;

            > .ticket-namedate {
              display: flex;
              margin-bottom: 10px;
              > .ticket-name {
                flex: 1;
                font-weight: bolder;
              }

              > .ticket-date {
                flex: 1;
                text-align: right;
              }
            }
          }
          > .ticket-bottom {
            flex-grow: 1;
            display: flex;

            > .ticket-bottom-left {
              flex-grow: 1;
              padding: 16px 0 0 0;
              border-right: 1px dashed #ccc;

              > .ticket-balance {
                margin-bottom: 5px;
              }
            }

            > .ticket-bottom-right {
              flex-grow: 1;
              padding: 10px 6px;

              > .ticket-monetary {
                height: 30px;
                font-weight: bold;
              }
            }
          }
        }
        > .verification {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 100%;
          > button {
            display: block;
            margin: 0 auto;
            width: 80%;
            height: 40px;
            background-color: #0babb9;
            color: #fff;
          }
        }
        > .limitSelect {
          cursor: not-allowed;
          > .ticket-top {
            background-color: #eeeeee;
          }
          > .ticket-bottom {
            background-color: #eeeeee;
          }
        }
      }
      > .pos-pager-left {
        margin-top: 10px;
        text-align: right;
      }
    }
    > .content-right {
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
        height: 230px;
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
          height: 150px;
          > .voucher-coupon {
            width: 245px;
            /*height: 56px;*/
            height: 72px;
            display: flex;
            border: 1px solid #ccc;
            border-radius: 5px;
            margin-bottom: 10px;
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

    > .pos-pager {
      display: flex;
      justify-content: flex-end;
    }
    // 箭头按钮
    .pos-takeout-pager {
      display: flex;
      justify-content: flex-end;
      justify-items: center;
      .page-info {
        height: 30px;
        line-height: 30px;
      }
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
</style>
