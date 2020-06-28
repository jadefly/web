<template>
  <div
    class="pos-order-menu-list"
    :class="{
      'pos-order-menu-list-noNumBtns': posFastFood && posFastFood.isShowFastInputNum != '1'
        && posFastFood.isNetWeight != '1' && isSmallClassOneLine,
      'menuList_noBtn_smallClassOneLine': (
        posFastFood.isShowFastInputNum
        || posFastFood.isNetWeight
      ) && !isSmallClassOneLine,
      'menulist_isSmallClassOneLine': isSmallClassOneLine,
    }"
  >
    <transition name="fade">
      <img v-show="AIImgShow" class="AI_img" :src="AIImg">
    </transition>

    <MenuFilter
      @changeBigClasses="changeBigClasses"
      @changeSmallClasses="changeSmallClasses"
      @changeCustomClasses="changeCustomClasses">
    </MenuFilter>
    <Btns
      v-if="posFastFood.isShowFastInputNum == '1' && posFastFood.isNetWeight == '0'"
      @changeAddNum = "changeAddNum"
      :isClearActive="addBeforeNum.length == 0 ? true : false">
    </Btns>
    <ShowWeight
      v-if="posFastFood.isNetWeight == '1'"
      ref="showWeight"
      :newWeightData="newWeightData"
      :weightUtilText="weightUtilText"
      @isNewWeightOpenFun="isNewWeightOpenFun"
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
    >

      <button type="button"
        slot-scope="props"
        :class="{
          'isSellout': props.item.isSellout && !props.item.enableMutiSize,
          'hasCount': props.item.count,
          'active': props.item.id == (newAddItem ? newAddItem.id : false),
          'small-height-btn':toggleHeight == 64
        }"
        @click="add(props.item,'','click')"
      >
        <span style="display:none"> {{ vipPromotionHandle(props) }} </span>
        <span v-if="props.item.isSellout && !props.item.enableMutiSize"
        class="itemSellout">{{ $t('Dict.Sellout') }}</span>
        <!-- 限量的显示有可能为负数 条件: 后台设置 允许单品限量为0时继续加单 -->
        <span v-if="!props.item.isSellout && (props.item.limit || props.item.limit == 0) && !props.item.enableMutiSize" class="itemLimit">
          {{ $t('Dict.LimitNum', [props.item.limit]) }}
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
        >
          {{ props.item.name }}
        </strong>
        <ul>
          <li>{{ props.item.isPackage ? pkgStr[props.item.pkgType] : '' }}</li>
          <li>
            <span v-if="props.item.discFlg ===  4" class="promotion-sale">
              <!-- 促 -->
              <em class="promotion-flag">{{ $t('Dict.Promotion') }}</em>
              <span>{{ props.item.price }} <del>{{ props.item.salePrice }}</del>/{{ props.item.unitName }}</span>
            </span>
            <span v-else>{{ props.item.price }}/{{ props.item.unitName }}</span>
          </li>
        </ul>
        <span v-if="props.item._num" class="count">x{{ props.item._num }}</span>
      </button>
    </Paging>
    <div class="pos-order-menu-control">
      <Search
        v-if="+getVuexPosMode === 3 && !posFastFood.isEnableSushiExpress"
        ref="menuSearch"
        @search="onSearch"
        @enter="enterSearch"
        :defaultKeyBoardPage="defaultKeyBoardPage"
        :shouldSetHotKey="shouldSetHotKey"
        :showPanel="showPanel"
        :placeholderText="placeholderText"
        searchId="searchMenus"
        :resultLength="menus.length"
      >
        <div class="btn-wrap" slot="model" ref="modelPanel">
          <el-button type="default" @click="toggleModelPanel">
            {{currentModelText}}
            <i :class="ShowModelPanel ? 'el-icon-caret-top' : 'el-icon-caret-bottom'"></i>
          </el-button>
          <div class="model-panel" v-show="ShowModelPanel">
            <button :class="model === 1 ? 'active' : ''" @click="chooseCurrentModel(1)">{{ $t('Biz.Order.Vague') }}</button>
            <button :class="model === 2 ? 'active' : ''" @click="chooseCurrentModel(2)">{{ $t('Biz.Order.Accurate') }}</button>
            <button :class="model === 3 ? 'active' : ''" @click="chooseCurrentModel(3)">{{$t('Biz.Order.ChineseChar')}}</button>
          </div>
        </div>
        <img slot="AI_img" v-show="AIImg" class="AI_img_small" :src="AIImg" alt="" @click="AIImgShow=!AIImgShow"/>
      </Search>
      <Search
        v-if="+getVuexPosMode === 3 && posFastFood.isEnableSushiExpress"
        ref="bsCodeSearch"
        :defaultKeyBoardPage="defaultKeyBoardPage"
        @search="onBillBsCode"
        @enter="enterSearch"
        :shouldSetHotKey="shouldSetHotKey"
        :placeholderText="$t('Biz.Order.QuickReadList')"
        hotkeymodulename="Pos.fastFood"
        searchId="searchBsCode"
        >
      </Search>
      <button
        class="add-temp-item"
        @click="openItemTemp"
        v-if="posItemTempSmallClasses.length" id="tempItemBtn"
        :disabled="!tempItemModuleAuth"
        :style="{cursor:(tempItemModuleAuth ? '':'not-allowed')}">
        <i class="icon icon-clock"></i>
        <!-- 临时品项 -->
        {{ $t('Dict.TemporaryItems') }}
      </button>
      <PagingBtn
        :paging="$refs.menuList"
        :showInfo="true"
        arrowDirection="up-down"
        class="pos-order-tables-pager"
      ></PagingBtn>
    </div>
    <ItemSize
      ref="itemSize"
      @choiceSize="addSize"
      :areaType ="areaType"
      type="fastfoodMenu"
      submitId="fastfoodMenuModifyItemSize">
    </ItemSize>
    <PackageNormal
      ref="PackageNormal"
      type="fastfoodMenuPackageNormal"
      :areaType ="areaType"
      submitId="fastFoodMenuPackageNormal">
    </PackageNormal>
    <PackagePart ref="PackagePart" :areaType ="areaType" type="fastFoodMenuPackagePart" submitId="fastfoodMenuPackagePart"></PackagePart>
    <ItemTemp ref="itemTemp" testId="orderingMenuList" :showComfirmWeight=true></ItemTemp>
    <ShowWeightModel ref="showWeightModel" :newWeightData="newWeightData" :weightUtilText="weightUtilText"></ShowWeightModel>
        <!-- '检测到未结算的账单,是否需要合并付款?','确认信息' -->
    <!-- <el-dialog
      title="确认信息"
      :visible.sync="dialogVisible"
      width="200px"
      :before-close="handleClose">
      <span>检测到未结算的账单,是否需要合并付款?</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog> -->
  </div>
</template>

<script>
import {
  mapState, mapGetters, mapActions, mapMutations,
} from 'vuex';
import {
  map, extend, indexOf, find, groupBy, reduce, cloneDeep, sortBy,
} from 'lodash';
import axios from 'axios';
import { MessageBox } from 'element-ui';
import md5 from 'js-md5';
import i18n from '@/locales/index';
import * as menuDictionary from '@/common/dictionary/pos-order-menu-dictionary';
import { add, sub } from '@/common/js/math';
import Search from '@/components/Pos/Order/Tables/Search';
import Paging from '@/components/Pos/Common/Paging';
import PagingBtn from '@/components/Pos/Common/PagingBtn';
import ajax from '@/common/js/ajax';
import LoadScaleMixin from '@/components/Pos/Common/LoadScaleMixin';
import quickSearch from '@/common/js/quicksearch';
import dateFormat from '@/common/js/dateformat';
import newWeightUnitConversion from '@/common/js/newWeightUnitConversion';
import ShowWeight from './ShowWeight';
import Btns from './Btns';
import MenuFilter from './Filter';

const { Base64 } = require('js-base64');
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
      default() {
        return [];
      },
    },
    areaType: {
      type: Number,
      default: 0,
    },
  },
  components: {
    MenuFilter, Btns, Search, Paging, PagingBtn, ItemSize, PackageNormal, PackagePart, ItemTemp, ShowWeight, ShowWeightModel,
  },
  data() {
    return {
      bDown: false,
      AIImg: '',
      AIImgShow: false,
      // '(常规)', '(宴会)', '(临时)'
      pkgStr: [`(${this.$t('Biz.Order.Routine')})`, `(${this.$t('Biz.Order.Banquet')})`, `(${this.$t('Biz.Order.Temporary01')})`],
      // 选中的大类列表，空代表全选
      bigClassesFilter: '',
      // 选中的小类列表，空代表全选
      smallClassesFilter: '',
      // 选中的自定义列表，空代表全选
      customClassesFilter: '',
      // 快速查找文字
      searchText: '',
      searchBsCode: '',
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
      newWeightData: {}, // 电子秤实时返回的数据
      showPanel: true, // 只在当前页弹出手写板
      activeItemSizeId: '', // 扫码添加多规格品项时的id
      activeItemSize: '', //  扫码添加多规格品项时的数组
      saoMaBsId: null, // 扫码的账单bsId,用来读取挂单的
      isAllNumber: false, // 搜索框是不是全数字
      // defaultKeyBoardType: 'letter', // 加单页面的软键盘设置类型
      defaultKeyBoardPage: 4, // 是加单还是客位页面设置的软键盘
      shouldSetHotKey: 1, // Search组件设置enter热键 1设置快餐的 2设置中餐 0不设置
      ShowModelPanel: false, // 是否弹出搜索模式的面板
      currentModelText: this.$t('Biz.Order.Vague'), // 当前搜索模式text
      isDomemberPrice: null, // 会员信息并且执行会员价
    };
  },
  created() {
    this.$von('setMemberInfo', (data) => {
      this.isDomemberPrice = data;
    });
    this.$von('fastfoodMenuClearSearchText', () => {
      this.searchText = '';
      this.$refs.menuSearch && this.$refs.menuSearch.clearSearchText();
    }); // 清空所搜框的助记符
    this.$von('fastfoodAddTableSearchTextdInBlur', (key) => {
      this.$refs.menuSearch && this.$refs.menuSearch.addWordInBlur(key);
      this.$refs.bsCodeSearch && this.$refs.bsCodeSearch.addWordInBlur(key);
    }); // 所搜框的文本所搜
    this.$von('fastfoodDelTableSearchTextdInBlur', () => {
      this.$refs.menuSearch && this.$refs.menuSearch.delWordInBlur();
      this.$refs.bsCodeSearch && this.$refs.bsCodeSearch.delWordInBlur();
    });
    this.$von('fastfoodMenuListInitPager', (isEnableAIAddorder) => { // 快餐入口文件加载时添加参数->loadedMenu 为true时走AI图片识别
      if (isEnableAIAddorder) { // 左侧数据为空&&AI开启-触发-开关打开
        this.clearTimerImgDetect();
        if (this.guestList.length === 0) { // 左侧无数据，每2s拉取一次摄像头数据,加单成功后需清除定时器
          this.setTimerImgDetect(this.getImgDetect, 2000);
        } else {
          this.getImgDetect();
        }
      }
      this.$refs.menuList && this.$refs.menuList.refresh();
    });
    // backspace键
    this.$von('fastfoodMenuSelect', (direction) => {
      this.$refs.menuList && this.$refs.menuList.select(direction);
    }); // 上下左右的快捷键
    // // 电子秤
    this.isNewWeightOpenFun();
    this.$von('fastFoodAutoWeight', () => {
      // 电子秤
      this.isNewWeightOpenFun();
    });
  },
  mounted() {
    // 记录渲染后的菜单列表数据 备注：mounted钩子里拿Vuex数据
    this.$von('fastfoodInitActiveItem', () => {
      // 初始下被选中的品项样式
      this.activeFirstItem();
    });
    // 回车键盘事件触发下点菜事件 如果开启扫码读单的时候要判断不能走回车加单
    // this.$vonce('fastfoodMenuAddActiveItem', () => {
    //   this.enterSearch()
    // });
    this.checkModel();
    // 精准模式下清除默认选中的品项
    const { searchMode } = this.posSettings;
    if (+searchMode === 2) {
      this.newAddItem = null;
    }
    // 点击空白处 自动隐藏搜索模式面板
    window.addEventListener('click', this.hidePanel);
  },
  destroyed() {
    window.removeEventListener('click', this.hidePanel);
  },
  computed: {
    ...mapGetters([
      'posBaseInfo',
      'setting',
      'getDialog',
      'eTagItems',
      'itemsMoreBarcode',
      'createItemBarCodeObj',
      'isItemMoreBarcode',
      'posItems',
      'getVuexItemSelloutsMap',
      'getVuexPosMode',
      'getVuexItemLimitsMap',
      'getVuexitemTimePricesMap',
      'posSettings',
      'posItemCustomClasses',
      'posDevice',
      'posItemTempSmallClasses',
      'getFastFoodBillData',
      'posFastFood',
      'getselectDiscountPlanData',
      'posBaseInfo',
      'tempItemModuleAuth',
      'haveLimitSmallClasses',
      'getActiveOrderItemSmClsTotal',
      'getVuexPromoteItemLimitsMap',
    ]),
    isSmallClassOneLine() {
      return this.posSettings.isOnlyShowSmallClass && this.posSettings.isSingleLineDisplayForSmallClassAndCustomClass;
    },
    AIurl() {
      return this.posBaseInfo.enableAIParams.enableAIAddorderDev;
    },
    weightUtilText() {
      //     "Kilogram": "公斤",
    // "Jin": "斤",
    // "Gram": "克"
      switch (this.setting.POSWeighingUnit) {
        case 0:
          return this.$t('Dict.Kilogram');
        case 1:
          return this.$t('Dict.Jin');
        default:
          return this.$t('Dict.Gram');
      }
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
          menu.limit = null;
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
    isNetWeightOrFastInputNum() {
      return (this.posFastFood.isShowFastInputNum == '1' && this.posFastFood.isNetWeight == '0') || this.posFastFood.isNetWeight == '1';
    },
    menu() {
      const menus = this.renderMenuData(this.posItems);
      // 这是时价变动和新增的数据集
      const modifyTimePriceData = this.getVuexitemTimePricesMap.modifyItemList || {};
      // 这个时间是删除的数据集
      const deleteTimePriceData = this.getVuexitemTimePricesMap.deleteItemList || {};
      // 估清限量的实时样式显示
      menus.forEach((menuItem) => {
        const menu = menuItem;
        this.$set(menu, 'isSellout', false);
        // this.$set(menu, 'isItemTimePrice', false); //
        // 根据品项的id和规格拼接的id来查找下对应的品项数据
        const limitData = this.getVuexItemLimitsMap[`${menu.id}_${menu.sizeId}`];
        const isSelloutData = this.getVuexItemSelloutsMap[`${menu.id}_${menu.sizeId}`];
        // 执行时价的逻辑
        this.setItmePrice(menu, true, modifyTimePriceData[`${menu.id}_${menu.sizeId}`]);
        this.setItmePrice(menu, false, deleteTimePriceData[`${menu.id}_${menu.sizeId}`]);
        if (limitData) {
          // menu.limit = sub(limitData.limitQuantity, limitData.salesQuantity);
          // menu.limit = limitData.restQuantity;
          this.$set(menu, 'limit', limitData.restQuantity);
          // this.$set(menu,'limit',sub(menu.limitQuantity, menu.salesQuantity))
        }
        // else {
        //   this.$set(menu, 'limit', limitData);
        // }
        // 估清的1或者0都是已估清
        if (isSelloutData === 1 || isSelloutData === 0 || isSelloutData === 2) {
          this.$set(menu, 'isSellout', true);
        }
        // other_price1
        // 从这添加区域不同价格 判断价格type在取对应的值
        // isItemTimePrice 这个字段是判断品项是否是时价菜是就不走区域价格
        // 时价权大于时价 还有判断是否有促销的价格 促销价> 会员价 > 时价 > 销售价格

        (+menu.discFlg) !== 4
        && !menu.isItemTimePrice
        && (+this.areaType) !== 0
        && this.areaType
        && JSON.stringify(menu.otherPrice) != '{}'
        && function () {
          if (menu.otherPrice[`${this.areaType}`] || menu.otherPrice[`${this.areaType}`] == 0) {
            menu.price = menu.otherPrice[`${this.areaType}`];
            menu.salePrice = menu.otherPrice[`${this.areaType}`];
          }
        }.bind(this)();
      });
      return menus;
    },
    numList() {
      return map(groupBy(this.guestList, 'id'), (list, key) => ({
        id: key,
        num: reduce(list, (sum, n) => add(sum, n.num), 0),
      }));
    },
    menus() {
      return cloneDeep(this.menu.filter(item => this.checkFilter(item)));
    },
  },
  watch: {
    eTagItems(data, oldData) {
      if (this.posBaseInfo.isEnableYiPan) {
        // 取易盘的前后数组的差集
        let xorEasylist = _.xorBy(data, oldData, 'TagID');
        // 第一次进来进行排序
        if (data.length > 0 && oldData.length === 0) {
          xorEasylist = sortBy(xorEasylist, 'ItemID');
        }
        xorEasylist.forEach((item) => {
          // 从当前账单去找易盘的菜，如果存在执行删除，如果不存在执行添加
          const addItem = this.guestList.find(item1 => item1.TagID == item.TagID);
          if (addItem) {
            // 删除易盘添加的菜
          //  this.guestList.splice(_.indexOf(this.guestList, addItem), 1);
            if (!this.getDialog.length) {
              setTimeout(() => {
                this.$vemit('fastFoodEasyDelete', addItem);
              }, 0);
            }
          } else if (data.length >= oldData.length) {
            // 添加易盘添加的菜
            const newItem = _.cloneDeep(this.menu.find((item1) => {
              const isFindItem = item.ItemID === item1.aidCode;
              if (item1.enableMutiSize) {
                return isFindItem && item1.isDefault;
              }
              return isFindItem;
            }));
            if (newItem) {
              newItem.TagID = item.TagID;
              // 易盘卡标记的数量
              if (item.ItemCnt === '00') { // 00 为半份
                newItem.TagNum = 0.5;
              } else {
                newItem.TagNum = parseInt(item.ItemCnt);
              }
              if (!this.getDialog.length) {
                this.add(newItem, 'precision');
              }
            } else {
              // "AddOrderErrorMsg06": "找不到该品项，请核实该菜品是否已在品项档案删除、未标菜或默认规格不在销售方案",
              this.$message.error(this.$t('Biz.Order.AddOrderErrorMsg06'));
            }
          }
        });
      }
    },
    toggleHeight(data) {
      if (data === 64) {
        this.$refs.menuList.refresh();
      }
    },
    isNetWeightOrFastInputNum(data) {
      this.$refs.menuList.refresh();
    },
    $route(to, from) {
      if (to.path === '/pos/fastFood') {
        this.checkModel();
        // 电子秤
        this.isNewWeightOpenFun();
      } else {
        this.$devices.Handwriting.close();
      }
    },
    getVuexPosMode(newVal, oldVal) {
      const { searchMode } = this.posSettings;
      if (+searchMode === 2) {
        this.newAddItem = null;
      }
    },
    'posSettings.searchMode': {
      handler() {
        this.checkModel();
      },
      deep: true,
    },
  },
  methods: {
    AIAxios(url, enableAIType, pubMM = '') { // 失败时--统一处理 清除定时器错误提示
      this.bDown = true;
      return new Promise((resolve) => {
        // if (pubMM) { // 悠络客添加鉴权
        //   axios.defaults.headers.Authorization = `Basic ${pubMM}`;
        //   axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        // }
        axios.get(url).then((res) => {
          this.bDown = false;
          if ((enableAIType === 1 && res.data.status === 200)
          || (enableAIType === 2 && res.data.code === '1')) {
            resolve(res.data);
          } else {
            this.clearTimerImgDetect();
            if (enableAIType === 1) this.$message.error(i18n.t(`Biz.AIErrMsg[${res.data.status}]`));
            if (enableAIType === 2) this.$message.error(res.data.msg);
          }
        }).catch(() => {
          this.clearTimerImgDetect();
          this.bDown = false;
          this.$message.error(i18n.t('Dict.AjaxMessage.Message6'));
        });
      });
    },
    AI_KJ(imgData) {
      // imgData.data = [{ // 测试数据
      //   sku_code: '4004', // 产品编码
      //   sku_name: '香草奥尔良烤翅xxx', // 产品名称
      //   count: 2, // 识别数量
      //   weight: '100', // 产品标准重量
      // }];
      if (imgData.data.length === 0) return false; // 无数据
      // 匹配数据，并添加数据-加单
      const temp = [];
      imgData.data.forEach((imgItem) => {
        if (this.menus.length === 0) return;
        const itemSelected = this.menus.filter(item => item.code === imgItem.sku_code)[0];
        if (itemSelected) {
          this.$set(itemSelected, 'num', imgItem.count); // 数量
          this.$set(itemSelected, 'isAIAddorder', this.posBaseInfo.isEnableAIAddorder); // 添加属性标记-AI图像加单
          this.add(itemSelected); // 加单操作
        } else {
          temp.push(imgItem.sku_name);
        }
      });
      if (temp.length > 0) { // 未匹配到提示 并清空定时器
        this.clearTimerImgDetect();
        this.$message.error(`未匹配 : ${temp.join(' , ')}`);
      }
      if (imgData.img_path) this.AIDdownloadIMG(imgData.img_path, 1); // 图片展示
    },
    AI_YLK(imgData) {
      // imgData.data.dishes = [{ // 测试数据
      //   number: '003006', // 产品编码
      //   title: '中国大对虾', // 产品名称
      //   handle_status: 2, //
      //   amount: '100', //
      // }];
      if (imgData.data.dishes && imgData.data.dishes.length === 0) return false; // 无数据
      // 匹配数据，并添加数据-加单
      const temp = [];
      imgData.data.dishes.forEach((imgItem) => {
        if (this.menus.length === 0) return;
        const itemSelected = this.menus.filter(item => item.code === imgItem.number)[0];
        if (itemSelected) {
          this.$set(itemSelected, 'num', 1); // 数量默认为1
          this.$set(itemSelected, 'isAIAddorder', this.posBaseInfo.isEnableAIAddorder); // 添加属性标记-AI图像加单
          this.add(itemSelected); // 加单操作
        } else {
          temp.push(imgItem.title);
        }
      });
      if (temp.length > 0) { // 未匹配到提示 并清空定时器
        this.clearTimerImgDetect();
        this.$message.error(`未匹配 : ${temp.join(' , ')}`);
      }
      if (imgData.data && imgData.data.url) this.AIDdownloadIMG(imgData.data.url); // 图片展示
    },
    async getImgDetect() { // AI图像识别系统接口
      if (!this.posBaseInfo.isEnableAIAddorder || this.bDown) return false;
      const AIParams = this.posBaseInfo.enableAIParams;
      if (this.posBaseInfo.enableAIType === 1) { // 凯景
        const url = `${this.AIurl}/getImgDetect?ip=${AIParams.enableAIAddorderCamera}`;
        const imgData = await this.AIAxios(url, this.posBaseInfo.enableAIType);
        this.AI_KJ(imgData);
      } else if (this.posBaseInfo.enableAIType === 2) { // 悠络客
        const url = AIParams.enableAIUlkAddorderDev; // url '/h/KgOfl/dishes/enable'
        // let params = `device_id=${AIParams.enableAIUlkAddorderSN}&channle_id=${AIParams.enableAIUlkAddorderChannel}`;
        // let ylkData = { appid: '10397', secret: '013019b1a8ca0114a542' };
        // let pubMM = Base64.encode(ylkData.appid + ":" + md5(ylkData.secret + ylkData.appid + url + params)); // 生成公钥
        const urlUlk = `${process.env.API_PATH}/canyin/pos/addorder/getaiulkaddorderinfo?enableAIUlkAddorderDev=${url}&enableAIUlkAddorderSN=${AIParams.enableAIUlkAddorderSN}&enableAIUlkAddorderChannel=${AIParams.enableAIUlkAddorderChannel}`;
        const imgData = await this.AIAxios(urlUlk, this.posBaseInfo.enableAIType);
        this.AI_YLK(imgData);
      }
    },
    AIDdownloadIMG(path, type = 0) {
      this.AIImg = path;
      if (type === 1) this.AIImg = `${this.AIurl}/DownloadIMG?img_path=${path}`; // 凯景
      this.AIImgShow = true;
      setTimeout(() => {
        this.AIImgShow = false;
      }, 3000);
    },
    // 会员专享促销价格匹配
    vipPromotionHandle(props) {
      // 如果验证了会员 需要匹配下会员专享 促销价
      const promoteLimitData = this.getVuexPromoteItemLimitsMap[`${props.item.id}_${props.item.sizeId}_${props.item.promotePlanId}`];
      // 如果 满足促销量 不是会员专享的  是会员专享验证了会员才走会员专享的促销价格
      // 存在 每日限量和不存在每日限量
      // 存在每日限量
      if (((promoteLimitData
        && promoteLimitData.restQuantity > 0
        && (!promoteLimitData.isMemberExclusive || (this.isDomemberPrice && promoteLimitData.isMemberExclusive)))
        || (props.item.isMemberExclusive && this.isDomemberPrice))
        && (props.item.copyPromotePrice || props.item.copyPromotePrice === 0)
      ) {
        // 满足了 回显促销条件显示 促销
        if (props.item.discFlg !== 4) {
          props.item.discFlg = 4;
          props.item.priceType = 3;
          props.item.defaultPriceType = 3;
          props.item.promotePrice = props.item.copyPromotePrice;
          props.item.price = props.item.copyPromotePrice;
        }
      }
      // 不满足条件 不显示促销价
      if (
        (promoteLimitData && (promoteLimitData.restQuantity <= 0 || (promoteLimitData.isMemberExclusive && !this.isDomemberPrice)))
        || (props.item.isMemberExclusive && !this.isDomemberPrice)
      ) {
        if (props.item.discFlg === 4) {
          props.item.discFlg = 0;
          props.item.priceType = 1;
          props.item.defaultPriceType = 1;
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
    ...mapActions('fastFood', ['getSizeData']),
    ...mapMutations({
      setTimerImgDetect: 'setTimerImgDetect', // AI图像识别-开启定时器
      clearTimerImgDetect: 'clearTimerImgDetect', // AI图像识别-清除定时器
      setLimitsMap: 'SET_ITEMLIMITSMAP',
      setItemsMoreBarCode: 'SET_ITEMSMOREBARCODE',
      setItemsMoreBarCodeSingle: 'SET_ITEMSMOREBARCODE_SINGLE',
    }),
    // 执行扫码读取挂断操作
    async searchBsCodeDoDesignate(bsId) {
      this.saoMaBsId = bsId;
      if (this.getFastFoodBillData.bsData.id == bsId) {
        // 同一笔营业流水不允许重复读取挂单
        this.$message.error(this.$t('Biz.Order.ReadListErrorMsg'));
        // this.$refs.bsCodeSearch && this.$refs.bsCodeSearch.clearSearchText()
        return;
      }
      // this.dialogVisible = true
      // 判断当前是否已存在一笔未加单和未计算的账单,如果存在就提示,不存在直接读取挂单
      if (this.guestList.length) {
        // 争鲜不允许改变账单金额
        if (this.posFastFood.isForbiddenEditBillAmount) {
          const { state } = await ajax('canyin.pos.bill.getbsinfo', {
            contentType: 'URLEncoded',
            data: {
              bsId,
            },
          });
          if (state === 4) {
            this.doBsCodeisForbiddenEditBill(bsId);
          } else {
            // 该流水不是挂单状态
            this.$message.error(this.$t('Biz.Order.ReadListErrorMsg01'));
          }
        } else {
          this.doBsCodeisDoAdd(bsId);
        }
        // MessageBox.alert('网络异常，请检查网络或服务是否启动', '系统错误')
      } else {
        this.doDesignate(bsId);
      }
    },
    // 争鲜模式不允许加单的话走的逻辑
    doBsCodeisForbiddenEditBill(bsId) {
      //  ReadListConfirm 检测到未结算的账单,是否需要合并付款?
      // "CombinedPayment": "合并付款",
      // "RegisterAndRead": "将当前账单挂单并读取下一单"
      this.$confirm(this.$t('Biz.Order.ReadListConfirm'), this.$t('Dict.Tips'), {
        distinguishCancelAndClose: true,
        confirmButtonText: this.$t('Biz.Order.CombinedPayment'),
        cancelButtonText: this.$t('Biz.Order.RegisterAndRead'),
      })
        .then((action) => {
        // 合并账单
          this.mergePayment(bsId);
        })
        .catch((action) => {
        // 清空searchText 搜索内容
          action === 'close' && (this.$refs.bsCodeSearch && this.$refs.bsCodeSearch.clearSearchText());
          // 执行挂单成功后执行读单
          action === 'cancel' && this.$emit('designates', this.doDesignate);
        // action ==='close' && this.$emit('designates',this.doDesignate)
        });
    },
    // 争鲜模式允许加单的话走的逻辑
    // "ListTipsText": "当前账单会自动执行挂单，是否继续操作？",
    doBsCodeisDoAdd(bsId) {
      this.$confirm(this.$t('Biz.Order.ListTipsText'), this.$t('Dict.Tips'), {
        confirmButtonText: this.$t('Dict.Sure'),
        cancelButtonText: this.$t('Dict.Cancel'),
        type: 'warning',
      })
        .then(() => {
          // 将当前账单挂单并读取下一单
          this.$emit('designates', this.doDesignate);
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('Dict.OperationCancelled'), // "CanceledOperation": "已取消操作",
          });
        });
    },
    // 争鲜读取挂单如果当前存在未结和加单状态的账单在读取的时候如果选择了合并,那么就合并账单
    mergePayment(bsId) {
      if (this.getFastFoodBillData.bsData.id == bsId) {
        // "CombinedAlertText": "相同的营业流水,无法合并付款",
        MessageBox.alert(this.$t('Biz.Order.CombinedAlertText'), this.$t('Dict.Tips'));
        return;
      }
      ajax('canyin.pos.designates.mergepayment', {
        contentType: 'paramsEncoded',
        data: {
          bsId: this.getFastFoodBillData.bsData.id,
          fromBsId: bsId,
        },
      }).then((res) => {
        // 成功后更新下营业流水账单
        this.$vemit('fastFoodLoadBs', {
          buffetPointId: this.posFastFood.buffetPointId,
        });
        // 清空下快速读取的searchText
        this.$refs.bsCodeSearch && this.$refs.bsCodeSearch.clearSearchText();
        //  CombinedSuccessMsg = 合并账单成功
        this.$message.success(this.$t('Biz.Order.CombinedSuccessMsg'));
        // 进行刷下账单
      });
    },
    // 读取挂单接口
    doDesignate(bsId) {
      ajax('canyin.pos.designatesreturnpoint.returnpointandsettle', {
        contentType: 'paramsEncoded',
        data: {
          bsId: bsId || this.saoMaBsId,
          pointId: this.posFastFood.buffetPointId,
          controlMode: '3',
        },
      }).then((res) => {
        if (res.success) {
          // 成功后更新下营业流水账单
          this.$vemit('fastFoodLoadBs', {
            buffetPointId: this.posFastFood.buffetPointId,
          });
          // SuccessReadListMsg= 读取挂单成功
          this.$message.success(this.$t('Biz.Order.SuccessReadListMsg'));
        } else {
          MessageBox.alert(res.msg, this.$t('Dict.WrongInfo'));
        }
        // 清空下快速读取的searchText
        this.$refs.bsCodeSearch && this.$refs.bsCodeSearch.clearSearchText();
      }).catch((error) => {
        console.log(error);
      });
    },
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
        if (+searchMode === 3) {
          const e = document.createEvent('MouseEvents');
          const obj = this.$refs.menuSearch ? this.$refs.menuSearch.$el.getElementsByTagName('input')[0] : null;
          e.initEvent('click', false, false);
          obj && (() => {
            obj.dispatchEvent(e);
            obj.blur();
            setTimeout(() => {
              // 如果是安卓则不自动聚焦，原因是等待聚焦的时间太长
              if (!browser.isAndroid() && !browser.isIPad()) {
                obj.focus();
              }
            }, 2000);
          })();
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
        menu.limit = null;
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
      if (isItemMoreBarcode) { // 后台是否开启了多条码 如果开启从itemsMoreBarcode里找品项
        itemIndex = createItemBarCodeObj[searchText];
        if (itemIndex || +itemIndex === 0) {
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
        const exp = /20[0-9]{11}/g; // 匹配2开头 13位的编码
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
      // 'enter+重复添加,不加单'
        return;
      }

      if (
        (+searchMode === 2 && searchText.length > 0)
        || (isAllowDarkScan && isAllNumber)) { // 开启模糊扫码 并且输入的都是数字走精确，如果不全是数字走模糊
        // 是否是称重条码品项
        const result = this.judgeIsWeighedItem(searchText);
        if (result) {
          const queueList = this.scanWeightCode(result);
          if (queueList && queueList.length > 0) {
            queueList.map((item) => {
              this.add(item, 'precision');
            });
            // 如果没匹配到 如果开启了自动清空注记符，已清空下搜索框
          } else if (this.posSettings.isAutoClearKey) {
            this.$vemit('clearSearchText');
          }
        } else {
          this.precision();
        }
      } else {
        // 如果有搜索的回车加单
        if (this.newAddItem) {
          this.menus.map((item) => {
            if (item.id === this.newAddItem.id) {
              this.newAddItem = item;
            }
          });
          this.add(this.newAddItem);
        } else {
          // 如果没匹配到 如果开启了自动清空注记符，已清空下搜索框
          if (this.posSettings.isAutoClearKey) {
            this.$vemit('clearSearchText');
          }
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
      const menu = map(menuData, item => extend({}, menuItem, item));
      return menu;
    },
    // 加单前的数量选择
    changeAddNum(num) {
      // typeof(num)
      let numn = '';
      typeof (num) === 'number' && this.addBeforeNum.push(num);
      typeof (num) === 'string' && this.addBeforeNum.splice((this.addBeforeNum.length - 1), 1);
      this.addBeforeNum.forEach((_) => {
        numn = numn.concat(_);
      });
      this.$log.info(`加单前快速选择数量：${numn}`);
      if (numn != '' && numn > 9) {
        if (numn > 100) {
          this.addBeforeNum = [];
          this.addBeforeNum = [1, 0, 0];
          // "Max100Current100": "数量上限为100,当前数量是100"
          this.$message.warning(this.$t('Biz.Order.Max100Current100'));
        } else {
          // "CheckedNum": "已选数量为：",

          this.$message.warning(this.$t('Biz.Order.CheckedNum', [numn]));
        }
      } else if (typeof (num) === 'string' && numn > 0) {
        // "UpdatedNum": "已修改数量为"
        this.$message.warning(this.$t('Biz.Order.UpdatedNum', [numn]));
      }
    },
    // 每次跳转过来需要清空下数组 addBeforeNum (是快速加单的数字按钮的点击集合)
    clearAddBeforeNum() {
      this.addBeforeNum.splice(0, this.addBeforeNum.length - 1);
      this.$log.info('清除加单前选择的数量');
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
      this.$log.info(`加单前快速选择数量：${numn}`);
      return numn === '' ? false : parseInt(numn);
    },
    conutTotal(id) {
      const newArr = this.guestList.filter(v => (`${v.id}_${v.sizeId}`) == id);
      return newArr.reduce((sum, n) => (sum + n.num), 0);
    },
    // 打包盒专用
    packingBoxFn(item) {
      const items = this.menus.find(v => v.realItemId == item.btnId);
      if (items) {
        this.add(items);
      } else {
        // "TheItemNotExist": "该品项不存在"
        this.$message.error(this.$t('Biz.Order.TheItemNotExist'));
      }
    },
    // 菜单品项点击事件 item品项数据，searchType搜索模式（模糊=''，精准='precision'，汉字=''），eventType触发add的方式，扫码回车加eventType=''，点击添加为'click'
    async add(item2, searchType = '', eventType) {
      let item = cloneDeep(item2);
      this.$log.info(`菜品点击的code：${item.code}`);
      const self = this;
      const nums = this.conutTotal(`${item.id}_${item.sizeId}`);
      // 如果打折活动方案存在的时候不能进行处理
      if (this.getSelectDiscountPlanData) {
        // CancelDiscountMsg 请先取消打折活动方案:
        this.$message.warning(`${this.$t('Biz.Order.CancelDiscountMsg')}${this.getSelectDiscountPlanData.discountPlanName}`);
        return;
      }
      if (!item.num) item.num = 1; // 手动点击 item的num为undefined 所以给它一个默认值1
      // 如果是估清的品项 - "品项已估清不能使用"
      if (!item.enableMutiSize && item.isSellout) {
        this.$message.error(this.$t('Biz.Order.AddOrderIsSellout'));
        return;
      }
      // 精准模式搜索下品项没有下面的key，需要手动添加
      // 如果精准搜索过来的 不限制是不是多规格品项  因为精准摸模式下的items都是拆分开的  不存在多规格的情况
      if (searchType === 'precision') {
        if (item.isSellout) {
          this.$message.error(this.$t('Biz.Order.AddOrderIsSellout'));
          return;
        }
        if (!item.sizeId) this.$set(item, 'sizeId', item.itemSizeId);
        if (!item.id) this.$set(item, 'id', item.realItemId);
        if (!item.count) this.$set(item, 'count', 0);
      }
      // 使用数字按钮快速加单
      const addNum = this.changeAddBeforeNum();
      if (typeof (addNum) === 'number' && addNum === 0) {
        this.$message.error(this.$t('Biz.Order.AddCannotBe0')); // 加单的数量不能为0
        return;
      }
      // 使用数字按钮快速加单排除易盘和AI加单
      if (addNum && !(item.TagID || item.isAIAddorder)) {
        // 套餐就提示-"套餐不支持快速录入品项数量键盘"
        if (item.isPackage) {
          this.$message.error(this.$t('Biz.Order.AddOrderErrorMsg07'));
          return;
        }
        // 存在并添加个属性为num
        this.$set(item, 'num', addNum);
        // 添加个标识为以后的判断是否是快速加单进来的,需要进行拆分处理为打折做下铺垫
        this.$set(item, 'fastAddNum', true);
      }
      // 易盘数量
      if (item.TagNum) this.$set(item, 'num', item.TagNum);
      this.newAddItem = item;

      // 根据后台设置加单数量是否能多于限量, 并且存在限量的情况而且不是多规格的才走以下逻辑
      if (!this.posSettings.isAllowAddOrderWhenLimitZero
          && !this.newAddItem.enableMutiSize
          && (this.newAddItem.limit || `${this.newAddItem.limit}` === '0')
      ) {
        const {
          count, limit, enableMutiSize, num,
        } = this.newAddItem;
        if (nums < limit) {
          if (limit - count > 0 && limit - nums < num) {
            if (item.TagNum) { // 如为易盘不加单
              this.$message.warning(this.$t('Biz.BizComm.BizCommTip14', [limit]));
              return;
            }
            this.newAddItem.num = limit - nums;
          } else {
            this.newAddItem.count += this.newAddItem.num;
          }
        } else {
          this.$message.warning(this.$t('Biz.Order.ExceedingTheLimit')); // 超过限量
          this.$vemit('clearSearchText');
          return;
        }
      }

      // 单数限制&限量 多规格有问题
      // nums = this.conutTotal(`${item.id}_${item.sizeId}`);
      // let limitAcountData = limitAcount({
      //   from: 'menuAdd', // 来源
      //   num: this.newAddItem.num, // 数量
      //   orderedNum: nums, // 已点该品项的数量
      //   minAddQty: this.newAddItem.minAddQty, // 最小值
      //   maxAddQty: this.newAddItem.maxAddQty, // 最大值
      //   limitNum: this.newAddItem.limit, // 限量数
      //   isAllow0: this.posSettings.isAllowAddOrderWhenLimitZero, // 允许限量为 0 时继续加单
      // });
      // if (!limitAcountData.tag) return;
      // this.newAddItem.num = limitAcountData.num;

      // 小类限定的拦截，判断当前所加的菜所属的小类是否存在限定并做下限定提示
      // console.log(this.getActiveOrderItemSmClsTotal(item.smallClassId));
      const limitSmallClsItemNum = this.haveLimitSmallClasses[item.smallClassId];
      if (limitSmallClsItemNum) {
        // 入库的当前菜对应的小类已点的总数
        // const orderItemSmClsTotal = this.getActiveOrderItemSmClsTotal(item.smallClassId);
        const orderingItemSmClsTotal = this.getActiveOrderItemSmClsTotal(item.smallClassId, this.guestList, 'num');
        if (limitSmallClsItemNum < add(orderingItemSmClsTotal, item.num)) {
          this.$message.error(`菜品所属小类限定数为${limitSmallClsItemNum}`);
          return;
        }
      }
      // 添加个品项类型
      this.$set(item, 'itemType', this.SUBMIT_ITEM_TYPE_NORMAL);
      // 添加个是否是自助类型
      // this.$set(item, 'isDinnerBuffet', this.posOrderBill.isDinnerBuffet);
      if (item.enableMutiSize) {
        let options = null;
        if (item.id) {
          options = {
            itemId: item.id, // 品项id
          };
        } else if (item.itemId) {
          const arr = item.itemId.split('_');
          options = {
            itemId: arr[0], // 大品项id
            itemSizeId: arr[1], // 小品项id
          };
        }
        if ((!item.promotePrice && item.promotePrice != 0) && !item.isItemTimePrice && item.areaType != 0
          && (item[`other_price${self.areaType}`] || item[`other_price${self.areaType}`] == 0)) {
          self.$set(item, 'std_price', item[`other_price${self.areaType}`]);
          self.$set(item, 'salePrice', item[`other_price${self.areaType}`]);
        }
        if (searchType === 'precision' && eventType !== 'click' || (this.posFastFood.addOrderMultiSpecification && item.isDefault)
         || (item.isDefault && item.TagID)) { // 精准模式下扫码回车不走接口
          const itemLimitsMap = cloneDeep(this.getVuexItemLimitsMap);
          if (!this.posSettings.isAllowAddOrderWhenLimitZero && this.getVuexItemLimitsMap[`${item.itemId}`]) {
            this.$set(item, 'restQuantity', this.getVuexItemLimitsMap[`${item.itemId}`].restQuantity);
            this.$set(item, 'isLimit', true);
            if (!item.sizeId) {
              this.$set(item, 'sizeId', item.itemSizeId);
            }
            if (!item.id) {
              this.$set(item, 'id', item.realItemId);
            }
            this.$set(item, 'limitTotal', this.getVuexItemLimitsMap[`${item.itemId}`].maxLimit);

            if (this.getVuexItemLimitsMap[`${item.itemId}`].restQuantity > 0 && this.getVuexItemLimitsMap[`${item.itemId}`].restQuantity < 1) {
              item.num = this.getVuexItemLimitsMap[`${item.itemId}`].restQuantity;
            }
            this.$vemit('fastFoodHandleAddMenuItem', item);
            if (this.getVuexItemLimitsMap[`${item.itemId}`].restQuantity < 0) {
              // "AddOrderWarnMsg02": "限量为",
              this.$message.warning(this.$t('Biz.BizComm.BizCommTip14', [item.limitTotal]));
              itemLimitsMap[`${item.itemId}`].restQuantity = 0;
              this.setLimitsMap(itemLimitsMap);
              return;
            }
          }
          this.$vemit('fastFoodPosOrderAddDish', { item, beforeAddNum: addNum });
        } else { // 模糊,汉字模式下走接口,请求规格接口获取数据
          // 接口请求改写
          // 给 item添加个 sizeList 可以用来对修改和缓存起来
          item.sizeList = await this.getSizeData(options);
          if (!item.sizeList.length || !item.sizeList) {
            this.$message.error('多规格数据不存在');
            return;
          }
          if (item.sizeList.length == 1) { // 如果只有一个规格 直接添加
            if (item.isSellout) {
              this.$message.error('此品项已估清不能使用');
              return;
            }
            this.$vemit('fastFoodPosOrderAddDish', { item, beforeAddNum: addNum });
            return;
          }
          const wyList = item.sizeList.map((item) => {
            if (this.getVuexItemLimitsMap[`${item.item_id}_${item.size_id}`]) {
              item.restQuantity = this.getVuexItemLimitsMap[`${item.item_id}_${item.size_id}`].restQuantity;
            }
            return item;
          });
          this.$refs.itemSize.open({ sizeList: wyList, item, totalNum: nums }, {
            submit: (itemSizeData) => {
              item = Object.assign({}, item, itemSizeData);// 合并
              this.$vemit('fastFoodPosOrderAddDish', { item, beforeAddNum: addNum });
            },
          });
          // ajax('canyin.pos.itemPkgAndSize.itemSize', { params: options })
          //   .then((res) => {
          //     if (!res.itemSizeList.length || !res.itemSizeList) {
          //       this.$message({
          //         type: 'error',
          //         message: '多规格数据不存在',
          //       });
          //       return;
          //     } if (res.itemSizeList.length == 1) { // 如果只有一个规格 直接添加
          //       // 给 item添加个sizeList 可以用来对修改和缓存起来
          //       if (item.isSellout) {
          //         this.$message.error('此品项已估清不能使用');
          //         return false;
          //       }
          //       item.sizeList = res.itemSizeList;
          //       this.$vemit('fastFoodPosOrderAddDish', { item, beforeAddNum: addNum });
          //       return;
          //     }
          //     // 给 item添加个sizeList 可以用来对修改和缓存起来
          //     const { itemSizeList } = res;
          //     item.sizeList = itemSizeList;
          //     const wyList = itemSizeList.map((item) => {
          //       if (this.getVuexItemLimitsMap[`${item.item_id}_${item.size_id}`]) {
          //         item.restQuantity = this.getVuexItemLimitsMap[`${item.item_id}_${item.size_id}`].restQuantity;
          //       }
          //       return item;
          //     });
          //     this.$refs.itemSize.open({ sizeList: wyList, item }, {
          //       submit: (itemSizeData) => {
          //         item = Object.assign({}, item, itemSizeData);// 合并
          //         this.$vemit('fastFoodPosOrderAddDish', { item, beforeAddNum: addNum });
          //       },
          //     });
          //   })
          //   .catch((error) => {
          //     this.$message({
          //       type: 'error',
          //       message: error.msg,
          //     });
          //   });
        }
        // 套餐
      } else if (item.isPackage) {
        //* "pkgType":0, //0 常规套餐（默认值） ；1 宴会套餐；2 临时套餐
        const options = {
          params: {
            pkgId: item.id ? item.id : item.itemId.split('_')[0],
            scId: item.scId ? item.scId : '',
            pointId: this.getFastFoodBillData.bsData.pointId,
            isBuffet: false, // 快餐模式下的自助模式永远为false 目前
          },
          needLog: true,
        };
        if (item.pkgType === 0) {
          ajax('canyin.pos.bill.itempkgnormal', options).then((data) => {
            // 套餐数量默认值设置
            data.package.lastQty = data.package.minAddQty ? data.package.minAddQty : data.package.lastQty;

            const pack = data.package;
            pack.isItemTimePrice = item.isItemTimePrice ? item.isItemTimePrice : false;
            const resData = extend({}, data, {
              package: pack,
            });
            this.$refs.PackageNormal.open(resData, {
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
                this.$vemit('fastFoodPosOrderAddDish', { item });
              },
            });
          });
          // this.$refs.packAge.open()
        } else if (item.pkgType === 1) {
          ajax('canyin.pos.bill.itempkgpart', options).then((data) => {
            data.package.lastQty = data.package.minAddQty ? data.package.minAddQty : data.package.lastQty;

            const pack = data.package;
            pack.isItemTimePrice = item.isItemTimePrice ? item.isItemTimePrice : false;
            const resData = extend({}, data, {
              package: pack,
            });
            this.$refs.PackagePart.open(resData, {
              submit: (pkgPartData, pkgData) => {
                // pkgPartData 代表要用到的数据 pkgData代表套餐弹框原有的数据用来套餐修改
                this.$refs.PackagePart.close();// 关闭弹框
                const newPkgPartData = Object.assign(item, pkgPartData);
                this.$set(newPkgPartData, 'pkgData', pkgData);
                if (`${newPkgPartData.discFlg}` === '3') {
                  this.$set(newPkgPartData, 'defaultPriceType', 4);
                  this.$set(newPkgPartData, 'priceType', 4);
                }
                this.$set(newPkgPartData, 'itemType', this.SUBMIT_ITEM_TYPE_PKG_PART);
                this.$vemit('fastFoodPosOrderAddDish', { item: newPkgPartData });
              },
            });
          });
        }
      } else if (
        item.isWeighed
        && this.posDevice.enableScale
        && (eventType !== undefined || searchType !== 'precision')
      ) {
        // 开启去皮功能并且电子秤类型支持 易盘不允许添加电子秤品项
        if (!item.TagID) {
          this.showWeightToAdd(item);
        } else {
          // "AddOrderErrorMsg09": "易盘不允许添加适用电子秤品项",
          this.$message.error(this.$t('Biz.Order.AddOrderErrorMsg09'));
        }
      } else {
        // 添加菜品
        this.$vemit('fastFoodPosOrderAddDish', { item, beforeAddNum: addNum });
      }
      if (!eventType) { // enter加单
        this.oldAddItem = cloneDeep(this.newAddItem);
      } else { // 添加非同一品项时清空
        if (this.oldAddItem && (this.newAddItem.id !== this.oldAddItem.id)) this.oldAddItem = null;
      }
      // this.$vemit('clearSearchText');   // 清除搜索框逻辑都在index页面处理
    },
    // 电子秤调用并加单
    showWeightToAdd(item) {
      if (this.posFastFood.isNetWeight && this.posDevice.isSupportNewWeight) { // 新版去皮功能
        this.$refs.showWeightModel.open({ dish: item }, {
          submit: (data) => {
            // 电子称负数问题
            if (data < 0) {
              data = 1;
            }
            this.$vemit('fastFoodPosOrderAddDish', { item: extend({}, item, { num: data, itemType: this.SUBMIT_ITEM_TYPE_NORMAL }) });
          },
        });
      } else { // 老程序
        this.loadScale((weight, isError) => {
          let newWeight = weight;
          // 存在isError 则表示称重失败 添加数量是1
          if (!isError) {
            newWeight = newWeightUnitConversion(weight, this.setting);
          }
          // 目前的电子称的品项只是正常品项所以添加个itemType 为1
          this.$vemit('fastFoodPosOrderAddDish', { item: extend({}, item, { num: newWeight, itemType: this.SUBMIT_ITEM_TYPE_NORMAL }) });
        });
      }
    },
    addSize(sizeData) {
      // 渲染规格品项
      if (sizeData) {
        // 拼接下名称
        // this.$set(sizeData,'name','('+sizeData.sizeName+')'+sizeData.name)
        this.$vemit('fastFoodPosOrderAddDish', { item: sizeData });
      } else {
        // "AddOrderErrorMsg10": "没有找到选中的菜品",
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
      // 没有大类代表全部大类，或筛选出选中大类的菜单
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
      switch (+searchMode) {
        case 1: // 模糊
          if (isAllowDarkScan) { // 开了开关 模糊搜索下如果是纯数字走精准逻辑 不过滤品项
            this.isAllNumber = false;
            if (searchText !== '' && (+searchText || +searchText === 0)) { // 纯数字不过滤
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
      const reg = new RegExp(`(^| )${name}=([^;]*)(;|$)`);
      const arr = document.cookie.match(reg);
      if (arr) {
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
      this.$log.info(`品项过滤大类：${value}`);
    },
    // 选择时触发
    changeSmallClasses(value) {
      this.smallClassesFilter = value;
      // 刷新菜单数据
      this.refreshMenuData();
      this.$log.info(`品项过滤小类：${value}`);
    },
    // 选择自定义品项类别时触发
    changeCustomClasses(value) {
      this.customClassesFilter = value;
      // 刷新菜单数据
      this.refreshMenuData();
      this.$log.info(`品项过滤自定义类：${value}`);
    },
    // 刷新菜单数据
    refreshMenuData(isFromSearchTextChange) {
      const { posSettings, activeFirstItem } = this;
      this.$refs.menuList && this.$refs.menuList.refresh();
      if (!isFromSearchTextChange || posSettings.searchMode !== 2) {
        activeFirstItem();
      }
    },
    // 打开临时品项
    openItemTemp() {
      // 如果打折活动方案存在的时候不能进行处理
      if (this.getSelectDiscountPlanData) {
        // CancelDiscountMsg 请先取消打折活动方案
        this.$message.warning(`${this.$t('Biz.Order.CancelDiscountMsg')}${this.getSelectDiscountPlanData.discountPlanName}`);
        return;
      }
      ajax('canyin.pos.bill.billitemtempview', {
        params: {
          loadmodule: 1,
          _t: new Date().getTime(),
        },
      }).then((data) => {
        const _obj = {};
        let {
          name: pointName, openTime, peopleQty, orderCode,
        } = this.getFastFoodBillData.bsData;
        openTime = dateFormat('%H:%I', Date.parse(openTime));
        _obj.pointData = {
          pointName, openTime, peopleQty, orderCode,
        };
        extend(data, _obj);
        this.$refs.itemTemp.open(data, {
          submit: (itemData) => {
            // TODO 临时品项加入点菜单
            // 临时品项默认添加数量为1
            this.$vemit('fastFoodPosOrderAddDish', { item: { ...itemData, num: 1 } });
          },
        });
      }).catch((msgCode, msg) => {
        this.$message.error(msg);
      });
    },
    // Search组件回车触发加单逻辑
    enterSearch() {
      // 如果读取挂单的搜索框为空的话或者不存在的时候走加单操作
      if (!this.searchBsCode && this.searchBsCode == '') {
        this.addActiveItem();
      } else {
        // 走读取挂单的逻辑
        setTimeout(() => {
          this.searchBsCode.length == 14 && this.searchBsCodeDoDesignate(this.posBaseInfo.shopId + this.searchBsCode);
          // 回车传完参数后把搜索的内容直接清空
          this.$refs.bsCodeSearch && this.$refs.bsCodeSearch.clearSearchText();
        }, 100);
      }
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
      this.refreshMenuData(true);
    },
    // 扫码读取挂单的searchText 营业流水code
    onBillBsCode(searchText) {
      this.searchBsCode = searchText;
    },
    hasClass(elements, cName) {
      return !!elements.className.match(new RegExp(`(\\s|^)${cName}(\\s|$)`)); // ( \\s|^ ) 判断前面是否有空格 （\\s | $ ）判断后面是否有空格 两个感叹号为转换为布尔值 以方便做判断
    },
    addClass(elements, cName) {
      // 拼接添加
      elements.className += ` ${cName}`;
    },
    removeClass(elements, cName) {
      elements.className = elements.className.replace(new RegExp(`(\\s|^)${cName}(\\s|$)`), ' '); // replace方法是替换
    },
    isNewWeightOpenFun() {
      if (this.posDevice.enableScale && this.posDevice.isNetWeight && this.posDevice.isSupportNewWeight) {
        const _this = this;
        setTimeout(() => {
          this.$log.info('开始发送连续称重指令');
          _this.$devices.Scale.autoWeighStart((data) => {
            const newData = data;
            this.$log.info(`连续称重功能返回的数据：${data}`);
            if (newData.returnCode == -1) {
              // WeightItemErrorMsg  开始自动称重失败：
              _this.$message.error(`${this.$t('Biz.Order.WeightItemErrorMsg')}${data.returnText}`);
            } else {
              newData.autoWeighNetValue = newData.autoWeighNetValue ? newWeightUnitConversion(data.autoWeighNetValue, this.setting) : 0;
              newData.autoWeighTareValue = newData.autoWeighTareValue ? newWeightUnitConversion(data.autoWeighTareValue, this.setting) : 0;
              _this.newWeightData = newData;
            }
          });
        }, 200);
      }
    },
  },
  deactivated() {
    // 页面销毁时-关闭AI加单定时器
    this.clearTimerImgDetect();
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
//== menu list padding top
@pos-order-menu-list-padding-top: 8px;
@pos-order-menu-list-padding-bottom: 42px;

//** padding horizontal
@pos-order-menu-padding-horizontal: 5px;
//** title height
@pos-order-menu-title-height: 24px;
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

.fade-enter-active, .fade-leave-active {
  transition: all .5s;
}
.fade-enter, .fade-leave-active {
  opacity: 0;
  transform: scale(0);
}
.mask{ width: 100%; height: 100%; left: 0; right: 0; bottom: 0; top: 0; background: rgba(0,0,0,.4); position: fixed; z-index: 100;}
.AI_img{
  width: 550px;
  height: 412px;
  position: fixed;
  left: 378px;
  top: 108px;
  transform-origin: center center;
  // transform: translate(-50%, -50%) scale(1);
  transform: scale(1);
  border: 5px solid #fff;
  border-radius: 5px;
  z-index: 100;
}
.AI_img_small{
  width: 45px;
  height: 36px;
  margin-left: 7px;
  border-radius: 12px;
  cursor: pointer;
}
.fz12{
  font-size: 12px !important;
}
.pos-order-menu-list {
  position: relative;
  height: calc(100% - 102px);
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
.pos-order-menu-oneRow .pos-order-menu-list {
  height: calc(100% - 45px);
}
.pos-order-menu-list-ul {
  .square(100%);
  margin-left: @pos-order-menu-space / -2;
  margin-right: @pos-order-menu-space / -2;
  transition: transform .2s;
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
        height: @pos-order-menu-title-height !important;
      }
      > .small-line-height{
        line-height:12px !important;
      }
      > .menu-code {
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
            min-width: 80px;
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
    }
  }
}
.pos-order-menu-control {
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  .size(100%, @pos-order-menu-control-height);
  .btn-wrap {
    width: 72px;
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
      border-radius: 8px;
      margin-right: 1px;
      outline: none;
      border: none;
      padding: 5px 0;
      width: 100%;
      background: white;
      font-size: 16px;
      // display: flex;
      display: block;
      align-items: center;
      line-height: 1.1;
      text-align: center;
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
  .pos-order-menu-control {
    .btn-wrap{
      button{
        font-size:12px;
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
