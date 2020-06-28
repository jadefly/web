<template>
  <div class="pos-ordering-container" v-if="`${this.posInfo.controlMode}` !== '3'">
    <div class="pos-ordering-window">
      <div
        class="pos-ordering-bill"
        :class="{'has-crmInfo': posOrderBill && posOrderBill.crmMemberQueryData.data}">
        <Info></Info>
        <CrmInfo v-if="posOrderBill ? posOrderBill.crmMemberQueryData.data: false"></CrmInfo>
        <List
          ref="billList"
          :scList = "posOrderBill ? posOrderBill.scList : []"
          :ordering="true"
          :unKitchenPrinting="unKitchenPrinting"
          :isTeamAdd="isTeamAdd"
          :changeWaiterId="changeWaiterId"
          :guestList="guestList"
          @billLastTotal="billLastTotal"
          @clearGuestList="clearGuestList"
          @initOrderingSetUpBtns="initOrderingSetUpBtns"
          @changeActiveItem="changeActiveItem"
          @modifyItemPackage="modifyItemPackage"
          @redemption="redemption"
          @addFullGift="addFullGift"
        ></List>
        <Control
          ref="orderingControl"
          v-show="posOrderBill"
          :ordering="true"
          :lastTotal="lastTotal"
          :originalTotal="originalTotal"
          @clearGuestList="clearGuestList"
          ></Control>
      </div>
      <OrderingBtns
        ref="orderingBtns"
        @control="menuControl"
        :guestList="guestList"
        :checkGiveState="checkGiveStates"
        :addMenuBtnsTest="partAddMenuBtns"
        @more="moreOrderingBtns"
      >
      </OrderingBtns>
    </div>
    <MoreOrderingBtns
      ref="moreOrderingBtns"
      :unKitchenPrinting="unKitchenPrinting"
      :isTeamAdd="isTeamAdd"
      :checkGiveState="checkGiveStates"
      :isTeam="posOrderBill ? posOrderBill.bsData.is_team == 1 : false"
      :guestList="guestList"
      :activeList ="guestList.length ? getActiveList()[0] : null"
      @control="menuControl"
      :moreAddBtnsTest="addMenuBtns"
      :areaType="areaType"
    >
    </MoreOrderingBtns>
    <Menu ref="menu" :guestList="guestList" :areaType="areaType"></Menu>
    <OrderingGive ref="orderingGive"></OrderingGive>
    <OrderingCancelGive ref="orderingCancelGive"></OrderingCancelGive>
    <OrderingChangeNum ref="orderingChangeNum"></OrderingChangeNum>
    <OrderingChangePrice ref="orderingChangePrice" type="ordering"></OrderingChangePrice>
    <OrderingChangeMethods
      ref="orderingChangeMethods"
      type="oderingChange"
      submitId="changeMethodsSubmit">
    </OrderingChangeMethods>
    <OrderingModifyItemSize
      ref="orderingModifyItemSize"
      :areaType="areaType"
      submitId="orderingModifyItemSize"
      type="ordering">
    </OrderingModifyItemSize>
    <OrderingServeWay ref="orderingServeWay" type="ordingServeWay"></OrderingServeWay>
    <OrderingWaiterModal ref="changeWaiter"></OrderingWaiterModal>
    <OrderingGroupVerifiedModal ref="groupVerifiedModal"></OrderingGroupVerifiedModal>
    <CopyDishes ref="copyDishes" @selected="copyItem"></CopyDishes>
    <PackageNormalChange
      ref="PackageNormalChange"
      type="oderingChange"
      :areaType="areaType"
      submitId="packageNormalChange">
    </PackageNormalChange>
    <PackagePartChange
      ref="PackagePartChange"
      type="oderingChange"
      :areaType="areaType"
      submitId="packagePartChange">
    </PackagePartChange>
    <SpellFood ref="spellFood" submitId="spellFood" :areaType="areaType"></SpellFood>
    <Redemption
      ref="redemption"
    ></Redemption>
    <FullGift ref="fullGift" type="chineseFood"> </FullGift>
  </div>
</template>

<script>
import {
  mapState, mapGetters, mapActions, mapMutations,
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
import ajax from '@/common/js/ajax';
import Info from '@/components/Pos/Order/Bill/Info';
import CrmInfo from '@/components/Pos/Order/Bill/CrmInfo';
import List from '@/components/Pos/Order/Bill/List';
import Control from '@/components/Pos/Order/Bill/Control';
import OrderingBtns from '@/components/Pos/Ordering/OrderingBtns';
import Menu from '@/components/Pos/Ordering/Menu/Index';
import * as itemConstantSet from '@/common/dictionary/pos-ordering-item-constant-set';
import {
  add, sub, multi, div,
} from '@/common/js/math';

// 赠菜
const OrderingGive = (resolve) => {
  import('./OrderingBtnsFunc/OrderingGive').then((module) => {
    resolve(module);
  });
};

// 取消赠菜
const OrderingCancelGive = (resolve) => {
  import('./OrderingBtnsFunc/OrderingCancelGive').then((module) => {
    resolve(module);
  });
};
// 改量
const OrderingChangeNum = (resolve) => {
  import('./OrderingBtnsFunc/OrderingChangeNum').then((module) => {
    resolve(module);
  });
};

// 改价
const OrderingChangePrice = (resolve) => {
  import('./OrderingBtnsFunc/OrderingChangePrice').then((module) => {
    resolve(module);
  });
};

// 规格
const OrderingModifyItemSize = (resolve) => {
  import('./Menu/ItemSize').then((module) => {
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
  import('./OrderingBtnsFunc/OrderingServeWay').then((module) => {
    resolve(module);
  });
};

// 更换服务员
const OrderingWaiterModal = (resolve) => {
  import('./OrderingBtnsFunc/OrderingWaiterModal').then((module) => {
    resolve(module);
  });
};

// 团购验券
const OrderingGroupVerifiedModal = (resolve) => {
  import('./OrderingBtnsFunc/OrderingGroupVerifiedModal').then((module) => {
    resolve(module);
  });
};

// 更多模块
const MoreOrderingBtns = (resolve) => {
  import('./OrderingBtnsFunc/MoreOrderingBtns').then((module) => {
    resolve(module);
  });
};

// 复制菜品
const CopyDishes = (resolve) => {
  import('./OrderingBtnsFunc/CopyDishes').then((module) => {
    resolve(module);
  });
};

// 常规套餐
const PackageNormalChange = (resolve) => {
  import('./Menu/Package/PackageNormal').then((module) => {
    resolve(module);
  });
};

// 宴会套餐
const PackagePartChange = (resolve) => {
  import('./Menu/Package/PackagePart').then((module) => {
    resolve(module);
  });
};

// 拼菜
const SpellFood = (resolve) => {
  import('./OrderingBtnsFunc/SpellFood').then((module) => {
    resolve(module);
  });
};
// 满赠
const FullGift = (resolve) => {
  import('@/components/Pos/Business_commons/FullGift/index.vue').then((module) => {
    resolve(module);
  });
};
// 换购
const Redemption = (resolve) => {
  import('@/components/Pos/Business_commons/Redemption/index').then((module) => {
    resolve(module);
  });
};
export default {
  components: {
    Info,
    CrmInfo,
    List,
    Control,
    OrderingBtns,
    Menu,
    OrderingGive,
    OrderingCancelGive,
    OrderingChangeNum,
    OrderingChangePrice,
    OrderingModifyItemSize,
    OrderingChangeMethods,
    OrderingWaiterModal,
    MoreOrderingBtns,
    OrderingServeWay,
    CopyDishes,
    PackageNormalChange,
    PackagePartChange,
    OrderingGroupVerifiedModal,
    SpellFood,
    FullGift,
    Redemption,
  },
  data() {
    return {
      guestList: [],
      lastTotal: 0, // 最终的合计金额
      originalTotal: 0, // 优惠前的合计
      unKitchenPrinting: false, // 免厨打,
      isTeamAdd: false, // 团队加单
      changeWaiterId: null, // 修改点餐员后的id
      checkGiveState: '',
      checkHalfState: false,
      hasActive: false,
      confirm: null,
      areaType: 0, // 区域价格类型默认为0 0 是默认的销售价格
      activeMenuItem: null,
      moreBtns: [
        {
          name: 'moreOrderingBtns', text: this.$t('Dict.Btn.More'), hotKey: 'F11.ctrl', hotKetTip: '(Ctrl+F11)', disabled: true,
        },
      ],
      readOrderLock: false, // 读取点菜单的请求防止重复点的锁
    };
  },
  computed: {
    ...mapState({ isShowOrdedItems: state => state.pos.order.lastAdditionWhenAddingOrders }),
    ...mapGetters([
      'getCustomMenuBtn',
      'posOrderBill',
      'posSettings',
      'itemsMoreBarcode',
      'getReserveOrderList',
      'getVuexPointData',
      'posAreas',
      'posTables',
      'getVuexItemLimitsMap',
      'ALL_POS_MODULE',
      'posInfo',
      'posDevice',
      'posBaseInfo',
      'getisSetUpGroupMethod',
      'config',
      'haveLimitSmallClasses',
      'getActiveOrderItemSmClsTotal',
      'setting',
    ]),
    groupDisabled() {
      const pointServiceItem = this.ALL_POS_MODULE.find(({ id }) => id === '173');
      // 开启多次结算毙掉
      if (this.posInfo.hasMultiSettle) {
        return false;
      }
      if (pointServiceItem) {
        const pointServiceList = pointServiceItem.children;
        return pointServiceList.find(({ id }) => id === '913').checked;
      }
      return true;
    },
    orderingAuthority() {
      this.setMenuBtns();
      return this.getCustomMenuBtn;
    },
    addMenuBtns() {
      const activeItem = this.getActiveList()[0];
      let checkGiveState = 'give';
      if (activeItem) {
        checkGiveState = +activeItem.discFlg === 1 ? 'cancelGive' : 'give';
      }
      return map(this.orderingAuthority, (item) => {
        let disabled = true;
        let { text, name } = item;
        if (!item.hasNoAuth) {
          // 赠菜或者取消赠菜
          if (item.name === 'give') {
            disabled = activeItem;
            text = checkGiveState === 'cancelGive' ? this.$t('Dict.Btn.CancelGive') : this.$t('Dict.Btn.GiveDish');
            name = checkGiveState;
          } else if (item.name === 'changeHalfNum') {
            disabled = activeItem && activeItem.enableHalf && !activeItem.minAddQty;
          } else if (item.name === 'changeItemMethods') {
            disabled = activeItem && !activeItem.isPackage;
          } else if (
            item.name === 'deleteItem'
            || item.name === 'addItemNum'
            || item.name === 'subtractItemNum'
            || item.name === 'changeItemNum'
            || item.name === 'changeItemPrice'
            || item.name === 'modifyItemSize'
            || item.name === 'changeItemServeWay'
          ) {
            disabled = activeItem;
          } else if (item.name === 'spellFood') {
            disabled = activeItem && activeItem.isPincai;
          } else if (item.name === 'clearItem') {
            disabled = this.guestList && this.guestList.length;
          } else if (item.name === 'teamAdd') {
            disabled = this.posOrderBill ? +this.posOrderBill.bsData.is_team === 1 : false;
            text = this.isTeamAdd ? this.$t('Biz.Order.CancleTeamOrder') : this.$t('Dict.Btn.TeamAdd');
          } else if (item.name === 'groupon') {
            disabled = this.groupDisabled;
          } else if (item.name === 'skipKitchenList') {
            text = this.unKitchenPrinting ? this.$t('Biz.Order.CancleSkipKitchenList') : this.$t('Dict.Btn.SkipKitchenList');
          } else if (item.name === 'orderSave' && this.posOrderBill) {
            name = `${this.posOrderBill.bsData.isScOrder}` === '1'
              ? 'readOrder'
              : 'orderSave';
            text = `${this.posOrderBill.bsData.isScOrder}` === '1'
              ? this.$t('Biz.Order.OrderRead')
              : this.$t('Dict.Btn.OrderSave');
            disabled = !(name === 'orderSave' && this.guestList && this.guestList.length === 0);
          // 当前点击的品项是换购品项换购
          }
          // 如果当前客位是团队客位 不能执行换购和满赠, 禁用
          if (this.posOrderBill && this.posOrderBill.bsData.is_team === 1) {
            if (item.name === 'redemption' || item.name === 'addFullGift') {
              disabled = false;
            }
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
      const finded = find(this.guestList, this.activeMenuItem);
      if (finded) {
        return +finded.discFlg === 1 ? 'cancelGive' : 'give';
      }
      return '';
    },
    checkOrderStates() {
      return `${this.posOrderBill.bsData.isScOrder}` === '1'
        ? 'readOrder'
        : 'orderSave';
    },
  },
  created() {
    // 暂时解决刷新问题posOrderBill
    if (!this.posOrderBill) {
      this.$router.push('/pos');
      window.location.reload();
      //   // history.go(0)
    }
  },
  mounted() {
    // 监听事件：点击菜单非套餐非多规格内单个品项
    this.$von('posOrderAddDish', (addData) => {
      this.add(addData);
    });
    this.$von('orderingConfirm', (callback) => {
      if (this.guestList.length) {
        this.$confirm(this.$t('Biz.Order.ClearBillWarnMsg'), this.$t('Dict.Tips'), {
          confirmButtonText: this.$t('Dict.Sure'),
          cancelButtonText: this.$t('Dict.Cancel'),
          type: 'warning',
          // closeOnPressEscape: false,
        }).then(() => {
          this.guestList.splice(0, this.guestList.length);
          this.setETagItems([]);
          callback();
        }).catch(() => {
          console.log('取消');
        });
      } else {
        !callback || callback();
      }
    });
    this.$von('handleAddMenuItem', (finded) => {
      this.handleAddMenuItemFn(finded);
    });
    this.$von('orderEasyDelete', (item) => {
      const lastItem = this.$refs.billList && this.$refs.billList.getLastGuestList();
      const guestList = cloneDeep(this.guestList);
      if (lastItem) {
        const active = {
          lid: lastItem.lid,
          id: lastItem.id,
          sizeId: lastItem.sizeId,
          discFlg: parseInt(lastItem.discFlg, 0),
          reasonId: lastItem.reasonId,
        };
        if (item.isLimit) {
          this.resetItemLimitsMap(item, 'sub', item.num);
        }
        for (let i = 0; i < guestList.length; i += 1) {
          setTimeout(() => {
            if (guestList[i].TagID === item.TagID) {
              // return `${items.id}_${items.sizeId}` === `${item.id}_${item.sizeId}`;
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
    this.$vonce('forceSelectWaiter', () => {
      this.changeWaiter();
    });
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      // 下面逻辑仿照beforeLeaveInit中逻辑添加
      // 若开启显示已点品项，则向副屏发送已点品项列表，用于初始化显示
      // * 无法用已有的updataItem消息，发送会导致错误，需注意！！
      // 否则，将发送价格重置的消息，将副屏的价格归0显示
      // 不按照下述逻辑处理，目前会产生问题  182-1191 by L.R
      if (vm.posDevice && vm.posDevice.enableVice) {
        if (vm.isShowOrdedItems) {
          vm.$devices.SubMonitor.send({
            moduleName: 'SubMonitor',
            method: 'updateOrderedItem',
            isOrdering: true, // 是否是在加单界面
            result: vm.posOrderBill.scList, // 菜品信息
            initData: vm.posOrderBill.bsData,
          });
        } else {
          vm.$devices.SubMonitor.send({
            moduleName: 'SubMonitor',
            method: 'resetPrice',
          });
        }
      }
      // 打开易盘通道读取易盘上的餐盘
      vm.$vemit('openEasydisk');
      // 判断当前的客位的区域价格type
      if (vm.getVuexPointData) {
        vm.posAreas.forEach((_) => {
          _.id == vm.getVuexPointData.areaId
            && (vm.areaType = Number(_.process_price_flag));
        });
      }
      vm.$hotKey.set('Pos.Ordering', {
        // Enter: (event) => {
        //   vm.$vemit('menuAddActiveItem');
        // },
        Esc: () => {
          vm.$vemit('menuClearSearchText');
        },
        PgUp: () => {
          vm.$refs.orderingControl.back();
        },
        PgDn: () => {
          vm.$refs.orderingControl.add();
        },
        // F1: () => {
        //   vm.hasActive
        //     && (vm.checkGiveState == 'give' ? vm.give() : vm.cancelGive());
        // },
        // F2: () => {
        //   vm.hasActive && vm.deleteItem();
        // },
        // '+': () => {
        //   vm.hasActive && vm.addItemNum();
        // },
        // '-': () => {
        //   vm.hasActive && vm.subtractItemNum();
        // },
        // F3: () => {
        //   vm.hasActive && vm.checkHalfState && vm.changeHalfNum();
        // },
        // F4: () => {
        //   vm.hasActive && vm.changeItemNum();
        // },
        // F5: () => {
        //   vm.hasActive && vm.changeItemPrice();
        // },
        // F6: () => {
        //   vm.hasActive && vm.modifyItemSize();
        // },
        // F7: () => {
        //   vm.hasActive && vm.changeItemMethods();
        // },
        // F8: () => {
        //   vm.hasActive && vm.changeItemServeWay();
        // },
        // 'F11.ctrl': () => {
        //   vm.moreOrderingBtns();
        // },
        BackSpace: () => {
          vm.$vemit('delTableSearchTextdInBlur');
        },
        F10: () => {
          console.log(vm.guestList);
        },
        '↑': () => {
          vm.$vemit('menuSelect', '↑');
        },
        '↓': () => {
          vm.$vemit('menuSelect', '↓');
        },
        '←': () => {
          vm.$vemit('menuSelect', '←');
        },
        '→': () => {
          vm.$vemit('menuSelect', '→');
        },
        '*': () => {
          if (vm.config.jijihongHotkey) {
            vm.changeItemNum();
          }
        },
        ...vm.setKeySearchHotKey(),
        ...vm.setMenuBtnHotKey(vm),
      });

      // 每次进来初始化下品项按钮的选中样式
      vm.$vemit('initActiveItem');
      // 清空上次已点的账单的数据
      vm.clearGuestList();
      vm.$refs.menu.clearAddBeforeNum();
      // 初始化下免厨打功能 修改点菜员 /团队开单
      vm.initOrderingSetUpBtns();
      vm.$vemit('orderingMenuListInitPager');
      // 每次进来判读下是否是修改预点单过来的数据 是做以下处理
      vm.getReserveOrderList
      && (vm.getReserveOrderList.pointId == vm.posOrderBill.bsData.pointId)
      && vm.renderingReserveOrderBillList(vm.getReserveOrderList);
      // 清空搜索文本
      vm.$vemit('menuClearSearchText');
      // 清空菜单大类小类筛选
      vm.$vemit('clearClassFilter');
      // 每次进来判读下整单备注的存在否则为初始化状态
      vm.$vemit(
        'setRemarkShow',
        (vm.getReserveOrderList && vm.getReserveOrderList.ordernote != '' && vm.getReserveOrderList.pointId == vm.posOrderBill.bsData.pointId)
          ? vm.getReserveOrderList.ordernote
          : '',
      );
      vm.$vemit('menuFilterPagerRefresh');
      // 判断是否是预定开台过来的如果是获取到预定单id,并且请求下接口判断这个预定客位是否关联了排菜单如果是进行排菜的加单
      setTimeout(() => {
        const orderId = to.params && to.params.bookingData ? to.params.bookingData.orderId : null;
        if (orderId) {
          vm.doBookingAddOrder(orderId);
        }
      }, 50);
      if (vm.posDevice.enableYiPan && vm.posBaseInfo.yipanList.length) {
        vm.$devices.ETag.reload();
      }
      if (vm.posDevice.enableZhiPan && vm.posBaseInfo.zhipanList && vm.posBaseInfo.zhipanList.length) {
        vm.$devices.ETag.reload();
      }
      // CY7-3492 优化点菜确认单 如果已经有点菜单直接读取
      if (
        vm.posSettings.isAddOrderReadMenu
        && vm.posOrderBill.bsData.isScOrder
      ) {
        vm.readOrder();
      }
      vm.setPointGroupId(vm.posOrderBill.bsData.pointId);
    });
  },
  // 离开的时候进行账单的加单情况判断
  async beforeRouteLeave(to, from, next) {
    if (to.fullPath === '/') {
      this.beforeLeaveInit();
      next();
    } else if (!this.guestList.length) {
      this.beforeLeaveInit();
      next();
    } else {
      this.$confirm(this.$t('Biz.Order.ClearBillWarnMsg'), this.$t('Dict.Tips'), {
        confirmButtonText: this.$t('Dict.Sure'),
        cancelButtonText: this.$t('Dict.Cancel'),
        type: 'warning',
        // closeOnPressEscape: false,
      }).then(() => {
        this.clearLimitsItem();
        this.guestList.splice(0, this.guestList.length);
        this.activeMenuItem = null;
        this.beforeLeaveInit();
        next();
      }).catch(() => {
        next(false);
      });
    }
    // 清空菜单大类小类筛选
    // this.$vemit('clearClassFilter')
  },
  methods: {
    // 添加快捷键
    setMenuBtnHotKey(vm) {
      const hotKey = {};
      each(concat(vm.addMenuBtns, vm.moreBtns), (item) => {
        if (item.hotKey) {
          hotKey[item.hotKey] = () => {
            vm.menuControl(item.name);
          };
        }
      });
      return hotKey;
    },
    // 离开加单界面,路由跳转要执行的方法
    beforeLeaveInit() {
      this.$vemit('clearssRemark');
      this.$vemit('leaveOrdering');
      // 关闭下易盘
      this.$vemit('closeEasydisk');
      this.setETagItems([]);
      // 初始化下预点单过来的数据
      this.setReserveOrderList(null);
      if (this.$refs.billList) {
        this.$refs.billList.clearssRemark();
      }

      if (this.posDevice && this.posDevice.enableVice) {
        // this.$devices.SubMonitor.send({
        //   moduleName: 'SubMonitor',
        //   method: 'ordering',
        //   result: 'back',
        // });
        // 若开启已点品项回显，则在路由跳转前，先清空已点品项缓存 182-1191 by L.R
        if (this.isShowOrdedItems) {
          this.$devices.SubMonitor.send({
            moduleName: 'SubMonitor',
            method: 'clearOrderedItem',
          });
        }
        if (this.posOrderBill) {
          setTimeout(() => {
            this.$devices.SubMonitor.send({
              moduleName: 'SubMonitor',
              method: 'updataItem',
              result: this.posOrderBill.scList, // 菜品信息
              initData: this.posOrderBill.bsData,
              ordering: false,
            });
          }, 20);
        }
      }
    },
    ...mapMutations({
      setETagItems: 'SET_ETAG_ITEMS',
      setMenuBtns: 'SET_MENU_BTNS',
      setPosPointData: 'SET_POS_POINT_DATA',
      setReserveOrderList: 'SET_RESERVEORDER_LIST',
      setLimitsMap: 'SET_ITEMLIMITSMAP',
      setPointGroupId: 'SET_POINTGROUPID',
    }),
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
    // 在输入框里添加搜索文本
    inputKey(key) {
      this.$vemit('addTableSearchTextdInBlur', key);
    },
    // 团购验券
    groupon() {
      this.$refs.groupVerifiedModal.open();
    },
    // 验证会员
    verifiedMember() {
      this.$refs.verifiedMemberModal.open();
    },
    // 修改点餐员
    changeWaiter() {
      this.$refs.changeWaiter.open(this.changeWaiterId, {
        submit: (waiterId) => {
          if (waiterId) {
            this.changeWaiterId = waiterId;
          }
          if (this.posSettings.submitDoodConstraintSelectWaiter) { // 强制选择点菜员 直接加单
            this.$nextTick(() => {
              this.$vemit('submitAddOrderBtnEvent');
            });
          }
        },
      });
    },
    // 打开复制窗口
    async openCopy() {
      const data = await ajax('canyin.pos.addorder.copymenuview', {
        params: {
          pointId: this.posOrderBill.bsData.pointId,
        },
      });
      this.$refs.copyDishes.open(data);
    },
    // 选好了需要复制的菜品
    copyItem(list) {
      this.$refs.menu.$refs.list.addBeforeNum = [];
      list.map((item, index) => {
        if (item.tempItemName) {
          const {
            itemId: id, name, unitId, price: stdPrice,
          } = item;
          ajax('canyin.pos.bill.updateitemtemp', {
            contentType: 'URLEncoded',
            data: {
              id, name, unitId, stdPrice,
            },
          }).then((res) => {
            if (res.success) {
              this.$vemit('posOrderAddDish', { item: res.itData });
            }
          });
        } else {
          const {
            itemId,
            itemSizeId,
            lastQty,
          } = item;
          const finded = find(this.itemsMoreBarcode, {
            id: itemId,
            sizeId: itemSizeId,
          });
          const temp = {};
          if (item.isPackage) {
            item.pkgList.forEach((pkgitem) => { // 复制套餐添加num和添加id
              pkgitem.id = pkgitem.itemId;
              pkgitem.num = pkgitem.qty;
              pkgitem.sizeId = pkgitem.itemSizeId;
              if (pkgitem.methodList) pkgitem.methodList = []; // 做法清空
            });

            temp.raiseMemberPrice = item.raiseMemberPrice; // 单个套餐会员加价总合
            temp.raisePrice = item.pkgRaisePrice; // 套餐加价总合
          }
          // 辅助单位的数量添加
          const auxiliaryUnitQtyObj = {};
          if (finded.auxiliaryUnitId) {
            auxiliaryUnitQtyObj.auxiliaryUnitQty = 1;
          }
          // confirmWeighType 0 普通品项，1、2是称重品项，其中1是未称重，2是已称重
          this.add({
            item: extend({}, finded, {
              orderId: true,
              num: (item.confirmWeighType !== 0) ? 1 : lastQty, // 品项复制-如果是称重品项默认为1
              pkgList: item.pkgList, // 添加套餐列表
              isNotFollowAmount: item.isNotFollowAmount, // 添加是否联动
              isItemTimePrice: item.isItemTimePrice, // 添加是否执行时价
              salePrice: item.salePrice,
              price: item.discFlg === 4 ? item.promotePrice : item.salePrice, // discFlg 5-会员标识 4-促销标识 0-默认的 1-赠送标识 2-打折 3-变价
              ...auxiliaryUnitQtyObj,
              ...temp,
            }),
          }, true);
          // for (let code of (item.num + '')) {
          //   this.$refs.menu.$refs.list.addBeforeNum.push(+code);
          // }`${item.num}`
          // this.$vemit('posOrderAddDish', { item: { ...item, id: item.itemId, discFlg: item.discFlg === 4 || item.discFlg === 5 ? item.discFlg : 0 } });
          // this.$refs.menu.$refs.list.add({...item, id: item.itemId, discFlg: 0, });
        }
      });
    },
    // 更多操作点击事件
    orderingFunction(method) {
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
    // 点击更多后弹出更多对话框
    moreOrderingBtns() {
      this.$refs.moreOrderingBtns.open();
    },
    // 点击加单菜单清空列表
    clearGuestList() {
      this.guestList = [];
    },
    // 初始化下免厨打和团队开单的修改点菜员
    initOrderingSetUpBtns() {
      this.unKitchenPrinting = false; // 免厨打
      this.changeWaiterId && (this.changeWaiterId = null); // 点菜员
      this.isTeamAdd && (this.isTeamAdd = false); // 团队加单
    },
    // List派发出菜品最终合计数据 传递给Control组件
    billLastTotal(total) {
      this.originalTotal = total.orderingItemTotalPrice;
      this.lastTotal = total.orderingItemLastTotalPrice;
      // 如果开启客显才条用执行客显推送
      if (this.posDevice.enableScreen) {
        this.$devices.CDI.total(total.orderingItemLastTotalPrice);
      }
    },
    // //优惠完的合计
    // billOriginalTotal(originalTotal) {
    //   console.log(originalTotal)
    //   this.originalTotal = originalTotal
    // },
    // List派发出当前选中品项数据 传递给OrdingBtns组件设置uid, lid
    changeActiveItem() {
      const item = this.getActiveItem();
      this.activeMenuItem = item;
      setTimeout(() => {
        this.$refs.orderingBtns.setActiveItem(item);
        this.$refs.moreOrderingBtns.setActiveItem(item);
      }, 200);
    },
    // 加单操作 参数addData为一个对象(按需传值) 包含加单品项和加单数量   addData{beforeAddNum: false,item: {}}
    // fromCopy 复制菜品标识
    async add({ item: item2, beforeAddNum }, fromCopy) {
      const item = cloneDeep(item2);
      // 修改预点单过来或者是itemType不存在 判断 添加itemType 属性
      // 判断品项类型 常规套餐 宴会套餐 正常品项
      if (item.orderId || !item.itemType) {
        item.itemType = this.getOrderItemType(item);
      }
      // num 最好是写活了 扫码和智能餐盘 万一传的不是一呢?
      let num = item.num ? item.num : 1; // 可以在这进行赋值
      num = (this.posOrderBill.bsData.tableQty && !item.scId) ? multi(num, this.posOrderBill.bsData.tableQty) : num; // 有席数，品项数量乘以席数, 排除掉读取点菜单的情况
      if (this.setting.isUseSeat !== '1') { // 开启席数功能，不对限量进行判断
        num = this.conutTotal(`${item.id}_${item.sizeId}`) + num > item.limit ? 1 : num; // 已选数量+当前选择数量>限量值
      }
      // 内部使用
      let lid = '-';
      if (!item.id) { // item 里的id有的为空
        // this.$message.error('itemId不存在');
        try {
          [item.id] = item.itemId.split('_');
        } catch (e) {
          console.log(e);
        }
      }
      // 是否走合并的逻辑
      const isDoMerge = !(
        this.posSettings.isMergeAddBill
        || item.itemType === 2
        || item.isWeighed
        || item.isPincai
        || item.isConfirmWeigh
        || item.isPackage
        || item.TagID
        || item.isReveserItem
        || item.isReadOrderItem
        || item.isArrangeItem
        || item.fullGiftId
        || item.exchangeId
      );
      if (
        !isDoMerge
      ) {
        // 读取点菜单后的拼菜的辅菜 的lid需要根据主菜的lid来定制的 详细见方法 showReadOrderItem 的lid
        lid = item.bindId ? item.lid : uniqueId();
      }
      /**
       * 中餐执行会员价判断:
       * 1.促销价 不存在(或为0), 可执行会员价('促'权值 大于 '会');
       * 2.已验证了会员且执行会员价(this.posOrderBill.bsData.memberPriceFlg);
       * 3.会员价存在且有效(可以为0);
       * 方法: 判断为true, 设定价格标示, 当前价格和原价, 和价格类型.
       * 另: +null === 0的问题, eslint改写时, 改为用字符串判断,不在做数字===0判断
       */
      if (
        !(item.promotePrice || `${item.promotePrice}` === '0')
        && this.posOrderBill.bsData.memberPriceFlg
        && (item.memberPrice || `${item.memberPrice}` === '0')
      ) {
        item.discFlg = itemConstantSet.DISC_FLG_MEMBER; // 标识显示类型
        item.origPrice = item.memberPrice; // 价格
        item.price = item.memberPrice; // 价格
        item.priceType = itemConstantSet.PRICE_TYPE_MEMBER; // 价格类型
      }
      const escaped = extend(
        {
          reasonId: '',
          sizeId: '-1',
          discFlg: 0,
          id: '',
          methodList: [],
          serveWayId: '-1',
        },
        item,
        {
          num,
          lid,
        },
      );
      if (fromCopy) {
        escaped.orderId = '';
      }
      // 进行加单最大最小数量限制 读取点菜单不需要判断
      if (
        (escaped.minAddQty || escaped.maxAddQty)
        && this.limitMaxOrMinQty(escaped, beforeAddNum) === false
        && (!item.isReadOrderItem || !item.isArrangeItem)
      ) {
        return;
      }
      if (lid === '-') {
        const finded = find(this.guestList, {
          lid: '-',
          id: escaped.id,
          sizeId: escaped.sizeId,
          methodList: [],
          discFlg: 0,
          itemType: 1,
          serveWayId: escaped.serveWayId,
        });
        if (finded) {
          finded.num = add(finded.num, num);
        } else if (escaped.isReadOrderItem) {
          this.guestList.splice(escaped.readOrderIndex, 0, escaped);
        } else {
          this.guestList.push(escaped);
        }
      } else if (escaped.isReadOrderItem) {
        this.guestList.splice(escaped.readOrderIndex, 0, escaped);
      } else {
        this.guestList.push(escaped);
      }
      if (!item.orderId) {
        this.setActiveItem(escaped);
      }
      // 快速修改数量 优先级高于做法 排除易盘套餐 修改预点单 和 排菜下单 换购品项
      if (
        !item.orderId
        && item.enableEasyDiskModifyQty
        && !item.isPackage
        && !item.TagID
        && !item.isReadOrderItem
        && !item.isArrangeItem
        && !item.exchangeId
        && !item.fullGiftId
      ) {
        await this.changeItemNum();
      }
      this.$refs.billList.scrollToEnd();

      // 如果是精准模式下 扫码加单自动清除助记符
      const { searchMode, isAllowDarkScan } = this.posSettings;
      // 判断模糊模式下是否是扫码简单的
      let isScanCode = this.getCookie('isScanCode');
      if (isScanCode) {
        isScanCode = JSON.parse(isScanCode);
      }
      if (+searchMode === 2 || (isAllowDarkScan && isScanCode)) { // 精准模式或者扫码加单下自动清空助记符
        this.$vemit('menuClearSearchText');
      } else if (this.$store.getters.posSettings.isAutoClearKey) { // 根据设置判断是否清空助记符
        this.$vemit('menuClearSearchText');
      }
      document.cookie = 'isScanCode=false;'; // 这里是为了模糊查询下扫码加单后清空搜索框
      // dedicatedMethodsDefaultPopup这变量是后台快餐专用做法默认弹窗选择 1是、0否 暂时去掉这个判断
      // !item.isPackage 要排除掉套餐的 排除易盘 以及读取保存的点菜单 后续添加getisSetUpGroupMethod 如果是true后台设置了做法分组这个优先级高就不判断专用做法弹框
      if (
        !item.orderId
        && (
          (!this.getisSetUpGroupMethod && item.methodCount > 0)
          || !!(this.getisSetUpGroupMethod && item.haveRequiredMethod)
        )
        && !item.isPackage
        && !item.TagID
        && !item.isReadOrderItem
        && !item.exchangeId
        && !item.fullGiftId
      ) {
        // 非排菜添加的品项弹框
        if (!item.isArrangeItem) {
          const isAddMenuModule = true;
          this.changeItemMethods(isAddMenuModule);
        }
      }
    },
    // 获得cookie值
    getCookie(name) {
      let arr; const
        reg = new RegExp(`(^| )${name}=([^;]*)(;|$)`);
      if (arr = document.cookie.match(reg)) {
        return unescape(arr[2]);
      }
      return null;
    },
    // 加单最大最小数量限制: 点击后加单最小数量 加单不允许超过最大限制 (需考虑是否合并品项情况)
    limitMaxOrMinQty(item, beforeAddNum) {
      // 品项合并情况 (需考虑多规格情况、加单前的数量设置)
      if (!this.posSettings.isMergeAddBill) {
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
            && (item.count >= item.maxAddQty
              || beforeAddNum + item.count > item.maxAddQty)
          ) {
            // 最大数量限制： 品项已点数量与最大限制数量作比较 返回false不执行加菜 (需考虑加单前数量已设置的情况)
            this.$message.warning(this.$t('Biz.BizComm.BizCommTip13', [item.maxAddQty]));
            return false;
          }
        }
        // 多规格情况
        if (+item.sizeId !== -1) {
          // sizeItemList为所选多规格品项的数组 用于判断是否为第一个加此单 和 计算此规格品项的数目sizeItemCount
          const sizeItemList = filter(
            this.guestList,
            _ => _.id === item.id && _.sizeId === item.sizeId,
          );
          let sizeItemCount = reduce(
            sizeItemList,
            (sum, item) => add(sum, item.num),
            0,
          );
          if (item.TagNum) sizeItemCount += item.TagNum; // 如为易盘加单
          // 最小数量限制：第一次加单情况 加最小限制数量的菜 (需考虑加单前数量已设置的情况)
          if (
            item.minAddQty
            && sizeItemList.length === 0
            && beforeAddNum < item.minAddQty
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
      if (this.posSettings.isMergeAddBill) {
        // 每次加单设置最小数量
        if (item.minAddQty && beforeAddNum < item.minAddQty) {
          this.$set(item, 'num', item.minAddQty);
        } else if (item.maxAddQty && beforeAddNum > item.maxAddQty) {
          // 加单前设置的菜品数量超出最大加单限制 返回false不执行加菜
          this.$message.warning(this.$t('Biz.BizComm.BizCommTip13', [item.maxAddQty]));
          return false;
        }
      }
    },
    /**
     * 判断修改预点单过来的数据品项的品项类型
     * @param { Object } item 修改预点单品项数据
     */
    getOrderItemType(item) {
      if (item.isPackage) {
        if (`${item.pkgType}` === '0') {
          return 3;
        }
        return 4;
      }
      return 1;
    },
    // 判断修改预点单过来的数据品项 的品项类型
    changeOrderItem(item) {
      if (item.isPackage) {
        if (+item.pkgType === 0) {
          item.itemType = 3; // 常规套餐品项
        } else if (+item.pkgType === 1) {
          item.itemType = 4; // 宴会套餐品项
        }
      } else {
        item.itemType = 1; // 正常品项
      }
    },
    // List找到所选品项并派发changeActiveItem事件 传递给OrderingBtns使用
    setActiveItem(item) {
      this.$refs.billList.setActiveItem(item);
    },
    // 监听OrderingBtns事件 实现账单右侧功能
    menuControl(methodName) {
      let method = methodName;
      if (method === 'give') {
        method = this.checkGiveStates;
      }
      if (method === 'readOrder' || method === 'orderSave') {
        method = this.checkOrderStates;
      }
      const btnData = this.addMenuBtns.find(item => item.name === method);
      if (method === 'moreOrderingBtns') {
        this[method]();
      } else if (this[method] && btnData.disabled) {
        this[method]();
      }
    },
    // 赠送事件
    give() {
      this.$refs.orderingGive.open(this.getActiveList(), {
        submit: (num, id) => {
          if (num) {
            this.orderingGive(num, id);
          }
        },
      });
    },
    // 取消赠送事件
    cancelGive() {
      this.$refs.orderingCancelGive.open(this.getActiveList(), {
        submit: () => {
          this.orderingCancelGive();
        },
      });
    },
    // 删除按钮 事件
    deleteItem() {
      const active = this.getActiveList()[0];
      // 暂时先放开 易盘
      // if (active.TagID) {
      //   this.$message.warning(this.$t('Biz.Order.AddOrderWarnMsg01'));
      //   return;
      // }
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
    },
    // 删除拼菜的主菜
    deleteSpellFood(spellFood) {
      each(concat(this.getActiveList(), filter(this.guestList, { bindId: spellFood.mBindId })), (item) => {
        if (item.isLimit) {
          this.resetItemLimitsMap(item, 'sub', item.num);
        }

        this.guestList.splice(indexOf(this.guestList, item), 1);
      });
      this.setActiveItem();
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
        if (
          !this.posSettings.isAllowAddOrderWhenLimitZero
          && finded.limitTotal - nums > 0
          && finded.limitTotal - nums < 1
        ) {
          num = finded.limitTotal - nums;
        }
        this.resetItemLimitsMap(finded, 'add', num);
      } else {
        if (finded.limit && nums >= finded.limit) {
          this.$message.warning(this.$t('Biz.BizComm.BizCommTip14', [finded.limit]));
          return 0;
        }
        if (
          !this.posSettings.isAllowAddOrderWhenLimitZero
          && finded.limit - nums > 0
          && finded.limit - nums < 1
        ) {
          num = finded.limit - nums;
        }
      }
      return num;
    },
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
    resetItemLimitsMap(activeItem, method, nums) {
      const itemLimitsMap = _.cloneDeep(this.getVuexItemLimitsMap);
      const newItemLimitsMap = itemLimitsMap[`${activeItem.id}_${activeItem.sizeId}`];
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
      nums = this.conutTotal(`${this.getActiveList()[0].id}_${this.getActiveList()[0].sizeId}`);
      const totalNums = reduce(this.getActiveList(), (sum, item) => add(sum, item.num), 0);
      this.resetItemLimitsMap(this.getActiveList()[0], 'changeNum', this.getActiveList()[0].limitTotal - num - (nums - totalNums));
    },
    // 清空菜品时，限量还回去
    clearLimitsItem() {
      this.guestList.forEach((finded) => {
        if (finded.isLimit) {
          this.resetItemLimitsMap(finded, 'sub', finded.num);
        }
      });
    },
    // + 加加按钮事件
    addItemNum() {
      const finded = this.getCurrentItem();
      if (finded) {
        if (finded.maxAddQty && finded.num >= finded.maxAddQty) {
          this.$log.info(`品项：${finded.itemName}（${finded.code}）数量加1被最大点单数${finded.maxAddQty}拦截`);
          this.$message.warning(this.$t('Biz.BizComm.BizCommTip13', [finded.maxAddQty]));
        } else {
          this.$log.info(`品项：${finded.itemName}（${finded.code}）数量加1`);
          const num = this.handleAddMenuItemFn(finded);
          if (!this.limitItemSamllClsNumJudge(finded, num)) {
            return false;
          }
          finded.num = add(finded.num, num);
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
          const activeItem = this.$refs.billList.getActiveItemData();
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
      this.orderingChangeNum(0.5);
      if (this.getActiveList()[0].isLimit) {
        this.specHalfNum(0.5);
      }
    },
    // 改量 按钮事件
    /** 优化
     * 增加形参，如果是加单快速修改数量的话不需要在找直接传值
     */
    changeItemNum(addItem = null) {
      return new Promise((resolve) => {
        let nums = 0;
        let totalNums = 0;
        let changeList = this.getActiveList() || [addItem];
        const limitId = `${changeList[0].id}_${changeList[0].sizeId}`;
        nums = this.conutTotal(limitId);
        totalNums = reduce(changeList, (sum, item) => add(sum, item.num), 0);
        const limitData = this.cancelLimit(changeList[0]);
        changeList = changeList.map((v) => {
          v = Object.assign({}, v, limitData);
          return v;
        });
        this.$refs.orderingChangeNum.open(
          {
            list: changeList,
            numTotal: nums,
          },
          {
            submit: (num, auxiliaryUnitQty = null) => {
              this.orderingChangeNum(num, auxiliaryUnitQty);
              if (changeList[0].isLimit) {
                this.resetItemLimitsMap(changeList[0], 'changeNum', changeList[0].limitTotal - num - (nums - totalNums));
              }
              resolve(num);
            },
            // close: () => {
            //   resolve();
            // },
          },
        );
      });
    },
    // 改价 按钮事件
    changeItemPrice() {
      const item = this.getActiveList()[0];
      if (item.isPackage) {
        // 如果是套餐的话要在修改套餐里进行修改
        if (+item.pkgType === 0) {
          this.$message({
            type: 'error',
            message: this.$t('Biz.Order.AddOrderErrorMsg01'),
          });
        } else if (+item.pkgType === 1) {
          this.$message({
            type: 'error',
            message: this.$t('Biz.Order.AddOrderErrorMsg02'),
          });
        }
        return;
      }
      this.$refs.orderingChangePrice.open(this.getActiveList(), {
        submit: (price) => {
          this.orderingChangePrice(price);
        },
      });
    },
    // 修改规格
    modifyItemSize() {
      const nowItem = this.getActiveList()[0]; // 获取当前要操作的品项 如果通过改量,列如改6个那么这是第一个元素
      // 由于修改规格在附菜金额为零时会产生金额计算的问题，所以暂时屏蔽掉
      // http://192.168.4.84:88/zentao/bug-view-71618.html
      if (nowItem.bindId) {
        this.$message.warning(this.$t('Biz.Order.LimitMsg001'));
      } else if (nowItem.enableMutiSize) {
        const options = {
          itemId: nowItem.id, // 品项id
          isDinnerBuffet: this.posOrderBill.isDinnerBuffet, // 是否是自助模式
        };
        // 判断add添加的时候缓存的sizeList存在就用,不需要请求接口\ 否则请求接口
        if (nowItem.sizeList && nowItem.sizeList.length) {
          // sizeListData = nowItem.sizeList
          this.modifyItemSizeModule(nowItem, nowItem.sizeList);
        } else {
          ajax('canyin.pos.itemPkgAndSize.itemSize', { params: options })
            .then((res) => {
              if (res.itemSizeList) {
                // 做下客位品项的限定处理
                if (this.getVuexPointData.pointGroupId) {
                  const filterItemSizeList = res.itemSizeList.filter(list => !list.pointGroupId || list.pointGroupId === this.getVuexPointData.pointGroupId);
                  this.modifyItemSizeModule(nowItem, filterItemSizeList);
                } else {
                  this.modifyItemSizeModule(nowItem, res.itemSizeList);
                }
              } else {
                this.$message.error(res.msg);
              }
            })
            .catch(() => {
              this.$message.error(this.$t('Biz.Order.AddOrderErrorMsg03'));
            });
        }
        // let sizeListData = (nowItem.sizeList && nowItem.sizeList.length) ? nowItem.sizeList :
        // 如果是规格就执行一下的
        // 打开弹框 activeSizeId记入当前的规格品项规格id
      } else {
        this.$message({
          type: 'error',
          message: this.$t('Biz.Order.AddOrderErrorMsg04'),
        });
      }
    },
    // 修改规格品项的事件
    modifyItemSizeModule(nowItem, sizeList) {
      this.$refs.orderingModifyItemSize.open(
        { sizeList, activeSizeId: nowItem.sizeId },
        {
          submit: (modifyItemSizeData) => {
            let activeItem = null;
            // 找所有对应的品项
            this.getActiveList().forEach((activeList) => {
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
              activeList.promoteLimit = modifyItemSizeData.promoteLimit;
              activeList.isExchange = modifyItemSizeData.isExchange;
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
            this.$log.info(`修改规格品项${activeItem.id},当前时间===${new Date()}`);
            this.setActiveItem(activeItem);
          },
        },
      );
    },
    // 做法 按钮事件
    changeItemMethods(isAddMenuModule) {
      // 这个是判断触发事件是否是在加单时候的触发的弹框 目前这值后端给的不太准确是集比较大就是true的时候它可能不是关联了必选的做法不需要弹
      isAddMenuModule = isAddMenuModule || false;
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
        // 成功了 进行弹框显示
        if (res.data.code == 1) {
          const methodsData = res.data.data;
          // 如果是做法分组过来的要判断是否是加单过程来的，还要判断 做法分组的数据methodGroupList里是否还有必须的做法分组 requiredGroup
          // 如果是加单的时候过来的并且请求的做法分组的数据不存在或者是数组为空就不需要弹框
          if (this.getisSetUpGroupMethod && isAddMenuModule) {
            if ((!res.data.data.methodGroupList || !res.data.data.methodGroupList.length)) {
              return false;
            }
            const groupMethods = res.data.data.methodGroupList;
            const findRequiredGrop = groupMethods.filter(method => method.requiredGroup);
            if (!findRequiredGrop.length) {
              return false;
            }
          }
          // else if (itemData.methodCount > 0 && isAddMenuModule) { // 暂时先注释掉
          //   // 如果点菜直接过来弹框并且是含有专用做法的
          //   methodsData = {
          //     privateMethodJson: res.data.data.privateMethodJson,
          //     tempMethodJson: res.data.data.tempMethodJson,
          //   }
          // }
          // 传的参数 pkgItem: true
          this.$refs.orderingChangeMethods.open(
            {
              itemData,
              methodsData,
              pkgItem: itemData.isPackage ? itemData.isPackage : false,
            }, {
              submit: (methodData) => {
              // methodData.publicIsValid  这个是boolean 值 为true的话 说明选择的做法中包含通用做法要去现在加单的所有品项有效
                this.$refs.orderingChangeMethods.close();
                this.orderingChangeMethods(methodData);
              },
            },
          );
        } else {
          this.isShowMessage(res.data.msg);
        }
      });
    },
    // 选择排菜单
    arrangeMenu() {
      // 下单时打开的排菜单列表,执行选择菜单并下单, 传值false不显示'新建/复制等功能按钮'
      this.$vemit('openArrangeMenu', false);
    },
    // 清空 按钮事件
    clearItem() {
      this.clearLimitsItem();
      this.guestList.splice(0, this.guestList.length);
      this.setActiveItem();
    },
    // 上菜方式 按钮事件
    changeItemServeWay() {
      if (!this.guestList.length) {
        this.$message({
          type: 'error',
          message: this.$t('Biz.Order.PlsSelectItem'),
        });
        return;
      }
      const itemData = this.getActiveList()[0];
      const {
        isPackage, pkgType, smallClassId, customGroupId,
      } = itemData; // 拿到当前选中的品项的小类和套餐类别
      let activeItemData = {};
      if (itemData.customGroupId) {
        activeItemData = { isPackage, pkgType, customGroupId };
      } else {
        activeItemData = { isPackage, pkgType, smallClassId };
      }
      this.$log.info(`上菜方式记录id${itemData.id},当前时间===${new Date()}`);
      this.$refs.orderingServeWay.open(
        { itemData },
        {
          submit: (serveWayData) => {
            // 执行添加上菜方式
            this.orderingChangeItemServeWay(serveWayData, activeItemData);
          },
        },
      );
    },
    // 9800000000005178
    // 上菜方式渲染 如果有自定义类 则优先于小类
    orderingChangeItemServeWay(serveWayData, activeItemData) {
      // 如果为true说明对正加单的所有品项有效
      const {
        pkgType, customGroupId,
      } = activeItemData;
      let active = 'smallClassId';
      if (customGroupId) {
        active = 'customGroupId';
      }
      if (serveWayData.isOrderingBillAllServeWay) {
        const [...newGuestList] = this.guestList;
        this.guestList = [];
        newGuestList.forEach((list) => {
          if (!list.isPackage) {
            this.$set(list, 'serveWay', serveWayData.serveWay);
          }
          // 给套餐明细添加上菜方式
          if (list.isPackage && list.pkgList.length) {
            list.pkgList.forEach((_) => {
              this.$set(_, 'serveWay', serveWayData.serveWay);
            });
          }
          this.$set(list, 'serveWayId', serveWayData.serveWay.id);
          this.guestList.push(list);
        });
        this.setActiveItem(newGuestList[newGuestList.length - 1]);
        // 对上菜方式是该类品项有效
      } else if (serveWayData.isOrderingBillTypeServeWay) {
        const [...newGuestList] = this.guestList;
        this.guestList = [];
        newGuestList.forEach((list) => {
          if (list[active] == serveWayData.smallClassId) {
            if (+pkgType !== 1) { // 普通品项和常规套餐
              if (list.isPackage && list.pkgList.length) { // 宴会套餐
                list.pkgList.forEach((_) => {
                  if (+list.pkgType === 1) { // 宴会套餐
                    if (activeItemData[active] == _.smallClassId) {
                      this.$set(_, 'serveWay', serveWayData.serveWay);
                    }
                  } else {
                    this.$set(_, 'serveWay', serveWayData.serveWay);
                    this.$set(list, 'serveWay', serveWayData.serveWay);
                  }
                });
              } else if (!list.isPackage) {
                this.$set(list, 'serveWay', serveWayData.serveWay);
              }
            } else {
              // 给套餐明细添加上菜方式
              if (list.isPackage && list.pkgList.length) {
                list.pkgList.forEach((_) => {
                  this.$set(_, 'serveWay', serveWayData.serveWay);
                });
              }
              if (!list.isPackage) {
                this.$set(list, 'serveWay', serveWayData.serveWay);
              }
            }
            if (!list.isPackage) {
              this.$set(list, 'serveWayId', serveWayData.serveWay.id);
            }
          }
          this.guestList.push(list);
        });
        this.setActiveItem(newGuestList[newGuestList.length - 1]);
      } else {
        let curItem = {};
        // 只对自己有效
        this.getActiveList().forEach((_list) => {
          // 给套餐明细添加上菜方式
          if (_list.isPackage && _list.pkgList.length) {
            _list.pkgList.forEach((_) => {
              this.$set(_, 'serveWay', serveWayData.serveWay);
            });
          }
          if (!_list.isPackage) {
            this.$set(_list, 'serveWay', serveWayData.serveWay);
            this.$set(_list, 'serveWayId', serveWayData.serveWay.id);
          }
          curItem = _list;
        });
        this.setActiveItem(curItem);
      }
      this.$refs.orderingServeWay.close();
    },
    // 修改套餐
    modifyItemPackage() {
      if (!this.guestList.length) {
        this.$message({
          type: 'error',
          message: this.$t('Biz.Order.PlsSelectItem'),
        });
        return;
      }
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
      itemPkgData.pkgData.package.lastQty = pkgNum;
      itemPkgData.pkgData.package.discFlg = itemPkgData.discFlg;
      itemPkgData.pkgData.package.salePrice = itemPkgData.salePrice;
      itemPkgData.pkgData.package.memberPrice = itemPkgData.memberPrice;
      itemPkgData.pkgData.package.promotePrice = itemPkgData.promotePrice;
      itemPkgData.pkgData.package.oldPrice = itemPkgData.oldPrice;
      itemPkgData.pkgData.package.price = itemPkgData.price;

      // 常规套餐修改
      if (+itemPkgData.pkgType === 0) {
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
      } else if (+itemPkgData.pkgType === 1) {
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
      if (+itemPkgData.pkgType === 0) {
        ajax('canyin.pos.bill.itempkgnormal', {
          params: {
            pkgId: itemPkgData.id,
            scId: itemPkgData.scId ? itemPkgData.scId : '',
            pointId: this.posOrderBill.bsData.pointId,
            isBuffet: this.posOrderBill.isDinnerBuffet,
          },
        }).then((res) => {
          // 清空分类默认的数据
          res.package.isItemTimePrice = itemPkgData.isItemTimePrice
            ? itemPkgData.isItemTimePrice
            : false;
          res.pkgClasses.forEach((pkgClass) => {
            pkgClass.normalDtList = [];
          });
          res.package.lastQty = pkgNum;
          res.package.discFlg = itemPkgData.discFlg;
          // 循环已点的套餐的明细进行整理数据
          itemPkgData.pkgList.forEach((item) => {
            // 循环请求套餐过来的可点菜品 找到对应进行整理
            res.pkgUnSelectedItems.forEach((pkgItem) => {
              pkgItem.defaultQty = 0;
              if (
                pkgItem.realItemId == item.id
                && pkgItem.itemSizeId == item.sizeId
              ) {
                pkgItem.count = item.num;
                const newPkgeItem = cloneDeep(pkgItem);
                newPkgeItem.raisePrice = item.raisePrice;
                newPkgeItem.count = item.num;
                newPkgeItem.methodList = item.methodList;
                newPkgeItem.serveWay = item.serveWay || null;
                newPkgeItem.serveWayName = item.serveWayName;
                newPkgeItem.serveWayId = item.serveWayId;
                res.pkgClasses.forEach((pkgCls) => {
                  // //找到对应的数据进行整理ｐｕｓｈ进去
                  if (pkgCls.pkgClassId == newPkgeItem.pkgClassId) {
                    pkgCls.normalDtList.push(newPkgeItem);
                  }
                });
              }
            });
          });
          this.$set(res, 'isOrderingModify', true);
          this.$refs.PackageNormalChange.open(res, {
            // 回调的传参中pkgNormalData 代表要用到的数据 pkgData代表套餐弹框原有的数据用来套餐修改
            submit: (pkgNormalData, pkgData) => {
              this.$refs.PackageNormalChange.close(); // 关闭弹框
              this.modifyPkgItemCallback(itemPkgData, pkgNormalData, pkgData);
            },
          });
        });
      } else if (+itemPkgData.pkgType === 1) { // 宴会
        const options = {
          params: {
            pkgId: itemPkgData.id ? itemPkgData.id : itemPkgData.itemId.split('_')[0],
            scId: itemPkgData.scId ? itemPkgData.scId : '',
            pointId: this.posOrderBill.bsData.pointId,
            isBuffet: this.posOrderBill.isDinnerBuffet, // 是否是自助模式
            _t: new Date().getTime(),
          },
          needLog: true,
        };
        ajax('canyin.pos.bill.itempkgpart', options)
          .then((res) => {
            // 重置下接口过来的套餐的主要数据
            res.package.isItemTimePrice = itemPkgData.isItemTimePrice
              ? itemPkgData.isItemTimePrice
              : false;
            res.package.lastQty = itemPkgData.num;
            res.package.price = itemPkgData.price;
            res.package.discFlg = itemPkgData.discFlg;
            res.package.priLocals = null;// 加单修改过来的时候区域价格的显示不能用只能显示当前的价格
            const pkgSelectedItems = cloneDeep(res.pkgSelectedItems);
            res.pkgSelectedItems = [];
            // 循环已点的套餐的明细进行整理数据
            itemPkgData.pkgList.forEach((item) => {
              // 循环请求套餐过来的可点菜品 找到对应进行整理
              let newPkgeItem = null;
              const pkgItem = find(res.pkgUnSelectedItems, { realItemId: item.id, itemSizeId: item.sizeId })
                || find(pkgSelectedItems, { realItemId: item.id, itemSizeId: item.sizeId }); // 默认添加的品项不在销售方案中
              if (pkgItem) {
                newPkgeItem = this.itemPkgItem({ ...pkgItem, stdPrice: item.stdPrice });
              } else {
                newPkgeItem = this.itemPkgItem(item);
              }

              res.pkgSelectedItems.push(
                {
                  ...newPkgeItem,
                  count: item.num,
                  methodList: item.methodList,
                  serveWay: item.serveWay || null,
                  serveWayId: item.serveWayId,
                  serveWayName: item.serveWayName,
                  auxiliaryUnitId: item.auxiliaryUnitId,
                  auxiliaryUnitName: item.auxiliaryUnitName,
                  auxiliaryUnitQty: item.auxiliaryUnitQty,
                },
              );
            });
            this.$refs.PackagePartChange.open(res, {
              submit: (pkgPartData, pkgData) => {
              // 关闭弹框
                this.$refs.PackagePartChange.close();
                this.modifyPkgItemCallback(itemPkgData, pkgPartData, pkgData);
              // this.$vemit('posOrderAddDish', { item: newPkgPartData });
              },
            });
          });
      }
    },
    // 宴会套餐的明细的数据转化
    itemPkgItem(pkgItem) {
      return {
        costPrice: pkgItem.itemType === 2 ? 0 : pkgItem.costPrice,
        defaultQty: 0,
        enableMutiSize: pkgItem.enableMutiSize,
        itemCode: pkgItem.code || pkgItem.itemCode,
        itemId: pkgItem.itemId || pkgItem.id,
        itemName: pkgItem.name || pkgItem.itemName,
        itemSizeId: pkgItem.itemSizeId || pkgItem.sizeId,
        itemUnit: pkgItem.unitName,
        realItemId: pkgItem.realItemId || pkgItem.id,
        unitId: pkgItem.unitId,
        itemType: pkgItem.itemType || 1,
        stdPrice: pkgItem.stdPrice,
      };
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
      newPkgItemData = extend({}, newPkgItemData, { lid, active: true });
      // 添加修改完的数据
      this.guestList.splice(addIndex, 0, newPkgItemData);
      // 重新设置下被选中账单的品项
      this.setActiveItem(newPkgItemData);
    },
    // 免厨打
    skipKitchenList() {
      this.unKitchenPrinting = !this.unKitchenPrinting;
    },
    // 加单的时候是否是团队加单设置
    teamAdd() {
      // this.$refs.teamAdd.open()
      if (this.posOrderBill.bsData.is_team == 0) {
        this.$message.error(this.$t('Biz.Order.LongMsg013'));
        return;
      }
      this.isTeamAdd = !this.isTeamAdd;
    },
    /**
     * 获取当前选中的品项
     */
    getCurrentItem() {
      const active = this.getActiveItem();
      if (active) {
        const finded = findLast(this.guestList, active);
        if (finded) {
          return finded;
        }
        this.$message.error(this.$t('Biz.Order.AddOrderErrorMsg'));
        return false;
      }
      this.$message.warning(this.$t('Biz.Order.AddOrderWarnMsg'));
      return false;
    },
    /**
     * 操作当前选中的品项
     * @param { Function } handler 回调函数，参数finded传回当前操作的品项
     */
    controlCurrentItem(handler) {
      const active = this.getActiveItem();
      if (active) {
        const finded = findLast(this.guestList, active);
        if (finded) {
          handler(finded);
        } else {
          this.$message.error(this.$t('Biz.Order.AddOrderErrorMsg'));
        }
      } else {
        this.$message.warning(this.$t('Biz.Order.AddOrderWarnMsg'));
      }
    },
    // 控制所选品项，回调返回选中值
    controlActive(handler, onlyLast) {
      const active = this.getActiveItem();
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
          this.setActiveItem(active);
          this.$log.info(`+-删除操作菜品记录id${active.id},当前时间===${new Date()}`);
        } else {
          this.$message.error(this.$t('Biz.Order.AddOrderErrorMsg'));
        }
      } else {
        this.$message.warning(this.$t('Biz.Order.AddOrderWarnMsg'));
      }
    },
    // 调用加单列表中的方法 拿到所选品项,这里判断很重要!!
    getActiveItem() {
      if (this.$refs.billList && this.$refs.billList.getActiveItem()) {
        return this.getItemsByElId(this.$refs.billList.getActiveItem());
      }
      return null;
    },
    // 根据 elId 查找账单列表
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
        discFlg: parseInt(el[3], 0),
        reasonId: el[4],
        serveWayId: el[5],
      };
    },
    // 加单列表中筛选出 所选品项的列表 这个是个数组 因为把改量和+的都已push的形式添加进去的渲染的时候在Bill文件夹下的List.vue里又新根据lid 和uid重新合并一起
    getActiveList() {
      return filter(this.guestList, this.getActiveItem());
    },
    // 赠菜业务
    orderingGive(num, id) {
      let lastActive = null;
      let isHaveRelaCountMethod = false;
      // 记录下要修改的数量
      const giveNum = num;
      const lists = this.getActiveList();
      const activeNum = lists.reduce((sum, item) => add(sum, item.num), 0);
      each(lists, (item) => {
        // 判断如果当前操作的品项含有做法并且是固定的做法类型
        // 执行部分赠送的时候被赠送的品项是不行含有做法的
        isHaveRelaCountMethod = isHaveRelaCountMethod || (item.methodList
            && item.methodList.some(method => method.price && !method.isRelaCount)
        );
        if (num > 0) {
          if (num < item.num) {
            const diff = sub(item.num, num);
            const noGiveItem = extend({}, item, { num: diff });
            item.num = num;
            this.guestList.push(noGiveItem);
          }
          // 赠菜之前先保存一下老的discFlg 为的是取消赠菜把标识还原回去
          this.$set(item, 'oldDiscFlg', item.discFlg);
          item.discFlg = 1;
          item.reasonId = id;
          lastActive = item;
          num = sub(num, item.num);
        } else {
          return false;
        }
      });
      // 判断是否含有固定做法并且是部分赠送的时候
      if (isHaveRelaCountMethod && activeNum > giveNum) {
        lists.forEach((list) => {
          if (+list.discFlg === 1) {
            this.$delete(list, 'methodList');
          }
        });
      }
      this.$log.info(`赠菜记录id${lastActive.id},当前时间===${new Date()}`);
      this.setActiveItem(lastActive);
    },
    getOrderingElId(item) {
      return [
        item.lid,
        item.id,
        item.sizeId,
        item.serveWay ? item.serveWay.id : '-1',
      ].join('.');
    },
    // 取消赠菜业务
    orderingCancelGive() {
      let activeItems = [];
      let lastActive = null;
      const methodSet = new Set();
      const activeElId = this.getOrderingElId(this.getActiveItem());
      activeItems = this.guestList.filter(list => activeElId === this.getOrderingElId(list));
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
      // filter(this.guestList, this.getActiveItem());
      // console.log(this.getActiveList())
      // each(this.getActiveList(), (item) => {
      //   item.discFlg = item.oldDiscFlg;
      //   item.reasonId = '';
      //   lastActive = item;
      // });
      // activeElId = this.getOrderingElId(lastActive);
      // activeItems = this.guestList.filter(list => {
      //   return this.getActiveItem(list) === activeElId;
      // })
      // let method_lists = [];
      // let isCheckedMethod = false;
      //   //  这块处理主要是针对 赠送取消后合并，如果没被赠送的品项上有做法合并完要带上
      // if (activeItems.length > 1) {
      //   isCheckedMethod = activeItems.some((item, index) => {
      //     if (item.methodList && item.methodList.length) {
      //       method_lists = cloneDeep(item.methodList);
      //       return true;
      //     }
      //   })
      //   // 找到对应带做法的品项给每个品项都赋值
      //   if (isCheckedMethod) {
      //     this.guestList.forEach(item => {
      //       if (this.getActiveItem(item) === activeElId){
      //         item.methodList = method_lists
      //       };
      //     })
      //   }

      this.$log.info(`取消赠菜记录id${lastActive.id},当前时间===${new Date()}`);
      this.setActiveItem(lastActive);
    },
    // 小类数量限定判断
    limitItemSamllClsNumJudge(item, changeNum) {
      const limitSmallClsItemNum = this.haveLimitSmallClasses[item.smallClassId];
      if (limitSmallClsItemNum) {
        // 入库的当前菜对应的小类已点的总数
        const orderItemSmClsTotal = this.getActiveOrderItemSmClsTotal(item.smallClassId);
        const orderingItemSmClsTotal = this.getActiveOrderItemSmClsTotal(item.smallClassId, this.guestList, 'num');
        if (limitSmallClsItemNum < add(orderingItemSmClsTotal, add(orderItemSmClsTotal, changeNum))) {
          this.$message.error(`菜品所属小类限定数为${limitSmallClsItemNum}`);
          return false;
        }
      }
      return true;
    },
    // 改量业务
    /**
     * num - 品项数量
     * auxiliaryUnitQty - 辅助单位的数量
     */
    orderingChangeNum(num, auxiliaryUnitQty) {
      if (num >= this.getActiveCount()) {
        const diff = sub(num, this.getActiveCount());
        const finded = this.getCurrentItem();
        if (finded) {
          // 称重确认品项不取判断
          if (!finded.isConfirmWeigh && !this.limitItemSamllClsNumJudge(finded, diff)) {
            return false;
          }
          finded.num = add(finded.num, diff);
          if (auxiliaryUnitQty) {
            finded.auxiliaryUnitQty = auxiliaryUnitQty;
          }
        }
      } else if (num && this.getActiveCount() > num) {
        let diff = sub(this.getActiveCount(), num);
        each(this.getActiveList(), (item) => {
          if (diff !== 0) {
            // 如果减的数量大于或者是等于当前数值那么就删除
            if (diff >= item.num) {
              this.guestList.splice(indexOf(this.guestList, item), 1);
              diff = sub(diff, item.num);
            } else {
              // 半份的时候
              this.guestList.splice(
                indexOf(this.guestList, item),
                1,
                extend({}, item, { num: sub(item.num, diff), auxiliaryUnitQty }),
              );
            }
          }
        });
      }
    },
    // 改价业务
    orderingChangePrice(price) {
      this.controlActive((finded) => {
        // 赠菜的优先级高于变价
        if (finded.discFlg === 1) {
          return;
        }
        finded.discFlg = 3;
        finded.price = price;
        finded.priceType = 4;
      });
    },
    // 改做法业务
    orderingChangeMethods(methodData) {
      // methodList
      // 所有作法的加价总额
      // const methodsPriceTotal = 0;
      // 对所有加单品项有效
      if (methodData.publicIsValid) {
        const [...newGuestListData] = this.guestList; // 克隆下
        this.guestList = []; // 清空下
        // let isPriceMethod = false; // 是否是有价格的做法
        newGuestListData.forEach((list) => {
          // methodsPriceTotal = 0;
          // 这个后期可能去掉,套餐也要支持做法带价格
          // methodData.methodList.forEach((method) => {
          //   // 是否需要制作费用计算下所有的做法费用的价格总额
          //   if (method.price) {
          //     isPriceMethod = true;
          //     // isRelaCount是否按数量加价
          //   }
          // });
          // 这里对套餐品项做下特殊处理, 套餐主品项不能添加做法
          if (list.isPackage) {
            this.guestList.push(list);
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
          // this.$set(list, 'methodList', methodData.methodList);
          if (!list.isPincai) {
            this.$set(list, 'lid', uniqueId());
          }
          this.guestList.push(list);
          this.setActiveItem();
        });
      } else {
        // 只对自己有效
        let curItem = {};
        this.getActiveList().forEach((_list) => {
          this.$set(_list, 'methodList', methodData.methodList);
          if (!_list.isPincai) {
            this.$set(_list, 'lid', uniqueId());
            this.setActiveItem(_list);
          }
          curItem = _list;
        });
        this.setActiveItem(curItem);
      }
    },
    // 获取当前选中的拼菜数据
    getSpellFoodList() {
      const list = this.getActiveList();
      // 如果点击的是辅菜话需要找到主菜
      if (list[0].bindId) {
        const mSpellFood = filter(this.guestList, { mBindId: list[0].bindId });
        return concat(mSpellFood, filter(this.guestList, { bindId: list[0].bindId }));
      }
      // 如果是主菜的话需要拿 mB
      return concat(list, filter(this.guestList, { bindId: list[0].mBindId }));
    },
    // 拼菜业务
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
          // 重置下被选中的字段
          this.$refs.billList.setCurrentItem(spellList[0]);
        },
      });
    },
    // 保存点菜单
    orderSave() {
      // 数据整理
      const orderSaveItems = this.$refs.billList.submitDish();
      if (orderSaveItems.length) {
        // 记录日志
        const isLog = true;
        const saveParams = {
          orderSource: 1,
          point_id: this.posOrderBill.bsData.pointId, // 客位
          controlMode: this.getVuexPosMode, // pos模式
          isLog,
          items: orderSaveItems,
          fastType: 0,
          requestType: 0, // 加单请求类型-前台营业REQUEST_TYPE_BUSINESS 默认为0
          isPrint: 0, // 是否打印点菜确认单
        };
        this.$confirm(this.$t('Biz.Order.LongMsg014'), this.$t('Dict.Tips'), {
          distinguishCancelAndClose: true,
          confirmButtonText: `${this.$t('Dict.TrueVal')}(Enter)`,
          cancelButtonText: `${this.$t('Dict.FalseVal')}(Esc)`,
          type: 'warning',
        }).then(() => {
          this.doOrderSave(saveParams, { isPrint: 1 });
        }).catch((action) => {
          if (action === 'cancel') {
            this.doOrderSave(saveParams);
          } else {
            // alert('取消保存');
          }
        });
      } else {
        this.isShowMessage(this.$t('Biz.Order.LimitMsg002'));
        return false;
      }
    },
    // 保存事件
    doOrderSave(saveParams, isPrint) {
      const params = {
        ...saveParams,
        ...isPrint,
      };
      this.$vonce('authCode', (code) => {
        this.orderSaveAjax(params, code);
      });
      // 请求接口
      this.orderSaveAjax(params);
    },
    // 点餐保存请求
    orderSaveAjax(params, authData = {}) {
      ajax('canyin.pos.ordering.orderSave', {
        contentType: 'paramsEncoded',
        needToken: true,
        data: {
          ...params,
          ...authData,
        },
      }).then((res) => {
        this.$message({
          showClose: true,
          message: res.msg,
          type: 'success',
          customClass: 'user-defined-message-style',
        });
        // 清空下已保存好的菜品
        this.clearGuestList();
        // 打印点菜单
        if (res.printScOrderList) {
          this.$devices.Printer.print(res.printScOrderList);
        }
        setTimeout(() => {
          this.$vemit('loadBill', this.posOrderBill.bsData.pointId);
          this.$router.push('/pos/order');
        }, 200);
      });
    },
    // 读取点菜单
    readOrder() {
      if (this.readOrderLock) {
        return !this.readOrderLock;
      }
      this.readOrderLock = true;
      ajax('canyin.pos.bill.pointscorderinfo', {
        params: {
          pointId: this.posOrderBill.bsData.pointId,
        },
      }).then((res) => {
        res = res.data;
        if (res.success) {
          this.isShowMessage(this.$t('Biz.Order.ReadSuccess'), 'success');
          // 判断当前的客位是否执行会员
          const isDoMember = (this.posOrderBill.crmMemberQueryData.data
            ? this.posOrderBill.crmMemberQueryData.data.memberDiscountId == 2
            : false)
          || this.posOrderBill.bsData.memberPriceFlg;
          if (res.data && res.data.scList.length) {
            this.showReadOrderItem(res.data.scList, isDoMember);
          }
          setTimeout(() => {
            this.$vemit('loadBill', this.posOrderBill.bsData.pointId);
          }, 200);
        } else {
          this.isShowMessage(res.msg);
        }
        this.readOrderLock = false;
      }).catch((errCode, msg) => {
        this.readOrderLock = false;
        this.$alert(msg, this.$t('Dict.Tips'));
      });
    },
    // 对保存的点菜品项进行回显
    showReadOrderItem(readOrderList, isDoMember = false) {
      // isDomemberPrice判断当前是否执行了会员价 这个主要是针对常规套餐的明细加价的会员价
      readOrderList.forEach((item, index) => {
        const finded = find(this.itemsMoreBarcode, {
          id: item.itemId,
          sizeId: item.itemSizeId,
        });
        let otherPrice = item.salePrice; // 销售价格
        // 匹配区域价格
        if (
          finded
          && `${this.areaType}` !== '0'
          && JSON.stringify(finded.otherPrice) !== '{}'
          && (+finded.discFlg) !== 4
          && item.discFlg !== 3
          && item.discFlg !== 1
          && !finded.isItemTimePrice
          && !item.mergeScId // 排除拼菜的子数据
        ) {
          otherPrice = finded.otherPrice[`${this.areaType}`];
        }
        let loadItem = {
          num: item.lastQty,
          isPincai: item.busiType === 1,
          oldDisFlg: item.discFlg === 1 ? 0 : item.discFlg,
          oldPriceType: item.priceType,
          defaultPriceType: (item.discFlg === 1 || item.discFlg === 0) ? 1 : item.priceType,
          isPack: item.packFlg,
          discFlg: (itemConstantSet.DISC_FLG_PRESENT === item.discFlg
          || itemConstantSet.DISC_FLG_CHANGEPRICE === item.discFlg || item.exchangeId)
            ? item.discFlg : finded ? finded.discFlg : item.discFlg, // 如果是赠送的和变价,或者是换购促销的,的传过来什么走什么否则取最新的
          isReadOrderItem: true, // 是否是读取点菜单过来的
          readOrderIndex: index,
          methodList: item.methodList,
          salePrice: otherPrice,
          price: `${item.priceType}` === '3' ? item.promotePrice : otherPrice,
          pkgList: item.pkgList ? item.pkgList : [],
          reasonId: item.rzFreeId ? item.rzFreeId : '',
          isNotFollowAmount: item.isNotFollowAmount,
          readOrderScId: item.scOrderId, // 保存下点菜保存生成的scId， 用来后面处理拼菜做准备
          auxiliaryUnitQty: item.auxiliaryUnitQty,
          auxiliaryUnitId: finded && finded.auxiliaryUnitId ? finded.auxiliaryUnitId : item.auxiliaryUnitId,
          auxiliaryUnitName: finded && finded.auxiliaryUnitId ? finded.auxiliaryUnitName : item.auxiliaryUnitName,
          exchangeId: item.exchangeId,
          fullGiftId: item.fullGiftId,
        };
        // 如果过来的数据是拼菜并且是辅菜需要处理下
        if (!!item.mergeScId && (item.busiType === 1 || item.busiType === 2)) {
          const finded = find(this.guestList, { readOrderScId: item.mergeScId });
          if (finded) {
            if (!finded.mBindId) {
              // 给主菜设置下关联辅菜的标识
              this.$set(finded, 'mBindId', this.getBindId(finded));
            }
            // 给辅菜添加bindId用来找主菜的
            this.$set(loadItem, 'bindId', this.getBindId(finded, item.mergeScId));
            // 根据主菜的lid来拼接一个lid 用来主菜来辅菜，还有删除功能
            this.$set(loadItem, 'lid', `${finded.lid}|-`);
            // 添加itemType类型后端没给
            this.$set(loadItem, 'itemType', finded.itemType);
          }
        }
        if (`${item.serveWayId}` !== '0') {
          // 上菜方式数据
          const serveWay = {
            serveWay: {
              id: item.serveWayId,
              name: item.serveWayName,
            },
          };
          loadItem = {
            ...loadItem,
            ...serveWay, // 上菜方式的数据
            serveWayId: item.serveWayId,
          };
        } else {
          // 为了迎合在加单的时候的serveWayId和加单处理一样
          // 详细参见 Oreder/Bill/List.vue 下的getElId 方法（不知道为什么为'-1' 我没法初始为'-1'）
          item.serveWayId = '-1';
        }
        // 常规套餐的品项加价的合计处理
        if (item.isPackage && `${item.pkgType}` === '0') {
          this.$set(loadItem, 'raisePriceType', isDoMember ? 2 : 1);
          loadItem = extend({}, loadItem, {
            raisePriceType: isDoMember ? 2 : 1,
            raisePrice: item.pkgRaisePrice,
            raiseMemberPrice: item.raiseMemberPrice,
          });
        }
        // 如果是套餐的话需要对明细进行重组数据
        if (item.pkgList && item.pkgList.length) {
          const pkgList = [];
          // const pkgListTotalMakeFee = 0;
          item.pkgList.forEach((pkgItem, index) => {
            // 常规套餐含有品项的加价
            let clonePkgItem = this.regroupPkgList(pkgItem);
            // 如果是常规套餐的话明细需要加价的一些参数
            if (`${item.pkgType}` === '0') {
              clonePkgItem = extend({}, clonePkgItem, {
                isRaiseByQty: pkgItem.isRaiseByQty,
                raiseMemberPrice: div(pkgItem.raiseMemberPrice, pkgItem.lastQty) || null,
                raisePrice: div(pkgItem.raisePrice, pkgItem.lastQty),
                raisePriceType: isDoMember ? 2 : 1,
              });
            }
            pkgList.push(clonePkgItem);
          });
          loadItem.pkgList = pkgList;
          loadItem.pkgListTotalMakeFee = item.isNotFollowAmount ? item.lastMakeFee : (item.lastMakeFee * 1000) / (item.lastQty * 1000);
        }
        // 对数据进行稍微的调整 如果菜单里能找到的用菜单的，避免菜品数据的价格还有一个特性变化
        // 找不到就用当前的防止报错
        item = finded ? extend({}, finded, loadItem) : extend({}, item, loadItem);
        this.add({ item, beforeAddNum: false });
      });
    },
    // 满赠查询数据
    addFullGift(objectData = {}) {
      const params = objectData.submitItems || this.$refs.billList.submitDish();
      const { callback } = objectData;
      ajax('canyin.pos.settlement.getdiscplanbyfullgift', {
        contentType: 'paramsEncoded',
        data: {
          items: params,
        },
      }).then((res) => {
        if (callback) {
          callback();
        }
        // 如果是从结算过如果不满足满赠条件直接去结算
        if (callback && !res.fullGiftList.length) {
          this.$vemit('submitAddOrderBtnEvent', { isDoRedemption: true, isDofullGift: true });
          return false;
        }
        this.goToFullGift(res, !!callback);
      });
    },
    // 满赠
    goToFullGift(data, isComeSettle) {
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
      this.$refs.fullGift.open({ ...data, tableActiveIndex, addFullGiftList }, {
        submit: (params) => {
          this.guestList = this.guestList.filter(item => !item.fullGiftId);
          // 销售方案不存在的
          const noFindItems = [];
          params.forEach((redeItem) => {
            const item = this.itemsMoreBarcode.find(items => `${items.id}_${items.sizeId}` === `${redeItem.itemId}_${redeItem.sizeId}`);
            if (item) {
              this.add({ item: Object.assign({}, item, redeItem), beforeAddNum: false });
            } else {
              noFindItems.push(redeItem.itemName);
            }
          });
          setTimeout(() => {
            this.setActiveItem();
          }, 0);
          if (noFindItems.length) {
            this.$message.error(`${noFindItems.join(',')}${this.$t('Biz.Order.TheItemNotExist')}`);
          } else if (isComeSettle) {
            setTimeout(() => {
              this.$vemit('submitAddOrderBtnEvent', { isDoRedemption: true, isDofullGift: true });
            }, 0);
          }
        },
      });
    },
    /**
     * 套餐明细的数据转化
     */
    regroupPkgList(item) {
      return {
        id: item.itemId, // 品项id
        sizeId: item.itemSizeId, // 品项规格id
        realItemId: item.itemId,
        code: item.code, // 品项code
        name: item.name, // 品项名称
        unitId: item.unitId, // 品项单位id
        unitName: item.unitName, // 品项单位名称z
        costPrice: item.cost_price, // 品项成本价格
        stdPrice: item.sale_price,
        num: Number(item.qty), // 已点的品项数量
        isSellout: item.isSellout, // 是否是估清
        methodList: item.methodList ? item.methodList : [], // 做法
        serveWay: item.serveWayId !== '0' ? {
          id: item.serveWayId,
          name: item.serveWayName,
        } : null, // 上菜方式
        serveWayName: item.serveWayName,
        serveWayId: item.serveWayId,
        smallClassId: item.smallClassId, // 套餐明细的小类id
        apportionFlg: item.apportionFlg !== false, // 是否参与分摊
        auxiliaryUnitId: item.auxiliaryUnitId, // 辅助单位id
        auxiliaryUnitName: item.auxiliaryUnitName, // 辅助单位名称
        auxiliaryUnitQty: item.auxiliaryUnitQty, // 辅助单位数量
      };
    },
    // 套餐明细做法的明细做法的和计算
    getItemMethodTotalPrice(methodList, pkgItemQty) {
      return reduce(
        methodList,
        (sum, item) => add(sum, item.price
          ? item.isRelaCount
            ? multi(multi(item.price, item.qty), pkgItemQty)
            : multi(item.price, item.qty)
          : 0),
        0,
      );
    },
    /**
     * 通过后台提供的mergeScId生成对应的elId
     * @param { String } mergeScId 后台提供的mergeScId，对应主菜的scId
     */
    getBindId(finded = null, mergeScId) {
      finded = finded || find(this.guestList, { scId: mergeScId });
      if (finded) {
        return [
          finded.lid,
          finded.id,
          finded.sizeId,
          finded.discFlg,
          finded.reasonId ? finded.reasonId : '',
          finded.serveWayId,
        ].join('.');
      }
      return null;
    },
    // 所选品项的总数量
    getActiveCount() {
      return reduce(
        this.getActiveList(),
        (sum, item) => add(sum, item.num),
        0,
      );
    },
    // 提示的公共方法
    isShowMessage(message, type, duration) {
      const options = {
        showClose: true,
        message: message || this.$t('Dict.PromptInfo'), // 提示的内容
        type: type || 'error', // 类型 success/warning/info/error
        duration: duration || 1500, // 显示的时间
      };
      this.$message(options);
      // Message(options); // 需要多的可以查看element-ui 的官网 Message组件
    },
    /**
     * @函数说明    更新下当前的选择的客位信息
     * @修改历史
     * 2018/8/27 马秋瑶 创建
     *
     */
    updateActiveTable(pointId) {
      const pointData = find(this.posTables, { id: pointId });
      this.setPosPointData(pointData);
    },
    /**
     * @函数说明  修改预点单,带过来的品项数据列表整理和渲染
     * @修改历史
     * 2018/7/12 马秋瑶 创建
     *
     */
    renderingReserveOrderBillList(reserveOrderData) {
      this.updateActiveTable(reserveOrderData.pointId);
      const list = cloneDeep(reserveOrderData.orderingData);
      list.forEach((_) => {
        // 给预点单过来的品项添加个标识
        this.itemsMoreBarcode.forEach((item) => {
          if (`${_.sizeId}` === '-1' || !_.sizeId) { // 当前菜品不是多规格
            if (_.id == item.id) {
              // beforeAddNum 是 数字快捷键
              this.add({ beforeAddNum: false, item: Object.assign({ isReveserItem: true }, item, _) });
            }
          } else {
            const prePointItemSizeId = `${_.id}_${_.sizeId}`; // 预点的多规格
            const itemSizeId = `${item.id}_${item.sizeId}`;
            if (prePointItemSizeId == itemSizeId) {
              // beforeAddNum 是 数字快捷键
              this.add({ beforeAddNum: false, item: Object.assign({ isReveserItem: true }, item, _) });
            }
          }

          // _.id == item.id && this.add(Object.assign({}, item, _))
        });
      });
    },
    // 获取账单数据 优化：单个set => Action应改为Mutation
    ...mapActions(['getOrderBill']),
    // 预定单开台关联排菜话执行加单操作
    doBookingAddOrder(orderId) {
      ajax('canyin.pos.arrangemenubase.findmenudetailforbooking', {
        params: { orderId },
      }).then((res) => {
        if (res.list && res.list.length) {
          //
          //           pkgItemData: {
          //   detailOfList: this.activeDetailOfList, // 排菜类和菜品数据
          //   price: Number(this.menuActiveItem.itemPrice), // 模板套餐的显示价格
          //   remark: this.menuActiveItem.remark, // 排菜单的加单备注
          //   menuMode: '1',
          // },
          res.list.forEach((item) => {
            const arrangeItemData = this.handleBookingArrangeItem(item);
            this.$vemit('doneArrangeMenuOrder', {
              pkgItemData: arrangeItemData,
            });
          });
        }
      });
    },
    // 预订关联排菜的数据组装
    handleBookingArrangeItem(list) {
      if (+list.menu.menuMode === 1) {
        return {
          detailOfList: list.detail, // 排菜类和菜品数据
          price: Number(list.menu.itemPrice), // 模板套餐的显示价格
          remark: list.menu.remark, // 排菜单的加单备注
          menuMode: '1',
        };
      }
      return {
        itemId: list.menu.itemId, // 模板套餐的品项id
        detailOfList: list.detail, // 模板套餐的明细分类组和组内的数据
        salePrice: Number(list.menu.itemPrice), // 模板套餐的销售价格
        price: Number(list.menu.itemPrice), // 模板套餐的显示价格
        remark: list.menu.remark, // 排菜单的加单备注
        name: list.menu.name, // 排菜模板的名称
        isNotFollowAmount: list.menu.isNotFollowAmount || false, // 排菜模板的联动与不联动判断
        qty: list.menu.tableNum, // 预定关联的排菜单桌数就是数量
        menuMode: '0',
      };
    },
    // 换购
    /**
     * addOrderItems Object 是提交加单之前请求下当前是否是需要换购
     * objectData Oject 里面 submitItems 加单品项数据 callback 还有个回调函数
     * activeItem object 是单品数量的换购模式 当前满足换购条件的菜品数据
     */
    redemption(objectData = {}) {
      const params = objectData.submitItems || this.$refs.billList.submitDish();
      const { activeItem, callback } = objectData;
      const exchangeMode = activeItem ? 1 : 0;
      // 如果 加单数据
      if (params.length) {
        ajax('canyin.pos.settlement.getdiscplanbyexchange', {
          contentType: 'paramsEncoded',
          data: {
            items: params,
            exchangeMode,
          },
        }).then((res) => {
          // 如果是结算那调的没有数据 直接去结算
          if (callback) {
            callback();
          }
          if (callback && !res.exchangeList.length) {
            this.$vemit('submitAddOrderBtnEvent', { isDoRedemption: true });
            return false;
          }
          // 是 提交加单时自动触发的 如果长度为0 就直接返回
          if (!res.exchangeList.length) {
            this.$message.error(this.$t('Biz.Order.RepurchasePlanTip07'));
            return false;
          }
          const { exchangeList } = res;
          // 加单金额模式
          if (exchangeMode === 0) {
            this.moneyRedemption(exchangeList, callback);
          } else {
            this.singleNumRedemption({ activeItem, exchangeList, callback });
          }
        });
      }
    },
    // 按 加单金额模式进行换购
    moneyRedemption(exchangeList, callback) {
      let exchangeIndex = 0;
      let redeItems = []; // 代表也添加的换购品项
      // 过来出来已添加换购的品项 item.exchangeId && !(item.mergeScId || item.exchangeMode === 1)
      const filterItems = this.guestList.filter(item => item.exchangeId && !(item.mergeScId || item.exchangeMode === 1));
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
      if (redeItems.length) {
        exchangeIndex = exchangeList.findIndex(item => item.exchangeId === redeItems[0].exchangeId);
        exchangeIndex = exchangeIndex <= 0 ? 0 : exchangeIndex;
      }
      console.log(redeItems, exchangeIndex);
      this.$refs.redemption.open({
        redeItems, exchangeList, exchangeIndex,
      }, {
        submit: (data) => {
          this.handleRedemptionData(data, callback);
        },
      });
    },
    // 单品数量换购
    singleNumRedemption(redemptionData) {
      const { exchangeList, activeItem, callback } = redemptionData;
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
        redeItems,
        exchangeList,
        exchangeIndex,
        activeItem,
      }, {
        submit: (submitItem, item) => {
          this.handleRedemptionData(submitItem, callback, item);
        },
      });
    },
    // 处理换购数据的回显方法
    /**
     * data Object 换购品项数据
     * callback 这个是回调
     * activeItem 执行单品数量模式 符合条件的品项
     */
    handleRedemptionData(data, callback, activeItem) {
      // 获取 当前执行的换购模式类型 0 - 加单金额 1- 单品数量
      const noFindItem = []; // 如果没找到给与提示
      const singRedemptionItems = []; // 已选单品数量换购的品项
      if (data.length) {
        const { exchangeMode } = data[0];
        if (exchangeMode === 0) {
          // 如果
          this.guestList = this.guestList.filter(item => !(item.exchangeId && !(item.exchangeMode === 1 || item.mergeScId)));
        } else {
          // 单品数量模式
          let redemptionNum = 0; // 已包含换购品项条数
          if (activeItem.redemptionNum || activeItem.redemptionNum === 0) {
            redemptionNum = activeItem.redemptionNum;
          } else {
            redemptionNum = this.guestList.slice(activeItem.index + 1).filter(list => (list.mergeScId && list.mergeScId === activeItem.scId && list.exchangeId)).length;
          }
          this.guestList.splice(activeItem.index + 1, redemptionNum);
        }
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
      }
      // 给后端的一个标识 busiType
      if (singRedemptionItems.length) {
        this.$set(this.guestList[activeItem.index], 'mBindId', activeItem.mBindId);
        this.$set(this.guestList[activeItem.index], 'busiType', 2);
        this.$set(this.guestList[activeItem.index], 'redemptionNum', singRedemptionItems.length); // 这个品项下参与换购的条数
        this.guestList.splice(activeItem.index + 1, 0, ...singRedemptionItems);
        // 来自结算
        setTimeout(() => {
          this.setActiveItem(singRedemptionItems.pop());
        }, 0);
      } else {
        setTimeout(() => {
          this.setActiveItem();
        }, 0);
      }
      // 如果存在找不到的品项 ，不能直接提交
      if (noFindItem.length) {
        this.$message.error(this.$t('Biz.Pos.RedemptionError', [noFindItem.join('、')]));
      } else if (callback) {
        setTimeout(() => {
          this.$vemit('submitAddOrderBtnEvent', { isDoRedemption: true });
        }, 50);
      }
    },
  },
  watch: {
    guestList(val, oldval) {
      // 改变加单和未加单的状态 只有在两个极限就是val.length发生变化的时候才处理
      if (!oldval.length && val.length || (oldval.length && !val.length)) {
        this.$vemit('changeOrderingState', !val.length);
      }
      if (!val.length) {
        this.activeMenuItem = null;
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

//== window ( bill window )

//** background color
@pos-order-bill-bg: rgba(255, 255, 255, 0.9);
//** shadow
@pos-order-bill-shadow: 0 0 8px @gray-dark;

.pos-ordering-container {
  position: relative;
  height: 100%;
  padding-left: @pos-order-left-width;
}

.pos-ordering-window {
  position: absolute;
  left: 0;
  top: 0;
  .size(@pos-order-left-width, 100%);
  padding-right: @pos-order-btns-width;
}

.pos-ordering-bill {
  position: relative;
  height: 100%;
  padding-top: @pos-order-bill-info-height;
  padding-bottom: @pos-order-bill-control-height;
  background-color: @pos-order-bill-bg;
  .box-shadow(@pos-order-bill-shadow);
  &.has-crmInfo {
    padding-top: @pos-order-bill-info-height + @pos-order-bill-crminfo-height;
  }
}
.lang-enUS {
  .pos-ordering-container {
    padding-left: 390px;
  }
}
</style>
