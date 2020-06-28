<template>
  <div class="pos-fastfood-bill" :class="{ 'show-phonerecord': isShowPhoneCard }">
    <div class="pos-fastfood-bill-main" :class="{ 'show-phonecard': isShowPhoneCard }">
      <div class="pos-fastfood-bill-top" id="posFastfoodBillTop">
        <div @click="payOpenChangeOrderCode()" v-autotest>
          <span>{{ $t('Dict.OrderCode01') }}
            <strong>{{ orderCode > 9999 ? 9999 : orderCode ? orderCode : '--' }}</strong>
          </span>
          <span>{{ $t('Dict.NumberOfPeople') }}: <strong>{{ peopleQty > 999 ? 999 : peopleQty }}</strong></span>
          <span class="span_deposit" v-if="posSettings.isOpenBuffetDeposit">{{ $t('Dict.Btn.Deposit')}}: <b>{{ buffetDeposit }}</b></span>
        </div>
        <div v-if="!posSettings.isOpenBuffetDeposit">
          <span
            :class="{active: saleActiveState == index}"
            v-for="(item, index) in sale.name"
            :key="index"
            v-show="posFastFood.saleTypeVal ? index < 2 : index < 3"
            @click="saleToggle(index)"
            >{{ item }}</span>
        </div>
      </div>
      <!-- 来电显示 -->
      <PhoneStateCard
        class="pos-fastfood-phone-card"
        v-if="isShowPhoneCard"
        :phoneInfo="phoneInfo"
        :isShowPhoneRecord="isShowPhoneRecord"
        :isNewCallWithHandling="isNewCallWithHandling"
        @toPhoneRecord="toPhoneRecord"
        @cancelHandlingPhone="cancelHandlingPhone"
        @handlePhone="handlePhone"
      ></PhoneStateCard>
      <PhoneRecordList
        class="pos-fastfood-phone-record"
        v-if="isOpenTakeoutPhone"
        v-show="isShowPhoneRecord"
        :phoneInfo="phoneInfo"
        :isShowPhoneRecord="isShowPhoneRecord"
        :newCallNumberWithHandling="newCallNumberWithHandling"
        @backBillAndRefresh="backBillAndRefresh"
        @backBillAndHandle="backBillAndHandle"
        @newCallAtBill="newCallAtBill"
      ></PhoneRecordList>
      <!-- 加单列表 -->
      <List
        ref="billList"
        @modifyItemPackage="modifyItemPackage"
        @fastfoodBillLastTotal="fastfoodBillLastTotal"
        @getitemsNumberSum="addOrderSum = $event"
        @setDiscountMoney ="setDiscountMoney"
        @deleteItem="deleteItem"
        :saleTypeId="saleTypeId"
        :guestList="guestList"></List>
    </div>
    <div class="pos-fastfood-bill-settle-info">
      <div v-if="addOrderSum > 0"><span class="sum">{{ $t('Dict.Altogether') }}{{ addOrderSum }}{{ $t('Dict.Copies') }}</span></div>
      <div class="paymentInfo">
        <span>{{ $t('Dict.Total01') }} <em>{{ paymentData.total }}</em></span>
        <span v-show="isShowStayPayMessage">{{ $t('Dict.ToBePaid') }}: <em>{{ paymentData.stayPayMoney }}</em></span>
        <span v-show="!isShowStayPayMessage">{{ $t('Dict.GiveChange') }}: <em>{{ paymentData.giveChange }}</em></span>
      </div>
      <!-- 折扣和优惠 -->
      <ul class="discountInfo">
        <li :style="{'background-color': item.disBgc}"
          v-for="(item, index) in discountList"
          :key="index" >
          <span>{{ item.name }} : <em>{{ item.price }}</em></span>
          <span v-if="item.TypeName !== 'wipeMoney'" class="discountInfo-closeBtn" @click="cancelDiscout(item)"><em class="icon icon-jiansvg"></em></span>
        </li>
      </ul>
    </div>
    <!-- 加载组件 -->
    <ChangeCodeAndQty ref="changeCodeAndQtyDialog"></ChangeCodeAndQty>
  </div>
</template>

<script>
import { isEmpty, cloneDeep } from 'lodash';
import {
  mapState, mapGetters, mapMutations, mapActions,
} from 'vuex';
import {
  sub, round, ceil, floor, calc5yuan, calc5jiao,
} from '@/common/js/math';
import ajax from '@/common/js/ajax';
import {
  NOHANDLE, ISHANDLING,
} from '@/common/dictionary/pos-phone-state';
import List from './FastFoodList';
import ChangeCodeAndQty from './ChangeCodeAndQty';
import PhoneStateCard from './PhoneStateCard';
import PhoneRecordList from './PhoneRecordList';

export default {
  components: {
    List, ChangeCodeAndQty, PhoneStateCard, PhoneRecordList,
  },
  props: {
    guestList: {
      type: Array,
      default() {
        return [];
      },
    },
    isShowStayPayMessage: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      // 堂食,外带,外卖模式
      sale: {
        name: [`${this.$t('Dict.SaleType.ForHere')}`, `${this.$t('Dict.SaleType.TakeAway')}`, `${this.$t('Dict.SaleType.TakeOut')}`],
        activeIndex: 0,
      },
      // 付款信息
      paymentData: {
        total: 0, // 合计
        stayPayMoney: 0, // 待支付
        giveChange: 0, // 找零
        amountPaid: 0, // 已支付的信息
      },
      // 折扣和优惠列表 颜色状态
      colorOfDisList: ['#63b3e8', '#6acb48', '#e7bf58'],
      // 打折优惠的money
      discountMoney: 0,
      // 抹零优惠的money
      wipeMoney: 0,
      // 更多结算界面里的定额优惠money
      rationInputCountMoney: 0,
      phoneInfo: null,
      // 是否显示来电记录页
      isShowPhoneRecord: false,
      // 是否是在处理中的新来电
      isNewCallWithHandling: false,
      newCallNumberWithHandling: null,
      // 总数
      addOrderSum: 0,
    };
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
    ]),
    ...mapGetters([
      'posFastFood',
      'posBaseInfo',
      'getFastFoodBillData',
      'getSelectDiscountPlanData',
      'getSelectVoucherData',
      'getSelectCrmData',
      'posSettings',
      'posDevice',
      'posTakeout',
    ]),
    // 账单底部打折和会员信息 显示处理 getSelectDiscountPlanData 当前打折活动方案的数据
    discountList() {
      const lists = [];
      // 抹零的优惠信息
      if (this.wipeMoney != 0) {
        lists.push({
          name: this.$t('Dict.WipeMoney'),
          price: this.wipeMoney,
          discountPlanId: null,
          disBgc: this.colorOfDisList[1], // 写死色值, [0]固定为折扣, [1]固定为优惠, [2]固定为混合结算
          TypeName: 'wipeMoney',
        });
      }
      // 折扣方案数据添加
      if (this.getSelectDiscountPlanData) {
        lists.push({
          name: this.getSelectDiscountPlanData.discountPlanName,
          price: this.discountMoney,
          discountPlanId: this.getSelectDiscountPlanData.discountPlanId,
          disBgc: this.colorOfDisList[0], // 写死色值, [0]固定为折扣, [1]固定为优惠, [2]固定为混合结算
        });
      }
      // 代金券数据添加
      if (this.getSelectVoucherData) {
        lists.push(this.getSelectVoucherData);
      }
      // 会员数据添加
      if (this.getSelectCrmData) {
        lists.push(this.getSelectCrmData);
      }
      // 混合支付时更新已支付金额
      lists.forEach((item) => {
        // 每次更新已支付金额时先清零
        this.paymentData.amountPaid = 0;
        if (item.crmId || item.payway_type_id == '506') { // 账单底部有代金券和会员卡时更新已支付金额
          this.paymentData.amountPaid += Number(item.price);
          this.paymentData.stayPayMoney = sub(this.wipe(this.paymentData.total), this.paymentData.amountPaid);
        }
      });
      return lists;
    },
    // 是否开启电话外卖和来电显示
    isOpenTakeoutPhone() {
      return this.posTakeout.enable === true && this.posTakeout.haveTakeoutPhone === true;
    },
    // 是否存在电话信息
    isShowPhoneCard() {
      return this.isOpenTakeoutPhone && Boolean(this.phoneInfo);
    },
    orderCodeMode() {
      // 如果当前模式是 自动加手动 堂食走手动传2
      if (this.posFastFood.bsOrderCodeMode === '3') {
        return this.saleActiveState === 0 ? 2 : 1;
      }
      return +this.posFastFood.bsOrderCodeMode;
    },
  },
  created() {
    // 获取加单列表
    this.$von('getBillList', (callback) => {
      const billList = this.$refs.billList.submitDish();
      callback(billList);
    });

    /**
     * 打印通用方法
     * 抄写中餐 Bill/Index.vue 马秋瑶创建方法
     * @param data 包含 url、params 数据
     */
    this.$von('fastCommonPrint', (data) => {
      ajax(data.url, {
        contentType: 'paramsEncoded',
        needToken: true,
        data: data.params,
      }).then((res) => {
        /**
         * 数据 res
         * @param printType 'PRINT_PARALLEL' 打印类型是并口的执行，进行打印业务
         */
        if (data.printType != undefined && data.printType == 1) {
          if (res.success && res.result == 1) {
            if (res.data.msg) {
              this.$message.error(res.data.msg);
            } else if (res.data.printType == 'PRINT_PARALLEL' && res.data.printD) {
              this.$log.info(this.$t('Biz.Order.SendOutPrintDataInfo'));
              this.$devices.Printer.print(res.data.printD);
            }
          } else {
            this.$message.error(res.msg);
          }
        } else if (res.printType == 'PRINT_PARALLEL' && res.data.printD) {
          this.$log.info(this.$t('Biz.Order.SendOutPrintDataInfo'));
          this.$devices.Printer.print(res.printD);
        }
      });
    });
  },
  mounted() {
    // 现金等额类快速结算 启动打开牌号修改Dialog, 并向下传递结算方式数据
    this.$von('payOpenChangeOrderCodeBus', (data) => {
      this.payOpenChangeOrderCode(data);
    });
    // 清空已支付金额
    this.$von('clearAmountPaidBus', () => {
      this.paymentData.amountPaid = 0;
    });
    // 电话外卖手动清账单和会员
    this.$von('clearTakoutPhoneBill', () => {
      const { showCrmMember } = this.$refs.billList;
      if (showCrmMember && (showCrmMember.mobile || showCrmMember.cardType || showCrmMember.memberName)) {
        this.$vemit('cancelBindMemberBus'); // 请会员
      }
      this.$vemit('handleClearBills'); // 清品项
      this.$vemit('fastFoodSetRemarkShow'); // 清备注
    });
  },
  methods: {
    ...mapMutations('fastFood', [
      'SetSaleActiveState',
      'setOrderCode',
    ]),
    ...mapMutations({
      setSelectDiscountPlanData: 'SET_SELECT_DISCOUNTPLAN_DATA',
      setPosFastfoodData: 'SET_POS_FASTFOOD',
    }),
    ...mapActions([
      'setSelectVoucherData',
      'setSelectCrmData',
    ]),
    ...mapActions('fastFood', [
      'checkcontainkds',
    ]),
    deleteItem() {
      this.$emit('deleteItem');
    },
    // 滚动到底部
    scrollToEnd() {
      this.$refs.billList.scrollToEnd();
    },
    // 堂食外卖外带模式切换
    saleToggle(index) {
      this.SetSaleActiveState(index);
      // 牌号设置-'自动': 堂食,外带均为接口数据更新牌号
      if (this.posFastFood.bsOrderCodeMode == '1') {
        this.loadNewOrderCode((data) => {
          this.setOrderCode(data);
        });
      } else if (this.posFastFood.bsOrderCodeMode == '2') {
      // 牌号设置-'手动': 所有销售类型均不更新,使用手动填入牌号
        this.setOrderCode('');
      } else if (this.posFastFood.bsOrderCodeMode == '3') {
      // 牌号设置-'自动+手动': 外带外卖均为接口数据更新牌号, 堂食需要手动设置赋值为 ''空
        if (index == 0) {
          this.setOrderCode('');
        } else {
          this.loadNewOrderCode((data) => {
            this.setOrderCode(data);
          });
        }
      }
    },
    // 查询后台设置的牌号接口
    loadNewOrderCode(callback) {
      // 使用 延迟进行牌号查询(因为vux中bsId数据分发有延迟)
      setTimeout(() => {
        ajax('canyin.pos.bill.findautoordercode', {
          params: {
            bsId: this.$parent.cacheBsId,
          },
        }).then((data) => {
          if (callback) {
            callback(data);
          }
        });
      }, 400);
    },
    // 修改套餐
    modifyItemPackage() {
      this.$emit('modifyItemPackage');
    },
    // 合计和待支付的计算显示
    fastfoodBillLastTotal(fastfoodTotalData) {
      // 优惠之前的合计orderingItemTotalPrice // 加单最终的合计orderingItemLastTotalPrice
      this.paymentData.total = this.wipe(fastfoodTotalData.orderingItemLastTotalPrice);
      // 计算下抹零的优惠
      this.wipeMoney = sub(fastfoodTotalData.orderingItemLastTotalPrice, this.wipe(fastfoodTotalData.orderingItemLastTotalPrice));
      // 给副屏添加一个
      this.$set(fastfoodTotalData, 'wipeMoney', this.wipeMoney); // 抹零的金额
      this.$set(this.paymentData, 'total', this.wipe(fastfoodTotalData.orderingItemLastTotalPrice)); // 合计
      this.$set(this.paymentData, 'stayPayMoney', sub(this.wipe(fastfoodTotalData.orderingItemLastTotalPrice), this.paymentData.amountPaid)); // 待支付
      // 快餐副屏
      if (this.posDevice.enableVice) {
        // 合计 应收 实收 优惠
        this.$devices.SubMonitor.send({
          moduleName: 'SubMonitor',
          method: 'fastFoodAddOrder',
          result: fastfoodTotalData,
        });
      }
    },
    // 抹零
    wipe(price) {
      // 新增'抹零'设置功能:快餐账单显示的结算金额数据,是由前台计算完成,所以根据后台返回的'抹零'状态,执行显示内容;
      // (即不执行或取消抹零时,强制将前台显示抹零参数设置为4,'合计和待支付'金额功能会联动变化);
      // (wipeFlg字段不存在时, 即无抹零规则, 功能不执行);
      // 原功能<马秋瑶>实现,非常好的程序扩展,手动点赞!
      // mode 1: 四舍五入 2：收尾 3：去尾 4：不抹零
      const mode = (this.getFastFoodBillData && this.getFastFoodBillData.bsData.wipeFlg === false)
        ? 4
        : (this.posFastFood.wipeZeroModeKey % 10);
      // 1：无 2：角 3：五元 4：十元 5: 5角
      const position = this.posFastFood.wipeZeroPositionKey % 10;
      const num = round(price);
      if (mode === 4 || mode === 0) return num;
      let dot = 100;
      if (position === 1) {
        dot = 0;
      } else if (position === 2) {
        dot = 1;
      } else if (position === 4) {
        dot = -1;
      }
      if (position === 3) return calc5yuan(num, mode);
      if (position === 5) return calc5jiao(num, mode); // 取到5角
      if (mode === 1) return round(num, dot);
      if (mode === 2) return ceil(num, dot);
      if (mode === 3) return floor(num, dot);
      return 0;
    },
    // 给打折优惠的金额重新赋值
    setDiscountMoney(money) {
      this.discountMoney = money;
    },
    // 快餐结算所需数据
    paymentGetBillData() {
      const payData = {
        // point_id: _pointId,
        // bsId: _bsId,
        // isLog: _isLog,
        // isCrmMixSettle: $("#crminformationDiv").is(":hidden") ? '0' : '1',//快餐模式支付是否还有会员卡支付信息
        // fastFoodMemberPriceFlg: BillBsModule.getBsMemberPriceFlg(), // 快餐模式下是否启用会员价
        // printData:JSON.stringify(printData),
        controlMode: '3', //
        items: this.$refs.billList.submitDish(), // 加单的品项列表
        orderCode: this.orderCode, // 牌号
        orderCodeMode: this.orderCodeMode, // 牌号模式
        peopleQty: this.peopleQty, // 人数
        payMoney: this.paymentData.total, // 支付金额
        takeMoney: this.paymentData.total, // 收款金额
        lastTotal: this.paymentData.total, // 折后合计(实收)
        giveMoney: this.paymentData.giveChange, // 找零金额
        giveChange: this.paymentData.giveChange, // 找零
        stayPayMoney: this.paymentData.stayPayMoney, // 待支付金额
        // discountPlanId: '123123123',                     // 折扣优惠方案 id
        // ticketSettleData:  '12312312312',                // 代金券
        ssRemark: this.$refs.billList.ssRemark == `<${this.$t('Dict.BillRemarks')}>`
          ? '' : this.$refs.billList.ssRemark, // 备注
        orderSource: 1, // 来源
        saleTypeId: this.saleActiveState + 1, // 销售类型(堂食外带外卖)
        saleTypeName: this.sale.name[this.saleActiveState],
        tableCode: this.getFastFoodBillData ? this.getFastFoodBillData.bsData.tableCode : '', // 桌号
      };
      return payData;
    },
    OpenChangeOrderCode(paymentData) { // 原有逻辑-弹框
      const data = {
        id: this.getFastFoodBillData.bsData.id, // bs id
        orderCode: this.orderCode, // 牌号
        peopleQty: this.peopleQty, // 人数
        bsOrderCodeMode: this.posFastFood.bsOrderCodeMode, // 牌号-后台设置
        saleTypeVal: this.posFastFood.saleTypeVal, // 销售类型值
        name: this.sale.name, // 销售类型 静态数据
        saleActiveState: this.saleActiveState, // 堂食外带切换状态: 0/1/2 -堂食/外带/外卖
      };
      if (paymentData) data.paymentData = paymentData; // 结算方式类型相关数据
      this.$refs.changeCodeAndQtyDialog.open(data);
    },
    // 结算时打开牌号修改弹窗, 并传来结算方式的数据paymentData, 在执行关闭窗口时, 回调结算方法并传回paymentData
    async payOpenChangeOrderCode(paymentData) {
      if (this.posBaseInfo.isGenerMarkToKDS && this.posFastFood.bsOrderCodeMode === '2') { // 开启kds方案 && 为手动(强制)
        if (this.guestList.length === 0) {
          this.$message.error(this.$t('Biz.Order.NotAllowedModify')); // 不允许修改，请先加单
          return;
        }
        // 请求接口判断加入订单中是否有kds方案的品项
        const isContain = await this.checkcontainkds(this.$refs.billList.submitDish());
        this.OpenChangeOrderCode(paymentData, isContain); // 第二个参数为是否为kds方案
      } else { // 未开启保持原有逻辑
        this.OpenChangeOrderCode(paymentData);
      }
    },
    // 账单底部的活动方案的取消
    cancelDiscout(discoutData) {
      // 如果打折id存在是取消的是打折方案
      if (discoutData.discountPlanId) {
        this.setSelectDiscountPlanData(null); // 清除折扣和优惠
      } else if (discoutData.voucherId) {
        this.setSelectVoucherData({ list: null });
        // 恢复禁点按钮
        this.posFastFood.btns.forEach((item, value) => {
          if (item.isCanClick) {
            delete item.isCanClick;
          }
        });
        this.setPosFastfoodData(this.posFastFood);
        this.$vemit('InitPageBus');
        this.paymentData.amountPaid -= Number(discoutData.price);
        this.paymentData.stayPayMoney = sub(this.wipe(this.paymentData.total), this.paymentData.amountPaid);
      } else if (discoutData.crmId) {
        // 取消会员折扣
        const options = {
          bsId: this.getFastFoodBillData.bsData.id,
          cardKindId: this.getSelectCrmData.cardInfo.cardKindTypeId,
          pointId: this.getFastFoodBillData.bsData.pointId,
          crmFlg: 1,
          teamBsIds: '',
          discTypeParams: '',
          deviceReadCardNo: this.getSelectCrmData.cardInfo.deviceReadCardNo,
          cardNo: this.getSelectCrmData.cardInfo.cardNo,
          flg: 1,
        };
        if (this.getSelectDiscountPlanData) {
          const discTypeParams = {
            bsId: this.getFastFoodBillData.bsData.id,
            pointId: this.getFastFoodBillData.bsData.pointId, // 客位Id
            disctype: 2,
            planid: this.getSelectDiscountPlanData.discountPlanId,
          };
          options.discTypeParams = JSON.stringify(discTypeParams);
        }
        ajax('canyin.pos.settlement.undocrmsettle', {
          contentType: 'URLEncoded',
          data: options,
        }).then((data) => {
          if (data.success) {
            // 刷新账单
            this.$vemit('fastFoodLoadBs', {
              buffetPointId: this.getFastFoodBillData.bsData.pointId,
            });
          } else {
            return false;
          }
          return true;
        });
        this.setSelectCrmData({ list: null });
        // 恢复禁点按钮
        this.posFastFood.btns.forEach((item, value) => {
          if (item.isCanClick) {
            delete item.isCanClick;
          }
        });
        // 调取消会员折扣接口
        this.setPosFastfoodData(this.posFastFood);
        this.$vemit('InitPageBus');
        // 去除菜品按钮遮罩
        this.$vemit('maskLayerFucBus', false);
        // 去除账单功能按钮遮罩
        this.$vemit('maskLayerBus', false);
        this.paymentData.amountPaid -= Number(discoutData.price);
        this.paymentData.stayPayMoney = sub(this.wipe(this.paymentData.total), this.paymentData.amountPaid);
      }
    },
    // 来电话啦
    newCallAtBill(data) {
      if (!this.phoneInfo || this.phoneInfo.takeoutState !== ISHANDLING) {
        this.phoneInfo = data;
      } else {
        this.isNewCallWithHandling = true;
        this.newCallNumberWithHandling = data;
      }
    },
    // 点击处理 变化状态
    handlePhone() {
      this.phoneInfo.takeoutState = ISHANDLING;
      this.$vemit('handleTakeoutPhone', { disable: false, handlingPhone: null });
      this.$vemit('handleTakeoutPhone', { disable: true, handlingPhone: this.phoneInfo }); // 禁用按钮
    },
    // 跳转到来电记录页面
    toPhoneRecord() {
      this.isShowPhoneRecord = true;
      this.isNewCallWithHandling = false; // 取消新来电标识
    },
    // 返回加单页 回显列表最新来电
    backBillAndRefresh(phone, isSuccess) {
      this.isShowPhoneRecord = false;
      this.newCallNumberWithHandling = null;
      // 三种情况赋值：组件 created 时、电话外卖落单成功时、非处理中状态时
      if (!this.phoneInfo || isSuccess || (phone && this.phoneInfo.takeoutState !== ISHANDLING)) {
        this.phoneInfo = phone;
      }
      // 处理中禁用按钮
      this.$vemit('handleTakeoutPhone', { disable: false, handlingPhone: null });
      if (this.phoneInfo.takeoutState === ISHANDLING) {
        this.$vemit('handleTakeoutPhone', { disable: true, handlingPhone: this.phoneInfo });
      }
    },
    // 返回加单页 处理电话
    backBillAndHandle(phone) {
      this.isShowPhoneRecord = false;
      this.newCallNumberWithHandling = null;
      this.phoneInfo = Object.assign(phone, { takeoutState: ISHANDLING }); // 状态变为处理中
    },
    // 取消处理中的来电
    cancelHandlingPhone() {
      this.isNewCallWithHandling = false;
      this.newCallNumberWithHandling = null;
      this.phoneInfo.takeoutState = NOHANDLE; // 修改电话状态
      this.$vemit('handleTakeoutPhone', { disable: false, handlingPhone: null });
      this.$vemit('clearTakoutPhoneBill');
    },
  },
  watch: {
    // 监听vuex中快餐设置数据, 为true后, 执行销售类型 设置为后台设置类型(用于页面初始化时执行)
    'posSettings.saleType': {
      handler(val) {
        this.SetSaleActiveState(this.posSettings.saleType - 1);
      },
      deep: true,
    },
    // 监听合计用于客显显示
    'paymentData.total': {
      handler(total) {
        setTimeout(() => {
          this.$devices.CDI.total(total);
        }, 1000);
      },
    },
    // 监听找零用于客显显示
    'paymentData.giveChange': {
      handler(change) {
        setTimeout(() => {
          this.$devices.CDI.change(change);
        }, 2000);
      },
      deep: true,
    },
    isShowPhoneRecord: {
      handler(isShow) {
        if (isShow === true) {
          this.$vemit('checkPhoneRecord', true);
        } else {
          this.$vemit('checkPhoneRecord', false);
        }
      },
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
//** background color
@pos-order-bill-bg: rgba(255, 255, 255, 0.9);
//主要信息的字体颜色
@main-font-color: #0babb9;
//** shadow
@pos-order-bill-shadow: 0 0 8px @gray-dark;

@pos-order-bill-phoneinfo-height: 64px;

.pos-fastfood-left-content {
  height: 100%;
}
.pos-fastfood-bill {
  position: relative;
  height: 100%;
  padding-bottom: 110px;
  background-color: @pos-order-bill-bg;
  .box-shadow(@pos-order-bill-shadow);
  &.show-phonerecord {
    padding-bottom: 0;
  }
}

.pos-fastfood-bill-main {
  position: relative;
  .square(100%);
  padding: 44px 0;
  >.pos-fastfood-bill-top {
    position: absolute;
    height: 44px;
    width: 100%;
    top: 0;
    left: 0;
    background: #ebf3f4;
    padding: 6px 10px;

    >div {
      height: 32px;
      line-height: 31px;

      >span {
        display: block;
        float: left
      }
    }
    >div:nth-of-type(1) {
      float: left;
      padding: 0 5px;
      border-radius: 5px;
      background-color: #bad7de;
      cursor: pointer;

      >span {
        color: #333333;

        >strong {
          display: inline-block;
          max-width: 34px;
          overflow: hidden;
          vertical-align: top;
          color: @main-font-color;
        }
        > b { color: @main-font-color;}
        &:last-child {
          > strong {
            // max-width: 25px;
          }
        }
      }
      >span:nth-of-type(1) {
        margin-right: 10px;
      }
    }
    >div:nth-of-type(2) {
      float: right;
      margin-left: 2px;
      text-align: center;
      border-radius: 18px;
      border:1px solid #d5d8d8;
      background-color: #f9fbfc;
      > span {
        width: 42px;
        border-radius: 15px;
        color: #999999;
        cursor: pointer;

        &.active {
          background-color: @main-font-color;
          color: #ffffff;
        }
      }
    }
    .span_deposit {
      margin-left: 10px;
    }
  }
  > .pos-fastfood-phone-card{
    position: absolute;
    top: 44px;
    left: 0;
    right: 0;
    width: 100%;
  }
  > .pos-fastfood-phone-record {
    position: absolute;
    top: 44px;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    background: white;
  }
  &.show-phonecard {
    padding-top: 44px + @pos-order-bill-phoneinfo-height;
    padding-bottom: 148px;
  }
  &.has-crmInfo {
    padding-top: 44px + @pos-order-bill-crminfo-height;
    &.show-phonecard {
      padding-top: 44px + @pos-order-bill-crminfo-height + @pos-order-bill-phoneinfo-height;
    }
  }
}

.pos-fastfood-bill-settle-info {
  position: absolute;
  bottom: 0;
  left: 0;
  .size(100%, 148px);
  border-top: 1px solid rgb(153, 153, 153);
  padding: 10px;

  .paymentInfo {
    width: 100%;
    line-height: 1;
    font-size: 0;

    > span {
      width: 47%;
      display: inline-block;
      white-space: nowrap;
      overflow: hidden;
      font-size: 16px;

      &:nth-child(2) {
        margin-left: 10px;

        em {
          color: #0babb9;
        }
      }

      > em {
        vertical-align: text-bottom;
        font-size: 20px;
        font-weight: bold;
        font-style: normal;
      }
    }
  }

  .discountInfo:extend(.paymentInfo) {
    li {
      width: 100%;
      height: 32px;
      display: block;
      margin: 5px 0 0;
      padding: 0 20px 0 6px;
      border-radius: 4px;
      line-height: 32px;
      position: relative;
      color: #fff;
      font-size: 16px;
      background-color: #ddd;
      > span {
        width: 94%;
        white-space: nowrap;
        overflow: hidden;
        display: inline-block;
        text-overflow: ellipsis;
      }
      em {
        font-style: normal;
      }

      .discountInfo-closeBtn {
        display: inline-block;
        width: 24px;
        height: 24px;
        position: absolute;
        right: 6px;
        top: 50%;
        padding: 0 4px;
        line-height: 20px;
        transform: translateY(-50%);
        border-radius: 50%;
        border: 1px solid #fff;
        cursor: pointer;

        > em {
          display: inline-block;
          line-height: 1;
          vertical-align: unset;
          font-size: 14px;
          color: #fff;
        }
      }
    }
  }
}

.lang-enUS {
  .pos-fastfood-bill-top{
    display: flex;
    flex-direction: column;
    padding: 6px 3px;
    > div {
      float: none;
    }
    > div:nth-child(2) {
      > span {
        margin-right: 10px;
        width: auto;
      }
    }
  }
  .pos-order-bill-list{
    margin-top: 30px;
    height: 95%;
  }
}
</style>
