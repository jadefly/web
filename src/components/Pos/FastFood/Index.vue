<template>
  <div class="pos-fastfood-container" :class="posFastFood.xianGuoAddOrderBarType===1?'':'btnHide'">
    <!-- class="pos-fastfood-container" className作为业务逻辑判断的重要参数, 谁改罚谁绩效!!!! -->
    <div class="pos-fastfood-left">
      <!-- 账单列表组件 -->
      <Bill
        @modifyItemPackage="modifyItemPackage"
        @clearItem="clearItem"
        @deleteItem="deleteItem"
        ref="fastFoodBill"
        :isShowStayPayMessage="isShowStayPayMessage"
        :guestList="guestList">
      </Bill>
      <!-- 账单功能按钮组件  需修改??-->
      <BillBtns
        v-if="posFastFood.xianGuoAddOrderBarType===1"
        ref="fastFoodBillBtns"
        :guestList="guestList"
        @control="menuControl"
        :checkGiveState="checkGiveStates"
        :addMenuBtnsTest="partAddMenuBtns"
        ></BillBtns>
    </div>
    <div class="pos-fastfood-right">
      <div class="pos-fastfood-menu">
        <Menu
          ref="menu"
          :guestList="guestList"
          @operation="operation"
          @otherOperation="otherOperation"></Menu>
      </div>
      <div class="pos-fastfood-control"></div>
    </div>
    <!--鲜果平铺模式 xianGuoAddOrderBarType 0平铺显示 1按钮-->
    <div class="tilingBox" v-if="posFastFood.xianGuoAddOrderBarType===0">
      <TilingEdit ref="tilingBox"
      :editData="billCurrentItemList[0]"
      :guestList="guestList"></TilingEdit>
      <div class="tilingMask" v-show="billSelected"></div>
    </div>

    <!-- 加载 账单功能按钮组件 -->
    <FastFoodGive
      ref="fastFoodGive"></FastFoodGive>
    <CancelFastFoodGive
      ref="cancelFastFoodGive"></CancelFastFoodGive>
    <FastFoodChangeNum
      ref="fastFoodChangeNum"></FastFoodChangeNum>
    <FastFoodChangePrice
      ref="orderingChangePrice"></FastFoodChangePrice>
    <FastFoodModifyItemSize
      ref="orderingModifyItemSize"
      type="fastFoodOderingChange"
      submitId="fastFoodModifyItemSizesSubmit"></FastFoodModifyItemSize>
    <FastFoodChangeMethods
      ref="fastFoodChangeMethods"
      type="fastFoodOderingChange"
      submitId="fastFoodChangeMethodsSubmit"></FastFoodChangeMethods>
    <FastFoodPackageNormalChange
      ref="PackageNormalChange"
      type="fastFoodOderingChange"
      submitId="fastFoodPackageNormalChange"></FastFoodPackageNormalChange>
    <FastFoodPackagePartChange
      ref="PackagePartChange"
      type="fastFoodOderingChange"
      submitId="fastFoodPackagePartChange"></FastFoodPackagePartChange>
    <SpellFood
      ref="spellFood"
      submitId="spellFood"></SpellFood>
    <MoreOrderingBtns
      ref="moreOrderingBtns"
      @control="menuControl"
      :moreAddBtnsTest="addMenuBtns"
      :checkGiveState="checkGiveState"></MoreOrderingBtns>
    <Redemption
      ref="redemption"
    ></Redemption>
    <FullGift ref="fullGift" type="fastFood"> </FullGift>
  </div>
</template>

<script>
import {
  mapState, mapGetters, mapMutations, mapActions,
} from 'vuex';
import {
  each,
  find,
  extend,
  indexOf,
  findLast,
  filter,
  uniqueId,
  reduce,
  cloneDeep,
  concat,
  startsWith,
  map,
  groupBy,
} from 'lodash';
import * as itemConstantSet from '@/common/dictionary/pos-ordering-item-constant-set.js';
import ajax from '@/common/js/ajax';
import Menu from './Menu';
import Bill from './Bill';
import BillBtns from './BillBtns';
import { add, sub, multi, round } from '@/common/js/math.js'; // 这是加/减/
// 异步组件
// 平铺-修改品项
const TilingEdit = () => import('@/components/Pos/FastFood/Bill/TilingEdit');
// 赠菜
const FastFoodGive = () => import('@/components/Pos/Business_commons/OrderingGive');
// 取消赠送
const CancelFastFoodGive = () => import('@/components/Pos/Business_commons/CancelGive');
// 数量
const FastFoodChangeNum = () => import('@/components/Pos/Business_commons/ChangeNum');
// 价格ChangePrice
const FastFoodChangePrice = () => import('@/components/Pos/Business_commons/ChangePrice');
// 规格orderingModifyItemSize
const FastFoodModifyItemSize = () => import('./Menu/ItemSize');
// 做法
const FastFoodChangeMethods = () => import('@/components/Pos/Business_commons/OrderingChangeMethods');
// 更多
const MoreOrderingBtns = () => import('@/components/Pos/Ordering/OrderingBtnsFunc/MoreOrderingBtns');
// 修改 常规套餐
const FastFoodPackageNormalChange = () => import('./Menu/Package/PackageNormal');
// 修改 宴会套餐
const FastFoodPackagePartChange = () => import('./Menu/Package/PackagePart');
// 拼菜
const SpellFood = () => import('@/components/Pos/Ordering/OrderingBtnsFunc/SpellFood');
// 换购
const Redemption = (resolve) => {
  import('@/components/Pos/Business_commons/Redemption/index').then((module) => {
    resolve(module);
  });
};
// 满赠
const FullGift = (resolve) => {
  import('@/components/Pos/Business_commons/FullGift/index.vue').then((module) => {
    resolve(module);
  });
};

export default {
  name: 'fastfood',
  components: {
    Menu, // 右侧 菜单列表及底部功能按钮
    Bill, // 左侧 账单
    BillBtns, // 账单功能按钮
    FastFoodGive, // 按钮-赠菜
    CancelFastFoodGive, // 按钮-取消赠送
    FastFoodChangeNum, // 按钮-数量
    FastFoodChangePrice, // 按钮-价格
    FastFoodModifyItemSize, // 按钮-规格
    FastFoodChangeMethods, // 按钮-做法
    FastFoodPackageNormalChange, // 常规套餐的修改
    FastFoodPackagePartChange, // 宴会套餐的修改
    SpellFood, // 拼菜
    MoreOrderingBtns, // 更多
    Redemption,
    FullGift, // 满赠
    TilingEdit,
  },
  data() {
    return {
      first: true,
      eaters: [], // 自助餐-客人类型列表
      clock: true,
      // loading变量
      billLoading: null,
      guestList: [],
      // 缓存bsId(因为vuex分发数据太慢)
      cacheBsId: '',
      activeMenuItem: null,
      checkGiveState: '',
      panelHotKey: {},
      checkHalfState: false,
      lastTime: null, // 输入框的时间
      nextTime: null, // 输入框的下一个时间
      //         hotKey: this.posFastFood.fastFoodIsHiddenShortcutKeys ? '' : 'F11.ctrl',
      // hotKetTip: this.posFastFood.fastFoodIsHiddenShortcutKeys ? '' : '(Ctrl+F11)',
      // moreBtns: [],
    };
  },
  created() {
    // 账单信息
    /* 回调参数: data-为对象形式
     * { buffetPointId:'', give:'', existedData:''}
     */
    this.$von('closeFastfoodLoading', () => {
      // 增加个判断存在才关闭
      if (this.billLoading) {
        this.billLoading.close();
      }
    });
    this.$von('fastFoodLoadBill', (data, response) => {
      this.setRefreshBs(false);
      const res = response.data.data;
      // 防止刷新页面把已添加的会员卡信息丢失
      if (res && res.crmData) {
        const resCrmData = res.crmData;
        const crmData = {
          name: this.$t('Dict.MemberCard'),
          price: resCrmData.consumeAllMoney,
          crmId: 'crm7',
          disBgc: '#e7bf58', // 写死色值, [0]固定为折扣, [1]固定为优惠, [2]固定为混合结算
          cardInfo: {
            cardNo: resCrmData.cardNo,
            consumeMoney: resCrmData.consumeMoney,
            consumeScore: resCrmData.consumeScore,
            consumeTicketMoney: resCrmData.consumeTicketMoney,
            cardKindTypeId: resCrmData.cardKindTypeId,
            deviceReadCardNo: resCrmData.deviceReadCardNo,
          },
        };
        // 会员卡数据
        this.setSelectCrmData({ list: crmData });
        // 添加crm相关禁点按钮
        this.$vemit('crmSetDisablebtnBus');
      }
      // 缓存 bsId(bsData.id)
      this.cacheBsId = res.bsData.id;
      // existedData替换res => 渲染废单重结后的品项数据 如果existedData存在证明是通过废单重结过来的那么数据要被替换掉
      if (data.existedData) {
        res.scList = data.existedData;
      }
      // 清空当前缓存的账单数据
      this.guestList = [];
      this.setRefreshBs(true);
      if (!data.option || !data.option.dontClearRemark) {
        // 初始化下整单备注
        this.$vemit('fastFoodSetRemarkShow', false);
        // 初始化结算备注
        this.$vemit('clearSettlementRemark');
      }
      // 执行牌号初始化(或重置)业务
      // 如果是结算后自动生成牌号模式
      if (this.posFastFood.bsOrderCodeMode === '4') {
        this.setOrderCode('');
      } else {
        this.executeOrderCode(res.bsData, res.scList.length);
      }
      this.eaters = cloneDeep(res.bsData.eaters);
      this.setPeopleQty(res.bsData.peopleQty);// 设置更新vuex中账单数据
      this.setFastFoodBillData(res);
      // 关闭-快餐进入的loading
      this.$vemit('closeFastfoodLoading');

      // 如果存在已提交的账单,进行左侧账单回显 isDomemberPrice 当前的营业流水是否执行了会员价
      res.scList.length
      && this.backShowBill(cloneDeep(res.scList), this.isDomemberPriceFn(res), res);

      // 如果当前的营业流水执行了会员价就是res.bsData.memberPriceFlg 为true要改变下按钮这行会员价状态
      this.$refs.menu.$refs.payAndDiscount
        && (this.$refs.menu.$refs.payAndDiscount.memberPriceToggle = null);
      // 会员价按钮状态 设置
      if (res.bsData.memberPriceFlg && this.$refs.menu.$refs.payAndDiscount) {
        setTimeout(() => {
          this.$refs.menu.$refs.payAndDiscount.memberPriceToggle = true;
        }, 300);
      }

      // 如果存在打折活动方案,回显执行打折
      if (res.discountPlanId != ''
        && res.discountPlanId
        && this.posFastFood.discountPlanList
      ) {
        this.posFastFood.discountPlanList.forEach((list) => {
          // 前端显示的打折只针对第N杯打折
          if (`${list.discountPlanId}` === `${res.discountPlanId}` && list.discMode === 1) {
            // 更新vuex
            this.setSelectDiscountPlanData(list);
          }
        });
      } else {
        // 更新vuex
        this.setSelectDiscountPlanData(null);
      }
      // 设置更新会员信息(已验证会员的会员价或N杯打折)vux数据
      // 上传VUx,修改标识: memberDiscountId==1,更新为打折信息, ==2更新为会员价信息, crmMemberQueryData.data不存在时清空
      setTimeout(() => {
        this.$vemit('setMemberInfo', res.crmMemberQueryData.data);
      }, 300);
      if (res.crmMemberQueryData.data) {
        this.setFastFoodMemberPlanFlg({
          data: {
            isDoMemberPrice: res.crmMemberQueryData.data.memberDiscountId == 2, // 是否已执行会员价
            isDoNcupPlan: res.crmMemberQueryData.data.memberDiscountId == 1, // 是否已执行N杯打折
            nCupDiscountPlanId: res.discountPlanId, // N杯打折的方案ID
          },
        });
      } else {
        this.setFastFoodMemberPlanFlg({
          data: {
            isDoMemberPrice: false,
            isDoNcupPlan: false,
            nCupDiscountPlanId: null,
          },
        });
      }

      // 处理为延迟执行 更新牌号(根据后台传值)
      setTimeout(() => {
        // 处理后台的账单金额信息
        this.$vemit('fastFoodCoverListTotalInfo', (data.option && data.option.fromSettle) ? res.bsData : null);
      }, 300);
      // 执行传回的找零金额赋值如果存在就赋值否则为0
      this.$refs.fastFoodBill.paymentData.giveChange = data.give || 0;

      // AI图片识别操作
      this.$vemit('fastfoodMenuListInitPager', this.posBaseInfo.isEnableAIAddorder && !res.scList.length);
    });
  },
  mounted() {
    this.$von('fastFoodEasyDelete', (item) => {
      const lastItem = this.$refs.fastFoodBill.$refs.billList
        && this.$refs.fastFoodBill.$refs.billList.getLastGuestList();
      const guestList = cloneDeep(this.guestList);
      if (lastItem) {
        const active = {
          lid: lastItem.lid,
          id: lastItem.id,
          sizeId: lastItem.sizeId,
          discFlg: parseInt(lastItem.discFlg, 10),
          reasonId: lastItem.reasonId,
          priceType: lastItem.priceType,
        };
        if (item.isLimit) {
          this.resetItemLimitsMap(item, 'sub', item.num);
        }
        for (let i = 0; i < guestList.length; i += 1) {
          setTimeout(() => {
            if (guestList[i].TagID === item.TagID) {
              const index = this.guestList.findIndex(items => items.TagID === item.TagID);
              this.guestList.splice(index, 1);
            }
          }, 200);
        }
        setTimeout(() => {
          this.setActiveItem(active);
        }, 200);
      }
    });
    // isForbiddenEditBillAmount 争鲜不允许修改账单金额设置    1开启；0未开启
    // 监听事件：点击菜单非套餐非多规格内单个品项 加单的时候要判断下当前是否使用了打折活动方案了,如果存在不能进行加单操作
    this.$von('fastFoodPosOrderAddDish', (addData) => {
      if (this.getSelectDiscountPlanData) {
        this.$message.warning(`${this.$t('Biz.Order.CancelDiscountMsg')}${this.getSelectDiscountPlanData.discountPlanName}`);
        return;
      }
      // 争鲜不允许修改账单金额设置    1开启；0未开启 就是不允许加单
      if (this.posFastFood.isForbiddenEditBillAmount) {
        this.$message.warning(this.$t('Biz.Order.CannotMdBillAmountMsg'));
        return;
      }
      const { item, beforeAddNum } = addData;
      if (addData && item.sizeList) {
        addData.item.sizeList.forEach((t) => {
          t.is_default = false;
          if (addData.item.sizeId === t.size_id) t.is_default = true; // 规格选中项
        });
      }
      if (item.minAddQty && item.promoteLimit) {
        // 当前账单上当前添加促销菜品的总数量
        const promoteNum = this.handleTotalItemNum(item);
        if (item.promoteLimit - promoteNum >= item.minAddQty || promoteNum === item.promoteLimit) {
          if (item.count === 0 && beforeAddNum < item.minAddQty) {
            const addDataItem = Object.assign({}, item, { num: item.minAddQty });
            this.add(Object.assign({}, addData, { item: addDataItem }));
          } else {
            // 判断下当前是否是验证会员
            if (
              this.getFastFoodMemberPlanFlg
              && this.getFastFoodMemberPlanFlg.isDoMemberPrice
              && (item.memberPrice || item.memberPrice === 0)
            ) {
              copyItem.promotePrice = null;
            } else {
              copyItem.discFlg = 0;
              copyItem.priceType = 1;
              copyItem.price = item.salePrice;
              copyItem.promotePrice = null;
              copyItem.defaultPriceType = 1;
            }
            // 保存一份
            copyItem.copyPromotePrice = item.promotePrice;
            this.$set(addData, 'item', copyItem);
            this.billPromoteLimit(addData);
          }
        } else {
          this.billPromoteLimit({ ...addData, item });
        }
        return;
      }
      this.billPromoteLimit(addData);
    });
    this.$von('orderingJudge', () => !this.guestList.length);
    // 挂载 账单列表FastFoodList(ref=billList) 回调执行夸组件方法
    this.$von('changeActiveItemBUS', (saveDate = null) => {
      if (saveDate) { // 鲜果-点击左侧list品项时，添加做法和规格存储
        const idx = this.billCurrentIndex;
        if (saveDate.methodsInfo) this.$set(this.guestList[idx], 'methodsInfo', saveDate.methodsInfo.data); // 接口返回所有做法数据
        if (saveDate.sizeList) this.$set(this.guestList[idx], 'sizeList', saveDate.sizeList); // 接口返回规格数据
        // 限量数据
        if (saveDate.limitData) {
          this.guestList[idx] = Object.assign({}, this.guestList[this.billCurrentIndex], saveDate.limitData);
        }
      }
      // 执行, 改变 账单按钮功能是否禁用状态
      // this.changeActiveItem();
    });
    this.$von('fastFoodHandleAddMenuItem', (finded) => {
      this.handleAddMenuItemFn(finded);
    });
    this.$von('handleLoginOut', (callback) => {
      if (this.guestList.length !== 0) {
        this.$confirm(this.$t('Biz.Order.ClearBillWarnMsg'), this.$t('Dict.Tips'), {
          confirmButtonText: this.$t('Dict.Sure'),
          cancelButtonText: this.$t('Dict.Cancel'),
          type: 'warning',
          // closeOnPressEscape: false,
        }).then(() => {
          this.$vemit('leaveFastFood');
          this.removebill().then((data) => {
            if (data.success) {
              this.clearLimitsItem();
              callback();
            }
          });
        });
      } else {
        this.removebill().then((data) => {
          if (data.success) {
            callback();
          }
        });
      }
    });
    // 手动清空账单
    this.$von('handleClearBills', () => {
      this.clearLimitsItem();
      this.guestList.splice(0, this.guestList.length);
    });
    // 换购
    this.$von('handleChangeRedemFn', (data) => {
      this.redemption(data.tag, data.paymentItems, data.exchangeMode, data.activeItem || null);
    });
    // 满赠
    this.$von('handleGoFullGift', (params = null) => {
      this.addFullGift(params);
    });
  },
  watch: {
    billSelected(val) {
      if (val) { // 平铺展示时
        this.$hotKey.set('bilingEdit', {}); // 关闭快捷键
      } else {
        this.$hotKey.removeCurrentModule('bilingEdit');
      }
    },
    'posFastFood.btns': {
      handler(data) {
        if (data.length) {
          const fastBtns = data;
          const hotkey = {};
          fastBtns.forEach((item) => {
            if (item.hotKey) {
              hotkey[item.hotKey] = () => {
                this.$vemit('handlefastPanleBtn', item);
              };
            }
          });
          this.panelHotKey = hotkey;
        }
      },
    },
    partAddMenuBtns(data) {
      if (data && this.clock) {
        // 快捷键的设定
        this.$hotKey.set('Pos.fastFood', {
          // 回车进行加单操作
          // Enter: (event) => {
          //   this.$vemit('fastfoodMenuAddActiveItem');
          // },
          // esc 返回清空下快速查找的助记符
          Esc: () => {
            this.$vemit('fastfoodMenuClearSearchText');
          },
          BackSpace: () => {
            this.$vemit('fastfoodDelTableSearchTextdInBlur');
          },
          // 测试用,注意不能占用生产业务快捷键
          'Y.ctrl.alt': () => {
            console.log(this.guestList);
          },
          '↑': () => {
            this.$vemit('fastfoodMenuSelect', '↑');
          },
          '↓': () => {
            this.$vemit('fastfoodMenuSelect', '↓');
          },
          '←': () => {
            this.$vemit('fastfoodMenuSelect', '←');
          },
          '→': () => {
            this.$vemit('fastfoodMenuSelect', '→');
          },
          ...this.setMenuBtnHotKey(this),
          ...this.setKeySearchHotKey(),
          ...this.panelHotKey,
        });
        this.clock = false;
      }
    },
    guestList: {
      handler(val, oldval) {
        // 不知道谁写的我看了下 加下注释： 这代表的是否是废单重结
        if (this.getIsExitData) {
          val.forEach((v) => {
            const limitData = this.getVuexItemLimitsMap[`${v.id}_${v.sizeId}`];
            if (limitData) {
              v.limit = limitData.restQuantity;
            }
            if (v.itemSizeId !== '-1') {
              v.isLimit = true;
              if (this.getVuexItemLimitsMap[`${v.id}_${v.sizeId}`]) {
                v.limitTotal = this.getVuexItemLimitsMap[`${v.id}_${v.sizeId}`].maxLimit;
                this.resetItemLimitsMap(v, 'add', v.num);
              }
            }
          });
          this.setIsExitData(false);
        }
        this.buffetSetQty(val, oldval); // 开启自助餐 匹配客人类型更新人数
        // 改变加单和未加单的状态 只有在两个极限就是val.length发生变化的时候才处理
        if (!oldval.length && val.length || (oldval.length && !val.length)) {
          this.$vemit('changeOrderingState', !val.length);
        }
        if (!val.length) {
          this.activeMenuItem = null;
        } else { // 关闭AI图像识别定时器
          this.clearTimerImgDetect();
        }
      },
      deep: true, // 深度监听
    },
  },

  computed: {
    ...mapState({
      itemInfo: state => state.pos.itemInfo,
      payPageOpen: state => state.pos.payPageOpen,
    }),
    ...mapState('fastFood', [
      'saleActiveState',
      'billCurrentIndex',
      'billCurrentElId',
      'billSelected',
      'isLimitOrSellout'
    ]),
    ...mapGetters('fastFood', ['saleTypeId']),
    ...mapGetters(['posBaseInfo',
      'itemsMoreBarcode',
      'packMethod',
      'getCustomFastFoodMenuBtn',
      'posFastFood',
      'getFastFoodBillData', 'posInfo',
      'getSelectDiscountPlanData',
      'getFastFoodMemberPlanFlg',
      'posSettings',
      'getVuexItemLimitsMap',
      'getIsExitData',
      'getisSetUpGroupMethod',
      'getSettlementBillMap',
      'haveLimitSmallClasses',
      'getActiveOrderItemSmClsTotal',
      'posBaseInfo',
      'getVuexPromoteItemLimitsMap',
    ]),
    billCurrentItem() { // ??json
      const idx = this.billCurrentIndex || 0;
      const item = this.billCurrentElId ? this.getItemData(idx) : null;
      return item;
    },
    // 加单列表中筛选出 所选品项的列表 这个是个数组 因为把改量和+的都已push的形式添加进去的渲染的时候在Bill文件夹下的List.vue里又新根据lid 和uid重新合并一起
    billCurrentItemList() { // 原-getActiveList()
      if (!this.guestList.length) return [];
      return filter(this.guestList, this.billCurrentItem);
    },
    // 由于刷新的时候接口后请求造成的时间差
    isShowStayPayMessage() {
      // 是否显示待支付信息
      let isShow = false;
      if (this.guestList.length
        || (this.getFastFoodBillData && this.getFastFoodBillData.scList.length)
      ) {
        isShow = true;
      }
      return isShow;
      // isShowStayPayMessage: false,
    },
    moreBtns() {
      const btns = {
        name: 'moreOrderingBtns',
        text: this.$t('Dict.Btn.More'),
        hotKey: 'F11.ctrl',
        hotKetTip: '(Ctrl+F11)',
        disabled: true,
      };
      if (this.posFastFood && this.posFastFood.fastFoodIsHiddenShortcutKeys) {
        this.$set(btns, 'hotKetTip', '');
      }
      return btns;
    },
    fastFoodAuthority() {
      return this.getCustomFastFoodMenuBtn;
    },
    addMenuBtns() {
      // const activeItem = this.getActiveList()[0];
      const activeItem = this.billCurrentItemList[0];
      let checkGiveState = '';
      if (activeItem) {
        checkGiveState = +activeItem.discFlg === 1 ? 'cancelGive' : 'give';
      }
      return map(this.fastFoodAuthority, (item) => {
        let disabled = false;
        let { text, name } = item;
        if (name === 'redemption') { // 换购
          disabled = !item.hasNoAuth;
        } if (name === 'addOrderByAI') { // AI智能加单
          if (!this.posBaseInfo.isEnableAIAddorder) {
            disabled = false;
          } else {
            disabled = !item.hasNoAuth;
          }
        } else if (!item.hasNoAuth && activeItem) {
          switch (item.name) {
            case 'give': // 赠菜或者取消赠菜
              disabled = activeItem;
              text = checkGiveState === 'cancelGive' ? this.$t('Dict.Btn.CancelGive') : this.$t('Dict.Btn.GiveDish');
              name = checkGiveState;
              break;
            case 'changeHalfNum':// 半份
              disabled = activeItem.enableHalf && !activeItem.minAddQty;
              break;
            case 'changeItemMethods':// 做法
              disabled = activeItem && !activeItem.isPackage;
              break;
            case 'addItemNum':// +
              disabled = activeItem
                && !this.handleisHasMorePromotionItem(activeItem);
              break;
            case 'clearItem':// 清空
              disabled = this.guestList && this.guestList.length;
              break;
            case 'spellFood':// 拼菜
              disabled = this.guestList.length && activeItem ? activeItem.isPincai : null;
              break;
            case 'pack':// 打包
              disabled = activeItem && !activeItem.isPackage;
              text = activeItem && activeItem.isPack ? this.$t('Biz.Order.CancelPacking') : this.$t('Dict.Btn.Pack');
              break;
            case 'moreOrderingBtns': // 更多
              disabled = true;
              break;
            default:
              disabled = activeItem;
              break;
          }
          // 满赠的按钮显示情况
          if (activeItem && activeItem.fullGiftId) {
            if (item.name === 'deleteItem' || item.name === 'addFullGift') {
              disabled = true;
            } else {
              disabled = false;
            }
          }
        } else {
          disabled = false;
        }
        // 如果是 换购促销的品项  item.exchangeMode === 0
        if (activeItem && activeItem.exchangeId) {
          disabled = false;
          if (name === 'redemption') {
            disabled = !item.hasNoAuth;
          }
          if (activeItem.exchangeMode === 0 && item.name === 'deleteItem') {
            disabled = true;
          }
        }
        return Object.assign({}, item, { disabled, text, name });
      });
    },
    partAddMenuBtns() {
      return this.addMenuBtns.length > 11
        ? this.addMenuBtns.slice(0, 10).concat(this.moreBtns)
        : this.addMenuBtns;
    },
    checkGiveStates() {
      // const finded = find(this.guestList, this.activeMenuItem);
      const finded = this.billCurrentItemList.length ? this.billCurrentItemList[0] : null;
      if (finded) {
        return finded.discFlg == 1 ? 'cancelGive' : 'give';
      }
      return '';
    },
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (from.path === '/pos' || from.path === '/') {
        vm.clock = true;
        // 等待加载'getFastFoodBillData'数据loading
        vm.billLoading = vm.$loading({
          target: '.pos-fastfood-container',
          text: '',
          background: 'rgba(0, 0, 0, 0)',
          spinner: 'ajax-loading-none',
          customClass: 'ajax-loading',
        });
        // 如果不是首次登录需要调这个，防止在其他路由下（列如预点）点击刷新后返回到点餐界面
      } else {
        vm.$emit('testingFastFoodStatus', null, true);
      }
      if (to.path == '/pos/fastFood') {
        vm.$vemit('fastFoodLoadEasyList');
      }
      // 清空所搜框的助记符'
      vm.$vemit('fastfoodMenuClearSearchText');
      // 每次进来初始化下品项按钮的选中样式
      vm.$vemit('fastfoodInitActiveItem');
      // 每次进来初始化下菜品的分页组件
      // vm.$vemit('fastfoodMenuListInitPager');
      // 刷新筛选分页
      vm.$vemit('fastMenuFilterPagerRefresh');
    });
  },
  // beforeRouteLeave(to, from, next) {
  //   // 电话外卖不进行提示，直接空品项
  //   if (this.guestList.length !== 0 && to.path !== '/pos/takeout/handling' && to.name !== 'deskIndex') {
  //     this.$confirm(this.$t('Biz.Order.ClearBillWarnMsg'), this.$t('Dict.Tips'), {
  //       confirmButtonText: this.$t('Dict.Sure'),
  //       cancelButtonText: this.$t('Dict.Cancel'),
  //       type: 'warning',
  //       // closeOnPressEscape: false,
  //     }).then(() => {
  //       this.$vemit('leaveFastFood');
  //       this.removebill();
  //       next();
  //     }).catch(() => {});
  //   } else {
  //     if (to.name !== 'deskIndex') {
  //       this.removebill();
  //     }
  //     next();
  //   }
  // },
  methods: {
    ...mapMutations('fastFood', [
      'SetSaleActiveState',
      'setPeopleQty',
      'setOrderCode',
      'setBuffetDeposit',
    ]),
    ...mapMutations({
      clearTimerImgDetect: 'clearTimerImgDetect',
      setRefreshBs: 'SET_RERFESHBS',
      setETagItems: 'SET_ETAG_ITEMS',
      setFastfoodMenuBtns: 'SET_FASTFOOD_MENU_BTNS',
      setFastFoodBillData: 'SET_FASTTFOODBILL_DATA',
      setSelectDiscountPlanData: 'SET_SELECT_DISCOUNTPLAN_DATA',
      setLimitsMap: 'SET_ITEMLIMITSMAP',
      setIsExitData: 'IS_EXIT_DATA',
      setItemInfo: 'SET_ITEM_INFO',
      setPayPageOpen: 'setPayPageOpen',
    }),
    ...mapActions('fastFood', [
      'checkcontainkds',
    ]),
    /** 换购
    // 加单 每单促销限量的判断
    /**
     * isHandlePromoteLimit 代表在限量总数已判断过最小加单数就不要在重复判读
     */
    billPromoteLimit(addData) {
      this.tmpAddData = addData;
      const { item, beforeAddNum } = addData;
      // 如果当前每单促销限量数大于每日可售数量话直接加单
      const everyDayPromoteLimit = this.getVuexPromoteItemLimitsMap[`${item.id}_${item.sizeId}_${item.promotePlanId}`];
      // 如果当前点的菜属于非每日限量的 后者是每日限量可售数大于每单促销限量数才走以下逻辑
      if (!everyDayPromoteLimit || everyDayPromoteLimit.restQuantity > item.promoteLimit) {
        if (item.minAddQty && item.promoteLimit && !item.isHandlePromoteLimit) {
          // 当前账单上当前添加促销菜品的总数量
          const promoteNum = this.handleTotalItemNum(item);
          if (item.promoteLimit - promoteNum >= item.minAddQty || promoteNum === item.promoteLimit) {
            if (item.count === 0 && beforeAddNum < item.minAddQty) {
              const addDataItem = Object.assign({}, item, { num: item.minAddQty });
              this.add(Object.assign({}, addData, { item: addDataItem }));
            } else {
              this.add(addData);
            }
          } else {
            for (let index = 0; index < item.minAddQty; index += 1) {
              const addDataObj = Object.assign({}, item, { num: 1 });
              this.add(Object.assign({}, addData, { item: addDataObj }));
            }
          }
        } else if (item.num > item.promoteLimit && item.promoteLimit !== 0 && !item.isPackage) {
          for (let index = 0; index < item.num; index += 1) {
            const addDataObj = Object.assign({}, item, { num: 1 });
            this.add(Object.assign({}, addData, { item: addDataObj }));
          }
        } else {
          this.add(addData);
        }
      } else {
        this.add(addData);
      }
    },
    // 满赠查询数据
    addFullGift(items = null) {
      const params = items || this.$refs.fastFoodBill.$refs.billList.submitDish();
      ajax('canyin.pos.settlement.getdiscplanbyfullgift', {
        contentType: 'paramsEncoded',
        data: {
          items: params,
        },
      }).then((res) => {
        // 如果是从结算过如果不满足满赠条件直接去结算
        if (items && !res.fullGiftList.length) {
          this.$vemit('handleRedemptionClose', true);
        } else {
          this.goToFullGift(res, !!items);
        }
      });
    },
    // 满赠 isComeSettle 是否来自点解结算弹框过来的
    goToFullGift(data, isComeSettle) {
      // getdiscplanbyfullgift
      // 回显显示
      const addFullGiftList = this.guestList.filter(item => item.fullGiftId);
      let tableActiveIndex = 0;
      if (addFullGiftList.length) {
        for (let i = 0; i < data.fullGiftList.length; i += 1) {
          if (data.fullGiftList[i].fullGiftId === addFullGiftList[0].fullGiftId) {
            tableActiveIndex = i;
            break;
          }
        }
      }
      this.$refs.fullGift.open({
        ...data, tableActiveIndex, addFullGiftList, isComeSettle,
      }, {
        submit: (params) => {
          this.guestList = this.guestList.filter(item => !item.fullGiftId);
          // 销售方案不存在的
          const noFindItems = [];
          params.forEach((list) => {
            const item = this.itemsMoreBarcode.find(items => `${items.id}_${items.sizeId}` === `${list.itemId}_${list.sizeId}`);
            if (item) {
              this.add({ item: Object.assign({}, item, list), beforeAddNum: false });
              // this.add({ item: Object.assign({}, item, redeItem), beforeAddNum: false });
            } else {
              noFindItems.push(list.itemName);
            }
          });
          setTimeout(() => {
            this.setActiveItem();
          }, 0);
          if (noFindItems.length) {
            this.$message.error(`${noFindItems.join(',')}${this.$t('Biz.Order.TheItemNotExist')}`);
          } else if (isComeSettle) {
            // 如果是来自结算需要去结算
            setTimeout(() => {
              this.$vemit('handleRedemptionClose', true);
            }, 0);
          }
        },
      });
    },
    ...mapMutations('fastFood', ['setIsLimitOrSellout', 'SET_BILLCURRENTITEM']),
    ...mapActions('fastFood', ['getMethodsInfo',
      'getSizeData', // 获取规格接口
    ]),
    ...mapActions(['setFastFoodMemberPlanFlg', 'setSelectCrmData']),
    // 换购
    /**
     * data Boolean 代表是否是点击结算过来的需要调换购的弹框
     * paymentItems 代表加单的菜的数据
     * exchangeMode 换购模式 按单金额还是按数量 0 -加单金额 1- 品项数量
     * activeItem 对象代表是满足单品数量换购的品项
     */
    async redemption(data = false, paymentItems, exchangeMode = 0, activeItem) {
      // 请求接口判断加入订单中是否有kds方案的品项
      if (this.posBaseInfo.isGenerMarkToKDS && this.posFastFood.bsOrderCodeMode === '2' && paymentItems && exchangeMode === 0) { // 开启kds方案 && 为手动(强制)
        await this.checkcontainkds(paymentItems);
      }
      const params = paymentItems || this.$refs.fastFoodBill.paymentGetBillData().items;
      ajax('canyin.pos.settlement.getdiscplanbyexchange', {
        contentType: 'paramsEncoded',
        data: {
          items: params,
          exchangeMode,
        },
      }).then((res) => {
        if (data && !res.exchangeList.length) {
          this.$vemit('handleRedemptionClose');
        } else {
          // 是 提交加单时自动触发的 如果长度为0 就直接返回
          if (!res.exchangeList.length) {
            this.$message.error(this.$t('Biz.Order.RepurchasePlanTip07'));
            return false;
          }
          const { exchangeList } = res;
          // 按加单金额
          if (exchangeMode === 0) {
            this.moneyRedemption(data, exchangeList);
          } else {
            this.singleNumRedemption({ data, activeItem, exchangeList });
          }
        }
      });
    },
    /**
     * data 代表的是是否是通过结算弹框过来的
     */
    // 单品数量换购
    singleNumRedemption(redemptionData) {
      const { data, exchangeList, activeItem } = redemptionData;
      let exchangeIndex = 0;
      let redeItems = []; // 代表也添加的换购品项
      let redemptionNum = 0; // 已包含换购品项条数
      if (activeItem.redemptionNum || activeItem.redemptionNum === 0) {
        redemptionNum = activeItem.redemptionNum;
      } else {
        redemptionNum = this.guestList.slice(activeItem.index + 1).filter(list => (list.mergeScId && list.mergeScId === activeItem.scId && list.exchangeId)).length;
      }
      const startIndex = activeItem.index + 1;
      const endIndex = startIndex + redemptionNum;
      const filterItems = this.guestList.slice(startIndex, endIndex);
      if (filterItems.length) {
        const groupyItems = groupBy(filterItems, item => [
          item.id, // 品项id
          item.sizeId, // 品项规格id
        ]);
        redeItems = map(groupyItems, (item) => {
          const lastQty = reduce(item, (sum, n) => add(sum, n.num), 0);
          const newItem = Object.assign({}, item[0], { num: lastQty });
          return newItem;
        });
        // 如果存在已添加的换购品项 进行回显处理 添加默认选中的table
        exchangeIndex = exchangeList.findIndex(item => item.exchangeId === redeItems[0].exchangeId);
        exchangeIndex = exchangeIndex <= 0 ? 0 : exchangeIndex;
      }
      this.$refs.redemption.open({
        data,
        redeItems,
        exchangeList,
        exchangeIndex,
        activeItem,
      }, {
        submit: (submitItem, item) => {
          this.handleRedemptionData(submitItem, item, data);
        },
      });
    },
    /**
     * data 代表的是是否是通过结算弹框过来的
     */
    // 这个是按 加单金额换购
    moneyRedemption(data, exchangeList) {
      let exchangeIndex = 0;
      let redeItems = []; // 代表也添加的换购品项
      // 过来出来已添加换购的品项
      const filterItems = this.guestList.filter(item => item.exchangeId && !(item.mergeScId || item.exchangeMode === 1));
      // exchangeType 0 - 单品换购 1 - 组和换购
      // 组和和单品只能存在一种， 如果是组和的话需要合并下 数据
      if (filterItems.length && (filterItems[0].bsId || filterItems[0].exchangeType === 1 || filterItems[0].exchangeType === 2)) {
        const groupyItems = groupBy(filterItems, item => [
          item.id, // 品项id
          item.sizeId, // 品项规格id
        ]);
        redeItems = map(groupyItems, (item) => {
          const lastQty = reduce(item, (sum, n) => add(sum, n.num), 0);
          const newItem = Object.assign({}, item[0], { num: lastQty });
          return newItem;
        });
      } else {
        redeItems = filterItems;
      }
      // 如果存在已添加的换购品项 进行回显处理 添加默认选中的table
      if (redeItems.length) {
        exchangeIndex = exchangeList.findIndex(item => item.exchangeId === redeItems[0].exchangeId);
        exchangeIndex = exchangeIndex <= 0 ? 0 : exchangeIndex;
      }
      this.$refs.redemption.open({
        redeItems, data, exchangeList, exchangeIndex,
      }, {
        submit: (submitItem) => {
          this.handleRedemptionData(submitItem, null, data);
        },
      });
    },
    /**
     * isComeSettle是否来自结算
     */
    handleRedemptionData(data, activeItem, isComeSettle) {
      // 获取 当前执行的换购模式类型 0 - 加单金额 1- 单品数量
      const { exchangeMode } = data[0];
      if (exchangeMode === 0) {
        // 过滤掉也选择的 加单金额的换购
        this.guestList = this.guestList.filter(item => !(item.exchangeId && !(item.exchangeMode === 1 || item.mergeScId)));
      } else {
        // 单品数量模式
        let redemptionNum = 0; // 已包含换购品项条数
        if (activeItem.redemptionNum || activeItem.redemptionNum === 0) {
          redemptionNum = activeItem.redemptionNum;
        } else {
          redemptionNum = this.guestList.slice(activeItem.index + 1).filter(list => (list.mergeScId && list.mergeScId === activeItem.scId && list.exchangeId)).length;
        }
        if (redemptionNum) {
          this.guestList.splice(activeItem.index + 1, redemptionNum);
        }
      }
      const noFindItem = []; // 如果没找到给与提示
      const singRedemptionItems = []; // 已选单品数量换购的品项
      data.forEach((redeItem) => {
        const item = this.itemsMoreBarcode.find(items => `${items.id}_${items.sizeId}` === `${redeItem.itemSizeGroupId}`);
        if (item) {
          if (exchangeMode === 0) {
            this.add({ item: Object.assign({}, item, redeItem), beforeAddNum: false });
          } else {
            const extendItem = Object.assign({
              reasonId: '',
              sizeId: '-1',
              discFlg: 0,
              id: '',
              methodList: [],
            }, item, redeItem);
            singRedemptionItems.push(extendItem);
          }
        } else {
          noFindItem.push(redeItem.itemName);
        }
      });
      // 给后端的一个标识 busiType
      if (singRedemptionItems.length) {
        this.$set(this.guestList[activeItem.index], 'mBindId', activeItem.mBindId);
        this.$set(this.guestList[activeItem.index], 'busiType', 2);
        this.$set(this.guestList[activeItem.index], 'redemptionNum', singRedemptionItems.length); // 这个品项下参与换购的条数
        this.guestList.splice(activeItem.index + 1, 0, ...singRedemptionItems);
        setTimeout(() => {
          this.setActiveItem(singRedemptionItems.pop());
        }, 0);
      } else {
        setTimeout(() => {
          this.setActiveItem();
        }, 0);
      }
      if (noFindItem.length) {
        this.$message.error(this.$t('Biz.Pos.RedemptionError', [noFindItem.join('、')]));
      }
    },
    // 更多
    moreOrderingBtns() {
      this.$refs.moreOrderingBtns.open();
    },
    // 打包功能
    pack() {
      const activeItem = this.getActiveList()[0];
      if (!activeItem.isPack) {
        // 排除拼菜
        if (!activeItem.isPincai) {
          activeItem.lid = uniqueId();
          this.setActiveItem(activeItem);
        }
        activeItem.methodList.push(this.packMethod);
      } else {
        activeItem.methodList = activeItem.methodList.filter(
          list => list.id !== this.packMethod.id && list.name !== this.packMethod.name,
        );
      }
      activeItem.isPack = !activeItem.isPack;
    },
    // 添加快捷键
    setMenuBtnHotKey(vm) {
      const hotKey = {};
      vm.partAddMenuBtns.forEach((item) => {
        if (item.hotKey) {
          hotKey[item.hotKey] = () => {
            switch (item.hotKey) {
              case 'F1':
                vm.$refs.fastFoodBillBtns.clickHandler(vm.checkGiveStates);
                break;
              default:
                vm.$refs.fastFoodBillBtns.clickHandler(item.name);
                break;
            }
          };
        }
      });
      return hotKey;
    },
    async removebill() {
      const data = await ajax('canyin.pos.reception.receptionbusiness.removebill');
      this.guestList.splice(0, this.guestList.length);
      return data;
    },
    isDomemberPriceFn(data) {
      return {
        isDomemberPrice:
          (data.crmMemberQueryData.data
            ? data.crmMemberQueryData.data.memberDiscountId == 2
            : false)
          || data.bsData.memberPriceFlg,
      };
    },
    // 设置搜索热键
    setKeySearchHotKey() {
      const searchKeys = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890'.split('');
      const keysObj = {};
      searchKeys.forEach((item) => {
        keysObj[item] = () => {
          this.inputKey(item);
        };
      });
      return keysObj;
    },
    // 根据 elId 查询账单列表
    getListByElId(elId) {
      return filter(this.guestList, this.getItemsByElId(elId));
    },
    // 根据 elId 查找品项规则
    getItemsByElId(elId) {
      const el = elId.split('.');
      return {
        lid: el[0],
        id: el[1],
        sizeId: el[2],
        discFlg: parseInt(el[3]),
        reasonId: el[4],
      };
    },
    getSpellFoodList() {
      const list = this.getActiveList();
      if (list[0].bindId) {
        return concat(this.getListByElId(list[0].bindId),
          filter(this.guestList, { bindId: list[0].bindId }));
      }
      return concat(list, filter(this.guestList, item => startsWith(item.lid, `${list[0].lid}|`)));
    },
    spellFood() {
      const list = this.getSpellFoodList();
      this.$refs.spellFood.open({
        activeList: list,
      }, {
        submit: (spellList) => {
          const index = indexOf(this.guestList, list[0]);
          each(list, (item) => {
            this.guestList.splice(indexOf(this.guestList, item), 1);
          });
          this.guestList.splice(index, 0, ...spellList);
        },
      });
    },
    /**
     * 牌号及销售类型业务运算逻辑规则!!!!
     * 账单的刷新有三种情况: 1.首次开班和刷新页面; 2.非结算刷新账单; 3.结算完成账单刷新;
     */
    executeOrderCode(bsData, itemListLength) {
      // 1. 结算时: 判断vuex中bsData数据(bsId)存在, 且不等于接口返回的bsId(即bsData.id), 即为完成结算.
      if (this.getFastFoodBillData && bsData.id != this.getFastFoodBillData.bsData.id) {
        // itemListLength 是于判断刷账单是否是旧的一笔流水，设置下销售类型(比如：读取挂单)
        if (itemListLength) {
          this.SetSaleActiveState(bsData.saleTypeId - 1);
        } else {
          // 结算后 重置默认销售类型
          this.SetSaleActiveState(this.posSettings.saleType - 1);
        }
        // 重置牌号
        this.orderCodeRule(bsData);
      } else {
        this.SetSaleActiveState(bsData.saleTypeId - 1);
        // 2. 非结算-账单刷新时
        // 2.1 开班和刷新页面时, vuex或者接口无bsId时, 首次牌号查询赋值
        if (!this.getFastFoodBillData || !bsData.orderCode) {
          // 当牌号模式为自动时(即 牌号模式1时的三种销售类型 和 牌号模式3的外带(2)外卖(3) )
          if (this.posFastFood.bsOrderCodeMode == '1'
            || (this.posFastFood.bsOrderCodeMode == '3'
                && (this.saleTypeId == 2 || this.saleTypeId == 3))
          ) {
            this.queryOrderCode(
              (data) => {
                this.setOrderCode(data);
              },
              bsData,
            );
          }
        } else {
          // 2.2 非结算的账单刷新时(刷优惠,结算金额等,不刷已加品项)
          // 2.2.1 牌号模式为全自动 || 手自一体时(激活为)的外带(和或 外卖)时,使用后台牌号数据
          if (this.posFastFood.bsOrderCodeMode == '1'
            || (this.posFastFood.bsOrderCodeMode == '3'
                && (this.saleTypeId !== 1))
          ) {
            this.queryOrderCode(
              (data) => {
                this.setOrderCode(data);
              },
              bsData,
            );
          }
          // 规则描述,无代码执行
          // 2.2.2 牌号为全手动时,不重置默认销售类型,且保留当前手动设置牌号数值
          // 2.2.3 牌号为手自一体且激活为堂食时,不重置默认销售类型,且保留当前手动设置牌号数值
        }
      }
    },
    // 牌号逻辑规则
    orderCodeRule(bsData) {
      // 牌号模式1-全自动
      if (this.posFastFood.bsOrderCodeMode == '1') {
        // 排空处理, 保证 有值时, 才使用后台数据
        if (bsData.orderCode) {
          // 设置牌号,使用账单接口传入数据
          this.setOrderCode(bsData.orderCode);
        } else {
        // 如果后台业务处理有错误(orderCode没有正常返回时)执行牌号查询
          this.queryOrderCode(
            (data) => {
              // 设置牌号,使用牌号查询接口传入数据
              this.setOrderCode(data);
            },
            bsData,
          );
        }
      } else if (this.posFastFood.bsOrderCodeMode == '2') {
      // 牌号模式: 2-全手动, 设置牌号为空

        this.setOrderCode('');
      } else {
        // 牌号模式: 3-自动(堂食)+自动(外带+外卖)
        // 自动(堂食)
        if (this.saleTypeId == '1') {
          // 设置牌号为空
          this.setOrderCode('');
        } else {
        // 自动(外带+外卖)
          // 排空处理, 保证 有值时, 才使用后台数据
          // eslint-disable-next-line no-lonely-if
          if (bsData.orderCode) {
            // 设置牌号,使用账单接口传入数据
            this.setOrderCode(bsData.orderCode);
          } else {
          // 如果后台业务处理有错误(orderCode没有正常返回时)执行牌号查询
            this.queryOrderCode(
              (data) => {
                // 设置牌号,使用牌号查询接口传入数据
                this.setOrderCode(data);
              },
              bsData,
            );
          }
        }
      }
    },
    // 牌号查询接口: 接口查询参数-bsId(即bsData.id)
    queryOrderCode(callback, data) {
      ajax('canyin.pos.bill.findautoordercode', {
        params: {
          bsId: data.id,
        },
      }).then((data) => {
        // eslint-disable-next-line no-unused-expressions
        callback && callback(data);
      });
    },
    // 在输入框里添加搜索文本
    inputKey(key) {
      this.$vemit('fastfoodAddTableSearchTextdInBlur', key);
    },
    // 检测加载VUX数据-this.getFastFoodBillData, 成功后关闭loading和结束定时器
    operation(action) {
      this.$emit('operation', action);
    },
    otherOperation(action) {
      this.$emit('otherOperation', action);
    },
    ...mapMutations({
      setRefreshBs: 'SET_RERFESHBS',
      setETagItems: 'SET_ETAG_ITEMS',
      setFastfoodMenuBtns: 'SET_FASTFOOD_MENU_BTNS',
      setFastFoodBillData: 'SET_FASTTFOODBILL_DATA',
      setSelectDiscountPlanData: 'SET_SELECT_DISCOUNTPLAN_DATA',
      setLimitsMap: 'SET_ITEMLIMITSMAP',
      setIsExitData: 'IS_EXIT_DATA',
      setOrderInfo: 'SET_ORDER_INFO',
      setItemInfo: 'SET_ITEM_INFO',
    }),
    // 回显已提交的账单
    backShowBill(billData, isDomemberPrice, resData) {
      const { discountPlanId, bsData } = resData;
      // isDomemberPrice判断当前是否执行了会员价 这个主要是针对常规套餐的明细加价的会员价
      billData.forEach((item) => {
        let listId = '';
        // busiType 代表的是拼菜业务 - 1, 换购业务 - 2
        if (item.busiType === 1 || item.busiType === 2 && item.mergeScId) {
          const findMItem = find(this.guestList, { scId: item.mergeScId });
          // 把拼菜的副菜的lid强制置为主菜的lid用于删除
          listId = findMItem ? `${findMItem.lid}|` : uniqueId();
        } else {
          listId = uniqueId();
        }
        if (item.packFlg) {
          item.methodList.forEach((item) => {
            if (item.id === this.packMethod.id && item.name === this.packMethod.name) {
              this.$set(item, 'packFlg', true);
            }
          });
        }
        const loadItem = {
          id: item.itemId,
          sizeId: item.itemSizeId,
          num: item.lastQty,
          lastSubtotal: item.lastSubtotal,
          lid: listId,
          isPincai: item.busiType === 1,
          oldDisFlg: item.discFlg === 1 ? 0 : item.discFlg,
          oldPriceType: item.priceType,
          defaultPriceType: (item.discFlg === 1 || item.discFlg === 0) ? 1 : item.priceType,
          promoteLimit: item.exchangeId ? 0 : item.promoteLimitedQty,
          isPack: item.packFlg,
          // 入库的如果存在打折方案或者是比例优惠，则需要把打折品项discFlg强制改为2，原因是打折逻辑用的discFlg
          discFlg: item.scaleFlg && (discountPlanId || !discountPlanId && bsData.itemDiscMoney)
            ? 2
            : item.discFlg,
        };
        if (item.isPackage && item.pkgType == 0) {
          this.$set(loadItem, 'raisePriceType', isDomemberPrice.isDomemberPrice ? 2 : 1);
        }
        // 对数据进行稍微的调整
        item = extend({}, item, loadItem);
        // 如果有回显数据(sclist)&限量，加单时更新限量数据存储
        const itemIdSizeId = `${item.id}_${item.sizeId}`;
        if (this.getVuexItemLimitsMap[itemIdSizeId]) {
          const itemLimitsMap = cloneDeep(this.getVuexItemLimitsMap);
          itemLimitsMap[itemIdSizeId].restQuantity -= Number(item.num);
          if (!this.posSettings.isAllowAddOrderWhenLimitZero && item.restQuantity > 0 && item.restQuantity < 1) {
            itemLimitsMap[itemIdSizeId].restQuantity = 0;
          }
          this.setLimitsMap(itemLimitsMap);
        }
        this.add({ item, beforeAddNum: false, fromLoadBs: true });
      });
    },
    /**
     * 通过后台提供的mergeScId生成对应的elId
     * @param { String } mergeScId 后台提供的mergeScId，对应主菜的scId
     */
    getBindId(mergeScId) {
      const finded = find(this.guestList, { scId: mergeScId });
      if (finded) {
        return [
          finded.lid,
          finded.id,
          finded.sizeId,
          finded.discFlg,
          finded.reasonId ? finded.reasonId : '',
        ].join('.');
      }
      return null;
    },
    /**
     * 这个函数计算当前账单含有这个促销菜的份数总和
     */
    handleTotalItemNum(item, isMergeItem = false, list = this.guestList) {
      const filterList = list.filter((items) => {
        const isSameId = `${items.id}_${items.sizeId}` === `${item.id}_${item.sizeId}`;
        const { discFlg, bindId } = items;
        if (isMergeItem) {
          return (isSameId && discFlg === 4 && !bindId && !items.exchangeId);
        }
        return (isSameId && discFlg === 4 && !items.exchangeId);
      });
      return filterList.reduce((p, c) => (add(p, c.num)), 0);
    },
    /* 加单操作 参数addData为一个对象(按需传值) 包含加单品项和加单数量   addData{beforeAddNum: false,item: {}}
    */
    async add({
      item: item2, beforeAddNum, wipeMoney, fromLoadBs,
    }) {
      const item = cloneDeep(item2);
      // 当前促销菜品的限定数量
      const { promoteLimit } = item;
      // 当前账单上当前添加促销菜品的总数量
      const promoteNum = this.handleTotalItemNum(item);
      // 判断如果是后台发来的mergeScId则代表是拼菜中的附菜，需要在此建立bindId
      if (item.mergeScId && item.mergeScId != '' && item.isPincai) {
        item.bindId = this.getBindId(item.mergeScId);
      }
      // 客显
      this.$devices.CDI.price(item.price);
      // 快餐模式下需要对加单的数据item_type做下处理 因为重后台过来的item_type类型品项是套餐的话是不准确的 常规是3/宴会是4 item.pkgType == 0 是常规套餐
      if (item.isPackage) {
        item.itemType = item.pkgType == 0 ? 3 : 4;
      }
      // 修改预点单过来的判断 添加itemType 属性
      // 内部使用
      let lid = '-';
      if (!item.id) { // item 里的id有的为空
        try {
          item.id = item.itemId.split('_')[0];
        } catch (e) {
          console.log(e);
        }
      }
      // 这是允许重复加单的时候走这个 临时品项一直不走合并
      if (this.posFastFood.isMergeAddBillForBuffet
        || item.itemType == 2
        || item.isWeighed
        || item.isPincai
        || item.isPackage
        || item.TagID
        || item.exchangeId
        || item.fullGiftId
      ) {
        lid = uniqueId();
      }
      // 这是做了下 每单不走促销的数据转化
      if (promoteLimit !== 0 && !item.isPackage) {
        if (promoteLimit <= promoteNum && item.discFlg === 4) {
          this.$set(item, 'price', item.salePrice);
          this.$set(item, 'oldPrice', item.salePrice);
          this.$set(item, 'priceType', 1);
          this.$set(item, 'discFlg', 0);
          this.$set(item, 'oldPriceType', 0);
          this.$set(item, 'defaultPriceType', 0);
          this.$set(item, 'oldDisFlg', 0);
          this.$set(item, 'copyPromotePrice', item.promotePrice);
          this.$set(item, 'promotePrice', null);
        }
        if (item.discFlg === 4 && promoteLimit - promoteNum < 1) {
          item.num = promoteLimit - promoteNum;
        }
      }
      /* 加单时自动执行会员价:
       * 不可更改促销价
       * && 品项会员价数据类型判断
       * && '执行会员'选中  || 根据后台设置默认加单时就执行显示会员价 */
      if (!(item.promotePrice || item.promotePrice == 0)
          && item.memberPrice != undefined
          && item.memberPrice != 'undefined'
          && item.memberPrice != null
          && !isNaN(item.memberPrice)
          && (this.getFastFoodMemberPlanFlg && this.getFastFoodMemberPlanFlg.isDoMemberPrice)
      ) {
        // temConstantSet 进入文件, 价格体系数据字典
        item.discFlg = itemConstantSet.DISC_FLG_MEMBER; // 标识显示类型
        item.origPrice = item.memberPrice; // 价格
        item.price = item.memberPrice; // 价格
        item.priceType = itemConstantSet.PRICE_TYPE_MEMBER; // 价格类型
        item.oldPriceType = itemConstantSet.PRICE_TYPE_MEMBER; // 价格类型
        item.defaultPriceType = itemConstantSet.PRICE_TYPE_MEMBER;
      }
      //
      const escaped = extend(
        {
          reasonId: '',
          sizeId: '-1',
          discFlg: 0,
          id: '',
          methodList: [],
        },
        item,
        {
          lid: item.lid ? item.lid : lid,
          wipeMoney,
        },
      );
      // 进行加单最大最小数量限制
      /**
       * isHandlePromoteLimit这个属性是根据最小和最大拆分的不要在判读
       */
      if (
        !escaped.isHandlePromoteLimit
        && !escaped.exchangeId
        && (escaped.minAddQty || escaped.maxAddQty)
        && this.limitMaxOrMinQty(escaped, item.num) === false
      ) {
        return;
      }

      if (lid === '-') {
        const filtered = this.guestList.filter(it => it.lid === '-'
          && it.id === escaped.id
          && it.sizeId === escaped.sizeId
          && it.methodList.length === 0
          && it.discFlg === escaped.discFlg
          && it.itemType === 1);
        const finded = filtered[0];
        if (finded) {
          finded.num = add(finded.num, item.num);
        } else {
          this.guestListAdd(escaped);
        }
      } else {
        this.guestListAdd(escaped);
      }
      this.SET_BILLCURRENTITEM({ index: this.guestList.length - 1 });
      this.updateBillCurrentElId(escaped);
      // if (!item.orderId) {
      //   this.setActiveItem(escaped);
      // }
      // 开启增值 以及开启销售类型选择非堂食时，已选品项自动标记打包状态 外带/外卖自动添加打包做法
      if (
        this.saleTypeId !== 1
        && !fromLoadBs
        && !escaped.isPackage
        && this.packMethod
        && this.posSettings.autoTaggingPackingStatus
      ) {
        escaped.methodList.push(this.packMethod);
        escaped.isPack = true;
      }
      // 快速修改数量 优先级高于做法 排除易盘-换购-满赠 --AI智能加单不考虑多规格/快速修改数量（不弹框）
      if (!item.exchangeId && !item.orderId && item.enableEasyDiskModifyQty
        && !item.isPackage
        && !item.TagID
        && !item.isAIAddorder
        && !item.exchangeId
        && !item.fullGiftId
      ) {
        await this.changeItemNum(); // 快速修改数量
      }
      // dedicatedMethodsDefaultPopup 这变量是后台快餐专用做法默认弹窗选择 1是、0否 暂时去掉这个判断
      // ## !item.isPackage 要排除掉套餐的 排除易盘 后续添加getisSetUpGroupMethod 如果是true后台设置了做法分组这个优先级高就不判断专用做法弹框
      if (
        !item.exchangeId
        && !item.orderId
          && (!!(!this.getisSetUpGroupMethod && item.methodCount > 0)
            || !!(this.getisSetUpGroupMethod && item.haveRequiredMethod)
          )
          && !item.isPackage
          && !item.TagID
          && !item.isAIAddorder // AI智能加单不考虑多规格/快速修改数量（不弹框）
          && !item.exchangeId
          && !item.fullGiftId
      ) {
        const isAddMenuModule = true;
        this.changeItemMethods(isAddMenuModule); // 做法
      }
      if (!this.posBaseInfo.isFastFoodPrepare) this.$refs.fastFoodBill.scrollToEnd(); // 未开启备餐模式-滚动到底部
      // 如果是精准模式下 扫码加单自动清除助记符
      const { searchMode, isAllowDarkScan } = this.posSettings;
      // 判断模糊模式下是否是扫码简单的
      let isScanCode = this.getCookie('isScanCode');
      if (isScanCode) {
        isScanCode = JSON.parse(isScanCode);
      }
      if (+searchMode === 2 || (isAllowDarkScan && isScanCode)) {
        this.$vemit('fastfoodMenuClearSearchText');
      } else if (this.$store.getters.posSettings.isAutoClearKey) { // 根据设置判断是否清空助记符
        this.$vemit('fastfoodMenuClearSearchText');
      }
      document.cookie = 'isScanCode=false;'; // 这里是为了模糊查询下扫码加单后清空搜索框
    },
    updateDeposit() {
      const depositModel = this.posSettings.depositModel; // 0:押金金额固定为押金费品项;1:押金金额为人数x押金费品项
      let depositItemPrice = parseFloat(this.posSettings.depositItemPrice); // 押金金额
      console.log('depositModel:', depositModel, this.posSettings.isOpenDepositSet)
      if (!(this.posSettings.isOpenDepositSet && depositModel === 0)) { // 押金非固定 计算押金值 = 人数*押金金额
        return this.eaters.reduce((total, cur) => {
          const n = parseInt(cur.eaterQty) || 0;
          return round(total + depositItemPrice * n);
        }, 0);
      }
      return depositItemPrice;
    },
    buffetSetQty(newVal) { // 开启自助餐 匹配客人类型更新人数
      if (this.posSettings.isOpenBuffetDeposit && this.eaters) {
        this.eaters.forEach((item) => { // 人数清0
          item.eaterQty = 0;
          item.guestPriceItems.forEach((p) => p.itemQty = 0);
        });
        newVal.forEach((guestItem) => {
          this.eaters.forEach((item) => { // 品项id和规格id匹配
            item.guestPriceItems.forEach((ele) => { // 客人价格品项不支持半分-向上取整
              if (ele.itemId === (guestItem.realItemId || guestItem.itemId) && ele.itemSizeId === guestItem.sizeId) {
                ele.itemQty += Math.ceil(guestItem.num);
                item.eaterQty += Math.ceil(guestItem.num);
              }
            });
          });
        });
        const num = this.eaters.reduce((total, item) => total + item.eaterQty, 0);
        this.setPeopleQty(num); // 自助餐总人数更新
        // 首次进来，押金如接口中返回则取返回值，如果没有计算
        var deposit = this.getFastFoodBillData.bsData.buffetDeposit;
        if (this.payPageOpen === 2) { // 2关闭结算不重新计算
          this.setPayPageOpen(0); // 恢复默认值
        } else {
          if (!this.first || !deposit) deposit = this.updateDeposit();
        }
        this.first = false;
        this.setBuffetDeposit(deposit); // 押金更新

        let cloneBillData = cloneDeep(this.getFastFoodBillData);
        this.$set(cloneBillData.bsData, 'eaters', cloneDeep(this.eaters));
        this.$set(cloneBillData.bsData, 'buffetDeposit', deposit);
        this.setFastFoodBillData(cloneBillData);
      }
    },
    guestListAdd(guestItem) {
      if (this.posBaseInfo.isFastFoodPrepare) { // 开启备餐模式-在前面加单
        this.guestList.unshift(guestItem);
      } else {
        this.guestList.push(guestItem);
      }
    },
    // 获得cookie值
    getCookie(name) {
      const reg = new RegExp(`(^| )${name}=([^;]*)(;|$)`);
      const arr = document.cookie.match(reg);
      if (arr) {
        return unescape(arr[2]);
      }
      return null;
    },
    // 加单最大最小数量限制: 点击后加单最小数量 加单不允许超过最大限制 (需考虑是否合并品项情况)
    limitMaxOrMinQty(item, beforeAddNum) { // 品项合并情况 (需考虑多规格情况、加单前的数量设置)
      if (!this.posFastFood.isMergeAddBillForBuffet) {
        // 非多规格情况
        if (item.sizeId === -1) {
          // 最小数量限制：第一次加单情况 加最小限制数量的菜 (需考虑加单前数量已设置的情况)
          if (
            item.minAddQty
            && item.count === 0
            && beforeAddNum < item.minAddQty
            && !item.promoteLimit
          ) {
            this.$set(item, 'num', item.minAddQty);
          } else if (
            item.maxAddQty
            && (item.count >= item.maxAddQty
              || beforeAddNum + item.count > item.maxAddQty)
          ) {
            // 最大数量限制： 品项已点数量与最大限制数量作比较 返回false不执行加菜 (需考虑加单前数量已设置的情况)
            this.$message.warning(this.$t('Biz.BizComm.BizCommTip13', [item.maxAddQty]));
            return false;
          }
        }
        // 多规格情况
        if (item.sizeId !== -1) {
          // sizeItemList为所选多规格品项的数组 用于判断是否为第一个加此单 和 计算此规格品项的数目sizeItemCount
          const sizeItemList = filter(
            this.guestList,
            _ => _.id === item.id && _.sizeId === item.sizeId,
          );
          const sizeItemCount = reduce(
            sizeItemList,
            (sum, item) => add(sum, item.num),
            0,
          );
          // 最小数量限制：第一次加单情况 加最小限制数量的菜 (需考虑加单前数量已设置的情况)
          if (
            item.minAddQty
            && sizeItemList.length === 0
            && beforeAddNum < item.minAddQty
            && !item.promoteLimit
          ) {
            this.$set(item, 'num', item.minAddQty);
          } else if (
            item.maxAddQty
            && (sizeItemCount >= item.maxAddQty
              || beforeAddNum + sizeItemCount > item.maxAddQty)
          ) {
            // 最大数量限制： 此规格品项已点数量与最大限制数量作比较 返回false不执行加菜 (需考虑加单前数量已设置的情况)
            this.$message.warning(this.$t('Biz.BizComm.BizCommTip13', [item.maxAddQty]));
            return false;
          }
        }
      }
      // 品项不合并情况 (需考虑加单前的数量设置)
      if (this.posFastFood.isMergeAddBillForBuffet) {
        // 每次加单设置最小数量
        if (item.minAddQty && beforeAddNum < item.minAddQty && !item.promoteLimit) {
          this.$set(item, 'num', item.minAddQty);
        } else if (item.maxAddQty && beforeAddNum > item.maxAddQty) {
          // 加单前设置的菜品数量超出最大加单限制 返回false不执行加菜
          this.$message.warning(this.$t('Biz.BizComm.BizCommTip13', [item.maxAddQty]));
          return false;
        }
      }
    },
    // 改变账单按钮功能状态: List派发出当前选中品项数据 传递给OrdingBtns组件设置uid, lid
    // changeActiveItem() {
    //   const item = this.getActiveItem();
    //   this.activeMenuItem = item;
    // },
    // List找到所选品项并派发changeActiveItem事件 传递给BillBtns使用
    setActiveItem(item) {
      this.$refs.fastFoodBill.$refs.billList && this.$refs.fastFoodBill.$refs.billList.setActiveItem(item);
    },
    getItemData(index) {
      if (!this.guestList[index]) return null;
      return {
        lid: this.guestList[index].lid,
        id: this.guestList[index].id,
        sizeId: this.guestList[index].sizeId,
        discFlg: parseInt(this.guestList[index].discFlg),
        reasonId: this.guestList[index].reasonId,
        priceType: this.guestList[index].priceType,
      };
    },
    // 调用加单列表中的方法 拿到所选品项
    getActiveItem() {
      // 获取当前品项所处数据的indexs下标
      if (this.$refs.fastFoodBill && this.$refs.fastFoodBill.$refs.billList) {
        const activeItemIndexs = this.$refs.fastFoodBill.$refs.billList.getActiveItemIndex().length ? this.$refs.fastFoodBill.$refs.billList.getActiveItemIndex()[0] : 0;
        if (this.$refs.fastFoodBill.$refs.billList.getActiveItem() && this.guestList[activeItemIndexs]) {
          return this.getItemData(activeItemIndexs);
        }
      }
      return null;
    },
    // 加单列表中筛选出 所选品项的列表 这个是个数组 因为把改量和+的都已push的形式添加进去的渲染的时候在Bill文件夹下的List.vue里又新根据lid 和uid重新合并一起
    getActiveList() {
      return filter(this.guestList, this.getActiveItem());
    },
    /**
     * 获取当前选中的品项
     */
    getCurrentItem() {
      // const active = this.getActiveItem();
      if (this.billCurrentItem) {
        const finded = findLast(this.guestList, this.billCurrentItem);
        if (finded) {
          return finded;
        }
        this.$message.error(this.$t('Biz.Order.AddOrderErrorMsg'));
        return false;
      }
      this.$message.warning(this.$t('Biz.Order.AddOrderWarnMsg'));
      return false;
    },
    // 控制所选品项，回调返回选中值
    controlActive(handler, onlyLast) {
      // const active = this.getActiveItem();
      const active = this.billCurrentItem;
      if (active) {
        let finded = null;
        if (onlyLast) {
          finded = findLast(this.guestList, extend({}, active, { num: 1 }));
          if (!finded) {
            finded = findLast(this.guestList, active);
          }
        } else {
          finded = filter(this.guestList, active);
        }

        const limitData = this.cancelLimit(finded);
        if (limitData) {
          finded = Object.assign(finded, limitData);
        }
        if (onlyLast ? finded : finded && finded.length) {
          if (onlyLast) {
            handler(finded);
          } else {
            each(finded, (item) => {
              handler(item);
            });
          }
          this.$log.info(`+-删除操作菜品记录id${active.id},当前时间===${new Date()}`);
        } else {
          this.$message.error(this.$t('Biz.Order.AddOrderErrorMsg'));
        }
      } else {
        this.$message.warning(this.$t('Biz.Order.AddOrderWarnMsg'));
      }
    },
    // 删菜 清空 减执行的授权方法
    handleAuthCheckFn(authData = {}, callback) {
      const params = {
        ...authData,
      };
      ajax('canyin.pos.designates.checkdelselecteditemsauth', { params }).then((res) => {
        callback();
      }).catch((msg) => {
        console.log(msg);
      });
    },
    /* 账单功能业务操作方法 - menu
     * 含: 赠菜,+,-,删除,改价,改量等等 */
    // 监听BillBtns事件 实现账单右侧功能
    menuControl(methodName) {
      let method = methodName;
      let disabled = false;
      if (method === '') {
        method = this.checkGiveState;
      }
      const btnData = this.addMenuBtns.find(item => item.name === method);
      if (btnData) {
        disabled = btnData.disabled;
      }
      if (method === 'moreOrderingBtns') {
        this[method]();
      } else if (this[method] && disabled) {
        this[method]();
      }
    },
    // AI智能加单事件
    addOrderByAI() {
      this.$refs.menu.$children[0].getImgDetect();
    },
    // 赠送事件
    give() {
      // this.$refs.fastFoodGive.open(this.getActiveList(), {
      this.$refs.fastFoodGive.open(this.billCurrentItemList, {
        submit: (num, id) => {
          num && this.orderingGive(num, id);
        },
      });
    },
    // 取消赠送事件
    cancelGive() {
      // this.$refs.cancelFastFoodGive.open(this.getActiveList(), {
      this.$refs.cancelFastFoodGive.open(this.billCurrentItemList, {
        submit: () => {
          this.orderingCancelGive();
        },
      });
    },
    // 删除按钮 事件
    deleteItem(authData = {}, easyItem) {
      this.$vonce('authCode', (code) => {
        this.deleteItem(code, easyItem);
      });
      this.handleAuthCheckFn(authData, () => {
        // const active = this.getActiveList()[0];
        const active = this.billCurrentItemList[0];
        if (active.TagID) {
          this.$message.warning('请从易盘拿走菜品卡或餐盘，以删除品项。');
          return;
        }
        if (active.isPincai && !active.bindId) {
          this.deleteSpellFood(active);
        } else {
          this.controlActive((finded) => {
            if (finded.isLimit) {
              this.resetItemLimitsMap(finded, 'sub', finded.num);
            }
            // 如果是单品数量换购,主品项删除换购的品项也删除
            if (finded.isExchange) {
              let redemptionNum = 0; // 已包含换购品项条数
              if (finded.redemptionNum || finded.redemptionNum === 0) {
                redemptionNum = finded.redemptionNum;
              } else {
                redemptionNum = this.guestList.filter(list => (list.mergeScId && list.mergeScId === finded.scId && list.exchangeId)).length;
              }
              this.guestList.splice(indexOf(this.guestList, finded), redemptionNum + 1);
            } else {
              this.$log.info(`品项：${finded.itemName}（${finded.code}）删除`);
              this.guestList.splice(indexOf(this.guestList, finded), 1);
            }
          });
        }
        // setTimeout(() => {
        //   this.setActiveItem();
        // }, 0);
        // 取最后一项
        const len = this.guestList.length;
        const lastItem = len ? this.guestList[len - 1] : null;
        this.updateBillCurrentElId(lastItem, len - 1);
      });
    },
    // 删除拼菜的主菜
    deleteSpellFood(spellFood) {
      each(concat(this.billCurrentItemList, filter(this.guestList, item => startsWith(item.lid, `${spellFood.lid}|`))), (item) => {
        if (item.isLimit) {
          this.resetItemLimitsMap(item, 'sub', item.num);
        }
        this.guestList.splice(indexOf(this.guestList, item), 1);
      });
    },
    handleAddMenuItemFn(finded) {
      let num = 1;
      let nums = 0;
      const count = this.getActiveCount();
      nums = !this.posSettings.isAllowAddOrderWhenLimitZero ? this.conutTotal(`${finded.id}_${finded.sizeId}`) : -999999999;
      if (finded.maxAddQty && count >= finded.maxAddQty) {
        this.$message.warning(this.$t('Biz.BizComm.BizCommTip13', [finded.maxAddQty]));
      } else if (finded.isLimit) {
        if (nums >= finded.limitTotal) {
          this.$message.warning(this.$t('Biz.BizComm.BizCommTip14', [finded.limitTotal]));
          return 0;
        }
        if (!this.posSettings.isAllowAddOrderWhenLimitZero && finded.limitTotal - nums > 0 && finded.limitTotal - nums < 1) {
          num = finded.limitTotal - nums;
        }
        this.resetItemLimitsMap(finded, 'add', num);
      } else {
        if (finded.limit && nums >= finded.limit) {
          this.$message.warning(this.$t('Biz.BizComm.BizCommTip14', [finded.limit]));
          return 0;
        }
        if (!this.posSettings.isAllowAddOrderWhenLimitZero && finded.limit - nums > 0 && finded.limit - nums < 1) {
          num = finded.limit - nums;
        }
      }
      return num;
    },
    // 当前限量菜品的总数
    conutTotal(id) {
      const newArr = this.guestList.filter(v => (`${v.id}_${v.sizeId}`) == id);
      return newArr.reduce((sum, n) => (sum + n.num), 0);
    },
    // 取消限量
    cancelLimit(item) {
      const limitData = this.getVuexItemLimitsMap[`${item.id}_${item.sizeId}`];
      const obj = {};
      if (!limitData) {
        obj.limit = limitData;
        obj.isLimit = limitData;
        obj.limitTotal = limitData;
        obj.limitQuantity = limitData;
      } else {
        obj.limit = limitData.restQuantity;
        if (item.sizeId !== '-1') {
          obj.isLimit = true;
        }
        obj.limitTotal = limitData.maxLimit;
        obj.limitQuantity = limitData.limitQuantity;
      }
      return obj;
    },
    // 限量菜品执行加、减、修改数量等操作计算的数量
    resetItemLimitsMap(activeItem, method, nums) {
      const itemLimitsMap = _.cloneDeep(this.getVuexItemLimitsMap);
      const newItemLimitsMap = itemLimitsMap[`${activeItem.id}_${activeItem.sizeId}`];
      if (newItemLimitsMap && newItemLimitsMap.restQuantity !== undefined) {
        switch (method) {
          case 'add':
            newItemLimitsMap.restQuantity -= Number(nums);
            break;
          case 'sub':
            newItemLimitsMap.restQuantity += Number(nums);
            break;
          case 'changeNum':
            newItemLimitsMap.restQuantity = Number(nums);
            break;
        }
        this.setLimitsMap(itemLimitsMap);
      }
    },
    // 当前易盘菜品在账单上的数量
    handleEasyItemTotal(item) {
      return this.guestList.reduce((p, c) => {
        let num = p;
        if (c.TagID === item.TagID) {
          num += item.num;
        }
        return num;
      }, 0);
    },
    // 规格改量
    specHalfNum(num) {
      let nums = 0;
      const active = this.billCurrentItemList;
      nums = this.conutTotal(`${active[0].id}_${active[0].sizeId}`);
      const totalNums = reduce(active, (sum, item) => add(sum, item.num), 0);
      this.resetItemLimitsMap(active[0], 'changeNum', active[0].limitTotal - num - (nums - totalNums));
    },
    // 清空菜品时，限量还回去
    clearLimitsItem() {
      this.guestList.forEach((finded) => {
        if (finded.isLimit) {
          this.resetItemLimitsMap(finded, 'sub', finded.num);
        }
      });
    },
    /**
     * @description: 当前所选促销品项在账单是否存在多余此品项限定数量的品项
     * @Author: wy
     * @param {type: Object} 当前所选菜品
     * @return: Boolean
     * @Date: 2019-05-09 11:24:18
     */
    handleisHasMorePromotionItem(finded) {
      if (finded && finded.discFlg === 4) {
        const total = this.handleTotalItemNum(finded);
        if (total >= finded.promoteLimit && finded.promoteLimit !== 0 && !finded.isPackage) {
          return true;
        }
      }
      return false;
    },
    // + 加加按钮事件
    addItemNum() {
      let finded = this.getCurrentItem();
      if (finded) {
        const limitData = this.cancelLimit(finded);
        if (limitData) finded = Object.assign(finded, limitData);
        if (finded.maxAddQty && finded.num >= finded.maxAddQty) {
          this.$log.info(`品项：${finded.itemName}（${finded.code}）数量加1被最大点单数${finded.maxAddQty}拦截`);
          this.$message.warning(this.$t('Biz.BizComm.BizCommTip13', [finded.maxAddQty]));
        } else {
          const num = this.handleAddMenuItemFn(finded);
          this.$log.info(`品项：${finded.itemName}（${finded.code}）数量加${num}`);
          if (!this.limitItemSamllClsNumJudge(finded, num)) {
            return false;
          }
          if (finded.discFlg === 4
            && !finded.isPackage
            && (finded.promoteLimit !== 0 || this.getVuexPromoteItemLimitsMap[`${finded.id}_${finded.sizeId}_${finded.promotePlanId}`])
          ) {
            // 存在 每单促销限制
            const getPromoteLimitItem = this.getVuexPromoteItemLimitsMap[`${finded.id}_${finded.sizeId}_${finded.promotePlanId}`];
            const finedNum = this.handleTotalItemNum(finded);
            let promoteLimitNum = 0;
            if (finded.promoteLimit !== 0) {
              // 如果单限制 存在 总数也存在话 那个剩余的少就选哪个
              promoteLimitNum = finded.promoteLimit;
              if (getPromoteLimitItem) {
                promoteLimitNum = getPromoteLimitItem.restQuantity - finded.promoteLimit > 0
                  ? finded.promoteLimit
                  : getPromoteLimitItem.restQuantity;
              }
              // 没有按单限制，并存在总数的限制判断
            } else if (getPromoteLimitItem) {
              promoteLimitNum = getPromoteLimitItem.restQuantity;
            }
            if (promoteLimitNum - finedNum < 1) {
              finded.num = add(finded.num, sub(promoteLimitNum, finedNum) > 0 ? sub(promoteLimitNum, finedNum) : 0);
            } else {
              finded.num = add(finded.num, num);
            }
          } else {
            finded.num = add(finded.num, num);
          }
        }
      }
    },
    // - 减减 按钮事件
    subtractItemNum() {
      this.controlActive((finded) => {
        this.$log.info(`-当前品项数量减1：id:${finded.id},itemName:${finded.itemName}`);
        if (
          finded.num <= 1
          || (finded.minAddQty && finded.num <= finded.minAddQty)
        ) {
          const activeItem = this.$refs.fastFoodBill.$refs.billList.getActiveItemData();
          if (activeItem.TagID) {
            const total = this.handleEasyItemTotal(activeItem);
            if (total <= 1) {
              this.$message.warning(this.$t('Biz.Order.AddOrderWarnMsg01'));
              return;
            }
          }
          if (
            activeItem.lastQty <= 1
            || (finded.minAddQty && activeItem.lastQty <= finded.minAddQty)
          ) {
            this.deleteItem();
          } else if (!activeItem.enableHalf && activeItem.lastQty < 2) {
            const active = this.getActiveItem();
            const diffNum = sub(activeItem.lastQty, 1);
            const findItem = findLast(this.guestList, extend({}, active, {
              num: diffNum,
            }));
            this.guestList.splice(indexOf(this.guestList, findItem), 1);
            if (findItem.isLimit) {
              this.resetItemLimitsMap(findItem, 'sub', findItem.num);
            }
          } else {
            if (finded.isLimit) {
              this.resetItemLimitsMap(finded, 'sub', finded.num);
            }
            this.guestList.splice(indexOf(this.guestList, finded), 1);
          }
        } else if (!finded.enableHalf && this.getActiveCount() < 2) {
          finded.num = 1;
          if (finded.isLimit) {
            this.resetItemLimitsMap(finded, 'changeNum', 1);
          }
        } else {
          finded.num = sub(finded.num, 1);
          if (finded.isLimit) {
            this.resetItemLimitsMap(finded, 'sub', 1);
          }
        }
      }, true);
    },
    // 半份 按钮事件
    changeHalfNum() {
      // 执行 改量方法: 传值0.5
      this.orderingChangeNum(0.5);
      if (this.billCurrentItemList[0].isLimit) {
        this.specHalfNum(0.5);
      }
    },
    changeItemNumSumit(num) { // 改量 - 与鲜果公用提出来
      // let changeList = this.getActiveList();
      let changeList = this.billCurrentItemList;
      const limitId = `${changeList[0].id}_${changeList[0].sizeId}`;
      const nums = this.conutTotal(limitId);
      const limitData = this.cancelLimit(changeList[0]);
      changeList = changeList.map((v) => {
        v = Object.assign({}, v, limitData);
        return v;
      });
      const totalNums = reduce(changeList, (sum, item) => add(sum, item.num), 0);
      if (
        changeList[0].discFlg === 4
        && changeList[0].promoteLimit !== 0
        && !changeList[0].isPackage
      ) {
        const isMore = this.handleTotalItemNum(changeList[0]) >= changeList[0].promoteLimit;
        if (num > changeList[0].promoteLimit || isMore) {
          return;
        }
      }
      this.orderingChangeNum(Number(num));
      const limitVuexItem = this.getVuexItemLimitsMap[limitId];
      if (limitVuexItem) {
        this.resetItemLimitsMap(changeList[0], 'changeNum', limitVuexItem.maxLimit - num - (nums - totalNums));
      }
    },
    // 改量 按钮事件
    changeItemNum() {
      return new Promise((resolve) => {
        // let changeList = this.getActiveList();
        let changeList = this.billCurrentItemList;
        const limitId = `${changeList[0].id}_${changeList[0].sizeId}`;
        const nums = this.conutTotal(limitId);
        const limitData = this.cancelLimit(changeList[0]);
        changeList = changeList.map((v) => {
          v = Object.assign({}, v, limitData);
          return v;
        });
        this.$refs.fastFoodChangeNum.open(
          {
            list: changeList,
            numTotal: nums,
          },
          {
            submit: (num) => {
              this.changeItemNumSumit(num, nums, changeList);
              resolve(num);
            },
            close: () => {
              resolve();
            },
          },
        );
      });
    },
    // 改价 按钮事件
    changeItemPrice() {
      // const item = this.getActiveList()[0];
      const item = this.billCurrentItemList[0];
      if (item.isPackage) {
        // 如果是套餐的话要在修改套餐里进行修改
        if (item.pkgType == 0) {
          this.$message({
            type: 'error',
            message: this.$t('Biz.Order.AddOrderErrorMsg01'),
          });
        } else if (item.pkgType == 1) {
          this.$message({
            type: 'error',
            message: this.$t('Biz.Order.AddOrderErrorMsg02'),
          });
        }
        return;
      }
      this.$refs.orderingChangePrice.open(this.billCurrentItemList, {
        submit: (price) => {
          this.orderingChangePrice(price);
        },
      });
    },
    // 修改规格
    async modifyItemSize() {
      // const nowItem = this.getActiveList()[0]; // 获取当前要操作的品项 如果通过改量,列如改6个那么这是第一个元素
      const nowItem = this.billCurrentItemList[0]; // 获取当前要操作的品项 如果通过改量,列如改6个那么这是第一个元素
      if (!(nowItem && nowItem.sizeId && nowItem.sizeId != -1)) {
        return;
      }
      // 由于修改规格在附菜金额为零时会产生金额计算的问题，所以暂时屏蔽掉
      // http://192.168.4.84:88/zentao/bug-view-71618.html
      if (nowItem.bindId) {
        // 附菜不允许修改规格
        this.$message.warning(this.$t('Biz.Order.LimitMsg001'));
      } else if (nowItem.enableMutiSize || nowItem.sizeId != -1) { // 添加nowItem.sizeId != -1 暂时解决废单重结和读取挂单回来的菜品无法修改规格问题
        // 判断add添加的时候缓存的sizeList存在就用,不需要请求接口\ 否则请求接口
        if (!(nowItem.sizeList && nowItem.sizeList.length) || this.isLimitOrSellout) {
          const options = {
            itemId: nowItem.id, // 品项id
            isDinnerBuffet: false, // 是否是自助模式
          };
          nowItem.sizeList = await this.getSizeData(options);
        }
        this.modifyItemSizeModule(nowItem, nowItem.sizeList);
      } else {
        this.$message({
          type: 'error',
          message: this.$t('Biz.Order.AddOrderErrorMsg04'),
        });
      }
    },
    // 修改规格品项的事件
    modifyItemSizeModule(nowItem, sizeList) {
      const limitId = `${nowItem.id}_${nowItem.sizeId}`;
      const nums = this.conutTotal(limitId);
      this.$refs.orderingModifyItemSize.open({
        sizeList,
        activeSizeId: nowItem.sizeId, // 只有修改时有
        item: nowItem,
        totalNum: sub(nums, nowItem.num),
      }, {
        submit: (modifyItemSizeData) => {
          this.updateItemSize(modifyItemSizeData);
        },
      });
    },
    updateItemSize(modifyItemSizeData, idx) { // 更新规格数据 - 鲜果公用
      let activeItem = null;
      // let cItem = this.getActiveList();
      const cItem = this.billCurrentItemList;
      // 找所有对应的品项
      cItem.forEach((activeList) => {
        activeList.costPrice = modifyItemSizeData.costPrice; // 品项成本价格
        activeList.isLimit = modifyItemSizeData.isLimit; // 限量
        activeList.isSellout = modifyItemSizeData.isSellout; // 估清
        activeList.isDefault = modifyItemSizeData.isDefault; // 是否是默认
        activeList.sizeName = modifyItemSizeData.sizeName; // 规格名称
        activeList.priceType = modifyItemSizeData.priceType; // 价格类型
        activeList.sizeId = modifyItemSizeData.sizeId; // 规格id
        activeList.stdPrice = modifyItemSizeData.stdPrice;
        activeList.unitId = modifyItemSizeData.unitId; // 单位名称
        activeList.discFlg = modifyItemSizeData.discFlg; // 打折标识
        activeList.price = modifyItemSizeData.price;
        activeList.salePrice = modifyItemSizeData.salePrice; // 销售价
        if (modifyItemSizeData.memberPrice) {
          // 会员价
          activeList.memberPrice = modifyItemSizeData.memberPrice;
        }
        if (modifyItemSizeData.promotePrice) {
          // 促销价
          activeList.promotePrice = modifyItemSizeData.promotePrice;
        }
        // 最新的添加过去
        activeItem = activeList;
      });
      // 规格选择-清空，设置选中项
      activeItem.sizeList.forEach((t) => {
        t.is_default = false;
        if (modifyItemSizeData.sizeId === t.size_id) t.is_default = true;
      });
      this.$log.info(`修改规格品项${activeItem.id},当前时间===${new Date()}`);
      this.updateBillCurrentElId(activeItem);
      // this.setActiveItem(activeItem);
    },
    updateBillCurrentElId(newItem, index = null) { // 更新 billCurrentElId
      const current = newItem ? this.getElId(newItem) : null;
      let d = { current };
      if (index !== null) d = { ...d, index };
      this.SET_BILLCURRENTITEM(d);
    },
    getElId(item) {
      return [
        item.lid,
        item.id,
        item.sizeId,
        item.discFlg,
        item.reasonId ? item.reasonId : '',
        item.priceType,
      ].join('.');
    },
    // 做法 按钮事件
    async changeItemMethods(isAddMenuModule) {
      // 这个是判断触发事件是否是在加单时候的触发的弹框 目前这值后端给的不太准确是集比较大就是true的时候它可能不是关联了必选的做法不需要弹
      isAddMenuModule = isAddMenuModule || false;
      // const itemData = this.getActiveList()[0];
      const itemData = this.billCurrentItemList[0];
      const url = this.getisSetUpGroupMethod ? 'canyin.pos.bill.itemmethodgroupinfo' : 'canyin.pos.bill.moremethodandserveway';
      // 请求接口
      const res = await this.getMethodsInfo({ url, itemData }); // 公用方法-接口获取做法信息
      // 成功了 进行弹框显示
      // 如果是做法分组过来的要判断是否是加单过程来的，还要判断 做法分组的数据methodGroupList里是否还有必须的做法分组 requiredGroup
      // 如果是加单的时候过来的并且请求的做法分组的数据不存在或者是数组为空就不需要弹框
      if (this.getisSetUpGroupMethod && isAddMenuModule) {
        if ((!res.data.methodGroupList || !res.data.methodGroupList.length)) {
          return false;
        }
        const groupMethods = res.data.methodGroupList;
        const findRequiredGrop = groupMethods.filter(method => method.requiredGroup);
        if (!findRequiredGrop.length) {
          return false;
        }
      }
      // 传的参数 pkgItem: true
      this.$refs.fastFoodChangeMethods.open(
        {
          itemData,
          methodsData: res.data,
          pkgItem: itemData.isPackage ? itemData.isPackage : false,
        },
        {
          submit: (methodData) => {
            // methodData.publicIsValid  这个是boolean 值 为true的话 说明选择的做法中包含通用做法要去现在加单的所有品项有效
            this.$refs.fastFoodChangeMethods.close();
            this.fastFoodChangeMethods(methodData);
          },
        },
      );
    },
    // 清空 按钮事件
    clearItem(authData = {}) {
      this.$vonce('authCode', (code) => {
        this.clearItem(code);
      });
      this.handleAuthCheckFn(authData, () => {
        this.clearLimitsItem();
        this.guestList.splice(0, this.guestList.length);
        this.SET_BILLCURRENTITEM({ current: null, index: -1 });
        // this.setActiveItem();
      });
    },
    // 修改套餐
    modifyItemPackage() {
      const itemPkgs = this.getActiveList();
      const itemPkg = itemPkgs[0];
      // 判断当前的品项是否是套餐
      if (itemPkg.isPackage) {
        // 如果套餐的弹框数据有缓存 就走缓存 不存在就请求下接口
        itemPkg.pkgData
          ? this.modifyPkgItem(itemPkgs)
          : this.getModifypkgItemData(itemPkgs);
      } else {
        this.$message({
          type: 'error',
          message: this.$t('Biz.Order.AddOrderErrorMsg05'),
        });
      }
    },
    // 套餐的修改
    modifyPkgItem(itemPkgs) {
      let pkgNum = 0;
      itemPkgs.forEach((_) => {
        pkgNum = add(pkgNum, _.num);
      });
      const { ...itemPkgData } = itemPkgs[0];
      // 需要去itemPkgs[0].pkgData 缓存的套餐数据进行更新
      itemPkgData.pkgData.package.discFlg = itemPkgData.discFlg;
      itemPkgData.pkgData.package.salePrice = itemPkgData.salePrice;
      itemPkgData.pkgData.package.memberPrice = itemPkgData.memberPrice;
      itemPkgData.pkgData.package.promotePrice = itemPkgData.promotePrice;
      itemPkgData.pkgData.package.oldPrice = itemPkgData.oldPrice;
      itemPkgData.pkgData.package.price = itemPkgData.price;
      itemPkgData.pkgData.package.lastQty = pkgNum;
      // 常规套餐修改
      if (itemPkgData.pkgType == '0') {
        // 对数据的数量进行整理处理下defaultQty都初始为0 不然影响弹框的显示
        itemPkgData.pkgData.pkgClasses.forEach((pkgCls) => {
          pkgCls.mergePkgDtList.forEach((mergeItem) => {
            mergeItem.defaultQty = 0;
          });
          pkgCls.normalDtList.forEach((list) => {
            list.defaultQty = 0;
            // 对添加的上菜方式添加更新
            itemPkgData.pkgList.forEach((_) => {
              if (
                list.realItemId == _.id
                && list.itemSizeId == _.sizeId
                && _.serveWay
              ) {
                list.serveWay = _.serveWay;
              }
              // list.id &&list.serveWay =  _.serveWay
            });
          });
        });
        itemPkgData.pkgData.pkgUnSelectedItems.forEach((item) => {
          item.count = 0;
          item.defaultQty = 0;
          itemPkgData.pkgList.forEach((pkgItem) => {
            if (
              pkgItem.id == item.realItemId
              && pkgItem.sizeId == item.itemSizeId
            ) {
              item.count = pkgItem.num;
            }
          });
        });
        this.$set(itemPkgData.pkgData, 'isOrderingModify', true);
        this.$refs.PackageNormalChange.open(itemPkgData.pkgData, {
          // 回调的传参中pkgNormalData 代表要用到的数据 pkgData代表套餐弹框原有的数据用来套餐修改
          submit: (pkgNormalData, pkgData) => {
            // 关闭弹框
            this.$refs.PackageNormalChange.close();
            this.modifyPkgItemCallback(itemPkgData, pkgNormalData, pkgData);
          },
        });
        // 宴会套餐的修改
      } else if (itemPkgData.pkgType == '1') {
        itemPkgData.pkgList.forEach((_) => {
          itemPkgData.pkgData.pkgSelectedItems.forEach((item) => {
            if (
              _.id == item.realItemId
              && _.sizeId == item.itemSizeId
              && _.serveWay
            ) {
              item.serveWay = _.serveWay;
            }
          });
        });
        this.$refs.PackagePartChange.open(itemPkgData.pkgData, {
          // 回调的传参中pkgNormalData 代表要用到的数据 pkgData代表套餐弹框原有的数据用来套餐修改
          submit: (pkgPartData, pkgData) => {
            // 关闭弹框
            this.$refs.PackagePartChange.close();
            if (`${pkgPartData.discFlg}` === '3') {
              this.$set(itemPkgData, 'defaultPriceType', 4);
              this.$set(itemPkgData, 'priceType', 4);
            }
            this.modifyPkgItemCallback(itemPkgData, pkgPartData, pkgData);
          },
        });
      }
    },
    // 请求下套餐的接口 只写了下常规的套餐  //这块可以和缓存的方法写在一起 后期优化,做时脑子短路了哈哈
    getModifypkgItemData(itemPkgs) {
      const { ...itemPkgData } = itemPkgs[0];
      let pkgNum = 0;
      itemPkgs.forEach((_) => {
        pkgNum = add(pkgNum, _.num);
      });
      // 需要去itemPkgs[0].pkgData 缓存的套餐数据进行更新
      // itemPkgData.pkgData.package.discFlg = itemPkgData.discFlg
      // itemPkgData.pkgData.package.lastQty = pkgNum
      if (itemPkgData.pkgType == '0') {
        ajax('canyin.pos.bill.itempkgnormal', {
          params: {
            pkgId: itemPkgData.id,
            scId: itemPkgData.scId ? itemPkgData.scId : '',
            pointId: this.getFastFoodBillData.bsData.pointId,
            isBuffet: itemPkgData.isBuffet, // 是否是自助快餐下没有自助
          },
        }).then((res) => {
          // 清空分类默认的数据
          res.package.isItemTimePrice = itemPkgData.isItemTimePrice
            ? itemPkgData.isItemTimePrice
            : false;
          res.pkgClassesNew.forEach((pkgClass) => {
            pkgClass.normalDtList = [];
          });
          res.package.lastQty = pkgNum;
          res.package.discFlg = itemPkgData.discFlg;
          res.package.memberPrice = itemPkgData.memberPrice;
          res.package.price = itemPkgData.price;
          // 循环已点的套餐的明细进行整理数据
          res.pkgUnSelectedItems.map((menu) => {
            itemPkgData.pkgList.map((list) => {
            // 循环请求套餐过来的可点菜品 找到对应进行整理
              if (menu.realItemId == (list.id ? list.id : list.itemId) && menu.itemSizeId == (list.sizeId ? list.sizeId : list.itemSizeId)) {
                const newPkgeItem = cloneDeep(menu);
                newPkgeItem.count = list.num ? list.num : list.lastQty;
                newPkgeItem.methodList = list.methodList;
                res.pkgClassesNew.forEach((pkgCls) => {
                  if (pkgCls.pkgClassId == newPkgeItem.pkgClassId) {
                    pkgCls.normalDtList.push(newPkgeItem);
                  }
                });
              }
            });
          });
          // let reserveOrdePkgData = Object.assign(res.data, {scId: null})
          this.$refs.PackageNormalChange.open(res, {
            // 回调的传参中pkgNormalData 代表要用到的数据 pkgData代表套餐弹框原有的数据用来套餐修改
            submit: (pkgNormalData, pkgData) => {
              this.$refs.PackageNormalChange.close(); // 关闭弹框
              this.modifyPkgItemCallback(itemPkgData, pkgNormalData, pkgData);
            },
          });
        });
      } else {
        ajax('canyin.pos.bill.itempkgpart', {
          params: {
            pkgId: itemPkgData.id,
            scId: itemPkgData.scId ? itemPkgData.scId : '',
            pointId: this.getFastFoodBillData.bsData.pointId,
            isBuffet: itemPkgData.isBuffet, // 是否是自助快餐下没有自助
          },
          needLog: true,
        }).then((res) => {
          const resData = cloneDeep(res);
          // 如果是以入库联动的套餐明细的需要做下特殊处理
          if (itemPkgData.scId && !itemPkgData.isNotFollowAmount) {
            resData.pkgSelectedItems.map((list) => {
              list.defaultQty = (list.defaultQty * 1000) / (resData.package.lastQty * 1000);
            });
          }
          this.$refs.PackagePartChange.open(resData, {
          // 回调的传参中pkgNormalData 代表要用到的数据 pkgData代表套餐弹框原有的数据用来套餐修改
            submit: (pkgPartData, pkgData) => {
            // 关闭弹框
              this.$refs.PackagePartChange.close();
              this.modifyPkgItemCallback(itemPkgData, pkgPartData, pkgData);
            },
          });
        });
      }
    },
    // itemPkgData 要修改的原有加单的数据 modifyPkgItemData 修改完后的数据 pkgData为修改完后的套餐原类型的所有数据用来修改用的
    modifyPkgItemCallback(itemPkgData, modifyPkgItemData, pkgData) {
      /** 又由于这个改量加单都是一一个的加把是个组数不是一个数据
       * 先需要把以前的组数数据都从加单数组this.guestList里删除掉在加
       */
      // this.guestList.splice(indexOf(this.guestList, finded), 1)
      // 找到要插入新的数据的index
      let addIndex = 0;
      // 删除原有的数据
      this.controlActive((finded) => {
        addIndex = indexOf(this.guestList, finded);
        this.guestList.splice(indexOf(this.guestList, finded), 1);
      });
      // 重新生成下lid 和uid
      const lid = uniqueId();
      // 合并下数据
      let newPkgItemData = Object.assign({}, itemPkgData, modifyPkgItemData);
      //
      this.$set(newPkgItemData, 'pkgData', pkgData);
      this.$set(newPkgItemData, 'modifyPkg', true);
      newPkgItemData = extend({}, newPkgItemData, { lid, active: true });
      // 添加修改完的数据
      this.guestList.splice(addIndex, 0, newPkgItemData);
      // 重新设置下被选中账单的品项
      this.setActiveItem(newPkgItemData);
      this.updateBillCurrentElId(newPkgItemData);
    },
    // 赠菜前校验权限
    checkBeforeGive(giveDish, authData = {}) {
      const {
        id, price, oldPrice, smallClassId, num,
      } = giveDish;
      const params = {
        itemId: id, // 品项id 必填
        presentMoney: price, // 赠单金额
        type: null, // 类型 1+ 2- 3不变
        itemSmallClassId: smallClassId, // 品项小类 必填
        price: oldPrice, // 原价格
        qty: num, // 数量
        ...authData,
      };
      return ajax('canyin.pos.fastfoodpresentauth.check', {
        contentType: 'paramsEncoded',
        data: {
          ...params,
        },
      });
    },
    // 赠菜业务 num 赠菜数量 id 赠送原因id authData授权信息
    async orderingGive(num, id, authData = {}) {
      this.$vonce('authCode', (code) => {
        this.orderingGive(num, id, code);
      });
      let lastActive = null;
      let isHaveRelaCountMethod = false;
      // 记录下要修改的数量
      const giveNum = num;
      // const activeDish = this.getActiveItem();
      // const activeDishList = this.getActiveList();
      const activeDish = this.billCurrentItem;
      const activeDishList = this.billCurrentItemList;
      // 计算下当前被点击的品项总数量
      const activeNum = activeDishList.reduce((sum, item) => add(sum, item.num), 0);
      const giveDish = find(activeDishList, { id: activeDish.id, sizeId: activeDish.sizeId });
      if (!giveDish) return;
      const result = await this.checkBeforeGive(giveDish, authData);
      if (result) {
        if (+result.result === -2) {
          this.$vemit('posAuthCheck', { message: result.msg });
          return;
        }
        if (+result.result === -1) {
          this.$message.error(`${result.msg}`);
          return;
        }
      }
      each(activeDishList, (item) => {
        // 判断如果当前操作的品项含有做法并且是固定的做法类型
        // 执行部分赠送的时候被赠送的品项是不行含有做法的
        isHaveRelaCountMethod = isHaveRelaCountMethod || (item.methodList
            && item.methodList.some(method => method.price && !method.isRelaCount)
        );
        if (num > 0) {
          if (num < item.num) {
            const diff = sub(item.num, num);
            item.num = num;
            this.guestListAdd(extend({}, item, { num: diff }));
          }
          // 赠菜之前先保存一下老的discFlg 为的是取消赠菜把标识还原回去
          this.$set(item, 'oldDiscFlg', item.discFlg);
          item.discFlg = 1;
          item.reasonId = id;
          item.defaultPriceType = 1;
          lastActive = item;
          num = sub(num, item.num);
        } else {
          return false;
        }
      });
      // 判断是否含有固定做法并且是部分赠送的时候
      if (isHaveRelaCountMethod && activeNum > giveNum) {
        activeDishList.forEach((list) => {
          if (+list.discFlg === 1) {
            this.$delete(list, 'methodList');
          }
        });
      }
      this.$log.info(`赠菜记录id${lastActive.id},当前时间===${new Date()}`);
      this.$vemit('closeFastFoodOrderingGiveModal');
      this.guestList.splice(this.billCurrentIndex, 1, lastActive);
      this.updateBillCurrentElId(lastActive);
      // this.setActiveItem(lastActive);
    },
    // getOrderingElId(item) {
    //   return [
    //     item.lid,
    //     item.id,
    //     item.sizeId,
    //     item.serveWay ? item.serveWay.id : '-1',
    //   ].join('.');
    // },
    // 取消赠菜业务
    orderingCancelGive() {
      let activeItems = [];
      let lastActive = null;
      const methodSet = new Set();
      // const activeElId = this.getOrderingElId(this.getActiveItem());
      // activeItems = this.guestList.filter(list => activeElId === this.getOrderingElId(list));
      activeItems = this.billCurrentItemList;
      let method_lists = [];
      let isCheckedMethod = false;
      //  这块处理主要是针对 赠送取消后合并，如果没被赠送的品项上有做法合并完要带上
      if (activeItems.length > 1) {
        isCheckedMethod = activeItems.some((item, index) => {
          if (item.methodList && item.methodList.length && +item.discFlg !== 1) {
            methodSet.add(JSON.stringify(item.methodList));
            method_lists = cloneDeep(item.methodList);
            return true;
          }
        });
      }
      // 找到对应带做法的品项给每个品项都赋值
      activeItems.forEach((item) => {
        let giveIsHaveMethod = false;
        if (+item.discFlg === 1) {
          item.discFlg = item.oldDiscFlg;
          item.reasonId = '';
          item.priceType = item.oldPriceType;
          item.defaultPriceType = item.oldPriceType;
          lastActive = item;
          if (item.methodList && item.methodList.length) {
            if (!methodSet.has(JSON.stringify(item.methodList))) {
              item.lid = uniqueId();
              giveIsHaveMethod = true;
            }
          }
        }
        if (isCheckedMethod && !giveIsHaveMethod) {
          item.methodList = method_lists;
        }
      });
      this.$log.info(`取消赠菜记录id${lastActive.id},当前时间===${new Date()}`);
      if (this.getFastFoodMemberPlanFlg.isDoMemberPrice) {
        this.$vemit('doMemberPriceBus', true);
      } else {
        this.$vemit('cancelMemberPriceBus', true);
      }
      this.guestList.splice(this.billCurrentIndex, 1, lastActive);
      this.updateBillCurrentElId(lastActive);
      // this.setActiveItem(lastActive);
    },
    // 小类数量限定判断
    limitItemSamllClsNumJudge(item, changeNum) {
      const limitSmallClsItemNum = this.haveLimitSmallClasses[item.smallClassId];
      if (limitSmallClsItemNum) {
        // 入库的当前菜对应的小类已点的总数
        // const orderItemSmClsTotal = this.getActiveOrderItemSmClsTotal(item.smallClassId);
        const orderingItemSmClsTotal = this.getActiveOrderItemSmClsTotal(item.smallClassId, this.guestList, 'num');
        if (limitSmallClsItemNum < add(orderingItemSmClsTotal, changeNum)) {
          this.$message.error(`菜品所属小类限定数为${limitSmallClsItemNum}`);
          return false;
        }
      }
      return true;
    },
    // 改量业务
    orderingChangeNum(num) {
      const activeCount = this.getActiveCount();
      if (num >= activeCount) {
        const diff = sub(num, activeCount);
        const finded = this.getCurrentItem();
        if (finded) {
          if (!finded.isConfirmWeigh && !this.limitItemSamllClsNumJudge(finded, diff)) {
            return false;
          }
          finded.num = add(finded.num, diff);
          this.guestList.splice(
            this.billCurrentIndex,
            1,
            extend({}, finded, { num: add(finded.num, diff) }),
          );
        }
      } else if (num && activeCount > num) {
        let diff = sub(activeCount, num);
        each(this.billCurrentItemList, (item) => {
          if (diff == 0) {
            return false;
          } if (diff >= item.num) {
            this.guestList.splice(indexOf(this.guestList, item), 1);
            diff = sub(diff, item.num);
          } else {
            // 半份的时候
            this.guestList.splice(
              indexOf(this.guestList, item),
              1,
              extend({}, item, { num: sub(item.num, diff) }),
            );
            return false;
          }
        });
      }
    },
    // 改价前校验权限
    checkBeforeChangePrice(giveDish, authData = {}) {
      const {
        id, pointId,
      } = this.getFastFoodBillData.bsData;
      const params = {
        bsId: id, // 营业流水
        pointId, // 客位id
        itemId: giveDish.id, // 品项id
        itemSmallClassId: giveDish.smallClassId, // 品项所属小类
        ...authData,
      };
      return ajax('canyin.pos.fastfoodchangepriceauth.check', {
        contentType: 'paramsEncoded',
        data: {
          ...params,
        },
      });
    },
    // 改价业务改变的都是销售价格
    async orderingChangePrice(price, authData = {}) {
      this.$vonce('authCode', (code) => {
        this.orderingChangePrice(price, code);
      });
      // const activeDish = this.getActiveItem();
      // const activeDishList = this.getActiveList();
      // const giveDish = find(activeDishList, { id: activeDish.id, sizeId: activeDish.sizeId });
      const giveDish = this.billCurrentItemList[0];
      if (!giveDish) return;
      const result = await this.checkBeforeChangePrice(giveDish, authData);
      if (result) {
        if (+result.result === -2) {
          this.$vemit('posAuthCheck', { message: result.msg });
          return;
        }
        if (+result.result === -1) {
          this.$message.error(`${result.msg}`);
          return;
        }
      }
      if (this.posFastFood.xianGuoAddOrderBarType === 1) this.$vemit('closeFastFoodChangePriceModal');
      this.controlActive((finded) => {
        if (!finded || finded.discFlg === 1) return;
        finded.discFlg = 3;
        finded.price = price;
        finded.salePrice = price;
        finded.priceType = 4;
        finded.oldPriceType = 4;
        finded.oldDisFlg = 3;
        finded.defaultPriceType = 4;
        this.guestList.splice(this.billCurrentIndex, 1, finded); // 先删除再添加新数据
        this.updateBillCurrentElId(finded);
        // this.setActiveItem(finded);
      });
    },
    // 改做法业务
    fastFoodChangeMethods(methodData) {
      // 所有作法的加价总额
      let isPack = false;
      // 对所有加单品项有效
      if (this.packMethod) {
        const packMethod = methodData.methodList.find(item => item.id === this.packMethod.id && item.name === this.packMethod.name);
        isPack = packMethod && packMethod.packFlg;
      }
      if (methodData.publicIsValid) {
        const [...newGuestListData] = this.guestList; // 克隆下
        this.guestList = []; // 清空下
        // let isPriceMethod = false; // 是否是有价格的做法 未使用注释
        newGuestListData.forEach((list) => {
          // methodsPriceTotal = 0;
          // 这个后期可能去掉,套餐也要支持做法带价格
          // methodData.methodList.forEach((method) => {
          //   // 是否需要制作费用计算下所有的做法费用的价格总额
          //   if (method.price) {
          //     // isPriceMethod = true; // 未使用注释
          //     // isRelaCount是否按数量加价
          //   }
          // });
          // 这里对套餐品项做下特殊处理, 套餐主品项不能添加做法
          if (list.isPackage) {
            this.guestListAdd(list);
            return;
          }
          // 存在合并去重
          if (list.methodList && list.methodList.length) {
            const mergeMethodList = [...list.methodList, ...methodData.methodList];
            const hash = {};
            const newMethodList = mergeMethodList.reduce((preVal, curVal) => {
              hash[`${curVal.id}${curVal.name}`] ? '' : hash[`${curVal.id}${curVal.name}`] = true && preVal.push(curVal);
              return preVal;
            }, []);
            this.$set(list, 'methodList', newMethodList);
          } else {
            // 如果不存在就添加
            this.$set(list, 'methodList', methodData.methodList);
          }
          if (!list.isPincai) {
            this.$set(list, 'lid', uniqueId());
          }
          this.$set(list, 'isPack', isPack);
          this.guestListAdd(list);
          this.guestList.push(list);
          this.updateBillCurrentElId(list);
          // this.setActiveItem();
        });
      } else {
        // 只对自己有效
        let curItem = {};
        this.billCurrentItemList.forEach((_list) => {
          this.$set(_list, 'methodList', methodData.methodList);
          if (!_list.isPincai) {
            this.$set(_list, 'lid', uniqueId());
          }
          this.$set(_list, 'isPack', isPack);
          curItem = _list;
        });
        this.guestList.splice(this.billCurrentIndex, 1, curItem); // 先删除再添加新数据 解决修改数据不更新问题
        this.updateBillCurrentElId(curItem);
        // this.setActiveItem(curItem);
      }
    },
    // 所选品项的总数量
    getActiveCount() {
      return reduce(
        // this.getActiveList(),
        this.billCurrentItemList,
        (sum, item) => add(sum, item.num),
        0,
      );
    },
    // 提示的公共方法
    isShowMessage(message, type, duration) {
      const options = {
        message: message || this.$t('Dict.PromptInfo'), // 提示的内容
        type: type || 'error', // 类型 success/warning/info/error
        duration: duration || 1500, // 显示的时间
        center: true, // 中间显示
      };
      Message(options); // 需要多的可以查看element-ui 的官网 Message组件
    },
    // 更多操作点击事件
    fastFoodBillFunction(method) {
      if (method && this.$refs[method]) {
        if (this[method]) {
          this[method](method); // 执行对应的方法
        } else {
          this.$message.error(this.$t('Biz.Order.ModuleNotFound'));
        }
        // this.$refs[method].open()
      } else if (this[method]) {
        this[method]();
      } else {
        this.$message.error(this.$t('Biz.Order.ModuleNotFound'));
      }
    },
  },

};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
@btnHide-leftW: 306px;
.pos-fastfood-container {
  position: relative;
  height: 100%;
  padding-left: @pos-order-left-width;
  // 隐藏加单工具栏样式调整,
  &.btnHide {
    padding-left: @btnHide-leftW;
    .pos-fastfood-left {
      width:@btnHide-leftW;
      padding-right: 0;
    }
  }
  .tilingMask {
    overflow: hidden;
    width: calc(100% - @btnHide-leftW);
    height: calc(100% + 48px);
    background: rgba(0,0,0, .3);
    position: absolute;
    left: calc(@btnHide-leftW);
    top: -48px;
    z-index: 99;
  }
}

.pos-fastfood-left {
  position: absolute;
  left: 0;
  top: 0;
  .size(@pos-order-left-width, 100%);
  padding-right: @pos-order-btns-width;
}
.pos-fastfood-right {
  position: relative;
  height: 100%;
}
.pos-fastfood-menu {
  height: 100%;
}
.lang-enUS {
  .pos-fastfood-container {
    padding-left: 390px;
  }
}
</style>
