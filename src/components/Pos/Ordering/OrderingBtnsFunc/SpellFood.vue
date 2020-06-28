<template>
<!-- 拼菜 -->
  <Dialog
    name="PosDialog.OrderingSpellFoodModal"
    :title="$t('Biz.Order.SpellFood')"
    ref="dialog"
    width="900px"
    height="670px"
    :showSubmit="true"
    :hotkeys="hotKeySet"
    @open="onOpen"
    @close="onClose"
    @submit="onSubmit"
  >
    <div class="pos-dialog-content">
      <div class="ordering-spellfood-wrap">
        <div class="ordering-spellfood-left">
          <div class="ordering-spellfood-list">
            <ul id="spellFoodBillsPager" class="ordering-spellfood-bills" ref="spellFoodBills">
              <li
                v-for="(item, index) in guestListData"
                :key="index"
                :class="{ active: activeItem && activeItem == item.elId }"
                :ref="item.elId"
                @click="billClickHandler(item)"
              >
                <p class="itemCode">{{ item.code }}</p>
                <div class="item">
                  <span class="itemName">
                    <!-- [拼] -->
                    {{
                    item.bindId ? $t('Biz.Order.SpellFoodTag') : ''
                    }}{{
                    item.sizeName ? ('('+item.sizeName+')'+item.name) : item.name
                    }}
                  </span>
                  <span class="itemMethodPrice">{{ handlerRaisePrice(item.price) }}</span>
                  <span class="itemNum">{{ item.lastQty }}</span>
                </div>
                <p
                  class="itemRemarks"
                  v-if="(item.methodList && item.methodList.length) || item.serveWay"
                >
                  <!-- 注 -->
                  <span>{{ $t('Dict.Notes01') }}</span>
                  <span v-if="item.serveWay">
                    {{ item.serveWay.name }}
                    <strong
                      v-if="item.methodList && item.methodList.length"
                    >|</strong>
                  </span>
                  <span v-for="(method, index) in item.methodList" :key="index">
                    {{
                    method.name
                    }}{{
                    method.price
                    ? '(+' + method.price + (
                    method.qty && method.qty !== 1
                    ? 'x' + method.qty
                    : ''
                    ) + ')'
                    : ''
                    }}
                    <strong
                      v-if="index !== item.methodList.length - 1"
                    >|</strong>
                  </span>
                </p>
              </li>
            </ul>
            <div class="ordering-spellfood-bills-pager">
              <!-- 合计： -->
              <div class="ordering-spellfood-lasttotal">{{
                $t('Dict.Total01')
              }}{{ lastTotal }}</div>
              <Pager
                ref="spellFoodBillsPager"
                scrollMode="simple"
                pagerId="spellFoodBillsPager"
                :animate="200"
                arrowDirection="up-down"
              ></Pager>
            </div>
          </div>
          <div class="ordering-spellfood-btns">
            <!-- 删除 -->
            <button type="button" @click="deleteItem">{{ $t('Dict.Btn.DeleteItem') }}</button>
            <button type="button" @click="addItemNum" :disabled="isDisabledAdd">+</button>
            <button type="button" @click="subtractItemNum">-</button>
            <!-- 半份 -->
            <button type="button" @click="changeHalfNum">{{ $t('Dict.Btn.ChangeHalfNum') }}</button>
            <!-- 数量 -->
            <button type="button" @click="changeItemNum">{{ $t('Dict.Btn.ChangeItemNum') }}</button>
            <!-- 价格 -->
            <button
              type="button"
              @click="changeItemPrice"
            >{{ $t('Dict.Btn.ChangeItemPrice') }}</button>
            <!-- 由于修改规格在附菜金额为零时会产生金额计算的问题，所以暂时屏蔽掉 -->
            <!-- http://192.168.4.84:88/zentao/bug-view-71618.html -->
            <!-- <button type="button" @click="modifyItemSize">规格</button> -->
            <!-- 做法 -->
            <button
              type="button"
              @click="changeItemMethods"
            >{{ $t('Dict.Btn.ChangeItemMethods') }}</button>
            <!-- 上菜方式 -->
            <button
              type="button"
              @click="changeItemServeWay"
            >{{ $t('Dict.Btn.ChangeItemServeWay') }}</button>
          </div>
        </div>
        <div class="ordering-spellfood-right">
          <div class="ordering-spellfood-filter">
            <Paging
              :data="smallClasses"
              :active.sync="activeClass"
              :itemWidth="90"
              :itemHeight="55"
              :fix="1"
              :autoActive="false"
              class="ordering-spellfood-filter-list"
              ref="ordingSpellFoodFilterList"
              id="ordingSpellFoodFilterList"
            >
              <button
                type="button"
                slot-scope="props"
                :class="{ 'active': props.item.id === activeClass.id }"
                @click="changeClassFilter(props.item)"
              >{{ props.item.name }}</button>
            </Paging>
            <PagingBtn
              ref="ordingSpellFoodFilterPagingBtn"
              class="ordering-spellfood-filter-pager"
            ></PagingBtn>
          </div>
          <div class="ordering-spellfood-menus">
            <Paging
              :data="filteredMenus"
              :active.sync="activeMenu"
              :itemWidth="126"
              :itemHeight="86"
              class="ording-spellfood-menu-list"
              ref="ordingSpellFoodMenuList"
              id="ordingSpellFoodMenuList"
            >
              <button
                type="button"
                slot-scope="props"
                :class="{ 'active': props.item.id === activeMenu.id }"
                @click="add(props.item)"
              >
                <div class="c">
                  <span class="code">{{ props.item.code }}</span>
                  <!-- 估清 -->
                  <span class="sellout" v-if="props.item.isSellout">
                    {{ $t('Dict.Sellout') }}
                  </span>
                  <!-- 限 {{ props.item.limit }} -->
                  <span
                    class="limit"
                    v-if="!props.item.isSellout && props.item.limit !== null"
                  >{{ $t('Dict.LimitNum', [props.item.limit]) }}</span>
                </div>
                <div class="n">{{ props.item.name }}</div>
                <!-- 国际化：删除￥ -->
                <div
                  class="p"
                  v-if="props.item.discFlg !==  4"
                >{{ props.item.price }}/{{ props.item.unitName }}</div>
                <div class="p" v-if="props.item.discFlg ===  4">
                  <!-- 促 -->
                  <em class="promotion-flag">{{ $t('Dict.Promotion') }}</em>
                  <span>
                    <!-- 国际化：删除￥ -->
                    {{ props.item.price }}
                    <del>{{ props.item.salePrice }}</del>
                    /{{ props.item.unitName }}
                  </span>
                </div>
                <div class="count" v-if="props.item.count">{{ props.item.count }}</div>
              </button>
            </Paging>
          </div>
          <div class="ordering-spellfood-control">
            <!-- 快速查找 -->
            <Search
              ref="spellFoodSearch"
              @search="onSearch"
              focusSetKeyboardPosition="top"
              :placeholderText="$t('Dict.QuickSearch')"
              searchId="searchSpellFoodMenus"
              class="ordering-spellfood-search"
              :resultLength="filteredMenus.length"
            ></Search>
            <div class="ordering-spellfood-pager">
              <PagingBtn
                ref="orderingSpellFoodMenuListPagingBtn"
                :showInfo="true"
                class="ordering-spellfood-menu-pager"
              ></PagingBtn>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ItemSize
      ref="itemSize"
      @choiceSize="addSize"
      :areaType="areaType"
      submitId="spellFoodItemSize"
      :isNest="true"
      type="spell"
    ></ItemSize>
    <OrderingChangeNum ref="orderingChangeNum" :isNest="true"></OrderingChangeNum>
    <OrderingChangePrice ref="orderingChangePrice" :isNest="true"></OrderingChangePrice>
    <OrderingChangeMethods
      ref="orderingChangeMethods"
      type="root"
      submitId="spellFoodMethodsSubmit"
      :isNest="true"
    ></OrderingChangeMethods>
    <OrderingServeWay ref="orderingServeWay"></OrderingServeWay>
  </Dialog>
</template>

<script>
import {
  filter,
  map,
  each,
  extend,
  concat,
  groupBy,
  reduce,
  uniqueId,
  first,
  last,
  isString,
  isPlainObject,
  find,
  findLast,
  indexOf,
} from 'lodash';
import { mapGetters } from 'vuex';
import {
  add,
  sub,
  multi,
  round,
  zeroize,
} from '@/common/js/math';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';
import Paging from '@/components/Pos/Common/Paging';
import PagingBtn from '@/components/Pos/Common/PagingBtn';
import Search from '@/components/Pos/Order/Tables/Search';
import ajax from '@/common/js/ajax';
import * as itemConstantSet from '@/common/dictionary/pos-ordering-item-constant-set';
import LoadScaleMixin from '@/components/Pos/Common/LoadScaleMixin';
import quickSearch from '@/common/js/quicksearch';
import newWeightUnitConversion from '@/common/js/newWeightUnitConversion';

// 规格
const ItemSize = (resolve) => {
  import('../Menu/ItemSize').then((module) => {
    resolve(module);
  });
};

// 改量
const OrderingChangeNum = (resolve) => {
  import('./OrderingChangeNum').then((module) => {
    resolve(module);
  });
};

// 改价
const OrderingChangePrice = (resolve) => {
  import('./OrderingChangePrice').then((module) => {
    resolve(module);
  });
};

// 做法
const OrderingChangeMethods = (resolve) => {
  import('@/components/Pos/Business_commons/OrderingChangeMethods').then((module) => {
    resolve(module);
  });
};

// 上菜方式
const OrderingServeWay = (resolve) => {
  import('./OrderingServeWay').then((module) => {
    resolve(module);
  });
};

export default {
  components: {
    Dialog,
    Pager,
    Paging,
    PagingBtn,
    ItemSize,
    Search,
    OrderingChangeNum,
    OrderingChangePrice,
    OrderingChangeMethods,
    OrderingServeWay,
  },
  mixins: [DialogMixin, LoadScaleMixin],
  props: {
    areaType: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      activeList: [],
      activeMenu: {},
      activeClass: {},
      activeItem: null,
      searchText: '',
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
        '↑': () => {
          this.$refs.ordingSpellFoodMenuList.select('↑');
        },
        '↓': () => {
          this.$refs.ordingSpellFoodMenuList.select('↓');
        },
        '←': () => {
          this.$refs.ordingSpellFoodMenuList.select('←');
        },
        '→': () => {
          this.$refs.ordingSpellFoodMenuList.select('→');
        },
        Enter: () => {
          this.add(this.activeMenu);
        },
        BackSpace: () => {
          this.$refs.spellFoodSearch.delWordInBlur();
        },
        ...this.setKeySearchHotKey(),
      };
    },
    ...mapGetters([
      'setting',
      'posItems',
      'posItemSmallClasses',
      'posOrderBill',
      'posSettings',
      'posDevice',
      'getVuexItemSelloutsMap',
      'getVuexItemLimitsMap',
      'getVuexPosMode',
      'getFastFoodBillData',
      'getisSetUpGroupMethod',
      'getVuexPointData',
    ]),
    quickSearchText() {
      return quickSearch((`${this.searchText}`).toLowerCase());
    },
    // 计算合计
    lastTotal() {
      // 遍历账单，所有小计的和
      return reduce(this.guestListData, (sum, item) => add(
        sum,
        item.lastSubtotal,
      ), 0);
    },
    // 过滤出拼菜的菜单
    // 增加客位限定的过滤
    menu() {
      if (this.getVuexPointData.pointGroupId) {
        return filter(this.posItems, item => (
          item.isPincai === true
          && item.isPackage === false
          && this.activeList.length
          && item.id !== this.activeList[0].id
          && (!item.pointGroupId || item.pointGroupId === this.getVuexPointData.pointGroupId)
        ));
      }
      return filter(this.posItems, item => (
        item.isPincai === true
        && item.isPackage === false
        && this.activeList.length
        && item.id !== this.activeList[0].id
      ));
    },
    // 菜单的扩展数据
    menus() {
      return map(this.menu, item => extend({}, item, {
        count: this.countByItemId(item, this.activeList),
        isSellout: this.itemIsSellout(item, this.getVuexItemSelloutsMap),
        limit: this.itemLimit(item, this.getVuexItemLimitsMap),
        barcode: item.barcode ? item.barcode : '',
      }));
    },
    // 小类列表
    smallClasses() {
      return concat({
        id: '',
        name: this.$t('Dict.All'),
      }, this.computedSmallClasses);
    },
    // 计算小类已选数量
    computedSmallClasses() {
      return filter(this.countByClassId(this.menus), item => item.count > 0);
    },
    // 显示过滤菜单数据
    filteredMenus() {
      return filter(this.menus, item => this.classFilter(item) && this.checkSearchText(item));
    },
    // 分组菜品列表
    groupedList() {
      return groupBy(this.activeList, item => this.getElId(item));
    },
    // 处理分组数据
    guestListData() {
      return this.calcMethodPrice(map(this.groupedList, (item, elId) => extend({}, item[0], {
        elId,
        list: item,
        lastQty: reduce(item, (sum, n) => add(sum, n.num), 0),
        lastSubtotal: item[0].discFlg === 1 ? 0 : reduce(item, (sum, n) => {
          const price = n.raisePrice ? add(n.price, n.raisePrice) : n.price;
          return add(sum, round(multi(price, n.num)));
        }, 0), // 赠送的小计为0
        is_present_item: item[0].discFlg === 1, // 是否是赠送品项
        pkgType: item[0].pkgType ? item[0].pkgType : null, // 套餐类型
        serveWay: item[0].serveWay,
        price: item[0].raisePrice
          ? add(item[0].price, item[0].raisePrice)
          : item[0].price, // item[0].price 联动回退
        item_type: item[0].itemType,
        salePrice: item[0].raisePrice
          ? add(item[0].salePrice, item[0].raisePrice)
          : item[0].salePrice, // item[0].salePrice 联动的回退
        promotePrice: item[0].promotePrice, // item[0].promotePrice 联动的回退
        isItemTimePrice: item[0].isItemTimePrice
          ? item[0].isItemTimePrice
          : false,
        raisePrice: item[0].raisePrice ? item[0].raisePrice : 0,
        memberPrice: item[0].raisePrice
          ? add(item[0].salePrice, item[0].memberPrice)
          : item[0].memberPrice, // item[0].memberPrice 联动的回退
      })));
    },
    isDisabledAdd() {
      const finded = this.getCurrentItem(false);
      return this.handleisHasMorePromotionItem(finded);
    },
  },
  methods: {
    // 根据小类 Id 在 menu 总计算数量
    countByClassId(menus) {
      return map(this.posItemSmallClasses, item => extend({}, item, {
        count: this.countMenuCount(menus, item.id),
      }));
    },
    // 根据小类 Id 计算 menu 中同类菜品数量总和
    countMenuCount(menus, id) {
      return filter(menus, { smallClassId: id }).length;
    },
    // 获取搜索框用的快捷键
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
    inputKey(key) {
      this.$refs.spellFoodSearch.addWordInBlur(key);
    },
    // 提交事件
    onSubmit() {
      if (
        this.activeList.length
        && this.activeList.length !== filter(this.activeList, { bindId: null }).length
      ) {
        this.$refs.dialog.close();
        // 由于现有的拼菜的逻辑有缺陷，主菜只要添加了上菜方式和做法后者赠送了后者是打折了就造成辅菜和主菜关联不上的问题
        const submitData = this.getSubmitData(this.activeList);
        this.submit(submitData);
      } else {
        // 请选择附菜
        this.$message.warning(this.$t('Biz.Order.PleaseSelectSpellFood'));
      }
    },
    // 给数据添加已拼事件和给辅菜重新绑定下最新的bindId
    getSubmitData(spellFoodLists) {
      const nowBindId = this.getElId(spellFoodLists[0]);
      return spellFoodLists.map((list) => {
        if (list.bindId) {
          this.$set(list, 'bindId', nowBindId);
        } else {
          this.$set(list, 'mBindId', nowBindId);
        }
        return list;
      });
    },
    // 菜单点击事件
    billClickHandler(item) {
      this.setActiveItem(item.elId);
    },
    // 选中菜
    setActiveItem(elIdOrItem) {
      if (elIdOrItem && isString(elIdOrItem) && find(this.guestListData, { elId: elIdOrItem })) {
        if (find(this.guestListData, { elId: elIdOrItem })) {
          this.activeItem = elIdOrItem;
        } else {
          this.setActiveItem();
        }
      } else if (elIdOrItem && isPlainObject(elIdOrItem)) {
        if (find(this.guestListData, { elId: this.getElId(elIdOrItem) })) {
          this.activeItem = this.getElId(elIdOrItem);
        } else {
          this.setActiveItem();
        }
      } else {
        this.activeItem = this.guestListData.length ? last(this.guestListData).elId : null;
      }
    },
    // 价格显示转化 补零
    handlerRaisePrice(price) {
      return zeroize(price);
    },
    onOpen() {
      this.activeList = map(this.resData.activeList, item => extend({}, item, {
        busiType: 1,
        bindId: item.bindId ? item.bindId : null,
      }));
      this.activeItem = this.getElId(first(this.activeList));
      this.activeClass = first(this.smallClasses);
      this.searchText = '';
      this.activeFirstItem();
      this.$nextTick(() => {
        this.$refs.orderingSpellFoodMenuListPagingBtn.bind(this.$refs.ordingSpellFoodMenuList);
        this.$refs.ordingSpellFoodFilterPagingBtn.bind(this.$refs.ordingSpellFoodFilterList);
        this.$refs.ordingSpellFoodMenuList.refresh();
        this.$refs.spellFoodSearch.clearSearchText();
      });
    },
    // 拆分 elId
    getActiveItem() {
      if (this.activeItem) {
        const it = this.activeItem.split('.');
        return {
          lid: it[0],
          id: it[1],
          sizeId: it[2],
          discFlg: parseInt(it[3], 0),
          reasonId: it[4],
        };
      }
      return null;
    },
    // 获取当前选中的品项
    getCurrentItem(isShowMsg = true) {
      const active = this.getActiveItem();
      if (active) {
        const finded = findLast(this.activeList, active);
        if (finded) {
          return finded;
        }
        if (isShowMsg) {
          // 没有找到该品项
          this.$message.error(this.$t('Biz.Order.AddOrderErrorMsg'));
        }
        return false;
      }
      if (isShowMsg) {
        // 请在账单中选择您要操作的品项
        this.$message.warning(this.$t('Biz.Order.AddOrderWarnMsg'));
      }
      return false;
    },
    // 控制所选品项，回调返回选中值
    controlActive(handler, onlyLast) {
      const active = this.getActiveItem();
      if (active) {
        let finded = null;
        if (onlyLast) {
          finded = findLast(this.activeList, extend({}, active, { num: 1 }));
          if (!finded) {
            finded = findLast(this.activeList, active);
          }
        } else {
          finded = filter(this.activeList, active);
        }
        if (onlyLast ? finded : finded && finded.length) {
          if (onlyLast) {
            handler(finded);
          } else {
            each(finded, (item) => {
              handler(item);
            });
          }
          this.setActiveItem(active);
        } else {
          // 没有找到该品项
          this.$message.error(this.$t('Biz.Order.AddOrderErrorMsg'));
        }
      } else {
        // 请在账单中选择您要操作的品项
        this.$message.warning(this.$t('Biz.Order.AddOrderWarnMsg'));
      }
    },
    // 加单列表中筛选出 所选品项的列表 这个是个数组 因为把改量和+的都已push的形式添加进去的渲染的时候在Bill文件夹下的List.vue里又新根据lid 和uid重新合并一起
    getActiveList() {
      return filter(this.activeList, this.getActiveItem());
    },
    // 所选品项的总数量
    getActiveCount() {
      return reduce(
        this.getActiveList(),
        (sum, item) => add(sum, item.num),
        0,
      );
    },
    handleisHasMorePromotionItem(finded) {
      if (finded && finded.discFlg === 4 && this.getVuexPosMode === '3') {
        const total = this.handlePromoteItemTotal(finded);
        if (total >= finded.promoteLimit && finded.promoteLimit !== 0) {
          return true;
        }
      }
      return false;
    },
    // 删除按钮
    deleteItem() {
      if (this.activeItem) {
        const findActiveItem = find(this.guestListData, {
          elId: this.activeItem,
        });
        if (findActiveItem.bindId) {
          const finded = this.getCurrentItem();
          if (finded) {
            this.activeList.splice(indexOf(this.activeList, finded), 1);
            this.setActiveItem();
          }
        } else {
          // 主菜在这里不可以被删除
          this.$message.warning(this.$t('Biz.Order.SpellFoodWarning'));
        }
      }
    },
    // +1 按钮
    addItemNum() {
      const finded = this.getCurrentItem();
      if (finded) {
        if (finded.maxAddQty && finded.num >= finded.maxAddQty) {
          // 加单最大数量限制为${finded.maxAddQty}
          this.$message.warning(this.$t('Biz.BizComm.BizCommTip13', [finded.maxAddQty]));
        } else if (finded.discFlg === 4 && finded.promoteLimit !== 0 && this.getVuexPosMode === '3') {
          if (finded.promoteLimit - finded.num < 1) {
            finded.num = add(finded.num, finded.promoteLimit - finded.num);
          } else {
            finded.num = add(finded.num, 1);
          }
        } else {
          finded.num = add(finded.num, 1);
        }
      }
    },
    // -1 按钮
    subtractItemNum() {
      const findActiveItem = find(this.guestListData, {
        elId: this.activeItem,
      });
      if (
        !findActiveItem.bindId
        && (
          this.getActiveCount() <= 1
          || this.getActiveList().length === 1
        )
      ) {
        // 主菜在这里不可以被删除
        this.$message.warning(this.$t('Biz.Order.SpellFoodWarning'));
      } else {
        this.controlActive((finded) => {
          if (
            finded.num <= 1
            || (finded.minAddQty && finded.num <= finded.minAddQty)
          ) {
            if (!finded.enableHalf && this.getActiveCount() < 2) {
              const active = this.getActiveItem();
              const diffNum = sub(this.getActiveCount(), 1);
              const findItem = findLast(this.activeList, extend({}, active, {
                num: diffNum,
              }));
              this.activeList.splice(indexOf(this.activeList, findItem), 1);
            } else {
              this.activeList.splice(indexOf(this.activeList, finded), 1);
            }
          } if (!finded.enableHalf && this.getActiveCount() < 2) {
            finded.num = 1;
          } else {
            finded.num -= 1;
          }
        }, true);
      }
    },
    // 改量
    changeNum(num) {
      const finded = this.getCurrentItem();
      if (finded) {
        finded.num = num;
      }
    },
    // 半份按钮
    changeHalfNum() {
      const item = this.getActiveList()[0];
      if (item.enableHalf && !item.minAddQty) {
        this.changeNum(0.5);
      } else {
        // 此品项不允许半份
        this.$message.warning(this.$t('Biz.Order.CantHalfMessage'));
      }
    },
    // 修改数量按钮
    changeItemNum() {
      const finded = this.getCurrentItem();
      this.$refs.orderingChangeNum.open({
        list: this.getActiveList(),
      }, {
        submit: (num) => {
          if (
            (finded.discFlg === 4
                && finded.promoteLimit !== 0
                && this.getVuexPosMode === '3'
            )
          ) {
            const isMore = this.handlePromoteItemTotal(finded) >= finded.promoteLimit;
            if (isMore || num > finded.promoteLimit) {
              return;
            }
          }
          this.changeNum(num);
        },
      });
    },
    // 改价业务
    changePrice(price) {
      this.controlActive((finded) => {
        // 赠菜无法改价
        if (finded.discFlg === 1) {
          return;
        }
        finded.discFlg = 3;
        finded.price = price;
        finded.salePrice = price;
        finded.priceType = 4;
        finded.oldPriceType = 4;
        finded.oldDisFlg = 3;
        finded.defaultPriceType = 4;
      });
    },
    // 修改价格按钮
    changeItemPrice() {
      this.$refs.orderingChangePrice.open(this.getActiveList(), {
        submit: (price) => {
          this.changePrice(price);
        },
      });
    },
    // 修改规格品项的事件
    modifyItemSizeModule(nowItem, sizeList) {
      this.$refs.itemSize.open({
        sizeList,
        activeSizeId: nowItem.sizeId,
      }, {
        submit: (modifyItemSizeData) => {
          let activeItem = null;
          each(this.getActiveList(), (activeList) => {
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
          this.setActiveItem(activeItem);
        },
      });
    },
    // 修改规格按钮
    modifyItemSize() {
      const nowItem = this.getActiveList()[0];
      if (nowItem.enableMutiSize) {
        if (nowItem.sizeList && nowItem.sizeList.length) {
          this.modifyItemSizeModule(nowItem, nowItem.sizeList);
        } else {
          ajax('canyin.pos.itemPkgAndSize.itemSize', {
            params: {
              itemId: nowItem.id,
              isDinnerBuffet: this.posOrderBill.isDinnerBuffet,
            },
          }).then((res) => {
            if (res.itemSizeList) {
              // 做下客位品项限定的处理
              const filterItemSizeList = res.itemSizeList.filter((list) => {
                if (this.getVuexPointData.pointGroupId) {
                  return !list.pointGroupId || list.pointGroupId === this.getVuexPointData.pointGroupId;
                }
                return true;
              });
              this.modifyItemSizeModule(nowItem, filterItemSizeList);
            } else {
              this.$message.error(res.msg);
            }
          }).catch(() => {
            // 修改失败，请重新请求修改
            this.$message.error(this.$t('Biz.Order.AddOrderErrorMsg03'));
          });
        }
      } else {
        // 请选择规格品项
        this.$message.warning(this.$t('Biz.Order.AddOrderErrorMsg04'));
      }
    },
    // 改做法业务
    changeMethods(methodData) {
      // 赋值于 Ordering/Index.vue
      if (methodData.publicIsValid) {
        const [...newGuestListData] = this.activeList;
        this.activeList = [];
        each(newGuestListData, (list) => {
          this.$set(list, 'methodList', methodData.methodList);
          this.activeList.push(list);
        });
      } else {
        each(this.getActiveList(), (list) => {
          this.$set(list, 'methodList', methodData.methodList);
        });
      }
    },
    // 修改做法按钮
    changeItemMethods() {
      // 请求接口
      const itemData = this.getActiveList()[0];
      const ulr = this.getisSetUpGroupMethod ? 'canyin.pos.bill.itemmethodgroupinfo' : 'canyin.pos.bill.moremethodandserveway';
      ajax(ulr, {
        params: {
          itemId: itemData.id,
          itemSizeId: itemData.sizeId ? itemData.sizeId : -1,
          loadmodule: 1,
          _t: new Date().getTime(),
        },
      }).then((res) => {
        this.$refs.orderingChangeMethods.open({
          itemData,
          methodsData: res.data.data,
          pkgItem: false,
        }, {
          submit: (methodData) => {
            this.$refs.orderingChangeMethods.close();
            this.changeMethods(methodData);
          },
        });
      });
    },
    // 上菜方式渲染
    orderingChangeItemServeWay(serveWayData) {
      if (serveWayData.isOrderingBillAllServeWay) {
        const [...newGuestList] = this.activeList;
        this.activeList = [];
        each(newGuestList, (list) => {
          this.$set(list, 'serveWay', serveWayData.serveWay);
          if (serveWayData.serveWay) {
            this.$set(list, 'serveWayId', serveWayData.serveWay.id);
          }
          this.activeList.push(list);
        });
      } else {
        each(this.getActiveList(), (list) => {
          if (serveWayData.serveWay) {
            this.$set(list, 'serveWayId', serveWayData.serveWay.id);
          }
          this.$set(list, 'serveWay', serveWayData.serveWay);
        });
      }
      this.$refs.orderingServeWay.close();
    },
    // 修改上菜方式按钮
    changeItemServeWay() {
      const itemData = this.getActiveList()[0];
      this.$refs.orderingServeWay.open({ itemData }, {
        submit: (serveWayData) => {
          this.orderingChangeItemServeWay(serveWayData);
        },
      });
    },
    // 根据 itemId 计算数量
    countByItemId(item, list) {
      return reduce(filter(list, { id: item.id }), (sum, n) => add(sum, n.num), 0);
    },
    // 判断品项是否估清
    itemIsSellout(item, selloutMap) {
      const sellout = selloutMap[`${item.id}_-1`];
      if (sellout === 0 || sellout === 1 || sellout === 2) {
        return true;
      }
      return false;
    },
    // 计算品项限量数量
    itemLimit(item, limitMap) {
      const limit = limitMap[`${item.id}_-1`];
      if (limit) {
        return limit.restQuantity;
        // return sub(limit.limitQuantity, limit.salesQuantity);
      }
      return null;
    },
    // 获取 elId 用来分组
    getElId(item) {
      // 为3时是快餐，无需增加serveWayId
      const idAttrs = this.getVuexPosMode === '3' ? [
        item.lid,
        item.id,
        item.sizeId,
        item.discFlg,
        item.reasonId ? item.reasonId : '',
      ] : [
        item.lid,
        item.id,
        item.sizeId,
        item.discFlg,
        item.reasonId ? item.reasonId : '',
        item.serveWayId || '',
      ];
      return idAttrs.join('.');
    },
    // 遍历做法加价，还有合计的计算
    calcMethodPrice(list) {
      return map(list, (item) => {
        if (item.methodList && item.methodList.length) {
          let methodTotal = 0;
          each(item.methodList, (method) => {
            if (method.price) {
              methodTotal = method.isRelaCount
                ? add(methodTotal, multi(multi(method.price, method.qty), item.lastQty))
                : add(methodTotal, multi(method.price, method.qty));
            }
          });
          // 添加 key totalMakeFee 此品项所有做法的价格总额
          item.totalMakeFee = methodTotal;
          item.lastSubtotal = item.discFlg === 1
            ? 0
            : add(item.lastSubtotal, methodTotal);
        }
        return item;
      });
    },
    // 菜单品项点击事件
    add(item) {
      if (item.isSellout) {
        // 此品项已估清不能使用
        this.$message.error(this.$t('Biz.Order.AddOrderIsSellout'));
        return false;
      }
      this.activeMenu = item;
      const menu = extend({}, item, {
        isDinnerBuffet: this.getVuexPosMode === '3' ? false : this.posOrderBill.isDinnerBuffet,
      });
      if (menu.enableMutiSize) {
        ajax('canyin.pos.itemPkgAndSize.itemSize', {
          params: {
            itemId: menu.id,
            isDinnerBuffet: menu.isDinnerBuffet,
          },
        }).then((res) => {
          if (res.itemSizeList && res.itemSizeList.length) {
            // 给 item 添加个 sizeList 可以用来对修改缓存起来
            menu.sizeList = res.itemSizeList;
            if (res.itemSizeList.length === 1) {
              this.addDish({
                item: menu,
                beforeAddNum: 1,
              });
            } else {
              // 做下客位品项限定的处理
              const filterItemSizeList = res.itemSizeList.filter((list) => {
                if (this.getVuexPointData.pointGroupId) {
                  return !list.pointGroupId || list.pointGroupId === this.getVuexPointData.pointGroupId;
                }
                return true;
              });
              this.$refs.itemSize.open({
                sizeList: filterItemSizeList,
              }, {
                submit: (itemSizeData) => {
                  this.addDish({
                    item: extend({}, menu, itemSizeData),
                    beforeAddNum: 1,
                  });
                },
              });
            }
          } else {
            // 多规格数据不存在
            this.$message.error(this.$t('Biz.Order.AddOrderErrorMsg08'));
          }
        });
      } else if (item.isWeighed && this.posDevice.enableScale) { // 称重品项
        this.loadScale((weight, isError) => {
          let newWeight = weight;
          if (!isError) {
            newWeight = newWeightUnitConversion(newWeight, this.setting);
          }
          // 目前的电子称的品项只是正常品项所以添加个itemType 为 1
          this.addDish({
            item: extend({}, item, {
              num: newWeight,
            }),
          });
        });
      } else {
        this.addDish({ item, beforeAddNum: 1 });
      }
    },
    // 绑定 elId
    bindElId() {
      return this.getElId(first(this.activeList));
    },
    handlePromoteItemTotal(item) {
      const promoteNum = this.$parent.handleTotalItemNum(item, true);
      const sfGuestListProItemTotal = this.$parent.handleTotalItemNum(item, false, this.activeList);
      return promoteNum + sfGuestListProItemTotal;
    },
    // 加菜
    addDish({ item, beforeAddNum }) {
      this.$vemit('combo');
      const { promoteLimit } = item;
      let lid = '-';
      // 这是允许重复加单的时候走这个
      if (
        this.posSettings.isMergeAddBill
        || item.isWeighed
      ) {
        lid = uniqueId();
      }
      let num = item.num || 1;
      if (promoteLimit !== 0 && this.getVuexPosMode === '3') {
        const promoteNum = this.handlePromoteItemTotal(item);
        if (promoteLimit <= promoteNum && item.discFlg === 4) {
          this.$set(item, 'price', item.salePrice);
          this.$set(item, 'priceType', 1);
          this.$set(item, 'defaultPriceType', 1);
          this.$set(item, 'discFlg', 0);
        }
        if (item.discFlg === 4 && promoteLimit - promoteNum < 1) {
          num = promoteLimit - promoteNum;
        }
      }
      // 从这做下当前客位的营业信息里是否是执行了会员价 标识根据  memberPriceFlg true 是执行会员价否则不执行 如果是存在了促销价格 就不执行
      let bsData = null;
      if (this.getVuexPosMode === '3') {
        bsData = this.getFastFoodBillData.bsData;
      } else {
        bsData = this.posOrderBill.bsData;
      }
      if (
        !(item.promotePrice || item.promotePrice === 0)
        && bsData.memberPriceFlg
        && item.memberPrice != undefined
        && item.memberPrice != 'undefined'
        && item.memberPrice != null
        && !isNaN(item.memberPrice)
      ) {
        item.discFlg = itemConstantSet.DISC_FLG_MEMBER; // 标识显示类型
        item.origPrice = item.memberPrice; // 价格
        item.price = item.memberPrice; // 价格
        item.priceType = itemConstantSet.PRICE_TYPE_MEMBER; // 价格类型
      }
      if (this.posSettings.isPincaiZeroPrice) {
        item.price = 0;
        item.salePrice = 0;
      }
      const escaped = extend({
        reasonId: '',
        sizeId: '-1',
        discFlg: 0,
        id: '',
        methodList: [],
        serveWayId: '-1',
      }, item, {
        // num: 1,
        num,
        lid: `${first(this.activeList).lid}|${lid}`,
        busiType: 1,
        bindId: this.bindElId(),
        itemType: 1,
      });
      // 进行加单最大最小数量限制
      if (
        (escaped.minAddQty || escaped.maxAddQty)
        && this.limitMaxOrMinQty(escaped, beforeAddNum) === false
      ) {
        return false;
      }
      if (lid === '-') {
        const finded = find(this.activeList, {
          lid: `${first(this.activeList).lid}|-`,
          id: escaped.id,
          sizeId: escaped.sizeId,
          methodList: [],
          discFlg: 0,
          itemType: 1,
        });
        if (finded) {
          finded.num = add(finded.num, 1);
        } else {
          this.activeList.push(escaped);
        }
      } else {
        this.activeList.push(escaped);
      }
      // this.activeList.push(escaped);
      this.setActiveItem(escaped);
      if (item.methodCount > 0) {
        this.changeItemMethods();
      }
      // 账单列表滚动到底部
      this.scrollToEnd();
      // 根据设置判断是否清空助记符
      if (this.posSettings.isAutoClearKey) {
        this.$refs.spellFoodSearch.clearSearchText();
      }
    },
    // 账单列表滚动到底部
    scrollToEnd() {
      const box = this.$refs.spellFoodBills;
      if (box.scrollHeight > box.clientHeight) {
        box.scrollTop = sub(box.scrollHeight, box.clientHeight);
      }
    },
    // 加单最大最小数量限制: 点击后加单最小数量 加单不允许超过最大限制 (需考虑是否合并品项情况)
    limitMaxOrMinQty(item, beforeAddNum) {
      // 品项不合并情况 (需考虑多规格情况、加单前的数量设置)
      if (this.posSettings.isMergeAddBill) {
        // 每次加单设置最小数量
        if (item.minAddQty && beforeAddNum < item.minAddQty) {
          this.$set(item, 'num', item.minAddQty);
        } else if (item.maxAddQty && beforeAddNum > item.maxAddQty) {
          // 加单前设置的菜品数量超出最大加单限制 返回false不执行加菜
          // 加单最大数量限制为${item.maxAddQty}
          this.$message.warning(this.$t('Biz.BizComm.BizCommTip13', [item.maxAddQty]));
          return false;
        }
      } else {
        // 非多规格情况
        if (+item.sizeId === -1) {
          // 最小数量限制：第一次加单情况 加最小限制数量的菜 (需考虑加单前数量已设置的情况)
          if (
            item.minAddQty
            && item.count === 0
            && beforeAddNum < item.minAddQty
          ) {
            this.$set(item, 'num', item.minAddQty);
          } else if (
            item.maxAddQty
            && (
              item.count >= item.maxAddQty
              || beforeAddNum + item.count > item.maxAddQty
            )
          ) {
            // 最大数量限制： 品项已点数量与最大限制数量作比较 返回false不执行加菜 (需考虑加单前数量已设置的情况)
            // 加单最大数量限制为${item.maxAddQty}
            this.$message.warning(this.$t('Biz.BizComm.BizCommTip13', [item.maxAddQty]));
            return false;
          }
        }
        // 多规格情况
        if (+item.sizeId !== -1) {
          // sizeItemList为所选多规格品项的数组 用于判断是否为第一个加此单 和 计算此规格品项的数目sizeItemCount
          const sizeItemList = filter(
            this.activeList,
            it => it.id === item.id && it.sizeId === item.sizeId,
          );
          const sizeItemCount = reduce(
            sizeItemList,
            (sum, it) => add(sum, it.num),
            0,
          );
          // 最小数量限制：第一次加单情况 加最小限制数量的菜 (需考虑加单前数量已设置的情况)
          if (
            item.minAddQty
            && sizeItemList.length === 0
            && beforeAddNum < item.minAddQty
          ) {
            this.$set(item, 'num', item.minAddQty);
          } else if (
            item.maxAddQty
            && (
              sizeItemCount >= item.maxAddQty
              || beforeAddNum + sizeItemCount > item.maxAddQty
            )
          ) {
            // 最大数量限制： 此规格品项已点数量与最大限制数量作比较 返回false不执行加菜 (需考虑加单前数量已设置的情况)
            // 加单最大数量限制为${item.maxAddQty}
            this.$message.warning(this.$t('Biz.BizComm.BizCommTip13', [item.maxAddQty]));
            return false;
          }
        }
      }
    },
    // 添加规格
    addSize(sizeData) {
      // 渲染规格品项
      if (sizeData) {
        this.addDish({ item: sizeData });
      } else {
        // 没有找到选中的菜品
        this.$message.error(this.$t('Biz.Order.AddOrderErrorMsg10'));
      }
    },
    // 小类筛选切换
    changeClassFilter(cls) {
      this.activeClass = cls;
      this.refreshMenu();
    },
    // 过滤小类筛选
    classFilter(item) {
      if (this.activeClass && this.activeClass.id !== '') {
        return item.smallClassId === this.activeClass.id;
      }
      return true;
    },
    // 根据 code、拼音、名称、条码进行筛选
    checkSearchText(item) {
      if (this.searchText.length) {
        const keyFilters = this.quickSearchText;
        let re = false;
        each(keyFilters, (str) => {
          if (
            item.pinyin.toLowerCase().indexOf(str) !== -1
            || item.name.toLowerCase().indexOf(str) !== -1
            || String(item.code).toLowerCase().indexOf(str) !== -1
            || item.barcode.indexOf(str) !== -1
          ) {
            re = true;
            return false;
          }
        });
        return re;
      }
      return true;
    },
    // 快速查找
    onSearch(searchText) {
      this.searchText = searchText.toLowerCase();
      this.refreshMenu();
    },
    // 刷新菜品分页组件
    refreshMenu() {
      this.$refs.ordingSpellFoodMenuList.refresh();
      this.activeFirstItem();
    },
    // 选中第一个
    activeFirstItem() {
      this.activeMenu = first(this.filteredMenus);
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.ordering-spellfood-wrap {
  position: relative;
  height: 100%;
  padding-left: 366px;
  padding-top: 6px;
  padding-bottom: 12px;
}

.ordering-spellfood-left {
  position: absolute;
  left: 0;
  top: 0;
  width: 366px;
  height: 100%;
  padding-right: 56px;
}

.ordering-spellfood-list {
  position: relative;
  z-index: 1;
  height: 100%;
  padding-bottom: 49px;
  background-color: #fff;
  border-right: 1px solid #b5b5b5;
  .box-shadow(5px 0 5px rgba(15, 15, 15, 0.1));
}

.ordering-spellfood-bills {
  height: 100%;
  overflow: hidden;

  > li {
    padding-top: 5px;
    padding-bottom: 5px;
    padding-left: 15px;
    padding-right: 15px;
    border-bottom: 1px solid #b5b5b5;
    cursor: pointer;

    > p.itemCode {
      color: #999;
      font-size: 12px;
    }

    > .item {
      position: relative;
      overflow: hidden;

      > span {
        float: left;

        &.itemName {
          width: 130px;
          .text-overflow();
          max-height: 36px;
          line-height: 18px;
          padding: 2px;
        }

        &.itemMethodPrice {
          width: 64px;
          position: absolute;
          bottom: 0;
          left: 140px;
        }

        &.itemNum {
          width: 72px;
          text-align: right;
          position: absolute;
          right: 0;
          bottom: 0;
        }
      }
    }

    > p.itemRemarks {
      color: #0babb9;

      > span > strong {
        font-weight: bold;
        margin: 0 2px;
      }
    }

    &.active {
      background-color: #ddf1f6;
    }

    &:first-child {
      font-weight: bold;
      color: #0babb9;

      > p.itemCode {
        color: #0babb9;
      }
    }

    &:last-child {
      border-bottom: none;
    }
  }
}

.ordering-spellfood-bills-pager {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 49px;
  border-top: 1px solid #b5b5b5;
  padding-top: 6px;
  padding-right: 15px;
  text-align: right;

  > .pos-pager {
    float: right;
  }
}

.ordering-spellfood-btns {
  position: absolute;
  right: 0;
  top: 100px;
  width: 56px;
  padding-right: 6px;

  > button {
    display: block;
    width: 100%;
    height: 44px;
    border: none;
    background-color: #fff;
    border-radius: 0 5px 5px 0;
    text-align: center;
    margin-bottom: 2px;
    cursor: pointer;
    font-size: 12px;
    &:disabled {
      color: #777;
      cursor: not-allowed;
    }
  }
}

.ordering-spellfood-right {
  position: relative;
  height: 100%;
  padding-top: 56px;
  padding-bottom: 58px;
  border: 1px solid #b5b5b5;
  background-color: #f5f5f5;
}

.ordering-spellfood-filter {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 56px;
  padding-right: 150px;
  background-color: #fff;
  border-bottom: 1px solid #b5b5b5;
}

.ordering-spellfood-filter-list {
  width: 100%;
  height: 55px;
  overflow: hidden;

  > li > button {
    position: relative;
    display: block;
    width: 100%;
    height: 55px;
    line-height: 55px;
    border: none;
    background-color: #fff;
    .text-overflow();

    &.active {
      color: #0babb9;

      &:after {
        display: block;
      }
    }

    &:after {
      display: none;
      position: absolute;
      content: "";
      left: 0;
      bottom: 0;
      width: 100%;
      height: 2px;
      background-color: #0babb9;
    }
  }
}

.ordering-spellfood-filter-pager {
  position: absolute;
  right: 15px;
  top: 10px;
}

.ordering-spellfood-menus {
  height: 100%;
  padding: 4px;
}

.ording-spellfood-menu-list {
  height: 100%;
  overflow: hidden;

  > li > button {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    background-color: #fff;
    border: 1px solid #b5b5b5;
    padding: 5px;

    > .c {
      position: absolute;
      left: 5px;
      top: 0;
      height: 18px;
      line-height: 18px;
      font-size: 12px;
      color: #999;

      > span {
        display: inline-block;
        vertical-align: middle;

        &.sellout,
        &.limit {
          padding: 0 6px;
          border-radius: 8px;
          color: @white;
        }

        &.sellout {
          background-color: #ccc;
        }

        &.limit {
          background-color: #ffa71d;
        }
      }
    }

    > .n {
      height: 36px;
      line-height: 18px;
      text-align: left;
      overflow: hidden;
    }

    > .p {
      position: absolute;
      right: 5px;
      bottom: 0;
      font-size: 12px;
      em {
        font-style: normal;
        background-color: #ffa71d;
        color: #fff;
        padding: 2px;
      }
    }

    > .count {
      position: absolute;
      right: -4px;
      top: -4px;
      min-width: 24px;
      height: 24px;
      line-height: 24px;
      text-align: center;
      font-size: 12px;
      border-radius: 12px;
      background-color: #f24f64;
      color: #fff;
    }

    &.active {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
}

.ordering-spellfood-control {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 58px;
  padding-left: 5px;
  padding-right: 5px;
  border-top: 1px solid #b5b5b5;
  background-color: #fff;
}

.ordering-spellfood-search {
  position: absolute;
  left: 15px;
  top: 10px;
}

.ordering-spellfood-pager {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>

<style lang="less">
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.ording-spellfood-menu-list > li {
  float: left;
  width: 126px;
  height: 86px;
  padding: 4px;
}

.ordering-spellfood-filter-list > li {
  float: left;
  width: 90px;
  height: 55px;
}

.ordering-spellfood-search > .pos-order-tables-search {
  background-color: @white;
  border: 1px solid #c8c8c8;
}

.ordering-spellfood-lasttotal {
  float: left;
  padding-left: 15px;
  line-height: 36px;
}

.lang-enUS {
  .ordering-spellfood-btns {
    > button {
      line-height: 1;
      height: 46px;
    }
  }
}

</style>
