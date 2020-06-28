<template>
  <div class="kitchen-fastfood-container" :class="[isDisplayOrderSummary === '1' && 'col' + col]">
    <!--扫码传菜-->
    <QuickInput :callback="scannerServe" />
    <!--左侧已点汇总-->
    <CollectItem
      :col="col"
      :collectedList="collectedList"
      :isOnlyMoFoSummary="isOnlyMoFoSummary"
      v-if="isDisplayOrderSummary === '1'"
    ></CollectItem>
    <!--右侧主体列表-->
    <div
      class="kitchen-fastfood-main"
      ref="kitchenFastfoodMain"
    >
      <div
        v-for="(item, index) in currentPageData"
        :key="index"
        class="kitchen-fastfood-item"
        :class="[
          'size' + item.size,
          'position' + item.position,
          'col' + col,
        ]"
      >
        <RegionItem
          ref="regions"
          :isServe="currentMode.currentState === 'SERVE'"
          :isPassVegetablesBeforeTableware="isPassVegetablesBeforeTableware"
          :now="now"
          :regionData="item.item"
          :index="index"
          :size="item.size"
          :col="col"
          :regionChosed="currentPageRegionPosition[currentRegion] === item.position"
          :currentDishes="currentDishes"
          :doOpenBarcodeScanner="doOpenBarcodeScanner"
          :defaultKeyBoardPage="4"
          @calling="calling"
          @confirm="confirm"
          @print="print"
        ></RegionItem>
      </div>
      <GroupItem
        v-for="item in groupedList"
        :key="item.id"
        :data="item"
        @add="addItem"
        @remove="removeItem"
      ></GroupItem>
      <ListItem
        v-for="item in mergedList"
        :key="item.kscId"
        :now="now"
        :data="item"
      ></ListItem>
    </div>
    <!--底部功能栏-->
    <div class="kitchen-fastfood-footer">
      <div class="kitchen-fastfood-btns">
        <h1
          class="logo"
          :class="logoModeClass"
        >厨房管理</h1>
        <a href="javascript:;" @click="logout">
          <i class="iconfont-kds icon-icon_logout"></i>
          <em>{{ $t('Dict.Btn.Cancellation') }}</em>
        </a>
        <a href="javascript:window.location.reload();">
          <i class="iconfont-kds icon-shuaxin"></i>
          <em>{{ $t('Dict.Btn.Refresh') }}</em>
        </a>
        <a href="javascript:void(0);" @click="revokeRegionItems">
          <i class="iconfont-kds icon-chexiao"></i>
          <em>{{ $t('Dict.Revoke') }}</em>
        </a>
        <a ref="moreMenuBtn" href="javascript:void(0);">
          <div v-show="isMoreMenuDisplay" ref="moreMenu" class="more-menu-wrap">
            <button class="voice-button" @click="changeVoiceRemind" :class="{isOpen: voiceRemind}">
              <i class="iconfont-kds icon-ic_yuyin i"></i>
              <span class="voice-button-text-wrap">
                <span>{{ $t('Biz.KDS.VoicePrompt') }}</span>
                <span>{{voiceRemind ? $t('Biz.KDS.Opened') : $t('Biz.KDS.NotOpened')}}</span>
              </span>
            </button>
            <el-button
              v-show="!isPackageState"
              @click="showSelloutDialog"
              icon="iconfont-kds icon-ic_guqing"
            >{{ $t('Dict.Sellout') }}</el-button>
            <el-button
              v-show="!isPackageState"
              @click="showLimitDialog"
              icon="iconfont-kds icon-ic_xianliang"
            >{{ $t('Dict.Limit') }}</el-button>
          </div>
          <div @click.stop="toggleMoreMenu">
            <i class="iconfont-kds icon-ic_gengduo" :class="{isExpand: isMoreMenuDisplay}"></i>
            <em :class="{isExpand: isMoreMenuDisplay}">{{ $t('Dict.Btn.More') }}</em>
          </div>
        </a>
      </div>
      <div class="kitchen-fastfood-pager">
        <button
          type="button"
          class="prev"
          :disabled="currentPage <= 1"
          @click="prevPage"
        ><i class="iconfont-kds icon-page-prev"></i>&lt;</button>
        <i18n path="Dict.PageStyle.Sim1" tag="strong">
          <em place="currentPage" class="c">{{ currentPage }}</em>
          <em place="totalPage" class="t">{{
            pagedData.length ? pagedData.length : 1
          }}</em>
        </i18n>
        <button
          type="button"
          class="next"
          :disabled="currentPage >= pagedData.length"
          @click="nextPage"
        >&gt;<i class="iconfont-kds icon-page-next"></i></button>
      </div>
      <div class="kitchen-fastfood-sys-info">
        <div class="search-wrap">
          <Search
            @search="onSearch"
            @onFocus="onSearchFocus"
            @onBlur="onSearchBlur"
            :placeholderText="$t('Dict.QuickSearch')"
            searchId="searchItem"
            class="order-search"
            :unSearchMode="true"
            :resultLength="searchOrders.length || 0"
          ></Search>
        </div>
        <div class="kitchen-fastfood-user">
          <template v-if="authInfo.authCard">
            <strong :title="authInfo.name">{{ authInfo.name }}</strong>
            <small>{{ authInfo.code }}</small>
          </template>
          <template v-else>
            <p :title="userName">{{ userName }}</p>
          </template>
        </div>
        <span class="pull-right">{{ infoTime }}</span>
      </div>
    </div>
    <!--限量-->
    <LimitQuantity ref="limitQuantity" :limitData="limitData" source="kds"></LimitQuantity>
    <!--沽清-->
    <ItemsSellOut ref="itemsSellOut" :sellOutData="sellOutData"></ItemsSellOut>
    <!--撤销菜品-->
    <Revoke ref="revoke"></Revoke>
  </div>
</template>

<script>
import {
  now,
  debounce,
  groupBy,
  each,
  map,
  extend,
  first,
  last,
  reduce,
  sumBy,
  times,
  concat,
  constant,
  find,
  indexOf,
  includes,
  remove,
  filter,
} from 'lodash';
import { mapState, mapMutations, mapGetters } from 'vuex';
import dateFormat from '@/common/js/dateformat';
import { add } from '@/common/js/math';
import QuickInput from '@/components/KDS/components/QuickInput';
import RegionItem from '@/components/KDS/components/RegionItem';
import GroupItem from '@/components/KDS/components/GroupItem';
import ListItem from '@/components/KDS/components/ListItem';
import CollectItem from '@/components/KDS/components/CollectItem';
import Search from '@/components/KDS/components/KDSSearch';
import ajax from '@/common/js/ajax';
import WS from '@/common/js/WS';
import {
  COOK, SERVE, PACKAGE, COOK_BY_ORDER, SERVE_BY_ORDER, PACKAGE_BY_ORDER, LOGIN_MODE_MAP,
} from '../../store/order/orderConfig';
import * as M_TYPES from '../../store/order/mutation-types';

// 估清
const ItemsSellOut = (resolve) => {
  import('@/components/Pos/More/ItemsSellOut').then((module) => {
    resolve(module);
  });
};

// 限量
const LimitQuantity = (resolve) => {
  import('@/components/Pos/More/LimitQuantity').then((module) => {
    resolve(module);
  });
};

const Revoke = (resolve) => {
  import('./Revoke').then((module) => {
    resolve(module);
  });
};

export default {
  components: {
    RegionItem,
    GroupItem,
    ListItem,
    CollectItem,
    QuickInput,
    Search,
    ItemsSellOut,
    LimitQuantity,
    Revoke,
  },
  data() {
    return {
      userName: '', // 用户名
      now: now(), // 时间
      itemIdList: [], // KDS方案筛选列表
      smallClassIdList: [], // 小类数据列表
      areaIdList: [], // 区域数据列表
      kitchenItemInfoList: [], // 菜品列表
      saleTypeIdList: [], // 销售类型列表
      containableNum: 4,
      col: 3, // 列
      row: 2, // 行
      wrapWidth: 1024, // 容器宽
      wrapHeight: 768 - 75, // 容器高
      itemPadding: 5, // 单元格内边距
      itemMargin: 1, // 单元格外边距
      itemHeadHeight: 60, // 单元格头部高度
      itemFootHeight: 60, // 单元格底部高度
      itemHeight: 50, // 菜品占高
      HTTP_CONTEXTPATH: '/cy7',
      currentPage: 1,
      currentRegion: 0,
      currentDishes: 0,
      calledList: [], // 已叫号列表
      callingList: [], // 叫号队列
      isCallOrderScreenEnable: false, // 是否开启叫号屏
      isAndroidCallOrderScreenEnable: false, // 是否开启安卓叫号屏
      isPlaying: false, // 是否正在叫号
      callNumberScreenIsOpened: false, // 叫号屏启动完成
      callNumberCustom: '', // 叫号屏自定义配置的文字
      isDisplayOrderSummary: true, // 是否显示已点总汇
      doOpenBarcodeScanner: false, // 是否开启扫码传菜
      currentBarcode: '',
      isFullScreen: false, // 是否开启全屏 182-1752 by L.R
      searchText: '', // 搜索框文本 183-2033 by L.R
      isMoreMenuDisplay: false, // 更多菜单是否显示 183-2032 by L.R
      sellOutData: {}, // 估清初始值 183-2032 by L.R
      limitData: {}, // 限量初始值 183-2032 by L.R
      voiceRemind: false, // 是否开启语音提醒 183-2031 by L.R
      // 小完成后菜品消失 CY7-3257 by Karl
      isItemDisappearsAfterCompletion: false,
      isCountCookEmp: false, // 是否统计配菜员业绩
      isCountPrepareEmp: false, // 是否统计厨师业绩
      isCountServeEmp: false, // 是否统计传菜员业绩
      authInfo: {
        authCard: '',
        code: '',
        name: '',
      },
      kitchenWebSocket: null,
      isPassVegetablesBeforeTableware: false, // 是否启用上餐具功能
      isNotDisplayOnPassScreen: false, // 叫起菜品不显示在传菜屏上
      isOnlyMoFoSummary: false, // 是否不考虑整单备注
      logoMode: '1',
    };
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.initView();
      vm.$hotKey.init();
      vm.setHotkey();
      window.addEventListener('resize', debounce(() => {
        vm.initView();
      }, 500));
      vm.$tcsl.fullScreen(true);
    });
  },
  beforeRouteLeave(to, from, next) {
    window.removeEventListener('resize');
    if (this.kitchenWebSocket) {
      this.kitchenWebSocket.close();
    }
    next();
  },
  created() {
    // 时钟显示
    this.setClock();
    this.$devices.init({
      onOpen: () => {
        this.$log.info('厨房管理按单模式设备管理器连接成功');
      },
      onError: () => {
        this.$log.info('厨房管理按单模式设备管理器连接失败');
        this.$message.error('设备管理器连接失败');
      },
    });
    // 初始化基础信息
    this.initBaseInfo();
    // 初始化厨房管理列表
    this.initKitchenInfo();
    this.voiceRemind = JSON.parse(window.localStorage.getItem('voice'));
    // 点击其他地方，关闭更多菜单 183 by L.R
    document.addEventListener('click', (e) => {
      if (!e.path) return;
      const isMoreMenuChildNode = e.path.find(el => el === this.$refs.moreMenu);
      const isMoreMenuBtn = e.path.find(el => el === this.$refs.moreMenuBtn);
      if (!isMoreMenuChildNode && !isMoreMenuBtn) this.closeMoreMenu();
    }, false);
    // 开启扫码枪模式时，数字键盘1~9失效，仅针对传菜屏有效
    // 改处由于跟183搜索功能冲突，由RegionItem移到Order中 183 by L.R
    if (!this.doOpenBarcodeScanner || this.currentMode.currentState !== SERVE) {
      if (this.$refs.regions) this.$refs.regions.forEach(region => region.setHotKey());
    }
    this.$von('dishCalling', (data, type) => {
      this.dishesCalling(data, type);
    });
    this.$von('removeCalling', (scId) => {
      remove(this.callingList, n => n.id === scId);
    });
    this.$von('dishesReady', (kscIdArr) => {
      this.dishesReady(kscIdArr);
    });
    this.$von('cancelReady', (kscIdArr) => {
      this.cancelReady(kscIdArr);
    });
    ajax('canyin.sys.logo.getLogoImgMode').then((data) => {
      this.logoMode = data.logoImgMode;
    });
  },
  computed: {
    ...mapState('order', ['currentMode', 'remindConfig']),
    ...mapGetters(['config']),
    logoModeClass() {
      if (this.logoMode === '1') {
        return 'tcsllogo';
      }
      return 'customlogo';
    },
    // 判断是否为外卖模式
    isPackageState() { return this.currentMode && this.currentMode.currentState === PACKAGE; },
    // 判断是否只开启了Windows叫号屏
    isWindowsCallOrderScreen() {
      return this.isCallOrderScreenEnable && !this.isAndroidCallOrderScreenEnable;
    },
    // 判断是否只开启了叫号屏
    isCallOrderScreen() {
      return this.isCallOrderScreenEnable || this.isAndroidCallOrderScreenEnable;
    },
    maxGrid: {
      get() {
        return this.col * this.row;
      },
      set(grid) {
        this.col = parseInt(grid / this.row, 0);
      },
    },
    // 单元格可容纳菜品高度
    itemMaxLength() {
      const excludeHeight = this.itemMargin * 2
        + this.itemPadding * 2
        + this.itemHeadHeight
        + this.itemFootHeight;
      const re = [];
      times(this.row, (i) => {
        const maxHeight = this.wrapHeight / (i + 1) - excludeHeight;
        re.push(parseInt(maxHeight / this.itemHeight, 0));
      });
      return re;
    },
    // 时钟显示
    infoTime() {
      // 样式调整 183 By L.R
      // return dateFormat('%Y-%M-%D %H:%I:%S', this.now);
      return dateFormat('%M-%D %H:%I:%S', this.now);
    },
    // 菜品过滤
    filteredList() {
      const { itemIdList, smallClassIdList, areaIdList } = this;
      return this.kitchenItemInfoList.filter((item) => {
        const itemIdValidate = itemIdList
          && itemIdList.length > 0
          && (
            itemIdList.indexOf(item.itemId) >= 0
            || item.tempItemName != null
          );
        const smallClassIdValiate = smallClassIdList
          && smallClassIdList.length > 0
          && smallClassIdList.indexOf(item.smallClassId) >= 0;
        const areaIdValidate = !item.pointAreaId
          || item.pointAreaId === '9'
          || item.pointAreaId === '10'
          || !areaIdList.length
          || includes(areaIdList, item.pointAreaId);
        return (itemIdValidate || smallClassIdValiate) && areaIdValidate;
      });
    },
    // 已点汇总
    collectedList() {
      // 181菜品完成标识已变，所以按照新的规则将已完成的菜品进行过滤
      // bug:93368 由于业务需要，此处需将外卖屏进行单独处理，外卖屏不需要对菜的完成状态进行判断，显示所有菜品
      // FIXME: 后期若外卖增加小完成功能，此处需要调整
      let list = [];
      if (this.currentMode.currentState !== PACKAGE) {
        list = this.filteredList.filter(item => !this.currentMode.dishesIsDone(item));
      } else {
        list = this.filteredList;
      }

      const groupByItem = groupBy(list, (item) => {
        const mapKeys = [
          item.itemId, // 品项ID
          item.sizeId, // 规格ID
          item.pkgFlg, // 套餐标识
          item.kitchenFlg, // 厨房状态
          item.methodText, // 做法
          item.hastenFlg, // 催菜标识
          item.tempItemName, // 临时品项名称
          item.discFlg, // 优惠标识
        ];
        // 是否开启不按整单备注分组，没有开启按备注分组 开启了不按
        if (!this.isOnlyMoFoSummary) {
          mapKeys.push(item.remark); // 整单备注
        }
        return mapKeys;
      });
      return map(groupByItem, (l, key) => extend({}, first(l), {
        elId: key,
        num: reduce(l, (sum, n) => add(sum, n.lastQty), 0),
        kscIdArr: reduce(l, (arr, n) => [...arr, n.kscId], []),
      }));
    },
    // 菜品合并
    mergedList() {
      const groupByItem = groupBy(this.filteredList, item => [
        item.scId, // 服务流水ID
        item.itemId, // 品项ID
        item.sizeId, // 规格ID
        item.pkgFlg, // 套餐标识
        item.kitchenFlg, // 厨房状态
        item.methodText, // 做法
        item.hastenFlg, // 催菜标识
        item.tempItemName, // 临时品项名称
        item.discFlg, // 优惠标识
      ]);
      return map(groupByItem, (list, key) => extend({}, first(list), {
        elId: key,
        num: reduce(list, (sum, n) => add(sum, n.lastQty), 0),
        kscIdArr: reduce(list, (arr, n) => [...arr, n.kscId], []),
      }));
    },
    // 菜品分区域
    groupedList() {
      const groupByBsId = groupBy(this.mergedList, 'bsId');
      Object.entries(groupByBsId).forEach(([bsId, orderItems]) => {
        if (!this.currentMode.orderIsShow(orderItems)) {
          this.deleteCompeletedItems(orderItems.map(item => item.kscId));
          delete groupByBsId[bsId];
        }
      });
      const cancelList = [];
      const callList = [];
      each(groupByBsId, (item, key) => {
        const items = this.isItemDisappearsAfterCompletion
          ? filter(item, i => !this.currentMode.dishesIsDone(i))
          : item;
        if (items.length) {
          const firstItem = first(items);
          const {
            source, name, labelName, tableCode,
          } = this.getRegionInfo(firstItem);
          const g = {
            id: key,
            bsId: item[0].bsId,
            items,
            size: this.getListSize(items.length),
            source,
            name,
            labelName,
            tableCode,
            num: reduce(items, (sum, n) => add(sum, n.num), 0),
            time: Math.min.apply(null, items.map(i => i.callUpTimeTimeStamp)),
            people: firstItem.peopleQty,
            type: firstItem.saleTypeId,
            remark: firstItem.remark,
            platState: firstItem.platState,
            pointAreaId: firstItem.pointAreaId,
          };
          const cancelMap = { [COOK]: 'cookCancelFlg', [SERVE]: 'serveCancelFlg', [PACKAGE]: 'packageCancelFlg' };
          if (items.some(i => parseInt(i[cancelMap[this.currentMode.currentState]], 10) === 1)) {
            cancelList.push(g);
          } else {
            callList.push(g);
          }
        }
      });
      return [
        ...cancelList.sort((f, e) => e.time - f.time),
        ...callList.sort((f, e) => f.time - e.time),
      ];
    },
    // 对搜索的内容进行汇总，若为空则返回null，否则返回搜索列表
    searchOrders() {
      const { groupedList, searchText } = this;
      if (!searchText) return groupedList;
      const searchT = searchText.toLowerCase();
      return groupedList.filter((group) => {
        if (
          group.items.find((item) => {
            const {
              itemPinyin, itemName, itemCode, barcode,
            } = item;
            return (!!itemPinyin && itemPinyin.toLowerCase().indexOf(searchT) !== -1)
                || (!!itemName && itemName.toLowerCase().indexOf(searchT) !== -1)
                || (!!itemCode && itemCode.toLowerCase().indexOf(searchT) !== -1)
                || (!!barcode && barcode.indexOf(searchT) !== -1);
          })
        ) { return true; }
        return false;
      });
    },
    // 分页
    pagedData() {
      const re = [];
      const temp = {
        id: '',
        index: 1,
        size: 0,
        position: 1,
        matrix: [],
      };
      const pushFirstItem = (item) => {
        const { id, size } = item;
        re.push([extend({}, temp, {
          id, size, item, matrix: this.getMatrix(size, 1),
        })]);
      };
      // 若搜索框中存在搜索值的话，采用搜索出来的单据进行分页显示 183-2033 by L.R
      const groups = this.searchOrders || this.groupedList;
      // 若能搜索出单据，且搜索出的单据数量小于总单据，则将选中状态复位为第一单第一个品项
      if (this.searchOrders && this.searchOrders.length !== this.groupedList.length) {
        this.currentRegion = 0;
        this.currentDishes = 0;
      }
      each(groups, (item) => {
        if (re.length) {
          const lastItem = last(re);
          if (sumBy(lastItem, 'size') + item.size > this.maxGrid) {
            pushFirstItem(item);
          } else {
            const position = this.getPosition(lastItem, item.size);
            const matrix = this.getMatrix(item.size, position);
            lastItem.push({
              id: item.id,
              index: lastItem.length + 1,
              size: item.size,
              position,
              item,
              matrix,
            });
          }
        } else {
          pushFirstItem(item);
        }
      });
      return re;
    },
    currentPageData() {
      return this.pagedData[this.currentPage - 1];
    },
    currentPageRegionPosition() {
      return this.currentPageData.map(d => d.position).sort();
    },
    isNeedCount() {
      return (
        this.currentMode.currentState === COOK
        && (this.isCountPrepareEmp || this.isCountCookEmp)
      ) || (
        this.currentMode.currentState === SERVE
        && this.isCountServeEmp
      );
    },
  },
  methods: {
    ...mapMutations('order', [
      M_TYPES.KITCHEN_INIT,
      M_TYPES.KITCHEN_REMINDCONFIG,
    ]),
    ...mapMutations({
      setLocale: 'SET_LOCALE',
    }),
    getRegionInfo(item) {
      let source = '';
      let name = '';
      let tableCode = '';
      const labelName = '桌号';
      if (item.pointAreaId === '9') {
        source = this.$t('Dict.OrderCode');
        name = item.orderCode ? item.orderCode : this.$t('Biz.KDS.NoInput');
      } else if (item.pointAreaId === '10') {
        source = item.deFromName;
        name = item.sn;
      } else {
        source = this.$t('Dict.Seat');
        name = item.pointName;
      }
      if (item.tableCode) {
        tableCode = item.tableCode;
      }
      return {
        source, name, labelName, tableCode,
      };
    },
    dishesCalling(dish, busiCode) {
      let count = 1;
      if (busiCode === 5 || busiCode === 6) {
        count = this.remindConfig.timeout.times;
      } else if (busiCode === 7) {
        count = this.remindConfig.hasten.times;
      }
      this.newCalling({
        busiCode,
        id: dish.scId,
        text: this.getCallingText(dish, busiCode),
        count,
      });
    },
    getCallingText(dish, type) {
      let typeText = '';
      if (type === 5) {
        typeText = '即将超时';
      } else if (type === 6) {
        typeText = '已超时';
      } else if (type === 7) {
        typeText = '催菜';
      }
      const { pointAreaId, saleTypeId } = dish;
      const orderCode = dish.orderCode ? dish.orderCode : '未输入';
      let name = '';
      if (pointAreaId === '9') {
        if (saleTypeId === 3) {
          name = `外卖${orderCode}号`;
        } else if (saleTypeId === 2) {
          name = `外带${orderCode}号`;
        } else {
          name = `${orderCode}号`;
        }
      } else if (pointAreaId === '10') {
        name = `${dish.deFromName}${dish.sn}号`;
      } else {
        name = `${dish.pointName}客位`;
      }
      return `请注意，${name},${dish.sizeId !== '-1' ? dish.sizeName : ''}${dish.itemName}${typeText}`;
    },
    /**
     * 添加一条语音
     * @param {Array} arr 叫号数组 内部：
     * {
     *   busiCode: 业务类型 0 为固定mp3文件 567见代码
     *   callingId: 对应View的cid
     *   text: 语音内容
     *   count: 连续播放次数
     * }
     */
    newCalling(params) {
      if (params.busiCode === 0) {
        this.addCalling({
          type: 'file',
          file: '/static/media/dining.mp3',
        });
      } else if (params.busiCode === 1) {
        this.addCalling({
          busiCode: 1,
          type: 'data',
          text: params.text,
          fileName: params.fileName,
          posId: params.posId,
          count: 1,
          saveFile: true,
        });
      } else if (params.busiCode === 3) {
        this.addCalling({
          type: 'file',
          file: '/static/media/serve-end.mp3',
          toHead: true,
        });
      } else {
        this.addCalling({
          busiCode: params.busiCode,
          type: 'data',
          text: params.text,
          id: params.id,
          count: params.count,
          saveFile: false,
        });
      }
    },
    // 添加一条语音并开始播放
    addCalling(params) {
      const data = {
        file: '',
        count: params.count ? params.count : 1,
        id: params.id,
      };
      if (params.type === 'file') {
        if (process.env.NODE_ENV !== 'development') {
          data.file = `${process.env.API_PATH}${process.env.DIST_PATH}${params.file}`;
        } else {
          data.file = params.file;
        }
        if (params.toHead) {
          this.callingList.unshift(data);
        } else {
          this.callingList.push(data);
        }
        this.playCalling();
      } else if (params.type === 'data') {
        ajax('canyin.speech.speech.synthesis', {
          loading: false,
          contentType: 'URLEncoded',
          data: {
            busiCode: params.busiCode,
            fileName: params.fileName,
            text: params.text,
            posId: params.posId,
            saveFile: !!params.saveFile,
          },
        }).then((res) => {
          if (params.saveFile) {
            data.file = this.HTTP_CONTEXTPATH + res.fileName;
          } else {
            data.file = `data:audio/x-mp3;base64,${res.data}`;
          }
          this.callingList.push(data);
          this.playCalling();
        }).catch(() => {});
      }
    },
    /**
     * 语音叫号
     */
    playCalling() {
      if (this.callingList.length && !this.isPlaying) {
        const it = first(this.callingList);
        const calling = new Audio(it.file);
        it.count -= 1;
        if (it.count === 0) {
          this.callingList.shift();
        }
        this.isPlaying = true;
        calling.play();
        const endHandler = () => {
          this.isPlaying = false;
          this.playCalling();
        };
        calling.onended = () => {
          setTimeout(endHandler, 700);
        };
        calling.onerror = () => {
          setTimeout(endHandler, 6000);
        };
      }
    },
    // 向语音队列中添加语音提醒，并播放语音 2031-183 by L.R
    callingListNewNotify() {
      this.newCalling({ busiCode: 0 });
    },
    /**
     * 叫号
     * @param { String } id bsId
     * @param { String } name 叫号内容
     */
    calling(result) {
      const { id, name, items } = result;
      this.$log.info('调用叫号方法');
      this.newCalling({
        busiCode: 1,
        text: this.$t('Biz.KDS.SpeechText', [name, this.callNumberCustom]),
        fileName: name,
        posId: this.$route.params.posid,
      });
      // 加入到已叫号列表
      if (indexOf(this.calledList, id) === -1) {
        this.calledList.push(id);
      }
      // 写入数据库
      ajax('canyin.kitchen.kitchencallorder.execcallorder', {
        contentType: 'json',
        data: {
          bsId: id,
          kcKscIdList: map(items, 'kscId'),
        },
      }).then(() => {
        // 如果开启叫号屏则向副屏发送数据
        if (this.isWindowsCallOrderScreen) {
          this.$log.info('开始向副屏发送叫号消息');
          this.$devices.CallNumberScreen.send({
            moduleName: 'CallNumberScreen',
            method: 'call',
            result,
          });
        }
      });
    },
    /**
     * 加一个区域，用于叫号屏
     * @param { String } id bsId
     * @param { String } name 叫号屏显示的名称
     */
    addItem(result) {
      if (this.callNumberScreenIsOpened) {
        this.$devices.CallNumberScreen.send({
          moduleName: 'CallNumberScreen',
          method: 'itemAdd',
          result,
        });
      }
    },
    /**
     * 消失一个区域，用于叫号屏
     * @param { String } id bsId
     * @param { String } name 叫号屏显示的名称
     */
    removeItem(result) {
      if (this.currentPageData === undefined && this.currentPage !== 1) {
        this.prevPage();
      }
      if (this.callNumberScreenIsOpened) {
        this.$devices.CallNumberScreen.send({
          moduleName: 'CallNumberScreen',
          method: 'cancelOrder',
          result,
        });
      }
    },
    /**
     * @param { Array } resultOfParallelList 打印数据数组
     */
    print(printList) {
      each(printList, (item) => {
        if (item.printData && item.printType === 'PRINT_PARALLEL') {
          this.$devices.Printer.print(item.printData);
        }
      });
    },
    /**
     * 传菜
     * @param { String } id bsId
     * @param { Array } kscIdList kcsId列表
     * @param { String } name 对应的客位名
     * @param { Boolean } dontCallNumber 不进行叫号
     */
    confirm(id, kscIdList, name, dontCallNumber) {
      const unknowCancelList = [];
      const confirmList = [];
      each(kscIdList, (kscId) => {
        const finded = find(this.filteredList, { kscId });
        if (finded) {
          if (finded.coUnknowQty) {
            unknowCancelList.push(finded.kscId);
          } else {
            confirmList.push(finded);
          }
        }
      });
      if (unknowCancelList.length) {
        this.$message.info(this.$t('Biz.KDS.UnknowCancelMessage'));
        this.cancelRegionItems(unknowCancelList);
      } else if (confirmList.length) {
        this.submitConfirm(id, confirmList, name, dontCallNumber);
      }
    },
    /**
     * 按单提交传菜数据
     * @param { String } id bsId
     * @param { Array } kscIdList 传菜的kscId数组
     */
    submitConfirmData(id, kscIdList, authCard) {
      // ajax('canyin.kitchen.kitchenservemode.updatewhencompleteserve', {
      const kscList = this.kitchenItemInfoList.filter(k => includes(kscIdList, k.kscId));
      if (!this.currentMode.orderCompleteURL || !this.currentMode.orderCanDone(kscList)) return;
      ajax(`canyin.kitchen.${this.currentMode.orderCompleteURL}`, {
        contentType: 'json',
        data: {
          kcKscIdList: kscIdList,
          bsId: id,
          callFlg: 2,
          posId: this.$route.params.posid,
          // 传入lockVersion，根据业务逻辑，每单lockVersion相同，只取第一个即可  182-1354 by L.R
          lockVersion: kscList[0].lockVersion,
          authCard,
        },
      }).then((data) => {
        if (
          this.currentMode.currentState === SERVE
          && this.remindConfig.serveDone
        ) {
          this.newCalling({ busiCode: 3 });
        }
        if (data && data.resultOfParallelList && data.resultOfParallelList.length) {
          this.print(data.resultOfParallelList);
        }
        if (data && data.resultOfServeBillSum && data.resultOfServeBillSum.length) {
          this.print(data.resultOfServeBillSum);
        }
        if (data && data.resultOfCookBillSum && data.resultOfCookBillSum.length) {
          this.print(data.resultOfCookBillSum);
        }
      });
    },
    /**
     * 提交传菜信息
     * @param { String } id bsId
     * @param { Array } confirmList 提交完成的菜品列表
     * @param { String } name 客位名，为叫号屏准备
     * @param { Boolean } dontCallNumber 不进行叫号
     */
    submitConfirm(id, confirmList, name, dontCallNumber) {
      this.getAuthCard((authCard) => {
        this.$log.info(`调用整单完成方法,当前${this.isCallOrderScreen ? '开启' : '未开启'}叫号屏`);
        console.info(`调用整单完成方法,当前${this.isCallOrderScreen ? '开启' : '未开启'}叫号屏`);
        const kscIdList = map(confirmList, 'kscId');
        if (this.isCallOrderScreen && this.currentMode.currentState !== COOK) {
          if (indexOf(this.calledList, id) !== -1 || dontCallNumber) {
            this.$log.info('开始向副屏发送完成消息');
            console.info('开始向副屏发送完成消息');
            this.submitConfirmData(id, kscIdList, authCard);
            if (this.isWindowsCallOrderScreen) {
              this.$devices.CallNumberScreen.send({
                moduleName: 'CallNumberScreen',
                method: 'confirm',
                result: {
                  bsId: id,
                  name,
                },
              });
            }
          } else {
            this.$message.error(this.$t('Biz.KDS.UnCallNumberMessage'));
          }
        } else {
          // 可叫号且整单允许完成时才播放叫号内容
          if (
            this.currentMode.hasCalling
            && this.currentMode.orderCanDone(
              this.kitchenItemInfoList.filter(item => includes(
                kscIdList,
                item.kscId,
              )),
            )
          ) {
            this.calling({ id, name, items: confirmList });
          }
          this.submitConfirmData(id, kscIdList, authCard);
        }
      });
    },
    logout() {
      if (this.isWindowsCallOrderScreen) {
        this.$devices.CallNumberScreen.close();
      }
      window.location = `${this.HTTP_CONTEXTPATH}/platform/login/login/logout`;
    },
    setHotkey() {
      this.$hotKey.set('KDS.fastFood', {
        PgUp: this.prevPage,
        PgDn: this.nextPage,
        '-': this.prevPage,
        '+': this.nextPage,
        '/': this.revokeRegionItems,
        '←': this.prevRegion,
        '→': this.nextRegion,
        '↑': this.prevDishes,
        '↓': this.nextDishes,
        Space: this.toggleDishes,
        A: this.orderCall,
        B: this.orderDone,
        R: () => { window.location.reload(); },
        'F11.ctrl': this.toggleConsole,
      });
    },
    // 切换全屏状态，调试用  182-1725 by L.R
    toggleConsole() {
      if (this.isFullScreen) {
        this.$tcsl.fullScreen(true);
      } else {
        this.$tcsl.fullScreen(false);
      }
      this.isFullScreen = !this.isFullScreen;
    },
    // 选择上一单  181 by L.R
    prevRegion() {
      this.currentRegion -= 1;
      this.currentDishes = 0;
      if (this.currentRegion < 0) {
        // 若当前页大于第一页则向前翻页，否则为第一页，将currentRegion重置回第一个位置
        if (this.currentPage > 1) {
          this.prevPage();
          this.currentRegion = this.currentPageData.length - 1;
        } else {
          this.currentRegion = 0;
        }
      }
    },
    // 选择下一单  181 by L.R
    nextRegion() {
      this.currentRegion += 1;
      this.currentDishes = 0;
      if (this.currentRegion > this.currentPageData.length - 1) {
        // 若当前页小于最后已页则向后翻页，否则为最后一页，将currentRegion重置回最后一个位置
        if (this.currentPage < this.pagedData.length) {
          this.nextPage();
          this.currentRegion = 0;
        } else {
          this.currentRegion = this.currentPageData.length - 1;
        }
      }
    },
    choseRegion(index) {
      this.currentRegion = index;
      this.currentDishes = 0;
    },
    // 选择上一道菜  181 by L.R
    prevDishes() {
      this.currentDishes = Math.max(0, this.currentDishes - 1);
    },
    // 选择下一道菜  181 by L.R
    nextDishes() {
      if (!this.currentPageData) return;
      const region = this.currentPageData.find(r => r.position === this.currentPageRegionPosition[this.currentRegion]);
      this.currentDishes = Math.min(region.item.items.length - 1, this.currentDishes + 1);
    },
    // 切换菜的完成状态  181 by L.R
    toggleDishes() {
      if (!this.currentPageData) return;
      const regionIndex = this.currentPageData.findIndex(r => r.position === this.currentPageRegionPosition[this.currentRegion]);
      this.$refs.regions[regionIndex].$children[this.currentDishes].hanldeItem(this.currentPageData[regionIndex].item.items[this.currentDishes]);
    },
    // 按单叫号  181 by L.R
    orderCall() {
      if (!this.currentPageData) return;
      const regionIndex = this.currentPageData.findIndex(r => r.position === this.currentPageRegionPosition[this.currentRegion]);
      this.$refs.regions[regionIndex].call();
    },
    // 按单大完成  181 by L.R
    orderDone() {
      if (!this.currentPageData) return;
      const regionIndex = this.currentPageData.findIndex(r => r.position === this.currentPageRegionPosition[this.currentRegion]);
      this.$refs.regions[regionIndex].confirm();
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage -= 1;
      }
    },
    nextPage() {
      if (this.currentPage < this.pagedData.length) {
        this.currentPage += 1;
      }
    },
    getMatrix(size, position) {
      const T = constant('T');
      const F = constant('F');
      return concat(times(position - 1, F), times(size, T), times(this.maxGrid - size - position + 1, F));
    },
    getPosition(list, size) {
      const m = times(this.maxGrid, constant('F'));
      each(list, (item) => {
        each(item.matrix, (i, index) => {
          if (i === 'T') {
            m[index] = 'T';
          }
        });
      });
      const mStr = m.join('');
      const fStr = times(size, constant('F')).join('');
      let re = mStr.indexOf(fStr) + 1;
      if (re % 2 === 0 && size > 1) {
        re += 1;
      }
      return re;
    },
    initView() {
      const middleWidth = this.config.kdsCustomScreenWidth ? 1270 : 1430;
      const { offsetWidth, offsetHeight } = this.$refs.kitchenFastfoodMain;
      this.wrapWidth = offsetWidth;
      this.wrapHeight = offsetHeight;
      if (this.wrapWidth < middleWidth) {
        this.col = 3;
      } else if (this.wrapWidth >= middleWidth && this.wrapWidth < 1910) {
        this.col = 4;
      } else {
        this.col = 5;
      }
    },
    /**
     * 根据菜品组长度获取单元格Size（占几格）
     * @param { Number } length 菜品组长度
     */
    getListSize(length) {
      const m = this.itemMaxLength;
      let re = 0;
      if (length <= m[1]) {
        re = 1;
      } else if (length > m[1] && length <= m[0]) {
        re = 2;
      } else if (length > m[0] && length <= 2 * m[0]) {
        re = 4;
      } else if (length > 2 * m[0] && length <= 3 * m[0]) {
        re = 6;
      } else if (length > 3 * m[0] && length <= 4 * m[0]) {
        re = this.maxGrid === 6 ? 6 : 8;
      } else if (length > 8 * m) {
        if (this.maxGrid === 6) {
          re = 6;
        } else if (this.maxGrid === 8) {
          re = 8;
        } else {
          re = 10;
        }
      }
      return re;
    },
    setClock() {
      setInterval(() => {
        this.now = now();
      }, 1000);
    },
    initBaseInfo() {
      ajax('canyin.kitchen.kitchenindex', {
        contentType: 'json',
      }).then((data) => {
        this.setLocale(data.currentLanguage);
        const loginModeMap = {
          [LOGIN_MODE_MAP[COOK_BY_ORDER]]: COOK,
          [LOGIN_MODE_MAP[SERVE_BY_ORDER]]: SERVE,
          [LOGIN_MODE_MAP[PACKAGE_BY_ORDER]]: PACKAGE,
        };
        const {
          kitchenMode,
          lianDong,
          DoOpenBarcodeScanner,
          isCountCookEmp,
          isCountPrepareEmp,
          isCountServeEmp,
          isPassVegetablesBeforeTableware,
        } = data;
        // 因此处与另一个初始化操作同为异步操作，但返回结果顺序未知
        // 在当前业务流程不变的情况下，暂时在该处也进行一次初始化操作，以保证正确性
        this[M_TYPES.KITCHEN_INIT]({
          mode: loginModeMap[this.$route.params.loginMode],
          linkage: parseInt(lianDong, 10) === 0,
          kitchenMode,
        });
        this.doOpenBarcodeScanner = DoOpenBarcodeScanner === '1';
        this.initWebsocket(data.WS_CONTEXTPATH);
        this.userName = data.username;
        this.HTTP_CONTEXTPATH = data.HTTP_CONTEXTPATH;
        this.isCountCookEmp = isCountCookEmp === '1';
        this.isCountPrepareEmp = isCountPrepareEmp === '1';
        this.isCountServeEmp = isCountServeEmp === '1';
        // 传菜前是否上餐具
        this.isPassVegetablesBeforeTableware = isPassVegetablesBeforeTableware === '1';
      });
    },
    isShowDishesBySale(dishes) {
      return includes(this.saleTypeIdList, dishes.saleTypeId);
    },
    // 过滤菜品的方法，
    getShowDishes(items) {
      return items.filter((i) => {
        // 开启设置：叫起的菜品不显示在传菜屏上则过滤掉
        if (this.$route.params.loginMode === '3' && this.isNotDisplayOnPassScreen) {
          return (this.currentMode.dishesIsShow(i)
            && this.isShowDishesBySale(i)
            && i.callUpTime);
        }
        // 若该品项不需显示，或销售类型之外的品项，则过滤掉  181 by L.R
        return (this.currentMode.dishesIsShow(i)
          && this.isShowDishesBySale(i));
      });
    },
    // 起菜
    callUp(list) {
      each(list, (item) => {
        // 开启设置：起菜将品项加进去
        if (this.$route.params.loginMode === '3' && this.isNotDisplayOnPassScreen) {
          this.kitchenItemInfoList.push(item);
        } else {
          // 没开启设置： 替换原有的品项
          this.kitchenItemInfoList.forEach((i, index) => {
            if (i.kscId === item.kscId) {
              this.kitchenItemInfoList.splice(index, 1, item);
            }
          });
        }
      });
    },
    /**
     * 初始化厨房管理数据
     * @param { Boolean } fromRevoke 是否是撤销业务调用的，如果是撤销业务的初始化不再初始叫号屏
     */
    initKitchenInfo(fromRevoke) {
      const { filterid, posid, loginMode } = this.$route.params;
      ajax('canyin.kitchen.kitcheninfoinit.getkcallinfoforinitdisplay', {
        contentType: 'json',
        data: {
          itemfilterId: filterid,
          posId: posid,
          loginMode,
        },
      }).then((data) => {
        const {
          itemIdList,
          smallClassIdList,
          posHasAreaList,
          kitchenItemInfoList,
          isCallOrderScreenEnable,
          isAndroidCallOrderScreenEnable,
          serverTime,
          isDisplayOrderSummary,
          kitchenMode,
          lianDong,
          posHasSaleTypes,
          callNumberCustom,
          isItemDisappearsAfterCompletion,
          isNotDisplayOnPassScreen,
          isOnlyMoFoSummary,
        } = data;
        const loginModeMap = {
          [LOGIN_MODE_MAP[COOK_BY_ORDER]]: COOK,
          [LOGIN_MODE_MAP[SERVE_BY_ORDER]]: SERVE,
          [LOGIN_MODE_MAP[PACKAGE_BY_ORDER]]: PACKAGE,
        };
        if (!this.$route.params.loginMode) throw new Error(this.$t('Biz.KDS.ModeErrorMessage'));
        // liandong：0代表联动，1代表不联动
        this[M_TYPES.KITCHEN_INIT]({
          mode: loginModeMap[this.$route.params.loginMode],
          linkage: parseInt(lianDong, 10) === 0,
          kitchenMode,
        });
        const remindConfig = {
          timeout: {
            enable: data.isEnabledRemindItemTimeout === '1',
            times: parseInt(data.remindItemTimeoutTimes, 0),
            repeat: data.isRemindItemTimeoutRepeatPlay === '1',
            cycle: parseInt(data.remindItemTimeoutRepeatPlayCycle, 0),
          },
          hasten: {
            enable: data.isEnabledRemindItemUrging === '1',
            times: parseInt(data.enabledRemindItemUrgingTimes, 0),
            repeat: data.isEnabledRemindItemUrgingRepeatPlay === '1',
            cycle: parseInt(data.remindItemUrgingRepeatPlayCycle, 0),
          },
          serveDone: data.isEnabledRemindPassItemSuccess === '1',
        };
        this[M_TYPES.KITCHEN_REMINDCONFIG](remindConfig);
        if (!this.currentMode.isShow()) return;
        // saleTypeIdList此步骤要在前，因过滤菜时需要该列表
        this.saleTypeIdList = posHasSaleTypes.map(s => parseInt(s.saleTypeId, 10));
        this.itemIdList = itemIdList;
        this.smallClassIdList = smallClassIdList;
        this.isNotDisplayOnPassScreen = isNotDisplayOnPassScreen === '1';
        this.areaIdList = map(posHasAreaList, area => area.id);
        this.kitchenItemInfoList = this.getShowDishes(kitchenItemInfoList);
        this.isCallOrderScreenEnable = isCallOrderScreenEnable;
        this.isAndroidCallOrderScreenEnable = isAndroidCallOrderScreenEnable;
        this.isDisplayOrderSummary = isDisplayOrderSummary;
        this.callNumberCustom = callNumberCustom;
        this.isItemDisappearsAfterCompletion = isItemDisappearsAfterCompletion === '1';
        // 是否不考虑整单备注
        this.isOnlyMoFoSummary = isOnlyMoFoSummary === '1';
        if (!fromRevoke && isDisplayOrderSummary === '1') {
          this.col -= 1;
        }
        if (
          !fromRevoke
          && this.isCallOrderScreen
          && this.currentMode.hasCalling
        ) {
          this.initCallNumberScreen();
        }
        if (Math.abs(serverTime / 1000 - Date.parse(new Date()) / 1000) > 60 * 5) {
          this.$message.error(this.$t('Dict.SysTimeErrorMessage2'));
        }
      });
    },
    /**
     * 初始化叫号屏
     */
    initCallNumberScreen() {
      if (this.isWindowsCallOrderScreen) {
        this.$devices.CallNumberScreen.open();
      }
      ajax('canyin.kitchen.kitchencallorder.getallcalledorderinfo', {
        contentType: 'json',
      }).then((data) => {
        if (this.isWindowsCallOrderScreen) {
          const loading = this.$loading({
            lock: true,
            text: this.$t('Dict.ViceScreenIsStarting'),
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)',
          });
          setTimeout(() => {
            this.$devices.CallNumberScreen.send({
              moduleName: 'CallNumberScreen',
              method: 'loadInit',
              result: this.groupedList,
              calledOrder: data,
            }, () => {
              this.callNumberScreenIsOpened = true;
            });
            loading.close();
          }, 5000);
        }
        if (data.length) {
          each(data, (item) => {
            if (indexOf(this.calledList, item.bsId) === -1) {
              this.calledList.push(item.bsId);
            }
          });
        }
      });
    },
    /**
     * 初始化WebSocket
     * @param { Strign } url Websocket基础路径
     */
    initWebsocket(path) {
      this.kitchenWebSocket = new WS(`${path}/websocket/${this.currentMode.websocketPath}`, {
        message: (message) => {
          if (!this.currentMode.isShow()) return;
          // 若锁版本小于当前版本且不等于0，则证明该条数据不是数据库中的最新数据，将其过滤 182-1354 by L.R
          const kitchenList = this.filterItemByLockVersionMap(message.data);
          switch (message.method) {
            // 配菜完成菜品进入传菜 和 撤销
            // 181 因二次加单业务调整，所以调整此处的添加逻辑
            // 将下列标识都统一用refreshDishesState方法处理
            // case 'serveInfoAdd':
            // case 'cookInfoAdd': // 181新增参数  by L.R
            // case 'packageInfoAdd': // 181新增参数  by L.R
            // case 'cancelRecord':
            //   this.kitchenItemInfoList.push(...message.data);
            //   break;
            // 以下2个标识仅标准传菜用到，以防万一，暂时保留 182 by L.R
            case 'cancelReadyToServe':
            case 'doReadyToServe':
              this.readyOrCanelReadyItems(message);
              break;
            // 传菜完成删除菜品 和 撤销配菜
            case 'cookInfoDelete':
            case 'serveInfoDelete':
            case 'packageInfoDelete':
            case 'cancelCookRecord':
              // this.deleteCompeletedItems(map(message.data, 'kscId'));
              // 更新品项版本号以该种方式实现并非很好的解决方案，但基于目前的程序结构，只能采取如下方式，下同  182-1354 by L.R
              this.updateItemLockVersion(kitchenList);
              this.deleteCompeletedItems(map(message.data, 'kscId'));
              break;
            // 退菜消息
            case 'cancelOrder':
              this.cancelRegionItems(map(message.data, 'kcKscId'));
              break;
            case 'tranItem':
            case 'modifyPoint':
            case 'present': // 181新增参数  by L.R
            case 'hasten': // 181新增参数  by L.R
              this.updateItemLockVersion(kitchenList);
              this.updateItems(message.data);
              break;
            case 'serveInfoAdd':
            case 'cookInfoAdd': // 181新增参数  by L.R
            case 'packageInfoAdd': // 181新增参数  by L.R
            case 'cancelRecord':
              if (this.voiceRemind) this.callingListNewNotify();
              this.updateItemLockVersion(kitchenList);
              this.addDishesToList(message.data);
              break;
            // 以下为本屏或其他两个屏幕刷新菜品列表  181 by L.R
            case 'refreshCookInfo':
            case 'refreshServeInfo':
            case 'refreshPackageInfo':
            case 'refreshCookKitchenItemComplete':
            case 'refreshServeKitchenItemComplete':
            case 'refreshPackageKitchenItemComplete':
              this.updateItemLockVersion(kitchenList);
              this.refreshDishesState(message.data);
              break;
            // 其他两个屏幕整单撤消  181 by L.R
            case 'refresh':
              // this.initKitchenInfo(true);
              break;
            // 上餐具推送 187 by WangLei
            case 'updateTablewareState':
              console.log('上餐具推送', message.data);
              console.log('xxxxxx', this.currentPageData);
              this.updateItemLockVersion(kitchenList);
              this.updateTablewareState(message.data);
              break;
            case 'callUp':
              this.callUp(message.data);
              break;
            default:
              break;
          }
        },
      });
    },
    // 上餐具和撤销更新页面菜品状态
    updateTablewareState(list) {
      let base = {};
      if (Array.isArray(list) && list.length > 0) {
        base = list[0];
        for (let i = 0; i < this.kitchenItemInfoList.length; i += 1) {
          const item = this.kitchenItemInfoList[i];
          if (item.bsId === base.bsId) {
            item.tablewareState = base.tablewareState;
          }
        }
      }
    },
    // 扫码传菜  181 by L.R
    scannerServe(str) {
      // 联动模式下，若品项不可小完成，则不可进行扫码操作
      if (this.currentMode.linkage) {
        const item = this.kitchenItemInfoList.find(i => i.barcode === str);
        if (item && (item.kitchenFlg === 0 || item.kitchenFlg === 1)) return;
      }
      if (
        this.doOpenBarcodeScanner
        && this.currentMode.currentState === SERVE
        && str.length === 13
      ) {
        this.currentBarcode = str;
        ajax('canyin.kitchen.kitchenservemode.updatewhencompleteservebyscanbarcode', {
          contentType: 'json',
          data: { barcode: str, authCard: null },
        }).then((data) => {
          console.log('scannerServe data', data);
        });
      }
      if (this.isNeedCount && str.length >= 6 && str.length !== 13) {
        this.readAuthCardInfo(str);
      }
    },
    // 刷新菜的状态  181 by L.R
    refreshDishesState(data) {
      let lastData = {};
      let orderBsId = '';
      let orderName = '';
      let orderType = false;
      let confirmFlag = true;
      const kscIdList = [];
      data.forEach((d) => {
        if (
          (this.isItemDisappearsAfterCompletion || this.doOpenBarcodeScanner)
          && this.currentBarcode
          && d.barcode === this.currentBarcode
        ) {
          orderBsId = d.bsId;
          const regionInfo = this.getRegionInfo(d);
          orderName = regionInfo.name;
          lastData = {
            id: orderBsId,
            name: regionInfo.name,
            source: regionInfo.source,
            labelName: regionInfo.labelName,
            tableCode: regionInfo.tableCode,
            pointAreaId: d.pointAreaId,
          };
          orderType = d.saleTypeId === 3;
        }
        for (let i = 0, len = this.kitchenItemInfoList.length; i < len; i += 1) {
          const item = this.kitchenItemInfoList[i];
          if (item.kscId === d.kscId) {
            item.kitchenFlg = d.kitchenFlg;
            item.orderFlg = d.orderFlg;
            break;
          }
        }
      });
      // 开启扫码传时，判断是否大完成
      if (this.isItemDisappearsAfterCompletion || this.doOpenBarcodeScanner) {
        for (let i = 0, len = this.kitchenItemInfoList.length; i < len; i += 1) {
          const item = this.kitchenItemInfoList[i];
          if (item.bsId === orderBsId) {
            if (!this.currentMode.dishesIsDone(item)) {
              confirmFlag = false;
              break;
            } else {
              kscIdList.push(item.kscId);
            }
          }
        }
        if (orderBsId && confirmFlag) {
          this.currentBarcode = '';
          // 若开启叫号屏，则扫码最后一道菜时，进行叫号操作，否则，进行大完成操作 101221 by L.R
          if (this.isCallOrderScreenEnable || this.isAndroidCallOrderScreenEnable) {
            this.calling(lastData);
            if (this.isItemDisappearsAfterCompletion) {
              this.confirm(orderBsId, kscIdList, orderName, orderType);
            }
          } else {
            this.confirm(orderBsId, kscIdList, orderName, orderType);
          }
        }
      }
    },
    // 切换菜的状态,List中存在则变更状态，否则添加进List  181 by L.R
    addDishesToList(data) {
      const newDishes = [];
      data.forEach((d) => {
        let flag = true;
        for (let i = 0, len = this.kitchenItemInfoList.length; i < len; i += 1) {
          if (this.kitchenItemInfoList[i].kscId === d.kscId) {
            flag = false;
            this.kitchenItemInfoList[i].kitchenFlg = d.kitchenFlg;
            this.kitchenItemInfoList[i].orderFlg = d.orderFlg;
            break;
          }
        }
        if (flag) newDishes.push(d);
      });
      if (newDishes.length > 0) this.kitchenItemInfoList = this.kitchenItemInfoList.concat(this.getShowDishes(newDishes));
    },
    // 将版本锁号大于0且小于当前版本号的过滤
    filterItemByLockVersionMap(itemList) {
      return itemList.filter((item) => {
        const itemLockVersion = parseInt(item.lockVersion, 10);
        const dishes = this.kitchenItemInfoList.find(i => i.kscId === item.kscId);
        return !dishes ? true : (!!item.lockVersion && itemLockVersion > 0 && itemLockVersion >= dishes.lockVersion);
      });
    },
    // 更新品项列表的锁版本号 182-1354 by L.R
    updateItemLockVersion(itemList) {
      if (!itemList.length) return;
      this.kitchenItemInfoList.forEach((item) => {
        for (let i = 0, len = itemList.length; i < len; i += 1) {
          if (item.bsId === itemList[i].bsId) {
            item.lockVersion = itemList[i].lockVersion;
            break;
          }
        }
      });
    },
    // 完成或取消准备
    readyOrCanelReadyItems({ method, data: kscIdArr }) {
      each(kscIdArr, (id) => {
        const finded = find(this.kitchenItemInfoList, { kscId: id });
        if (finded) {
          finded.kitchenFlg = method === 'doReadyToServe' ? 4 : 2;
        }
      });
    },
    // 全部完成删除
    deleteCompeletedItems(kscIdArr, replace) {
      const { kitchenItemInfoList: list } = this;
      each(kscIdArr, (id, index) => {
        const finded = find(list, { kscId: id });
        if (finded) {
          if (replace && this.isShowDishesBySale(replace[index])) {
            list.splice(indexOf(list, finded), 1, replace[index]);
          } else {
            list.splice(indexOf(list, finded), 1);
          }
        }
      });
    },
    // 退单
    cancelRegionItems(kcKscIdList) {
      ajax('canyin.kitchen.kitchencancelorder.updatewhenknowcancelorder', {
        contentType: 'json',
        data: { kcKscIdList },
      }).then(() => {
        this.deleteCompeletedItems(kcKscIdList);
      });
    },
    // 按单撤销
    revokeRegionItems() {
      if (this.isItemDisappearsAfterCompletion) {
        ajax(`canyin.kitchen.${this.currentMode.revokeUrl}`).then((data) => {
          this.$refs.revoke.open(data);
        });
      } else if (this.currentMode.orderRevokeURL) {
        ajax(`canyin.kitchen.${this.currentMode.orderRevokeURL}`, {
          params: { posId: this.$route.params.posid },
        }).then(() => {});
      }
    },
    // 更新数据
    updateItems(data) {
      this.deleteCompeletedItems(map(data, 'kscId'), data);
    },
    // 搜索 183-2033 by L.R
    onSearch(searchText) {
      this.currentPage = 1;
      this.currentRegion = 0;
      this.currentDishes = 0;
      // 将搜索内容绑定到属性中，为的是进行computed，进行搜索结果的汇总
      this.searchText = searchText;
    },
    // 搜索框获得焦点时，解绑快捷键 183-2033 by L.R
    onSearchFocus() {
      // 不清楚移除快捷键的逻辑，但下面两个方法的调用顺序不能更改，否则会出现问题
      // 模块名称不知是否可以修改，但若将KDS.fastFood.Resgion改为KDS.Resgion会出现问题，务必注意！！
      this.$hotKey.removeCurrentModule('KDS.fastFood.Resgion');
      this.$hotKey.removeCurrentModule('KDS.fastFood');
    },
    // 搜索框失去焦点时，绑定快捷键 183-2033 by L.R
    onSearchBlur() {
      this.setHotkey();
      if (this.$refs.regions) this.$refs.regions.forEach(region => region.setHotKey());
    },
    // 切换更多菜单的显示状态 183-2032 by L.R
    toggleMoreMenu() {
      this.isMoreMenuDisplay = !this.isMoreMenuDisplay;
    },
    // 关闭更多菜单 183 by L.R
    closeMoreMenu() {
      this.isMoreMenuDisplay = false;
    },
    // 打开估清窗口
    showLimitDialog() {
      ajax('canyin.pos.itemLimit.itemLimitView', {
        params: {
          loadmodule: 1, _t: new Date().getTime(),
        },
      }).then((data) => {
        this.closeMoreMenu();
        this.limitData = data;
        this.$refs.limitQuantity.open();
      });
    },
    // 打开估清窗口
    showSelloutDialog() {
      ajax('canyin.pos.itemSellout.itemSelloutView', {
        params: {
          loadmodule: 1, _t: new Date().getTime(),
        },
      }).then((data) => {
        this.closeMoreMenu();
        this.sellOutData = data;
        this.$refs.itemsSellOut.open();
      });
    },
    // 变更语音提醒设置
    changeVoiceRemind() {
      this.voiceRemind = !this.voiceRemind;
      window.localStorage.setItem('voice', this.voiceRemind);
      this.closeMoreMenu();
    },
    // 读取员工卡信息
    readAuthCardInfo(authCard) {
      ajax('dbi.emp.selectbyauthcard', {
        params: { authCard },
      }).then((data) => {
        this.authInfo = data;
        let type = '厨师';
        if (this.currentMode.currentState === SERVE) {
          type = '传菜员';
        }
        this.$message({
          type: 'success',
          message: `<strong>请注意：</strong><span>${type}已更换为${data.name} ${data.code}</span>`,
          center: true,
          customClass: 'message-middle',
          dangerouslyUseHTMLString: true,
        });
      });
    },
    // 获取员工信息
    getAuthCard(callback) {
      if (this.isNeedCount) {
        const { authCard } = this.authInfo;
        if (authCard === '') {
          this.$message({
            type: 'warning',
            message: '请刷员工卡',
            center: true,
            customClass: 'message-middle',
          });
        } else {
          callback(authCard);
        }
      } else {
        callback();
      }
    },
    // 小完成
    dishesReady(item) {
      if (this.currentMode.dishesReadyURL) {
        this.getAuthCard((authCard) => {
          this.currentBarcode = item.barcode;
          ajax(`canyin.kitchen.${this.currentMode.dishesReadyURL}`, {
            contentType: 'json',
            data: {
              kcKscIdList: item.kscIdArr,
              authCard,
              posId: this.$route.params.posid,
            },
          }).then((data) => {
            if (data && data.msg) {
              this.$message.success(data.msg);
            }
            if (data && data.resultOfParallelList && data.resultOfParallelList.length) {
              each(data.resultOfParallelList, (paralle) => {
                this.$devices.Printer.print(paralle.printData);
              });
            }
            if (data && data.resultOfServeBillSum && data.resultOfServeBillSum.length) {
              each(data.resultOfServeBillSum, (billSum) => {
                if (billSum.printData && billSum.printType === 'PRINT_PARALLEL') {
                  this.$devices.Printer.print(billSum.printData);
                }
              });
            }
            if (data && data.resultOfCookBillSum && data.resultOfCookBillSum.length) {
              each(data.resultOfCookBillSum, (billSum) => {
                if (billSum.printData && billSum.printType === 'PRINT_PARALLEL') {
                  this.$devices.Printer.print(billSum.printData);
                }
              });
            }
          });
        });
      }
    },
    // 小不完成
    cancelReady(item) {
      if (this.currentMode.dishesCancelURL) {
        ajax(`canyin.kitchen.${this.currentMode.dishesCancelURL}`, {
          contentType: 'json',
          data: { kcKscIdList: item.kscIdArr, posId: this.$route.params.posid },
        }).then(() => {});
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/vendor-prefixes.less";
@import "~@/common/less/iconfont-kds.less";
@import "~@/common/less/common.less";

.kitchen-fastfood-container {
  // position: fixed;
  position: relative; // 此属性需为relative，同下面z-index
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  // z-index: 50;  // 设置此属性的话，会同估清、限量dialog页冲突，造成无法点击的情况
  padding: 5px 5px 75px 5px;
  font-size: 14px;
  background-color: #000200;
  &.col2 {
    padding-left: 33.32%;
  }
  &.col3 {
    padding-left: 25%;
  }
  &.col4 {
    padding-left: 20%;
  }
  &.col5 {
    padding-left: 16.66%;
  }
}

// .collection-wrapper {
//   position: absolute;
//   top: 5px;
//   left: 5px;
//   bottom: 75px;
//   &.col2 {
//     right: 66.67%;
//   }
//   &.col3 {
//     right: 75%;
//   }
//   &.col4 {
//     right: 80%;
//   }
//   &.col5 {
//     right: 83.33%;
//   }
// }

.kitchen-fastfood-main {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.kitchen-fastfood-item {
  position: absolute;
  padding: 5px;
  height: 100%;

  &.col2 {
    &.size1 {
      width: 50%;
      height: 50%;
    }

    &.size2 {
      width: 50%;
    }

    &.size4 {
      width: 100%;
    }
  }

  &.col3 {
    &.size1 {
      width: 33.32%;
      height: 50%;
    }

    &.size2 {
      width: 33.32%;
    }

    &.size4 {
      width: 66.67%;
    }

    &.size6 {
      width: 100%;
    }
  }

  &.col4 {
    &.size1 {
      width: 25%;
      height: 50%;
    }

    &.size2 {
      width: 25%;
    }

    &.size4 {
      width: 50%;
    }

    &.size6 {
      width: 75%;
    }

    &.size8 {
      width: 100%;
    }
  }

  &.col5 {
    &.size1 {
      width: 20%;
      height: 50%;
    }

    &.size2 {
      width: 20%;
    }

    &.size4 {
      width: 40%;
    }

    &.size6 {
      width: 60%;
    }

    &.size8 {
      width: 80%;
    }

    &.size10 {
      width: 100%;
    }
  }

  &.position1,
  &.position2 {
    left: 0;
  }

  &.col2 {
    &.position3,
    &.position4 {
      left: 50%;
    }
  }

  &.col3 {
    &.position3,
    &.position4 {
      left: 33.32%;
    }

    &.position5,
    &.position6 {
      left: 66.67%;
    }
  }

  &.col4 {
    &.position3,
    &.position4 {
      left: 25%;
    }

    &.position5,
    &.position6 {
      left: 50%;
    }

    &.position7,
    &.position8 {
      left: 75%;
    }
  }

  &.col5 {
    &.position3,
    &.position4 {
      left: 20%;
    }

    &.position5,
    &.position6 {
      left: 40%;
    }

    &.position7,
    &.position8 {
      left: 60%;
    }

    &.position9,
    &.position10 {
      left: 80%;
    }
  }

  &.position1,
  &.position3,
  &.position5,
  &.position7,
  &.position9 {
    top: 0;
  }

  &.position2,
  &.position4,
  &.position6,
  &.position8,
  &.position10 {
    top: 50%;
  }
}

.kitchen-fastfood-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 75px;

  .search-wrap {
    float: left;
  }
}

.kitchen-fastfood-logo {
  position: absolute;
  left: 0;
  top: 0;
  height: 75px;
  line-height: 75px;
  padding-left: 10px;

  .iconfont-kds {
    color: white;
    font-size: 30px;
    vertical-align: middle;
  }

  h1 {
    display: inline;
    font-size: 16px;
    color: #9da2b6;
    vertical-align: middle;
    font-weight: bold;
  }
}

.kitchen-fastfood-pager {
  position: relative;
  width: 228px;
  height: 75px;
  padding-top: 18px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 68px;
  padding-right: 68px;
  text-align: center;
  color: #bfc1d6;
  box-sizing: border-box;

  button {
    position: absolute;
    top: 18px;
    width: 70px;
    height: 36px;
    line-height: 28px;
    background-color: transparent;
    border: 3px solid #ffffff;
    color: #ffffff;
    border-radius: 20px;
    padding: 0;
    font-size: 20px;
    font-weight: bold;
    text-align: center;

    .iconfont-kds {
      vertical-align: middle;
      font-size: 14px;
    }

    &.prev {
      left: 0;
    }

    &.next {
      right: 0;
    }

    &:disabled {
      // background-color: #4d5266;
      // color: #7a8194;
      opacity: 0.2;
    }
  }

  strong {
    display: block;
    line-height: 36px;
    font-weight: normal;

    em {
      font-style: normal;
    }
  }
}

.kitchen-fastfood-btns {
  position: absolute;
  left: 0;
  top: 0;
  padding-right: 15px;
  padding-top: 15px;

  .element-icon {
    margin-top: 4px;
    margin-bottom: -4px;
  }

  .more-menu-wrap {
    position: absolute;
    top: -100%;
    left: 100px;
    height: 60px;
    width: 352px;
    padding: 10px;
    background-color: #4f5f6f;
    box-shadow: 0 0 5px 5px rgba(50, 50, 50, .8);
    font-size: 0;

    &::after {
      content: "";
      position: absolute;
      top: 100%;
      left: 160px;
      border: 5px solid rgba(0, 0, 0, 0);
      border-top: 5px solid #4f5f6f;
    }
  }

  a {
    float: left;
    width: 75px;
    height: 48px;
    text-align: center;
    color: #6e768b;
    text-decoration: none;

    i,
    em {
      display: block;
    }

    i {
      height: 28px;
      font-size: 26px;
    }

    em {
      font-style: normal;
      font-size: 12px;
      height: 20px;
      line-height: 20px;
    }

    &:hover {
      color: white;
    }
  }
}

.kitchen-fastfood-sys-info {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  width: 350px;
  line-height: 18px;
  color: #6e768b;
  font-size: 16px;
  font-weight: bold;
  text-align: right;

  .kitchen-fastfood-user {
    float: right;
    width: 164px;
    height: 20px;
    color: #fff;
    // padding: 0 10px;
    vertical-align: middle;

    i {
      padding: 10px;
      border: 2px solid #6e768b;
      border-radius: 50%;
      font-size: 18px;
    }

    small {
      font-size: 14px;
    }

    strong {
      width: 120px;
      line-height: 1;
      font-weight: bold;
      text-align: right;
      .text_ellipsis();
    }
  }
}
.order-search {
  background-color: rgba(237, 254, 255, 0.7);
}
.isExpand {
  color: #ffffff;
}
.isOpen {
  background-color: #384857;
}
</style>

<style lang="less">
// 为了可以正确覆盖样式，只能多套一层...
.more-menu-wrap {
  .el-button span {
    font-weight: bold;
    font-size: 16px;
  }

  .voice-button {
    width: 130px;
    height: 42px;
    margin-right: 10px;
    padding-top: 4px;
    border-radius: 4px;
    color: #fff;
    font-size: 16px;
    line-height: 16px;
    vertical-align: top;

    &:hover {
      background-color: #ffffff;

      span:first-child {
        color: #0096a4;
      }
      span:last-child {
        color: #178994;
      }
      .i {
        color: #4fa1a9;
      }
    }

    .i {
      display: inline-block;
      margin-top: 7px;
      margin-right: 3px;
      color: #A8B9CB;
      vertical-align: top;
      font-size: 20px;
    }
    span {
      display: inline-block;
      width: 70px;
      text-align: center;
    }
    span:first-child {
      font-size: 16px;
      font-weight: bold;
      color: #ffffff;
    }
    span:last-child {
      font-size: 12px;
      color: #b2c1d2;
    }
  }
}

.more-menu-wrap {
  border-radius: 4px;

  button {
    background-color: #758da5;
    color: #ffffff;
    border: none;

    &:hover {
      i {
        color: #4fa1a9;
      }
    }
    i {
      margin-right: 3px;
      color: #A8B9CB;
    }
  }
}

.message-middle {
  top: 40%;
  font-size: 18px;
  padding-top: 25px;
  padding-bottom: 25px;
  min-width: 340px;

  .el-message__content {
    color: #333;
    font-size: 20px;
    font-weight: bold;
    white-space: nowrap;
    font-style: oblique;

    strong {
      display: block;
    }

    span {
      display: block;
      margin-top: 10px;
      font-weight: normal;
      font-size: 16px;
      font-style: normal;
    }
  }

  &.el-message--success .el-message__icon {
    margin-top: -24px;
  }
}

.lang-enUS{
  .kitchen-fastfood-btns {
    .more-menu-wrap {
      width: 410px;
      .voice-button {
        span {
          width: 72px;
        }
      }
    }
  }
}

.logo {
  float: left;
  width: 44px;
  height: 44px;
  margin-top: 4px;
  margin-left: 10px;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: 100% 100%;
  text-indent: -9999px;

  &.tcsllogo {
    background-image: url(~@/common/images/pos/main/btcsllogo.png);
  }

  &.customlogo {
    background-image: url(/custom/logo/logo.png);
  }
}
</style>
