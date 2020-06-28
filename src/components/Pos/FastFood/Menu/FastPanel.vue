<template>
  <div>
    <ul class="list" ref="list">
      <li
        v-for="(item, index) in list"
        :key="item.id"
        class="item"
        v-bind:class="{'no-click':item.isCanClick}"
        v-clickoutside:[{isOpen:item.isOpen,index}]="handleClose"
      >
        <div
          @click="fastBtn(item)"
          class="body"
          :class="[
            {showMemberPriceSelect: (
              memberPriceToggle && item.btnName == 'doMemberPrice'
            ) ? true : false },
            {showMemberPriceSelect: (
              memberPriceToggle === false && item.btnName == 'cancelMemberPrice'
            ) ? true : false}
          ]"
        >
          <div class="svg-hot">
            <svg :class="[
              'svg',
              'mglf0',
              {'mt6em':item.hotKeyText}
            ]"
            aria-hidden="true"
            v-if="item.name">
              <use :xlink:href="`#icon-${item.iconName || 'default'}`"></use>
            </svg>
            <!-- <p>(Alt+R)</p>后期加快捷键用 -->
            <p class="hotkeytext">{{item.hotKeyText ? `(${item.hotKeyText})` : ''}}</p>
          </div>
          <div class="fast-btn">
            <div class="content-word">{{ item.name }}</div>
          </div>
        </div>
        <!-- 打折 抽屉显示 -->
        <PagerSlot class="drawerBox" :class="!drawerPaginationBtnShow?'drawerBoxNoArrow':''"
         v-if="item.isOpen&&isDrawerOpen" v-show="item.isShow"
        :paginationShow="drawerPaginationShow"
        :paginationBtnShow="drawerPaginationBtnShow"
        :arrowAlign="'center'"
        :style="{top: -drawerTop-8 + 'px', height: drawerTop + 'px'}"
        :listAll="discountPlanList" :pageSize="drawerPageSize">
          <template slot="list" slot-scope="scope">
            <li v-for="(disItem) in scope.showList" :key="disItem.discountPlanId"
            :class="{active: ((getSelectDiscountPlanData && disItem.discountPlanId === getSelectDiscountPlanData.discountPlanId))
            || (!getSelectDiscountPlanData && !disItem.discountPlanId)}"
            @click="selectPlanBtn(disItem, item)">
              <button class="planListBtn">{{disItem.discountPlanName}}</button>
            </li>
          </template>
        </PagerSlot>
      </li>
      <li class="item" @click="nextPage">
        <div class="body nextPageCenter">{{ $t('Dict.NextPage') }}</div>
      </li>
    </ul>
    <!-- 读取挂单 -->
    <DesignatesList ref="designatesList"></DesignatesList>
    <!-- 电话外卖落单 -->
    <TakeoutPhone ref="takeoutPhone"></TakeoutPhone>
    <!-- 折扣方案列表 -->
    <ActivityScheme ref="activityScheme"></ActivityScheme>
    <!-- 手工操作 -->
    <HandDoSettle ref="handDoSettle"></HandDoSettle>
    <!-- 支付宝付款码 -->
    <FastAlipayPaymentCode
      ref="fastAlipayPaymentCode"
      @manualSettle="manualSettle"
      @enforceSettle="enforceSettle"
    ></FastAlipayPaymentCode>
    <!-- 微信付款码 -->
    <FastWeChatPaymentCode
      ref="fastWeChatPaymentCode"
      @manualSettle="manualSettle"
      @enforceSettle="enforceSettle"
    ></FastWeChatPaymentCode>
    <!-- 微信+支付宝二码合一超级无敌付款码 -->
    <FastScanCode ref="fastScanCode" @manualSettle="manualSettle" @enforceSettle="enforceSettle"></FastScanCode>
    <!-- 云闪付付款码 -->
    <FastUnionPayPaymentCode
      ref="fastUnionPayPaymentCode"
      @manualSettle="manualSettle"
      @enforceSettle="enforceSettle"
    ></FastUnionPayPaymentCode>
    <!-- CRM6 -->
    <FastMembershipCardCrm6 ref="fastMembershipCardCrm6"></FastMembershipCardCrm6>
    <!-- CRM7 -->
    <FastMembershipCardCrm7 ref="fastMembershipCardCrm7" @cancelCrmSettle = "cancelCrmSettle"></FastMembershipCardCrm7>
    <!-- 验证会员 -->
    <FastFoodVerifiedMember
      ref="fastFoodVerifiedMember"
      @manualSettle="manualSettle"
      @enforceSettle="enforceSettle"
    ></FastFoodVerifiedMember>
    <!-- 代金券列表和结算 -->
    <VoucherList ref="voucherList"></VoucherList>
    <VoucherModal
      ref="voucherModal"
      @clearTicket="clearTicketPayInfo"></VoucherModal>
    <!-- 线上礼品券 -->
    <FastCardGiftAndVoucher ref="fastCardGiftAndVoucher"></FastCardGiftAndVoucher>
    <!-- 结算 -->
    <Pay ref="fastPay"></Pay>
    <CancelDeposit ref="cancelDeposit"></CancelDeposit>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
import { extend, each, cloneDeep } from 'lodash';
import { sub } from '@/common/js/math';
import * as MathUtil from '@/common/js/math';
import ajax from '@/common/js/ajax';
import * as itemConstantSet from '@/common/dictionary/pos-ordering-item-constant-set.js';
import rechargeVue from '@/components/Pos/Member/components/recharge.vue';
import "@static/fonts/tiling/iconfont.js";
const PagerSlot = () => import('@/components/Pos/Common/PagerSlot');
// 读取挂单请求的列表弹框 discountPlanList
const DesignatesList = () => import('./FastPanelFunc/DesignatesList');
// 电话外卖落单弹框
const TakeoutPhone = () => import('./FastPanelFunc/TakeoutPhone');
// 打折活动方案的弹框
const ActivityScheme = () => import('./FastPanelFunc/ActivityScheme');
// 手工操作
const HandDoSettle = () => import('./FastPanelFunc/HandDoSettle');
// 支付宝付款码
const FastAlipayPaymentCode = () => import('./FastPanelFunc/FastAlipayPaymentCode');
//  微信付款码
const FastWeChatPaymentCode = () => import('./FastPanelFunc/FastWeChatPaymentCode');
// 微信+支付宝二码合一超级无敌付款码
const FastScanCode = () => import('./FastPanelFunc/FastScanCode');
// 云闪付付款码
const FastUnionPayPaymentCode = () => import('./FastPanelFunc/FastUnionPayPaymentCode');
// CRM6
const FastMembershipCardCrm6 = () => import('./FastPanelFunc/FastMembershipCardCrm6');
// CRM7
const FastMembershipCardCrm7 = () => import('./FastPanelFunc/FastMembershipCardCrm7');
// 验证会员模块
const FastFoodVerifiedMember = () => import('./FastPanelFunc/FastFoodVerifiedMember');
// 线上礼品券
const FastCardGiftAndVoucher = () => import('./FastPanelFunc/FastCardGiftAndVoucher');
// 结算
const Pay = () => import('@/components/Pos/Order/Bill/Pay');
// 代金券列表
const VoucherList = () => import('./FastPanelFunc/VoucherList');
// 代金券
const VoucherModal = () => import('./FastPanelFunc/VoucherModal');
// 退押金
const CancelDeposit = () => import('./FastPanelFunc/CancelDeposit');

// typeId:6代表微信二维码;typeId:8代表支付宝付款码;typeId:18代表云闪付付款码
// 快速结算的ref集合
const settleRefs = [
  { typeId: 6, ref: 'fastWeChatPaymentCode' },
  { typeId: 8, ref: 'fastAlipayPaymentCode' },
  { typeId: 18, ref: 'fastUnionPayPaymentCode' },
  { typeId: 507, ref: 'fastScanCode' },
];
// 目前已知的结算类的按钮方法集合
const settleBtnList = [
  'crmFastSettle', // 会员卡
  'aliScancodeFastSettle', // 支付宝
  'wechatScancodeFastSettle', // 微信
  'paymentcode', // 付款码
  'cashFastSettle', // 现金类
  'unionPayScancodeFastSettle', // 银联
  'cardGiftAndVoucher', // 礼品卡券
  'crmNoDialogFastSettle', // 会员卡快速结算
  'settlement', // 更多结算
  'voucher', // 代金券
];

export default {
  name: 'fastPanel',
  components: {
    VoucherList,
    VoucherModal,
    HandDoSettle,
    DesignatesList,
    TakeoutPhone,
    ActivityScheme,
    FastAlipayPaymentCode,
    FastWeChatPaymentCode,
    FastUnionPayPaymentCode,
    FastMembershipCardCrm6,
    FastMembershipCardCrm7,
    FastFoodVerifiedMember,
    FastCardGiftAndVoucher,
    Pay,
    FastScanCode,
    CancelDeposit,
    PagerSlot,
  },
  data() {
    return {
      paymentGetBillData: {},
      drawerPaginationBtnShow: false, // 抽屉页码箭头
      drawerPaginationShow: false, // 抽屉页码
      drawerPageSize: 6, // 鲜果抽屉6个翻页
      list: [],
      pageNum: 0,
      pageCount: 0,
      ORDER_CODE_MODE_AUTO: 1, // 自动
      ORDER_CODE_MODE_HAND: 2, // 手动
      bsMemberPriceFlg: null, // 快餐模式是否启用会员价
      ticketData: {}, // 代金券收集数据
      pointDishList: [], // 已加单品项数据
      pointAddedList: [], // 新加单品相数据
      // 计算后的找零
      computedGive: '',
      baseScanCodePayway: {
        // 当面付支付状态
        ALI_FACE_PAY_STATUS_NO_WUU: 0, // 未调用吾享接口
        ALI_FACE_PAY_STATUS_SUCCESS: 1, // 调用接口返回成功
        ALI_FACE_PAY_STATUS_NO_SETTLE: 4, // 支付未成功（调用吾享支付接口成功，还没有进行结算）
        payStatus: 0,
        // 当面付支付状态, 状态值描述：
        // 0：未调用吾享接口，业务验证失败
        // 1：调用支付接口成功，并且查询到支付成功信息
        // 2：调用接口本地错误（未进入服务端接口：超时、404等客户端错误），【暂未使用，保留】
        // 3：调用接口返回失败（500、线上逻辑失败等），【目前所有错误都归结为此类错误】
        // 4：支付未成功，调用支付接口成功，但是为查询到支付成功信息
        // 现存问题：关闭当面付支付窗口，再次重新打开之后，支付状态会重置成0
        cashfastsettleMoney: 0,
        printData: '', // 打印数据
        items: null, // 加单数据
        loading: false, // 正在读接口
        scanned: false, // 已扫过码
        preclose: false, // 准备关闭弹窗状态
      },
      // 执行会员价, 按钮选中状态开关
      memberPriceToggle: null,
      btnIsEnable: false,
      noClickBtn: [], // 不可以点击的按钮
      // isForceMemberQuery:false,//是否显示执行会员价和取消会员价(后台是否开启验证会员后执行销售方案会员价，如果不开启则不显示)
      otherPaywayId: '', // 其他类结算方式Id
      otherPaywayTypeId: '', // 其他类结算方式支付类型
      otherPaywayName: '', // 其他类结算方式名称
      otherPayWayTypeFlg: null, // 其他类结算方式标识
      newPaywayId: '', // 新建结算方式Id
      newPaywayName: '', // 新建结算方式名称
      handlingPhone: '', // 外卖电话号
      payTypeName: '', // 结算方式的名称，点击快速结算时候存储一下，目的是为了没菜点结算按钮进行删菜操作
      activeItem: null, // 账单选中的品项
      payBtnItem: null,
      isCheckItemMustAdd: 0, // 必点品项校验
    };
  },
  mounted() {
    // setTimeout(() => { // watch数据时有初始化
    //   this.initPage();
    //   // 后台设置了验证会员后执行销售方案会员价 前台置灰执行会员价和取消会员价按钮
    //   this.isForceMemberQueryDisable();
    // }, 0);
    // 接受传来结算方式数据
    this.$von('returnPayemntDataBus', (data) => {
      this.fastSettleTypeKind(data.paywayType, data.btnMoney);
    });
    this.$von('handlefastPanleBtn', (item) => {
      this.fastBtn(item);
    });
    this.$von('fastFoodActiveItem', (item) => {
      this.activeItem = item;
    });
    // 手工操作确认按钮触发手工结算方法
    this.$von('cashSettleBus', (data) => {
      this.computedGive = data.give;
      this.cashSettle(data.btnMoney, data.pay, data.give);
    });
    // 清空账单
    this.$von('fastClearEmptyBill', (give, dontLoadBs) => {
      this.$log.info(`监听清空账单${give}--${dontLoadBs}`);
      this.clearBillAndRefresh(give, dontLoadBs);
    });
    // 数据不清空(牌号,优惠信息)刷新账单
    this.$von('fastLoadBillBus', (option) => {
      // 父组件 刷账单总接口
      this.$vemit('fastFoodLoadBs', {
        buffetPointId: this.getPointId(),
        option,
        // 是否为 非结算刷新账单
        isReLoadBill: true,
        // 并且 将刷新前 保存的牌号传回 刷账单接口,执行数据填回
        // orderCode: this.$parent.$parent.$refs.fastFoodBill.pageBaseData.orderCode,
        orderCode: this.orderCode,
      });
    });
    //  重新渲染分页按钮
    this.$von('InitPageBus', () => {
      this.initPage();
    });
    // 验证会员 执行会员价
    this.$von('doMemberPriceBus', (isCancelGive) => {
      // 开启'会员价' 开关(常开) 如果是取消赠送则不走执行会员价按钮选中逻辑
      if (!isCancelGive) {
        this.memberPriceToggle = true;
      }
      // 执行会员价方法
      this.doMemberPrice();
    });
    this.$von('cancelMemberPriceBus', (isCancelGive) => {
      // 关闭'会员价' 开关(常闭) 如果是取消赠送则不走取消会员价按钮选中逻辑
      if (!isCancelGive) {
        this.memberPriceToggle = false;
      }
      // 取消会员价方法
      this.cancelMemberPrice();
    });
    // 添加crm相关禁点按钮
    this.$von('crmSetDisablebtnBus', () => {
      this.crmSetDisablebtn();
    });
    // 恢复默认销售类型
    // this.$von("refreshSaleTypeBus", () => {
    //   this.refreshSaleType(1);
    // });
    // 打印
    this.$von('fastPanelPrint', (data) => {
      this.noAlertPrint(data);
    });
    // 处理外卖电话 禁用非电话外卖，打折，验证会员按钮
    this.$von('handleTakeoutPhone', ({ disable, handlingPhone, allBtn }) => {
      this.phoneSetDisableBtn(disable, allBtn);
      this.handlingPhone = handlingPhone;
    });
    // 来电记录页添加加单遮罩层
    this.$von('checkPhoneRecord', (isShow) => {
      this.$emit('maskLayer', isShow);
      this.$vemit('maskLayerBus', isShow);
    });
    // isDoFullGift 是否执行过满赠
    this.$von('handleRedemptionClose', (isDoFullGift = false) => {
      this.fastBtn(this.payBtnItem, false, isDoFullGift);
    });
  },
  watch: {
    posFastFood(data) {
      setTimeout(() => {
        this.initPage();
        // 后台设置了验证会员后执行销售方案会员价 前台置灰执行会员价和取消会员价按钮
        this.isForceMemberQueryDisable();
      }, 0);
    },
    // 监听下会员价的执行状态
    memberPriceToggle(newVal, oldVal) {
      this.setFastFoodMemberPlanFlg({
        data: {
          // 是否已执行会员价
          isDoMemberPrice: !!(newVal && this.posSettings.isHaveMemberPriceItem),
          isDoNcupPlan: false, // 是否已执行N杯打折
          nCupDiscountPlanId: null, // N杯打折的方案ID
        },
      });
    },
    noClickBtn: {
      handler(item) {
        item.forEach((val, num) => {
          this.posFastFood.btns.forEach((item, index) => {
            if (val.btnId == item.btnId) {
              item.isCanClick = true;
            }
          });
        });
        this.setPosFastfoodData(this.posFastFood);
        this.initPage();
      },
      deep: true,
    },
  },
  computed: {
    ...mapState('fastFood', [
      'saleActiveState', // 堂食外带切换状态: 0/1/2 -堂食/外带/外卖
      'orderCode', // 牌号
      'peopleQty', // 人数
      'isContainKDS', // 加单中是否包含KDS方案品项
      'buffetDeposit',
    ]),
    ...mapGetters('fastFood', [
      'saleTypeId',
      'buffetDeposit',
    ]),
    ...mapGetters([
      'getCustomFastFoodMenuBtn',
      'posDevice',
      'posFastFood',
      'posBaseInfo',
      'posInfo',
      'getFastFoodBillData',
      'getSelectDiscountPlanData',
      'getSelectVoucherData',
      'getSelectCrmData',
      'posSettings',
      'posCrm',
      'outDeviceSetting',
      'getFastFoodMemberPlanFlg',
      'config',
      'setting',
    ]),
    bsOrderCodeMode() {
      return this.posFastFood.bsOrderCodeMode;
    },
    pageSize() {
      return this.posSettings.isShortcutBarSingleLineDisplayForFastFoodMode ? 5 : 11;
    },
    drawerTop() {
      const len = this.discountPlanList.length;
      if (len > this.drawerPageSize) { // 翻页
        this.drawerPaginationBtnShow = true;
        return 44 * (this.drawerPageSize + 1);
      } else {
        this.drawerPaginationBtnShow = false;
        return 44 * len;
      }
    },
    discountPlanList() { // 添加清除项-鲜果
      let arr = cloneDeep(this.posFastFood.discountPlanList) || [];
      arr.unshift({ discountPlanId: '', discountPlanName: '不使用打折' });
      return arr;
    },
    isDrawerOpen() { // 接口获取-抽屉样式是否开启 (0:抽屉显示 1:弹框显示)
      return this.posFastFood.xianGuoFastSettleBarType === 0 ? true : false;
    },
  },
  methods: {
    ...mapMutations('fastFood', [
      'setOrderCode',
    ]),
    ...mapMutations({
      setSelectDiscountPlanData: 'SET_SELECT_DISCOUNTPLAN_DATA',
      setPosFastfoodData: 'SET_POS_FASTFOOD',
      setDomemberPriceState: 'SET_DOMEMBERPRCIE_STATE',
      setSettleBsCode: 'SET_SETTLE_BS_CODE',
    }),
    ...mapActions([
      'setSelectVoucherData',
      'setSelectCrmData',
      'setFastFoodMemberPlanFlg',
    ]),
    // 初始化结算按钮分组
    initPage() {
      this.$nextTick(() => {
        if (this.$refs.list) {
          this.pageNum = -1;
          this.pageCount = Math.ceil(
            this.posFastFood.btns.length / this.pageSize,
          );
          this.nextPage();
        }
      });
    },
    // 实时获取当前 前端页面的快餐账单的数据
    getFastFoodFrontBillDataOfNow() {
      // 考虑vuex数据分发的不及时行(因为程序太庞大了,用户设备太差了,数据量太大了)
      // 被逼无奈使用组件节点直接获取数据
      // console.log(this.$parent.$parent.$refs.fastFoodBill.paymentGetBillData());
      return this.$parent.$parent.$refs.fastFoodBill.paymentGetBillData();
    },
    isToggleRedem(isRedem, btnName) {
      let isHasRedeItem = false;
      // const paymentGetBillData = this.getFastFoodFrontBillDataOfNow();
      if (this.paymentGetBillData.items.length) {
        // 判断是否存在了按账单换购的品项
        isHasRedeItem = !this.paymentGetBillData.items.find(item => (item.exchangeId && item.exchangeMode === 0));
      }
      const btnData = this.getCustomFastFoodMenuBtn.find(btn => btn && btn.name === 'redemption');
      const btnDisabled = btnData ? !btnData.hasNoAuth : false;
      // 这块原作者一点注释没有，目前推测好像是样
      // isHasRedeItem 这个应该是没执行过换购但是满足条件，，，   isRedem始终为true  btnDisabled换购按钮不可点 getSelectDiscountPlanData是否存在打折方案
      if (isHasRedeItem && isRedem && btnDisabled && !this.getSelectDiscountPlanData) {
        this.$vemit('handleChangeRedemFn', { tag: true, paymentItems: this.paymentGetBillData.items });
        return true;
      }
      return false;
    },
    /**
     * isDoFullGift 这个Boolean 类型, true- 是已操作够换购
     */
    // 快餐结算按钮触发方法: 根据按钮名称 匹配方法执行
    fastBtn(item, isRedem = true, isDoFullGift = false) {
      if (!item) { return false; }
      // 如果按钮为禁点样式 阻止点击事件
      if (item.isCanClick) return false;
      // 抽屉 isDrawer 接口获取?? 开关打开且需要抽屉显示功能-执行显示隐藏设置
      if (this.isDrawerOpen && item.isOpen) item.isShow = !item.isShow;
      this.payTypeName = item.btnName;
      this.payBtnItem = item;
      if (this.posSettings.isOpenBuffetDeposit
        && this.buffetDeposit
      ) {
        // 自助餐模式不允许挂单
        if (item.btnName === 'designatesList' || item.btnName === 'designates') {
          this.$message.error(this.$t('Biz.Buffet.NoDesignates'));
          return false;
        }
        // 自助餐不允许快速会员卡结算
        if (item.btnName === 'crmFastSettle' || item.btnName === 'crmNoDialogFastSettle') {
          this.$message.error(this.$t('Biz.Buffet.forbidCRM'));
          return false;
        }
        // 自助餐不允许云闪付结算
        if (item.btnName === 'unionPayScancodeFastSettle') {
          this.$message.error(this.$t('Biz.Buffet.forbidUnionPay'));
          return false;
        }
        // 自助餐不允许线上礼品卡券结算
        if (item.btnName === 'cardGiftAndVoucher') {
          this.$message.error(this.$t('Biz.Buffet.forbidGiftVoucher'));
          return false;
        }
        // 自助餐不允许使用代金券
        if (item.btnName === 'voucher') {
          this.$message.error(this.$t('Biz.Buffet.forbidVoucher'));
          return false;
        }
      }
      this.payTypeName = item.btnName;
      this.payBtnItem = item;
      // 结算调用整理后的账单数据
      this.paymentGetBillData = this.getFastFoodFrontBillDataOfNow();
      // 账单合计金额
      const total = this.paymentGetBillData.lastTotal;
      // 结算提示负金额逻辑
      // 会员卡 现金等额 10 20 50 100 手工操作 代金券 更多结算 会员卡快速结算 其他类结算方式
      if (
        item.btnName == 'crmFastSettle'
        || item.btnName == 'cashFastSettle'
        || item.btnName == 'settlement'
        || item.btnName == 'crmNoDialogFastSettle'
        || item.btnName == 'voucher'
        || item.btnName == 'otherSettle'
      ) {
        if (Number(total) < 0) {
          this.$message.error(this.$t('Biz.Order.SubmitDishErrorMsg'));
          return false;
        }
        // 微信 支付宝 付款码 银联 为 0 为负都不能支付
      } else if (
        item.btnName == 'aliScancodeFastSettle'
        || item.btnName == 'wechatScancodeFastSettle'
        || item.btnName == 'paymentcode'
        || item.btnName == 'unionPayScancodeFastSettle'
      ) {
        if (Number(total) == 0) {
          this.$message.error(this.$t('Biz.Order.SubmitDishErrorMsg01'));
          return false;
        } if (Number(total) < 0) {
          this.$message.error(this.$t('Biz.Order.SubmitDishErrorMsg'));
          return false;
        }
      }
      if (this[item.btnName]) {
        // 如果是结算这个包含的功能按钮需要判断换购和满赠的条件
        if (settleBtnList.indexOf(item.btnName) !== -1) {
          // 这块(王宇)写的 这是换购的判断
          if (this.posSettings.isHaveFullExchange && this.isToggleRedem(isRedem, item.btnName)) {
            return false;
          }
          // 满赠的判断
          if (this.posSettings.isHaveFullGift && !isDoFullGift) {
            const btnData = this.getCustomFastFoodMenuBtn.find(btn => btn && btn.name === 'addFullGift');
            const isCanUse = btnData ? !btnData.hasNoAuth : false;
            // 查下账单
            const billItems = this.paymentGetBillData.items;
            if (isCanUse && !billItems.some(item => item.fullGiftId)) {
              // 查询换购接口
              this.$vemit('handleGoFullGift', billItems);
              return false;
            }
          }
        }
        this[item.btnName](item);
        // '执行会员价'或'取消会员价', 改变会员价状态参数
        if (item.btnName == 'doMemberPrice') {
          this.memberPriceToggle = true;
        } else if (item.btnName == 'cancelMemberPrice') {
          this.memberPriceToggle = false;
        }
      } else {
        // 没有相应处理逻辑，敬请期待此功能！
        this.$message.error(this.$t('Biz.Order.BtnErrorMsg'));
      }
    },
    nextPage() {
      // 设置页码
      if (this.pageNum < this.pageCount - 1) {
        this.pageNum += 1;
      } else {
        this.pageNum = 0;
      }
      // 分页计算
      this.list = this.posFastFood.btns.slice(
        this.pageNum * this.pageSize,
        this.pageNum * this.pageSize + this.pageSize,
      );
      if (this.isDrawerOpen) {
        this.list = cloneDeep(this.list);
        this.list.forEach((item) => {
          this.$set(item, 'isOpen', false); // 是否抽屉展示
          this.$set(item, 'isShow', false); // 控制抽屉的显示隐藏
          if (item.btnName === 'selectDiscount') item.isOpen = true; // 打折
        });
      }
      // 如果列表 当前分页元素 < 11, 补足
      if (this.list.length < this.pageSize) {
        const num = this.list.length;
        this.list.length = this.pageSize;
        this.list.fill(
          {
            name: '',
          },
          num,
          this.pageSize,
        );
      }
    },

    /* 结算前执行牌号业务逻辑
     * 结算方式流程: 点击结算业务按钮->启调结算(含其他)首先执行方法->调用牌号业务逻辑判断->执行相应结算业务流程
     */

    /** *******************************************************************************************************
     * 一 结算业务启调
     */
    // 挂单
    designates(callback, authCode = {}) {
      this.$log.info('前台调用挂单');
      this.$vonce('authCode', (code) => {
        this.designates(callback, code);
      });
      let items = [];
      this.$vemit('getBillList', (list) => {
        items = list;
      });
      ajax('canyin.pos.designates.dodesignates', {
        needToken: true,
        contentType: 'paramsEncoded',
        data: {
          point_id: this.getPointId(), // 客位Id
          bsId: this.getBsId(), // 营业流水
          controlMode: '3',
          items, // 已点菜品
          discountPlanId: this.getDiscountPlanId(), // 打折方案
          isLog: false,
          fastFoodMemberPriceFlg: this.getBsMemberPriceFlg(), // 快餐模式下是否启用会员价
          requestType: 0, // 请求类型 0 为前台营业
          ...authCode,
          saleTypeId: this.saleTypeId,
          peopleQty: this.peopleQty,
          tableCode: this.getFastFoodBillData.bsData.tableCode, // 桌号
        },
      }).then((data) => {
        if (this.config.printLeaveTableAfterDesignates && data && data.bizPrintLeaveTableParamsList) {
          this.printLeaveTable(data.bizPrintLeaveTableParamsList);
        }
        this.$message.success(this.$t('Biz.Order.SuccessfulListing'));
        // // 清除备注、品项、牌号、折扣、会员 ,初始下打折活动方案
        this.clearBillAndRefresh();
        // 回调函数进行异步控制 挂单和读取挂单顺序
        if (typeof callback === 'function') {
          callback();
        }
      });
    },
    // 读取挂单
    designatesList() {
      let items = [];
      this.$vemit('getBillList', (list) => {
        items = list;
      });
      ajax('canyin.pos.designatesreturnpoint.existsscbybsid', {
        contentType: 'paramsEncoded',
        data: {
          bsId: this.getBsId(), // 营业流水
        },
      }).then((data) => {
        // 暂时取消后台接口数据判断
        if (items.length > 0) {
          // 自动挂单提示
          this.autoDesignates();
        } else {
          // 显示挂单列表
          this.readDesignatesList();
        }
      });
    },
    // 读取挂单提示  当前账单会自动执行挂单，是否继续操作？
    autoDesignates() {
      this.$confirm(this.$t('Biz.Order.ListTipsText'), this.$t('Dict.Tips'), {
        confirmButtonText: this.$t('Dict.Sure'),
        cancelButtonText: this.$t('Dict.Cancel'),
        type: 'warning',
      })
        .then(() => {
          // 执行挂单
          this.designates(() => {
            // 挂单成功后读取挂单列表
            this.readDesignatesList();
          });
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('Dict.OperationCancelled'),
          });
        });
    },
    // 读取挂单列表
    readDesignatesList() {
      ajax('canyin.pos.designates.designatesview').then((data) => {
        if (!data.scList && !data.tsList) {
          // 无挂单信息
          this.$message.error(this.$t('Biz.Order.NoListMessage'));
          return;
        }
        this.$refs.designatesList.open(data, {
          submit: ({ designatesBsId, designatesPonitId }) => {
            ajax('canyin.pos.designatesreturnpoint.returnpointandsettle', {
              contentType: 'paramsEncoded',
              data: {
                bsId: designatesBsId,
                pointId: designatesPonitId,
                controlMode: '3',
              },
            }).then((res) => {
              if (res.success) {
                // 成功后更新下营业流水账单
                this.$vemit('fastFoodLoadBs', {
                  buffetPointId: designatesPonitId,
                }); // 读取账单列表
                this.$message.success(this.$t('Biz.Order.SuccessReadListMsg'));
              } else {
                this.$message.error(res.msg);
              }
              this.$refs.designatesList.close();
            });
          },
        });
      });
    },
    // 电话外卖落单
    takeoutPhone() {
      const paymentGetBillData = this.getFastFoodFrontBillDataOfNow();
      if (paymentGetBillData.items && paymentGetBillData.items.length <= 0) {
        this.$message.error(this.$t('Biz.Order.PleaseAddItem'));
        return;
      }
      // ajax("canyin.pos.takeoutphone.takeoutphoneview").then(data => {
      // 打开订单信息弹窗 处理提交逻辑
      this.$refs.takeoutPhone.open({ handlingPhone: this.handlingPhone }, {
        submit: (data) => {
          ajax('canyin.pos.settlement.newtakeoutsettle', {
            needToken: true,
            contentType: 'paramsEncoded',
            data: this.createTakeoutPhoneParams(data),
          }).then((data) => {
            // 清空账单信息
            this.clearBillAndRefresh();
            // 外卖落单成功
            this.$message.success(this.$t('Biz.Order.SuccessfulDelivery'));
            // 跳转到外卖路由
            this.$router.push('/pos/takeout/handling');
            // 改变处理中电话的状态
            this.$vemit('takeoutPhoneSuccess');
          });
        },
      });
      // });
    },
    // 构建电话外卖参数
    createTakeoutPhoneParams(data) {
      const paymentGetBillData = this.getFastFoodFrontBillDataOfNow();
      return {
        posId: this.getPosId(), // 当前posId
        bsId: this.getBsId(), // 营业流水
        point_id: this.getPointId(), // 客位Id
        orderCode: this.orderCode, // 牌号
        peopleQty: this.peopleQty, // 人数
        payMoney: paymentGetBillData.payMoney, // 账单合计金额
        takeMoney: paymentGetBillData.payMoney, // 账单合计金额
        lastTotal: paymentGetBillData.payMoney, // 账单合计金额
        ssRemark: paymentGetBillData.ssRemark,
        saleTypeId: paymentGetBillData.saleTypeId, // 销售类型
        discountPlanId: this.getDiscountPlanId(),
        items: paymentGetBillData.items, // 加单信息
        tableCode: paymentGetBillData.tableCode, // 桌号
        takeoutObject: {
          fromId: 19998,
          contactName: data.customerName,
          contactTel: data.phoneNumber,
          deAddress: data.deliveryAddress,
          firstDiner: data.customertype,
          sendType: data.deliveryType,
          deBeginTime: `${data.bookingDate}${data.bookingTime}`,
          remark: data.billRemark,
          empId: data.deliveryRider.mid,
          invoice: data.invoiceSwitch === true ? 1 : 0,
          invoiceTitle: data.invoiceTitle,
          callId: data.id,
        },
      };
    },
    // 估清
    itemSellout() {
      this.$emit('operation', 'itemsSellOut');
    },
    // 品项限量
    itemLimit() {
      this.$emit('operation', 'limitQuantity');
    },
    // 已结帐单
    closedAccount() {
      this.$emit('operation', 'billed');
    },
    // 售卡
    cardSelling() {
      this.$emit('operation', 'crm7SellCard');
    },
    // 充值
    cardCharge() {
      this.$emit('operation', 'crm7CardCharge');
    },
    // 报表查询
    businessReport() {
      this.$emit('operation', 'report');
    },
    // 开钱箱
    openCashBox() {
      this.$emit('operation', 'moneyBox');
    },
    // 结班
    posSerial() {
      this.$emit('otherOperation', 'offWork');
    },
    // 修改密码
    changePwd() {
      this.$emit('otherOperation', 'modifyPassword');
    },
    // 会员卡
    crmFastSettle() {
      this.fastSettle(2);
    },
    // 支付宝
    aliScancodeFastSettle() {
      this.fastSettle(3);
    },
    // 微信
    wechatScancodeFastSettle() {
      this.fastSettle(4);
    },
    // 微信+支付宝二码合一超级无敌付款码
    paymentcode() {
      this.fastSettle(10);
    },
    // 打包盒
    item(item) {
      this.$emit('packingBoxFn', item);
    },
    /* 现金类结算
     * 含: 现金10元, 现金20元, 现金50元, 现金100元, 现金等额, 手工操作
     */
    cashFastSettle(item) {
      const paywayId = item.btnId; // 支付方式来源 按钮btnId 非结算相关按钮均为正 结算相关按钮均为负
      const btnMoney = item.money; // 结算按钮使用的金额
      const btnName = item.name; // 结算按钮名称
      // 手工操作按钮
      if (paywayId == '-1') {
        this.fastSettle(1, null); // btnMoney为null
      } else if (paywayId == '-2') {
        // 现金等额
        this.fastSettle(5);
      } else if (
        paywayId == '-7'
        || paywayId == '-8'
        || paywayId == '-9'
        || paywayId == '-10'
      ) {
        // 10 20 50 100结算方式(属于手工操作类结算方式)
        this.fastSettle(1, btnMoney); // btnMoney为 10 20 50 100
      } else {
        this.newPaywayId = paywayId; // 新建结算方式Id
        this.newPaywayName = btnName; // 新建结算方式名称
        // 后台新建人民币现金结算方式同现金等额逻辑
        this.fastSettle(12);
      }
    },
    // 其他类的结算方式(同现金等额逻辑,唯一区别就是不开钱箱)
    otherSettle(item) {
      this.otherPaywayId = item.btnId; // 其他类结算方式Id
      this.otherPaywayTypeId = item.btnTypeId; // 其他类结算方式类型Id
      this.otherPaywayName = item.name; // 其他类结算方式名称
      this.otherPayWayTypeFlg = 4; // 其他类结算方式标识
      this.fastSettle(11);
    },
    // 银联(云闪付)
    unionPayScancodeFastSettle() {
      this.fastSettle(6);
    },
    // 执行会员价
    doMemberPrice() {
      // 判断Vux中设置参数, 允许执行会员价
      if (!this.posSettings.isHaveMemberPriceItem) {
        // 销售方案未设置品项会员价, 请先设置相应品项
        this.$message.warning(this.$t('Biz.Order.DoMemberPriceWarnMsg'));
        return false;
      }
      // memberPriceFlg为false时, 执行手动改会员价
      // eslint-disable-next-line no-unused-expressions
      this.$parent.$parent.guestList
        && this.$parent.$parent.guestList.forEach((item) => {
          // 如果是执行了会员价 给常规套餐数据添加一个标识 raisePriceType=2
          if (item.isPackage && +item.pkgType === 0) {
            this.$set(item, 'raisePriceType', 2);
          }
          // 价格优先级如果是促销价就不会走会员价格,促销价比会员价价格优先级大还有赠送的品项特殊,如果赠送了什么都不走
          // 优先级为促/会/时价/销售价格(区域价格,变价)
          if (!(+item.discFlg === 4
               || +item.discFlg === 3
               || +item.discFlg === 1
               || +item.priceType === 3
               || +item.priceType === 4
               || +item.discFlg === 2)
          ) {
            // item(品项)的会员价存在且不为非法格式时(允许会员价为0), 会员价赋值
            if (
              (item.memberPrice && +item.memberPrice)
              || item.memberPrice === 0
            ) {
              // temConstantSet 进入文件, 价格体系数据字典
              // 折扣优惠标识
              // eslint-disable-next-line no-param-reassign
              item.discFlg = itemConstantSet.DISC_FLG_MEMBER;
              // 价格类型: 1-销售价格,2-会员价格,3-促销价格,4-变价价格
              // eslint-disable-next-line no-param-reassign
              item.priceType = itemConstantSet.PRICE_TYPE_MEMBER;
              // eslint-disable-next-line no-param-reassign
              item.oldPriceType = itemConstantSet.PRICE_TYPE_MEMBER;
              // 价格, 使用会员价数据
              // eslint-disable-next-line no-param-reassign
              item.price = +item.memberPrice;
              item.defaultPriceType = itemConstantSet.PRICE_TYPE_MEMBER;
            }
          }
        });
      // 设置 账单列表相应品项(设置会员价的品项) 执行会员价, 启用会员价标识为true
      // this.setBsMemberPriceFlg(true);
      // this.doMemberReRenderAddedList(true, true);
      return true;
    },
    // 取消会员价: 还原 原始价格和类型数据, 暂不实现上次操作(或变价, 或赠送, 或折扣)
    cancelMemberPrice() {
      // eslint-disable-next-line no-unused-expressions
      this.$parent.$parent.guestList
        && this.$parent.$parent.guestList.forEach((item) => {
          // 如果是执行了取消会员价 给常规套餐数据添加一个标识 raisePriceType=1
          if (item.isPackage && +item.pkgType === 0) {
            this.$set(item, 'raisePriceType', 1);
          }
          if (
            (item.memberPrice || item.memberPrice === 0)
            && +item.price !== +item.oldPrice
            && item.discFlg !== 3
            && item.discFlg !== 1
            && item.discFlg !== 4
            && item.priceType !== 3
            && item.priceType !== 4
          ) {
            // temConstantSet 进入文件, 价格体系数据字典
            // 恢复原折扣优惠标识
            // eslint-disable-next-line no-param-reassign
            item.discFlg = itemConstantSet.DISC_FLG_BUSINESS;
            // 恢复原价
            // eslint-disable-next-line no-param-reassign
            item.price = +item.salePrice;
            // 恢复原价格类型
            // item.priceType = +item.oldPriceType;
            // eslint-disable-next-line no-param-reassign
            item.priceType = 0;
            item.defaultPriceType = 0;
          }
        });
    },
    // 线上礼品卡券
    cardGiftAndVoucher() {
      this.fastSettle(13);
    },
    // 线上礼品卡券快速结算逻辑
    cardGiftAndVoucherTask() {
      const paymentGetBillData = this.getFastFoodFrontBillDataOfNow();
      const pointId = this.getPointId(); // 客位Id
      const bsId = this.getBsId(); // 营业流水
      // this.getPosId(), // 当前posId
      const params = {
        point_id: this.getPointId(), // 客位Id
        bsId: this.getBsId(), // 营业流水
        controlMode: paymentGetBillData.controlMode,
        isLog: false, // 小卖模式下不记录日志
        orderCode: this.orderCode,
        peopleQty: this.peopleQty,
        saleTypeId: this.saleTypeId,
        isCrmMixSettle: this.isHaveCrm() ? '1' : '0', // 有会员卡支付信息 为'1'
        fastFoodMemberPriceFlg: this.getBsMemberPriceFlg(), // 快餐模式下是否启用会员价
        orderCodeMode: this.getOrderCodeModeVal(),
        ssRemark: paymentGetBillData.ssRemark,
        tableCode: paymentGetBillData.tableCode, // 桌号
      };
      // 如果有加单信息不允许打开线上礼品卡券
      if (paymentGetBillData.items.length > 0) {
        this.$confirm(this.$t('Biz.Order.DoPayWarnMsg'), this.$t('Dict.Tips'), {
          confirmButtonText: this.$t('Dict.Sure'),
          type: 'warning',
          showClose: false,
          showCancelButton: false,
        }).then(() => false);
      } else {
        this.$refs.fastCardGiftAndVoucher.open({
          pointId,
          bsId,
          params,
        });
      }
    },
    // 验证会员
    memberQuery() {
      this.crmcardShow();
    },
    // 会员验证的弹框显示
    crmcardShow(crmcradinfodata) {
      // 弹开会员卡验证框
      this.$refs.fastFoodVerifiedMember.open({
        pointId: this.getFastFoodBillData.bsData.pointId,
      });
    },
    // 会员卡快速结算
    crmNoDialogFastSettle() {
      this.fastSettle(9);
    },
    // Crm刷卡快速结算
    crmSwipeFastSettle() {
      // 获取会员卡读卡需要用到的参数
      const { readCardOpt } = this.posDevice;
      if (readCardOpt != '') {
        this.$devices.Cardop.read((card) => {
          if (card.returnCode == 0) {
            this.crmFastSettleTask(card.CardNo, this.posDevice.readCardOpt.mode);
          } else {
            // 提示： 读卡失败,请检查会员卡是否放置正常,读卡设备是否连通,若均正常请联系服务商!
            this.$message.error(this.$t('Biz.Order.CrmSwipeErrorMsg'));
          }
        });
      }
    },
    // Crm刷卡快速结算逻辑
    crmFastSettleTask(CardNo, cardMode, authData = {}) {
      this.$vonce('authCode', (authData) => {
        this.crmFastSettleTask(CardNo, cardMode, authData);
      });
      this.doSubmitAddOrderForFastSettle(authData)
        .then(() => {
          this.doCrmFastSettle(CardNo, cardMode);
        })
        .catch((msg) => {
          this.$message.error(msg);
        });
    },
    // Crm刷卡快速结算逻辑
    doCrmFastSettle(cardNo, cardMode) {
      // 结算调用整理后的账单数据
      const paymentGetBillData = this.getFastFoodFrontBillDataOfNow();
      const bizTsPwCrm = {
        crmTsCode: 0,
        cardNo,
        password: '',
        peruseMoney: '',
        consumeScore: 0,
        consumeScoreMoney: 0,
        consumeMoney: 0,
        consumeTicketMoney: 0,
        voucherConverMoney: 0,
        couponType: -1,
        couponCodes: [],
        consumeAllMoney: 0,
        cardKindTypeId: 0,
        crmFlg: 1,
        memberId: -1,
        useTicketList: '[]',
        isMobileIn: 0,
        verifyingCode: 0,
      };
      // 获取券支付信息
      let ticketPayInfo = this.getTicketPayInfo();
      // VueX里代金券存的默认值为 null,但此处如果代金券没有数据应该给后台传{}
      if (ticketPayInfo == null) {
        ticketPayInfo = {};
      }
      this.getToken((tokenId) => {
        const params = {
          posId: this.getPosId(),
          point_id: this.getPointId(),
          bsId: this.getBsId(),
          controlMode: '3',
          isLog: false,
          orderCode: this.orderCode,
          saleTypeId: this.saleTypeId, // 当前销售类型
          bizTsPwCrmParams: JSON.stringify(bizTsPwCrm),
          crmFastSettleFlg: 1,
          cardNo,
          ticketSettleData: JSON.stringify(ticketPayInfo),
          token_id: tokenId,
        };

        ajax('canyin.pos.settlement.fastsettle', {
          contentType: 'paramsEncoded',
          data: params,
        }).then((res) => {
          if (res.result == '1') {
            this.noAlertPrint(res.data);
            // 刷新账单
            setTimeout(() => {
              this.clearBillAndRefresh();
            }, 0);
            const {
              amountPayable: amount,
              finalPrice: final,
              discPrice: disc,
            } = res.data.crmSttleReturnMap;
            /**
             * 结算成功：
             * 应付金额：
             * 实收金额：
             * 优惠金额：
             */
            const msg = this.$t('Biz.Settlement.FastSettleMessage', {
              amount,
              final,
              disc,
            });
            this.$message.success(msg);
          } else if (res.result == '-1') {
            this.$message.error(res.msg);
          }
        });
      });
    },
    // 更多结算
    settlement() {
      const isCrm = this.isHaveCrm();
      // 如果使用会员卡
      if (isCrm) {
        return false;
      }
      const pointId = this.getPointId();
      if (!pointId) {
        // 提示 请选中客位信息再进行结算
        this.$message.error(this.$t('Biz.Order.DoPayErrorMsg'));
        return false;
      }
      this.fastSettle(8);
    },
    // 更多结算逻辑
    moreSettlement(authData = {}) {
      this.$vonce('authCode', (code) => {
        this.moreSettlement(code);
      });
      // 快餐打开更多结算需要先执行加单操作(不需要打印)
      this.doSubmitAddOrderForFastSettle(authData).then(() => {
        const pointId = this.getPointId();
        this.getDiscPlanAndPayWay(pointId).then((result) => {
          ajax('canyin.pos.settlement.settlecheck', {
            params: { pointId },
          }).then((data) => {
            const paymentGetBillData = this.getFastFoodFrontBillDataOfNow();
            const { lockState } = data;
            this.$refs.fastPay.open({
              pointId,
              lockState,
              paymentGetBillData,
              discPlanAndPayWayData: result,
            });
          });
        });
      })
        .catch((msg) => {
          this.$message.error(msg);
        });
    },
    getDiscPlanAndPayWay(id) {
      return new Promise((resolve) => {
        ajax('canyin.pos.settlement.settle.getdiscplanandpayway', {
          params: {
            pointId: id,
            controlMode: '3',
          },
        }).then((data) => {
          resolve(data);
        });
      });
    },
    // 代金券
    voucher() {
      this.fastSettle(7);
    },
    // 代金券结算业务流程
    voucherOperation() {
      // 账单数据
      const paymentGetBillData = this.getFastFoodFrontBillDataOfNow();
      // 代开代金券列表弹窗, 并传入回调: 执行打开代金券结算弹窗,并传入所选列表item
      this.$refs.voucherList.open(
        {
          // 代金券结算信息
          vouchers: this.posFastFood.vouchers,
          // 账单数据
          billData: {
            items: this.$parent.$parent.$refs.fastFoodBill.$refs.billList.submitDish(),
            orderCodeMode: this.getOrderCodeModeVal(),
            orderCode: this.orderCode,
            peopleQty: this.peopleQty,
            payMoney: paymentGetBillData.payMoney,
            takeMoney: paymentGetBillData.payMoney,
            stayPayMoney: this.$parent.$parent.$refs.fastFoodBill.paymentData
              .stayPayMoney,
            saleTypeId: this.saleTypeId,
            tableCode: paymentGetBillData.tableCode, // 桌号
            discountPlanId: this.getDiscountPlanId(),
            buffetPointId: this.posFastFood.buffetPointId,
          },
        },
        {
          submit: (item) => {
            this.$refs.voucherModal.open({
              data: item,
              addVoucher: (voucherList) => {
                this.setSelectVoucherData({ list: voucherList });
                // 禁点除代金券和CRM快速结算以外的其他按钮
                this.noClickBtn = this.posFastFood.btns.filter((item) => {
                  // 排除 代金券 和 CRM快速结算按钮
                  if (item.btnId == '-19' || item.btnId == '-17') {
                    return false;
                  }
                  return true;
                });
              },
            });
          },
        },
      );
    },
    handleClose(e, item) {
      // console.log('click-close',e,item)
      this.list[item.index].isShow = false;
    },
    selectPlanBtn(selectPlanItem, item) { // ??
      if (!selectPlanItem.discountPlanId) selectPlanItem = null;
      this.setSelectDiscountPlanData(selectPlanItem); // 用vuex 缓存打折当前执行的打折信息
      item.isShow = false;
    },
    // 打折
    selectDiscount(item) {
      if (!this.isDrawerOpen) { // 抽屉 isDrawer 接口获取??
        // 非抽屉样式-原有逻辑--打折活动方案的弹框 方案的列表this.posFastFood.discountPlanList submit
        this.$refs.activityScheme.open(this.posFastFood.discountPlanList, {
          submit: (planList) => {
            this.setSelectDiscountPlanData(planList); // 用vuex 缓存打折当前执行的打折信息
          },
        });
      }
    },
    // 退押金
    cancelDeposit() {
      // 192.168.4.84:88/zentao/bug-view-100912.html
      this.$refs.cancelDeposit.open({
        pointId: this.getPointId(),
      });
    },

    /** *******************************************************************************************************
     * 二 结算业务判断和牌号逻辑
     */
    /* 快速结算方法: 后续执行牌号判断和结算流程
     * 参数: paywayType-支付方式来源, paywayId-支付方式按钮id, btnMoney-结算按钮使用的金额, btnName-结算按钮名称
     */
    fastSettle(paywayType, btnMoney) {
      // 客显
      this.$devices.CDI.pay(btnMoney);
      const { bsOrderCodeMode } = this;
      if (bsOrderCodeMode == '1') {
        // 自动
        this.autoOrderCodeTask(paywayType, btnMoney);
      } else if (bsOrderCodeMode == '2') {
        // 手动
        this.handOrderCodeTask(paywayType, btnMoney);
      } else if (bsOrderCodeMode == '3') {
        // 自动+手动
        this.atuoAndHandOrderCodeTask(paywayType, btnMoney);
      } else {
        // 如果是开启结算后自动生成牌号
        this.fastSettleTypeKind(paywayType, btnMoney); // 直接结算
      }
    },
    // 自动牌号逻辑
    autoOrderCodeTask(paywayType, btnMoney) {
      this.fastSettleTypeKind(paywayType, btnMoney);
    },
    // 手动牌号逻辑
    handOrderCodeTask(paywayType, btnMoney) {
      if (this.posBaseInfo.isGenerMarkToKDS) { // 开启kds
        if (this.isContainKDS && !this.paymentGetBillData.orderCode) { // 加单品项中包含kds方案并且无号牌，需要号牌-弹框
          this.$vemit('payOpenChangeOrderCodeBus', { paywayType, btnMoney });
        } else {
          this.fastSettleTypeKind(paywayType, btnMoney); // 直接结算
        }
      } else { // 未开启kds原有逻辑
        if (!this.paymentGetBillData.orderCode) { // 如果牌号不存在
          // 弹出输入牌号的模态框, 并传去结算方式数据, 等待牌号弹窗'确认'后, 在调用this.fastSettleTypeKind方法
          this.$vemit('payOpenChangeOrderCodeBus', { paywayType, btnMoney });
          return;
        }
        this.fastSettleTypeKind(paywayType, btnMoney); // 直接结算
      }
    },
    // 自动手动牌号逻辑
    atuoAndHandOrderCodeTask(paywayType, btnMoney) {
      // 1堂食,2外带,3外卖
      const saleType = this.saleTypeId; // 当前销售类型
      if (saleType == '1') {
        // 手动
        this.handOrderCodeTask(paywayType, btnMoney);
      } else if (saleType == '2' || saleType == '3') {
        // 自动
        this.autoOrderCodeTask(paywayType, btnMoney);
      }
    },
    /* 结算-支付业务流程启调
     * 说明: 完成牌号业务判断, 根据paywayType, 执行相应结算业务;
     * 扩展: 添加结算方式后, 需要本方法写入实际结算支付业务的方法, 以供启调
     */
    // 现金 CRM 微信支付宝支付方式
    fastSettleTypeKind(paywayType, btnMoney) {
      if (paywayType == 1) {
        this.doFastSettleHand(btnMoney);
      } else if (paywayType == 2) {
        this.doCrmFastSettleBtnEvent();
      } else if (
        paywayType == 3
        || paywayType == 4
        || paywayType == 6
        || paywayType == 10
      ) {
        this.doScanCodeFastSettleBtnEvent(paywayType);
      } else if (paywayType == 5) {
        // 现金等额
        this.doFastSettleCashEqual();
      } else if (paywayType == 7) {
        // 代金券
        this.voucherOperation();
      } else if (paywayType == 8) {
        // 更多结算
        this.moreSettlement();
      } else if (paywayType == 9) {
        // Crm刷卡快速结算
        this.crmSwipeFastSettle();
      } else if (paywayType == 11) {
        // 其他类的结算方式结算(和现金等额的逻辑区别就是不开钱箱)
        this.otherCashSettleTask();
      } else if (paywayType == 12) {
        // 后台新建人民币现金结算方式同现金等额逻辑
        this.doFastSettleCashEqual(12);
      } else if (paywayType == 13) {
        // 线上礼品卡券快速结算逻辑
        this.cardGiftAndVoucherTask();
      }
    },

    /** *******************************************************************************************************
     * 三 结算业务,支付流程
     */

    // 快速结算方法(现金等额)
    doFastSettleCashEqual(paywayType, authData = {}) {
      // 奇怪了,快餐快速结算根本就不验证业务权限, 为什么要调用授权框??
      this.$vonce('authCode', (code) => {
        this.doFastSettleCashEqual(paywayType, code);
      });
      // 结算调用整理后的账单数据
      const paymentGetBillData = this.getFastFoodFrontBillDataOfNow();
      // 异步打印
      let printData;
      // paywayType值是前端区分各个结算业务逻辑用的，12代表，新建一个现金类的快餐结算结算方式，逻辑处理同现金等额。
      if (paywayType == 12) {
        printData = this.asyncPrintDataPrepare(
          this.newPaywayName,
          this.newPaywayId,
        );
      } else {
        printData = this.asyncPrintDataPrepare();
      }
      // // 显示找零客显
      // TDevices.cusDisplay.change(0)
      // 清空客显
      // setTimeout(function() {TDevices.cusDisplay.clear(); }, 2000);
      // 快餐模式支付是否还有会员卡支付信息
      const isCrm = this.isHaveCrm();
      let realId = '';
      // 是否开启了国际化增值
      if (this.setting.isInternational) {
        realId = this.newPaywayId || this.setting.baseCurrency.paywayId;
      } else {
        realId = this.newPaywayId || '1';
      }
      const params = {
        posId: this.getPosId(), // 当前posId
        point_id: this.getPointId(), // 客位Id
        bsId: this.getBsId(), // 营业流水
        controlMode: '3', // 模式
        isLog: false, // 是否记录log 快餐模式下不记录日志
        items: paymentGetBillData.items, // 加单信息
        orderCode: this.orderCode, // 牌号
        peopleQty: this.peopleQty, // 人数
        payMoney: paymentGetBillData.payMoney, // 账单合计金额
        takeMoney: paymentGetBillData.payMoney, // 账单合计金额
        lastTotal: paymentGetBillData.payMoney, // 账单合计金额
        giveMoney: '0',
        giveChange: '0',
        discountPlanId: this.getDiscountPlanId(), // 执行第N杯打折方案 打折Id
        saleTypeId: this.saleTypeId, // 当前销售类型
        isCrmMixSettle: isCrm ? '1' : '0', // 有会员卡支付信息 为'1'
        printData: JSON.stringify(printData), // 打印所需数据
        ssRemark: paymentGetBillData.ssRemark, // 备注内容
        orderCodeMode: this.getOrderCodeModeVal(), // 获取当前牌号模式(非后台设置牌号)
        tableCode: paymentGetBillData.tableCode, // 桌号
        orderSource: 1,
        fastFoodMemberPriceFlg: this.getBsMemberPriceFlg(), // 快餐模式下是否启用会员价
        paywayId: realId, // 结算方式id
        isCheckItemMustAdd: this.isCheckItemMustAdd,
        ...authData,
      };
      console.log('结算前', params);
      let url = 'canyin.pos.settlement.cashfastsettle';
      // 如果使用会员卡
      if (isCrm) {
        url = 'canyin.pos.settlement.fastsettle';
      }
      // 自助餐业务快速结算时参数整理
      if (this.posSettings.isOpenBuffetDeposit
        && this.buffetDeposit
      ) {
        params.eaters = this.getFastFoodBillData.bsData.eaters; // 客人类型/数量/价格数据列表
        params.buffetDeposit = this.buffetDeposit; // 押金金额
      }
      ajax(url, {
        contentType: 'paramsEncoded',
        data: params,
      }).then((res) => {
        const d = res.data;
        if (res.result == 0) {
          if (res.errCode === 7101) {
            this.$confirm(res.msg, this.$t('Dict.Tips'), {
              closeOnClickModal: false,
              closeOnPressEscape: false,
              type: 'warning',
            }).then(() => {
              this.isCheckItemMustAdd = 1;
              this.doFastSettleCashEqual(paywayType);
            })
          }
        } else if (res.result == '1') {
          // 是否启用钱箱
          if (this.outDeviceSetting.isAccounAutoOpenCashbox === true) {
            this.$devices.Cashbox.open();
          }
          if (d != null && d.bizPrintLeaveTableParamsList) {
            this.printLeaveTable(d.bizPrintLeaveTableParamsList);
          }
          // 打印
          // http://192.168.4.84:88/zentao/bug-view-74106.html
          // 现金等额快速结算不通过前台打印结账单和加单标签，打印注释掉
          // 192.168.4.84:88/zentao/bug-view-100094.html
          // 如果有会员卡混付则还是前端打
          if (isCrm && d) {
            this.printAddBill(d.bsId);
            if (d.settlePrintData.printType === 'PRINT_PARALLEL' && d.settlePrintData.printD) {
              this.$devices.Printer.print(d.settlePrintData.printD);
            }
          }
          // 易盘数据计算进行初始
          // BillBsModule.endpayEasyData();
          // 当前客位Id
          const pointId = this.getPointId();
          localStorage.setItem(`${pointId}Remark`, '');
          localStorage.setItem(`${pointId}buttonRemarks`, null);
          this.$message.success(this.$t('Dict.SuccessfulSettlement'));
          // 结算成功后清空payWayId
          this.newPaywayId = '';
          this.isCheckItemMustAdd = 0;
          // 延后 执行刷新账单, 并传入找零金额 现金等额 写死 0
          setTimeout(() => {
            this.clearBillAndRefresh(0);
          }, 0);
        } else if (res.result == '-1') {
          this.$message.error(res.msg);
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    // 快速结算方法(手工操作)10 20 50 100均属于手工操作类结算方式
    doFastSettleHand(btnMoney, authData = {}) {
      this.$vonce('authCode', (code) => {
        this.doFastSettleHand(btnMoney, code);
      });
      // 如果有会员卡支付部分的金额的时候不要走先加单在进行结算，避免了会员卡关联打折优惠的时候造成的价格不对
      const isCrm = this.isHaveCrm();
      // 如果没有使用会员卡
      if (!isCrm) {
        if (btnMoney) {
          // 10 20 50 100元
          this.cashFastFunction(btnMoney);
        } else {
          // 手工操作
          this.doSubmitAddOrderForFastSettle(authData)
            .then(() => {
              this.cashFastFunction(btnMoney);
            })
            .catch((msg) => {
              this.$message.error(msg);
            });
        }
      } else {
        // 此时btnMoney值为null或10  20 50 100
        this.cashFastFunction(btnMoney);
      }
    },
    // 现金结算(手工操作 10 20 50 100 )需要调的函数
    cashFastFunction(btnMoney) {
      if (btnMoney) { // 10 20 50 100
        // 结算调用整理后的账单数据
        const paymentGetBillData = this.getFastFoodFrontBillDataOfNow();
        const total = this.wipeZero(paymentGetBillData.lastTotal);
        // 会员卡支付金额
        const isCrm = this.isHaveCrm();
        // 使用会员卡消费金额
        let crmtotal;
        if (isCrm) {
          crmtotal = this.getCrmData().price;
        } else {
          crmtotal = 0;
        }
        // 自助餐业务
        if (this.posSettings.isOpenBuffetDeposit
          && this.buffetDeposit
        ) {
          console.log(sub((total + this.buffetDeposit) * 1000, crmtotal * 1000) / 1000, '押金~~');
          if (btnMoney
            < sub((total + this.buffetDeposit) * 1000, crmtotal * 1000) / 1000
          ) {
            // 提示 支付金额不足，请输入足够的支付金额后再结算
            this.$message.error(this.$t('Biz.Order.DoPayErrorMsg01'));
          } else {
            const pay = MathUtil.round(Number(btnMoney) + Number(crmtotal)); // 收款金额
            const give = MathUtil.round(
              Number(btnMoney) - total + Number(crmtotal),
            ); // 找零
            this.computedGive = give; // 赋值到全局的找零变量
            this.cashSettle(btnMoney, pay, give);
          }
        }
        // 非自助餐
        if (!this.posSettings.isOpenBuffetDeposit
          || Number(this.buffetDeposit) === 0
        ) {
          if (btnMoney < (total * 1000 - crmtotal * 1000) / 1000) {
            // 提示 支付金额不足，请输入足够的支付金额后再结算
            this.$message.error(this.$t('Biz.Order.DoPayErrorMsg01'));
          } else {
            const pay = MathUtil.round(Number(btnMoney) + Number(crmtotal)); // 收款金额
            const give = MathUtil.round(
              Number(btnMoney) - total + Number(crmtotal),
            ); // 找零
            this.computedGive = give; // 赋值到全局的找零变量
            this.cashSettle(btnMoney, pay, give);
          }
        }
      } else { // 手工操作
        // 会员数据添加
        // const pointId = this.getPointId(); //未使用注释
        const paymentGetBillData = this.getFastFoodFrontBillDataOfNow();
        // 账单实收:lastTotal,待支付金额:stayPayMoney
        const { lastTotal, stayPayMoney } = paymentGetBillData;
        const paidMoney = this.getSelectCrmData ? this.getSelectCrmData.price : 0; // 如果是混合支付的时候,要把已支付的Money信息传过去
        // 如果待支付金额小于合计手工操作待支付金额为实际待支付金额(防止意外加此判断逻辑)
        if (Number(lastTotal) > Number(stayPayMoney)) { // 手工结算和会员卡混付
          // 第一个参数stayPayMoney手工结算页面待支付金额,第二个参数paidMoney已支付金额,第三个参数账单实收lastTotal
          this.$refs.handDoSettle.open([stayPayMoney, paidMoney, lastTotal]);
        } else { // 手工结算单一支付
          this.$refs.handDoSettle.open([lastTotal, paidMoney, lastTotal]);
        }
      }
    },
    // 现金结算逻辑(手工结算,10 20 50  100)
    cashSettle(btnMoney, pay, give, authData = {}) {
      this.$vonce('authCode', (code) => {
        this.cashSettle(btnMoney, pay, give, code);
      });
      // 结算调用整理后的账单数据
      this.paymentGetBillData = this.getFastFoodFrontBillDataOfNow();
      const { paymentGetBillData } = this;
      // 异步打印数据
      const printData = this.asyncPrintDataPrepare();
      let url = 'canyin.pos.settlement.cashfastsettle';
      // 快餐模式支付是否还有会员卡支付信息
      const isCrm = this.isHaveCrm();
      // 如果没有使用会员卡且 为 10 20 50 100支付按钮
      if (isCrm) {
        url = 'canyin.pos.settlement.fastsettle';
      }
      const params = {
        posId: this.getPosId(), // 当前posId
        point_id: this.getPointId(), // 当前客位Id
        bsId: this.getBsId(), // 当前营业流水
        controlMode: paymentGetBillData.controlMode,
        items: paymentGetBillData.items, // 加单数据
        orderCode: this.orderCode,
        tableCode: paymentGetBillData.tableCode, // 桌号
        peopleQty: this.peopleQty,
        saleTypeId: this.saleTypeId, // 当前销售类型
        payMoney: pay, // 收款金额
        takeMoney: pay, // 收款金额
        lastTotal: paymentGetBillData.lastTotal, // 实收
        giveMoney: MathUtil.round(give), // 找零金额
        giveChange: MathUtil.round(give),
        discountPlanId: this.getDiscountPlanId(), // 执行打折方案 第N杯打折
        isCrmMixSettle: isCrm ? '1' : '0', // 快餐模式支付是否还有会员卡支付信息 使用会员卡为1
        printData: JSON.stringify(printData), // 打印数据
        orderCodeMode: this.getOrderCodeModeVal(), // 获取当前牌号模式(非后台设置牌号)
        ssRemark: paymentGetBillData.ssRemark, // 备注内容
        orderSource: 1,
        isCheckItemMustAdd: this.isCheckItemMustAdd,
        ...authData,
      };
      // 自助餐业务快速结算时参数整理
      if (this.posSettings.isOpenBuffetDeposit
        && this.buffetDeposit
      ) {
        params.eaters = this.getFastFoodBillData.bsData.eaters; // 客人类型/数量/价格数据列表
        params.buffetDeposit = this.buffetDeposit; // 押金金额
      }
      this.$log.info(`手工结算请求参数:params:[${JSON.stringify(params)}]`);
      ajax(url, {
        contentType: 'paramsEncoded',
        data: params,
      }).then((res) => {
        const d = res.data;
        if (res.result == 0) {
          if (res.errCode === 7101) {
            this.$confirm(res.msg, this.$t('Dict.Tips'), {
              closeOnClickModal: false,
              closeOnPressEscape: false,
              type: 'warning',
            }).then(() => {
              this.isCheckItemMustAdd = 1;
               this.cashSettle(btnMoney, pay, give);
            })
          }
        } else if (res.result == '1') {
          // 是否启用钱箱
          if (this.outDeviceSetting.isAccounAutoOpenCashbox === true) {
            this.$devices.Cashbox.open();
          }
          // 打印
          // http://192.168.4.84:88/zentao/bug-view-74106.html
          // 现金类快速结算不通过前台打印结账单和加单标签，打印注释掉
          // this.noAlertPrint(d);
          // http://192.168.4.84:88/zentao/bug-view-86175.html
          // 现金类快速结算需要通过前台打印留台单，单独执行下留台单打印
          if (d && d.bizPrintLeaveTableParamsList) {
            this.printLeaveTable(d.bizPrintLeaveTableParamsList);
          }
          if (isCrm && d) {
            this.printAddBill(d.bsId);
            if (d.settlePrintData.printType === 'PRINT_PARALLEL' && d.settlePrintData.printD) {
              this.$devices.Printer.print(d.settlePrintData.printD);
            }
          }
          const pointId = this.getPointId();
          localStorage.setItem(`${pointId}Remark`, '');
          localStorage.setItem(`${pointId}buttonRemarks`, null);
          this.$message.success(this.$t('Dict.SuccessfulSettlement'));
          this.isCheckItemMustAdd = 0;
          // //易盘数据计算进行初始
          // BillBsModule.endpayEasyData();
          // 快餐清空刷新账单, 并传入找零金额
          setTimeout(() => {
            this.clearBillAndRefresh(this.computedGive);
          }, 0);
        } else if (res.result == '-1') {
          this.$message.error(res.msg);
        } else if (res.result == '-2') {
          this.$message.error(res.msg);
        }
      });
    },
    // 执行加单业务
    doSubmitAddOrderForFastSettle(authData = {}) {
      return new Promise((resolve, reject) => {
        // 结算调用整理后的账单数据
        const paymentGetBillData = this.getFastFoodFrontBillDataOfNow();
        this.getToken((tokenId) => {
          const params = {
            bsId: this.getBsId(),
            posId: this.getPosId(), // 当前posId
            orderSource: 1,
            point_id: this.getPointId(), // 客位Id
            controlMode: paymentGetBillData.controlMode,
            isLog: false,
            items: paymentGetBillData.items,
            discountPlanId: this.getDiscountPlanId(),
            peopleQty: paymentGetBillData.peopleQty,
            fastType: 1, // 快速操作模式
            requestType: 0, // 加单请求类型-前台营业
            fastFoodMemberPriceFlg: this.getBsMemberPriceFlg(), // 快餐模式下是否启用会员价
            isCrmMixSettle: this.isHaveCrm() ? '1' : '0', // 有会员卡支付信息 为'1'
            ssRemark: paymentGetBillData.ssRemark,
            orderCodeMode: this.getOrderCodeModeVal(), // 获取当前牌号模式(非后台设置牌号)
            tableCode: paymentGetBillData.tableCode, // 桌号
            token_id: tokenId,
            saleTypeId: this.saleTypeId, // 当前销售类型
            isCheckItemMustAdd: this.isCheckItemMustAdd,
            ...authData,
          };
          if (this.posSettings.isOpenBuffetDeposit) { // 开启自助餐
            params.eaters = this.getFastFoodBillData.bsData.eaters;
            params.buffetDeposit = this.buffetDeposit;
          }
          console.log('fastaddorder-params', params);
          ajax('canyin.pos.ordering.fastaddorder', {
            // 加单请求,
            contentType: 'paramsEncoded',
            data: params,
          }).then((res) => {
            if (res.result == 0) {
              if (res.errCode === 7101) {
                this.$confirm(res.msg, this.$t('Dict.Tips'), {
                  closeOnClickModal: false,
                  closeOnPressEscape: false,
                  type: 'warning',
                }).then(() => {
                  resolve();
                })
              }
            } else if (res.result == '1') {
              resolve();
            } else if (res.result == '-1') {
              // 没菜时，点击结算走删菜接口
              if (this.payTypeName == 'settlement') {
                ajax('canyin.pos.reception.receptionbusiness.removebill').then((res) => {
                  if (res.success) {
                    console.log('删除入库的菜');
                  }
                });
              }
              reject(res.msg);
              // this.$message.error(res.msg);
            } else if (res.result == '-2') {
              this.$vemit('posAuthCheck', {
                message: res.msg,
              });
              reject(res.msg);
            } else {
              // 提示 ：加单失败
              reject(this.$t('Biz.Order.AddOrderNoSuccess'));
              // this.$message.error("加单失败");
            }
          });
        });
      });
    },
    // 快速结算方法(其他类结算方式和现金等额的区别就是结算后不开钱箱)
    otherCashSettleTask() {
      // 结算调用整理后的账单数据
      const paymentGetBillData = this.getFastFoodFrontBillDataOfNow();
      // 异步打印
      const printData = this.asyncPrintDataPrepare(
        this.otherPaywayName,
        this.otherPaywayId,
      );
      const params = {
        posId: this.getPosId(), // 当前posId
        point_id: this.getPointId(), // 客位Id
        bsId: this.getBsId(), // 营业流水
        controlMode: '3', // 模式
        isLog: false, // 是否记录log 快餐模式下不记录日志
        items: paymentGetBillData.items, // 加单信息
        orderCode: this.orderCode, // 牌号
        peopleQty: this.peopleQty, // 人数
        payMoney: paymentGetBillData.payMoney, // 账单合计金额
        takeMoney: paymentGetBillData.payMoney, // 账单合计金额
        lastTotal: paymentGetBillData.payMoney, // 账单合计金额
        giveMoney: '0',
        giveChange: '0',
        discountPlanId: this.getDiscountPlanId(), // 执行第N杯打折方案 打折Id
        saleTypeId: this.saleTypeId, // 当前销售类型
        isCrmMixSettle: this.isHaveCrm() ? '1' : '0', // 有会员卡支付信息 为'1'
        printData: JSON.stringify(printData), // 打印所需数据
        ssRemark: paymentGetBillData.ssRemark, // 备注内容
        tableCode: paymentGetBillData.tableCode, // 桌号
        orderCodeMode: this.getOrderCodeModeVal(), // 获取当前牌号模式(非后台设置牌号)
        orderSource: 1,
        fastFoodMemberPriceFlg: this.getBsMemberPriceFlg(), // 快餐模式下是否启用会员价
        paywayId: this.otherPaywayId, // 结算方式Id
        paywayTypeId: this.otherPaywayTypeId, // 结算方式类型
      };
      let url = 'canyin.pos.settlement.otherfastsettle';
      // 快餐模式支付是否还有会员卡支付信息
      const isCrm = this.isHaveCrm();
      // 如果使用会员卡
      if (isCrm) url = 'canyin.pos.settlement.fastsettle';
      ajax(url, {
        contentType: 'paramsEncoded',
        data: params,
      }).then((res) => {
        const d = res.data;
        if (res.result == '1') {
          // 打印
          if (d != null && d.bizPrintLeaveTableParamsList) {
            this.printLeaveTable(d.bizPrintLeaveTableParamsList);
          }
          // 易盘数据计算进行初始
          // BillBsModule.endpayEasyData();
          // 当前客位Id
          const pointId = this.getPointId();
          localStorage.setItem(`${pointId}Remark`, '');
          localStorage.setItem(`${pointId}buttonRemarks`, null);
          this.$message.success(this.$t('Dict.SuccessfulSettlement'));
          // 延后 执行刷新账单, 并传入找零金额
          setTimeout(() => {
            this.clearBillAndRefresh(this.computedGive);
          }, 0);
        } else if (res.result == '-1') {
          this.$message.error(res.msg);
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    // CRM6,CRM7快速结算
    doCrmFastSettleBtnEvent(authData = {}) {
      this.$vonce('authCode', (code) => {
        this.doCrmFastSettleBtnEvent(code);
      });
      // 如果是小卖模式 非营业结算下 先加单再显示结算页面
      this.doSubmitAddOrderForFastSettle(authData).then(() => {
        this.submitAddOrderForFastSettleCallBack();
      })
        .catch((msg) => {
          this.$message.error(msg);
        });
    },
    // 付款码快速结算
    doScanCodeFastSettleBtnEvent(scancodeType) {
      let pid = 0;
      let ptype = 0;
      if (scancodeType === 3) {
        pid = 10;
        ptype = 8;
      } else if (scancodeType === 4) {
        pid = 17;
        ptype = 6;
      } else if (scancodeType === 6) {
        pid = 26;
        ptype = 18;
      } else if (scancodeType === 10) {
        // 微信 支付宝二码合一
        pid = 37;
        ptype = 507;
      } else {
        this.$message.error(this.$t('Biz.Order.PaymentMethodMsg'));
        return false;
      }
      this.requestAndShowPayway(pid, ptype);
    },
    // CRM快速结算-提交加单成功后回调函数
    submitAddOrderForFastSettleCallBack() {
      ajax('canyin.pos.settlement.pay.crmPayWay.getcrmversion').then((data) => {
        const crmVersion = data.isCrm7 && data.isCrm7 === 1 ? 7 : 6;
        const bsId = this.getBsId();
        ajax('canyin.pos.settlement.pay.crmPayWay.view', {
          params: {
            bsId,
            paywayid: 3,
            crmFlg: crmVersion === 7 ? 1 : 0,
            actualPay: 0,
            jsFunCrmGetCardCallback: 'crmGetCardCallback',
            jsFunCrmPreConsumeCallback: 'crmPreConsumeCallback',
            jsFunGetCardNoCallback: 'crmGetCardNoCallback',
            jsFunGetCardChargeCallback: 'crmGetCardChargeCallback',
            jsFunGetConsumeInfoCallback: 'crmGetConsumeInfoCallback',
          },
        }).then((res) => {
          const { orderCode, saleTypeId } = this.getFastFoodFrontBillDataOfNow();
          const pointId = this.getPointId();
          const posId = this.getPosId();
          if (crmVersion === 7) {
            ajax('canyin.pos.settlement.pay.crmPayWay.getcardnofromreserveorder', {
              contentType: 'URLEncoded',
              data: { pointId },
            }).then((showMemberNoMessage) => {
              this.$refs.fastMembershipCardCrm7.open({
                crmHtml: res.crmHtml,
                isHaveCrmMemberDiscAuth: res.isHaveCrmMemberDiscAuth,
                bsId,
                showMemberNoMessage,
                orderCode,
                orderCodeMode: this.getOrderCodeModeVal(),
                saleTypeId,
                pointId,
                posId,
              });
            });
          } else {
            this.$refs.fastMembershipCardCrm6.open({
              crmHtml: res.crmHtml,
              bsId,
              orderCode,
              orderCodeMode: this.getOrderCodeModeVal(),
              saleTypeId,
              pointId,
              posId,
            });
          }
        });
      });
    },
    submitAddOrderForFastSettleCallBack2(bizPrintLeaveTableParamsList) {
      // 结算调用整理后的账单数据
      const paymentGetBillData = this.getFastFoodFrontBillDataOfNow();
      const data = {
        bsId: this.getBsId(), // 当前营业流水
        payWayId: 3,
        posId: this.getPosId(),
        orderCode: paymentGetBillData.orderCode,
        tableCode: paymentGetBillData.tableCode, // 桌号
        bizPrintLeaveTableParamsList,
        orderCodeMode: this.getOrderCodeModeVal(), // 获取当前牌号模式(非后台设置牌号)
        pointId: this.getPointId(), // 当前客位Id,
        saleTypeId: this.saleTypeId,
      };
      const getcrmversionTask = () => new Promise((resolve, reject) => {
        ajax('canyin.pos.settlement.pay.crmPayWay.getcrmversion').then(
          (res) => {
            resolve(res.isCrm7);
          },
        );
      });
      const getcrmversionResult = async () => {
        let isCrm7 = 0;
        const result = await getcrmversionTask();
        isCrm7 = result;
        // 弹出CRM7或CRM6模块
        if (isCrm7 == 1) {
          // 如果是crm7那么 請求下獲取當前客位綁定的會員卡信息
          ajax('canyin.pos.settlement.pay.crmPayWay.getcardnofromreserveorder', {
            contentType: 'URLEncoded',
            data: {
              pointId: this.getPointId(),
            },
          }).then((res) => {
            const showMemberNoMessage = {
              cardNo: res.cardNo,
              phone: res.phone,
              code: res.code,
              msg: res.msg,
            };
            data.showMemberNoMessage = showMemberNoMessage;

            this.$refs.fastMembershipCardCrm7.open(data);
          });
        } else {
          // CRM6
          this.$refs.fastMembershipCardCrm6.open(data);
        }
        // //结算界面显示的时候智能餐盘不能添加和删除所加的品项
        // BillBsModule.iseasyadditem = false;
      };
      getcrmversionResult();
    },
    // 请求并显示线上付款码支付窗口
    requestAndShowPayway(pid, ptype, authData = {}) {
      this.$vonce('authCode', (code) => {
        this.requestAndShowPayway(pid, ptype, code);
      });
      // 结算调用整理后的账单数据
      const paymentGetBillData = this.getFastFoodFrontBillDataOfNow();
      let params = {
        paywayId: pid,
        posId: this.getPosId(), // 当前posId
        point_id: this.getPointId(), // 客位Id
        bsId: this.getBsId(), // 营业流水
        controlMode: '3', // 模式
        isLog: false, // 是否记录log 快餐模式下不记录日志
        items: paymentGetBillData.items, // 加单信息
        orderCode: paymentGetBillData.orderCode, // 牌号
        tableCode: paymentGetBillData.tableCode, // 桌号
        peopleQty: paymentGetBillData.peopleQty, // 人数
        payMoney: paymentGetBillData.payMoney, // 账单合计金额
        takeMoney: paymentGetBillData.payMoney, // 账单合计金额
        lastTotal: paymentGetBillData.payMoney, // 账单合计金额
        giveMoney: '0',
        giveChange: '0',
        discountPlanId: this.getDiscountPlanId(), // 执行第N杯打折方案 打折Id
        saleTypeId: this.saleTypeId, // 当前销售类型
        isCrmMixSettle: this.isHaveCrm() ? '1' : '0', // 有会员卡支付信息 为'1'
        // printData: JSON.stringify(printData), // 打印所需数据
        ssRemark: paymentGetBillData.ssRemark, // 备注内容
        orderCodeMode: this.getOrderCodeModeVal(), // 获取当前牌号模式(非后台设置牌号)
        orderSource: 1,
        fastFoodMemberPriceFlg: this.getBsMemberPriceFlg(), // 快餐模式下是否启用会员价
        isCheckItemMustAdd: this.isCheckItemMustAdd, // 必点品项校验
        ...authData,
      };
      // 自助餐业务快速结算时参数整理
      if (this.posSettings.isOpenBuffetDeposit
        && this.buffetDeposit
      ) {
        params.eaters = this.getFastFoodBillData.bsData.eaters; // 客人类型/数量/价格数据列表
        params.buffetDeposit = this.buffetDeposit; // 押金金额
      }
      ajax('canyin.pos.settlement.pay.scancodepay.showbefore', {
        contentType: 'paramsEncoded',
        data: params,
      }).then((res) => {
        if (res.result == 0) {
          // 校验必点品项
          if (res.errorCode === 7101) {
            this.$confirm(res.msg, this.$t('Dict.Tips'), {
              closeOnClickModal: false,
              closeOnPressEscape: false,
              type: 'warning',
            }).then(() => {
              this.isCheckItemMustAdd = 1;
              this.requestAndShowPayway(pid, ptype);
            })
          }
        }
        if (res.result == 1) {
          this.setSettleBsCode(res.data.orderid);
          let payWayName = '';
          if (pid == 10) {
            // 支付宝支付
            payWayName = this.$t('Biz.Print.Alipay');
          } else if (pid == 17) {
            // 微信支付
            payWayName = this.$t('Biz.Print.WeChatPayment');
          } else if (pid == 26) {
            // 云闪付付款码
            payWayName = this.$t('Biz.Print.CloudFlashPaymentCode');
          }
          const printData = this.asyncPrintDataPrepare(payWayName, pid);
          params = {
            bsId: this.getBsId(), // 营业流水,
            paytypeid: ptype,
            orderCode: paymentGetBillData.orderCode,
            tableCode: paymentGetBillData.tableCode, // 桌号
            paywayid: pid,
            orderid: this.getFastFoodBillData.bsData.code, // 营业流水号
            paymoney: res.data.payMoney,
            isscancodefastsettle: 0,
            printData: JSON.stringify(printData), // 打印数据
            items: JSON.stringify(paymentGetBillData.items), // 加单数据
            pointId: this.getPointId(), // 当前客位Id
            isCrmMixSettle: this.isHaveCrm() ? '1' : '0', // 有会员卡支付信息 为'1'
            bizPrintLeaveTableParamsList: '', // 留台单数据(此参数无用,不确定是否可以删除所以保留了)
            buffetDeposit: this.posSettings.isOpenBuffetDeposit
              ? this.buffetDeposit : 0, // 自助餐押金(只在支付宝/微信/2合1 三种付款码组件中实现付款参数累加(押金))
          };
          if (pid === 10) {
            // 支付宝付款码
            this.$refs.fastAlipayPaymentCode.open(params);
          } else if (pid === 17) {
            // 微信付款码
            this.$refs.fastWeChatPaymentCode.open(params);
          } else if (pid === 26) {
            // 云闪付付款码
            this.$refs.fastUnionPayPaymentCode.open(params);
          } else if (pid === 37) {
            // 微信+支付宝二码合一超级无敌付款码
            this.$refs.fastScanCode.open(params);
          }
          // SELF.iseasyadditem = false;
          this.isCheckItemMustAdd = 0;
        }
        if (res.result == -1) {
          this.$message.error(res.msg);
        }
      });
    },
    // 强制结算
    enforceSettle(data, authData = {}) {
      // 线上支付快速结算的强制结算(如果非快速结算执行更多结算里的强制结算方法)
      const params = {
        bsCode: data.payData.orderid,
        orderCode: data.payData.orderCode,
        orderCodeMode: this.getOrderCodeModeVal(),
        ...authData,
      };
      // 自助餐业务快速结算时参数整理
      if (this.posSettings.isOpenBuffetDeposit
        && this.buffetDeposit
      ) {
        params.eaters = this.getFastFoodBillData.bsData.eaters; // 客人类型/数量/价格数据列表
        params.buffetDeposit = this.buffetDeposit; // 押金金额
      }
      this.$vonce('authCode', (code) => {
        this.enforceSettle(data, code);
      });
      ajax('canyin.pos.settlement.fastenforcesettle', {
        contentType: 'paramsEncoded',
        data: params,
      }).then((res) => {
        if (res.result == '1') {
          this.settlementSuccess(res.data, true); // 第三个参数代表打印结账单
        } else if (res.result == '-1') {
          this.$message.error(res.msg);
        } else if (res.result == '-2') {
          this.$vemit('posAuthCheck', {
            message: res.msg,
          });
        } else {
          // 提示 结算提交失败
          this.$message.error(this.$t('Biz.Order.SettlementFailed'));
        }
      });
    },
    // 手工结算
    manualSettle(data, authData = {}) {
      // typeId:6代表微信二维码;typeId:8代表支付宝付款码;typeId:18代表云闪付付款码
      const typeId = data.payData.paytypeid ? data.payData.paytypeid : data.typeId;
      const params = {
        typeId,
        orderid: data.payData.orderid,
        ...authData,
      };
      this.$vonce('authCode', (code) => {
        this.manualSettle(data, code);
      });
      // 查询
      ajax('canyin.pos.settlement.pay.scancodepay.checkwuupayandsettle', {
        contentType: 'URIEncoded',
        data: params,
      }).then((res) => {
        if (res) {
          this.manualSettleSuccess(res);
        } else {
          // 提示 请注意，系统无法获取线上支付核销信息。
          this.$message({
            type: 'warn',
            message: this.$t('Biz.Order.linePayErrorMsg'),
            duration: 2000,
          });
        }
      });
    },
    // 手工结算成功
    manualSettleSuccess(res) {
      if (res.queryState === false) {
        // 后再不在由resultCode:'-2'的逻辑(即不在有操作权限), 代码注释暂留
        // if (res.resultCode && res.resultCode === '-2') {
        // this.$vemit('posAuthCheck', { message: res.resultMsg });
        // } else {
        this.$message({
          type: 'warn',
          message: res.resultMsg
            ? res.resultMsg
            : this.$t('Biz.Order.linePayErrorMsg'),
          duration: 2000,
        });
        // }
      } else {
        this.manualSettlePayState(res);
      }
    },
    // 手工结算状态
    manualSettlePayState(res) {
      if (res.payState) {
        // 支付成功
        if (res.payMoneyState) {
          if (res.resultCode && res.resultCode !== '000') {
            if (res.resultMsg) {
              this.$message({
                type: 'error',
                message: res.resultMsg,
                duration: 2000,
              });
            }
            return false;
          }

          this.settlementSuccess(res, false); // 第三个参数代表不打印结账单
        }
        // 此处else分支需要核对支付金额不一致提示的情况方法名为(onlinePayMoneyError)
        // 分析老系统代码知此方法并不会执行所以删除此处代码,后期如果需要此处功能请查阅老系统此处代码(根据该方法名查找)
      } else {
        // '请注意，系统获取线上支付状态为“<strong style="color: red; font-size: 20px;">未支付</strong>”。请再次确认客户支付信息正确并且已经支付成功。'
        // 支付不成功，提示未支付
        this.$message({
          type: 'warn',
          message: this.$t('Biz.Order.LongMsg040', ['“<strong style="color: red; font-size: 20px;">', '</strong>”']),
          duration: 2000,
          dangerouslyUseHTMLString: true,
        });
      }
    },

    // 结算成功
    // Params: data-结算成功的数据, enforceOrManual-强制结算或手动确认true(强制),false(手动)
    settlementSuccess(data, enforceOrManual) {
      /**
       * 扫码支付(微信/支付宝/云闪付/闪惠)非正常结算业务说明:
       * 手动确认(手工核销)和强制结算的结算结果,均执行这里完成结算. enforceOrManual参数区别手工和强制.
       * 手动确认: 不在由前台执行打印业务(所有的), 结算完成后,关窗口,刷账单.
       * 强制结算: 由前台执行打印业务(所有的且依靠后台设置), 结算完成后,关窗口,刷账单.
       * 说明:原逻辑 手动不刷新账单(因为结算完成推送会也会刷新账单),现在推动做了bsCode判断:
       * ## 不是新的结算推送, 上一次的推送不会执行账单刷新
       * ## this.getSettleBsCode && bsCodes.indexOf(this.getSettleBsCode) != -1
       * BUG-445: 扫码付断网-支付-手动确认,出现bug,上述修改针对此bug修正.
       */

      // 强制结算没有返回resultCode, 所以这个判断不可使用, 只留注释说明
      // if (data.resultCode === '000') {

      // 关闭当面付窗口
      this.$vemit('fastfoodCloseSettleDialog');
      this.$message.success(this.$t('Dict.SuccessfulSettlement'));
      // }

      // 打印结账单(强制) 1：支付宝、微信支付的结账单打印
      if (enforceOrManual) {
        this.printSettle(data.bsId, null, 1);
        if (data.bizPrintLeaveTableParamsList) {
          this.printLeaveTable(data.bizPrintLeaveTableParamsList);
        }
      }
      console.log(data.isReturnPointAndSettle, '参数isReturnPointAndSettle,目前快餐已废,跟踪返回情况');
      if (!data.isReturnPointAndSettle && data.bsId != null) {
        this.printAddBill(data.bsId);
      }

      // 结算状态查询
      ajax('canyin.pos.reception.receptionbusiness.findbssettlestate', {
        contentType: 'paramsEncoded',
      }).then((res) => {
        if (res.success) {
          // 刷新账单
          setTimeout(() => {
            // 原逻辑 手动不刷账单, 代码注释
            // this.clearBillAndRefresh(false, !enforceOrManual);
            // 手动和强制均执行账单刷新
            this.clearBillAndRefresh(false, false);
          }, 0);
        }
      });
    },
    /** *******************************************************************************************************
     * 四 结算业务,所需数据以及参数
     */
    // 获得posId
    getPosId() {
      return this.posInfo.id;
    },
    // 获取客位Id
    getPointId() {
      return this.posFastFood.buffetPointId;
    },
    // 获取当前营业流水Id
    getBsId() {
      return this.getFastFoodBillData.bsData.id;
    },
    // 获取使用会员卡数据
    getCrmData() {
      return this.getSelectCrmData;
    },
    // 判断当前是否使用会员卡如果crmData值为null代表当前没有使用会员卡
    isHaveCrm() {
      if (this.getSelectCrmData) {
        return true;
      }
      return false;
    },
    // 获取券支付信息
    getTicketPayInfo() {
      return this.getSelectVoucherData;
    },

    // 获取打折方案
    getDiscountPlanId() {
      return this.getSelectDiscountPlanData
        ? this.getSelectDiscountPlanData.discountPlanId
        : null;
    },
    // 设置营业流水会员价标识
    setBsMemberPriceFlg(memberPriceFlg) {
      this.bsMemberPriceFlg = memberPriceFlg;
    },
    // 获取执行会员价标识(执行会员价返回true,否则返回false)
    getBsMemberPriceFlg() {
      return this.getFastFoodMemberPlanFlg.isDoMemberPrice;
    },
    // 转换销售类型Id到对应的销售类型名称
    getSaleTypeText() {
      // 1堂食,2外带,3外卖
      const paymentGetBillData = this.getFastFoodFrontBillDataOfNow();
      const saleType = this.saleTypeId; // 当前销售类型
      if (saleType == '1') {
        return this.$t('Dict.SaleType.ForHere');
      } if (saleType == '2') {
        return this.$t('Dict.SaleType.TakeAway');
      } if (saleType == '3') {
        return this.$t('Dict.SaleType.TakeOut');
      }
    },
    // 获取当前牌号状态时自动还是手动(即便是自动+手动状态下也要区分当前是自动还是手动)
    getOrderCodeModeVal() {
      if (this.bsOrderCodeMode == '1') {
        // 自动
        return this.ORDER_CODE_MODE_AUTO;
      } if (this.bsOrderCodeMode == '2') {
        // 手动
        return this.ORDER_CODE_MODE_HAND;
      } if (this.bsOrderCodeMode == '3') {
        // 自动 + 手动 结算调用整理后的账单数据
        const paymentGetBillData = this.getFastFoodFrontBillDataOfNow();
        // 判断当前销售类型:1堂食,2外带,3外卖
        const saleType = this.saleTypeId; // 当前销售类型
        if (saleType == '1') {
          // 堂食
          return this.ORDER_CODE_MODE_HAND;
        }
        return this.ORDER_CODE_MODE_AUTO;
      }
      return this.bsOrderCodeMode;
    },
    getToken(next) {
      ajax('canyin.pos.token.get').then((tokenId) => {
        next(tokenId);
      });
    },
    // 增加电话外卖相关禁点按钮
    phoneSetDisableBtn(disable, allBtn) {
      if (disable) {
        if (allBtn) {
          this.noClickBtn = [...this.posFastFood.btns];
        } else {
          this.noClickBtn = this.posFastFood.btns.filter((item) => {
            if (this.posSettings.isForceMemberQuery) {
              // 排除 打折、验证会员、电话外卖落单 按钮
              return !(item.btnId == '-6' || item.btnId == '-15' || item.btnId == '-21');
            }
            // 排除 打折、验证会员、执行会员、取消会员、电话外卖落单 按钮
            return !(item.btnId == '-6' || item.btnId == '-13' || item.btnId == '-14' || item.btnId == '-15' || item.btnId == '-21');
          });
        }
      } else {
        this.posFastFood.btns.forEach((item, value) => {
          if (item.isCanClick) {
            delete item.isCanClick;
          }
        });
      }
      this.setPosFastfoodData(this.posFastFood);
      this.initPage();
    },
    // 添加crm相关禁点按钮
    crmSetDisablebtn() {
      const disablePayBtn = ['crmFastSettle', 'voucher', 'crmNoDialogFastSettle', 'takeoutPhone', 'takeOut', 'cardGiftAndVoucher'];
      this.noClickBtn = this.posFastFood.btns.filter((item) => {
        // 禁用掉所有不是结算方式的按钮以及会员卡、会员卡快速结算、券类型、电话外卖落单(btnType 为2是支付类)
        // "crmFastSettle","voucher","crmNoDialogFastSettle", "takeoutPhone", "takeOut",cardGiftAndVoucher
        if (+item.btnType === 2) {
          return (disablePayBtn.indexOf(item.btnName) !== -1);
        }
        return true;
      });

      // 菜品显示遮罩层
      this.$emit('maskLayer', true);
      // 菜品功能按钮显示遮罩层
      this.$vemit('maskLayerBus', true);
    },
    // 恢复crm相关禁点按钮
    crmCelDisablebtn() {
      this.posFastFood.btns.forEach((item, value) => {
        if (item.isCanClick) {
          delete item.isCanClick;
        }
      });
      this.setPosFastfoodData(this.posFastFood);
      this.initPage();
      // 菜品显示遮罩层
      this.$emit('maskLayer', false);
      // 菜品功能按钮显示遮罩层
      this.$vemit('maskLayerBus', false);
    },
    // 后台设置了验证会员后执行销售方案会员价 前台置灰执行会员价和取消会员价按钮
    isForceMemberQueryDisable() {
      if (this.posSettings.isForceMemberQuery) {
        this.noClickBtn = this.posFastFood.btns.filter((item) => {
          // 排除 微信,支付宝,银联卡,10 ,20,50,100,手工操作现金等额按钮(暂没有线上礼品券)
          if (item.btnId == '-13' || item.btnId == '-14') {
            return true;
          }
          return false;
        });
      }
    },
    // 恢复代金券相关禁点按钮
    voucherCelDisablebtn() {
      this.posFastFood.btns.forEach((item, value) => {
        if (item.isCanClick) {
          delete item.isCanClick;
        }
      });
      this.setPosFastfoodData(this.posFastFood);
      this.initPage();
    },
    // 结算完后清空会员信息
    clearCrmCardInfo() {
      // 取消 账单会员卡(CRM)信息显示: 账单清除数据
      this.$vemit('crmMemberShowOnBillBus', {
        show: false,
        data: {
          mobile: '',
          cardType: '',
          memberName: '',
        },
      });
      this.$vemit('setMemberInfo', null);
    },
    // 初始化打折方案
    clearDiscountMessage() {
      this.setSelectDiscountPlanData(null); // 清除折扣和优惠
    },
    // 清除券支付信息
    clearTicketPayInfo() {
      this.setSelectVoucherData({ list: null });
    },
    // 清空会员卡支付信息
    clearCrmPayInfo() {
      this.setSelectCrmData({ list: null });
    },
    // 执行显示 账单的找零
    showGiveOfSettled(data) {
      if (!data) {
        this.$parent.$parent.$refs.giveChange = this.computedGive;
      } else {
        this.$parent.$parent.$refs.giveChange = data;
      }
    },
    // 清空刷新账单: 参数 this.getPointId()-客位id, give-找零金额,dontLoadBs-不刷账单
    clearBillAndRefresh(give, dontLoadBs) {
      this.$log.info(`监听清空账单${give}--${dontLoadBs}`);
      if (!dontLoadBs) {
        this.$vemit('fastFoodLoadBs', {
          buffetPointId: this.getPointId(),
          give,
          msg: 'fastPanel结算调用',
        });
      }
      // 恢复默认销售类型
      // this.refreshSaleType(1);
      // 牌号初始化状态
      this.setOrderCode(null);
      // 初始化打折方案
      this.clearDiscountMessage();
      // 清除代金券支付信息
      this.clearTicketPayInfo();
      // 恢复代金券相关禁点按钮
      this.voucherCelDisablebtn();
      // 恢复crm相关禁点按钮
      this.crmCelDisablebtn();
      // 后台设置了验证会员后执行销售方案会员价 前台置灰执行会员价和取消会员价按钮
      this.isForceMemberQueryDisable();
      // 初始化会员显示信息
      this.clearCrmCardInfo();
      // 清除会员卡支付信息
      this.clearCrmPayInfo();
      if (this.posDevice.enableYiPan && this.posBaseInfo.yipanList.length) {
        this.$devices.ETag.reload();
      }
      if (this.posDevice.enableZhiPan && this.posBaseInfo.zhipanList && this.posBaseInfo.zhipanList.length) {
        this.$devices.ETag.reload();
      }
      // 重置'会员价'按钮
      this.memberPriceToggle = null;
      // 结算成功后清空已支付金额
      this.$vemit('clearAmountPaidBus');
      return Promise.resolve();
    },
    // 抹零
    wipeZero(number) {
      // mode 1：四舍五入 2：收尾 3：去尾 4：不抹零
      // 新增'抹零'设置功能:快餐账单显示的结算金额数据,是由前台计算完成,所以根据后台返回的'抹零'状态,执行显示内容;
      // (即不执行或取消抹零时,强制将前台显示抹零参数设置为4,'合计和待支付'金额功能会联动变化);
      // (wipeFlg字段不存在时, 即无抹零规则, 功能不执行);
      // 原功能<马秋瑶>实现,非常好的程序扩展,手动点赞!
      const mode = this.getFastFoodBillData.bsData.wipeFlg === false ? 4 : (this.posFastFood.wipeZeroModeKey % 10);
      const position = this.posFastFood.wipeZeroPositionKey % 10; // 1：元  2：角 3：五元 4： 十元
      const num = MathUtil.round(number);
      if (mode === 4 || mode === 0) return num;
      let dot = 100;
      if (position === 1) {
        dot = 0;
      }
      if (position === 2) {
        dot = 1;
      }
      if (position === 4) {
        dot = -1;
      }
      if (position === 3) return MathUtil.calc5yuan(num, mode);
      if (position === 5) return MathUtil.calc5jiao(num, mode); // 取到5角
      if (mode === 1) return MathUtil.round(num, dot);
      if (mode === 2) return MathUtil.ceil(num, dot);
      if (mode === 3) return MathUtil.floor(num, dot);
    },

    /** *******************************************************************************************************
    五 结算相关打印部分, 并口打印需要的数据搜集 */
    asyncPrintDataPrepare(payName, paywayId) {
      const { bsData } = this.getFastFoodBillData;
      const paymentGetBillData = this.getFastFoodFrontBillDataOfNow();
      const openTime = new Date(
        bsData.openTime
          .replace(new RegExp('-', 'gm'), '/')
          .replace(new RegExp('T'), ' '),
      ).getTime();
      const posId = this.getPosId();
      const reaName = bsData.pointName == null || bsData.pointName == 'undefined'
        ? ''
        : bsData.pointName.split('.')[0];
      const pointCode = bsData.pointName == null || bsData.pointName == 'undefined'
        ? ''
        : bsData.pointName.split('.')[1].split('-')[0];
      const pointDisplayName = bsData.pointName == null || bsData.pointName == 'undefined'
        ? ''
        : bsData.pointName.split('.')[1];
      const crmPayMoney = this.isHaveCrm() ? this.getCrmData().price : 0;
      const DS1 = [
        {
          bsCode: bsData.code, // 营业流水号
          bsId: bsData.id, // bsid
          peopleQty: paymentGetBillData.peopleQty, // 人数
          itemOrigMoney: 0, // 最终的费用合计
          origTotal: 0, // 应收
          address: this.posBaseInfo.address,
          areaCode: '',
          areaId: '',
          reaName,
          canceldBill: '',
          contact_tel: this.posBaseInfo.contactTel,
          createShopName: this.posBaseInfo.createShopName,
          slogan: this.posBaseInfo.slogan ? '' : this.posBaseInfo.slogan,
          discInfo: this.getSelectDiscountPlanData
            ? this.getSelectDiscountPlanData.discountPlanName
            : '', // 优惠信息
          discTotal: 0, // 优惠合计 折扣金额 + 抹零金额
          giveChange: 0, // 不弹框的找零的情况下 找零金额
          jzdPrintCount: 1,
          lastTotal: paymentGetBillData.lastTotal, // 实收金额
          openShiftName: '',
          openTime,
          operName: this.posBaseInfo.user.name,
          orderCode: paymentGetBillData.orderCode, // 牌号
          tableCode: paymentGetBillData.tableCode, // 桌号
          pointCode,
          pointDisplayName,
          pointId: bsData.pointId,
          pointName:
            bsData.pointName == null || bsData.pointName == 'undefined'
              ? ''
              : bsData.pointName,
          presentMoney: 0, // 赠送的合计
          saleTypeId: this.getSaleTypeText(),
          settleEmpName: this.posBaseInfo.user.username, // 收银员登陆者员工代号
          settleTime: new Date().valueOf(),
          takeMoney: paymentGetBillData.takeMoney, // 收款金额
          wipeMoney: 0, // 抹零金额
          yjdPrintCount: '',
          ssRemark: paymentGetBillData.ssRemark, // 整单备注
          crmPayMoney,
        },
      ];
      const DS2 = [];
      // 国际化遗留 货币
      const DS3 = [
        {
          payMoney: sub(
            this.wipeZero(paymentGetBillData.lastTotal),
            crmPayMoney,
          ),
          paywayId: paywayId || 1,
          paywayName: payName || '人民币',
          payWayTypeFlg: this.otherPayWayTypeFlg === 4 ? 4 : 1, // 现金类
        },
      ];
      let DS5 = [];
      if (this.getCrmData() && this.getCrmData().cardInfo) {
        const { cardInfo } = this.getCrmData();
        if (cardInfo.consumeMoney > 0) {
          DS3.push({
            payMoney: cardInfo.consumeMoney,
            paywayId: 12,
            paywayName: this.$t('Biz.Print.CardStoredVal'), // 一卡通（储值）
            payWayTypeFlg: 2,
          });
        }
        if (cardInfo.consumeScore > 0) {
          DS3.push({
            payMoney: cardInfo.consumeScore,
            paywayId: 13,
            paywayName: this.$t('Biz.Print.CardIntegral'), // '一卡通（积分）'
            payWayTypeFlg: 2,
          });
        }
        if (cardInfo.consumeTicketMoney > 0) {
          DS3.push({
            payMoney: cardInfo.consumeTicketMoney,
            paywayId: 14,
            paywayName: this.$t('Biz.Print.CardCoupon'), // '一卡通（券）'
            payWayTypeFlg: 2,
          });
        }
        if (
          cardInfo.consumeMoney === 0
          && cardInfo.consumeScore === 0
          && cardInfo.consumeTicketMoney === 0
        ) {
          DS3.push({
            payMoney: cardInfo.consumeMoney,
            paywayId: 12,
            paywayName: this.$t('Biz.Print.CardStoredVal'), // 一卡通储值
            payWayTypeFlg: 2,
          });
        }
        DS5 = [
          {
            cardno: cardInfo.cardNo,
            consumeScore: cardInfo.consumeScore,
            consumeTicketMoney: cardInfo.consumeTicketMoney,
            consumeUseMoney: cardInfo.consumeMoney,
          },
        ];
      }
      // 打印需要的最终数据
      const { parallelPrinter } = this.posInfo;
      return {
        fileid: parallelPrinter != null ? parallelPrinter.style_id : '',
        exporttype: 1,
        printer: parallelPrinter != null ? parallelPrinter.printer : '',
        printcnt: parallelPrinter != null ? parallelPrinter.print_times : '',
        posid: this.getPosId(),
        DS1,
        DS2,
        DS3,
        DS4: [],
        DS5,
        DS6: [],
        DS7: [],
        DS8: [],
        DS9: [],
        DS10: [],
      };
    },
    // 打印加单
    // 不弹窗结算打印
    noAlertPrint(data) {
      // 只有会员卡单一支付时才会调用此方法
      // 快餐打印留台单了
      if (data != null && data.bizPrintLeaveTableParamsList) {
        this.printLeaveTable(data.bizPrintLeaveTableParamsList);
      }
      if (data && data.bsId) {
        this.printAddBill(data.bsId);
        this.printSettle(data.bsId);
      }
    },
    // 打印并口加单标签
    printAddBill(bsId) {
      ajax('canyin.pos.printaddbilltag.getaddbillprintdata', {
        contentType: 'paramsEncoded',
        needToken: true,
        data: { bsId },
      }).then((data) => {
        if (data.success) {
          if (!data.printType) {
            // http://192.168.4.84:88/zentao/bug-view-74109.html
            // 后台没有设置加单标签打印，此处不应该提示这句
            // this.$message.error('加单标签打印设置异常, 请设置后刷新重试!');
          } else if (data.printType === 'PRINT_PARALLEL' && data.printD) {
            this.$log.info(`快餐打印加单标签${bsId}`);
            const {
              exporttype,
              fileid,
              printcnt,
              printer,
              style_data,
            } = data.printD;
            each(data.printD.data, (item) => {
              this.$devices.Printer.print(
                extend({}, item, {
                  exporttype,
                  fileid,
                  printcnt,
                  printer,
                  style_data,
                }),
              );
            });
          }
        } else {
          this.$message.error(data.msg);
        }
      });
    },

    // 打印留台单
    printLeaveTable(bizPrintLeaveTableParamsList) {
      const url = 'canyin.pos.printleavetable.getleavetablestyledata'; // 接口地址
      // 获取posId  posInfo  Pos的一些信息见 vuex getter.js 的posInfo
      this.$log.info('快餐打印留台单');
      bizPrintLeaveTableParamsList.map((list) => {
        ajax(url, {
          loading: false,
          contentType: 'paramsEncoded',
          needToken: true,
          data: {
            bsId: list.bsId,
            ssId: list.ssId,
            pointId: list.pointId,
            styleType: 7,
          },
        }).then((res) => {
          if (res.printType === 'PRINT_PARALLEL' && res.printD) {
            this.$devices.Printer.print(res.printD);
          }
        });
      });
    },
    // 打印结账单
    printSettle(bsId) {
      ajax('canyin.pos.printsettle.getsettleprintdata', {
        contentType: 'paramsEncoded',
        needToken: true,
        data: {
          bsId,
          styleType: '1',
        },
      }).then((res) => {
        if (!res.data.printType) {
          // 提示 - 结账单打印设置异常, 请设置后刷新重试!
          this.$message.error(this.$t('Biz.Order.DoPayPrintErrorMsg'));
        } else if (res.data.printType == 'PRINT_PARALLEL' && res.data.printD) {
          this.$log.info(`快餐打印结账单${bsId}`);
          this.$devices.Printer.print(res.data.printD);
        }
      });
    },
    cancelCrmSettle(options) {
      // 获取打折参数
      if (this.getSelectDiscountPlanData) {
        const discTypeParams = {
          bsId: this.getBsId(),
          pointId: this.getPointId(), // 客位Id
          disctype: 2,
          planid: this.getSelectDiscountPlanData.discountPlanId,
        };
        options.discTypeParams = JSON.stringify(discTypeParams);
      }
      ajax('canyin.pos.settlement.pay.crmPayWay.cancel', {
        contentType: 'URLEncoded',
        data: options,
      }).then((data) => {
        if (options.deviceReadCardNo) {
          if (this.posDevice.readCardOpt.mode === 9) {
            this.$devices.Cardop.cancel();
          }
          if (this.posDevice.readCardOpt.mode === 15) {
            this.$devices.Cardop.cancelOut();
          }
          if (this.posDevice.readCardOpt.mode === 16) {
            this.$devices.Cardop.cancelOut();
          }
        }
        // 这个是crm7 取消会员折扣的回调方法
        if (options != null && options.cardNo != undefined && options.flg) {
          this.$refs.fastMembershipCardCrm7.crm7HtmlRefresh();
        }
        // 刷新账单
        this.$vemit('fastFoodLoadBs', {
          buffetPointId: this.getPointId(),
        });
      });
    },
  },
};
</script>

<style lang="less" scoped>
.list {
  // overflow: hidden;
  margin: 10px 0;
  svg {
    width: 1.8em;
    height: 3.6em;
    margin-right: .2em;
    margin-left:0.5em;
  }
  .hotkeytext{
    position:absolute;
    top:12px;
    left:0;
    font-size:12px;
  }
  .no-click {
    cursor: not-allowed !important;
    background-color: #b1d0d7;
    opacity: 0.5;
  }
  .no-click :hover {
    background-color: none !important;
    // opacity: 0.2;
  }
  .item {
    position: relative;
    float: left;
    // width: 105px;
    width: 16.66%;
    height: 52px;
    padding: 0 1px;
    margin-bottom: 2px;
    cursor: pointer;
    
    .drawerBox {
      position: absolute;
      top: 0;
      width: calc(100% - 2px);
      background:#527081;
      box-shadow:0px 1px 0px 0px rgba(82,112,129,1);
      opacity:0.9;
      border-radius:4px;
      overflow: hidden;
      .pageList{ border-radius:4px;}
      li {
        line-height: 44px;
        height: 44px;
        overflow: hidden;
        text-align: center;
        font-size:14px;
        color:#fff;
        border-bottom: 1px solid #7f96a5;
        button {
          height: 100%;
          width: 100%;
          overflow: hidden;
          border: none;
          background: transparent;
        }
        &.active {
          background:#0babb9;
          box-shadow:0px 1px 0px 0px rgba(82,112,129,1);
        }
      }
      &.drawerBoxNoArrow{
        li{
          &:nth-last-of-type(1) { border:0; }
        }
      }
    }
    .nextPageCenter {
      text-align: center;
    }
    .body {
      position: relative;
      padding: 3px 3px 3px 30px;
      height: 52px;
      line-height: 52px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.5);

      > .svg-hot {
        position: absolute;
        left: 5px;
        top: 0px;
        width: 30px;
      }
      > .fast-btn {
        height: 46px;
        flex: 1;
        word-break: break-all;
        justify-content: center;
        flex-direction: column;
        display: flex;
        > .content-word {
          width: 71px;
          text-align: center;
          line-height: 1.65;
          display: flex;
          justify-content: center;
          margin: 0 auto;
        }
        // flex-direction: column;
        > span {
          display: inline-block;
        }
      }
      > .fast-btn ::after{
        display: inline-block;
        content: "";
        vertical-align: middle;
        height: 100%;
      }


    }
    .body:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .body.showMemberPriceSelect {
      background-color: #0babb9;
    }
    .body.cancelMemberPriceSelect {
      background-color: rgba(255, 255, 255, 0.5);
    }
  }
}
.mt6em{
  margin-top:-0.6em;
}
@media screen and (max-width: 1024px) {
  .mglf0{
    margin-left: 0 !important;
  }
}

</style>

<style lang="less">
.drawerBox {
  ul{
    border-radius: 4px 4px 0 0;
  }
  .pos-pager{
    .center{ margin-top:4px;
      > button {
        background:rgba(255,255,255,0.2);
        border:1px solid rgba(181,181,181,1);
        color:#fff;
        &[disabled] { color: #b9b9b9; }
      }
    }
  }
}
</style>
