<template>
  <div class="pos-order-menu-list"
    :class="{'pos-order-menu-list-noNumBtns': posFastFood && posFastFood.isShowFastInputNum != '1' && posFastFood.isNetWeight != '1' && isSmallClassOneLine,
      'menuList_noBtn_smallClassOneLine': (posFastFood.isShowFastInputNum || posFastFood.isNetWeight) && !isSmallClassOneLine,
      'menulist_isSmallClassOneLine': isSmallClassOneLine }">
    <MenuFilter
      @changeBigClasses="changeBigClasses"
      @changeSmallClasses="changeSmallClasses"
      @changeCustomClasses="changeCustomClasses"
    ></MenuFilter>
    <Btns
      v-if="
        posFastFood &&
        posFastFood.isShowFastInputNum == '1' &&
        posFastFood.isNetWeight == '0'"
      @changeAddNum="changeAddNum"
      :isClearActive="addBeforeNum.length == 0 ? true : false"
    ></Btns>
    <ShowWeight
      v-if="posFastFood && posFastFood.isNetWeight == '1'"
      :weightUtilText="weightUtilText"
      ref="showWeight"
    ></ShowWeight>
    <Paging
      :data="menus"
      :active.sync="newAddItem"
      :itemWidth="126"
      :itemHeight="toggleHeight"
      :numList="numList"
      class="pos-order-menu-list-ul"
      ref="menuList"
      id="orderingMenuList"
      v-autotest
    >
      <button
        type="button"
        slot-scope="props"
        :class="{
          'isSellout': props.item.isSellout && !props.item.enableMutiSize,
          'hasCount': props.item.count,
          'active': props.item.id == (newAddItem ? newAddItem.id : false),
          'small-height-btn':toggleHeight == 64
        }"
        @click="add(props.item,'','click')"
      >
        <!-- 国际化：估清 -->
        <span style="display:none"> {{ vipPromotionHandle(props) }} </span>
        <span v-if="!props.item.enableMutiSize && props.item.isSellout" class="itemSellout">{{$t('Dict.Sellout')}}</span>
        <!-- 限量的显示有可能为负数 条件: 后台设置 允许单品限量为0时继续加单 -->
        <span
          v-if="
          !props.item.isSellout &&
          (props.item.limit || props.item.limit == 0) &&
          !props.item.enableMutiSize"
          class="itemLimit">
          <!-- 国际化：限{0} -->
            {{$t('Dict.LimitNum',[props.item.limit])}}
        </span>
        <div class="menu-code">
           <span v-if="posSettings.isShowItemCode">{{ props.item.code }}</span>
        </div>
        <strong
          :class="{
            'small-height':toggleHeight == 64,
            'fz12':props.item.name.length > 7 && toggleHeight == 64,
            'small-line-height':props.item.name.length > 7 && toggleHeight == 64,
          }"
        >{{ props.item.name }}</strong>
        <ul>
          <li>{{ props.item.isPackage ? pkgStr[props.item.pkgType] : '' }}</li>
          <li>
            <span v-if="props.item.discFlg === 4" class="promotion-sale">
              <!-- 国际化：促 -->
              <em class="promotion-flag">{{$t('Dict.Promotion')}}</em>
              <span>
                {{ props.item.price }}
                <del>{{ props.item.salePrice }}</del>
                /{{ props.item.unitName }}
              </span>
            </span>
            <span v-else>{{ props.item.price }}/{{ props.item.unitName }}</span>
          </li>
        </ul>
        <span v-if="props.item._num" class="count" :class="props.item.tagSubmit?'count_tag':''">x{{ props.item._num }}</span>
      </button>
    </Paging>
    <div class="pos-order-menu-control">
      <Search
        class="ordering-list"
        ref="menuSearch"
        v-if="+getVuexPosMode !== 3"
        :showPanel="showPanel"
        :defaultKeyBoardPage="defaultKeyBoardPage"
        :shouldSetHotKey="shouldSetHotKey"
        @search="onSearch"
        @enter="enterSearch"
        @clearNewAddItem="onClearNewAddItem"
        :placeholderText="placeholderText"
        searchId="searchMenus"
        :resultLength="menus.length"
      >
        <!--<div class="btn-wrap" slot="model">-->
          <!--<button :class="model=='1' ? 'active' : ''" @click="toggleModel(1)">模糊</button>-->
          <!--<button :class="model=='2' ? 'active' : ''" @click="toggleModel(2)">精准</button>-->
          <!--<button :class="model=='3' ? 'active' : ''" @click="toggleModel(3)">汉字</button>-->
        <!--</div>-->
        <div class="btn-wrap" slot="model" ref="modelPanel">
          <el-button type="default" @click="toggleModelPanel">
            {{currentModelText}}
            <i :class="ShowModelPanel ? 'el-icon-caret-top' : 'el-icon-caret-bottom'"></i>
          </el-button>
          <div class="model-panel" v-show="ShowModelPanel">
            <!-- 国际化：模糊，精准，汉字 -->
            <button :class="model === 1 ? 'active' : ''" @click="chooseCurrentModel(1)">{{$t('Biz.Order.Vague')}}</button>
            <button :class="model === 2 ? 'active' : ''" @click="chooseCurrentModel(2)">{{$t('Biz.Order.Accurate')}}</button>
            <button :class="model === 3 ? 'active' : ''" @click="chooseCurrentModel(3)">{{$t('Biz.Order.ChineseChar')}}</button>
          </div>
        </div>
      </Search>
      <button
        class="add-temp-item"
        @click="openItemTemp"
        v-if="posItemTempSmallClasses.length && getVuexPosMode != '3'"
        id="tempItemBtn"
        :disabled="!tempItemModuleAuth"
        :style="{cursor:(tempItemModuleAuth ? '':'not-allowed')}"
      >
        <i class="icon icon-clock"></i>
        <!-- 国际化：临时品项 -->
        {{$t('Dict.TemporaryItems')}}
      </button>
      <PagingBtn :paging="$refs.menuList" :showInfo="true" class="pos-order-tables-pager"></PagingBtn>
    </div>
    <ItemSize
      ref="itemSize"
      @choiceSize="addSize"
      :areaType="areaType"
      submitId="menuModifyItemSize"
      type="menu"
    ></ItemSize>
    <PackageNormal
      ref="PackageNormal"
      type="menuPackageNormal"
      :areaType="areaType"
      submitId="menuPackageNormal"
    ></PackageNormal>
    <PackagePart
      ref="PackagePart"
      :areaType="areaType"
      type="menuPackagePart"
      submitId="menuPackagePart"
    ></PackagePart>
    <ItemTemp ref="itemTemp" testId="orderingMenuList" :showComfirmWeight=true></ItemTemp>
    <ShowWeightModel ref="showWeightModel" :weightUtilText="weightUtilText"></ShowWeightModel>
  </div>
</template>

<script>
import {
  mapState, mapGetters, mapActions, mapMutations,
} from 'vuex';

import {
  map,
  extend,
  find,
  groupBy,
  reduce,
  cloneDeep,
  sortBy,
} from 'lodash';
import * as menuDictionary from '@/common/dictionary/pos-order-menu-dictionary';
import { add } from '@/common/js/math';
import dateFormat from '@/common/js/dateformat';
import Search from '@/components/Pos/Order/Tables/Search';
import Paging from '@/components/Pos/Common/Paging';
import PagingBtn from '@/components/Pos/Common/PagingBtn';
import ajax from '@/common/js/ajax';
import LoadScaleMixin from '@/components/Pos/Common/LoadScaleMixin';
import quickSearch from '@/common/js/quicksearch';
import newWeightUnitConversion from '@/common/js/newWeightUnitConversion';
import ShowWeight from './ShowWeight';
import Btns from './Btns';
import MenuFilter from './Filter';

// 规格
const ItemSize = (resolve) => {
  import('./ItemSize').then((module) => {
    resolve(module);
  });
};
// 常规套餐
const PackageNormal = (resolve) => {
  import('./Package/PackageNormal').then((module) => {
    resolve(module);
  });
};

// 宴会套餐
const PackagePart = (resolve) => {
  import('./Package/PackagePart').then((module) => {
    resolve(module);
  });
};

// 临时品项
const ItemTemp = (resolve) => {
  import('./ItemTemp').then((module) => {
    resolve(module);
  });
};

// 称重确认--新版去皮功能
const ShowWeightModel = (resolve) => {
  import('./ShowWeightModel').then((module) => {
    resolve(module);
  });
};

export default {
  mixins: [LoadScaleMixin],
  props: {
    guestList: {
      type: Array,
      default: () => [],

    },
    areaType: {
      type: Number,
      default: 0,
    },
  },
  components: {
    MenuFilter,
    Btns,
    Search,
    Paging,
    PagingBtn,
    ItemSize,
    PackageNormal,
    PackagePart,
    ItemTemp,
    ShowWeight,
    ShowWeightModel,
  },
  data() {
    return {
      pkgStr: [this.$t('Biz.Order.Routine0'), this.$t('Biz.Order.Banquet0'), this.$t('Biz.Order.Temporary02')], // 国际化： (常规), (宴会), (临时)
      // 选中的大类列表，空代表全选
      bigClassesFilter: '',
      // 选中的小类列表，空代表全选
      smallClassesFilter: '',
      // 选中的自定义列表，空代表全选
      customClassesFilter: '',
      // 快速查找文字
      searchText: '',
      newAddItem: null,
      oldAddItem: null, // 已加单的最后一项（用于回车键只能添加一个品项）
      itemPkgUrlClass: '',
      placeholderText: this.$t('Dict.QuickSearch'), // 品项所搜框提示内容
      addBeforeNum: [], // 加单之前的数量集合
      // 提交时候需要的品项类型
      SUBMIT_ITEM_TYPE_NORMAL: 1, // 正常品项
      SUBMIT_ITEM_TYPE_TEMP: 2, // 临时品项
      SUBMIT_ITEM_TYPE_PKG_NORMAL: 3, // 常规套餐品项
      SUBMIT_ITEM_TYPE_PKG_PART: 4, // 宴会套餐品项
      SUBMIT_ITEM_TYPE_PKG_INNER: 5, // 套餐内品项
      model: 1, // 查找模式切换
      showPanel: true, // 只在当前页弹出手写板
      activeItemSizeId: '', // 扫码添加多规格品项时的id
      activeItemSize: '', //  扫码添加多规格品项时的数组
      lastAddDishTime: null, // 最后一次点菜的时间
      isAllNumber: false, // 搜索框是不是全数字
      // defaultKeyBoardType: 'letter', // 加单页面的软键盘设置类型
      defaultKeyBoardPage: 4, // 是加单还是客位页面设置的软键盘
      shouldSetHotKey: 2, // Search组件设置enter热键 1设置快餐的 2设置中餐 0不设置
      ShowModelPanel: false, // 是否弹出搜索模式的面板
      currentModelText: this.$t('Biz.Order.Vague'), // 当前搜索模式text
      isSelloutETagItems: [], // 易盘估清加单的数据
    };
  },
  created() {
    this.$von('menuClearSearchText', () => {
      this.searchText = '';
      this.$refs.menuSearch && this.$refs.menuSearch.clearSearchText();
    });
    this.$von('searchFocus', () => {
      const obj = this.$refs.menuSearch.$el.getElementsByTagName('input')[0];
      if (obj) {
        obj.focus();
      }
      // this.$refs.menuSearch.focus()
    });
    this.$von('addTableSearchTextdInBlur', (key) => {
      if (this.$refs.menuSearch) {
        this.$refs.menuSearch.addWordInBlur(key);
      }
    });
    this.$von('delTableSearchTextdInBlur', () => {
      if (this.$refs.menuSearch) {
        this.$refs.menuSearch.delWordInBlur();
      }
    });
    this.$von('menuSelect', (direction) => {
      this.$refs.menuList.select(direction);
    });
  },
  mounted() {
    // 记录渲染后的菜单列表数据 备注：mounted钩子里拿Vuex数据
    this.$von('initActiveItem', () => {
      // 初始下被选中的品项样式
      this.activeFirstItem();
    });
    this.$von('orderingMenuListInitPager', () => {
      if (this.$refs.menuList) {
        this.$refs.menuList.refresh();
      }
    });
    // this.$von('menuAddActiveItem', () => {
    //   setTimeout(() => {
    //     this.addActiveItem();
    //   })
    // });
    this.$quickinput((str) => {
      // console.log(str);
    });
    this.checkModel();
    // 精准模式下清除默认选中的品项
    const { searchMode } = this.posSettings;
    if (+searchMode === 2) {
      this.newAddItem = null;
    }
    // 加单的排菜单下单
    this.$von('doneArrangeMenuOrder', (arrangeMenuData) => {
      // 从数据中找到对应的套餐数据 menuMode 排菜模式 '0' -宴会模版模式 '1' -单品模式
      const notFoundItems = [];
      if (arrangeMenuData.pkgItemData.menuMode === '0') {
        const menuData = this.packagePartArrangeData(arrangeMenuData);
        this.$vemit('posOrderAddDish', { item: menuData }); // 进行加单
      } else {
        const singleItems = this.singleArrangeData(arrangeMenuData);
        singleItems.forEach((item) => {
          const findItem = this.itemsMoreBarcode.find(menu => `${menu.id}_${menu.sizeId}` === `${item.itemId}_${item.itemSizeId}`);
          // 如果匹配到后者是添加的是临时品项就执行加单操作
          if (findItem) {
            // 坐下区域价格的匹配 变价
            if (
              findItem.discFlg !== 4
              && !findItem.isItemTimePrice
              && +this.areaType !== 0
              && this.areaType
              && JSON.stringify(findItem.otherPrice) !== '{}'
            ) {
              this.$set(item, 'price', findItem.otherPrice[`${this.areaType}`]);
              this.$set(item, 'salePrice', findItem.otherPrice[`${this.areaType}`]);
            }
            this.$vemit('posOrderAddDish', { item: extend({}, findItem, item) }); // 进行加单
          } else if (item.itemType === 2) {
            const tempItemData = extend({}, item, {
              id: item.itemId,
              name: item.itemName,
              stdPrice: Number(item.salePrice),
              num: Number(item.qty),
              price: Number(item.salePrice),
            });
            this.$vemit('posOrderAddDish', { item: tempItemData }); // 进行加单
          } else {
            notFoundItems.push(item.itemName);
          }
        });
        // 没找的菜品提示
      }
      // 关闭弹框
      if (arrangeMenuData.callBack) {
        arrangeMenuData.callBack();
      }
      this.$vemit('setRemarkShow', arrangeMenuData.pkgItemData.remark ? arrangeMenuData.pkgItemData.remark : ''); // 添加整单备注
      // 不存在的品项最后给提示
      if (notFoundItems.length) {
        this.$message.error(`${notFoundItems.join(', ')}: ${this.$t('Biz.Order.TheItemNotExist')}`);
      }
    });
    // 点击空白处 自动隐藏搜索模式面板
    window.addEventListener('click', this.hidePanel);
  },
  destroyed() {
    window.removeEventListener('click', this.hidePanel);
  },
  computed: {
    ...mapGetters([
      'setting',
      'getDialog',
      'posBaseInfo',
      'eTagItems',
      'itemsMoreBarcode',
      'createItemBarCodeObj',
      'isItemMoreBarcode',
      'posItems',
      'getVuexPointData',
      'getVuexPosMode',
      'getVuexItemSelloutsMap',
      'getVuexItemLimitsMap',
      'getVuexitemTimePricesMap',
      'posOrderBill',
      'posSettings',
      'posItemCustomClasses',
      'posDevice',
      'posItemTempSmallClasses',
      'posAreas',
      'posFastFood',
      'tempItemModuleAuth',
      'haveLimitSmallClasses',
      'getActiveOrderItemSmClsTotal',
      'getVuexPromoteItemLimitsMap',
      'mateCodeGetItemsIndex',
      'mateBarcodeItemsIndex',
      'getPointGroupId',
    ]),
    isSmallClassOneLine() {
      return this.posSettings.isOnlyShowSmallClass && this.posSettings.isSingleLineDisplayForSmallClassAndCustomClass;
    },
    quickSearchText() {
      if (this.posSettings.searchMode === 1) {
        return quickSearch((`${this.searchText}`).toLowerCase());
      }
      return this.searchText;
    },
    onwerItemBarCodes() {
      const tmpItemBarCode = cloneDeep(this.itemsMoreBarcode);
      return tmpItemBarCode.map((menu) => {
        let isSelloutData = this.getVuexItemSelloutsMap[`${menu.id}_${menu.sizeId}`];
        // 因为多规格品项没有id 所以针对多规格品项单独的处理
        if (!menu.id) {
          isSelloutData = this.getVuexItemSelloutsMap[`${menu.itemId}`];
        }
        this.$set(menu, 'isSellout', false);
        const limitData = this.getVuexItemLimitsMap[`${menu.id}_${menu.sizeId}`];
        if (isSelloutData === 1 || isSelloutData === 0 || isSelloutData === 2) {
          this.$set(menu, 'isSellout', true);
        }
        if (limitData) {
          menu.limit = limitData.restQuantity;
          // this.$set(menu, 'limit', limitData.restQuantity);
        } else {
          menu.limit = undefined;
        }
        return menu;
      });
    },
    toggleHeight() {
      const { isEnableSmallItemAddOrderMoreItem } = this.posFastFood;
      if (isEnableSmallItemAddOrderMoreItem) {
        return 64;
      }
      return 86;
    },
    weightUtilText() {
      // 国际化：公斤，斤，克
      switch (this.setting.POSWeighingUnit) {
        case 0:
          return this.$t('Dict.Kilogram');
        case 1:
          return this.$t('Dict.Jin');
        default:
          return this.$t('Dict.Gram');
      }
    },
    menu() {
      let menus = [];
      // 根据客位分组id pointGroupId关联的菜来过滤菜品
      const pointGroupId = this.getPointGroupId;
      if (this.posItems && this.posItems.length) {
        if (pointGroupId) {
          menus = this.renderMenuData(
            this.posItems.filter(item => !item.pointGroupId || item.pointGroupId === pointGroupId),
          );
        } else {
          menus = this.renderMenuData(this.posItems);
        }
      }
      menus.forEach((menuItem) => {
        const menu = menuItem;
        this.$set(menu, 'isSellout', false);
        // 根据品项的id和规格拼接的id来查找下对应的品项数据
        const limitData = this.getVuexItemLimitsMap[`${menu.id}_${menu.sizeId}`];
        const isSelloutData = this.getVuexItemSelloutsMap[`${menu.id}_${menu.sizeId}`];
        if (limitData) {
          this.$set(menu, 'limit', limitData.restQuantity);
        } else {
          this.$set(menu, 'limit', undefined);
        }
        // 估清的1或者0都是已估清
        // 如果是当天估清，isSelloutData的值就是2
        if (isSelloutData === 1 || isSelloutData === 0 || isSelloutData === 2) {
          this.$set(menu, 'isSellout', true);
        }
      });
      return menus;
    },
    numList() {
      const leftList = map(groupBy(this.guestList, 'id'), (list, key) => ({
        id: key,
        num: reduce(list, (sum, n) => add(sum, n.num), 0),
        tagSubmit: false,
      }));
      if (this.posOrderBill && this.posOrderBill.scList.length) { // 如果有已提交的订单，添加标记为true
        let scListCopy = cloneDeep(this.posOrderBill.scList);
        scListCopy.forEach(item => item.id = item.itemId); // 添加id 与guestList一致
        scListCopy = map(groupBy(scListCopy, 'id'), (list, key) => ({
          id: key,
          num: reduce(list, (sum, n) => add(sum, n.lastQty), 0),
          tagSubmit: true,
        }));
        // scListCopy中如果包含此项，则删除此项
        leftList.forEach((item) => {
          scListCopy.forEach((scItem, index) => {
            if (scItem.id === item.id) scListCopy.splice(index, 1);
          });
        });
        return scListCopy.concat(leftList); // 取并集
      }
      return leftList;
      // return map(groupBy(this.guestList, 'id'), (list, key) => ({
      //   id: key,
      //   num: reduce(list, (sum, n) => add(sum, n.num), 0),
      // }));
    },
    menus() {
      return cloneDeep(this.menu.filter(item => this.checkFilter(item)));
    },
  },
  watch: {
    $route(to, from) {
      if (from.name === 'order') {
        this.checkModel();
      } else {
        this.$devices.Handwriting.close();
      }
    },
    eTagItems(data, oldData) {
      if (data.length || oldData.length) {
        if (this.posBaseInfo.isEnableYiPan) {
          // 存储错误的信息数据
          this.isSelloutETagItems = [];
          // 取易盘的前后数组的差集
          let xorEasylist = _.xorBy(data, oldData, 'TagID');
          // 第一次进来进行排序
          if (data.length > 0 && oldData.length === 0) {
            xorEasylist = sortBy(xorEasylist, 'ItemID');
          }
          // this.$log.info(`前后数组的差集${JSON.stringify(xorEasylist)}`);
          xorEasylist.forEach((item) => {
            // 从当前账单去找易盘的菜，如果存在执行删除，如果不存在执行添加
            const addItem = oldData.find(item1 => item1.TagID === item.TagID);
            if (addItem) {
              // 删除易盘添加的菜
              //  this.guestList.splice(_.indexOf(this.guestList, addItem), 1);
              if (!this.getDialog.length) {
                setTimeout(() => {
                  this.$vemit('orderEasyDelete', addItem);
                }, 0);
              }
            } else {
              // 添加易盘添加的菜
              const newItem = _.cloneDeep(this.menu.find((item1) => {
                const isFindItem = item.ItemID === item1.aidCode;
                if (item1.enableMutiSize) {
                  if (item1.isDefault) {
                    return isFindItem;
                  }
                } else {
                  return isFindItem;
                }
              }));
              // this.$log.info(`易盘添加菜品里模态框数组的length-----${this.getDialog.length}`);
              if (newItem) {
                newItem.TagID = item.TagID;
                // 易盘卡标记的数量
                if (item.ItemCnt === '00') { // 00 为半份
                  newItem.TagNum = 0.5;
                } else {
                  newItem.TagNum = parseInt(item.ItemCnt);
                }
                if (!this.getDialog.length) {
                  // 对易盘的菜坐下估清的判断，扩展如果以后做规格的话走this.getVuexItemSelloutsMap[`${newItem.id}_${newItem.sizeId}`]
                  if (newItem.isSellout || this.getVuexItemSelloutsMap[`${newItem.id}_${newItem.sizeId}`]) {
                    if (this.isSelloutETagItems.indexOf(newItem.name) === -1) {
                      this.isSelloutETagItems.push(newItem.name);
                    }
                  } else {
                    setTimeout(() => {
                      this.add(newItem, 'precision');
                    }, 0);
                  }
                }
              } else {
                this.$message.error(this.$t('Biz.Order.AddOrderErrorMsg06'));
              }
            }
          });
          if (this.isSelloutETagItems.length) {
            this.$message.error(`${this.isSelloutETagItems.join(', ')}: ${this.$t('Biz.Order.AddOrderIsSellout')}`);
          }
        }
      }
    },
    // 执行智能餐盘的加单和删除操作
    getVuexPosMode() {
      const { searchMode } = this.posSettings;
      if (+searchMode === 2) {
        this.newAddItem = null;
      }
    },
  },
  methods: {
  // 宴会套餐模版的排菜数据
    packagePartArrangeData(arrangeMenuData) {
      const findArrangeMenuPkgItem = cloneDeep(
        this.menus.find(menu => menu.id === arrangeMenuData.pkgItemData.itemId),
      );
      if (!findArrangeMenuPkgItem) {
        this.$message.error(this.$t('Biz.Order.PackageNotFound', [arrangeMenuData.pkgItemData.name]));
        return false;
      }
      // 需要 模板套餐的itemId和排菜单的明细数据
      const pkgList = [];
      arrangeMenuData.pkgItemData.detailOfList.forEach((list) => {
        list.items.forEach((item) => {
          // let newMethod = []
          // 如果存在做法进行做法组装
          pkgList.push(this.handleArrangePkgList(item));
        });
      });
      return Object.assign(findArrangeMenuPkgItem, {
        price: arrangeMenuData.pkgItemData.price,
        salePrice: arrangeMenuData.pkgItemData.salePrice,
        pkgList,
        itemType: this.SUBMIT_ITEM_TYPE_PKG_PART,
        pkgType: 1,
        isNotFollowAmount: arrangeMenuData.pkgItemData.isNotFollowAmount,
        num: arrangeMenuData.pkgItemData.qty || 1,
      });
    },
    // 排菜单的套餐明细的处理
    handleArrangePkgList(item) {
      return {
        id: item.itemId,
        methodList:
          item.methodList && item.methodList.length
            ? item.methodList.map(method => ({
              fee: method.fee,
              feeChanged: false,
              id: method.methodId,
              isNeedFee: false,
              isRelaCount: false,
              name: method.name,
              price: null,
              qty: method.qty,
            }))
            : [],
        name:
          `${item.itemSizeId}` !== '-1'
            ? `(${item.sizeName})${item.itemName}`
            : item.itemName,
        num: Number(item.qty),
        auxiliaryUnitQty: Number(item.auxiliaryUnitQty), // 辅助单位数量
        auxiliaryUnitId: item.auxiliaryUnitId, // 辅助单位id
        auxiliaryUnitName: item.auxiliaryUnitName, // 辅助单位名称
        serveWay: null,
        sizeId: item.itemSizeId,
        smallClassId: item.smallClassId,
        stdPrice: item.itemType === 2
          ? item.stdPrice || Number(item.salePrice)
          : Number(item.salePrice), // 这块需要调整需要要标准价格
        unitId: item.unitId,
        unitName: item.unitName,
        itemType: item.itemType || 1,
      };
    },
    // 单品模式下的模版数据 itemsMoreBarcode
    singleArrangeData(arrangeMenuData) {
      const items = [];
      arrangeMenuData.pkgItemData.detailOfList.forEach((list) => {
        list.items.forEach((item) => {
          // 读取的数据不需要专用做法弹框和合并的计算和读取点菜单类似 所以用读取点菜单的标识isReadOrderItem
          this.$set(item, 'isArrangeItem', true);
          this.$set(item, 'num', Number(item.qty));
          // 如果是临时品项需要添加所有的数据
          if (item.itemType === 2) {
            items.push(item);
          } else {
            const newItem = {
              itemId: item.itemId,
              itemSizeId: item.itemSizeId,
              itemName: item.itemName,
              isArrangeItem: item.isArrangeItem,
              methodList: item.methodList,
              discFlg: item.discFlg || 0,
              num: item.num,
              auxiliaryUnitQty: Number(item.auxiliaryUnitQty), // 辅助单位数量
              auxiliaryUnitId: item.auxiliaryUnitId, // 辅助单位id
              auxiliaryUnitName: item.auxiliaryUnitName, // 辅助单位名称
            };
            // 变价的需要增加一下属性
            if (item.discFlg === 3) {
              newItem.discFlg = 3;
              newItem.priceType = 4;
              newItem.price = Number(item.salePrice);
              newItem.salePrice = Number(item.salePrice);
            }
            if (item.pkgList) {
              newItem.pkgList = item.pkgList.map(menu => this.handleArrangePkgList(menu));
              newItem.isNotFollowAmount = item.isNotFollowAmount;
            }
            items.push(newItem);
          }
        });
      });
      return items;
    },
    // vipPromotionHandle
    // 会员专享促销价格匹配
    vipPromotionHandle(props) {
      // 判断当前 品项是否是属于促销限量数据里
      const promoteLimitData = this.getVuexPromoteItemLimitsMap[`${props.item.id}_${props.item.sizeId}_${props.item.promotePlanId}`];
      const isDomemberPrice = this.posOrderBill && this.posOrderBill.crmMemberQueryData.data;
      // 如果验证了会员才走会员专享的促销价格
      if (((promoteLimitData
        && promoteLimitData.restQuantity > 0
        && (!promoteLimitData.isMemberExclusive || (isDomemberPrice && promoteLimitData.isMemberExclusive)))
        || (props.item.isMemberExclusive && isDomemberPrice))
        && (props.item.copyPromotePrice || props.item.copyPromotePrice === 0)
      ) {
        if (props.item.discFlg !== 4) {
          props.item.discFlg = 4;
          props.item.priceType = 3;
          props.item.promotePrice = props.item.copyPromotePrice;
          props.item.price = props.item.copyPromotePrice;
        }
      }
      // 不满足条件 不显示促销价
      if (
        (promoteLimitData && (promoteLimitData.restQuantity <= 0 || (promoteLimitData.isMemberExclusive && !isDomemberPrice)))
        || (props.item.isMemberExclusive && !isDomemberPrice)
      ) {
        if (props.item.discFlg === 4) {
          props.item.discFlg = 0;
          props.item.priceType = 1;
          props.item.copyPromotePrice = props.item.promotePrice;
          props.item.promotePrice = null;
          props.item.price = props.item.salePrice;
        }
      }
    },
    // 时价数据的改变
    setItmePrice(item, isItemPrice, price) {
      if (price || `${price}` === '0') {
        this.$set(item, 'isItemTimePrice', isItemPrice);
        this.$set(item, 'salePrice', price);
        // 如果是促销显示价格是促销价
        if (item.discFlg !== 4) {
          this.$set(item, 'price', price);
        }
      }
    },
    ...mapActions([
      'setSearchMode',
    ]),
    ...mapMutations({
      setLimitsMap: 'SET_ITEMLIMITSMAP',
      setItemsMoreBarCode: 'SET_ITEMSMOREBARCODE',
      setItemsMoreBarCodeSingle: 'SET_ITEMSMOREBARCODE_SINGLE',
    }),
    hidePanel(event) {
      if (this.$refs.modelPanel && !this.$refs.modelPanel.contains(event.target)) {
        this.ShowModelPanel = false;
      }
    },
    chooseCurrentModel(id) {
      this.toggleModel(id);
    },
    toggleModelPanel() {
      this.ShowModelPanel = !this.ShowModelPanel;
    },
    // 判断当前是否为汉字查找，是的话触发input事件
    checkModel() {
      setTimeout(() => {
        const { searchMode } = this.posSettings;
        this.model = searchMode;
        // 国际化：模糊，精准，汉字
        switch (searchMode) {
          case 1:
            this.currentModelText = this.$t('Biz.Order.Vague');
            break;
          case 2:
            this.currentModelText = this.$t('Biz.Order.Accurate');
            break;
          case 3:
            this.currentModelText = this.$t('Biz.Order.ChineseChar');
            break;
          default:
            return;
        }
        if (searchMode === 3) {
          const e = document.createEvent('MouseEvents');
          const obj = this.$refs.menuSearch.$el.getElementsByTagName('input')[0];
          e.initEvent('click', false, false);
          obj.dispatchEvent(e);
          obj.blur();
          setTimeout(() => {
            // 如果是安卓则不自动聚焦，原因是等待聚焦的时间太长
            if (browser.isAndroid() || browser.isIPad()) {} else {
              obj.focus();
            }
          }, 2000);
        }
      }, 500);
    },
    // 切换搜索模式
    async toggleModel(model) {
      if (+model !== 3) {
        this.$devices.Handwriting.close();
      }
      const { success } = await this.setModel(model);
      if (success) {
        this.model = model;
        this.ShowModelPanel = false;
        // 国际化：模糊，精准，汉字
        switch (model) {
          case 1:
            this.currentModelText = this.$t('Biz.Order.Vague');
            break;
          case 2:
            this.currentModelText = this.$t('Biz.Order.Accurate');
            break;
          case 3:
            this.currentModelText = this.$t('Biz.Order.ChineseChar');
            break;
          default:
            return;
        }
        this.setSearchMode(model);
        this.$vemit('clearSearchText');
        this.searchText = '';
        this.refreshMenuData();
        this.checkModel();
      } else {
        console.log('error');
      }
    },
    async setModel(value, type = 2) {
      const data = { type, value };
      return await ajax('canyin.sys.syshabit.updatehabit', {
        loading: false,
        contentType: 'json',
        data,
      });
    },
    // 格式化itemsMoreBarcode
    formatItemsMoreBarcode(arr) {
      arr = _.cloneDeep(arr);
      return arr.map((menu) => {
        let isSelloutData = this.getVuexItemSelloutsMap[`${menu.id}_${menu.sizeId}`];
        // 因为多规格品项没有id 所以针对多规格品项单独的处理
        if (!menu.id) {
          isSelloutData = this.getVuexItemSelloutsMap[`${menu.itemId}`];
        }
        this.$set(menu, 'isSellout', false);
        const limitData = this.getVuexItemLimitsMap[`${menu.id}_${menu.sizeId}`];
        if (isSelloutData === 1 || isSelloutData === 0 || isSelloutData === 2) {
          this.$set(menu, 'isSellout', true);
        }
        if (limitData) {
          menu.limit = limitData.restQuantity;
        }
        return menu;
      });
    },
    // 给多条码查找的品项设置估清限量信息
    setLimitSellOutAttr(obj) {
      const menu = _.cloneDeep(obj);
      let isSelloutData = this.getVuexItemSelloutsMap[`${menu.id}_${menu.sizeId}`];
      // 因为多规格品项没有id 所以针对多规格品项单独的处理
      if (!menu.id) {
        isSelloutData = this.getVuexItemSelloutsMap[`${menu.itemId}`];
      }
      this.$set(menu, 'isSellout', false);
      const limitData = this.getVuexItemLimitsMap[`${menu.id}_${menu.sizeId}`];
      if (isSelloutData === 1 || isSelloutData === 0 || isSelloutData === 2) {
        this.$set(menu, 'isSellout', true);
      }
      if (limitData) {
        menu.limit = limitData.restQuantity;
      } else {
        menu.limit = undefined;
      }
      return menu;
    },
    // 精准查找
    precision() {
      const {
        searchText, isItemMoreBarcode, menus, createItemBarCodeObj, itemsMoreBarcode,
      } = this;
      let finded;
      let itemIndex;
      if (false) { // 后台是否开启了多条码 如果开启从itemsMoreBarcode里找品项
        itemIndex = createItemBarCodeObj[searchText];
        if (itemIndex) {
          finded = itemsMoreBarcode[itemIndex];
        } else {
          for (let i = 0; i < itemsMoreBarcode.length; i += 1) {
            if (itemsMoreBarcode[i].code === searchText) {
              finded = itemsMoreBarcode[i];
              itemIndex = i;
              break;
            }
          }
        }
      } else { // 后台是否开启了多条码 没开启从mens里找品项
        finded = find(menus, (item) => {
          const { code, barcode } = item;
          if (searchText) {
            return code === searchText || barcode === searchText;
          }
        });
      }
      // 如果找到了对应的品项
      if (finded) {
        // 需要判定下品项是否属于客位限定的品项
        if (this.getVuexPointData.pointGroupId && finded.pointGroupId && this.getVuexPointData.pointGroupId !== finded.pointGroupId) {
          this.$message.error(this.$t('Biz.Order.LongMsg015', [finded.name]));
          return false;
        }
        finded = this.setLimitSellOutAttr(finded); // 给品项设置估清限量信息
        // 是从多商品条例找到的数据
        if (itemIndex) {
          if (finded.limit) {
            finded.count++;
          }
          // 更新vuex里的itemsMoreBarcode
          this.setItemsMoreBarCodeSingle({ index: itemIndex, item: finded });
        }
        const item = Object.assign({}, finded, {
          itemType: 1,
        });
        this.add(item, 'precision');
      } else { // 清空搜索框
        this.$vemit('clearSearchText');
      }
    },
    /**
     *  称重条码
     * scaleItemCodeLength: 0, // 电子秤扫描条码品项代码长度
     * scaleItemCodeStart: 0, // 电子秤扫描条码品项代码开始位置
     * scaleItemQuantityIntegerLength: 0, // 电子秤扫描条码品项数量整数部分长度
     * scaleItemQuantityLength: 0, // 电子秤扫描条码品项数量长度
     * scaleItemQuantityStart: 0, // 电子秤扫描条码品项数量开始位置
     *
     */
    scanWeightCode(result) {
      const {
        scaleItemCodeLength, scaleItemCodeStart, scaleItemQuantityIntegerLength, scaleItemQuantityLength, scaleItemQuantityStart,
      } = this.posSettings;
      if (result) { // 是称重条码
        const tmpArr = [];
        // 格式化itemsMoreBarcode
        // const itemsMoreBarcode = this.formatItemsMoreBarcode(this.itemsMoreBarcode);
        const itemsMoreBarcode = this.onwerItemBarCodes;
        for (let i = 0; i < result.length; i++) {
          const itemCode = result[i].substring(scaleItemCodeStart - 1, scaleItemCodeLength + scaleItemCodeStart - 1);
          let num = result[i].substring(scaleItemQuantityStart - 1, scaleItemQuantityStart + scaleItemQuantityLength - 1);
          num = parseFloat(`${num.substring(scaleItemQuantityIntegerLength, 0)}.${num.substring(scaleItemQuantityIntegerLength, scaleItemQuantityLength)}`);
          const filterResult = this.filterCreater({ code: itemCode })(itemsMoreBarcode);
          if (filterResult) {
            filterResult.num = num;
            tmpArr.push(filterResult);
          }
          // filterResult.count += num;
        }
        return tmpArr;
      }
    },
    // 判断扫的是否是称重条码
    judgeIsWeighedItem(code) {
      if (code) {
        code += '';
        const exp = /2[0-9]{12}/g; // 匹配2开头 13位的编码
        const codeArr = code.match(exp);
        if (code.length % 13 === 0 && codeArr && codeArr.length > 0) {
          return codeArr;
        }
        return false;
      }
      throw new Error('code is undefined');
    },
    // 过滤出后台品项设置是否开启了适用电子秤 isWeighed为true并且符合指定条件的品项
    filterCreater(options) {
      return arr => find(arr, { isWeighed: true, ...options });
    },
    // 出发选中菜品的点菜
    addActiveItem() {
      const { posSettings, searchText, isAllNumber } = this;
      const { searchMode, isAllowDarkScan } = posSettings;
      // 开启【加单时允许增加重复品项】开关时，【回车健只允许添加一个品项】开关不生效 后端逻辑已添加，前端只判断 isEnterKeyAllowsInlyOneItem
      if (posSettings.isEnterKeyAllowsInlyOneItem
      && this.oldAddItem && (this.oldAddItem.id === this.newAddItem.id)) {
        console.log('enter+重复添加,不加单');
        return;
      }

      if (
        (+searchMode === 2 && searchText.length > 0)
        || (isAllowDarkScan && isAllNumber && searchText.length > 0)) {
        // 是否是称重条码品项
        const result = this.judgeIsWeighedItem(searchText);
        if (result) {
          const queueList = this.scanWeightCode(result);
          if (queueList && queueList.length > 0) {
            queueList.map((item) => {
              this.add(item, 'precision');
            });
          } else if (this.$store.getters.posSettings.isAutoClearKey) {
            this.$vemit('clearSearchText');
          }
        } else {
          this.precision();
        }
      } else {
        // 如果没找到对应的菜，并且开启了清空助记符话，直接清空输入框了
        if (this.newAddItem) {
          this.menus.map((item) => {
            if (item.id === this.newAddItem.id) {
              this.newAddItem = item;
            }
          });
          this.add(this.newAddItem);
        } else if (this.$store.getters.posSettings.isAutoClearKey) {
          this.$vemit('clearSearchText');
        }
      }
    },
    // 选中第一个
    activeFirstItem() {
      this.newAddItem = find(this.menus);
    },
    // 重新渲染菜单数据
    renderMenuData(menuData) {
      // menuDictionary 菜单数据词典 详见@/common/dictionary/pos-order-menu-dictionary
      const menuItem = {
        [menuDictionary.REALITEMID]: '', // 真实品项ID
        [menuDictionary.ITEMID]: '', // 品项ID
        [menuDictionary.BIGCLASSID]: '', // 大类ID
        [menuDictionary.SMALLCLASSID]: '', // 小类ID
        [menuDictionary.CUSTOMCLASSID]: '', // 自定义类别ID
        [menuDictionary.UNITID]: '',
        [menuDictionary.NAME]: '',
        [menuDictionary.UNITNAME]: '',
        [menuDictionary.ITEMSIZEID]: '',
        [menuDictionary.ISENABLE]: false,
        [menuDictionary.COSTPRICE]: '',
        [menuDictionary.ENABLEHALF]: '',
        [menuDictionary.ISPACKAGE]: false,
        [menuDictionary.ISWEIGHED]: false,
        [menuDictionary.ISCONFIRMWEIGH]: false,
        [menuDictionary.ISBUFFET]: false,
        [menuDictionary.STDPRICE]: 0,
        [menuDictionary.ISSELLOUT]: 0,
        [menuDictionary.AIDCODE]: '',
        [menuDictionary.METHODCOUNT]: 0,
        [menuDictionary.CLASSNAME]: '',
        [menuDictionary.PKGTYPE]: 0,
        [menuDictionary.ISCANDISCOUNT]: false,
        [menuDictionary.PINYIN]: '',
        [menuDictionary.ENABLEMUTISIZE]: false,
        [menuDictionary.OLDPRICE]: 0,
        [menuDictionary.ITEMNAME]: '',
        [menuDictionary.OLDPRICETYPE]: 0,
        [menuDictionary.PRICETYPE]: 0,
        [menuDictionary.BARCODE]: '',
        [menuDictionary.ISSINGLEMETHOD]: false,
        [menuDictionary.CODE]: '',
        [menuDictionary.DISCFLG]: 0,
        [menuDictionary.PRICE]: 0,
        [menuDictionary.ISNEGATIVEPRICE]: false,
        [menuDictionary.CLASSCODE]: '',
        [menuDictionary.SALEPRICE]: 0,
        [menuDictionary.MINADDQTY]: 0,
        [menuDictionary.MAXADDQTY]: 0,
        [menuDictionary.ITEMBARCODESTR]: '',
        isPincai: false,
        // 衍生数据
        count: 0, // 加单菜品数量
        sizeList: null,
      };
      // 这是时价变动和新增的数据集
      const modifyTimePriceData = this.getVuexitemTimePricesMap.modifyItemList || {};
      // 这个时间是删除的数据集
      const deleteTimePriceData = this.getVuexitemTimePricesMap.deleteItemList || {};
      // 关联下限量的数据
      // 根据品项的id和规格拼接的id来查找下对应的品项数据
      // 判断是否显示
      const menu = map(menuData, (item) => {
        // 执行时价的逻辑
        this.setItmePrice(item, true, modifyTimePriceData[`${item.id}_${item.sizeId}`]);
        this.setItmePrice(item, false, deleteTimePriceData[`${item.id}_${item.sizeId}`]);
        if (
          !item.isItemTimePrice
          && +this.areaType !== 0
          && this.areaType
          && JSON.stringify(item.otherPrice) !== '{}'
        ) {
          // 如果不是促销价显示价格进行匹配否则不变
          let { price } = item;
          if (item.discFlg !== 4) {
            price = item.otherPrice[`${this.areaType}`];
          }
          return extend({}, menuItem, item, { price, salePrice: item.otherPrice[`${this.areaType}`] });
        }
        return extend({}, menuItem, item);
      });
      return menu;
    },
    // 加单前的数量选择
    changeAddNum(num) {
      let numn = '';
      if (typeof (num) === 'number') {
        this.addBeforeNum.push(num);
      } else if (typeof (num) === 'string') {
        this.addBeforeNum.splice((this.addBeforeNum.length - 1), 1);
      }
      if (this.addBeforeNum.length) {
        numn = this.addBeforeNum.reduce((s, i) => String(s) + String(i));
      }
      if (numn !== '' && numn > 9) {
        if (numn > 100) {
          this.addBeforeNum = [];
          this.addBeforeNum = [1, 0, 0];
          this.$message.warning(this.$t('Biz.Order.Max100Current100'));
        } else {
          this.$message.warning(this.$t('Biz.Order.CheckedNum', [numn]));
        }
      } else if (typeof (num) === 'string' && numn > 0) {
        this.$message.warning(this.$t('Biz.Order.UpdatedNum', [numn]));
      }
    },
    // 每次跳转过来需要清空下数组 addBeforeNum (是快速加单的数字按钮的点击集合)
    clearAddBeforeNum() {
      this.addBeforeNum.splice(0, this.addBeforeNum.length - 1);
    },
    // 加单之前计算下 是否点击了快速数字加单和所点击的数
    changeAddBeforeNum() {
      let numn = '';
      if (this.addBeforeNum.length) {
        this.addBeforeNum.forEach((_) => {
          numn = numn.concat(_);
        });
      }
      this.addBeforeNum.splice(0, this.addBeforeNum.length);
      // false代表了 没有做任何操作, parseInt(numn)代表了加单之前所要加单的数量
      return numn === '' ? false : parseInt(numn, 10);
    },
    conutTotal(id) {
      const newArr = this.guestList.filter(v => (`${v.id}_${v.sizeId}`) === `${id}`);
      return newArr.reduce((sum, n) => (sum + n.num), 0);
    },
    // 菜单品项点击事件 item品项数据，searchType搜索模式（模糊=''，精准='precision'，汉字=''）
    // eventType触发add的方式，扫码回车加eventType=''，点击添加为'click'
    add(itemMenu, searchType = '', eventType) {
      // 需要判定下品项是否属于客位限定的品项
      if (
        this.getVuexPointData.pointGroupId
        && itemMenu.pointGroupId
        && this.getVuexPointData.pointGroupId !== itemMenu.pointGroupId
      ) {
        this.$message.error(this.$t('Biz.Order.LongMsg015', [itemMenu.name]));
        return false;
      }
      const item = cloneDeep(itemMenu);
      if (this.lastAddDishTime) {
        const dif = new Date() - this.lastAddDishTime;
        if (dif < 1000) {
          this.$log.info(`连续点击菜品，间隔${dif}`);
        }
      }
      this.lastAddDishTime = new Date();
      this.$log.info(`菜品点击的code：${item.code}，客位code：${this.posOrderBill.bsData.pointCode}`);
      let nums = 0;
      this.$log.info(`菜品点击的id${item.id},当前时间===${new Date()}`);
      this.$vemit('combo'); // 是否清除搜索框文本
      // 如果存在num属性的话需要先删除下
      // if (item.num) {
      //   this.$delete(item, 'num');
      // }
      // 手动点击 item的num为undefined 所以给它一个默认值1
      if (!item.num) {
        item.num = 1;
      }
      // 如果是估清的品项
      if (!item.enableMutiSize && item.isSellout) { // 如果不是多规格 并且已经估清
        this.$message.error(this.$t('Biz.Order.AddOrderIsSellout'));
        return;
      }
      // 使用数字按钮快速加单
      const addNum = this.changeAddBeforeNum();
      if (typeof (addNum) === 'number' && addNum === 0) {
        this.$message.error(this.$t('Biz.Order.AddCannotBe0'));
        return;
      }
      if (addNum && !item.TagID) {
        // 套餐就提示
        if (item.isPackage) {
          this.$message.error(this.$t('Biz.Order.AddOrderErrorMsg07'));
          return;
        }
        // 存在并添加个属性为num
        this.$set(item, 'num', addNum);
      }
      if (item.TagNum) { // 易盘数量
        this.$set(item, 'num', item.TagNum);
      }
      const limitSmallClsItemNum = this.haveLimitSmallClasses[item.smallClassId];
      if (limitSmallClsItemNum) {
        // 入库的当前菜对应的小类已点的总数
        const orderItemSmClsTotal = this.getActiveOrderItemSmClsTotal(item.smallClassId);
        const orderingItemSmClsTotal = this.getActiveOrderItemSmClsTotal(item.smallClassId, this.guestList, 'num');
        if (limitSmallClsItemNum < add(orderingItemSmClsTotal, add(orderItemSmClsTotal, item.num))) {
          this.$message.error(`菜品所属小类限定数为${limitSmallClsItemNum}`);
          return;
        }
      }
      // 精准模式搜索下品项没有下面的key，需要手动添加
      // 如果精准搜索过来的 不限制是不是多规格品项  因为精准摸模式下的items都是拆分开的  不存在多规格的情况
      if (searchType === 'precision') {
        if (item.isSellout) {
          this.$message.error(this.$t('Biz.Order.AddOrderIsSellout'));
          this.$vemit('clearSearchText');
          return;
        }
        if (!item.sizeId) {
          this.$set(item, 'sizeId', item.itemSizeId);
        }
        if (!item.id) {
          this.$set(item, 'id', item.realItemId);
        }
        if (!item.count) {
          this.$set(item, 'count', 0);
        }
      }
      this.newAddItem = item;
      // 根据后台设置加单数量是否能多于限量 并且存在限量的情况下而且不是多规格的才走一下逻辑
      if (!this.posSettings.isAllowAddOrderWhenLimitZero
        && !this.newAddItem.enableMutiSize
        && (this.newAddItem.limit || `${this.newAddItem.limit}` === '0')
      ) {
        nums = this.conutTotal(`${item.id}_${item.sizeId}`);
        const {
          count, limit, num,
        } = this.newAddItem;
        // 当开启席数功能时，前端不对限量进行判断，提交时后台进行判断
        if (this.setting.isUseSeat === '1') {
          this.newAddItem.count += this.newAddItem.num;
        } else if (nums < limit) {
          if (limit - count > 0 && limit - nums < num) { // nums加的总数量 limit限制数量 num 加单数量
            if (item.TagNum) { // 如为易盘不加单
              this.$message.warning(this.$t('Biz.BizComm.BizCommTip14', [limit]));
              return;
            }
            this.newAddItem.num = limit - nums;
          } else {
            this.newAddItem.count += this.newAddItem.num;
          }
        } else {
          this.$message.warning(this.$t('Biz.Order.ExceedingTheLimit'));
          this.$vemit('clearSearchText');
          return;
        }
      }

      // 添加个品项类型
      this.$set(item, 'itemType', this.SUBMIT_ITEM_TYPE_NORMAL);
      // 添加个是否是自助类型
      this.$set(item, 'isDinnerBuffet', (this.posOrderBill ? this.posOrderBill.isDinnerBuffet : false));
      // 多规格 规格和套餐的以及普通的加单数据方法可以单独摘出去。。待优化方法带目前好像不怎么影响性能
      if (item.enableMutiSize) {
        this.addItemIsSize(item, searchType, eventType, addNum);
        // 套餐
      } else if (item.isPackage) {
        this.addItemIsPackage(item);
      } else if (
        item.isWeighed
        && this.posDevice.enableScale
        && (eventType !== undefined || searchType !== 'precision')
      ) {
        this.addItemIsWeighed(item);
      } else {
        // 添加菜品
        this.$vemit('posOrderAddDish', { item, beforeAddNum: addNum });
      }
      if (!eventType) { // enter加单
        this.oldAddItem = cloneDeep(this.newAddItem);
      } else { // 添加非同一品项时清空
        if (this.oldAddItem && (this.newAddItem.id !== this.oldAddItem.id)) this.oldAddItem = null;
      }
    },
    // 加单时多规格的品项方法
    addItemIsSize(item, searchType = '', eventType, addNum) {
      const self = this;
      let options = null;
      if (item.id) {
        options = {
          itemId: item.id, // 品项id
          isDinnerBuffet: this.posOrderBill.isDinnerBuffet, // 是否是自助模式
        };
      } else if (item.itemId) {
        const arr = item.itemId.split('_');
        options = {
          itemId: arr[0], // 大品项id
          itemSizeId: arr[1], // 小品项id
          isDinnerBuffet: this.posOrderBill.isDinnerBuffet, // 是否是自助模式
        };
      }
      if (
        (!item.promotePrice && +item.promotePrice !== 0)
        && !item.isItemTimePrice && +self.areaType !== 0
        && (item[`other_price${self.areaType}`]
          || +item[`other_price${self.areaType}`] === 0)) {
        self.$set(item, 'std_price', item[`other_price${self.areaType}`]);
        self.$set(item, 'salePrice', item[`other_price${self.areaType}`]);
      }
      if (
        searchType === 'precision'
        && eventType !== 'click'
        || (
          this.posSettings.addOrderMultiSpecification
          && item.isDefault
        )
        || (
          item.isDefault
          && item.TagID
        )
      ) { // 精准模式下扫码回车不走接口
        const itemLimitsMap = cloneDeep(this.getVuexItemLimitsMap);
        if (!this.posSettings.isAllowAddOrderWhenLimitZero && this.getVuexItemLimitsMap[`${item.itemId}`]) {
          this.$set(item, 'restQuantity', this.getVuexItemLimitsMap[`${item.itemId}`].restQuantity);
          this.$set(item, 'isLimit', true);
          this.$set(item, 'limitTotal', this.getVuexItemLimitsMap[`${item.itemId}`].maxLimit);
          if (this.getVuexItemLimitsMap[`${item.itemId}`].restQuantity > 0 && this.getVuexItemLimitsMap[`${item.itemId}`].restQuantity < 1) {
            item.num = this.getVuexItemLimitsMap[`${item.itemId}`].restQuantity;
          }
          this.$vemit('handleAddMenuItem', item);
          if (this.getVuexItemLimitsMap[`${item.itemId}`].restQuantity < 0) {
            this.$message.warning(this.$t('Biz.BizComm.BizCommTip14', [item.limitTotal]));
            itemLimitsMap[`${item.itemId}`].restQuantity = 0;
            this.setLimitsMap(itemLimitsMap);
            return;
          }
        }
        if (item.isWeighed
          && this.posDevice.enableScale
        ) {
          this.showWeightToAdd(item);
        } else {
          this.$vemit('posOrderAddDish', { item, beforeAddNum: addNum });
        }
      } else { // 模糊,汉字,精准模式点击下走接口
        // 请求规格接口获取数据
        ajax('canyin.pos.itemPkgAndSize.itemSize', { params: options })
          .then((res) => {
            if (!res.itemSizeList.length || !res.itemSizeList) {
              this.$message({
                type: 'error',
                message: this.$t('Biz.Order.AddOrderErrorMsg08'),
              });
              return;
            } if (res.itemSizeList.length === 1) { // 如果只有一个规格 直接添加
              if (item.isSellout) {
                this.$message.error(this.$t('Biz.Order.AddOrderIsSellout'));
                return false;
              }
              // 给 item添加个sizeList 可以用来对修改和缓存起来
              item.sizeList = res.itemSizeList;
              if (item.isWeighed
                && this.posDevice.enableScale
              ) {
                this.showWeightToAdd(item);
              } else {
                this.$vemit('posOrderAddDish', { item, beforeAddNum: addNum });
              }
              return;
            }
            // 给 item添加个sizeList 可以用来对修改和缓存起来
            const { itemSizeList } = res;
            const filterItemSizeList = itemSizeList.filter((list) => {
              if (this.getVuexPointData.pointGroupId) {
                return !list.pointGroupId || list.pointGroupId === this.getVuexPointData.pointGroupId;
              }
              return true;
            });
            item.sizeList = filterItemSizeList;
            const wyList = filterItemSizeList.map((itemList) => {
              const itemSelf = itemList;
              if (this.getVuexItemLimitsMap[`${itemSelf.item_id}_${itemSelf.size_id}`]) {
                itemSelf.restQuantity = this.getVuexItemLimitsMap[`${itemSelf.item_id}_${itemSelf.size_id}`].restQuantity;
              }
              return itemSelf;
            });
            this.$refs.itemSize.open({ sizeList: wyList }, {
              submit: (itemSizeData) => {
                item = extend({}, item, itemSizeData);
                if (item.isWeighed
                  && this.posDevice.enableScale
                ) {
                  this.showWeightToAdd(item);
                } else {
                  this.$vemit('posOrderAddDish', { item, beforeAddNum: addNum });
                }
              },
            });
          })
          .catch((error) => {
            this.$message({
              type: 'error',
              message: error.msg,
            });
          });
      }
    },
    // 计算当前小类所点的数量总和
    getActiveItemSmallClassTotal(smlClsId) {
      // this.G
    },
    // 加单的是套餐
    addItemIsPackage(item) {
      //* "pkgType":0, //0 常规套餐（默认值） ；1 宴会套餐；2 临时套餐
      const options = {
        params: {
          pkgId: item.id ? item.id : item.itemId.split('_')[0],
          scId: item.scId ? item.scId : '',
          pointId: this.posOrderBill.bsData.pointId,
          isBuffet: this.posOrderBill.isDinnerBuffet, // 是否是自助模式
        },
        needLog: true,
      };

      if (+item.pkgType === 0) {
        ajax('canyin.pos.bill.itempkgnormal', options).then((data) => {
          // 套餐数量默认值设置
          data.package.minAddQty = data.package.minAddQty || item.minAddQty;
          data.package.maxAddQty = data.package.maxAddQty || item.maxAddQty;
          data.package.lastQty = data.package.minAddQty ? data.package.minAddQty : data.package.lastQty;

          // 为复制菜品清除叫起方式
          if (data.pkgClassesNew && data.pkgClassesNew.length) {
            data.pkgClassesNew[0].normalDtList.forEach((itemPkg) => {
              const itemSelf = itemPkg;
              delete itemSelf.serveWay;
            });
          }
          const { isItemTimePrice } = item;
          data.package.isItemTimePrice = isItemTimePrice || false;
          this.$refs.PackageNormal.open(data, {
            // 回调的传参中pkgNormalData 代表要用到的数据 pkgData代表套餐弹框原有的数据用来套餐修改
            submit: (pkgNormalData, pkgData) => {
              this.$refs.PackageNormal.close();// 关闭弹框
              // let pkgNewData =[]
              pkgData.pkgUnSelectedItems.forEach((_) => {
                this.$set(_, 'defaultQty', 0);
                this.$set(_, 'count', 0);
              });
              item = Object.assign({}, item, pkgNormalData);// 合并
              this.$set(item, 'pkgData', pkgData);
              this.$set(item, 'itemType', this.SUBMIT_ITEM_TYPE_PKG_NORMAL);
              this.$set(item, 'pkgType', 0);
              this.$vemit('posOrderAddDish', { item });
            },
          });
        });
      } else if (+item.pkgType === 1) {
        ajax('canyin.pos.bill.itempkgpart', options).then((data) => {
          data.package.minAddQty = data.package.minAddQty || item.minAddQty;
          data.package.maxAddQty = data.package.maxAddQty || item.maxAddQty;

          // 为复制菜品清除叫起方式
          if (data.pkgSelectedItems) {
            data.pkgSelectedItems.forEach((itemPkgItems) => {
              const itemSelf = itemPkgItems;
              delete itemSelf.serveWay;
            });
          }
          data.package.isItemTimePrice = item.isItemTimePrice ? item.isItemTimePrice : false;
          this.$refs.PackagePart.open(data, {
            submit: (pkgPartData, pkgData) => {
              // pkgPartData 代表要用到的数据 pkgData代表套餐弹框原有的数据用来套餐修改
              this.$refs.PackagePart.close();// 关闭弹框
              const newPkgPartData = Object.assign(item, pkgPartData);
              this.$set(newPkgPartData, 'pkgData', pkgData);
              this.$set(newPkgPartData, 'itemType', this.SUBMIT_ITEM_TYPE_PKG_PART);
              this.$set(newPkgPartData, 'pkgType', 1);
              this.$vemit('posOrderAddDish', { item: newPkgPartData });
            },
          });
        });
      }
    },
    // 加单电子秤品项
    addItemIsWeighed(item) {
      if (!item.TagID) {
        this.showWeightToAdd(item);
      } else {
        this.$message.error(this.$t('Biz.Order.AddOrderErrorMsg09'));
      }
    },
    // 电子秤调用并加单
    showWeightToAdd(item) {
      if (this.posFastFood.isNetWeight && this.posDevice.isSupportNewWeight) { // 新版去皮功能
        this.$refs.showWeightModel.open({ dish: item }, {
          submit: (data) => {
            let weightData = data;
            // 电子称负数问题
            if (weightData < 0) {
              weightData = 1;
            }
            this.$vemit('posOrderAddDish', { item: extend({}, item, { num: weightData, itemType: this.SUBMIT_ITEM_TYPE_NORMAL }) });
          },
        });
      } else { // 老程序
        this.loadScale((weight, isError) => {
          let newWeight = weight;
          if (!isError) {
            newWeight = newWeightUnitConversion(weight, this.setting);
          }
          // 目前的电子称的品项只是正常品项所以添加个itemType 为1
          this.$vemit('posOrderAddDish', {
            item: extend({}, item, {
              num: newWeight,
              itemType: this.SUBMIT_ITEM_TYPE_NORMAL,
            }),
          });
        });
      }
    },
    /** * 以下是拷贝的ItemSize.vue里的逻辑   开始 ** */
    // 对数据的做下限量的数据处理
    devLimitQty(itemsize) {
      // 限量的总数
      const limit_quantity = itemsize.rest_quantity
        ? itemsize.rest_quantity
        : 0;
      // 已售出的总数
      const sales_quantity = itemsize.sales_quantity
        ? itemsize.sales_quantity
        : 0;
      // 所剩下的限量数
      // let devLimitQty = (limit_quantity * 1000 - sales_quantity * 1000) / 1000;
      const devLimitQty = limit_quantity;
      itemsize.limit_quantity = limit_quantity;
      itemsize.sales_quantity = sales_quantity;
      return extend({ devLimitQty }, itemsize);
    },
    addItemSize(itemsize) {
      // 进行处理下
      const newItemSize = this.devLimitQty(itemsize);
      // this.$refs.dialog.close()
      //! this.posSettings.isAllowAddOrderWhenLimitZero 判断为零的时候可以继续加单
      // 这是估清和限量的判断
      if (newItemSize.isSellout) {
        this.isShowMessage(this.$t('Biz.Order.SelectItemSizeMsg'));
      } else if (!this.posSettings.isAllowAddOrderWhenLimitZero && newItemSize.isLimit && newItemSize.devLimitQty <= 0) {
        this.isShowMessage(this.$t('Biz.Order.SelectItemSizeMsg01'), 'warning');
      } else {
        // 这给选择的规格添加active
        this.activeItemSize = newItemSize;
        this.activeItemSizeId = itemsize.size_id;
        // this.$emit('add', itemsize.size_id)
        // this.$refs.dialog.close()
      }
    },
    isShowMessage(message, type, duration) {
      const options = {
        message: message || this.$t('Dict.PromptInfo '), // 提示的内容
        type: type || 'error', // 类型 success/warning/info/error
        duration: duration || 1500, // 显示的时间
        center: true, // 中间显示
      };
      Message(options); // 需要多的可以查看element-ui 的官网 pmin组件
    },
    // 确定方法
    itemSizeSubmit() {
      // 把选中的itemsize_id 传给进行找到相应的对其进行加单操作
      if (this.activeItemSize) {
        // 这是估清和限量的判断
        this.activeItemSize = this.devLimitQty(this.activeItemSize);
        if (this.activeItemSize.isSellout) {
          this.isShowMessage(this.$t('Biz.Order.SelectItemSizeMsg'));
          return;
        } if (!this.posSettings.isAllowAddOrderWhenLimitZero && this.activeItemSize.isLimit && this.activeItemSize.devLimitQty <= 0) {
          this.isShowMessage(this.$t('Biz.Order.SelectItemSizeMsg01'), 'warning');
          return;
        }
        const itemSizeData = {
          costPrice: this.activeItemSize.cost_price,
          isLimit: this.activeItemSize.isLimit,
          isPromotePrice: this.activeItemSize.isPromotePrice, // 如果存在促销价格 则当前打折状态是4
          isSellout: this.activeItemSize.isSellout,
          isDefault: this.activeItemSize.is_default,
          limitQuantity: this.activeItemSize.limit_quantity,
          sizeName: this.activeItemSize.name,
          priceType: this.activeItemSize.priceType,
          salePrice: this.activeItemSize.salePrice,
          sizeId: this.activeItemSize.size_id,
          stdPrice: this.activeItemSize.std_price,
          unitId: this.activeItemSize.unit_id,
          unitName: this.activeItemSize.unit_name,
          price: this.activeItemSize.std_price,
          discFlg: this.activeItemSize.discFlg ? this.activeItemSize.discFlg : (this.activeItemSize.isPromotePrice ? 4 : 0),
          promotePrice: this.activeItemSize.promotePrice ? this.activeItemSize.promotePrice : null,
          memberPrice: this.activeItemSize.memberPrice ? this.activeItemSize.memberPrice : null,
          isItemTimePrice: this.activeItemSize.isItemTimePrice ? this.activeItemSize.isItemTimePrice : false,
        };
        return itemSizeData;
      }
      this.isShowMessage(this.$t('Biz.Order.PlsSelectSizeFirst'), 'info');
    },
    /** * 以上是拷贝的ItemSize.vue里的逻辑   结束 ** */
    addSize(sizeData) {
      // 渲染规格品项
      if (sizeData) {
        // 拼接下名称
        // this.$set(sizeData,'name','('+sizeData.sizeName+')'+sizeData.name)
        this.$vemit('posOrderAddDish', { item: sizeData });
      } else {
        this.$message.error(this.$t('Biz.Order.AddOrderErrorMsg10'));
      }
    },
    // 判断是否显示
    checkFilter(item) {
      if (this.posItemCustomClasses) { // 如果设置了自定义品项类别
        // 检测自定义品项类别、快速查找文字
        return this.checkCustomClassesFilter(item) && this.checkSearchText(item);
      }
      // 检测大类筛选、小类筛选、快速查找文字
      return this.checkBigClassesFilter(item)
        && this.checkSmallClassesFilter(item)
        && this.checkSearchText(item);
    },
    // 检测大类筛选
    checkBigClassesFilter(item) {
      return this.bigClassesFilter === '' || this.bigClassesFilter === item[menuDictionary.BIGCLASSID];
    },
    // 检测小类筛选
    checkSmallClassesFilter(item) {
      return this.smallClassesFilter === '' || this.smallClassesFilter === item[menuDictionary.SMALLCLASSID];
    },
    // 检测自定义筛选
    checkCustomClassesFilter(item) {
      return this.customClassesFilter === '' || this.customClassesFilter === item[menuDictionary.CUSTOMCLASSID];
    },
    // 根据code 拼音 名称  条码 进行筛选
    checkSearchText(item) {
      const { posSettings, searchText, itemFilter } = this;
      const { searchMode, isAllowDarkScan } = posSettings;
      if (searchText.length === 0) {
        return true;
      }
      switch (+searchMode) {
        case 1: // 模糊
          if (isAllowDarkScan) { // 开了开关 模糊搜索下如果是纯数字走精准逻辑 不过滤品项
            this.isAllNumber = false;
            if (+searchText || +searchText === 0) { // 纯数字不过滤
              this.isAllNumber = true;
              return true;
            }
            return !searchText.length || itemFilter(item); // 非纯数字过滤
          }
          return !searchText.length || itemFilter(item); // 非纯数字过滤
        case 2: // 精准
          return true;
        case 3: // 汉字
          return !searchText.length || itemFilter(item); // 非纯数字过滤
        default:
          return true;
      }
    },
    itemFilter(item) {
      // 只有模糊汉字模式下会进入这个函数
      const { posSettings, searchText } = this;
      const { searchMode, isAllowDarkScan } = posSettings;
      if (+searchMode !== 3) { // 不是汉字
        const keyFilters = this.quickSearchText;
        if (isAllowDarkScan) { // 开启了模糊扫码 增加商品条码匹配
          for (let i = 0; i < keyFilters.length; i += 1) {
            const key = keyFilters[i];
            try {
              if ((item.pinyin.toLowerCase().indexOf(key) !== -1)
                || (item.name.toLowerCase().indexOf(key) !== -1)
                || (String(item.code).toLowerCase().indexOf(key) !== -1)
                || (item.barcode ? item.barcode.toLowerCase().indexOf(key) !== -1 : false)) {
                return true;
              }
            } catch (e) {
              console.log(item);
            }
          }
        } else { // 没开的话只匹配助记符和code
          for (let i = 0; i < keyFilters.length; i += 1) {
            const key = keyFilters[i];
            try {
              if ((item.pinyin.toLowerCase().indexOf(key) !== -1)
                || (item.name.toLowerCase().indexOf(key) !== -1)
                || (String(item.code).toLowerCase().indexOf(key) !== -1)) {
                return true;
              }
            } catch (e) {
              console.log(item);
            }
          }
        }
      } else if (item.name.indexOf(searchText) !== -1) { // 是汉字
        return true;
      }
    },
    // 获得cookie值
    getCookie(name) {
      let arr;
      const reg = new RegExp(`(^| )${name}=([^;]*)(;|$)`);
      if (arr = document.cookie.match(reg)) {
        return unescape(arr[2]);
      }
      return null;
    },
    // 选择大类时触发
    changeBigClasses(value) {
      // 个鞥新选中大类数据
      this.bigClassesFilter = value;
      // 刷新菜单数据
      this.refreshMenuData();
    },
    // 选择时触发
    changeSmallClasses(value) {
      this.smallClassesFilter = value;
      // 刷新菜单数据
      this.refreshMenuData();
    },
    // 选择自定义品项类别时触发
    changeCustomClasses(value) {
      this.customClassesFilter = value;
      // 刷新菜单数据
      this.refreshMenuData();
    },
    // 刷新菜单数据
    refreshMenuData() {
      const { posSettings, $refs, activeFirstItem } = this;
      $refs.menuList.refresh();
      if (posSettings.searchMode !== 2) {
        activeFirstItem();
      }
    },
    // 打开临时品项
    openItemTemp() {
      ajax('canyin.pos.bill.billitemtempview', {
        params: {
          loadmodule: 1,
          _t: new Date().getTime(),
        },
      }).then((data) => {
        const obj = {};
        let { openTime } = this.getVuexPointData;
        const { name: pointName, peopleQty } = this.getVuexPointData;
        openTime = dateFormat('%H:%I', Date.parse(openTime));
        obj.pointData = { pointName, openTime, peopleQty };
        extend(data, obj);
        this.$refs.itemTemp.open(data, {
          submit: (itemData) => {
            this.$vemit('posOrderAddDish', { item: itemData });
          },
        });
      }).catch((msgCode, msg) => {
        this.$message.error(msg);
      });
    },
    // Search组件回车触发加单逻辑
    enterSearch() {
      this.addActiveItem();
    },
    // 监听搜索框的搜索事件
    onSearch(searchText) {
      const { searchMode } = this.posSettings;
      if (searchMode !== 2) {
        this.$vemit('clearClassFilter');
      }
      if (searchMode !== 3) {
        this.searchText = searchText.toLowerCase();
      } else {
        this.searchText = searchText;
      }
      this.refreshMenuData();
    },
    // 清除模糊查询下的默认第一个选项
    onClearNewAddItem() {
      this.activeFirstItem();
    },
    hasClass(elements, cName) {
      // ( \\s|^ ) 判断前面是否有空格 （\\s | $ ）判断后面是否有空格 两个感叹号为转换为布尔值 以方便做判断
      return !!elements.className.match(new RegExp(`(\\s|^)${cName}(\\s|$)`));
    },
    addClass(elements, cName) {
      const ele = elements;
      // 拼接添加
      ele.className += ` ${cName}`;
    },
    removeClass(elements, cName) {
      const ele = elements;
      // replace方法是替换
      ele.className = ele.className.replace(
        new RegExp(`(\\s|^)${cName}(\\s|$)`), ' ',
      );
    },
    // 自助模式的判断获取
    getIsOpenSelfStatus() {

    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

// Component Pos/Order/Tables/List

//== menu list padding top
@pos-order-menu-list-padding-top: 8px;
@pos-order-menu-list-padding-bottom: 42px;

//== menu item

//** padding horizontal
@pos-order-menu-padding-horizontal: 5px;
//** title height
@pos-order-menu-title-height: 22px;
//** title font size
@pos-order-menu-title-font-size: 16px;
//** title text shadow
@pos-order-menu-title-text-shadow: 1px 1px 1px #666;
//** code height
@pos-order-menu-code-height: 18px;
//** code font size
@pos-order-menu-code-font-size: 12px;
//** type money width
@pos-order-menu-money-width: 50%;
//** type money padding top
@pos-order-menu-money-padding-top: 16px;
//** type count absolute top
@pos-order-menu-count-absolute-top: 3px;
//** type count absolute right
@pos-order-menu-count-absolute-right: 5px;
//** type count font size
@pos-order-menu-count-font-size: 20px;
//** type count color
@pos-order-menu-count-color: #ee4e63;
//** type count hasCount background color
@pos-order-menu-has-count-bg: rgba(0, 0, 0, 0.3);
.fz12 {
  font-size: 12px !important;
}
.pos-order-menu-list {
  position: relative;
  // height: calc(100% - 102px);
  height: 100%;
  padding-top: @pos-order-menu-filter-height;
  padding-bottom: @pos-order-menu-control-height;
  &.pos-order-menu-list-noNumBtns {
    // padding-top: @pos-order-menu-filter-height;
    padding-top: 60px;
  }
  &.menuList_noBtn_smallClassOneLine{
    padding-top: @pos-order-menu-filter-height + @pos-order-menu-list-padding-top + @pos-order-menu-btns-height;
  }
}

.pos-order-menu-list-ul {
  .square(100%);
  margin-left: @pos-order-menu-space / -2;
  margin-right: @pos-order-menu-space / -2;
  transition: transform 0.2s;
  .clearfix();

  > li {
    &.isHidden {
      position: absolute;
      width: 0px;
      height: 0px;
    }
    > .small-height-btn {
      .size(100%, @pos-order-menu-small-height) !important;
    }
    > button {
      display: block;
      .size(100%, @pos-order-menu-height);
      padding: 0 @pos-order-menu-padding-horizontal;
      border: none;
      background: none;
      background-color: white;
      > .itemSellout {
        display: block;
        position: absolute;
        top: 6px;
        right: 6px;
        color: #df2d2d;
        font-size: 20px;
        font-weight: bold;
      }
      > .itemLimit {
        position: absolute;
        top: 2px;
        right: 36px;
        background-color: #d8a91b;
        padding: 0px 4px;
        border-radius: 8px;
      }

      &.isSellout {
        opacity: 0.6;
        filter: alpha(opacity=60);
      }

      &.active {
        background-color: rgba(0, 0, 0, 0.1);
      }

      > strong {
        display: block;
        height: @pos-order-menu-title-height * 2;
        line-height: @pos-order-menu-title-height;
        font-size: @pos-order-menu-title-font-size;
        text-align: left;
        color: #273844;
        font-weight: normal;
        overflow: hidden;
      }
      > .small-height {
        height: 24px !important;
      }
      > .small-line-height {
        line-height: 12px !important;
      }
      > .menu-code{
        height: @pos-order-menu-code-height;
        > span {
          display: block;
          height: @pos-order-menu-code-height;
          line-height: @pos-order-menu-code-height;
          font-size: @pos-order-menu-code-font-size;
          text-align: left;
          color: #273844;
        }
      }
      > span {
        display: block;
        height: @pos-order-menu-code-height;
        line-height: @pos-order-menu-code-height;
        font-size: @pos-order-menu-code-font-size;
        text-align: left;
        color: #273844;
      }

      > ul {
        height: @pos-order-menu-code-height;
        line-height: @pos-order-menu-code-height;
        font-size: @pos-order-menu-code-font-size;
        text-align: left;
        color: #273844;
        .clearfix();

        > li {
          float: left;
          .promotion-sale {
            font-style: normal;
            .promotion-flag {
              display: inline-block;
              width: 16px;
              height: 16px;
              line-height: 16px;
              text-align: center;
              font-size: 12px;
              color: #fff;
              font-style: normal;
              margin-left: 2px;
              margin-right: 2px;
              background-color: #f7b135;
            }
          }
          &:last-child {
            text-align: right;
            float: right;
            height: 20px;
            line-height: 20px;
            overflow: hidden;
            min-width: 80px; // 解决加单页面促销情况下【价格/盘】显示不全的问题
          }
        }
      }

      > .count {
        position: absolute;
        top: @pos-order-menu-count-absolute-top;
        right: @pos-order-menu-count-absolute-right;
        font-size: @pos-order-menu-count-font-size;
        color: @pos-order-menu-count-color;
      }
      > .count_tag {
        color: #92c2cc;
      }
    }
  }
}

.pos-order-menu-control {
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  .size(100%, @pos-order-menu-control-height);
  /*<!--padding-right: @pos-order-menu-pager-width;-->*/
  .btn-wrap {
    width: 72px;
    /*float: left;*/
    /*padding: 3px;*/
    /*height: 36px;*/
    /*border-top-left-radius: 18px;*/
    /*border-bottom-left-radius: 18px;*/
    position: relative;
    .model-panel {
      position: absolute;
      bottom: 39px;
      z-index: 9999999;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 72px;
      border-radius: 5px;
      background-color: rgba(0,0,0,.7);
      > button {
        margin-top: 10px;
        background-color: transparent;
        border: 1px solid #bbbbbb;
        border-radius: 5px;
        color: #ffffff;
        &.active {
          border: 1px solid #0babb9;
          background-color: #0babb9!important;
        }
      }
      >button:last-child{
        margin-bottom: 10px;
      }
    }
    button {
      height: 36px;
      border-top-left-radius: 8px;
      border-bottom-left-radius: 8px;
      margin-right: 1px;
      outline: none;
      border: none;
      padding: 5px 10px;
      /*width: 52px;*/
      /*border-radius: 15px;*/
      background: white;
      font-size: 16px;
    }
    .active {
      background-color: #9dc1ca !important;
      color: #ffffff !important;
    }
  }
  .add-temp-item {
    line-height: @pos-order-menu-control-height;
    border: none;
    color: #273844;
    background-color: rgba(237, 254, 255, 0.5);
    border-radius: 20px;
    margin-left: 12px;
    padding-left: 12px;
    padding-right: 12px;
    > i {
      padding-right: 4px;
    }
    &:hover {
      background-color: rgba(255, 255, 255, 0.28);
    }
  }
}

.menulist_isSmallClassOneLine {
  .kcWeight, .pos-menu-btns {
    top: 62px;
  }
}

.lang-enUS {
  .pos-order-menu-list-ul {
    > li {
      > button {
        > ul {
          > li {
            .promotion-sale {
              .promotion-flag {
                width: 28px;
              }
            }
            &:last-child {
             min-width: auto;
            }
          }
        }
      }
    }
  }
}
</style>

<style lang="less">
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-order-tables-pager.pager > button {
  background-color: rgba(237, 254, 255, 0.5);
  color: #273844;
  border: none;
}

.pos-order-menu-list-ul > li {
  position: relative;
  float: left;
  width: @pos-order-menu-width;
  padding-left: @pos-order-menu-space / 2;
  padding-right: @pos-order-menu-space / 2;
  margin-bottom: @pos-order-menu-space;
}
</style>
