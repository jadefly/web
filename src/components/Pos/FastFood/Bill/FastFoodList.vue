<template>
  <div class="pos-order-bill-list"
    :style="{'padding-top': showCrmMember && (showCrmMember.mobile || showCrmMember.cardType || showCrmMember.memberName) ? '54px' : ''}" >
    <!-- 会员验证 显示 -->
    <FastFoodCrmInfo
      ref="FastFoodCrmInfo"
      v-if="showCrmMember && (showCrmMember.mobile || showCrmMember.cardType || showCrmMember.memberName)"
      v-model="showCrmMember"></FastFoodCrmInfo>
    <!--这是加单账单的显示 -->
    <!--<h1 style="position: fixed;z-index: 9999" @click="demo">click me {{ getSettleDiscType }}</h1>-->
    <div
    :id="posOrderingListId"
    ref="posOrderingListId"
    class="pos-order-bill-list-view is-ordering">
      <ul v-if="!posBaseInfo.isFastFoodPrepare"
        v-clickoutside="handleClose"
        :class="{haveSelectedItem: billSelected}">
        <!-- guestListData 快餐牌号，人数下的品项列表 -->
        <li
          v-for="(item, index) in guestListData"
          :key="index"
          :class="{ active: currentItem && currentItem == item.elId }"
          :ref="item.elId"
          @click="orderingClickHandler(item, index)" >
          <div class="a">
            <div v-show="item.isPack" class="pack-icon"></div>
            <div class="b"><em>{{ index + 1 }}</em></div>
            <div class="c">
              <div class="itemMainMessage" :class="{pkgItemClickClass: item.isPackage}">
                <div class="d">
                  <h3>
                    {{ item.exchangeId ?
                    `[${$t('Dict.Repurchase')}]` : '' }}
                    {{ (!item.exchangeId && item.bindId) ?
                    $t('Biz.Order.SpellFoodTag') : ''
                    }}{{
                        item.fullGiftId
                        ? `[${$t('Dict.Gift')}]`
                        : ''
                      }}{{ item.itemType == 2 ?
                    `[${$t('Dict.Temporary')}]` : ''
                    }}
                    {{ item.sizeName ? ('('+item.sizeName+')'+item.name) : item.name }}
                  </h3>
                  <div class="e">
                    <em v-if="item.discFlg == 1" class="give">{{ $t('Dict.Gift') }}</em>
                    <em v-if="item.discFlg == 2" class="discount">{{ $t('Dict.Discount') }}</em>
                    <em v-if="item.defaultPriceType == 4" class="changed">{{ $t('Dict.Change') }}</em>
                    <em v-if="item.defaultPriceType == 3" class="promotion">{{ $t('Dict.Promotion') }}</em>
                    <em v-if="item.defaultPriceType == 2" class="vip">{{ $t('Dict.Vip') }}</em>
                    <em v-if="item.hastenTimes" class="hasten">{{ $t('Dict.Hasten') }}</em>
                    <em v-if="item.isConfirmWeigh" class="give">{{ $t('Dict.ConfirmWeigh') }}</em>
                    <em v-if="item.isPackage" class="package">{{ $t('Dict.Package') }}</em>
                    <em v-if="item.methodCount > 0 && item.TagID" class="easy-icon"></em>
                  </div>
                </div>
                <div class="f">
                  <div class="g">{{$t('Dict.UnitPrice')}}:
                    <span>{{ item.price }} </span>
                    <del v-if="item.price != item.salePrice">{{ item.salePrice }}</del>
                  </div>
                  <div class="h">{{ item.lastQty }} {{ item.unitName }}</div>
                  <div class="i">{{$t('Dict.Subtotal')}}:{{ item.lastSubtotal }}</div>
                </div>
              </div>
              <div class="redemption-box" v-show="item.isExchange && !item.exchangeId">
                <span @click.stop="goRedemption(item, index)" v-show="true">{{ $t('Biz.Order.GoOptional') }}<i class="icon icon-pager-next"></i></span>
              </div>
              <div class="j">
                <span v-for="(method, i) in item.methodList" :key="method.id">
                    {{ (i == 0) ?
                    `${$t('Dict.Notes')}: ` : ' | ' }}{{ method.name }}{{ method.isNeedFee ?
                    '(+'+ method.price + (method.qty && method.qty!=1 ? 'x'+ method.qty : '') + ')' : '' }}
                </span>
              </div>
              <ul class="k" v-if="item.pkgList">
                <li v-for="(setitem , index) in item.pkgList" :key="index">
                  <p class="pkgItemMainContent">
                    <i class="icon icon-dian1"></i>
                    <span class="setmealitem">{{setitem.name}}</span>
                    <span class="setmealitemnum">{{ setitem.num ? setitem.num : setitem.qty}}{{setitem.unitName}}</span>
                    <!-- 加价的显示 -->
                    <!-- 加价的显示 分普通和会员加价-->
                    <span class="raisePrice" v-show="!isShowRaiseMemberPrice(item, setitem)">
                      {{ setitem.raisePrice > 0 ? (setitem.isRaiseByQty ? '+'+(setitem.realRaisePrice ?
                      setitem.realRaisePrice : setitem.raisePrice)+'x'+setitem.num : '+'+(setitem.realRaisePrice ?
                        setitem.realRaisePrice : setitem.raisePrice)) :(setitem.realRaisePrice > 0 ? '+'+setitem.realRaisePrice : '') }}</span>
                    <span class="raisePrice memberPrice" v-show="isShowRaiseMemberPrice(item, setitem)">
                      {{ setitem.isRaiseByQty && setitem.num != 1 ? '+'+setitem.raiseMemberPrice+'x'+setitem.num : '+'+setitem.raiseMemberPrice }}</span>

                  </p>
                  <!--这是没有入库上菜方式和做法的渲染 -->
                  <p class="pkgItemServeContent">
                      <span v-if="setitem.methodList && setitem.methodList.length">
                        <template v-for="(method, i) in setitem.methodList">{{ i == 0 ? `${$t('Dict.Notes01')}` : ' | ' }}{{ method.name }}{{pkgListShowMethodText(method)}}
                        </template>
                      </span>
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </li>
      </ul>

      <ul v-else class="prepareUl">
        <li v-for="(item, index) in guestListData"
          :key="index + item.elId"
          :class="{ active: billCurrentElId && billCurrentElId == item.elId, pkgItemClickClass: item.isPackage }"
          :ref="item.elId"
          @click="orderingClickHandler(item, index)">
          <div v-show="item.isPack" class="pack-icon"></div>
          <div class="foot_title">
            <h3>
              <span class="foot_name">{{ item.exchangeId ?
                `[${$t('Dict.Repurchase')}]` : '' }}{{ item.bindId ?
                $t('Biz.Order.SpellFoodTag') : '' }}{{ item.itemType == 2 ?
                `[${$t('Dict.Temporary')}]` : '' }}
                {{
                  item.fullGiftId
                  ? `[${$t('Dict.Gift')}]`
                  : ''
                }}
                {{ item.sizeName ? ('('+item.sizeName+')'+item.name) : item.name }}
              </span>

              <!-- “变”、“促”、“折”、“会”、“赠” “套”小图标-->
              <em v-if="item.discFlg == 1" class="give">{{ $t('Dict.Gift') }}</em>
              <em v-if="item.discFlg == 2" class="discount">{{ $t('Dict.Discount') }}</em>
              <em v-if="item.defaultPriceType == 4" class="changed">{{ $t('Dict.Change') }}</em>
              <em v-if="item.defaultPriceType == 3" class="promotion">{{ $t('Dict.Promotion') }}</em>
              <em v-if="item.defaultPriceType == 2" class="vip">{{ $t('Dict.Vip') }}</em>
              <em v-if="item.hastenTimes" class="hasten">{{ $t('Dict.Hasten') }}</em>
              <em v-if="item.isConfirmWeigh" class="give">{{ $t('Dict.ConfirmWeigh') }}</em>
              <em v-if="item.methodCount > 0 && item.TagID" class="easy-icon"></em>
              <em v-if="item.isPackage" class="package">{{ $t('Dict.Package') }}</em>

              <span class="foot_zhushi">
                <span v-for="(method, i) in item.methodList" :key="method.id">
                    {{ (i == 0) ?
                    `${$t('Dict.Notes')}: ` : ' | ' }}{{ method.name }}{{ method.isNeedFee ?
                    '(+'+ method.price + (method.qty && method.qty!=1 ? 'x'+ method.qty : '') + ')' : '' }}
                </span>
              </span>
            </h3>
            <div class="foot_num">{{ item.lastQty }}{{ item.unitName }}</div>
          </div>

          <ul class="foot_pkg" v-if="item.pkgList">
            <li v-for="(setitem , index) in item.pkgList" :key="index">
              <i class="icon icon-dian1"></i>
              <div class="pkg_name">
                <span class="setmealitem">{{setitem.name}}</span>
                <!--这是没有入库上菜方式和做法的渲染 -->
                <span class="foot_zhushi" v-if="setitem.methodList && setitem.methodList.length">
                  <template v-for="(method, i) in setitem.methodList">{{ i == 0 ? `${$t('Dict.Notes01')}` : ' | ' }}{{ method.name }}{{pkgListShowMethodText(method)}}
                  </template>
                </span>
              </div>
              <span class="setmealitemnum">{{ setitem.num ? setitem.num : setitem.qty}}{{setitem.unitName}}</span>
              <!-- 加价的显示 分普通和会员加价-->
              <!-- <span class="raisePrice" v-show="!isShowRaiseMemberPrice(item, setitem)">
                {{ setitem.raisePrice > 0 ? (setitem.isRaiseByQty ? '+'+(setitem.realRaisePrice ?
                  setitem.realRaisePrice : setitem.raisePrice)+'x'+setitem.num : '+'+(setitem.realRaisePrice ?
                  setitem.realRaisePrice : setitem.raisePrice)) :(setitem.realRaisePrice > 0 ? '+'+setitem.realRaisePrice : '') }}
              </span>
              <span class="raisePrice memberPrice" v-show="isShowRaiseMemberPrice(item, setitem)">
                {{ setitem.isRaiseByQty && setitem.num != 1 ? '+'+setitem.raiseMemberPrice+'x'+setitem.num : '+'+setitem.raiseMemberPrice }}
              </span> -->
            </li>
          </ul>
        </li>

        <!-- 备餐列表 只显示 无点击事件-->
        <template v-for="(preItem, preIndex) in prepareFoodsData">
          <li v-for="(item, index) in preItem"
            :key="preIndex+'_'+index"
            :class="{ pkgBg_1: preIndex==0, pkgBg_2: preIndex==1}">
            <div class="foot_title">
              <h3>
                <span class="foot_name">{{ item.exchangeId ?
                  `[${$t('Dict.Repurchase')}]` : '' }}{{ item.bindId ?
                  $t('Biz.Order.SpellFoodTag') : '' }}{{ item.itemType == 2 ?
                  `[${$t('Dict.Temporary')}]` : '' }}
                  {{ item.sizeName ? ('('+item.sizeName+')'+item.name) : item.name }}
                </span>

                <!-- 只显示“套”小图标-->
                <em v-if="item.isPackage" class="package">{{ $t('Dict.Package') }}</em>

                <span class="foot_zhushi">
                  <span v-for="(method, i) in item.methodList" :key="method.id">
                      {{ (i == 0) ?
                      `${$t('Dict.Notes')}: ` : ' | ' }}{{ method.name }}{{ method.price ?
                      '(+'+ method.price + (method.qty && method.qty!=1 ? 'x'+ method.qty : '') + ')' : '' }}
                  </span>
                </span>
              </h3>
              <div class="foot_num">{{ item.lastQty }}{{ item.unitName }}</div>
            </div>

            <ul class="foot_pkg" v-if="item.pkgList">
              <li v-for="(setitem , index) in item.pkgList" :key="index">
                <i class="icon icon-dian1"></i>
                <div class="pkg_name">
                  <span class="setmealitem">{{setitem.name}}</span>
                  <!--这是没有入库上菜方式和做法的渲染 -->
                  <span class="foot_zhushi" v-if="setitem.methodList && setitem.methodList.length">
                    <template v-for="(method, i) in setitem.methodList">{{ i == 0 ? `${$t('Dict.Notes01')}` : ' | ' }}{{ method.name }}{{pkgListShowMethodText(method)}}
                    </template>
                  </span>
                </div>
                <span class="setmealitemnum">{{ setitem.num ? setitem.num : setitem.qty}}{{setitem.unitName}}</span>
              </li>
            </ul>
          </li>
        </template>

      </ul>
    </div>

    <div class="billShowBoxFoot">
      <div v-if="posFastFood.xianGuoAddOrderBarType===0" class="btn_del" @click="btnDelFn" :class="{disabled: !this.guestList.length}">
        <svg class="svgIcon" aria-hidden="true"><use xlink:href="#icon-delete"></use></svg> 删除
      </div>
      <!--整单备注 -->
      <div class="posMainBillBsRemark" @click="orderingBillRemark">
        <i class="icon icon-edit"></i>
        <span :class="[
          { 'defuletRemark': ssRemark === '' },
          { 'orderingRemark': ssRemarkLength }
        ]">{{ ssRemark === '' ? `&lt;${$t('Dict.BillRemarks')}&gt;` : ssRemark }}</span>
      </div>
      <div class="billShowBoxFootRight">
        <Pager :pagerId="posOrderingListId" scrollMode="simple" ref="pager"
          arrowDirection="up-down"></Pager>
      </div>
    </div>
    <remark-modal ref="remarkModal"
      v-model="remarkData"
    ></remark-modal>
    <PointListPackageNormalChange
      ref="packageNormalChange"
      type="fastfoodOrderChange"
      submitId="fastfoodPackageNormalChange"></PointListPackageNormalChange>
    <PointListPackagePartChange
      ref="packagePartChange"
      type="fastfoodOrderChange"
      submitId="fastfoodPackagePartChange">
    </PointListPackagePartChange>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
import {
  groupBy,
  map,
  reduce,
  find,
  each,
  last,
  cloneDeep,
  isString,
  isPlainObject,
  extend,
  sortBy, // 排序默认正序
  concat,
} from 'lodash';
import { MessageBox } from 'element-ui';
import Pager from '@/components/Pos/Common/Pager';
import {
  add, sub, multi, round,
} from '@/common/js/math';
import ajax from '@/common/js/ajax';
import RemarkModal from '@/components/Pos/Business_commons/RemarkModal';
import FastFoodCrmInfo from './FastFoodCrmInfo';

/** 异步加载组件
    常规套餐 */
const PointListPackageNormalChange = (resolve) => {
  import('../../Ordering/Menu/Package/PackageNormal').then((module) => {
    resolve(module);
  });
};

// 宴会套餐
const PointListPackagePartChange = (resolve) => {
  import('../../Ordering/Menu/Package/PackagePart').then((module) => {
    resolve(module);
  });
};

export default {
  components: {
    Pager,
    RemarkModal,
    FastFoodCrmInfo,
    PointListPackagePartChange,
    PointListPackageNormalChange,
  },
  props: {
    guestList: {
      type: Array,
      default() {
        return [];
      },
    },

    saleTypeId: {
      type: Number,
      default() {
        return 1;
      },
    },
    // 免厨打的判断
    unKitchenPrinting: {
      type: Boolean,
      default: false,
    },
    // 团队加单
    isTeamAdd: {
      type: Boolean,
      default: false,
    },
    // 修改点餐员
    changeWaiterId: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      enablePrepareFoods: true, // 是否开启备餐
      pager: null,
      currentItem: null,
      posOrderingListId: 'posOrderingListId', // 加单账单显示id
      posOrderBillListId: 'posOrderBillListId', // 账单显示id
      totalPrice: {
        orderingItemTotalPrice: 0, // 优惠之前的合计
        orderingItemLastTotalPrice: 0, // 加单最终的合计
        origTotal: 0,
        lastTotal: 0,
        discTotal: 0,
      },
      // 备注信息
      remarkData: {
        remarkList: [],
        remarkText: '',
      },
      // 整单备注
      activePkgData: {},
      discountMoney: 0,
      // 会员信息(CRM验证会员)
      crmMemberInfo: {
        show: false,
        data: {
          mobile: '',
          cardType: '',
          memberName: '',
        },
      },
    };
  },
  created() {
    // 读取整单备注
    this.$vonce('fastFoodReadRemark', (callback) => {
      callback(this.ssRemark);
    });
    this.$von('leaveFastFood', () => {
      this.currentItem = null;
      this.SET_BILLCURRENTITEM({ current: null, index: -1 });
    });
    // 设置整单备注
    this.$vonce('fastFoodSetRemarkShow', (remarkData) => {
      this.remarkData = {
        remarkList: [],
        remarkText: '',
      };
    });
    // 全局方法: 设置账单显示CRM会员卡认证信息
    this.$von('crmMemberShowOnBillBus', (data) => {
      this.crmMemberInfo.show = data.show;
      this.crmMemberInfo.data.mobile = data.data.mobile;
      this.crmMemberInfo.data.cardType = data.data.cardType;
      this.crmMemberInfo.data.memberName = data.data.memberName;
    });
    this.$von('fastFoodCoverListTotalInfo', (data) => {
      this.totalPrice.origTotal = data ? data.origTotal : 0;
      this.totalPrice.lastTotal = data ? data.lastTotal : 0;
      this.totalPrice.discTotal = data ? data.discTotal : 0;
    });
    this.$von('fastFoodInitSubMonitor', () => {
      this.sendGuestListDataToSubMonitor();
      this.$emit('fastfoodBillLastTotal', this.totalPrice);
    });
  },
  computed: {
    ...mapState({
      fastFoodBillData: state => state.pos.fastFoodBillData, // 快餐的当前账单的数据
    }),
    ...mapState('fastFood', ['billSelected', 'hasDailog', 'isLimitOrSellout', 'billCurrentElId']),
    ...mapGetters([
      'posBaseInfo',
      'getVuexItemLimitsMap',
      'getFastFoodBillData', // 快餐的当前账单的数据
      'posInfo', // 当前pos的一些相关设置
      'posDevice',
      'posFastFood',
      'getSelectDiscountPlanData', // 当前打折活动方案的信息
      'getFastFoodMemberPlanFlg', // 当前营业流水是否执行会员价的状态标识
      'posFastFood',
      'getVuexPromoteItemLimitsMap', // 促销每日限量数据
      // 'getSettleDiscType',  // 当前优惠信息
    ]),
    prepareFoodsData() {
      return this.fastFoodBillData && this.fastFoodBillData.prepareFoods ? this.fastFoodBillData.prepareFoods : [];
    },
    /** CRM卡使用不同数据源: 加载页面, 判断后台数据是否已验证会员; 事件触发, this.crmMemberInfo数据被改写, 不需要computed联动计算
        计算属性最终数据绑定传入子组件 */
    showCrmMember() {
      // getFastFoodBillData判断, 防止无数据时渲染报错
      if (this.getFastFoodBillData) {
        if (this.getFastFoodBillData.crmMemberQueryData.data) {
          this.crmMemberInfo.show = true;
          if (this.getFastFoodBillData.crmMemberQueryData.data) {
            this.crmMemberInfo.data.mobile = this.getFastFoodBillData.crmMemberQueryData.data.mobile;
            this.crmMemberInfo.data.cardType = this.getFastFoodBillData.crmMemberQueryData.data.cardType;
            this.crmMemberInfo.data.memberName = this.getFastFoodBillData.crmMemberQueryData.data.memberName;
          }
        } else {
          this.crmMemberInfo.show = false;
          this.crmMemberInfo.data.mobile = '';
          this.crmMemberInfo.data.cardType = '';
          this.crmMemberInfo.data.memberName = '';
        }
      }
      return this.crmMemberInfo.data;
    },
    // 根据当前选择的品项获取品项的下标 这块暂时用不着
    activeItemIndexs() {
      const arrIndex = [];
      if (this.currentItem) {
        const currentItemData = this.currentItem.split('.');
        this.handleGuestList.forEach((list, index) => {
          if (
            list.lid == currentItemData[0]
            && list.id == currentItemData[1]
            && list.sizeId == currentItemData[2]
            && list.discFlg == currentItemData[3]
            && list.reasonId == currentItemData[4]
          ) {
            arrIndex.push(index);
          }
        });
      }
      return arrIndex;
    },
    // 从这 对账单数据做下打折活动方案处理
    handleGuestList() {
      let cloneGuestList = cloneDeep(this.guestList);
      // 存在打折方案了
      if (this.getSelectDiscountPlanData && this.getSelectDiscountPlanData.items.length) {
        // this.discountMoney = 0
        if (this.getFastFoodBillData && !this.getFastFoodBillData.crmData) {
          cloneGuestList = this.discountHandleFn(cloneGuestList);
        }
      } else if (this.getFastFoodBillData && !this.getFastFoodBillData.crmData) {
        cloneGuestList.forEach((list) => {
          // 如果是入库的并且打折的要取消掉 这块做会员卡混合结算的时候要特殊判断处理
          // if (list.bsId && list.discFlg == '2' && !list.discScale) { // discScale不再判断,原因见<discScale字段修正的说明>
          if (list.bsId && list.discFlg == '2') {
            // 设置对应的打折后的价格,和打折标识
            this.$set(list, 'disPrice', null);
            this.$set(list, 'discFlg', 0);
          }
        });
      }
      return cloneGuestList;
    },
    groups() {
      return groupBy(this.handleGuestList, item => this.getElId(item));
    },
    // 数据有点问题
    guestListData() {
      const list = map(this.groups, (item, elId) => {
        // 合并和数量的
        const lastQty = reduce(item, (sum, n) => add(sum, n.num), 0);
        let newItemData = {};
        newItemData = Object.assign({}, item[0], {
          elId,
          list: item,
          lastQty,
          lastSubtotal: 0, // 先赋值一个数 itemSubtotal这个方法有计算的
          is_present_item: item[0].discFlg == 1, // 是否是赠送品项
          pkgType: item[0].pkgType ? item[0].pkgType : null, // 套餐类型
          price: item[0].price, // item[0].price 联动回退
          salePrice: item[0].salePrice, // item[0].salePrice 联动的回退
          promotePrice: item[0].promotePrice, // item[0].promotePrice联动的回退
          isItemTimePrice: item[0].isItemTimePrice ? item[0].isItemTimePrice : false,
          raisePrice: item[0].raisePrice ? item[0].raisePrice : 0,
          memberPrice: item[0].memberPrice, // item[0].memberPrice 联动的回退
        });
        return newItemData;
      });
      /*
      * @函数说明 当前品项的小计计算--做下做法加价,品项加价 &&& 价格计算的处理
      * 方法里包含了此账单的合计
      */
      this.itemSubtotal(list);
      this.getitemsNumberSum(list);
      // 刷新分页组件状态
      if (this.$refs.pager) {
        this.$refs.pager.pushRefresh();
      }
      return list;
    },
    getSettleDiscType() {
      return this.$store.state.pos.settleDiscType;
    },
    orderingItemLastTotalPrice() {
      return this.totalPrice.orderingItemLastTotalPrice;
    },
    // 整单备注
    ssRemark() {
      const { ...colneRemarkData } = this.remarkData;
      let reArr = map(colneRemarkData.remarkList, 'name');
      if (colneRemarkData.remarkText) {
        reArr = concat(reArr, colneRemarkData.remarkText);
      }
      return reArr.join('|');
    },
    // 整单备注字长
    ssRemarkLength() {
      return this.ssRemark.replace(/[^\x20-\xff]/g, 'ab').length > 12;
    },
  },
  methods: {
    ...mapMutations('fastFood', ['SET_BILLCURRENTITEM', 'SET_BILLSELECTED']),
    ...mapActions('fastFood', ['getMethodsInfo', 'getSizeData']),
    // 去换购
    goRedemption(item, index) {
      // submitDish 方法是进行数据转化
      // this.submitDish([item])
      const copyItem = { ...item, index };
      this.$vemit('handleChangeRedemFn', {
        tag: false,
        paymentItems: this.submitDish([item]),
        exchangeMode: 1,
        activeItem: copyItem,
      });
    },
    btnDelFn() { // deleteItem
      if (!this.guestList.length) return;
      // 如果打折活动方案存在的时候不能进行处理
      if (this.getSelectDiscountPlanData) {
        this.$message.warning(`请先取消打折活动方案:${this.getSelectDiscountPlanData.discountPlanName}`);
        return;
      }
      // 争鲜不允许修改账单金额设置    1开启,0未开启
      if (this.posFastFood.isForbiddenEditBillAmount) {
        this.$message.warning('不允许修改账单金额');
        return;
      }
      this.SET_BILLSELECTED(0); // 关闭平铺展示
      this.$emit('deleteItem');
    },
    // 发送账单数据给副屏
    sendGuestListDataToSubMonitor() {
      if (this.posDevice.enableVice) {
        this.$devices.SubMonitor.send({
          moduleName: 'SubMonitor',
          method: 'addDataItem',
          posMode: 3, // 快餐标识
          result: this.guestListData,
        });
      }
    },
    /**
     * 套餐明细的做法的显示,如果价格存在做法的isRelaCount一定为true
     * 前端2.0放开了后台的设置isRelaCount 所以不需要强制为true
     * 如果是临时还是走以前的逻辑
     */
    pkgListShowMethodText(method) {
      if (method.isNeedFee) {
        // 根据method.isRelaCount === undefined 判断是否是临时做法，临时做法走联动逻辑
        if (method.isRelaCount === undefined) {
          this.$set(method, 'isRelaCount', true);
        }
        const qty = method.qty && method.qty !== 1
          ? `x${method.qty}`
          : '';
        return `(+${method.price}${qty})`;
      }
      return '';
    },
    /**
     * 常规套餐会员加价的合计
     * item.isNotFollowAmount ? item.raiseMemberPrice : multi(item.raiseMemberPrice, item.lastQty)
     */
    raiseMemberPriceTotalFn(item) {
      let raiseMemberPriceTotal = 0;
      item.pkgList.forEach((list) => {
        if (list.raiseMemberPrice) {
          raiseMemberPriceTotal = add(raiseMemberPriceTotal, list.raiseMemberPrice);
        }
        if (list.raisePrice) {
          raiseMemberPriceTotal = add(raiseMemberPriceTotal, list.raisePrice);
        } else {
          raiseMemberPriceTotal = add(raiseMemberPriceTotal, list.realRaisePrice);
        }
      });
      return item.isNotFollowAmount
        ? raiseMemberPriceTotal
        : multi(raiseMemberPriceTotal, item.lastQty);
    },
    // 判断是否显示会员加价
    isShowRaiseMemberPrice(pkgData, pkgListData) {
      // pkgMainData
      if (!pkgListData.bsId && pkgData.raisePriceType == 2 && (pkgListData.raiseMemberPrice || pkgListData.raiseMemberPrice == 0)) {
        return true;
      } if (pkgListData.bsId && pkgData.raisePriceType == 2 && (pkgListData.raisePriceType == 2 || pkgListData.raiseMemberPrice || pkgListData.raiseMemberPrice == 0)) {
        return true;
      }
      return false;
    },
    // 拆分数据
    dosplitData(lists) {
      const splitLists = [];
      each(lists, (item) => {
        const cacheItemNum = item.num;
        this.$set(item, 'cacheItemNum', cacheItemNum);
        if (item.num > 1) {
          // 记录下来最初的数量总和
          const numLength = Math.ceil(item.num);
          const remainder = sub(numLength, item.num);
          for (let i = 0; i < numLength; i += 1) {
            item.num = 1;
            if (i === numLength - 1 && remainder) {
              item.num = remainder;
            }
            splitLists.push(cloneDeep(item));
          }
        } else {
          splitLists.push(cloneDeep(item));
        }
      });
      return splitLists;
    },
    // 处理前端打折 方法
    discountHandleFn(lists) {
      lists = this.dosplitData(lists);
      // 先把打折优惠的值初始化
      this.discountMoney = 0;
      // 要进行打折的品项数据
      let discountItems = [];
      lists.forEach((list) => {
        this.getSelectDiscountPlanData.items.map((item) => {
          // 找到要打折的品项,并且这个品项不是处于赠送状态才能进行相应的打折处理 目前只有定额打折,没有比列打折
          if (list.id === item.itemId && list.sizeId === item.itemSizeId && list.discFlg != '1') {
            // 如果入库的数据是打折的先取消
            if (list.bsId && list.discFlg == 2) {
              this.$set(list, 'disPrice', null);
              this.$set(list, 'discFlg', 0);
            }
            this.$set(list, 'discountContent', item);
            discountItems.push(list);
            // discMode 为1的时候打折方案为第N杯打折方案 0 为普通打折方案并且不是普通打折里的异品第N杯打折 下面的是最普通的打折方案 低价优先 判断下当前的显示价格和打折后的价格做下比较
            if (this.getSelectDiscountPlanData.discMode == '0' && !this.getSelectDiscountPlanData.discountNumber && list.price > item.disPrice) {
              // 这个品项打折优惠后的小计
              let discountTotal = 0;
              discountTotal = multi(sub(list.price, item.disPrice), list.num);
              // discountMoney 打折方案优惠的价格总额 设置对应的打折后的价格,和打折标识 新增一个标识表示是前端进行的打折  ,做下四舍五入后最多两位小数处理
              this.discountMoney = add(this.discountMoney, round(discountTotal));
              this.$set(list, 'disPrice', item.disPrice);
              this.$set(list, 'discFlg', '2');
              this.$set(list, 'executeDiscount', true);
            }
          }
        });
      });
      // 如果存在要执行打折品项进行打折
      if (discountItems.length) {
        const re = /^[0-9]+$/;
        // 根据数量进行排序
        discountItems = sortBy(discountItems, 'cacheItemNum');
        // 根据已执行的N杯打折,其设置的"价高优先"或"价低优先"进行排序
        if (this.getSelectDiscountPlanData.discountRule) {
          discountItems = sortBy(discountItems, i => -i.price);
        } else {
          discountItems = sortBy(discountItems, 'price');
        }
        // 为第N杯打折方案
        if (this.getSelectDiscountPlanData.discMode == '1') {
          // 同品打折方案
          if (this.getSelectDiscountPlanData.itemType == '1') {
            // groupBy(discountItems, 'itemId') itemId 为品项的id和品项的sizeId组合
            // if(discountItems)
            const groupItems = {};
            discountItems.forEach((disItem) => {
              const itemkey = `${disItem.id}_${disItem.sizeId}`;
              if (groupItems[itemkey]) {
                groupItems[itemkey].push(disItem);
              } else {
                groupItems[itemkey] = [];
                groupItems[itemkey].push(disItem);
              }
            });
            for (const key in groupItems) {
              const gropData = sortBy(groupItems[key], data => -data.num);
              // 相同品项数量的合计
              const numTotal = reduce(gropData, (sum, n) => add(sum, n.num), 0);
              // 计算出有几杯打折
              const discontNum = Math.floor(numTotal / this.getSelectDiscountPlanData.discountNumber);
              gropData.forEach((item, index) => {
                this.doDiscountNFn(item, index, re, discontNum);
              });
            }
          } else {
            // 异品打折方案 discountNumber为第几杯打折
            discountItems = this.differentItemDiscount(discountItems, this.getSelectDiscountPlanData.discountNumber);
          }
        } else {
          // 普通打折方案里的异品打折
          if (this.getSelectDiscountPlanData.discountNumber) {
            discountItems = this.differentItemDiscount(discountItems, this.getSelectDiscountPlanData.discountNumber);
          }
        }
      }
      this.$emit('setDiscountMoney', this.discountMoney);
      return lists;
    },
    // 是否需要删除品项做法
    isNeedDeleteMethod(item, needDiscoutNum) {
      // 如果被打折的品项含有固定做法要坐下特殊处理
      if (
        item.methodList
          && item.methodList.length
          && item.methodList.some(method => method.price
          && !method.isRelaCount)
      ) {
        // 计算下当前被打折的品项是单独的还是进行拆分过来的
        const cloneDiscoutItem = cloneDeep(item);
        const filterAllDiscountItem = this.guestList.filter(list => this.getElId(list) === this.getElId(cloneDiscoutItem));
        // 如果是拆出来的就需要进行固定做法处理被打折的品项不行含有做法
        if (
          filterAllDiscountItem.length > 1
          || (filterAllDiscountItem[0].num > 1
            && filterAllDiscountItem[0].num > needDiscoutNum
          )
        ) {
          return true;
        }
      }
      return false;
    },
    // 第n杯异品打折
    differentItemDiscount(discountItems, discountNumber) {
      discountItems.forEach((item, index) => {
        // this.doDiscountNFn(item, index, re, differentDiscontNum, difDissatisfaction)
        const needDiscoutNum = Math.floor(discountItems.length / discountNumber);
        if ((index + 1) <= needDiscoutNum) {
          if (item.price < item.discountContent.disPrice) {
            return;
          }
          // 进行做法是否删除判断
          if (this.isNeedDeleteMethod(item, needDiscoutNum)) {
            this.$delete(item, 'methodList');
          }
          this.$set(item, 'disPrice', item.discountContent.disPrice);
          this.$set(item, 'discFlg', '2');
          this.$set(item, 'NCupSaleFlg', true);
          this.$set(item, 'executeDiscount', true);
          // 这个品项打折优惠后的小计
          let discountTotal = 0;
          discountTotal = multi(sub(item.price, item.disPrice), item.num);
          // discountMoney 打折方案优惠的价格总额 设置对应的打折后的价格,和打折标识 新增一个标识表示是前端进行的打折, 做下四舍五入后最多两位小数处理
          this.discountMoney = add(this.discountMoney, round(discountTotal));
        }
      });
      return discountItems;
    },
    // 第N杯打折的赋值
    doDiscountNFn(item, index, re, discontNum) {
      const scaleNum = (index + 1) * 1000 / this.getSelectDiscountPlanData.discountNumber / 1000;
      // 根据当前的位置数除以第几杯打折的数的比例是否是正整数来判断
      // let scaleNum = (index+1)*1000/this.getSelectDiscountPlanData.discountNumber/1000
      // re.test(scaleNum)
      // 根据满足了条件打折前几个打折就行
      // (index+1) <= discontNum;
      if ((index + 1) <= discontNum) {
        // if( item.num < 1 ) {
        //   item = gropData[dissatisfaction.num];
        //   dissatisfaction.num -= 1;
        // }
        // 如果当前的价格小于打折完的价格就不需要去打折
        if (item.price < item.discountContent.disPrice) {
          return;
        }
        if (this.isNeedDeleteMethod(item, discontNum)) {
          this.$delete(item, 'methodList');
        }
        this.$set(item, 'disPrice', item.discountContent.disPrice);
        this.$set(item, 'discFlg', '2');
        this.$set(item, 'NCupSaleFlg', true);
        this.$set(item, 'executeDiscount', true);
        // 这个品项打折优惠后的小计
        let discountTotal = 0;
        discountTotal = multi(sub(item.price, item.disPrice), item.num);
        // discountMoney 打折方案优惠的价格总额 设置对应的打折后的价格,和打折标识 新增一个标识表示是前端进行的打折  ,做下四舍五入后最多两位小数处理
        this.discountMoney = add(this.discountMoney, round(discountTotal));
      }
    },
    // 打折优惠的获取
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
    // 获取当前账单的选中品项的数据
    getActiveItem() {
      return this.currentItem ? this.currentItem : null;
    },
    // 获取当前点击的品项所处数据的下标
    getActiveItemIndex() {
      return this.activeItemIndexs;
    },
    // 拿到账单的最后一条数据
    getLastGuestList() {
      return _.last(this.guestListData);
    },
    // 获取当前选中的数据
    getActiveItemData() {
      return find(this.guestListData, { elId: this.currentItem });
    },
    // 账单品项的点击事件,判断是否是套餐,如果是就直接弹窗修改
    async orderingClickHandler(item, index) {
      // console.log('left品项点击：', item, this.currentItem, this.billCurrentElId);
      let methodsInfo = null;
      let sizeList = null;
      let limitData = null; // 限量数据
      // 判断是否还有active calssName , 如果是选中的状态就触发修改套餐事件
      if (!!this.$refs[item.elId][0].className.match(new RegExp('(\\s|^)' + 'active' + '(\\s|$)'))
        && item.isPackage) {
        this.SET_BILLSELECTED(0);
        this.$emit('modifyItemPackage');
      } else {
        if (this.posFastFood.xianGuoAddOrderBarType === 0 && !item.isPackage) { // 鲜果平铺展示&非套餐
          if (!item.methodsInfo) { // 已存储
            methodsInfo = await this.getMethodsInfo({ url: 'canyin.pos.bill.moremethodandserveway', itemData: item });
          }
          // 有规格,如果限量&估清更新需要重新请求接口
          if (item.sizeId !== '-1' && (!item.sizeList || this.isLimitOrSellout)) {
            sizeList = await this.getSizeData({ itemId: item.id });
          }
          if (this.billCurrentElId === item.elId) { // 同一个品项
            this.SET_BILLSELECTED(1);
          } else {
            this.SET_BILLSELECTED(2); // 切换
          }

          // 添加限量属性
          const limitItem = this.getVuexItemLimitsMap[`${item.id}_${item.sizeId}`];
          if (limitItem) {
            limitData = {
              limit: limitItem.maxLimit, // 限量数
              isLimit: item.sizeId !== '-1' ? true : false,
              limitQuantity: limitItem.limitQuantity,
              limitTotal: limitItem.maxLimit,
            };
          }
        } else {
          this.SET_BILLSELECTED(0);
        };
      }
      // this.setActiveItem(item.elId, { methodsInfo, sizeList, limitData });
      this.SET_BILLCURRENTITEM({ current: item.elId, index }); // 存储-左侧当前选中项
      this.$vemit('changeActiveItemBUS', { methodsInfo, sizeList, limitData });
    },
    // 设置当前账单选中的品项数据
    setActiveItem(elIdOrItem, saveData) {
      if (
        elIdOrItem
        && isString(elIdOrItem)
        && find(this.guestListData, { elId: elIdOrItem })
      ) {
        if (find(this.guestListData, { elId: elIdOrItem })) {
          this.currentItem = elIdOrItem;
        } else {
          this.setActiveItem();
        }
      } else if (elIdOrItem && isPlainObject(elIdOrItem)) {
        if (find(this.guestListData, { elId: this.getElId(elIdOrItem) })) {
          this.currentItem = this.getElId(elIdOrItem);
        } else {
          this.setActiveItem();
        }
      } else {
        this.currentItem = this.guestListData.length
          ? last(this.guestListData).elId
          : null;
      }
      // 跨组件执行: 快餐Index改变按钮状态方法 ??
      // console.log('跨组件执行', this.activeItemIndexs, this.currentItem, this.guestListData); // currentItem 字符串
      this.SET_BILLCURRENTITEM({ current: this.currentItem, index: this.activeItemIndexs }); // 存储-左侧当前选中项
      this.$vemit('changeActiveItemBUS', saveData);
    },
    handleClose(e) { // 点击区域外，设置billSelected为false
      const obj = this.$parent.$parent.$refs.tilingBox;
      const loading = document.querySelector('.ajax-loading');
      // console.log('obj', obj.$el, e.target, this.hasDailog);
      if (obj && obj.$el && obj.$el.contains(e.target)) return;
      if (loading) return; // ajax请求时不关闭
      if (this.hasDailog) return; // 有弹框时不关闭
      this.SET_BILLSELECTED(0);
    },
    // 加单滑动到底部
    scrollToEnd() {
      // 滚动到底部加单的时候
      this.$nextTick(() => {
        const orderingBillBox = this.$refs.posOrderingListId;
        if (orderingBillBox.scrollHeight > orderingBillBox.clientHeight) {
          orderingBillBox.scrollTop = sub(
            orderingBillBox.scrollHeight,
            orderingBillBox.clientHeight,
          );
        }
      });
    },
    getitemsNumberSum(list) {
      const sum = list.reduce((sum, item) => add(sum, item.lastQty), 0);
      this.$emit('getitemsNumberSum', sum);
    },
    // 循环做法加价,如果是套餐还算下明细加价,以及明细做法加价的计算 还有合计的计算
    itemSubtotal(list) {
      // 每次计算都需要初始化 下合计
      this.totalPrice.orderingItemTotalPrice = 0;
      this.totalPrice.orderingItemLastTotalPrice = 0;
      list.forEach((item) => {
        let methodTotal = 0;
        let itemRaisePriceTotal = 0; // 一份常规套餐的明细加价总和
        let oldItemRaisePriceTotal = 0;// 没执行会员价执行加价的合计
        let pkgListTotalMakeFee = 0; // 套餐所有明细的做法总和
        let oldLastSubtotal = 0;// 这是没优惠打折之前的小计
        // 品项价格的总和 itemPriceLastTotal 这代表是最新品项价格的合计 ,itemPriceOldeTotal这是进入界面销售价格的合计
        // 如果是打折小计应是打折完的价格
        const itemPriceLastTotal = (
          item.discFlg == 2
              && (item.disPrice || item.disPrice == 0)
        ) ? multi(item.disPrice, item.lastQty)
          : multi(item.price, item.lastQty);
        // 如果是变价的话,算老的价格小计也要算变价之后的
        let itemPriceOldeTotal = (item.discFlg == 3 && item.priceType == 4) ? multi(item.price, item.lastQty) : multi(item.salePrice, item.lastQty);
        itemPriceOldeTotal = round(itemPriceOldeTotal);
        if (item.methodList && item.methodList.length) {
          item.methodList.forEach((_method) => {
            // 品项所有做法价格的总和(包含联动和不联动)
            if (_method.price) {
              // 如果 isRelaCount 不存在的话说明是临时品项，要做以下处理
              if (_method.isRelaCount === undefined) {
                _method.isRelaCount = true;
              }
              // 现在修改的是做法带有价格算总和的时候都要算上自己的数量和品项的数量
              if (_method.isRelaCount) {
                methodTotal = add(methodTotal, multi(multi(_method.price, _method.qty), item.lastQty));
              } else {
                methodTotal = add(methodTotal, multi(_method.price, _method.qty));
              }
              // _method.isRelaCount = true //如果是价格存在了就一定是跟数量有关 isRelaCount 为true
            }
          });
        }
        // 如果是套餐的话就要就算明细做法和的计算
        if (item.pkgListTotalMakeFee) {
          pkgListTotalMakeFee = item.isNotFollowAmount ? item.pkgListTotalMakeFee : multi(item.pkgListTotalMakeFee, item.lastQty);
        } else if (item.lastMakeFee && item.bsId && item.isPackage) {
          pkgListTotalMakeFee = item.lastMakeFee;
        }
        // 品项如果还有 raisePrice 品项加价,就是套餐明细品项的加价 总和
        // isNotFollowAmount 这个是代表套餐是否联动 isNotFollowAmount == true 是不联动否则为联动
        if (item.raisePriceType == 2) {
          // 如果bsId 存在证明是已入库的并且没有进行修改的套餐 目前后端的raiseMemberPrice值给的不对,先自己算下
          if (item.bsId && !item.pkgData) {
            itemRaisePriceTotal = this.raiseMemberPriceTotalFn(item);
          } else {
            itemRaisePriceTotal = item.isNotFollowAmount ? item.raiseMemberPrice : multi(item.raiseMemberPrice, item.lastQty);
          }
        } else if (item.raisePrice) {
          itemRaisePriceTotal = item.isNotFollowAmount ? item.raisePrice : multi(item.raisePrice, item.lastQty);
        } else if (item.bsId && item.pkgRaisePrice) {
          itemRaisePriceTotal = item.isNotFollowAmount ? item.pkgRaisePrice : multi(item.pkgRaisePrice, item.lastQty);
        }
        // 没执行会员,套餐明细加价的的总和
        if (item.raisePrice) {
          oldItemRaisePriceTotal = item.isNotFollowAmount ? item.raisePrice : multi(item.raisePrice, item.lastQty);
        } else if (item.pkgRaisePrice) {
          oldItemRaisePriceTotal = item.isNotFollowAmount ? item.pkgRaisePrice : multi(item.pkgRaisePrice, item.lastQty);
        }
        // 添加key totalMakeFee 此品项所有做法的加价总额    排除掉主套餐的主套餐不支持做法,只有套餐里面的明细支持
        if (item.isPackage) {
          this.$set(item, 'totalMakeFee', methodTotal);
        }
        // 这是最新品项的小计
        // // 如果已入库并且discScale 存在discFlg = 2 那么lastSubtotal 要取后端给的最终的加价 这是按打折比列来进行打折的,前端目前不支持计算 ,,所以直接取价格
        // if (item.bsId && item.discFlg == 2 && item.discScale) {
        /**
         * A-defect-126828-180修正
         * 1. discScale字段修正的说明:
         * ## discScale-原为比例或定额的判断字段,
         * ## 经查证,无论比例还是定额均给小数(比例的百分数折算成小数, 定额后台会分摊后折算成小数),而 0, 就是实际的折后价为0.
         * ## 而discScale为0 则 == false,所以删除改字段的判断
         * 2. 当前业务逻辑:
         * ## 当线下打折时,使用折后价disPrice判断并计算小计
         * ## 当线上打折时,不存在disPrice字段,小计使用discMoney(折扣优惠的价格)
         * 184以上版本, 快餐不再有结算页外可执行的普通打折方案,高版本该字段废弃.
         * by Yangjie on 20200609
         */
        if (item.bsId && item.discFlg == 2) {
          item.lastSubtotal = sub(
            add(pkgListTotalMakeFee, add(itemRaisePriceTotal, add(itemPriceLastTotal, methodTotal))),
            (item.discFlg == 2 && (item.disPrice || item.disPrice === 0))
              ? 0 : item.discMoney,
          );
        } else {
          item.lastSubtotal = item.discFlg == 1
            ? 0
            : add(pkgListTotalMakeFee, add(itemRaisePriceTotal, add(itemPriceLastTotal, methodTotal)));
        }
        // 小计保留小数点后两位并且进行四舍五入
        item.lastSubtotal = round(item.lastSubtotal);
        // item.lastSubtotal = item.discFlg == 1 ? 0 : add(pkgListTotalMakeFee,add(itemRaisePriceTotal,add(itemPriceLastTotal, methodTotal)));
        // 这是没优惠打折之前的小计
        oldLastSubtotal = add(pkgListTotalMakeFee, add(oldItemRaisePriceTotal, add(itemPriceOldeTotal, methodTotal)));
        // 计算下合计 一个是优惠完的合计  一个是所有品项不优惠的合计
        // discTotal 这样做是为了如果是账单存在优惠金额的时候,证明是更多结算,界面进行了定额后者是打折优惠等,不需要前端去算就走后端给的数值
        // if(!this.getFastFoodBillData.bsData.discTotal){
        this.totalPrice.orderingItemLastTotalPrice = add(item.lastSubtotal, this.totalPrice.orderingItemLastTotalPrice);
        // }
        this.totalPrice.orderingItemTotalPrice = add(oldLastSubtotal, this.totalPrice.orderingItemTotalPrice);
      });
    },
    // 检查需要合并数据的条件
    getNeedMergeKey(list) {
      const serveWayId = (list.serveWay && list.serveWay.id) ? list.serveWay.id : 0;
      return `${list.id}_${list.sizeId}_${JSON.stringify(list.methodList)}_${list.discFlg}_${list.price}_${serveWayId}`;
    },
    // 提交品项列表数据整理
    /**
     * --- 对方法进行修改
     * 功能为了对易盘加单在入库的时候做下合并操作，
     * 避免了列如10个羊肉串10条个数为1的问题，打印需显示一条10个
     * neddMergeItem Object 需要合并的品项
     * isDoMerger Boolean 是否执行合并
     * mergeIndex Number 当前满足合并品项的所在缓存的位置
     */
    // 提交品项列表数据整理
    submitDish(items) {
      const submitDishData = [];
      const billList = items || this.guestListData;
      // 缓存下需要和并的品项
      const neddMergeItem = {};
      billList.forEach((list) => {
        // isDoMerger是要执行合并，默认false， mergeIndex当前缓存的满足合并条件数据在submitDishData组合数组的位置
        let isDoMerger = false;
        const mergeIndex = submitDishData.length;
        this.$set(list, 'webScaleFlg', false); // 此字段只用于给后台打印打折标识，前台无用
        // 这里处理一下打折标识问题，原因是181折的标识改了
        let { discFlg } = list;
        if (discFlg === '2') {
          this.$set(list, 'webScaleFlg', true);
          switch (list.priceType) {
            case 3: // 促
              discFlg = 4;
              break;
            case 4: // 变
              discFlg = 3;
              break;
            case 2: // 会
              discFlg = 5;
              break;
            case 1: // 普通品项
              discFlg = 0;
              break;
            case 0: // 普通品项
              discFlg = 0;
              break;
            default:
              break;
          }
        }
        // 条件为不允许重复加单的设置 不是称重确认的易盘加单的品项
        // console.log(this.posFastFood.isMergeAddBillForBuffet);
        if (!this.posFastFood.isMergeAddBillForBuffet && !list.isConfirmWeigh && list.TagID) {
          const key = this.getNeedMergeKey(list);
          // 如果不存在加入需要合并品项的缓存内
          if (!neddMergeItem[key]) {
            neddMergeItem[key] = { index: mergeIndex, name: list.name };
          } else {
            // 存在就找到缓存修改完的数据里对应的品项直接改变数量，并不需要重新组装数据
            submitDishData[neddMergeItem[key].index].qty = add(submitDishData[neddMergeItem[key].index].qty, list.lastQty);
            isDoMerger = true;
          }
        }
        // 这是所有的品项
        if (!isDoMerger) {
          const item = {
            costPrice: list.costPrice, // 成本价格
            isCanDiscount: list.isCanDiscount,
            discFlg, // 打折标识
            scaleFlg: list.webScaleFlg,
            enableHalf: list.enableHalf, // 是否允许半份
            isWeighed: list.isWeighed, // 是否是开启了适用电子秤
            isSingleMethod: list.isSingleMethod, // 是否是开启专属做法
            isConfirmWeigh: list.isConfirmWeigh, // 是否是开启称重确认
            isNegativePrice: list.isNegativePrice,
            method_list: this.submitItemMethod(
              list.methodList ? list.methodList : [],
            ), // 做法数据
            packFlg: list.isPack,
            totalMakeFee: list.totalMakeFee, // 品项所有做法加价的总额
            is_buffet: list.isDinnerBuffet, // 是否是自助模式
            is_present_item: list.is_present_item, // 是否是赠送品项
            reason_id: list.reasonId,
            itemCode: list.code,
            itemName: list.sizeName
              ? `(${list.sizeName})${list.name}`
              : list.name, // 品项名称
            item_name: list.sizeName
              ? `(${list.sizeName})${list.name}`
              : list.name, // 品项名称
            item_id: list.id, // 品项id
            item_size_id: list.sizeId, // 规格id
            item_type: list.itemType, // 1正常品项，2临时品项，3常规套餐品项，4 宴会套餐品项
            memberPrice: list.memberPrice, // 会员价格
            orderId: list.orderId ? list.orderId : '', // 是否是预点单过来的品项
            origPrice: list.price, // 这个代表的是最终的加单价格,比如执行会员价,就是会员的价格
            salePrice: list.discFlg == 3 ? list.price : (list.itemType === 2 ? list.stdPrice : list.salePrice), // 这个是销售价格只有在变价的时候才传变价完的价格,其他都是自己的销售价格不变
            stdPrice: list.stdPrice, // 这个是标准价格
            promotePrice: list.promotePrice ? list.promotePrice : 0, // 这个是促销价格
            isItemTimePrice: list.isItemTimePrice ? list.isItemTimePrice : false,
            priceType: list.priceType, //
            qty: list.lastQty,
            lastSubtotal: list.lastSubtotal,
            exchangeId: list.exchangeId ? list.exchangeId : null,
            exchangeMode: list.exchangeMode,
            isExchange: list.isExchange,
            fullGiftId: list.fullGiftId, // 满赠方案的id
            promoteLimitedQty: (list.promoteLimit || list.promoteLimit === 0) ? list.promoteLimit : '',
            isPackage: list.isPackage,
            params: {
              price: list.price,
              unitName: list.unitName,
              disPrice: (list.disPrice || list.disPrice == 0) ? list.disPrice : null,
            }, // //暂存额外的参数
            real_item_id: list.id,
            serve_way_id: (list.serveWay && list.serveWay.id) ? list.serveWay.id : 0,
            unitId: list.unitId,
            saleTypeId: this.saleTypeId,
            busiType: list.isPincai ? 1 : (list.isExchange || list.exchangeId) ? 2 : 0,
            itemIndex: list.mBindId ? list.mBindId : list.elId.substring(0, list.elId.length - 2),
            mergeItemIndex: list.bindId ? list.bindId : '',
            memberPlanId: list.memberPlanId ? list.memberPlanId : null, // 销售会员价方案ID
            promotePlanId: list.promotePlanId ? list.promotePlanId : null, // 促销价方案ID
            isDailyLimit: !!this.getVuexPromoteItemLimitsMap[`${list.id}_${list.sizeId}_${list.promotePlanId}`], // 每日促销限量
            isValidationMember: this.getFastFoodMemberPlanFlg.isDoMemberPrice, //
            isMemberExclusive: this.getVuexPromoteItemLimitsMap[`${list.id}_${list.sizeId}_${list.promotePlanId}`] ? this.getVuexPromoteItemLimitsMap[`${list.id}_${list.sizeId}_${list.promotePlanId}`].isMemberExclusive : list.isMemberExclusive, // 是否执行会员专享促销价 条件
          };
          // 添加下执行第N杯打折特殊标记，后端需要用
          if (list.NCupSaleFlg) {
            item.NCupSaleFlg = list.NCupSaleFlg;
          }
          // 如果是套餐
          if (list.isPackage) {
            // 联动回退
            // //信息中增加isNotFollowAmount属性，true为套餐明细数量不跟主套餐数量联动，否则均为联动
            item.isNotFollowAmount = list.isNotFollowAmount;
            // 套餐的明细品项加价的总和
            const tmpPkgRaisePrice = list.pkgRaisePrice ? list.pkgRaisePrice : 0;
            item.raisePrice = list.raisePrice ? list.raisePrice : tmpPkgRaisePrice;
            // 套餐明细加价类型
            item.raisePriceType = list.raisePriceType;
            // 套餐明细会员加价
            item.raiseMemberPrice = list.raiseMemberPrice || list.raiseMemberPrice === 0 ? list.raiseMemberPrice : null;
            // 宴会套餐添加个pkgPartPrice属性
            if (+list.pkgType === 1) {
              item.pkgPartPrice = list.price;
            }
            const pkgList = [];
            list.pkgList.forEach((_) => {
              const pkgItemData = {
                smallClassId: _.smallClassId, // 品项小类Id
                costPrice: _.costPrice,
                discFlg: list.discFlg, // 折扣走主套餐的
                is_buffet: list.isDinnerBuffet, // 是否是自助模式s
                itemCode: _.code,
                itemName: _.name,
                item_id: _.id ? _.id : _.itemId, // 已入库的品项是不存在id 所以加一个判断
                real_item_id: _.id,
                item_size_id: _.sizeId ? _.sizeId : _.itemSizeId, // //已入库的品项是不存在sizeId 所以加一个判断
                serve_way_id: (_.serveWay && _.serveWay.id) ? _.serveWay.id : 0,
                unitId: _.unitId,
                qty: _.num ? _.num : _.qty, // 已入库的品项是不存在num 所以加一个判断
                isItemTimePrice: _.isItemTimePrice ? _.isItemTimePrice : false, // 是否是时价
                raisePrice: _.bsId ? _.realRaisePrice : _.raisePrice, // 如果入库了,取realRaisePrice,否则取raisePrice
                raiseMemberPrice: _.raiseMemberPrice,
                isRaiseByQty: _.isRaiseByQty,
                item_type: 5, // 套餐明细里的品项类型为5
                params: {
                  unitName: _.unitName,
                  qty: _.num ? _.num : _.qty, // 已入库的品项是不存在num 所以加一个判断
                },
                saleTypeId: this.saleTypeId,
                apportionFlg: _.apportionFlg, // 是否参与分摊
              };
              // 添加 raisePriceType 常规套餐明细加价类型
              if (list.itemType == 3) {
                if (list.raisePriceType == 2 && (_.raiseMemberPrice || _.raiseMemberPrice == 0)) {
                  pkgItemData.raisePriceType = 2; // raisePriceType 为2 执行会员价
                } else {
                  pkgItemData.raisePriceType = 1; // raisePriceType 为1 不存在后者是没验证会员的时候执行的普通加价
                }
              }
              // 判断有做法存在就添加
              if (_.methodList && _.methodList.length) {
                pkgItemData.method_list = this.submitItemMethod(_.methodList);
              }
              pkgList.push(pkgItemData);
            });
            // 添加套餐明细
            item.pkg_list = pkgList;
          }
          // 临时品项, 处理临时品项明细
          if (list.itemType == 2) {
            item.temp_item = {};
            item.temp_item.name = list.name;
            item.temp_item.unit_id = list.unitId;
            item.temp_item.unit_name = list.unitName;
            item.temp_item.price = list.price;
          }
          submitDishData.push(item);
        }
      });
      return submitDishData;
    },
    // 整单备注按钮点击的事件
    orderingBillRemark() {
      ajax('canyin.pos.bill.billremarkview', {
        params: {
          pointId: this.getFastFoodBillData.bsData.pointId,
        },
      }).then((data) => {
        this.$refs.remarkModal.open(extend(data, this.remarkData), {
          submit: (remarkData) => {
            // 记录下当前的
            this.remarkData = remarkData;
          },
        });
      }).catch((errorCode, msg) => {
        MessageBox.alert(msg, '错误');
      });
    },
    // 做法提交的进行特殊处理下
    submitItemMethod(methods) {
      const methodArr = cloneDeep(methods);
      if (methodArr.length) {
        methodArr.forEach((_) => {
          // 这是对于已入库的品项的后端给的数据是没有vprice 所以要重新赋值下
          if (!_.vprice) {
            _.vprice = _.price;
          }
          // 注释:::::::下为什么!feeChanged 就是不允许修改价格的时候price 的值为''不能传值 这个需要请问后台了
          if (!_.feeChanged) {
            this.$set(_, 'price', '');
          }
        });
      }
      return methodArr;
    },
    ...mapMutations({
      setReserveOrderList: 'SET_RESERVEORDER_LIST',
    }),
    ...mapActions(['getOrderBill']),
  },
  watch: {
    // 合计的监听
    //  orderingItemLastTotalPrice: {
    totalPrice: {
      handler(newValue, oldValue) {
        this.$emit('fastfoodBillLastTotal', this.totalPrice);
      },
      deep: true,
    },
    // 快餐副屏
    guestListData: {
      immediate: true,
      handler() {
        this.sendGuestListDataToSubMonitor();
      },
      deep: true,
    },
    currentItem(newValue) {
      const activeItem = this.getActiveItemData();
      this.$vemit('fastFoodActiveItem', activeItem);
      if (this.posDevice.enableVice) {
        this.$devices.SubMonitor.send({
          moduleName: 'SubMonitor',
          method: 'activeItem',
          result: newValue ? newValue.split('.')[1] : null,
        });
      }
    },
    billCurrentElId(newValue) {
      // 为兼容现有程序，如果都优化完（currentItem不再使用可删除此监听）
      this.currentItem = newValue;
    },
  },
};
</script>
<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
@import "~@/common/less/pos/fastFood/fastFoodList.less";
</style>

