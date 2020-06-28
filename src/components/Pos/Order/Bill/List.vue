<template>
  <div class="pos-order-bill-list">
    <!-- 加单，结算 -->
    <ul
      :id="posOrderBillListId"
      class="pos-order-bill-list-view"
      v-if="(!ordering && scList.length)"
    >
      <li v-show="!batchOperation"
        v-for="(item, index) in scList"
        :key="index">
        <ListOrderItem
          :item="item"
          :index="index"
          :activePkgData="activePkgData"
          @getPkgListMethodPriceTotla="getPkgListMethodPriceTotla"
          @changePkg="changePkg">
        </ListOrderItem>
      </li>
      <el-checkbox-group
        v-model="checkedItems"
        @change="handleCheckedItemsChange"
        v-show="batchOperation"
      >
        <li
          v-for="(item, index) in scList"
          :key="index"
        >
          <el-checkbox :label="item" :key="index" :disabled="isPayBill">
            <div class="a">
              <!-- <div class="b"><em>{{ index + 1 }}</em></div> -->
              <div class="c">
                <div
                  class="itemMainMessage"
                  :class="[
                    { pkgItemClickClass: item.isPackage },
                    { activePkg: activePkgData == item }
                  ]"
                  @click="changePkg(item)"
                >
                  <div class="d">
                    <!-- 国际化：拼 ，临 -->
                    <!-- busiType 1 是代表的拼菜, 2 是换购 -->
                    <h3>{{
                      item.exchangeId ? `[${$t('Dict.Repurchase')}]` : ''
                    }}{{
                      (item.mergeScId && item.busiType === 1) ? '['+$t('Biz.Order.SpellFoodText')+']' : ''
                    }}{{
                      item.fullGiftId
                      ? `[${$t('Dict.Gift')}]`
                      : ''
                    }}{{
                      item.tempItemName ? '['+$t('Dict.Temporary')+']' : ''
                    }}{{
                      item.name
                    }}</h3>
                    <!-- 国际化：赠，折，变，促，会，催，称，套 -->
                    <div class="e">
                      <em v-if="item.discFlg == 1" class="give">{{$t('Dict.Gift')}}</em>
                      <em v-if="item.scaleFlg" class="discount">{{$t('Dict.Discount')}}</em>
                      <em v-if="item.discFlg == 3" class="changed">{{$t('Dict.Change')}}</em>
                      <em v-if="item.discFlg == 4" class="promotion">{{$t('Dict.Promotion')}}</em>
                      <em v-if="item.discFlg == 5" class="vip">{{$t('Dict.Vip')}}</em>
                      <em v-if="item.hastenTimes" class="hasten">{{$t('Dict.Hasten')}}</em>
                      <!-- confirmWeighType 为称重未确认的标识 -->
                      <em v-if="item.confirmWeighType == 1" class="give">
                        {{ $t('Dict.ConfirmWeigh') }}
                      </em>
                      <!-- confirmWeighType 为称重已确认的标识 -->
                      <em v-if="item.confirmWeighType == 2" class="successConfirmWeigh">
                        {{ $t('Dict.ConfirmWeigh') }}
                      </em>

                      <em v-if="item.isPackage" class="package">{{$t('Dict.Package')}}</em>
                    </div>
                  </div>
                  <div class="f">
                    <div class="g">
                      <!-- 国际化：单价： -->
                      <span>{{$t('Dict.UnitPrice1')}}</span>
                      <!-- 迫不得已才添加的 -->
                      <span
                        v-show="item.lastPrice
                        != item.salePrice"
                        style="font-size: 16px; display: inline-block;"
                      >{{ item.lastPrice }}</span>
                      <del v-show="item.lastPrice != item.salePrice">{{ item.salePrice }}</del>
                      <span v-show="item.lastPrice == item.salePrice">{{ item.lastPrice }}</span>
                    </div>
                    <div class="h">{{ item.lastQty }} {{ item.unitName }}</div>
                    <!-- 国际化：小计： -->
                    <div class="i">{{$t('Dict.Subtotal1') + item.lastSubtotal }}</div>
                  </div>
                </div>
                <div class="j">
                  <!-- 国际化：注： -->
                  <span v-if="+item.serveWayId !== 0">
                    {{ $t('Dict.Notes01')+item.serveWayName }}
                  </span>
                  <span v-if="item.methodList && item.methodList.length">
                    <template v-for="(method, i) in item.methodList">
                      {{
                        (i === 0 && +item.serveWayId === 0)
                          ? $t('Dict.Notes01')
                          : ' | '
                      }}{{
                        method.name
                      }}{{
                        method.isNeedFee
                          ? (method.qty && +method.qty !==1)
                            ? '(+ '+ method.price +'X'+method.qty+')'
                            :'(+ '+ method.price +')'
                          : ''
                      }}
                    </template>
                  </span>
                  <span v-if="!item.methodList && item.methodText">
                    {{+item.serveWayId === 0 ? $t('Dict.Notes01') : ' | '}}{{item.methodText}}
                  </span>
                </div>
                <ul class="k" v-if="item.pkgList">
                  <li v-for="(setitem , index) in item.pkgList" :key="index">
                    <p class="pkgItemMainContent">
                      <i class="icon icon-dian1"></i>
                      <span class="setmealitem">
                        <!-- 国际化：临 -->
                        {{
                          setitem.itemType === 2 ?
                          '['+$t('Dict.Temporary')+']' + setitem.name :
                          setitem.name
                        }}
                      </span>
                      <span class="setmealitemnum">{{setitem.lastQty}}{{setitem.unitName}}</span>
                      <!-- 加价的显示 -->
                      <!-- raisePriceType 代表的是加价显示的类型 2 是会员加价,1 是普通加价-->
                      <span
                        class="raisePrice"
                        v-show="setitem.raisePriceType == 1"
                      >
                        {{
                          setitem.realRaisePrice > 0
                            ? (
                              !item.isNotFollowAmount
                                ? '+ ' + setitem.realRaisePrice * 1000 * item.lastQty / 1000
                                : '+ ' + setitem.realRaisePrice
                              )
                            : ''
                        }}
                      </span>
                      <span
                        class="raisePrice memberPrice"
                        v-show ="setitem.raisePriceType == 2" >
                        {{ setitem.raiseMemberPrice
                          ? (!item.isNotFollowAmount
                            ? '+ '+setitem.raiseMemberPrice*1000*item.lastQty/1000
                            : '+ '+setitem.raiseMemberPrice)
                          : '+ 0' }}
                      </span>
                    </p>
                    <p class="pkgItemServeContent bsIdPkgItemServeContent">
                        <span v-if="setitem.serveWayId != '0'" class="pkg-warp">
                          {{$t('Dict.Notes01')+setitem.serveWayName}}
                        </span>
                        <span
                          v-if="setitem.methodList && setitem.methodList.length"
                          class="pkg-warp">
                          <template
                            v-for="(method, i) in setitem.methodList">
                            {{
                              (i == 0 && setitem.serveWayId == '0') ?
                              $t('Dict.Notes01') :
                              ' | '
                            }}
                            {{ method.name }}
                            {{
                              method.isNeedFee
                                ? (method.qty && method.qty !=1)
                                  ? '(+ ' + method.price + 'X' + method.qty + ')'
                                  : '(+ ' + method.price + ')'
                                : ''
                            }}
                          </template>
                        </span>
                        <span v-if="!setitem.methodList && setitem.methodText" class="pkg-warp">
                          {{
                            setitem.serveWayId == '0' ?
                            $t('Dict.Notes01') :
                            ' | '
                          }}
                          {{ setitem.methodText }}
                        </span>
                        <span class="methodPriceTotal">
                          {{getPkgListMethodPriceTotla({setitem, item})}}
                        </span>
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </el-checkbox>
        </li>
      </el-checkbox-group>
    </ul>
    <!--这是加单账单的显示  返回，提交 -->
    <ul
      :id="posOrderingListId"
      ref="posOrderingListId"
      class="pos-order-bill-list-view is-ordering"
      :class="{
        'pos-ordering-subTotal': isShowOrdedItems && guestListData.length > 0
      }"
      v-if="ordering"
    >
      <template v-if="isShowOrdedItems">
        <li
          v-for="(item, index) in scList"
          :key="`orderedItem_${index}`"
          class="pos-ordered-bill-list"
        >
          <ListOrderItem
            :item="item"
            :index="index"
            :activePkgData="activePkgData"
            @getPkgListMethodPriceTotla="getPkgListMethodPriceTotla">
          </ListOrderItem>
          <!-- <ListOrderingItem :item="item" :index="index" :key="`ordered_${index}`" /> -->
        </li>
      </template>
      <li
        v-for="(item, index) in guestListData"
        :key="`orderingItem_${index}`"
        :class="{ active: currentItem && currentItem == item.elId, reshow: isShowOrdedItems }"
        :ref="item.elId"
        @click="orderingClickHandler(item)"
      >
        <ListOrderingItem
          :item="item"
          :index="isShowOrdedItems ? index+scList.length : index"
          :realityIndex="index"
          :key="`ordering_${index}`"
          :active="currentItem && currentItem == item.elId"
          :isShowOrdedItems="isShowOrdedItems"
          :isTeam="posOrderBill && posOrderBill.bsData.is_team === 1"
          @goRedemption="goRedemption"
        />
      </li>
    </ul>
    <div class="subTotalWrap" v-if="ordering && isShowOrdedItems && guestListData.length>0">
      <span>{{$t('Biz.Order.AllCopies0', [guestListSubNum])}}</span>
      <strong> {{ subPrice.orderingItemLastSubPrice }}</strong>
      <del
        v-if="subPrice.orderingItemLastSubPrice !== subPrice.orderingItemSubPrice"
      > {{ subPrice.orderingItemSubPrice }}</del>
    </div>
    <div class="billShowBoxFoot">
      <!-- 国际化：全选 -->
      <el-checkbox
        v-if="(!ordering && scList.length) && batchOperation"
        v-model="checkAll"
        @change="handleCheckAllChange"
        border
        :disabled="isPayBill"
      >{{$t('Dict.SelectAll')}}</el-checkbox>
      <div class="billShowBoxFootLeft" v-show="ordering">
        <!--整单备注 -->
        <div class="posMainBillBsRemark" @click.stop="orderingBillRemark">
          <i class="icon icon-edit"></i>
          <span :class="[
            { 'defuletRemark': ssRemark === '' },
            { 'orderingRemark': ssRemarkLength }
          ]">{{ ssRemark === '' ? '&lt;'+$t('Dict.BillRemarks')+'&gt;' : ssRemark }}</span>
        </div>
        <div class="billOrderingState">
          <!-- 国际化：免厨打单，团队加单 -->
          <span v-show="unKitchenPrinting">{{$t('Biz.Order.FreeCook')}}</span>
          <span v-show="isTeamAdd">{{$t('Dict.Btn.TeamAdd')}}</span>
        </div>
      </div>
      <div class="billShowBoxFootRight">
        <Pager
          v-if="!ordering && scList.length"
          :pagerId="posOrderBillListId"
          scrollMode="simple"
          arrowDirection="up-down"
          ref="posOrderBillListPager"
        ></Pager>
        <Pager
          v-show="ordering"
          :pagerId="posOrderingListId"
          scrollMode="simple"
          arrowDirection="up-down"
          ref="pager"
        ></Pager>
      </div>
    </div>
    <remark-modal ref="remarkModal"
      v-model="remarkData"
    ></remark-modal>
    <PointListPackageNormalChange
      ref="packageNormalChange"
      submitId="pointListPackageNormalChange"
      type="orderChange"
    ></PointListPackageNormalChange>
    <PointListPackagePartChange
      ref="packagePartChange"
      submitId="pointListPackagePartChange"
      type="orderChange"
    ></PointListPackagePartChange>
  </div>
</template>

<script>
import {
  mapState,
  mapGetters,
  mapMutations,
  mapActions,
} from 'vuex';
import {
  groupBy,
  map,
  reduce,
  find,
  last,
  cloneDeep,
  isString,
  isPlainObject,
  extend,
  concat,
} from 'lodash';
import Pager from '@/components/Pos/Common/Pager';
import RemarkModal from '@/components/Pos/Business_commons/RemarkModal';
import ListOrderingItem from '@/components/Pos/Order/Bill/ListOrderingItem';
import ListOrderItem from '@/components/Pos/Order/Bill/ListOrderItem';
import {
  add, sub, multi, round,
} from '@/common/js/math';
import ajax from '@/common/js/ajax';

// 常规套餐
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
    PointListPackagePartChange,
    PointListPackageNormalChange,
    ListOrderingItem,
    ListOrderItem,
  },
  props: {
    ordering: {
      type: Boolean,
      default: false,
    },
    guestList: {
      type: Array,
      default() {
        return [];
      },
    },
    scList: {
      type: Array,
      default() {
        return [];
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
      addOrderLock: false, // 加单锁
      pager: null,
      currentItem: false, // null 会有警告，用false替换
      posOrderingListId: 'posOrderingListId', // 加单账单显示id
      posOrderBillListId: 'posOrderBillListId', // 账单显示id
      totalPrice: {
        orderingItemTotalPrice: 0, // 优惠之前的合计
        orderingItemLastTotalPrice: 0, // 加单最终的合计
      },
      // 小计，用于开启回显功能时新加品项的统计 182-1191 by L.R
      subPrice: {
        orderingItemSubPrice: 0, // 优惠之前的合计
        orderingItemLastSubPrice: 0, // 加单最终的合计
      },
      // 备注信息
      remarkData: {
        remarkList: [],
        remarkText: '',
      },
      activePkgData: {},
      batchOperation: false, // 是否开启多次结算批量操作功能
      checkedItems: [],
      checkAll: true,
      scIdStr: '', // 多次结算scId
      settleType: 2, // 部分结算或者全部结算标识，默认全部
      currenSelectItem: null, // 当前勾选的品项
      // cacheScList : [],//缓存sclist已加单品相，目的防止进入结算后刷新账单sclist变化导致dom重新渲染
      isPayBill: false, // 是否埋单,默认非埋单状态
    };
  },
  created() {
    this.$vonce('leaveOrdering', () => {
      this.currentItem = false;
    });
    // 进入加单页面情空备注
    this.$vonce('clearssRemark', () => {
      this.remarkData = {
        remarkList: [],
        remarkText: '',
      };
    });
    this.$vonce('printLeaveTableBill', (lists) => {
      this.printLeaveTable(lists);
    });
    // 设置整单备注
    this.$vonce('setRemarkShow', (text) => {
      this.remarkData = {
        remarkList: [],
        remarkText: text || '',
      };
    });
    /**
     * @函数说明 点餐提交事件
     * @创建 马 2018/6/11
     * 只有在加单界面的时候才被创建
     * doDiscountPlan Object 代表的是执行(换购和满赠方案)
     * @public
     */
    if (this.ordering) {
      this.$vonce('submitAddOrderBtnEvent', (doDiscountPlan = {}) => {
        const { isDoRedemption = false, isDofullGift = false } = doDiscountPlan;
        if (this.addOrderLock) {
          this.$message.info(this.$t('Dict.LoadingMessage'));
        } else {
          this.addOrderLock = true;
          // 记录日志
          const isLog = true;
          // 提交的时候是否有错误的提示
          let isErrorIshow = false;
          // 进行提交加单操作
          // 判断是有加单的品项数据
          if (!this.guestListData.length) {
            this.addOrderLock = false;
            return false;
          }
          if (this.orderingItemLastTotalPrice < 0) {
            this.addOrderLock = false;
            this.$message.error(this.$t('Biz.Order.LongMsg034'));
            return false;
          }
          this.guestListData.forEach((item) => {
            // 数量超过9999提示
            if (item.lastQty > 9999) {
              this.$message.error(this.$t('Biz.Order.LongMsg035', [item.name]));
              isErrorIshow = true;
            }
            // 数量小数提示 以后写
            // 套餐的数量不能小于1
            if (item.isPackage && item.lastQty < 1) {
              this.$message.error(this.$t('Biz.Order.LongMsg036'));
              isErrorIshow = true;
            }
          });
          if (isErrorIshow) {
            this.addOrderLock = false;
            return !isErrorIshow;
          }
          // 整理加单品项的数据
          const submitItems = this.submitDish();
          // 换购的条件判断
          if (this.posSettings.isHaveFullExchange && !isDoRedemption && this.posOrderBill.bsData.is_team === 0) {
            const btnData = this.getCustomMenuBtn.find(btn => btn && btn.name === 'redemption');
            const isAllowUse = btnData ? !btnData.hasNoAuth : false;
            if (isAllowUse && !submitItems.some(item => item.exchangeId && item.exchangeMode === 0)) {
              this.$emit('redemption', {
                submitItems,
                callback: () => {
                  this.addOrderLock = false;
                },
              });
              return false;
            }
          }
          // 满赠的条件判断
          if (this.posSettings.isHaveFullGift && !isDofullGift && this.posOrderBill.bsData.is_team === 0) {
            const btnData = this.getCustomMenuBtn.find(btn => btn && btn.name === 'addFullGift');
            const isAllowUse = btnData ? !btnData.hasNoAuth : false;
            // 查下账单
            if (isAllowUse && !submitItems.some(item => item.fullGiftId)) {
              // 查询换购接口
              this.$emit('addFullGift', {
                submitItems,
                callback: () => {
                  this.addOrderLock = false;
                },
              });
              return false;
            }
          }
          const params = {
            orderSource: 1,
            bs_id: this.posOrderBill.bsData.id, // 当前营业流水id
            point_id: this.posOrderBill.bsData.pointId, // 客位id
            controlMode: this.getVuexPosMode, // pos模式
            isLog,
            items: submitItems,
            unKitchenPrinting: this.unKitchenPrinting, // 是否是启用免厨打
            addOrderWaiterId: this.changeWaiterId, // 点菜员
            isTeamAdd: this.isTeamAdd, // 是否是团队加单
            teamPointIds: this.posOrderBill.bsData.team_point_ids
              ? this.posOrderBill.bsData.team_point_ids
              : null, // 团队的其他id
            // teamPointIds: team_point_ids
            fastType: 0, // 快速操作模式
            requestType: 0, // 加单请求类型-前台营业REQUEST_TYPE_BUSINESS 默认为0
            ssRemark: this.ssRemark, // 整单备注
          };
          // 判断这加单操作是不是通过修改预点单过来的
          if (this.getReserveOrderList) {
            params.orderId = this.getReserveOrderList.orderId;
          }
          this.$vonce('authCode', (code) => {
            this.addAjax(params, code);
          });
          this.addAjax(params);
          this.$log.info(`pointId:${params.point_id},price:${this.orderingItemLastTotalPrice}`);
          // 请求接口
        }
        return '';
      });
    }
  },
  computed: {
    // isShowOrdedItems 为开发时用的属性，联调时将真实字段引入
    ...mapState({
      isShowOrdedItems: state => state.pos.order.lastAdditionWhenAddingOrders,
    }),
    ...mapGetters(['posOrderBill', 'getVuexPointData', 'getVuexPosMode', 'posSettings', 'outDeviceSetting', 'posInfo', 'posDevice', 'getReserveOrderList', 'getIsbatchOperation', 'getVuexPromoteItemLimitsMap', 'getCustomMenuBtn']),
    isSmallClassOneLine() {
      return this.posSettings.isOnlyShowSmallClass && this.posSettings.isSingleLineDisplayForSmallClassAndCustomClass;
    },
    groups() {
      return groupBy(this.guestList, item => this.getElId(item));
    },
    // 数据有点问题
    guestListData() {
      const list = map(this.groups, (items, elId) => {
        // 合并和数量的 reduce(items, (sum, n) => add(sum, n.num), 0);
        let lastQty = 0;
        // 从相同组和的数组里取到一个数据
        const [colneItem] = items;
        let newItemData = {};
        lastQty = reduce(items, (sum, n) => add(sum, n.num), 0);
        newItemData = Object.assign({}, colneItem, {
          elId,
          list: items,
          lastQty,
          lastSubtotal: 0, // 先赋值一个数 itemSubtotal这个方法有计算的
          is_present_item: +colneItem.discFlg === 1, // 是否是赠送品项
          pkgType: colneItem.pkgType ? colneItem.pkgType : null, // 套餐类型
          serveWay: colneItem.serveWay,
          price: colneItem.price, // item[0].price 联动回退
          salePrice: colneItem.salePrice, // item[0].salePrice 联动的回退
          promotePrice: colneItem.promotePrice, // item[0].promotePrice联动的回退
          isItemTimePrice: colneItem.isItemTimePrice ? colneItem.isItemTimePrice : false,
          raisePrice: colneItem.raisePrice ? colneItem.raisePrice : 0,
          memberPrice: colneItem.memberPrice, // item[0].memberPrice 联动的回退,
        });
        return newItemData;
      });
      /*
      * @函数说明 当前品项的小计计算--做下做法加价,品项加价 &&& 价格计算的处理
      * 方法里包含了此账单的合计
      * */
      this.itemSubtotal(list);
      this.getitemsNumberSum(this.isShowOrdedItems ? list.concat(this.scList) : list);
      // 刷新分页组件状态
      if (this.$refs.pager) {
        this.$refs.pager.pushRefresh();
      }
      // 这块需要优化 暂时把监听移动到这
      if (this.ordering && this.posDevice.enableVice && this.$route.name === 'ordering') {
        this.$devices.SubMonitor.send({
          moduleName: 'SubMonitor',
          method: 'addDataItem',
          result: list,
        });
      }
      return list;
    },
    guestListSubNum() {
      return this.guestListData.reduce((sum, item) => add(sum, item.lastQty), 0);
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
  watch: {
    // 多次结算下选中的菜品
    checkedItems: {
      handler(data) {
        this.setMultsettle(data);
      },
      deep: true,
    },
    getIsbatchOperation(data) {
      // 批量操作
      this.batchOperation = data;
      if (data) {
        // 选中批量操作禁止加单
        this.$vemit('noAddBus', true);
        this.checkedItems = this.scList;
        this.checkAll = true;
        // 防止多次来回切换批量操作按钮导致重复scIdStr
        if (this.scIdStr === '') {
          this.scList.forEach((item) => {
            this.scIdStr += `${item.scId},`;
            if (item.pkgList) {
              item.pkgList.forEach((val) => {
                this.scIdStr += `${val.scId},`;
              });
            }
          });
        }
      } else { // 当批量操作按钮不为选中状态时需清空当前scIdStr
        // 不选中批量操作不禁止加单
        this.$vemit('noAddBus', false);
        this.scIdStr = '';
        this.setMultsettle([]);
      }
    },
    'getVuexPointData.state': {
      handler() {
        if (+this.getVuexPointData.state === 3) { // 如果客位变成埋单状态则紧点checkbox
          this.isPayBill = true;
        } else {
          this.isPayBill = false;
        }
      },
    },
    totalPrice: {
      handler(newValue) {
        this.$emit('billLastTotal', newValue);
      },
      deep: true,
    },
    scList: {
      immediate: true,
      handler(newValue, oldValue) {
        // if (!this.ordering && this.posDevice.enableVice && this.$route.name === 'order') {
        if (!this.ordering && this.posDevice.enableVice) {
          // 修改副屏显示问题，若路由为客单时，发送updataItem，更新副屏品项列表
          // 开启回显配置下，若未开启"提交菜品后自动返回客位界面"配置，则发送updateOrderedItem，
          // 解决新加品项后提交，副屏不更新的问题 182-bug554 by L.R
          if (this.$route.name === 'order') {
            this.$devices.SubMonitor.send({
              moduleName: 'SubMonitor',
              method: 'updataItem',
              result: newValue, // 菜品信息
              initData: this.posOrderBill.bsData,
              ordering: false,
            });
          } else if (this.isShowOrdedItems && this.$route.name === 'ordering' && !this.posSettings.isBackMain) {
            this.$devices.SubMonitor.send({
              moduleName: 'SubMonitor',
              method: 'updateOrderedItem',
              isOrdering: true,
              result: newValue, // 菜品信息
              initData: this.posOrderBill.bsData,
            });
          }
        }
        // 缓存一下之前选中的品项，目的是为了称重确认之后 其他品项不会被选中
        const newCheckedItems = _.cloneDeep(this.checkedItems);
        // 拿到菜品的bsid，然后来判断当前操作的是不是一个客位
        const newValueBsIds = newValue ? newValue.map(item => item.bsId) : [];
        const oldValueBsIds = oldValue ? oldValue.map(item => item.bsId) : [];
        // 非空闲客位如果切离前有一个为批量操作状态，切回后全为批量操作状态
        if (this.getIsbatchOperation && +this.getVuexPointData.state !== 1) {
          this.batchOperation = true;
          //  this.setIsBatchOperation(true);
        }
        // 如果当前选中了批量操作才给后台传scIdStr
        if (this.getIsbatchOperation) {
          // 如果不是一个客位，触发刷新账单后恢复到刷新账单后已加品项全部全部选中状态
          if (_.isEqual(newValueBsIds, oldValueBsIds)) {
            this.checkedItems = _.intersectionBy(this.scList, newCheckedItems, 'scId');
            this.checkAll = this.checkedItems.length === newValue.length;
          } else {
            this.checkedItems = this.scList;
            this.checkAll = true;
          }
          // 如果cacheScList没有值重新赋值,初始化，加单后
          // if(this.cacheScList.length == 0) {
          //   this.cacheScList = cloneDeep(this.scList)
          // 加单后清空品项scIdStr
          this.scIdStr = '';
          this.checkedItems.forEach((item) => {
            this.scIdStr += `${item.scId},`;
            if (item.pkgList) {
              item.pkgList.forEach((val) => {
                this.scIdStr += `${val.scId},`;
              });
            }
          });
          if (this.checkAll) {
            this.settleType = 2;
          } else {
            this.settleType = 1;
          }
        }
      },
      deep: true,
    },
    currentItem(newValue) {
      if (this.ordering && this.posDevice.enableVice) {
        this.$devices.SubMonitor.send({
          moduleName: 'SubMonitor',
          method: 'activeItem',
          result: newValue ? newValue.split('.')[1] : null,
        });
      }
    },
    scIdStr: {
      handler() {
        this.$vemit('selectItemScIdStrBus', { scIdStr: this.scIdStr.substring(0, this.scIdStr.length - 1), settleType: this.settleType });
      },
    },
  },
  methods: {
    goRedemption(item) {
      const submitItems = this.submitDish([item]);
      this.$emit('redemption', {
        submitItems,
        activeItem: item,
      });
    },
    // 判断是否显示会员加价
    isShowRaiseMemberPrice(pkgData, pkgListData) {
      /**
       * pkgListData.raiseMemberPrice 可能为 null, 所以esLint改写时, 不能直接 +item === 0
       * ## +null === 0 // true
       * ## null == 0 // false
       */
      // pkgMainData 会员加价
      if (+pkgData.raisePriceType === 2
        && (pkgListData.raiseMemberPrice || pkgListData.raiseMemberPrice === 0)
      ) {
        return true;
        // 这是普通加价
      }
      if (+pkgData.raisePriceType !== 2 && pkgListData.raisePric) {
        return false;
      }
    },
    /**
     * 计算加单完后的套餐明细对应的做法合计
     * isRelaCount 代表的是做法合计是否是随着明细数量叠加
     * isNotFollowAmount 这是联动的由于提价完后的明细数量乘以了套餐的数量所以要特殊处理下
     */
    getPkgListMethodPriceTotla({ setitem, item }) {
      let methodPriceTotal = 0;
      if (setitem && setitem.methodList && setitem.methodList.length) {
        setitem.methodList.forEach((method) => {
          if (method.price) {
            methodPriceTotal = add(methodPriceTotal,
              method.isRelaCount
                ? multi(setitem.lastQty, multi(method.price, method.qty))
                : !item.isNotFollowAmount
                  ? multi(multi(method.price, method.qty), item.lastQty)
                  : multi(method.price, method.qty));
          }
        });
      }
      return +methodPriceTotal === 0 ? '' : `+ ${methodPriceTotal}`;
    },
    clearssRemark() {
      this.remarkData = {
        remarkList: [],
        remarkText: '',
      };
    },
    getElId(item) {
      return [
        item.lid,
        item.id,
        item.sizeId,
        item.discFlg,
        item.reasonId ? item.reasonId : '',
        item.serveWay ? item.serveWay.id : '-1',
      ].join('.');
    },
    // callBack 回调
    addAjax(params, authData = {}) {
      ajax('canyin.pos.ordering.addOrder', {
        contentType: 'paramsEncoded',
        needToken: true,
        data: {
          ...params,
          ...authData,
        },
      }).then((res) => {
        this.addOrderLock = false;
        if (res.success) {
          this.$message({
            showClose: true,
            message: res.data.msg,
            type: 'success',
            customClass: 'user-defined-message-style',
          });
          // 成功进行回调函数
          setTimeout(() => {
            this.remarkData = {
              remarkList: [],
              remarkText: '',
            };
            this.submitDishCallBack(res.data);
          }, 10);
        } else {
          // 没有成功的是 -2  就是弹验证授权框
          if (+res.result === -2) {
            this.$vemit('posAuthCheck', {
              message: res.msg,
            });
          } else {
            this.$message({
              showClose: true,
              message: res.msg,
            });
          }
        }
      }).catch((errCode, msg) => {
        this.addOrderLock = false;
        this.$alert(msg, this.$t('Dict.Tips'));
      });
      setTimeout(() => {
        this.addOrderLock = false;
      }, 15000);
    },
    // 拿到账单的最后一条数据
    getLastGuestList() {
      return _.last(this.guestListData);
    },
    // 更新下最新的 currentItem
    setCurrentItem(item) {
      this.currentItem = this.getElId(item);
    },
    getActiveItem() {
      return this.currentItem ? this.currentItem : null;
    },
    getActiveItemData() {
      return find(this.guestListData, { elId: this.currentItem });
    },
    orderingClickHandler(item) {
      this.setActiveItem(item.elId);
      // 判断是否还有active calssName , 如果是选中的状态就触发修改套餐事件
      if (!!this.$refs[item.elId][0].className.match(new RegExp('(\\s|^)active(\\s|$)')) && item.isPackage) {
        this.$emit('modifyItemPackage');
      }
    },
    setActiveItem(elIdOrItem) {
      if (elIdOrItem && isString(elIdOrItem) && find(this.guestListData, { elId: elIdOrItem })) {
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
        this.currentItem = this.guestListData.length ? last(this.guestListData).elId : null;
      }
      this.$emit('changeActiveItem');
    },
    scrollToEnd() {
      // Todo: 滚动到底部加单的时候
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
      const re = list.reduce((sum, item) => add(sum, item.lastQty), 0);
      this.$vemit('getitemsNumberSum', re);
    },
    // 循环做法加价,如果是套餐还算下明细加价,以及明细做法加价的计算 还有合计的计算
    itemSubtotal(list) {
      // 每次计算都需要初始化 下合计
      this.totalPrice.orderingItemTotalPrice = 0;
      this.totalPrice.orderingItemLastTotalPrice = 0;
      // 声明如下变量进行累加操作，优化执行速度 182-1191 by L.R
      let itemTotalPrice = 0;
      let itemLastTotalPrice = 0;
      list.forEach((item) => {
        let methodTotal = 0; // 做法价格的总和
        let itemRaisePriceTotal = 0; // 套餐明细加价的总额
        let oldItemRaisePriceTotal = 0;// 没执行会员价执行加价的合计
        // 判断是常规套餐的话 raisePriceType 套餐明细的加价价格类型
        if (item.isPackage && +item.itemType === 3) {
          this.$set(item, 'raisePriceType', this.posOrderBill.bsData.memberPriceFlg ? 2 : 1);
          // item.raisePriceType = this.posOrderBill.bsData.memberPriceFlg ? 2 : 1;
        }
        if (item.methodList && item.methodList.length) {
          item.methodList.forEach((_method) => {
            // 品项所有做法价格的总和结算
            if (_method.price) {
              // 如果 isRelaCount 不存在的话说明是临时做法，要做以下处理
              if (_method.isRelaCount === undefined) {
                this.$set(_method, 'isRelaCount', true);
                // _method.isRelaCount = true;
              }
              // 现在修改的是做法带有价格算总和的时候都要算上自己的数量和品项的数量
              if (_method.isRelaCount) {
                methodTotal = add(
                  methodTotal,
                  multi(
                    multi(
                      _method.price,
                      _method.qty,
                    ),
                    item.lastQty,
                  ),
                );
              } else {
                methodTotal = add(methodTotal, multi(_method.price, _method.qty));
              }
              // _method.isRelaCount = true; // 如果是价格存在了就一定是跟数量有关 isRelaCount 为true
            }
          });
        }
        // 如果是套餐的话就要就算明细做法和的计算
        const pkgListTotalMakeFee = item.pkgListTotalMakeFee
          ? (
            item.isNotFollowAmount
              ? item.pkgListTotalMakeFee
              : multi(item.pkgListTotalMakeFee, item.lastQty)
          )
          : 0;
        // 品项价格的总和 itemPriceLastTotal 这代表是最新品项价格的合计 ,itemPriceOldeTotal这是进入界面销售价格的合计
        const itemPriceLastTotal = round(multi(item.price, item.lastQty));
        // 增加对临时品项的支持，之前的计算方式存在问题，因临时品项没有salePrice，所以造成计算价格时显示NAN的BUG By L.R
        // const itemPriceOldeTotal = round(multi(item.salePrice, item.lastQty));
        const itemPriceOldeTotal = round(multi(item.salePrice || item.stdPrice, item.lastQty));
        // 品项如果还有 raisePrice 品项加价,就是套餐明细品项的加价 总和
        // isNotFollowAmount 这个是代表套餐是否联动
        // isNotFollowAmount == true 是不联动否则为联动
        // raisePriceType为2标识执行的加价价格是会员加价价格
        if (+item.raisePriceType === 2) {
          itemRaisePriceTotal = item.isNotFollowAmount
            ? item.raiseMemberPrice
            : multi(item.raiseMemberPrice, item.lastQty);
        } else {
          itemRaisePriceTotal = item.isNotFollowAmount
            ? item.raisePrice
            : multi(item.raisePrice, item.lastQty);
        }
        oldItemRaisePriceTotal = item.isNotFollowAmount
          ? item.raisePrice
          : multi(item.raisePrice, item.lastQty);
        // 添加key totalMakeFee 此品项所有做法的加价总额    排除掉主套餐的主套餐不支持做法,只有套餐里面的明细支持
        if (item.isPackage) {
          this.$set(item, 'totalMakeFee', methodTotal);
        }
        // 这是最新品项的小计
        item.lastSubtotal = +item.discFlg === 1
          ? 0
          : add(
            pkgListTotalMakeFee,
            add(
              itemRaisePriceTotal,
              add(itemPriceLastTotal, methodTotal),
            ),
          );
        // 对小计进行四舍五入并且保留两位小数
        item.lastSubtotal = round(item.lastSubtotal);
        // 这是没优惠打折之前的小计
        const oldLastSubtotal = round(add(
          pkgListTotalMakeFee,
          add(
            oldItemRaisePriceTotal,
            add(itemPriceOldeTotal, methodTotal),
          ),
        ));
        itemTotalPrice = add(oldLastSubtotal, itemTotalPrice);
        itemLastTotalPrice = add(item.lastSubtotal, itemLastTotalPrice);
      });
      // 计算下合计 一个是优惠完的合计  一个是所有品项不优惠的合计
      // 开启回显的话合计需加上已点品项合计 182-1191 by L.R
      // bsData.itemOrigMoney: 429 原金额
      // bsData.itemIncomeTotal: 287.84 实际金额
      if (this.isShowOrdedItems && this.posOrderBill && this.posOrderBill.bsData) {
        this.totalPrice.orderingItemLastTotalPrice = add(
          this.posOrderBill.bsData.itemIncomeTotal,
          itemLastTotalPrice,
        );
        this.totalPrice.orderingItemTotalPrice = add(
          this.posOrderBill.bsData.itemOrigMoney,
          itemTotalPrice,
        );
      } else {
        this.totalPrice.orderingItemLastTotalPrice = itemLastTotalPrice;
        this.totalPrice.orderingItemTotalPrice = itemTotalPrice;
      }
      this.subPrice.orderingItemSubPrice = itemTotalPrice;
      this.subPrice.orderingItemLastSubPrice = itemLastTotalPrice;
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
    submitDish(nowItems) {
      const submitDishData = [];
      // 缓存下需要和并的品项
      const neddMergeItem = {};
      const billList = nowItems || this.guestListData;
      billList.forEach((list, index) => {
        // isDoMerger是要执行合并，默认false， mergeIndex当前缓存的满足合并条件数据在submitDishData组合数组的位置
        let isDoMerger = false;
        const mergeIndex = submitDishData.length;
        // 条件为不允许重复加单的设置 不是称重确认的易盘加单的品项
        if (!this.posSettings.isMergeAddBill && !list.isConfirmWeigh && list.TagID) {
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
          const item_id = list.id || list.realItemId;
          const item = {
            costPrice: list.costPrice, // 成本价格
            isCanDiscount: list.isCanDiscount,
            discFlg: list.discFlg, // 打折标识:	0-无,1-赠,2-折,3-变,4-促,5-会员
            enableHalf: list.enableHalf, // 是否允许半份
            isWeighed: list.isWeighed, // 是否是开启了适用电子秤
            isSingleMethod: list.isSingleMethod, // 是否是开启专属做法
            isConfirmWeigh: list.isConfirmWeigh, // 是否是开启称重确认
            isNegativePrice: list.isNegativePrice,
            method_list: this.submitItemMethod(list.methodList ? list.methodList : []), // 做法数据
            totalMakeFee: list.totalMakeFee, // 品项所有做法加价的总额
            is_buffet: list.isDinnerBuffet, // 是否是自助模式
            is_present_item: list.is_present_item, // 是否是赠送品项
            reason_id: list.reasonId,
            itemCode: list.code,
            itemName: list.sizeName ? `(${list.sizeName})${list.name}` : list.name, // 品项名称
            item_name: list.sizeName ? `(${list.sizeName})${list.name}` : list.name, // 品项名称
            item_id, // 品项id
            item_size_id: list.sizeId, // 规格id
            item_type: list.itemType, // 1正常品项，2临时品项，3常规套餐品项，4 宴会套餐品项
            memberPrice: list.memberPrice, // 会员价格
            orderId: list.orderId ? list.orderId : '', // 是否是预点单过来的品项
            origPrice: list.price, // 这个代表的是最终的加单价格,比如执行会员价,就是会员的价格
            // 这个是销售价格只有在变价的时候才传变价完的价格,其他都是自己的销售价格不变
            salePrice: +list.discFlg === 3 ? list.price : list.salePrice,
            stdPrice: list.stdPrice, // 这个是标准价格
            promotePrice: list.promotePrice ? list.promotePrice : 0, // 这个是促销价格
            isItemTimePrice: list.isItemTimePrice ? list.isItemTimePrice : false,
            // 价格类型  1-销售价格,2-会员价格,3-促销价格,4-变价价格:根据折扣标识折扣标识联动
            priceType: +list.discFlg === 4 ? 3 : list.priceType,
            qty: list.lastQty,
            lastSubtotal: list.lastSubtotal,
            exchangeId: list.exchangeId ? list.exchangeId : null,
            exchangeMode: list.exchangeMode,
            isExchange: list.isExchange,
            fullGiftId: list.fullGiftId, // 满赠方案id
            promoteLimitedQty: (list.promoteLimit || list.promoteLimit === 0) ? list.promoteLimit : '',
            params: {
              price: list.price,
              unitName: list.unitName,
              disPrice: list.disPrice
                ? list.disPrice
                : null,
            }, // //暂存额外的参数
            real_item_id: list.id,
            serve_way_id: (list.serveWay && list.serveWay.id) ? list.serveWay.id : 0,
            unitId: list.unitId,
            busiType: list.isPincai ? 1 : (list.isExchange || list.exchangeId) ? 2 : 0,
            itemIndex: list.mBindId ? list.mBindId : list.elId, // 这是拼菜的主菜的标识
            mergeItemIndex: list.bindId ? list.bindId : '', // 这是拼菜的辅菜的标识，后端用来进行匹配
            memberPlanId: list.memberPlanId ? list.memberPlanId : null, // 销售会员价方案ID
            promotePlanId: list.promotePlanId ? list.promotePlanId : null, // 促销价方案ID
            isDailyLimit: !!this.getVuexPromoteItemLimitsMap[`${item_id}_${list.sizeId}_${list.promotePlanId}`], // 是否存在促销每日限量
            isValidationMember: !!this.posOrderBill.crmMemberQueryData.data, // 是否验证会员
            isMemberExclusive: this.getVuexPromoteItemLimitsMap[`${item_id}_${list.sizeId}_${list.promotePlanId}`] ? this.getVuexPromoteItemLimitsMap[`${item_id}_${list.sizeId}_${list.promotePlanId}`].isMemberExclusive : list.isMemberExclusive, // 是否执行会员专享促销价 条件
          };
          // 如果是套餐
          if (list.isPackage) {
            // 联动的设置参数 isNotFollowAmount 是 true 为不联动否则联动
            item.isNotFollowAmount = list.isNotFollowAmount;
            // 套餐的明细品项加价的总和
            item.raisePrice = list.raisePrice ? list.raisePrice : 0;
            item.raiseMemberPrice = list.raiseMemberPrice || +list.raiseMemberPrice === 0
              ? list.raiseMemberPrice
              : null;
            // 宴会套餐添加个pkgPartPrice属性
            if (+list.pkgType === 1) {
              item.pkgPartPrice = list.price;
            }
            const pkgList = [];
            list.pkgList.forEach((_) => {
              const pkgItemData = {
                costPrice: _.costPrice || 0,
                discFlg: list.discFlg, // 折扣走主套餐的
                is_buffet: list.isDinnerBuffet, // 是否是自助模式
                itemCode: _.code,
                itemName: _.name,
                item_id: _.id,
                real_item_id: _.id,
                item_size_id: _.sizeId,
                serve_way_id: _.serveWay ? _.serveWay.id : 0,
                unitId: _.unitId,
                qty: _.num,
                isItemTimePrice: _.isItemTimePrice ? _.isItemTimePrice : false, // 是否是时价
                raisePrice: _.raisePrice,
                raiseMemberPrice: _.raiseMemberPrice,
                isRaiseByQty: _.isRaiseByQty,
                item_type: _.itemType || 5, // 套餐明细里的品项类型为5
                isTempItem: _.isTempItem,
                stdPrice: _.stdPrice,
                params: {
                  unitName: _.unitName,
                  qty: _.num,
                },
                apportionFlg: _.apportionFlg, // 是否参与分摊
              };
              // 添加 raisePriceType 常规套餐明细加价类型
              if (+list.itemType === 3) {
                if (+list.raisePriceType === 2 && (_.raiseMemberPrice || _.raiseMemberPrice == 0)) {
                  pkgItemData.raisePriceType = 2; // raisePriceType 为2 执行会员价
                } else {
                  pkgItemData.raisePriceType = 1; // raisePriceType 为1 不存在后者是没验证会员的时候执行的普通加价
                }
              }
              // 判断有做法存在就添加
              if (_.methodList && _.methodList.length) {
                pkgItemData.method_list = this.submitItemMethod(_.methodList);
              }
              // 如果是称重确认品项并且辅助单位存在添加 辅助单位
              if (_.auxiliaryUnitId) {
                pkgItemData.auxiliaryUnitId = _.auxiliaryUnitId;
                pkgItemData.auxiliaryUnitName = _.auxiliaryUnitName;
                pkgItemData.auxiliaryUnitQty = _.auxiliaryUnitQty;
              }
              pkgList.push(pkgItemData);
            });
            // 添加套餐明细
            item.pkg_list = pkgList;
          }
          // 临时品项, 处理临时品项明细
          if (+list.itemType === 2) {
            item.temp_item = {};
            item.temp_item.name = list.name;
            item.temp_item.unit_id = list.unitId;
            item.temp_item.unit_name = list.unitName;
            item.temp_item.price = list.price;
          }
          // 如果是称重确认品项并且辅助单位存在添加 辅助单位
          if (list.auxiliaryUnitId) {
            item.auxiliaryUnitId = list.auxiliaryUnitId;
            item.auxiliaryUnitName = list.auxiliaryUnitName;
            item.auxiliaryUnitQty = list.auxiliaryUnitQty;
          }
          submitDishData.push(item);
        }
      });
      return submitDishData;
    },
    // 提交的回调
    submitDishCallBack(data) {
      if (this.posInfo.isPrintBillAfterAddOrder) {
        this.$vemit('printGuestList');
      }
      this.$emit('clearGuestList');// 清空已加的品项
      this.$emit('initOrderingSetUpBtns');
      // this.$vemit('loadBill', this.posOrderBill.bsData.pointId);// 刷新下当前的客位账单
      // 是否加\\退\\赠单后自动打开钱箱
      if (this.outDeviceSetting.isOthersOpenCashbox) {
        this.$devices.Cashbox.open();
      }
      // 为初始化加单备注状态
      this.remarkData = {
        remarkList: [],
        remarkText: '',
      };
      // 客显
      // if(e != null && e.data != null){
      //   var bizPrintLeaveTableParamsList = e.data.bizPrintLeaveTableParamsList;
      //   if(posdata.mode == ReceptionModule.MODE_BUFFET){
      //     SELF.bizPrintLeaveTableParamsList = bizPrintLeaveTableParamsList;
      //   } else {
      //     BillBsModule.printLeaveTable(bizPrintLeaveTableParamsList);
      //   }
      // 更新客位状态的显示 这个更新客位状态的显示已在路由那写了
      // this.$vemit('updatePoint');
      // 执行打印留台单
      if (data && data.bizPrintLeaveTableParamsList) {
        this.printLeaveTable(data.bizPrintLeaveTableParamsList);
      }
      // 后台相关选项勾选的情况下加单成功则切换到客位TAB
      if (this.posSettings.isBackMain) {
        this.$router.push('/pos/order');
      }
      this.$vemit('loadBill', this.posOrderBill.bsData.pointId); // 刷新下当前的客位账单
      if (this.getReserveOrderList && this.getReserveOrderList.orderId) {
        this.setReserveOrderList(null); // 初始化下修改预点单过来的数据
        this.getReserveNotifyCount();
      }
    },
    /**
     * @函数说明 打印留台单
     * @创建 马 2018/6/11
     *
     * @public
     */
    printLeaveTable(bizPrintLeaveTableParamsList) {
      const url = 'canyin.pos.printleavetable.getleavetablestyledata'; // 接口地址
      // 获取posId  posInfo  Pos的一些信息见 vuex getter.js 的posInfo
      const posId = this.posInfo.id;
      bizPrintLeaveTableParamsList.map((list) => {
        let params = {
          bsId: list.bsId,
          ssId: list.ssId,
          pointId: list.pointId,
          styleType: 7,
        };
        // 如果posId 存在 合并下
        if (posId) {
          params = Object.assign({}, params, { posId });
        }
        this.$log.info('中餐打印留台单');
        this.$vemit('commonPrint', { url, params });
        return '';
      });
    },
    // 打印的通用方法
    print(data) {
      ajax(data.url, {
        contentType: 'paramsEncoded',
        needToken: true,
        data: data.params,
      }).then((res) => {
        // printType PRINT_PARALLEL 打印类型是并口的执行 进行打印业务
        if (res.printType === 'PRINT_PARALLEL') {
          if (res.printD) {
            this.$log.info('向设备管理器发送打印数据');
            this.$devices.Printer.print(res.printD);
          }
        }
      }).catch((error) => {
        this.$message.error(this.$t('Dict.Abnormal', [error]));
      });
    },
    orderingBillRemark() {
      ajax('canyin.pos.bill.billremarkview', {
        params: {
          pointId: this.$store.getters.posOrderBill.bsData.pointId,
        },
      }).then((data) => {
        this.$refs.remarkModal.open(extend(data, this.remarkData), {
          submit: (remarkData) => {
          // 记录下当前的
            this.remarkData = remarkData;
          },
        });
      });
    },
    // 客位账单修改套餐
    changePkg(item) {
      this.activePkgData = item;
      if (+item.pkgType === 0) {
        this.changeListPkgNormal(item);
      }
      if (+item.pkgType === 1) {
        this.changeListPkgPart(item);
      }
    },
    // 修改已提交的常规套餐品项
    changeListPkgNormal(item) {
      // 请求接口数据
      ajax('canyin.pos.bill.itempkgnormal', {
        params: {
          pkgId: item.itemId,
          scId: item.scId,
          pointId: this.posOrderBill.bsData.pointId,
          isBuffet: this.posOrderBill.isDinnerBuffet,
        },
      }).then((res) => {
        // 给数据添加个scId 用来区分套餐的修改是否是已提交的套餐修改
        this.$set(res, 'scId', item.scId);
        this.$refs.packageNormalChange.open(res, {
          submit: (pkgPartData, pkgData, skipKitchenPrint) => {
            const params = {
              sc_id: item.scId,
              point_id: this.posOrderBill.bsData.pointId,
              items: pkgPartData,
              isTeamAdd: this.isTeamAdd,
              skipKitchenPrint,
            };
            // alert('常规调试')
            // 关闭弹框
            ajax('canyin.pos.edititempkgbill.doedititempkg', {
              contentType: 'paramsEncoded',
              needToken: true,
              data: params,
            }).then((res2) => {
              if (res2.success) {
                this.$refs.packageNormalChange.close();
                this.$message.success(res2.data.msg);
                this.$vemit('loadBill', this.posOrderBill.bsData.pointId);// 刷新下当前的客位账单
              } else {
                this.$message.error(res2.msg);
              }
            });
          },
        });
      }).catch(() => {
      });
    },
    // 修改已提交的宴会套餐
    changeListPkgPart(item) {
      ajax('canyin.pos.bill.itempkgpart', {
        params: {
          pkgId: item.itemId,
          scId: item.scId,
          pointId: this.posOrderBill.bsData.pointId,
          isBuffet: this.posOrderBill.isDinnerBuffet,
        },
        needLog: true,
      }).then((res) => {
        // 给数据添加个scId 用来区分套餐的修改是否是已提交的套餐修改
        this.$set(res, 'scId', item.scId);
        this.$refs.packagePartChange.open(res, {
          submit: (pkgPartData, pkgData, skipKitchenPrint) => {
            const params = {
              sc_id: item.scId,
              point_id: this.posOrderBill.bsData.pointId,
              items: pkgPartData,
              isTeamAdd: this.isTeamAdd,
              skipKitchenPrint,
            };
            // edititempkgpartbill
            ajax('canyin.pos.edititempkgpartbill.doedititempkg', {
              contentType: 'paramsEncoded',
              needToken: true,
              data: params,
            }).then((res2) => {
              if (res2.success) {
                this.$message.success(res2.data.msg);
                this.$refs.packagePartChange.close();
                this.$vemit('loadBill', this.posOrderBill.bsData.pointId);// 刷新下当前的客位账单
              } else {
                this.$message.error(res2.msg);
              }
            });
          },
        });
        // alert('宴会调试')
      });
    },
    // 做法提交的进行特殊处理下
    submitItemMethod(methods) {
      const methodArr = cloneDeep(methods);
      if (methodArr.length) {
        methodArr.forEach((_) => {
          // 注释:::::::下为什么!feeChanged 就是不允许修改价格的时候price 的值为''不能传值 这个需要请问后台了
          if (!_.feeChanged) {
            this.$set(_, 'price', '');
          }
        });
      }
      return methodArr;
    },
    // 全选逻辑
    handleCheckAllChange(val) {
      this.scIdStr = '';
      if (val) { // 全选中状态
        this.scList.forEach((item) => {
          this.scIdStr += `${item.scId},`;
          if (item.pkgList) {
            item.pkgList.forEach((val2) => {
              this.scIdStr += `${val2.scId},`;
            });
          }
        });
        this.settleType = 2;
      } else {
        this.scIdStr = '';
        this.settleType = 1;
      }
      this.checkedItems = val ? this.scList : [];
      // //当前选中值
      // this.currenSelectItem = val ? this.scList : [];
    },
    handleCheckedItemsChange(value) {
      // this.currenSelectItem = value;
      this.scIdStr = '';
      value.forEach((item) => {
        this.scIdStr += `${item.scId},`;
        if (item.pkgList) {
          item.pkgList.forEach((val) => {
            this.scIdStr += `${val.scId},`;
          });
        }
      });
      const checkedCount = value.length;
      this.checkAll = checkedCount === this.scList.length;
      if (checkedCount === this.scList.length) {
        // 全选
        this.settleType = 2;
      } else {
        // 非全选
        this.settleType = 1;
      }
    },
    ...mapMutations({
      setMultsettle: 'SET_MULTISETTLE',
      setReserveOrderList: 'SET_RESERVEORDER_LIST',
      // setIsBatchOperation:'IS_BATCH_OPERATION'
    }),
    ...mapActions([
      'getReserveNotifyCount',
    ]),
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

@pos-order-bill-list-bg: #eef3f5;

@pos-order-bill-list-item-padding-top: 12px;
@pos-order-bill-list-item-padding-bottom: 5px;
@pos-order-bill-list-item-border-color: #d1dadf;

@pos-order-bill-list-index-width: 38px;
@pos-order-bill-list-index-offset-top: 2px;
@pos-order-bill-list-index-size: 16px;
@pos-order-bill-list-index-padding-horizontal: 4px;
@pos-order-bill-list-index-font-size: 12px;
@pos-order-bill-list-index-bg: #aebfc7;

@pos-order-bill-list-content-padding-right: 10px;

@pos-order-bill-list-title-height: 20px;

@pos-order-bill-list-flag-wrap: 80px;
@pos-order-bill-list-flag-size: 16px;
@pos-order-bill-list-flag-font-size: 12px;
@pos-order-bill-list-flag-space: 4px;

@pos-order-bill-list-info-height: 18px;
@pos-order-bill-list-info-font-size: 12px;
@pos-order-bill-list-info-text-color: #666;
@pos-order-bill-list-subtotal-width: 88px;

@pos-order-bill-list-method-height: 18px;
@pos-order-bill-list-method-font-size: 12px;

@pos-order-bill-list-pager-height: 42px;
@pos-order-bill-list-pager-padding-horizontal: 10px;
@pos-order-bill-list-pager-bg: #eef3f6;

@subTotal-wrap-height: 20px;

.pos-order-bill-list {
  position: relative;
  height: 100%;
  padding-bottom: @pos-order-bill-list-pager-height;

  > .pos-pager {
    position: absolute;
    left: 0;
    bottom: 0;
    .size(100%, @pos-order-bill-list-pager-height);
    padding-left: @pos-order-bill-list-pager-padding-horizontal;
    padding-right: @pos-order-bill-list-pager-padding-horizontal;
    background-color: @pos-order-bill-list-pager-bg;
    padding-top: (@pos-order-bill-list-pager-height - @pos-pager-height) / 2;
    text-align: right;
  }
}

.pos-order-bill-list .pos-ordering-subTotal {
  height: calc(100% - @subTotal-wrap-height);
}
.subTotalWrap {
  height: @subTotal-wrap-height;
  padding-right: 20px;
  border-bottom: 1px dotted #999999;
  text-align: right;

  span {
    color: #333;
  }
  strong {
    font-weight: normal;
  }
  del {
    color: #999;
  }
}
.pos-order-bill-list-view {
  height: 100%;
  overflow-y: auto;
  background-color: @pos-order-bill-list-bg;

  &.is-ordering {
    > .pos-ordered-bill-list {
      background-color: #FFFFFF;
      border-bottom-color: #D7D7D7;
      cursor: default;
    }

    > .reshow {
      background-color: #F0F0F0;
    }

    > .reshow.active {
      background-color: #cae2e4;
    }
  }

  > .el-checkbox-group {

    > li {
      background-color: @white;
      padding-top: @pos-order-bill-list-item-padding-top;
      padding-bottom: @pos-order-bill-list-item-padding-bottom;
      border-bottom: 1px solid @pos-order-bill-list-item-border-color;

      > .el-checkbox {

        > .el-checkbox__label {

          > .a {
            position: relative;
            padding-left: @pos-order-bill-list-index-width;

            > .b {
              position: absolute;
              left: 0;
              top: @pos-order-bill-list-index-offset-top;
              width: @pos-order-bill-list-index-width;
              text-align: center;

              > em {
                display: inline-block;
                height: @pos-order-bill-list-index-size;
                padding-left: @pos-order-bill-list-index-padding-horizontal;
                padding-right: @pos-order-bill-list-index-padding-horizontal;
                font-size: @pos-order-bill-list-index-font-size;
                line-height: @pos-order-bill-list-index-size;
                border-radius: @pos-order-bill-list-index-size / 2;
                background-color: @pos-order-bill-list-index-bg;
                color: @white;
                font-style: normal;
              }

            }

            > .c {
              padding-right: @pos-order-bill-list-content-padding-right;
              >.itemMainMessage {
                > .d {
                  position: relative;
                  height: @pos-order-bill-list-title-height;
                  padding-right: @pos-order-bill-list-flag-wrap;

                  > h3 {
                    height: @pos-order-bill-list-title-height;
                    line-height: @pos-order-bill-list-title-height;
                    font-weight: bold;
                    .text-overflow();
                  }

                  > .e {
                    position: absolute;
                    right: 0;
                    top: 0;
                    .size(@pos-order-bill-list-flag-wrap, @pos-order-bill-list-title-height);
                    padding-top: (
                        @pos-order-bill-list-title-height -
                          @pos-order-bill-list-flag-size
                      ) / 2;
                    text-align: right;
                    font-size: 0;

                    > em {
                      display: inline-block;
                      .square(@pos-order-bill-list-flag-size);
                      line-height: @pos-order-bill-list-flag-size;
                      text-align: center;
                      font-size: @pos-order-bill-list-flag-font-size;
                      color: @white;
                      font-style: normal;
                      margin-left: @pos-order-bill-list-flag-space / 2;
                      margin-right: @pos-order-bill-list-flag-space / 2;

                      &.give {
                        background-color: @pos-flag-give-color;
                      }
                      &.successConfirmWeigh {
                        background-color:#5cb95c;
                      }
                      &.discount {
                        background-color: @pos-flag-discount-color;
                      }

                      &.changed {
                        background-color: @pos-flag-changed-color;
                      }

                      &.promotion {
                        background-color: @pos-flag-promotion-color;
                      }

                      &.vip {
                        background-color: @pos-flag-vip-color;
                      }

                      &.hasten {
                        background-color: @pos-flag-hasten-color;
                      }

                      &.package {
                        background-color: @pos-flag-package-color;
                      }
                    }
                  }
                }

                > .f {
                  position: relative;
                  padding-right: @pos-order-bill-list-subtotal-width;
                  height: @pos-order-bill-list-info-height;
                  line-height: @pos-order-bill-list-info-height;
                  font-size: @pos-order-bill-list-info-font-size;
                  // color: @pos-order-bill-list-info-text-color;

                  > .g {
                    float: left;
                  }

                  > .h {
                    float: right;
                    width: 52px;
                    height: 18px;
                    line-height: 18px;
                    overflow: hidden;
                    text-align: right;
                  }

                  > .i {
                    position: absolute;
                    right: 0;
                    top: 0;
                    width: @pos-order-bill-list-subtotal-width;
                    height: 18px;
                    line-height: 18px;
                    overflow: hidden;
                    text-align: right;
                    white-space: nowrap;
                  }
                }
                &.pkgItemClickClass {
                  box-shadow: 1px 0px 1px 1px #678;
                  border-radius: 2px;
                  cursor: pointer;
                }
                @keyframes addborder{
                  0% {
                    border: 0px solid transparent;
                  }
                  50% {
                    border: 1px solid transparent;
                  }
                  100% {
                    border: 0px solid transparent;
                  }
                }
                // &.activePkg{
                //   border: 1px solid transparent;
                // }
              }
              > .j {
                margin-top: 2px;
                line-height: @pos-order-bill-list-method-height;
                font-size: @pos-order-bill-list-method-font-size;
              }
              > .k {

                > li::after{
                  content: "";
                  display: block;
                  clear: both;
                }
                > li {
                  position: relative;
                  // color:#2db1be;
                  // color: #678;
                  font-size: 12px;
                  >.pkgItemMainContent {
                    padding-left: 16px;
                    line-height: 15px;
                    margin-top: 2px;
                    padding-right: 84px;
                    position: relative;
                    >span {
                      display: inline-block;
                    }
                    > i{
                      font-size: 12px;
                      position: absolute;
                      left: 0px;
                    }
                    >.setmealitem {
                      width: 106px;
                      overflow: hidden;
                    }
                    >.setmealitemnum {
                      overflow: hidden;
                      width: 40px;
                      white-space: nowrap;
                      text-align: right;
                      float: right;
                      margin-left:2px;
                    }
                    >.raisePrice {
                      position: absolute;
                      right: 0;
                      width: 62px;
                      text-align: right;
                      &.memberPrice::before{
                        content: "会";
                        position: absolute;
                        left: -10px;
                        top: -1px;
                        background-color: @pos-flag-vip-color;
                        color: #ffffff;
                        padding: 2px;
                      }
                    }
                  }
                  >.pkgItemServeContent {
                    margin-left: 16px;
                    white-space: nowrap;
                    overflow: hidden;
                    &.bsIdPkgItemServeContent {
                      padding-right: 50px;
                      position: relative;
                      >.methodPriceTotal {
                        position: absolute;
                        right: 0px;
                        width: 50px;
                        text-align: right;
                        top:0;
                      }
                    }
                  }
                }

              }
            }

          }

        }

      }

    // }

    &.active {
      background-color: #b8f9ff;
    }

    &:after {
      border-bottom: none;
    }
  }

  }
  > li {
    background-color: @white;
    padding-top: @pos-order-bill-list-item-padding-top;
    padding-bottom: @pos-order-bill-list-item-padding-bottom;
    border-bottom: 1px solid @pos-order-bill-list-item-border-color;

    > .a {
      position: relative;
      padding-left: @pos-order-bill-list-index-width;

      > .b {
        position: absolute;
        left: 0;
        top: @pos-order-bill-list-index-offset-top;
        width: @pos-order-bill-list-index-width;
        text-align: center;

        > em {
          display: inline-block;
          height: @pos-order-bill-list-index-size;
          padding-left: @pos-order-bill-list-index-padding-horizontal;
          padding-right: @pos-order-bill-list-index-padding-horizontal;
          font-size: @pos-order-bill-list-index-font-size;
          line-height: @pos-order-bill-list-index-size;
          border-radius: @pos-order-bill-list-index-size / 2;
          background-color: @pos-order-bill-list-index-bg;
          color: @white;
          font-style: normal;
        }
      }
      > .c {
        padding-right: @pos-order-bill-list-content-padding-right;
        >.itemMainMessage {
          > .d {
            position: relative;
            height: @pos-order-bill-list-title-height;
            padding-right: @pos-order-bill-list-flag-wrap;

            > h3 {
              height: @pos-order-bill-list-title-height;
              line-height: @pos-order-bill-list-title-height;
              font-weight: bold;
              .text-overflow();
            }

            > .e {
              position: absolute;
              right: 0;
              top: 0;
              .size(@pos-order-bill-list-flag-wrap, @pos-order-bill-list-title-height);
              padding-top: (
                  @pos-order-bill-list-title-height -
                    @pos-order-bill-list-flag-size
                ) / 2;
              text-align: right;
              font-size: 0;

              > em {
                display: inline-block;
                .square(@pos-order-bill-list-flag-size);
                line-height: @pos-order-bill-list-flag-size;
                text-align: center;
                font-size: @pos-order-bill-list-flag-font-size;
                color: @white;
                font-style: normal;
                margin-left: @pos-order-bill-list-flag-space / 2;
                margin-right: @pos-order-bill-list-flag-space / 2;

                &.give {
                  background-color: @pos-flag-give-color;
                }
                &.successConfirmWeigh {
                  background-color:#5cb95c;
                }
                &.discount {
                  background-color: @pos-flag-discount-color;
                }

                &.changed {
                  background-color: @pos-flag-changed-color;
                }

                &.promotion {
                  background-color: @pos-flag-promotion-color;
                }

                &.vip {
                  background-color: @pos-flag-vip-color;
                }

                &.hasten {
                  background-color: @pos-flag-hasten-color;
                }

                &.package {
                  background-color: @pos-flag-package-color;
                }
                &.easy-icon {
                  background:url('../../../../common/images/pos/bill/easyicon.png');
                }
              }
            }
          }

          > .f {
            position: relative;
            padding-right: @pos-order-bill-list-subtotal-width;
            height: @pos-order-bill-list-info-height;
            line-height: @pos-order-bill-list-info-height;
            font-size: @pos-order-bill-list-info-font-size;
            color: @pos-order-bill-list-info-text-color;

            > .g {
              float: left;
            }

            > .h {
              float: right;
              width: 48px;
              height: 18px;
              line-height: 18px;
              overflow: hidden;
              text-align: right;
            }

            > .i {
              position: absolute;
              right: 0;
              top: 0;
              width: @pos-order-bill-list-subtotal-width;
              height: 18px;
              line-height: 18px;
              overflow: hidden;
              text-align: right;
              white-space: nowrap;
            }
          }
          &.pkgItemClickClass {
            box-shadow: 1px 0px 1px 1px #678;
            border-radius: 2px;
            cursor: pointer;
          }
          @keyframes addborder{
            0% {
              border: 0px solid transparent;
            }
            50% {
              border: 1px solid transparent;
            }
            100% {
              border: 0px solid transparent;
            }
          }
          // &.activePkg{
          //   border: 1px solid transparent;
          // }
        }
        > .j {
          margin-top: 2px;
          line-height: @pos-order-bill-list-method-height;
          font-size: @pos-order-bill-list-method-font-size;
        }
        > .k {

          > li::after{
            content: "";
            display: block;
            clear: both;
          }
          > li {
            position: relative;
            // color:#2db1be;
            color: #678;
            font-size: 12px;
            >.pkgItemMainContent {
              padding-left: 16px;
              line-height: 15px;
              margin-top: 2px;
              padding-right: 84px;
              position: relative;
              >span {
                display: inline-block;
              }
              > i{
                font-size: 12px;
                position: absolute;
                left: 0px;
              }
              >.setmealitem {
                width: 106px;
                overflow: hidden;
              }
              >.setmealitemnum {
                overflow: hidden;
                width: 40px;
                white-space: nowrap;
                text-align: right;
                float: right;
                margin-left:2px;
              }
              >.raisePrice {
                position: absolute;
                right: 0;
                width: 62px;
                text-align: right;
                &.memberPrice::before{
                  content: "会";
                  position: absolute;
                  left: -10px;
                  top: -1px;
                  background-color: @pos-flag-vip-color;
                  color: #ffffff;
                  padding: 2px;
                }
              }
            }
            >.pkgItemServeContent {
              margin-left: 16px;
              white-space: nowrap;
              overflow: hidden;
              &.bsIdPkgItemServeContent {
                padding-right: 50px;
                position: relative;
                >.methodPriceTotal {
                  position: absolute;
                  right: 0px;
                  width: 50px;
                  text-align: right;
                  top:0;
                }
              }
            }
          }

        }
      }
    }

    &.active {
      background-color: #b8f9ff;
    }

    &:after {
      border-bottom: none;
    }
  }

  &.is-ordering > li {
    cursor: pointer;
  }
}
.billShowBoxFoot {
  >.billShowBoxFootLeft {
    width: 180px;
    >.posMainBillBsRemark {
      float: left;
      height: 36px;
      line-height: 36px;
      width: 112px;
      margin-top: 2px;
      padding-left: 8px;
      color: #7f7f7f;
      cursor: pointer;
      >i {
        font-size: 24px;
        color: #7f7f7f;
        margin-left: 2px;
        float: left;
      }
      >span {
        display: inline-block;
        width: 78px;
        height: 100%;
        overflow: hidden;
        word-wrap: break-word;
      }
      >.defuletRemark {
        line-height: 38px;
      }
      >.orderingRemark {
        line-height: 18px;
      }
    }
    >.billOrderingState {
      float: right;
      width: 68px;
      >span {
        width: 30px;
        display: inline-block;
        text-align: center;
        color: #ffffff;
        margin-right: 2px;
        margin-top: 5px;
        background: #0babb9;
        border-radius: 6px;
        line-height: 16px;
        font-size: 12px;
      }
      >span:nth-of-type(1) {
        margin-right: 0px;
      }
    }
  }
  >.billShowBoxFootRight {
    width: 112px;
    position: absolute;
    right: 10px;
    bottom: 5px;
  }
}
.pkg-warp{
  white-space: normal !important
}
</style>

<style lang="less">
@import "~@/common/less/variables.less";
.billShowBoxFootRight .pos-pager > button {
  color: @white;
  background-color: rgba(0,0,0,0.2);
  border: none;
}
.el-checkbox-group {

  > li{

    > .el-checkbox {
      width: 100%;
      position: relative;

      > .el-checkbox__input {
        position: absolute;
        top: 50%;
        left: 12px;
        margin-top: -7px;
      }

      > .el-checkbox__label {
        width:100%;
      }
    }
  }
}
</style>
