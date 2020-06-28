<!--临时作为微生活模块开发，原始的是人民币结算方式，后面让后台单独添加一个微生活结算方式-->
<template>
  <Dialog
    name="PosDialog.PayWayTwitterLifeModal"
    :title="$t('Biz.Settlement.PayWayTwitterLifeModal')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :hotkeys="PayWayEasyLifeModal"
    :append-to-body="true"
    :showSubmit="true"
    :submit-text="$t('Dict.Btn.Settlement')"
    width="728px"
    id="PayWayEasyLifeModal">
    <!--插入按钮-->
    <button
      slot="other-button"
      type="button"
      class="btn btn-default"
      @click="recharge">{{$t('Dict.Btn.CardCharge')}}(F1)</button>
    <div class="easy-life body">
      <!--左侧布局-->
      <div class="list-area body-left" v-keyboard:keyboard>
        <p>{{$t('Biz.Settlement.EnterMemberCardOrPhone')}}</p>
        <!--查询搜索框-->
        <div class="item search-item">
          <div class="search">
            <input
              maxlength="22"
              v-model="searchText"
              :class="whichFocus === 'cardNo' ? 'focus' : ''"
              @keyup="InputIntNumber('searchText')"
              @focus="whichFocus = 'cardNo'"
              @blur="whichFocus = ''"
              v-autotest />
          </div>
          <div class="search-btn">
            <button
              type="button"
              @click="search"
              class="btn btn-primary"
              v-autotest>
              {{$t('Dict.Search')}}(Enter)
            </button>
          </div>
        </div>
        <div class="item settle-item">
          <div class="item-input margin-bt-10">
            <span>{{$t('Biz.Settlement.CardBalanceSettle')}}:</span>
            <input
              maxlength="18"
              v-model="cardBalance"
              :class="whichFocus === 'cardBalance' ? 'focus' : ''"
              @input="inputHandler($event, 'cardBalance')"
              @keyup="InputNumber('cardBalance', 2)"
              @focus="whichFocus = 'cardBalance'"
              @blur="whichFocus = ''"
              v-autotest />
          </div>
          <div class="item-input">
            <span>{{$t('Biz.Settlement.CreditSettle')}}:</span>
            <input
              maxlength="18"
              v-model="scoreBalance"
              :disabled="!accountInfo.canUseCredit"
              :class="whichFocus === 'scoreBalance' ? 'focus' : ''"
              @input="inputHandler($event, 'scoreBalance')"
              @keyup="InputNumber('scoreBalance', 2)"
              @focus="whichFocus = 'scoreBalance'"
              @blur="whichFocus = ''"
              v-autotest />
          </div>
        </div>
        <!--列表数据-->
        <div class="list">
          <p class="list-title">{{$t('Biz.Settlement.ChooseElectronicCoupons')}}:</p>
          <div class="table-body">
            <ul>
              <li
                v-for="(item, index) in showTicksLists"
                :key="index"
                class="as-ticks-btn"
                :class="{'checked': item.checked, 'limit': limit && !item.checked}"
                @click="chooseTicksClickHandler(item)">
                <div class="td-left-div">
                  <p>{{ item.title }}</p>
                  <p>{{ item.effective_time }}{{$t('Dict.To')}}{{ item.failure_time}}</p>
                </div>
                <div class="td-right-div">{{ item.deno }}</div>
              </li>
            </ul>
          </div>
        </div>
        <!--分页按钮-->
        <div class="pos-pager pos-takeout-pager">
          <span class="page-info">{{
            $t('Dict.PageStyle.Text1', {
              length: ticksLists.length,
              currentPage,
              totalPage: pageCount(ticksLists),
            })
          }}</span>
          <button class="prev" :disabled="preBtnDisabled" @click="upPage">
            <i class="el-icon-arrow-up"></i>
          </button>
          <button class="next" :disabled="nextBtnDisabled" @click="downPage(ticksLists)">
            <i class="el-icon-arrow-down"></i>
          </button>
        </div>
      </div>
      <!--右侧布局-->
      <div class="money-area body-right">
        <div class="item to-be-pay">
          <div>
            <span class="title"><b>{{$t('Biz.Settlement.BillPayment')}}</b></span>
            <div class="content"><span class="payouts-money">{{realPay | keepTwo}}</span></div>
          </div>
          <div>
            <span class="title"><b>{{$t('Biz.Settlement.ElectronicCouponSettle')}}</b></span>
            <div class="content">
              <span class="payouts-money">{{ticketsAccount | keepTwo}}</span>
            </div>
          </div>
        </div>
        <div class="info-area">
          <div class="detail-info">
            <div class="detail-info-head">
              <strong>{{ accountInfo.phone }}</strong>
              <img
                v-if="+accountInfo.sexy === 1"
                src="@/common/images/sl-msg/icon_male.png"
                alt="性别男">
              <img
                v-if="+accountInfo.sexy === 2"
                src="@/common/images/sl-msg/icon_female.png"
                alt="性别女">
            </div>
            <table>
              <tr>
                <td colspan="2">{{ accountInfo.name }} | {{ accountInfo.birthday }}</td>
              </tr>
              <tr>
                <td>{{$t('Biz.Settlement.RankName')}}:</td>
                <td>{{ accountInfo.level }}</td>
              </tr>
              <tr>
                <td>{{$t('Dict.CardNumber')}}:</td>
                <td>{{ accountInfo.cno }}</td>
              </tr>
              <tr>
                <td>{{$t('Biz.Settlement.OpenCardShop')}}:</td>
                <td>{{ accountInfo.getCardShop }}</td>
              </tr>
              <tr>
                <td>{{$t('Biz.Settlement.CardBalance001')}}</td>
                <td>{{ accountInfo.balance}}</td>
              </tr>
              <tr>
                <td>{{$t('Biz.Settlement.AvailableBalance')}}:</td>
                <td>{{ accountInfo.canUseBalance}}</td>
              </tr>
              <tr>
                <td>{{$t('Dict.RemainingPoints')}}:</td>
                <td>{{ accountInfo.integral}}</td>
              </tr>
              <tr>
                <td>{{$t('Biz.Settlement.OpenCardTime')}}:</td>
                <td>{{ accountInfo.time }}</td>
              </tr>
            </table>
          </div>
          <div class="keybord-content">
            <KeyBoard class="keybord" ref="keyboard"></KeyBoard>
          </div>
        </div>
      </div>
    </div>
    <AndroidInput ref="AndroidInput"></AndroidInput>
    <EasyLifeRecharge ref="EasyLifeRecharge" @search="search"></EasyLifeRecharge>
    <TwitterLifePayWayChooseCard ref="TwitterLifePayWayChooseCard"></TwitterLifePayWayChooseCard>
    <EasyLifeVerifyType ref="EasyLifeVerifyType"></EasyLifeVerifyType>
  </Dialog>
</template>

<script>
import AndroidInput from '@/components/Pos/Common/AndroidInput';
import AndroidInputMixin from '@/components/Pos/Common/AndroidInputMixin';
import { mapGetters } from 'vuex';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import numberformat from '@/common/js/numberformat';
import PageMixin from '@/common/util/PaginationMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import EasyLifeRecharge from '@/components/Pos/Order/Bill/Pay/components/EasyLifeRecharge';
import TwitterLifePayWayChooseCard from '@/components/Pos/Order/Bill/Pay/components/TwitterLifePayWayChooseCard';
import EasyLifeVerifyType from '@/components/Pos/Order/Bill/Pay/components/EasyLifeVerifyType';
import { find, cloneDeep, isEmpty } from 'lodash';
import { add, sub } from '@/common/js/math';

export default {
  components: {
    Dialog,
    KeyBoard,
    AndroidInput,
    EasyLifeRecharge,
    TwitterLifePayWayChooseCard,
    EasyLifeVerifyType,
  },
  mixins: [DialogMixin, PageMixin, AndroidInputMixin],
  data() {
    return {
      payWayInfo: {
        name: '',
      },
      resData: null,
      searchText: '', // 搜索条件
      prePageSize: 4, // 每页4条数据
      ticksLists: [], // 电子券列表
      remark: '', // 备注
      realPay: 0, // 优惠后的账单实收
      cardBalance: 0, // 卡余额
      scoreBalance: 0, // 积分余额
      tickets: 0, // 电子券结算
      accountInfo: { // 账户明细
        cno: '',
        sexy: '',
        name: '',
        birthday: '',
        level: '',
        phone: '',
        getCardShop: '',
        balance: 0,
        canUseBalance: 0,
        integral: 0,
        time: '',
        hasSearch: false, // 是否查询出了账户，没有的话不让结算
        canUseCredit: false, // 是否可以使用积分
      },
      isChargeReturnCredit: false, // 消费使用储值是否返回积分
      currentInput: '', // 当前是卡余额输入还是积分额输入
      shouldWatch: false, // 是否监听卡余额和积分额值的改变
      whichFocus: '', // 输入框聚焦时改变css样式
      limit: false, // 电子券的可点击状态
      isCallBackClose: false, // 是否是通过接口回调关闭的窗口
    };
  },
  props: {
    // 待付金额
    amountToBePaid: {
      default: 0,
    },
    bsId: {
      default: 0,
    },
    pointId: {
      default: 0,
    },
    teamBsIds: {
      default: '',
    },
    // 结算界面已收款金额
    actualPay: {
      default: 0,
    },
  },
  computed: {
    ...mapGetters([
      'posInfo',
      'posBaseInfo',
      'getSettleDiscType',
      'posOrderBill',
    ]),
    // 添加快捷键
    PayWayEasyLifeModal() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
        F1: () => {
          this.recharge();
        },
        Enter: () => {
          this.search();
        },
      };
    },
    // 显示列表
    showTicksLists() {
      return this.pagination(this.currentPage, this.prePageSize, this.ticksLists);
    },
    // 当前选中的电子券数组
    currentChooseTicks() {
      return this.ticksLists.filter(item => item.checked);
    },
    // 当前选择的电子券总面值
    ticketsAccount() {
      const ticketArr = this.ticksLists.filter(item => item.checked);
      return ticketArr.reduce((total, { deno }) => total + (+deno), 0) || 0;
    },
    // 卡余额和积分额的总和
    allBanlance() {
      // 这里是为了解决虽然限制了小数点后2位，但是输入第三位后总额这里会对应减少
      const { cardBalance, scoreBalance } = this;
      const cardStr = this.deleteChartCode(`${+cardBalance}`);
      const scoreStr = this.deleteChartCode(`${+scoreBalance}`);
      return add(cardStr, scoreStr);
    },
  },
  watch: {
    // 这里是为了监听当前是那个输入框输入的，卡余额还是积分额
    cardBalance() {
      if (this.shouldWatch) {
        this.currentInput = 'cardBalance';
      }
    },
    scoreBalance() {
      if (this.shouldWatch) {
        this.currentInput = 'scoreBalance';
      }
    },
    // 卡余额和积分余额联动的逻辑
    allBanlance(newVal) {
      const {
        cardBalance, scoreBalance, realPay, ticketsAccount, accountInfo, currentInput,
      } = this;
      this.shouldWatch = false; // 此属性只有在input事件时为真，为了防止重复赋值卡余额或积分额，因为allBanlance依赖卡余额和积分额
      if (+cardBalance > +accountInfo.canUseBalance) { // 卡余额最大值不能超过用户可用的卡余额
        this.cardBalance = accountInfo.canUseBalance;
      }
      if (+scoreBalance > +accountInfo.integral) { // 积分额最大值不能超过用户可用的积分余额
        this.scoreBalance = accountInfo.integral;
      }
      if (realPay <= ticketsAccount) { // 电子券总额是否已经足够支付账单实收，如果足够清零卡和积分额
        this.cardBalance = 0;
        this.scoreBalance = 0;
      } else { // 电子券总额不够支付账单实收
        const many = sub(realPay, ticketsAccount); // 账单实收减去电子券后还需支付的金额
        if (newVal > many) { // 如果总额大于账单实收减去电子券后的差额，需要减少卡余额或积分额的值
          const minusNum = sub(newVal, many);
          if (Object.is(currentInput, 'cardBalance')) { // 如果当前输入是卡余额，对应减少积分额
            if (scoreBalance >= minusNum) { // 还应付金额为50，积分额为30，卡余额输入后为30，30+30-50 = 10；积分额对应减少10
              this.scoreBalance = sub(scoreBalance, minusNum);
            } else { // 还应付金额为50，积分额为5，卡余额输入后为55，5+55-50 = -10；积分额不够减去10，卡余额变为差额，清空积分额
              this.cardBalance = many;
              this.scoreBalance = 0;
            }
          } else if (cardBalance >= minusNum) { // 当前输入是积分额，对应减少卡余额，逻辑同上
            this.cardBalance = sub(cardBalance, minusNum);
          } else {
            this.scoreBalance = many;
            this.cardBalance = 0;
          }
        }
      }
    },
    // 改变电子券总额时和卡余额、积分额的联动逻辑
    ticketsAccount(newVal, oldVal) {
      if (Object.is(newVal, oldVal)) return;
      const { scoreBalance, cardBalance, realPay } = this;
      this.shouldWatch = false;
      if (scoreBalance || cardBalance) { // 如果卡余额或积分余额输入框不为零的情况下，添加电子券对应减少卡余额或积分余额
        if (Object.is(+cardBalance, 0)) { // 如果卡余额为零，则添加电子券后减少积分余额的值
          const many = sub(realPay, newVal);
          if (many > 0) {
            this.scoreBalance = many;
          } else {
            this.scoreBalance = 0;
            this.forbidTicketsClick(true);
          }
        } else if (Object.is(+scoreBalance, 0)) { // 如果积分余额为零，则添加电子券后减少卡余额的值
          const many = sub(realPay, newVal);
          if (many > 0) {
            this.cardBalance = many;
          } else {
            this.cardBalance = 0;
            this.forbidTicketsClick(true);
          }
        } else { // 卡余额和积分都不为零，优先扣除卡余额
          const many = sub(realPay, newVal);
          if (many > 0) {
            this.cardBalance = many;
            this.scoreBalance = 0;
          } else {
            this.cardBalance = 0;
            this.scoreBalance = 0;
          }
        }
      } else if (newVal >= realPay) { // 卡余额和积分余额输入框都为零的情况下，电子券总额 >= 账单实收时，禁止其他未选择的电子券点击状态
        this.forbidTicketsClick(true);
      } else { // 卡余额和积分余额输入框都为零的情况下，电子券总额 < 账单实收时，解放其他未选择的电子券点击状态 优先使用卡余额
        this.cardBalance = realPay;
        this.forbidTicketsClick(false);
      }
    },
  },
  filters: {
    keepTwo(val) {
      return numberformat(val) || 0.00;
    },
    divide100(val) {
      if (+val > 0) {
        return val / 100;
      }
      return 0;
    },
  },
  methods: {
    // 输入卡号后点击查询
    async search() {
      if (!this.searchText) {
        this.$message.error(`${this.$t('Biz.Settlement.EnterMemberCardOrPhone')}`);
        return;
      }
      this.currentPage = 1;
      const accountInfo = await this.easyLifeSearchApi();
      const calcInfo = await this.easyLifeCalcApi();
      if (calcInfo && calcInfo.message) {
        this.$message.success(`${calcInfo.message}`);
      }
      if (accountInfo && accountInfo.length > 1) { // 手机号下存在多张卡号
        this.hasManyCards(accountInfo, calcInfo);
      } else if (accountInfo && accountInfo.length > 0) {
        this.chooseCardData(accountInfo[0], calcInfo); // 整理优惠和查询的卡信息
        this.determineFillAllCardBalance(); // 初始化卡余额的值
      }
    },
    // 如果账户有多张卡的情况下弹出卡选择列表
    hasManyCards(accountInfo, calcInfo) {
      const cardList = [];
      accountInfo.map((item) => { // 获取所有卡号，传给子组件
        cardList.push(item.cno);
        return item;
      });
      this.$refs.TwitterLifePayWayChooseCard.open(cardList, {
        submit: (cardNum) => {
          this.searchText = cardNum;
          const {
            filterAccountInfo,
            filterCalcInfo,
          } = this.filterChooseCardData(cardNum, accountInfo, calcInfo);
          this.chooseCardData(filterAccountInfo, filterCalcInfo); // 整理优惠和查询的卡信息
          this.determineFillAllCardBalance(); // 初始化卡余额的值
        },
      });
    },
    // 过滤出选择卡页面选择的卡的优惠和数据
    filterChooseCardData(cardNum, accountInfo, calcInfo) {
      const filterAccountInfo = find(accountInfo, { cno: cardNum });
      const filterCalcInfo = find(calcInfo, { cno: cardNum });
      return {
        filterAccountInfo,
        filterCalcInfo,
      };
    },
    // 给数组里的对象添加checked和tickId属性,并给数组整体排序
    addAttrAndSort(lists) {
      const arr = cloneDeep(lists);
      const tmpArr = [];
      if (arr && arr.length > 0) {
        arr.map((item) => {
          const { coupon_ids } = item;
          if (coupon_ids && coupon_ids.length > 0) { // coupon_ids是字符串数组 代表同一种券的不同id
            coupon_ids.map((id) => {
              const cpItem = cloneDeep(item);
              Object.assign(cpItem, {
                checked: false,
                tickId: id,
              });
              tmpArr.push(cpItem);
              return id;
            });
          }
          return item;
        });
      }
      return tmpArr.sort((a, b) => b.deno - a.deno);
    },
    // 选择卡的优惠和数据信息
    chooseCardData(accountInfo2, calcInfo2) {
      const accountInfo = cloneDeep(accountInfo2);
      const calcInfo = cloneDeep(calcInfo2);
      this.ticksLists = [];
      if (calcInfo && calcInfo.finalPrice) { // 获取优惠后的价格赋值给实收账单
        this.realPay = calcInfo.consumeTrueMoney;
      }
      const {
        cno, balance, credit, birthday,
        open_source, phone, name, grade_name, registered,
        gender, use_credit, coupons,
        charge_return_credit,
      } = accountInfo;
      this.isChargeReturnCredit = charge_return_credit; // 消费使用储值是否返回积分
      this.ticksLists = this.addAttrAndSort(coupons); // 电子券列表
      let canUseBalance = 0;
      // 判断可用余额(这个字段有可能返回数字 null 或者不返回)
      if (!accountInfo.max_shop_use_saving && accountInfo.max_shop_use_saving !== 0) {
      // if (isEmpty(max_shop_use_saving)) { // 判断可用余额
        canUseBalance = accountInfo.max_use_saving;
      } else {
        canUseBalance = accountInfo.max_shop_use_saving;
      }
      this.accountInfo = Object.assign(this.accountInfo, {
        cno, // 卡号
        sexy: gender, // 性别 1男 2女
        name, // 姓名
        birthday, // 生日
        level: grade_name, // 等级
        phone, // 手机
        getCardShop: open_source, // 开卡门店
        balance: this.$options.filters.divide100(balance), // 卡余额
        canUseBalance: this.$options.filters.divide100(canUseBalance), // 可用余额
        integral: credit, // 积分额
        time: registered, // 开卡时间
        hasSearch: true, // 是否查询出了账户，没有的话不让结算
        canUseCredit: use_credit, // 判断是否可以使用积分
      });
      this.searchText = cno;
    },
    // 点击选择电子券事件
    chooseTicksClickHandler(item) {
      const checked = !item.checked;
      if (this.limit && checked) return;
      Object.assign(item, {
        checked,
      });
    },
    // 微生活查询接口
    easyLifeSearchApi() {
      return ajax('canyin.pos.settlement.pay.twitterlifepayway.getuseraccount', {
        contentType: 'URLEncoded',
        data: {
          cno: this.searchText,
        },
      }).then(res => res);
    },
    // 微生活优惠价格接口
    easyLifeCalcApi() {
      const {
        bsId, pointId, actualPay, teamBsIds,
      } = this;
      const discTypeParams = this.getSettleDiscType[bsId]; // 打折类型参数
      return ajax('canyin.pos.settlement.pay.twitterlifepayway.calc', {
        contentType: 'URLEncoded',
        data: {
          bsId,
          pointId,
          actualPay,
          teamBsIds,
          discTypeParams,
        },
      }).then(res => res);
    },
    // 微生活取消接口
    easyLifeCancelApi() {
      const {
        bsId, pointId, teamBsIds, isCallBackClose, accountInfo,
      } = this;
      // 没有查询会员或者是通过接口关闭的不执行撤销优惠操作
      if (!accountInfo.hasSearch || isCallBackClose) return;
      const discTypeParams = this.getSettleDiscType[bsId]; // 打折类型参数
      const data2 = {
        bsId,
        pointId,
        teamBsIds,
        discTypeParams,
      };
      ajax('canyin.pos.settlement.pay.twitterlifepayway.cancel', {
        contentType: 'URLEncoded',
        data: data2,
      }).then(() => {
        // 刷新流水账单
        this.$emit('refreshBill');
        this.$message.success(`${this.$t('Biz.Settlement.Success12')}`);
      }).catch(() => {
        // 刷新流水账单
        this.$emit('refreshBill');
        this.$message.error(`${this.$t('Biz.Settlement.Error29')}`);
      });
    },
    // 打开页面回调
    onOpen() {
      this.limit = false;
      this.payWayInfo = this.resData.payWay;
      this.realPay = this.amountToBePaid; // 打开页面时初始化账单实收的值
      this.currentPage = 1;
      this.searchText = '';
      this.remark = '';
      // 每次进入, 默认选中输入内容
      if (this.$refs.keyboard) {
        this.$refs.keyboard.reSelect();
      }
    },
    // 关闭页面回调
    onClose() {
      this.easyLifeCancelApi();
      this.clearCache();
    },
    // 清空缓存的数据
    clearCache() {
      this.accountInfo = {
        account: '',
        sexy: 'man',
        name: '',
        birthday: '',
        level: '',
        phone: '',
        getCardShop: '',
        balance: 0,
        canUseBalance: 0,
        integral: 0,
        time: '',
        hasSearch: false,
        canUseCredit: false,
      };
      this.ticksLists = [];
      this.currentPage = 1;
      this.searchText = '';
      this.realPay = 0; // 优惠后的账单实收
      this.cardBalance = 0; // 卡余额
      this.scoreBalance = 0; // 积分余额
      this.tickets = 0; // 电子券结算
      this.isCallBackClose = false;
      this.preBtnDisabled = true;
      this.nextBtnDisabled = false;
    },
    // 预订挂账-预订单组件打开
    recharge() {
      const { accountInfo } = this;
      // if (!accountInfo.hasSearch) {
      //   this.$message.error(`${this.$t('Biz.Settlement.Error30')}`);
      //   return;
      // }
      this.$refs.EasyLifeRecharge.open({
        cardNum: accountInfo.cno,
        balance: accountInfo.balance,
      });
    },
    // 点击提交
    onSubmit() {
      const {
        ticketsAccount, allBanlance, accountInfo,
      } = this;
      if (!accountInfo.hasSearch) {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning32')}`);
        return;
      }
      // 产品要求更改：微生活可以0元结算
      // if (!ticketsAccount) { // 没有选择电子券时 卡余额和积分额不能为空
      //   if (!allBanlance || +allBanlance === 0) {
      // this.$message.warning(`${this.$t('Biz.Settlement.Warning33')}`);
      //     return;
      //   }
      // }
      const params = cloneDeep(this.resData.params);
      this.beforehandSettle(params);
    },
    // 获取选中的电子券的自定义金额礼品券、代金券、礼品券列表
    getPayTicksList() {
      const { currentChooseTicks } = this;
      const diyGiftCouponPay = [];
      const denoCouponIds = [];
      const giftCouponsIds = [];
      currentChooseTicks.map((item) => {
        if (+item.type === 1) {
          denoCouponIds.push(item.tickId);
        } else if (+item.type === 2 && item.is_diy_deno) {
          diyGiftCouponPay.push({
            user_coupon_id: item.tickId,
            deno: parseFloat(item.deno) * 100,
          });
        } else {
          giftCouponsIds.push(item.tickId);
        }
        return item;
      });
      return { diyGiftCouponPay, denoCouponIds, giftCouponsIds };
    },
    // 获取微生活接口参数
    getTwitterLifeParams(totalVal) {
      const {
        cardBalance, scoreBalance, isChargeReturnCredit, getPayTicksList, actualPay,
        accountInfo,
      } = this;
      const { diyGiftCouponPay, denoCouponIds, giftCouponsIds } = getPayTicksList();
      return {
        cno: `${accountInfo.cno}`, // 卡号
        subBalance: `${cardBalance}`, // 卡余额输入值
        subCredit: `${scoreBalance}`, // 积分额输入值
        consumeAmount: `${totalVal}`, // 卡 + 积分 + 电子券总额 最大不超过账单实收
        paymentAmount: `${actualPay}` || '0', // 其他结算方式支付金额
        diyGiftCouponPay: diyGiftCouponPay.length > 0 ? diyGiftCouponPay : null, // 使用的可自定义金额的礼品券列表
        denoCouponIds: denoCouponIds.length > 0 ? denoCouponIds : null, // 使用的代金券列表
        giftCouponsIds: giftCouponsIds.length > 0 ? giftCouponsIds : null, // 使用的礼品券列表
        chargeReturnCredit: isChargeReturnCredit, // 消费使用储值是否返回积分
      };
    },
    // 微生活预结算接口
    beforehandSettle(data) {
      const dpData = cloneDeep(data);
      const {
        ticketsAccount, allBanlance, realPay,
      } = this;
      let totalSettleValue = 0;
      if (ticketsAccount + allBanlance > realPay) {
        totalSettleValue = realPay;
      } else {
        totalSettleValue = ticketsAccount + allBanlance;
      }
      Object.assign(dpData, {
        pay_money: totalSettleValue,
        take_money: totalSettleValue,
      });
      const twitterLifeParams = this.getTwitterLifeParams(totalSettleValue);
      const isTeamSettle = this.posOrderBill.bsData.is_team;
      const data2 = `params=${(JSON.stringify(dpData))}&twitterLifeParams=${JSON.stringify(twitterLifeParams)}&isTeamSettle=${isTeamSettle}`;
      ajax('canyin.pos.settlement.pay.twitterlifepayway.settle', {
        contentType: 'diy',
        data: data2,
      }).then((res) => {
        const { verifySms, verifyPassword } = res;
        const isPasswordOrMessage = verifySms || verifyPassword;
        this.$refs.EasyLifeVerifyType.open({
          bsId: this.bsId,
          isPasswordOrMessage,
        }, {
          submit: () => {
            this.isCallBackClose = true;
            this.close();
            // 刷新流水账单
            this.$emit('refreshBill');
          },
        });
      });
    },
    // 电子券金额+卡余额+积分余额 >= 账单实收后，限制未选择的电子券的可点击状态
    forbidTicketsClick(bool) {
      this.limit = bool;
    },
    // 卡余额大于小于等于账单实收的情况
    determineFillAllCardBalance() {
      const { realPay, accountInfo } = this;
      if (realPay >= accountInfo.canUseBalance) { // 如果卡内余额小于等于账单实收，卡内余额结算 = 卡内余额
        this.cardBalance = accountInfo.canUseBalance;
      } else {
        this.cardBalance = realPay; // 如果卡内余额大于账单实收，卡内余额结算 = 账单实收
      }
    },
    // input handler
    inputHandler(e, attr) {
      const { accountInfo } = this;
      if (!accountInfo.hasSearch) return; // 防止用户在没搜索卡号的情况先下输入数量破坏联动逻辑
      this.shouldWatch = true;
      this[attr] = e.target.value;
    },
    // 重置分页
    reSetPagination() {
      this.currentPage = 1;
    },
    // 更改账户
    changePayout(item) {
      // this.currentPayout = item;
      item.checked = !item.checked;
    },
    // 限制输入数字
    InputIntNumber(key) {
      let str = '';
      str += this[key];
      this.$nextTick(() => {
        this[key] = str.replace(/[^\d]/g, '');
      });
    },
    // 限制输入数字保留2位小数
    InputNumber(key, fixed) {
      const str = this[key];
      this.$nextTick(() => {
        this[key] = this.onlyNumber(str, fixed);
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
    // 删除小数点后第三位的字符
    deleteChartCode(str) {
      let tmpStr = `${str}`;
      if (tmpStr.indexOf('.') > -1) {
        const arr = tmpStr.split('.');
        if (arr[1] && arr[1].length > 2) {
          tmpStr = tmpStr.substring(0, tmpStr.length - 1);
        }
      }
      return tmpStr;
    },
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";

  .easy-life{
    display: table;
    width: 100%;
    height: 570px;
    >* {
      display: table-cell;
      vertical-align: top;
    }
  }
  .list-area{
    position: relative;
    padding: 16px;
    width: 466px;
    background-color: @white;
    border-right: 1px solid #ddd;
  }
  .item{
    display: table;
    width: 100%;
    >*{
      display: table-cell;
    }
    .payouts-money{
      font-size: 18px;
      color: #0babb9;
      font-weight: bold;
    }
    & + &{
      margin-top: 10px;
    }
  }
  .search-item{
    .search{
      width: 310px;
    }
    .search-btn{
      padding-left: 8px;
      vertical-align: middle;
      button{
        width: 100%;
      }
    }
    input {
      width: 100%;
      padding: 0 50px 0 15px;
      height: 40px;
      line-height: 40px;
      border-radius: 4px;
      outline: none;
      border: 1px solid #dcdfe6;
      transition: border-color 0.3s cubic-bezier(0.645, 0.045, 0.355);
      &:hover {
        border-color: #bbb;
      }
      &[disabled] {
        cursor: not-allowed;
      }
    }
    .focus {
      border-color: #039eac;
    }
  }
  .settle-item {
    & > .item-input {
      display: flex;
      position: relative;
      align-items: center;
      & > span:first-child {
        width: 120px;
        color: gray;
      }
      & > span:last-child {
        position: absolute;
        right: 15px;
        color: #bbbbbb;
      }
      input {
        flex: 1;
        padding: 0 50px 0 15px;
        height: 40px;
        line-height: 40px;
        border-radius: 4px;
        outline: none;
        border: 1px solid #dcdfe6;
        transition: border-color 0.3s cubic-bezier(0.645, 0.045, 0.355);
        &:hover {
          border-color: #bbb;
        }
        &[disabled] {
          cursor: not-allowed;
        }
      }
      .focus {
        border-color: #039eac;
      }
    }
    .margin-bt-10 {
      margin-bottom: 10px;
    }
  }
  .title{
    width: 78px;
    font-size: 14px;
  }
  .list{
    /*margin-bottom: 50px;*/
    .list-title{
      font-size: 14px;
      color: #333;
      line-height: 2.5;
      margin-top: 8px;
    }
    table{
      width: 100%;
    }
    th,td{
      padding-left: 6px;
      font-weight: normal;
    }
    .table-head{
      padding: 4px 0;
      background-color: #7bcad6;
      color: @white;
      th {
        font-size: 12px;
        line-height: 1.1;
      }
      th+th{
        border-left: 1px solid @white;
      }
    }
    .table-body{
      margin-top: 6px;
      padding: 15px;
      color: @gray-dark;
      height: 300px;
      border-radius: 3px;
      background-color: #eeeeee;
      border: 1px solid #bbbbbb;
      & > ul {
        list-style-type: none;
        height: 100%;
        .as-ticks-btn {
          display: flex;
          position: relative;
          margin-bottom: 5px;
          padding: 3px 0;
          width: 100%;
          height: 60px;
          border-radius: 5px;
          cursor: pointer;
          color: #ffffff;
          background-color: rgb(133, 200, 189);
          &.checked {
            border: 2px solid rgb(11, 171, 185);
          }
          &.checked:after {
            content: '';
            width: 24px;
            height: 24px;
            position: absolute;
            right: -12px;
            top: -6px;
            background-image: url(~@/common/images/pos/bill/ticks-checked.png);
          }
          .td-left-div {
            flex: 1;
            padding: 10px;
            font-size: 14px;
          }
          .td-right-div {
            padding: 10px;
            width: 75px;
            font-size: 26px;
            border-left: 2px dotted #ffffff;
          }
          &.limit {
            cursor: not-allowed;
          }
        }
      }
    }
    .no-col{
      width: 9.7%;
    }
    .name-col{
      width: 36%;
    }
    .quota-col{
      width: 16%;
    }
    .balance-col{
      width: 16%;
    }
    .status-col{
      width: 10.1%;
    }
    td.choose-col{
      text-align: center;
    }
    .account-checkbox{
      vertical-align: -6px;
    }
  }
  .no-item{
    text-align: center;
    font-size: 14px;
    color: #999999;
    padding-top: 20px;
  }
  .tip-content{
    display: inline-block;
    font-size: 12px;
    img.document-icon{
      float: left;
      padding-right: 8px;
    }
    p{
      text-align: left;
      line-height: 36px;
      word-break:keep-all;
      white-space:nowrap;
    }
  }

  // 箭头按钮
  .pos-takeout-pager {
    position: absolute;
    right: 12px;
    bottom: 1px;
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
        color : #9a9a9a;
      }

      &[disabled] {
        color: @btn-disabled-color;
        cursor: not-allowed;
      }
    }
  }

  .money-area{
    background-color: #f5f5f5;
    .to-be-pay{
      display: flex;
      flex-direction: column;
      padding: 12px;
      /*line-height: 52px;*/
      border-bottom: 1px dashed #b5b5b5;
      .content{
        text-align: right;
      }
      & > div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        & > span {
          width: 85px;
        }
      }
    }
    .info-area{
      padding: 12px;
      .detail-info {
        table {
          width: 100%;
          tr {
            td {
              padding-top: 3px;
            }
            td:nth-child(1) {
              text-align: left;
              color: gray;
            }
            td:nth-child(2) {
              text-align: right;
            }
          }
          tr:nth-child(2) > td {
            padding-top: 10px;
          }
        }
      }
    }
    .pay-money{
      margin-top: 12px;
    }
    .remark-title{
      line-height: 2;
    }
    .keybord-content{
      margin: 20px 0;
      text-align: center;
    }
  }
</style>
<style>
  .easy-life .el-input__inner {
    padding-right: 30px;
  }
</style>
