<template>
<!-- "SubScreenStarting": "副屏正在启动中" -->
  <div
    class="pos-main-container"
    tabindex="-1"
    v-loading="loading2"
    :element-loading-text="$t('Biz.Order.SubScreenStarting')"
    element-loading-background="rgba(0, 0, 0, 0.8)">
    <Header
      ref="posHeader"
      @modifyPassword="modifyPassword"
      @offWork="offWork"
      @more="moreModule"
      @closeNotify="closeNotify"
      :moduleList="moduleList"
      :isOrdering="isOrdering"
    ></Header>
    <div class="pos-main-content">
      <div class="pos-main-module-list">
        <keep-alive>
          <router-view
            ref="posView"
            @operation="moreOperation"
            :connectState="channelWebSocket ? channelWebSocket.connectState : false"
            @otherOperation="otherOperation"
            @testingFastFoodStatus="testingFastFoodStatus"
          ></router-view>
        </keep-alive>
      </div>
    </div>
    <Footer
      ref="posFooter"
      @lockPos="lockPos"
      @reload="reload"
      @businessState="businessState"
    ></Footer>
    <ModifyPassword ref="modifyPassword"></ModifyPassword>
    <MoreModule
      @operation="moreOperation"
      @setIsShowNgtModule="setIsShowNgtModule"
      ref="moreModule"
    ></MoreModule>
    <BusinessState ref="businessState"></BusinessState>
    <OffWork ref="offWork" @handleChangeOffWorkSwitch="handleChangeOffWorkSwitch"></OffWork>
    <MoneyBoxModal ref="moneyBoxModal"></MoneyBoxModal>
    <ItemQueryModal ref="itemQueryModal"></ItemQueryModal>
    <KvsQueryModal ref="kvsQueryModal"></KvsQueryModal>
    <BilledModal ref="billedModal"></BilledModal>
    <ReportsModal ref="reportsModal"></ReportsModal>
    <LimitQuantity ref="limitQuantity" :limitData="limitData"></LimitQuantity>
    <ItemsSellOut ref="itemsSellOut" :sellOutData="sellOutData"></ItemsSellOut>
    <MethodsSellOut ref="methodsSellOut" :methodSellOutData="methodSellOutData"></MethodsSellOut>
    <ItemsPriceByTime ref="itemsPriceByTime" :priceByTimeData="priceByTimeData"></ItemsPriceByTime>
    <ArrangeMenu ref="arrangeMenu" @openArrangeMenuDetail="openArrangeMenuDetail"></ArrangeMenu>
    <ArrangeMenuDetail
      ref="arrangeMenuDetail"
      :arrangeMenuOpenType="arrangeMenuOpenType"
    ></ArrangeMenuDetail>
    <TeamBill ref="teamBill"></TeamBill>
    <OffWorkInputMoney ref="offWorkInputMoney"></OffWorkInputMoney>
    <Crm7CardCharge ref="Crm7CardCharge"></Crm7CardCharge>
    <Crm7SellCard ref="Crm7SellCard"></Crm7SellCard>
    <PosIpLoginInfo ref="posIpLoginInfo"></PosIpLoginInfo>
    <GBLbusinessInfo ref="gblBusinessInfo"></GBLbusinessInfo>
    <ManagerLog ref="managerLog"></ManagerLog>
    <DiscardDishRecord ref="discardDishRecord"></DiscardDishRecord>
    <WithdrawBigCash ref="withdrawBigCash"></WithdrawBigCash>
    <BuffetDeposit ref="buffetDeposit"></BuffetDeposit>
    <signMenu ref="signMenu"></signMenu>
    <UploadModuleNum @handleClose="handleClose" ref="uploadmoduleNum"></UploadModuleNum>
    <LockPage ref="LockPage"></LockPage>
    <DevMode ref="devMode"></DevMode>
    <NegativeSettlement
      v-if="isLoadNgtSettlement"
      ref="ngtSetment"
    ></NegativeSettlement>
  </div>
</template>

<script>
import $ from 'jquery';
import '@static/fonts/base/iconfont';
import { MessageBox } from 'element-ui';
import {
  find, first, isNumber, isPlainObject, each, delay, cloneDeep, template, toPath, debounce,
} from 'lodash';
import {
  mapState, mapGetters, mapMutations, mapActions,
} from 'vuex';
import Header from '@/components/Pos/Header';
import Footer from '@/components/Pos/Footer';
import ajax from '@/common/js/ajax';
import transItems from '@/common/js/logic/transitems';
import { ERR_OK } from '@/common/api/takeoutConfig';
import WS from '@/common/js/WS';
import ScreenSaver from '@/common/js/screensaver';
import PlayNotifyMusic from '@/common/util/PlayNotifyMusic';
// import wsBusinessHandle from './WebsocketBusiness/index.js';
// 异步加载组件
// 修改密码
const ModifyPassword = (resolve) => {
  import('@/components/Pos/User/ModifyPassword').then((module) => {
    resolve(module);
  });
};
  // 更多(Header)
const MoreModule = (resolve) => {
  import('@/components/Pos/MoreModule').then((module) => {
    resolve(module);
  });
};
  // 营业状态
const BusinessState = (resolve) => {
  import('@/components/Pos/BusinessState').then((module) => {
    resolve(module);
  });
};

// 结班
const OffWork = (resolve) => {
  import('@/components/Pos/OffWork').then((module) => {
    resolve(module);
  });
};
  // 钱箱
const MoneyBoxModal = (resolve) => {
  import('@/components/Pos/More/MoneyBoxModal').then((module) => {
    resolve(module);
  });
};
  // 品项查询
const ItemQueryModal = (resolve) => {
  import('@/components/Pos/More/ItemQueryModal').then((module) => {
    resolve(module);
  });
};

const KvsQueryModal = (resolve) => {
  import('@/components/Pos/More/KVSQueryModal').then((module) => {
    resolve(module);
  });
};

const LimitQuantity = (resolve) => {
  import('@/components/Pos/More/LimitQuantity').then((module) => {
    resolve(module);
  });
};
  // 排菜单
const ArrangeMenu = (resolve) => {
  import('@/components/Pos/ArrangeMenu/Index').then((module) => {
    resolve(module);
  });
};
  // 新建 、修改排菜单的弹框
const ArrangeMenuDetail = (resolve) => {
  import('@/components/Pos/ArrangeMenu/ArrangeMenuDetail').then((module) => {
    resolve(module);
  });
};

const BilledModal = (resolve) => {
  import('@/components/Pos/More/BilledModal').then((module) => {
    resolve(module);
  });
};
  // 报表
const ReportsModal = (resolve) => {
  import('@/components/Pos/More/ReportsModal').then((module) => {
    resolve(module);
  });
};
  // 品项估清
const ItemsSellOut = (resolve) => {
  import('@/components/Pos/More/ItemsSellOut').then((module) => {
    resolve(module);
  });
};

// 做法估清
const MethodsSellOut = (resolve) => {
  import('@/components/Pos/More/MethodsSellOut').then((module) => {
    resolve(module);
  });
};

// 时价
const ItemsPriceByTime = (resolve) => {
  import('@/components/Pos/More/ItemsPriceByTime').then((module) => {
    resolve(module);
  });
};

// 团队账单
const TeamBill = (resolve) => {
  import('@/components/Pos/More/teamBill').then((module) => {
    resolve(module);
  });
};

// 结班-金额录入
const OffWorkInputMoney = (resolve) => {
  import('@/components/Pos/OffWorkInputMoney').then((module) => {
    resolve(module);
  });
};

// CRM7售卡
const Crm7SellCard = (resolve) => {
  import('@/components/Pos/More/Crm7SellCard').then((module) => {
    resolve(module);
  });
};

// 充值
const Crm7CardCharge = (resolve) => {
  import('@/components/Pos/More/Crm7CardCharge').then((module) => {
    resolve(module);
  });
};

// 登陆IP列表
const GBLbusinessInfo = (resolve) => {
  import('@/components/Pos/More/GBLbusinessInfo').then((module) => {
    resolve(module);
  });
};
// 登陆IP列表
const PosIpLoginInfo = (resolve) => {
  import('@/components/Pos/More/PosIpLoginInfo').then((module) => {
    resolve(module);
  });
};
// 经理日记
const ManagerLog = (resolve) => {
  import('@/components/Pos/More/ManagerLog.vue').then((module) => {
    resolve(module);
  });
};

// 废菜统计
const DiscardDishRecord = (resolve) => {
  import('@/components/Pos/More/DiscardDishRecord.vue').then((module) => {
    resolve(module);
  });
};
// 抽大钞
const WithdrawBigCash = (resolve) => {
  import('@/components/Pos/More/WithdrawBigCash.vue').then((module) => {
    resolve(module);
  });
};
// 自助餐押金
const BuffetDeposit = (resolve) => {
  import('@/components/Pos/More/BuffetDeposit.vue').then((module) => {
    resolve(module);
  });
};
const signMenu = (resolve) => {
  import('./signMenu/index.vue').then((module) => {
    resolve(module);
  });
};
// 刷新结班数据
const UploadModuleNum = (resolve) => {
  import('./UploadModuleNum.vue').then((module) => {
    resolve(module);
  });
};

const LockPage = (resolve) => {
  import('@/components/Pos/Common/LockPage').then((module) => {
    resolve(module);
  });
};

const DevMode = (resolve) => {
  import('@/components/Pos/DevMode/Index').then((module) => {
    resolve(module);
  });
};
// 负结算
const NegativeSettlement = (resolve) => {
  import('@/components/Pos/More/NegativeSettlement').then((module) => {
    resolve(module);
  });
};
export default {
  components: {
    Header,
    Footer,
    ModifyPassword,
    MoreModule,
    BusinessState,
    OffWork,
    MoneyBoxModal,
    ItemQueryModal,
    KvsQueryModal,
    LimitQuantity,
    BilledModal,
    ItemsSellOut,
    MethodsSellOut,
    ItemsPriceByTime,
    ReportsModal,
    TeamBill,
    OffWorkInputMoney,
    Crm7SellCard,
    Crm7CardCharge,
    PosIpLoginInfo,
    GBLbusinessInfo,
    ManagerLog,
    DiscardDishRecord,
    WithdrawBigCash,
    BuffetDeposit,
    ArrangeMenu,
    ArrangeMenuDetail,
    signMenu,
    UploadModuleNum,
    LockPage,
    DevMode,
    NegativeSettlement,
  },
  data() {
    //       "OrderDishes": "点餐",
    // "ReserveDishes": "预点",
    // "Booking": "预定",
    // "Takeout": "外卖",
    // "Crm": "会员",
    // "LgjMember": "荣管家会员"
    return {
      checkPayInterval: null,
      isSendETag: true,
      eTagItems: [],
      screenSaver: null,
      hotKey: null,
      // 暂不使用
      buffetPointId: null,
      // 由于这块逻辑有点乱，就没在那搅和，先弄一个显示快捷键的数据，和不显示快捷键的数据
      moduleList: [{
        moduleName: 'order',
        hotKeyTip: 'Ctrl+F1',
        default: true,
        enable: true,
      }, {
        moduleName: 'reserve',
        hotKeyTip: 'Ctrl+F2',
        default: false,
        enable: true,
        notifyCount: 0,
      }, {
        moduleName: 'booking',
        hotKeyTip: 'Ctrl+F3',
        default: false,
        enable: false,
      }, {
        moduleName: 'takeout',
        hotKeyTip: 'Ctrl+F4',
        default: false,
        enable: false,
        notifyCount: 0,
      }, {
        moduleName: 'crm',
        hotKeyTip: 'Ctrl+F5',
        default: false,
        enable: false,
      },
      {
        moduleName: 'crm7',
        hotKeyTip: 'Ctrl+F5',
        default: false,
        enable: false,
      }, {
        moduleName: 'member',
        hotKeyTip: 'Ctrl+F5',
        default: false,
        enable: false,
      }],
      limitData: {}, // 限量初始化数据
      sellOutData: {}, // 估清初始化数据
      methodSellOutData: {}, // 做法估清初始化数据
      priceByTimeData: {},
      loading2: false, // 副屏加载等待

      // 推送用到的 档案变化一个提醒
      // ItemCustomGroup  -品项自定义分组 "Shift": "市别",
      // ConsumptionArea -消费区域 "SeatType": "客位类型"
      typemap: {
        ItemServiceImpl: this.$t('Dict.Item'),
        ItemBigClassServiceImpl: this.$t('Dict.ItemBigClass'),
        ItemSmallClassServiceImpl: this.$t('Dict.ItemSmallClass'),
        ClassCustomServiceImpl: this.$t('Dict.ItemCustomGroup'),
        AreaServiceImpl: this.$t('Dict.ConsumptionArea'),
        PointType: this.$t('Dict.SeatType'),
        PointServiceImpl: this.$t('Dict.Seat'),
        ShiftServiceImpl: this.$t('Dict.Shift'),
      },
      queryCrmPosSerialInfoException: null,
      // notify盒子
      errNotify: [],
      isOrdering: false,
      // 排菜单新建、修改弹框的titlem名称
      arrangeMenuOpenType: '',
      // 检测快餐根组件 执行的定时器
      onceTimer: null,
      printDetail: '',
      point2WebSocket: null,
      haveItemWebSocket: null,
      origTotalWebSocket: null,
      depositWebSocket: null,
      onlineArchiveWebSocket: null,
      onlinePayWebSocket: null,
      takeoutOrderWebSocket: null,
      settlementMsgWebSocket: null,
      powerNegativeSettlement: false,
      channelWebSocket: null, // 推送改造新的推送对象
      wsRelationMthodChart: { // 推送method 和执行方法关联表
        point: 'pointUpdate', // 客位有关推送
        pointdelete: 'pointdelete', // 虚拟客位的删除
      },
      connectState: false,
    };
  },
  computed: {
    ...mapState({
      payPageOpen: state => state.pos.payPageOpen,
    }),
    ...mapGetters([
      'getSelectDiscountPlanData',
      'getRefreshBs',
      'getDialog',
      'setting',
      'posDevice',
      'posBooking',
      'posTakeout',
      'posMember',
      'posBaseInfo',
      'getVuexPosMode',
      'posOrderBill',
      'posInfo',
      'outDeviceSetting',
      'posTables',
      'posFastFood',
      'getVuexItemLimitsMap', // vuex中的限量品项数据
      // 暂不使用
      // 'getFastFoodStatus', // 获取快餐根组件当前的创建的状态
      'getSettleBsCode',
      'getVuexPointData',
      'getIsNeedTableWsHandle', // 是否对推送过来的事件做下处理
      'getPosTablesIndex', // 客位所对应的下标
      'config',
    ]),
    // 头部数据
    // moduleList() {
    //   // console.log(this.posInfo)
    //   if (
    //     this.posInfo
    //     && `${this.posInfo.controlMode}` === '3'
    //     && this.posFastFood
    //     && this.posFastFood.fastFoodIsHiddenShortcutKeys
    //   ) {
    //     return this.moduleListData.noNeedHotkey;
    //   }
    //   return this.moduleListData.haveHotkey;
    // },
    // 预点通知数量
    reserveNotifyCount() {
      return this.$store.state.pos.headerNotifyCount.reserveCount;
    },
    // 是否加载负结算模块
    isLoadNgtSettlement() {
      return this.posBaseInfo.isNegativeSettle && +this.getVuexPosMode === 1 && this.powerNegativeSettlement;
    },
  },
  created() {
    this.$vclean();
    this.$von('unlock', () => {
      this.unlockInitData();
    });
    this.$von('fastFoodLoadEasyList', () => {
      this.setETagItems(this.eTagItems);
    });
    this.$von('fastFoodLoadBs', (buffetPointId) => {
      this.initFastFoodBs(buffetPointId);
    });
    // 此方法用于监听其他模块触发事件后，弹出押金管理模块
    this.$von('moreOperation', (methods, data) => {
      this.moreOperation(methods, data);
    });
    // 挂载下易盘的关事件
    this.$von('closeEasydisk', () => {
      this.closeEasydisk();
    });
    // 挂载下易盘的开事件
    this.$von('openEasydisk', () => {
      this.eTagItems = [];
      this.openEasydisk();
    });
  },
  mounted() {
    window.addEventListener('mousewheel', (e) => {
      if (e.deltaY === 1) {
        e.preventDefault();
      }
    });
    this.$von('changeOrderingState', (val) => {
      this.isOrdering = !val;
    });
    // 实时变化外卖角标
    this.$von('takeOutCount', (count) => {
      this.moduleList.find(({ moduleName }) => moduleName === 'takeout').notifyCount = count;
    });
    // 打开排菜单列表
    this.$von('openArrangeMenu', (type, openTypeStr = 'addOrder', relatedOfArrangeMenu = null) => {
      // DialogMixin插件在组件open时传值, 不能直接传false, 却可以传true(缺陷), 使用下面传值方式
      // ## 参数说明: type-打开类型, openTypeStr-业务类型, relatedOfArrangeMenu-预订单的排菜数据
      this.$refs.arrangeMenu.open({
        showBtn: type,
        openType: openTypeStr,
        bookedOfMenu: relatedOfArrangeMenu,
      });
    });
    let uuddlrlrbaba = [];
    $(window).on('keydown', (event) => {
      uuddlrlrbaba.push(event.keyCode);
      if (uuddlrlrbaba.length === 12) {
        if (uuddlrlrbaba.join('') === '383840403739373966656665') {
          this.$refs.devMode.open();
        }
        uuddlrlrbaba = [];
        console.log('devMode');
      }
    });
    this.debounceGetChangePoints = debounce(() => {
      setTimeout(() => {
        this.$vemit('updatePoint');
      }, 1000);
    }, 500);
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      // 预点数量请求接口
      vm.getReserveNotifyCount();
      vm.initData();
      if (vm.$refs.posHeader) {
        vm.$refs.posHeader.bindGlobalClick();
      }
    });
  },
  beforeRouteLeave(to, from, next) {
    if (this.checkPayInterval) {
      clearInterval(this.checkPayInterval);
      this.checkPayInterval = null;
    }
    // 跳出路由（离开本页）后解绑 resize 事件
    window.onresize = null;
    const { controlMode } = this.posInfo;
    if (controlMode
      && this.posBaseInfo.isOpenLockScreen[controlMode - 1].isOpen
      && this.posBaseInfo.isOpenLockScreen[controlMode - 1].lockTime > 0) {
      this.screenSaver.clear();
    }
    this.$vemit('clearUpDateSpendTimeTimer');
    if (this.channelWebSocket) {
      this.channelWebSocket.close();
      this.channelWebSocket = null;
    }
    if (this.settlementMsgWebSocket) {
      this.settlementMsgWebSocket.close();
      this.settlementMsgWebSocket = null;
    }
    if (this.point2WebSocket) {
      this.point2WebSocket.close();
    }
    if (this.haveItemWebSocket) {
      this.haveItemWebSocket.close();
    }
    if (this.origTotalWebSocket) {
      this.origTotalWebSocket.close();
    }
    if (this.depositWebSocket) {
      this.depositWebSocket.close();
    }
    if (this.onlineArchiveWebSocket) {
      this.onlineArchiveWebSocket.close();
    }
    if (this.onlinePayWebSocket) {
      this.onlinePayWebSocket.close();
    }
    if (this.takeoutOrderWebSocket) {
      this.takeoutOrderWebSocket.close();
    }
    if (this.settlementMsgWebSocket) {
      this.settlementMsgWebSocket.close();
    }
    this.point2WebSocket = null;
    this.haveItemWebSocket = null;
    this.origTotalWebSocket = null;
    this.depositWebSocket = null;
    this.onlineArchiveWebSocket = null;
    this.onlinePayWebSocket = null;
    this.takeoutOrderWebSocket = null;
    this.settlementMsgWebSocket = null;
    this.$devices.close();
    next();
  },
  watch: {
    'getDialog.length': {
      handler(data) {
        this.isSendETag = !data;
        setTimeout(() => {
          if (!data) {
            // 这快餐模式下的判断
            if (`${this.posInfo.controlMode}` === '3' && this.getRefreshBs && !this.getSelectDiscountPlanData) {
              this.setETagItems(this.eTagItems);
            } else if (this.$route.name === 'ordering') {
              // 判断是否在加单界面
              this.setETagItems(this.eTagItems);
              this.$vemit('searchFocus');
            }
          }
        }, 400);
      },
    },
    getRefreshBs(data) {
      if (data) {
        this.setETagItems(this.eTagItems);
      }
    },
    getSelectDiscountPlanData(data) {
      const PlanData = !!data;
      setTimeout(() => {
        this.isSendETag = !PlanData;
        if (!PlanData) {
          this.setETagItems(this.eTagItems);
        }
      }, 0);
    },
    // 监听预点变化，显示通知
    reserveNotifyCount(count) {
      this.moduleList.find(
        ({ moduleName }) => moduleName === 'reserve',
      ).notifyCount = count;
    },
    posInfo() {
      // 判定是否有开班的收银pos，如果没有提示“收银POS尚未开班，请勿进行加单等操作。”
      if (this.posInfo && this.posInfo.controlMode === '2' && this.posInfo.openingCashierPosCount <= 0) {
        // "CashierPosAlert": "收银POS尚未开班，请勿进行加单等操作。"
        this.$alert(this.$t('Biz.Order.CashierPosAlert'), this.$t('Dict.Tips'));
      }
      // 自动锁屏
      const { controlMode } = this.posInfo; // controlMode 1 收银模式 2 录单模式 3 快餐模式
      if (controlMode && this.posBaseInfo.isOpenLockScreen[controlMode - 1].isOpen && this.posBaseInfo.isOpenLockScreen[controlMode - 1].lockTime > 0) {
        this.screenSaver = new ScreenSaver(() => {
          const clseButton = document.querySelector('.el-message-box__wrapper .el-message-box__headerbtn');
          if (clseButton) clseButton.click();
          this.lockPos();
        }, this.posBaseInfo.isOpenLockScreen[controlMode - 1].lockTime * 1000);
      }
    },
    // 暂不使用
    // buffetPointId(val) {
    //   if (val && this.getFastFoodStatus) {
    //      this.initFastFoodBs({
    //           buffetPointId: this.buffetPointId,
    //         });
    //   }
    // }
  },
  methods: {
    ...mapActions([
      'getReserveNotifyCount',
      'setPosItemsLimitNum',
      'setPosSetting',
      'setTableInfo',
    ]),
    ...mapMutations({
      SET_METHODSELLOUT: 'SET_METHODSELLOUT',
      setFastfoodMenuBtns: 'SET_FASTFOOD_MENU_BTNS',
      setETagItems: 'SET_ETAG_ITEMS',
      setSelloutsMap: 'SET_ITEMSELLOUTSMAP',
      setPromoteLimitMap: 'SET_PROMOTELIMITMAP',
      setLimitsMap: 'SET_ITEMLIMITSMAP',
      setTimePricesMap: 'SET_ITEMTIMEPRICESMAP',
      setPosInfoFooter: 'SET_POS_INFOFOOTER',
      setBookingPointList: 'SET_BOOKING_POINT_LIST',
      setBookExecutedPoints: 'SET_BOOK_EXECUTED_POINTS',
      setPosItems: 'SET_POS_ITEMS',
      setPosBaseInfo: 'SET_POS_BASE_INFO',
      setFootInfo: 'SET_FOOT_INFO',
      setMemberInfo: 'SET_MEMBER',
      setIsBatchOperation: 'IS_BATCH_OPERATION',
      setOrderInfo: 'SET_ORDER_INFO',
      setItemInfo: 'SET_ITEM_INFO',
      setDiscPlanAndPayWay: 'SET_DISCPLAN_AND_PAYWAY',
      setCancelTransferPointState: 'SET_POS_CANCELTRANSFERPOINTSTATE',
      setPointShowState: 'SET_POS_POINTSHOWSTATE',
      setLocale: 'SET_LOCALE',
      updateTables: 'UPDATE_TABLES',
      deleteTables: 'DELETE_XUNI_TABLES',
      rePosPointData: 'CLEAR_STATE_ON_LOGOUT',
    }),
    unlockInitData() {
      this.loadBaseInfo();
      this.initOrderInfo();
    },
    loadBaseInfo(callback) {
      ajax('canyin.pos.reception.receptionbusiness.baseinfo').then((data) => {
        this.setPosBaseInfo(data);
        this.setLocale(data.currentLanguage);
        if (callback) {
          callback(data);
        }
      });
    },
    // 初始化接口错误的回调
    initDataErrorCallback(msg) {
      this.$vemit('closeFastfoodLoading');
      this.$alert(msg, this.$t('Dict.Tips'), {
        callback: () => {
          this.$router.push('/');
        },
      });
    },
    /**
     * 初始化点餐模块数据
     * @param { Boolean } isFastFood 是否为快餐
     */
    initOrderData(isFastFood) {
      this.initOrderInfo(isFastFood);
      if (!isFastFood) {
        ajax('canyin.pos.reception.receptionbusiness.pointinfo').then((data) => {
          this.setTableInfo(data);
          setTimeout(() => {
            this.$vemit('bindTablesPager');
            if (this.config.isOpenNewWesocket) {
              this.creatWebsocket(); // 初始化推送数据
            } else {
              this.initTablesWebSockets();
            }
          }, 500);
        }).catch((errorCode, msg) => {
          this.initDataErrorCallback(msg);
        });
      } else if (this.config.isOpenNewWesocket) {
        this.creatWebsocket(); // 初始化推送数据
      }
      ajax('canyin.pos.reception.receptionbusiness.iteminfo').then((data) => {
        this.setItemInfo(data);
        this.$vemit('fastfoodMenuListInitPager');
      }).catch((errorCode, msg) => {
        this.initDataErrorCallback(msg);
      });
    },
    // 初始化客位页 WebSocket
    initTablesWebSockets() {
      if (this.posInfo.websocketContextPath && this.posInfo.id !== '') {
        this.initPoint2WebSocket();
        this.initHaveItemWebSocket();
        this.initOrigTotalWebSocket();
        this.initDepositWebSocket();
      }
    },
    // webSocket推送刷新客位 接收ws推送客位改变信息
    initPoint2WebSocket() {
      const { websocketContextPath, id } = this.posInfo;
      const url = `${websocketContextPath}/canyin/pos/websocket/point2/${id}/${id}`;
      this.point2WebSocket = new WS(url, {
        message: (data) => {
          if (this.point2WebSocket) {
            this.point2WebSocket.send(JSON.stringify({
              messageType: 'BaseNewWSACK',
              data: {
                messageId: data.messageId,
                destinationAddrId: data.destAddrId,
                result: '1',
              },
            }));
            if (this.getIsNeedTableWsHandle) {
              if (data.message !== 1) {
                this.setCancelTransferPointState(`${data.message}`);
              }
              // 增量更新 1.2s延迟解决推送后数据依然错误的问题
              this.debounceGetChangePoints();
              // setTimeout(() => {
              //   // 由于总部设置了结算后原客位自动开台，后造成结算成功刷账单有点早造成nobs 暂时先从这刷新下接口 暂时 先必掉太影响性能
              //   this.$vemit('loadBill', this.getVuexPointData.id);
              // }, 0);
            }
            // 注： 此处代码仅限185及以上版本使用， 以下版本需删除
            // 如果当前路由为预订,则执行预订业务模块的数据刷新
            if (this.$route.name === 'booking') {
              // 执行软刷新
              this.$vemit('refreshBookBusinessBus');
            }
          }
        },
      });
    },
    // 客位开台后的加单和未加单的状态显示推送
    initHaveItemWebSocket() {
      const { websocketContextPath } = this.posInfo;
      const url = `${websocketContextPath}/canyin/pos/websocket/addorderhaveitem`;
      this.haveItemWebSocket = new WS(url, {
        message: (data) => {
          if (this.getIsNeedTableWsHandle && data && `${data}` !== '1' && data.pointIds && data.pointIds.length) {
            this.setPointShowState({
              wsName: 'addorderhaveitem',
              pointIds: data.pointIds,
              haveItem: data.have_item > 0,
            });
          }
        },
      });
    },
    // 接收 WebSocket 消费金额改变推送消息
    initOrigTotalWebSocket() {
      const { websocketContextPath } = this.posInfo;
      const url = `${websocketContextPath}/canyin/pos/websocket/pointorigtotal`;
      this.origTotalWebSocket = new WS(url, {
        message: (data) => {
          // getIsNeedTableWsHandle代表是否需要处理， 如果处于非客位界面就不处理
          if (this.getIsNeedTableWsHandle) {
            if (data && `${data}` !== '1' && data.pointId) {
              this.setPointShowState({
                wsName: 'pointorigtotal',
                ...data,
              });
              if (data.lastTotal !== undefined
                  && data.origTotal !== undefined
                  && this.getVuexPointData
                  && this.getVuexPointData.id === data.pointId
              ) {
                // 防止并发时刷新过快导致账单上的菜没有清空
                setTimeout(() => {
                  this.$vemit('loadBill', data.pointId);
                }, 0);
              }
            }
          }
        },
      });
    },
    // 接收消费押金改变 WebSocket 推送信息
    initDepositWebSocket() {
      const { websocketContextPath } = this.posBaseInfo;
      const url = `${websocketContextPath}/canyin/pos/websocket/depositdetail`;
      this.depositWebSocket = new WS(url, {
        message: (data) => {
          // getIsNeedTableWsHandle代表是否需要处理，如果处于加单界面不需要。
          if (this.getIsNeedTableWsHandle && data && `${data}` !== '1' && data.pointId !== undefined && data.lastDeposit !== undefined) {
            this.setPointShowState({
              wsName: 'depositdetail',
              pointId: data.pointId,
              deposit: data.lastDeposit,
            });
          }
        },
      });
    },
    /**
     * 用于检测 快餐根组件是否创建成功($von('fastFoodLoadBill')是否挂载成功)
     * 重要的判断依据为: 快餐 容器的className; 使用一次性定时器轮训调用检测节点是否创建完成($von('fastFoodLoadBill')是否挂载成功)
     * 本方法, 不可修改!!!!!!!!!
     * 只在快餐点餐页签下执行
    */
    testingFastFoodStatus(buffetPointId = this.buffetPointId, noRefresh = false) {
      if (
        this.$refs.posView
        && this.$refs.posView.$el.className.indexOf('pos-fastfood-container') !== -1
      ) {
        if (!noRefresh) {
          this.initFastFoodBs({ buffetPointId });
        }
        clearTimeout(this.onceTimer);
        this.onceTimer = null;
        return;
      }
      this.onceTimer = setTimeout(() => {
        this.testingFastFoodStatus(buffetPointId);
      }, 10);
    },
    // 点餐数据接口
    initOrderInfo(isFastFood) {
      // 加载接口数据
      ajax('canyin.pos.reception.receptionbusiness.orderinfo').then((data) => {
        // 暂不使用
        // this.buffetPointId = data.buffetPointId;
        // 接口返回数据, 上传vuex
        this.setOrderInfo(data);
        // 判断是否快餐, 执行快餐pointbsinfo接口数据获取和业务逻辑执行
        if (isFastFood) {
          this.setFastfoodMenuBtns();
          const { buffetPointId } = data;
          // this.getDiscPlanAndPayWay(buffetPointId);
          this.buffetPointId = buffetPointId;
          // 判断如果是在这个路由下可以执行
          if (this.$route.path === '/pos/fastFood' || this.$route.path === '/pos') {
            this.testingFastFoodStatus(buffetPointId);
          }
        }
        // 代码注释,见(腾讯在线)前端维护文档BUG-2020,详细说明
        // else {
        //   // 延迟去设置客位界面的功能按钮得快捷键，防止触发时事件没生成
        //   setTimeout(() => {
        //     this.$vemit('handleBindBillBtnsHotKey');
        //   }, 1500);
        // }
      }).catch((errorCode, msg) => {
        this.initDataErrorCallback(msg);
      });
    },
    // 设置打折和结算信息
    getDiscPlanAndPayWay(pointId) {
      ajax('canyin.pos.settlement.settle.getdiscplanandpayway', {
        params: {
          pointId,
          controlMode: '3',
        },
      }).then((data) => {
        this.setDiscPlanAndPayWay(data);
      });
    },
    initFastFoodBs(data) {
      this.$log.info(`buffetPointId：${JSON.stringify(data)}`);
      ajax('canyin.pos.bill.pointbsinfo', {
        loading: false,
        params: { pointId: data.buffetPointId },
      }).then((response) => {
        this.$log.info(`pointbsinfo：${JSON.stringify(response)}`);
        this.$vemit('fastFoodLoadBill', data, response);
      }).catch((errorCode, msg, title) => {
        this.$vemit('closeFastfoodLoading');
        this.$alert(msg, title);
      });
    },
    // 初始化页面数据
    initData() {
      this.loadBaseInfo((data) => {
        const isFastFood = data.controlMode === '3';
        const finded = find(this.moduleList, {
          moduleName: isFastFood ? 'order' : 'fastFood',
        });
        if (finded) {
          finded.moduleName = isFastFood ? 'fastFood' : 'order';
        }
        this.setDefaultModule();
        if (!isFastFood) {
          this.checkPayInterval = setInterval(() => {
            const payDialog = $('.pay-dialog-20200107:visible').length;
            if (!payDialog) {
              // console.info('TCSLCMD=AllowCloseBrowser');
              this.$vemit('stopScanPayQueryState');
            }
          }, 5000);
        }
        window.setTimeout(() => {
          this.initOrderData(isFastFood);
        }, 100);
      });
      ajax('canyin.pos.reception.receptionbusiness.footinfo').then((data) => {
        this.setFootInfo(data);
      }).catch((errorCode, msg) => {
        this.initDataErrorCallback(msg);
      });
      ajax('canyin.pos.reception.receptionbusiness.setting').then((data) => {
        // 开启Crm7时 屏蔽掉Crm6
        if (data.pos.enableCrm7) {
          data.pos.enableCrm = false;
        }
        this.setPosSetting(data);
        // 加延迟的目的是为了防止vuex里的值读取不到
        setTimeout(() => {
          this.initDevices(data.shopId);
        }, 100);
        this.initWebSocket();
        find(this.moduleList, { moduleName: 'crm7' }).enable = data.pos.enableCrm7;
        find(this.moduleList, { moduleName: 'crm' }).enable = data.pos.enableCrm;
        find(this.moduleList, { moduleName: 'booking' }).enable = data.booking.enable;
        find(this.moduleList, { moduleName: 'takeout' }).enable = data.takeout.enable;
        if (data.takeout.enable) {
          this.initTakeoutWebSocket();
        }
      }).catch((errorCode, msg) => {
        this.initDataErrorCallback(msg);
      });
      ajax('canyin.pos.reception.receptionbusiness.memberinfo').then((data) => {
        this.setMemberInfo(data);
        find(this.moduleList, { moduleName: 'member' }).enable = data.enable;
      }).catch((errorCode, msg) => {
        this.initDataErrorCallback(msg);
      });
    },
    // 初始化ws
    initWebSocket() {
      const { websocketContextPath } = this.setting;
      this.onlineArchiveWebSocket = new WS(`${websocketContextPath}/websocket/onlinearchive`, {
        message: (message) => {
          if (!message) return;
          switch (message.method) {
            case 'promoteAndPriRefresh': // 销售方案/促销方案变更 时提示，然后刷新页面 (支付页面除外)
              if (this.payPageOpen === 1) return;
              MessageBox.alert(this.$t('Biz.Order.OnlinearchiveMg07'), this.$t('Dict.Tips'), {
                confirmButtonText: this.$t('Dict.Sure'),
                callback: (action) => {
                  if (action === 'confirm') this.reload();
                },
              });
              break;
            case 'methodSellout': // 做法估清-更新数据 type估清类型 0不指定,1当前市别,2当天
              this.SET_METHODSELLOUT(message.data);
              break;
            case 'itemSellout':
              this.setSelloutsMap(message.data);
              break;
            case 'itemLimit':
              // 缓存一个可售数量用于品项规格的提示和计算数量
              for (const v in message.data) {
                message.data[v].maxLimit = message.data[v].restQuantity;
              }
              this.setLimitsMap(message.data);
              break;
            case 'promotionLimit':
              this.setPromoteLimitMap(message.data); // 促销品项的限量推送处理 更新vuex
              break;
            case 'timePrice':
              this.setTimePricesMap(message.data);
              break;
            case 'homewuuorder':
              this.homeWuuOrderFn(message);
              break;
            case 'reserveorderbillpayautosettle':
              this.handelReserveOrderBillPayAutoSettle(message.data.code);
              break;
            case 'homewuureserve':
              this.updateBookingPointList(message.data);
              break;
            case 'posSerialChange':
              this.updatePosInfo(message.data);
              break;
            case 'archiveChange':
              // ${this.typemap[message.data.type]}已被修改，请刷新页面` }
              this.$message({
                showClose: true,
                message: this.$t('Biz.Order.OnlinearchiveMg', {
                  msg: this.typemap[message.data.type],
                }),
              });
              break;
            case 'shiftChange':
              if (message.data) {
                // 市别的变化,如果当前路由地址为预订,则执行预订页面刷新(强制)
                // $t-进入新市别，请点击确定刷新界面
                if (this.$route.path.indexOf('booking') !== -1) {
                  // 执行软刷新
                  this.$vemit('refreshBookPageBus', this.$t('Biz.Order.OnlinearchiveMg06'));
                }
              }
              // isChangePriLocal-当前市别的销售价格方案是否变化,判断变化,才执行刷新
              if (message.data && message.data.isChangePriLocal) {
                // "OnlinearchiveMg01": "进入新市别，销售方案有更新，请点击确定刷新界面"
                this.warningMoudel(this.$t('Biz.Order.OnlinearchiveMg01'), false);
              }
              break;
            case 'item':
              this.setPosItems(transItems(message.data)); // 更新vuex中的品项数据
              break;
            case 'promoteTimeChange':
              // "OnlinearchiveMg02": "当前促销方案发生变动，需要刷新页面，是否确认刷新？"
              this.warningMoudel(this.$t('Biz.Order.OnlinearchiveMg02'));
              break;
            case 'priLocalTimeChange':
              // "OnlinearchiveMg03": "当前销售方案发生变动，需要刷新页面，是否确认刷新？"
              this.warningMoudel(this.$t('Biz.Order.OnlinearchiveMg03'));
              break;
            case 'bsOrderCodeMode':
              break;
            case 'OnlineAfterPayMoneyError':
              this.handelPayMoneyError(message.data);
              break;
            case 'itemLimitByIncrement': // 限量品项更改的推送
              const { data } = message;
              const tmpPosItem1 = JSON.parse(JSON.stringify(this.getVuexItemLimitsMap));
              Object.keys(data).map((key) => {
                if (tmpPosItem1[key]) {
                  tmpPosItem1[key].restQuantity -= data[key];
                }
                return '';
              });
              this.setPosItemsLimitNum(tmpPosItem1);
              break;
            case 'itemLimitByAllWithCache': // 限量品项更改的推送
              const { limitsMap, numOfUnsettledMap } = message.data;
              const { getVuexItemLimitsMap, getVuexPosMode, setPosItemsLimitNum } = this;
              if (+getVuexPosMode !== 3) return;
              if (!getVuexItemLimitsMap || getVuexItemLimitsMap.length === 0) return;
              // 暂时这么修改，之前是强制把restQuantity 改成 limitQuantity
              const tmpPosItem = cloneDeep(getVuexItemLimitsMap);
              Object.keys(limitsMap).map((key1) => {
                Object.keys(tmpPosItem).map((key2) => {
                  if (key1 === key2) {
                    tmpPosItem[key2].restQuantity = limitsMap[key1].restQuantity;
                  }
                  return '';
                });
                return '';
              });
              /* 功能暂时未开放，也没验证代码，后面开发那个了再说 */
              if (Object.keys(numOfUnsettledMap).length !== 0) {
                Object.keys(numOfUnsettledMap).map((key) => {
                  if (tmpPosItem[key]) {
                    tmpPosItem[key].restQuantity -= numOfUnsettledMap[key].value;
                  }
                  return '';
                });
              }
              setPosItemsLimitNum(tmpPosItem);
              break;
            default:
              break;
          }
        },
      });
      this.onlinePayWebSocket = new WS(`${websocketContextPath}/websocket/onlinepay`, {
        message: (message) => {
          if (message.method === 'query_trade_state') { // 支付回调操作
            this.$log.info(`
              收到推送消息：
                接口：onlinepay
                POS：${message.posId}
                returnCode：${message.returnCode}
                bsCodes: ${message.bsCodes}
              ${message.message ? ` 消息：${message.message}` : ''}`);
            if (+message.returnCode === 1) {
              // 支付成功
              const datRs = message.data;
              const { bsCodes } = message;
              // Todo: UILog
              this.$log.info(`线上支付：流水[${datRs.orderid}]结算成功`);
              this.$log.info(`当前posId：${this.posInfo.id}`);
              this.$log.info(`推送posId：${message.posId}`);
              this.$log.info(`getSettleBsCode：${this.getSettleBsCode}`);
              this.$log.info(`bsCodes：${bsCodes}`);
              // 新增判断: 不是新的结算推送, 上一次的结算推送不会执行结算完成逻辑和执行账单刷新
              this.$log.info(`当前posId：${this.posInfo.id}`);
              this.$log.info(`推送posId：${message.posId}`);
              this.$log.info(`getSettleBsCode：${this.getSettleBsCode}`);
              this.$log.info(`bsCodes：${bsCodes}`);
              if (
                this.posInfo.id == message.posId
                && this.getSettleBsCode
                && bsCodes.indexOf(this.getSettleBsCode) != -1
              ) {
                this.$message.success({
                  message: this.$t('Biz.Order.OnlinearchiveMg04', { msg: `${datRs.orderid}` }),
                  type: 'success',
                  customClass: 'message-top1 message-small',
                });
                // 支付成功根据后台提供的数据 datRs.isHaveCashPayWay 判断是否有现金混付，如果值为"1"则打开钱箱
                if (
                  this.outDeviceSetting.isAccounAutoOpenCashbox === true
                  && datRs.isHaveCashPayWay != null
                  && +datRs.isHaveCashPayWay === 1
                ) {
                  this.$devices.Cashbox.open();
                }
                // 通知副屏清空右侧账单部分内容
                if (this.posDevice.enableVice) {
                  this.$devices.SubMonitor.send({
                    moduleName: 'SubMonitor',
                    method: 'reloadDataItem',
                    result: [],
                  });
                }
                if (this.getVuexPosMode === '3') { // 如果当前模式为快餐模式
                  this.$vemit('fastClearEmptyBill');
                  this.$vemit('fastfoodCloseSettleDialog');
                } else { // 收银模式
                  this.$vemit('closeSettleDialog');
                  if (!message.isBackStageSettle || message.isBackStageSettle === undefined || message.isBackStageSettle === null) {
                    if (!message.settled) {
                      this.printSettleByBsCode(datRs.orderid);
                    }
                  }
                  if (this.getVuexPosMode !== '3') {
                    if (this.$route.params.tableId) {
                      this.$router.push('/pos/order');
                    }
                  }
                  // 线上支付方式支付成功后如果后台开启多次结算需要把批量操作按钮置为非选中状态
                  this.setIsBatchOperation(false);
                  this.$vemit('clearEmptyBill', {});
                  // 重置订单搜索
                  this.$vemit('resetOrderSearchText');
                }
              }
            } else if (+message.returnCode === 0 && this.posInfo.id == message.posId) { // 支付失败
              this.$log.info(message.message);
              this.$alert(message.message, this.$t('Dict.Tips'));
            } else {
              this.$log.info(`营业流水[${datRs.id}]结算失败`);
              this.$message.warning(this.$t('Biz.Order.OnlinearchiveMg05', { msg: `${datRs.id}` }));
            }
          } else if (message.method === 'query_deposit_state' || message.method === 'query_takeout_mobile_state') {
            // 自助押金或者电话外卖的支付推送，两个模块公用的同一个扫码付组件
            const { id, returnCode } = message;
            if (+returnCode === 1) { // 支付成功
              this.$vemit('buffetPaySuccess', message);
              setTimeout(() => {
                this.$vemit('clearEmptyBill', {});
              }, 200);
            } else if (+returnCode === 0) { // 支付失败
              this.$vemit('buffetPayFailed', message.message);
            } else {
              this.$log.info(`押金单号[${id}]线上支付失败`);
              this.$message.warning(`${message.message}`);
            }
          } else if (message.method === 'query_cancel_feizipay_state') {
            // 菲滋支付(第三方支付页)取消支付业务
            if (+message.returnCode === 1
              && this.posInfo.id == message.posId
            ) {
              this.$message.warning('菲滋支付取消成功');
              this.$vemit('closeFeiZPayDialog');
            }
          }
        },
      });
      this.settlementMsgWebSocket = new WS(`${websocketContextPath}/canyin/wuu/online/settlementmsg/websocket/wsserver/${this.setting.posId}/${this.setting.posId}`, {
        message: (message) => {
          // destAddrId: "29500000000000007"
          // message: {
          //   bscode: "103-180730-00000048"
          //   code: "001",
          //   file: "/res/media/takeoutvoice/merge/001.mp3"
          //   files: ["prefix.mp3", "0.mp3", "0.mp3", "1.mp3", "postfix.mp3"],
          //   payways: [
          //     {name: "微信支付", payMoney: "0.01"}
          //   ],
          //   posIdList: ["ids..."],
          //   settlePosId: "29500000000000007"
          // },
          // messageId: "ec51d634-7d53-4bad-b469-8fdc3af47d5e"
          // 不需要自己找， 浪费性能 后端给添加上客位名称就行
          // const finded = find(this.posTables, { code: message.message.code });
          let isTextTip = false;
          let isAudioTip = false;
          const { settlePosId, posIdList, businessType } = message.message;
          // if(finded && finded.length > 0) {
          if (settlePosId == this.posInfo.id) { // 文字提示
            isTextTip = true;
          }
          if (+businessType === 3) { // 预点单不需要文字提醒
            isTextTip = false;
          }
          // 线上推送后的优化
          if (posIdList.some(posId === this.posInfo.id)) {
            isAudioTip = true;
          }
          // each(posIdList, (value) => {
          //   if (value == this.posInfo.id) { // 声音提示
          //     isAudioTip = true;
          //   }
          // });
          // 结算 Pos 提示
          if (isTextTip) {
            this.$message({
              type: 'success',
              dangerouslyUseHTMLString: true,
              duration: 5000,
              // message: template('线上支付成功通知：客位：<%= name %> 支付金额：<% _.each(list, function(item){ %> <%= item.payMoney %>（<%= item.name %>）<% }); %>')({
              message: template(`${this.$t('Biz.Order.OLPaySuccNotice')
                      + this.$t('Dict.Seat01')}<%= name %>${this.$t('Biz.Settlement.PaymentAmount')
              }<% _.each(list, function(item){ %> <%= item.payMoney %>（<%= item.name %>）<% }); %>`)({
                name: finded ? finded.name : message.message.code,
                list: message.message.payways,
              }),
              customClass: 'message-top2 message-small',
            });
          }
          // } else {
          //   isAudioTip = true;
          //   // if (settlePosId == this.posInfo.id) {
          //   //    isTextTip = true;
          //   // }
          // }
          const {
            openSoundReminderforScanPayment,
            openTheTableAndPayvoiceReminder,
            turnOnThePreOrderSingleToneReminder,
          } = this.posFastFood; // 是否开启了扫码付和桌边付的声音提醒
          if (+businessType === 1 && !openSoundReminderforScanPayment) { // 扫码付
            return;
          } if (+businessType === 2 && !openTheTableAndPayvoiceReminder) { // 桌边付
            return;
          } if (+businessType === 3 && !turnOnThePreOrderSingleToneReminder) { // 预点单
            return;
          }
          // 管辖此客位的所属 Pos 语音播报 线上支付和桌边付
          if (isAudioTip && isAudioType[businessType]) {
            const fileContent = message.message.file;
            if (fileContent !== 0 && fileContent) {
              const audio = new Audio(`${process.env.API_PATH}${message.message.file}`);
              audio.addEventListener('ended', function () { this.currentTime = 0; }, false);
              audio.play();
            }
            if (this.settlementMsgWebSocket) {
              this.settlementMsgWebSocket.send(JSON.stringify({
                messageType: 'BaseNewWSACK',
                data: {
                  result: '1',
                  destinationAddrId: message.destAddrId,
                  messageId: message.messageId,
                },
              }));
            }
          }
        },
      });
    },
    // 打开推送 ws
    creatWebsocket() {
      const { websocketContextPath, id } = this.posInfo;
      this.channelWebSocket = new WS(`${websocketContextPath}/websocket/channel/${id}/${id}`, {
        message: (data) => {
          for (let index = 0; index < data.length; index++) {
            const message = data[index];
            const doMthodName = this.wsRelationMthodChart[message.methodName];
            if (doMthodName) {
              if (this.getIsNeedTableWsHandle) {
                this[doMthodName](message.data);
              } else if (message.methodName === 'point') {
                if (message.data.some(point => point.id === this.getVuexPointData.id) && this.$route.name === 'ordering') {
                  this.$vemit('loadBill', this.getVuexPointData.id);
                }
              }
            }
            // 客位一些信息更新 如果当前客位处于选中的状态更新客位账单
            // if (doMthodName === 'pointUpdate') {
            //   if (message.data.some(point => point.id === this.getVuexPointData.id)) {
            //     setTimeout(() => {
            //       console.log(this.getVuexPointData);
            //       this.$vemit('loadBill', this.getVuexPointData.id);
            //     }, 500);
            //   }
            // }
          }
        },
      });
    },
    // 根据推送的类型来执行对应的方法
    pointUpdate(data) {
      this.updateTables({
        data,
        callBack: (pointId) => {
          this.$vemit('loadBill', pointId);
        },
      });
    },
    // 执行删除的虚拟客位
    pointdelete(data) {
      const activePointId = this.getVuexPointData.id;
      this.deleteTables(data);
      // 如果删除的正好是选中的择需要进行重置下
      if (data.some(point => point.id === activePointId)) {
        this.rePosPointData();
      }
    },
    initTakeoutWebSocket() {
      const { websocketContextPath } = this.setting;
      this.takeoutOrderWebSocket = new WS(`${websocketContextPath}/websocket/takeoutorder`, {
        message: (message) => {
          console.log(message);
          console.log(this.posFastFood);
          // 接单来源  3 微信  7 百度  11 美团  13 饿了么  33 饿百
          let fromSourceId;
          // 推送 新订单 + 退单角标 = 总角标
          if (message.data) {
            fromSourceId = message.data.fromId;
            const newTotal = message.data.takeOutNewCount;
            const backTotal = message.data.takeOutRefundCount;
            this.moduleList.find(({ moduleName }) => moduleName === 'takeout').notifyCount = Number(newTotal) + Number(backTotal);
          }
          // 推送新订单 退单 订单状态变化
          switch (message.method) {
            case 'hometakeoutordernew':
              if (this.posFastFood.openTakeawaySingleSoundReminder) { // 是否开启了外卖单的声音提醒
                // 除“微信、美团、饿了么、饿百”4种来源订单，其他来源外卖单默认
                if (fromSourceId !== 3
                      && fromSourceId !== 11
                      && fromSourceId !== 13
                      && fromSourceId !== 33) {
                  PlayNotifyMusic('j', 'default');
                } else {
                  PlayNotifyMusic('j', fromSourceId);
                }
              }
              this.$vemit('refreshNewOrder');
              this.$vemit('refreshBussinessData');
              break;
            case 'hometakeoutorderrefund':
              if (this.posFastFood.openTakeawaySingleSoundReminder) { // 是否开启了外卖单的声音提醒
                if (this.posFastFood.openOutOrderVoiceRemind) { // 是否开启了退单的声音提醒
                  // 除“微信、美团、饿了么、饿百”4种来源订单，其他来源外卖单默认
                  if (fromSourceId !== 3
                        && fromSourceId !== 11
                        && fromSourceId !== 13
                        && fromSourceId !== 33) {
                    PlayNotifyMusic('t', 'default');
                  } else {
                    PlayNotifyMusic('t', fromSourceId);
                  }
                } else { // 未开启退单提醒，默认铃声
                  PlayNotifyMusic();
                }
              }
              this.$vemit('refreshRefundOrder');
              this.$vemit('refreshBussinessData');
              break;
            case 'hometakeoutorderfixcancel': // 取消订单
              if (this.posFastFood.openTakeawaySingleSoundReminder) { // 是否开启了外卖单的声音提醒
                if (this.posFastFood.openOutOrderVoiceRemind) { // 是否开启了退单的声音提醒
                  // 除“微信、美团、饿了么、饿百”4种来源订单，其他来源外卖单默认
                  if (fromSourceId !== 3
                        && fromSourceId !== 11
                        && fromSourceId !== 13
                        && fromSourceId !== 33) {
                    PlayNotifyMusic('t', 'default');
                  } else {
                    PlayNotifyMusic('t', fromSourceId);
                  }
                } else { // 未开启退单提醒，默认铃声
                  PlayNotifyMusic();
                }
              }
              this.$vemit('refreshRefundOrder');
              this.$vemit('refreshBussinessData');
              break;
            case 'hometakeoutorderstatechange':
              this.$vemit('refreshTakeoutState');
              this.$vemit('refreshAutoAcceptOrder');
              this.$vemit('refreshBussinessData');
              break;
            case 'hometakeoutsendwarnchange':
              this.$vemit('refreshSendWarnChange');
              if (message.data.voiceUrl) {
                const audio = new Audio(`${process.env.API_PATH}${message.data.voiceUrl}`);
                console.info('配送异常语音提示地址', `${process.env.API_PATH}${message.data.voiceUrl}`);
                audio.play();
              }
              break;
            default:
              break;
          }
        },
      });
    },
    initBookingDevices() {
      const self = this;
      this.$devices.IncomingTel.open((data) => {
        self.$log.info(`设备管理器推送的来电信息-${JSON.stringify(data)}`);
        console.log(`设备管理器推送的来电信息-${JSON.stringify(data)}`);
        self.$log.info(`来电设备信息-${JSON.stringify(self.posBooking)}`);
        console.log(`来电设备信息-${JSON.stringify(self.posBooking)}`);
        // 当前来电线路数大于后台设置的来电设备线路总数，忽略不予处理
        if (data.P > self.posBooking.devicePathNum) {
          return;
        }
        // 处理号码前缀
        let tel = data.T;
        // 测试号码 过滤0138...来电显示号码(首位多0)
        if (tel.length === 12 && tel.indexOf('01') === 0) {
          const telArr = tel.split('');
          telArr.splice(0, 1);
          tel = telArr.join('');
        }
        // 测试号码 过滤86138...来电显示号码(首位多86)
        if (tel.length === 13 && tel.indexOf('861') === 0) {
          const telArr = tel.split('');
          telArr.splice(0, 2);
          tel = telArr.join('');
        }
        // 测试号码 过滤086138...或者+86138...来电显示号码(首位多086、+86)
        if (tel.length === 14 && (tel.indexOf('0861') === 0 || tel.indexOf('+861') === 0)) {
          const telArr = tel.split('');
          telArr.splice(0, 3);
          tel = telArr.join('');
        }
        // 传递回调: 执行 来电(所有)保存后台:无论是否激活booking组件,来电均保存后台.进入预订后,数据查新
        // 参数 data-设备管理器推送电话信息
        ajax('canyin.pos.booking.saveorupdateincomingcallsinfo', {
          contentType: 'json',
          data: { telNo: tel, telLineNo: data.P },
        }).then((res) => {
          if (res.success) {
            // 当前激活'预订'页面
            if (self.$route.path.indexOf('/booking') !== -1) {
              // 调用 预订-'bookingTelPush'方法并执行回调
              self.$vemit('bookingTelPush', data.P);
            }
          } else {
            // "BookingDevicesMsg": "数据异常, 请刷新后重试"
            this.$message.warning(this.$t('Dict.AjaxMessage.Message9'));
          }
        });
        // 执行弹窗 "BookingDevicesMsg01": "是否进行预订处理"
        // TelePhoneDevicesMsg 收到线路${data.P}号码为${data.T}的来电`
        this.$notify({
          title: this.$t('Biz.Order.TelePhoneDevicesMsg'),
          message: this.$t('Biz.Order.BookingDevicesMsg01', { p: data.P, t: data.T }),
          position: 'bottom-right',
          onClick() {
            this.close();
            self.$router.push('/pos/booking');
          },
        });
      }, this.posBooking.deviceType);
    },
    initTakeoutDevices() {
      const self = this;
      this.$devices.IncomingTel.open((data) => {
        ajax('canyin.pos.booking.saveorupdateincomingcallsinfo', {
          contentType: 'json',
          data: { telNo: data.T, takeoutState: 0, telLineNo: 0 },
        }).then((res) => {
          if (res.success) {
            self.$vemit('takeoutNewCall', res.data);
          } else {
            this.$message.warning('数据异常, 请刷新后重试');
          }
        });
        // 执行弹窗 "TakeoutDevicesMsg": "是否进行电话外卖处理"
        this.$notify({
          title: this.$t('Biz.Order.TelePhoneDevicesMsg', { p: data.P, t: data.T }),
          message: this.$t('Biz.Order.TakeoutDevicesMsg'),
          position: 'bottom-right',
          onClick() {
            this.close();
            self.$router.push('/pos/fastFood');
          },
        });
      }, this.posTakeout.takeoutDeviceType);
    },
    homeWuuOrderFn(message) {
      const { allOutText } = message.data;
      const { id } = this.posInfo;
      const reserveData = find(allOutText, { posId: id });
      if (reserveData) {
        this.getReserveNotifyCount();
      }
    },
    // 线上支付打印
    printSettleByBsCode(orderid) {
      ajax('canyin.pos.printsettle.getsettleprintdata', {
        contentType: 'paramsEncoded',
        needToken: true,
        data: {
          bsCode: orderid,
          styleType: 1,
        },
      }).then((data) => {
        if (!data.success) {
          this.$message.warning(data.msg);
          return;
        }
        if (data.data.success) {
          const printData = data.data;
          if (
            printData.printType === 'PRINT_PARALLEL'
            && printData.printD
            && this.$devices.Printer
          ) {
            this.$log.info(`线上支付打印${orderid}`);
            this.$devices.Printer.print(printData.printD);
          }
        } else {
          this.$message.warning(data.data.msg);
        }
      });
    },
    // 预点单的来订单的声音提示
    reserveNewOrderPlayMusic() {
      // if (message.location !== 'local' && message.data.count !== 0) {
      //   PlayNotifyMusic();
      // }
      const { turnOnThePreOrderSingleToneReminder } = this.posFastFood; // 是否开启了预点单的声音提醒
      if (turnOnThePreOrderSingleToneReminder) {
        PlayNotifyMusic();
      }
    },
    // 获取外卖头部角标
    getTakeoutCount() {
      ajax('canyin.takeout.takeoutview.getposbusinessdata', {
        params: {
          posId: this.posInfo.id,
        },
      })
        .then((res) => {
          if (res.data.code === ERR_OK) {
            this.moduleList.find(({ moduleName }) => moduleName === 'takeout').notifyCount = res.data.data.takeOutCount;
          }
        });
    },
    // 在线后支付（在线付）金额不一致
    handelPayMoneyError(data) {
      if (data.posId != this.posInfo.id) {
        return;
      }
      let msg = '';
      if (data.pointCode !== null && data.pointCode !== '' && data.pointCode !== 'null' && data.pointCode !== undefined) {
        msg += `${this.$t('Dict.Seat')}: ${`${data.pointCode}<br>`}`;
      }
      // "OperrationFlow": "营业流水",
      // "OfflineReceivables": "线下应收金额",
      // "OnlineReceivables": "线上应收金额"
      msg += `${this.$t('Dict.OperationFlow')}:&nbsp;&nbsp;&nbsp;&nbsp;${data.bsCode}<br>
            ${this.$t('Biz.Order.OfflineReceivables')}:${data.bsMoney}<br>
            '<strong>${this.$t('Biz.Order.OnlineReceivables')}</strong>:'&nbsp;&nbsp;${data.orderMoney}`;
      this.$alert(
        ` <div>
            <div>
              ${this.$t('Biz.Pos.Tip1')}
            </div>
            <div>
              <h3>${this.$t('Dict.AbnormalReason')}</h3>
              <div>${this.$t('Biz.Pos.ErrorReasonStr')}</div>
            </div>
            <div>
              <div>${this.$t('Dict.DetailedInformation')}</div>
              <div>${msg}</div>
            </div>
            <div>
              <h3>${this.$t('Biz.Pos.Tip02')}</h3>
              <div>
                <p>1.${this.$t('Biz.Pos.OrderInfo')}：<p>
                <p>&nbsp;&nbsp;${this.$t('Biz.Pos.OrderInfoStr')}</p>
                <p>2.${this.$t('Biz.Pos.Repay')}<p>
                <p>&nbsp;&nbsp;${this.$t('Biz.Pos.RepayStr')}</p>
              </div>
            </div>
          </div>`, {
          title: this.$t('Dict.Tips'),
          confirmButtonText: this.$t('Dict.Sure'),
          cancelButtonText: this.$t('Dict.Cancel'),
          dangerouslyUseHTMLString: true,
          type: 'warning',
        },
      );
    },
    // 提示框
    warningMoudel(showWarnText, isShowCancelBtn = true) {
      this.$confirm(showWarnText, {
        confirmButtonText: this.$t('Dict.Sure'),
        cancelButtonText: this.$t('Dict.Cancel'),
        showCancelButton: isShowCancelBtn, // 是否显示取消按钮
        type: 'warning',
        showClose: isShowCancelBtn, // 是否显示关闭按钮
        closeOnClickModal: isShowCancelBtn, // 点击遮罩是否关闭
        closeOnPressEscape: isShowCancelBtn, // esc是否关闭
      }).then(() => {
        // 执行刷新
        this.reload();
      });
    },
    // 中餐预点单自动结算推送的后的一些处理
    // ReserveOrderMessage 流水：${code}结算成功
    handelReserveOrderBillPayAutoSettle(code) {
      this.$message.success(this.$t('Biz.Order.ReserveOrderMessage', { msg: code }));
    },
    // 更新预订的客位显示信息
    updateBookingPointList(data) {
      // 预订单(增减)变化更新vuex
      this.setBookingPointList(data.reservePointMap);
      if (data.executedPoints) {
        // 预订单执行开台变化更新vuex
        this.setBookExecutedPoints(data.executedPoints);
      }
    },
    // 更新下底部的信息
    updatePosInfo(data) {
      this.setPosInfoFooter(data);
    },
    // 加载设备管理器
    initDevices(shopId) {
      const self = this;
      const curVersion = this.posDevice.deviceManagerVersion;
      const deviceManagerDownloadURL = `${process.env.API_PATH}/res/file/dm/DeveicMgrSetup_${curVersion}.exe`;
      const initViceScreen = () => {
        ajax('canyin.pos.viceScreen.view', {
          contentType: 'paramsEncoded',
          data: {
            buffet: +this.posInfo.controlMode === 3, // 是否为快餐
          },
        }).then((data) => {
          this.$devices.SubMonitor.send({
            moduleName: 'SubMonitor',
            method: 'init',
            result: data,
            // 为了解决首次开启副屏时过早接收到加单信息而不显示的问题
            initBillDish: self.posOrderBill ? self.posOrderBill.scList : [],
            initData: self.posOrderBill ? self.posOrderBill.bsData : {},
          });
          // 如果是快餐单独发下账单数据
          if (this.posInfo.controlMode === '3') {
            this.$vemit('fastFoodInitSubMonitor');
          }
        });
      };
      this.$devices.init({
        onOpen: () => {
          this.$log.info('设备管理器连接成功');
          // 检测设备管理器版本
          // 李宝华说179开始不要判断设备管理器版本了，所以注释掉
          // 然后李宝华又说要判断版本，所以放开注释并修改
          this.$devices.Version.get(shopId, (version) => {
            let re = false;
            each(toPath(version), (v, index) => {
              const a = Number(v);
              const b = Number(toPath(curVersion)[index]);
              if (a !== b) {
                if (a < b) {
                  re = true;
                }
                return false;
              }
              return '';
            });
            if (re) {
              // `设备管理器版本有更新(${curVersion})
              this.errNotify.push(
                this.$notify({
                  type: 'warning',
                  title: this.$t('Biz.Order.DevicesWarnMsg', { msg: curVersion }),
                  message: '点此处下载',
                  position: 'bottom-right',
                  duration: 0,
                  onClick() {
                    this.close();
                    window.location.href = deviceManagerDownloadURL;
                  },
                }),
              );
            }
          });
          // 初始化客显
          if (this.posDevice.enableScreen) {
            this.$devices.CDI.open({
              typeindex: this.posDevice.screenMode,
              port: this.posDevice.screenPort,
              baudrate: this.posDevice.baudRate,
            });
          }
          // 初始化电子秤
          if (this.posDevice.enableScale) {
            this.$devices.Scale.init({
              enabled: 1,
              scaleid: this.posDevice.scaleMode,
              com: this.posDevice.scalePort,
            }, (data) => {
              if (data.returnCode === 0) {
                // （没开启去皮称重 || 开启去皮称重但是商户没有使用指定的电子秤）：走老程序
                if (
                  !this.posDevice.isNetWeight
                  || (
                    this.posDevice.isNetWeight
                    && !this.posDevice.isSupportNewWeight
                  )
                ) {
                  this.$devices.Scale.open((data2) => {
                    // "ElectronicScaleRr": "`打开电子秤失败：${data2.returnText}`"
                    if (data2.returnCode === -1) {
                      this.$message.error(this.$t('Biz.Order.ElectronicScaleRr', { msg: data2.returnText }));
                    }
                  });
                } else { // 开启了去皮功能并且电子秤支持
                  setTimeout(() => {
                    this.$vemit('fastFoodAutoWeight');
                    this.$vemit('orderStartAutoWeight');
                  }, 1000);
                }
              } else if (data.returnCode === -1) {
                // `初始化电子秤失败：${data.returnText}`
                this.$message.error(this.$t('Biz.Order.ElectronicScaleRr01', { msg: data.returnText }));
              }
            });
          }
          // 初始化钱箱
          if (this.posDevice.enableCashbox) {
            if (+this.posDevice.cashboxStyle === 1) {
              this.$devices.Cashbox.init({
                mode: 7,
                cmd: this.posDevice.cashboxStartCommand,
                print_name: this.posDevice.cashboxPrint,
              });
            }
            if (+this.posDevice.cashboxStyle === 2) {
              this.$devices.Cashbox.init({
                mode: 1,
                cmd: this.posDevice.cashboxStartCommand,
                print_name: this.posDevice.cashboxPrint,
                wbid: this.posDevice.cashboxBrand,
                wbnum: +this.posDevice.cashboxBrand === 1005004 ? 'LJRB_001' : this.posDevice.cashboxBrandType,
              });
            }
          }
          // 初始化电话外卖来电显示
          // 初始化智能餐盘
          // 初始化易盘
          this.closeEasydisk(); // 先关闭下易盘的通道防止刷新已开了没关在开的时候可能有问题
          // 如果是快餐模式下，是没有客位这个路由 界面的所以一上来就可以开通
          if (`${this.posInfo.controlMode}` === '3') {
            setTimeout(() => {
              this.openEasydisk();
            }, 400);
          }
          // 初始化读卡器
          this.$devices.Cardop.init(this.posDevice.readCardOpt);
          // 初始化前台营业副屏
          if (this.posDevice.enableVice) {
            let timer = null;
            // time变量为console打印副屏启动时间所用，赵伟需求 182-1206 by L.R
            let time = 0;
            this.loading2 = true;
            time = Date.now();
            this.$devices.SubMonitor.open('/#/viceScreen/pos');
            // 主屏向副屏发送已加载的消息，若副屏未加载，则会忽略此消息
            // 若副屏已加载，则会迅速通知主屏关闭loading
            this.$devices.SubMonitor.send({
              moduleName: 'SubMonitor',
              method: 'MainMonitorIsReady',
            });
            // 副屏启动后会增加对主屏的通知，
            timer = setTimeout(() => {
              this.loading2 = false;
              clearTimeout(timer);
              timer = null;
              initViceScreen();
            }, 10000);
            this.$devices.SubMonitor.helloToMain((data) => {
              if (data.method === 'SubMonitorIsReady' && timer) {
                this.loading2 = false;
                clearTimeout(timer);
                timer = null;
                initViceScreen();
              }
            });
          }
          // 初始化预订电话盒
          if (
            this.posBooking.enable
            && this.posBooking.isOpenBookCallerID
            && +this.setting.controlMode !== 3
          ) {
            this.initBookingDevices();
          }
          // 初始化外卖电话盒
          if (this.posTakeout.haveTakeoutPhone && +this.setting.controlMode === 3) {
            this.initTakeoutDevices();
          }
        },
        onError: () => {
          this.$log.info('设备管理器连接失败');
          // 把notify添加进notify盒子中
          // "DevicesWarnMsg01": "设备管理器连接失败"
          // "DevicesWarnMsg02": "如需并口打印、钱箱、客显，请启动设备管理器。如未安装请点此处下载。"
          this.errNotify.push(
            this.$notify({
              type: 'error',
              title: this.$t('Biz.Order.DevicesWarnMsg01'),
              message: this.$t('Biz.Order.DevicesWarnMsg02'),
              position: 'bottom-right',
              duration: 0,
              onClick() {
                this.close();
                window.location.href = deviceManagerDownloadURL;
              },
            }),
          );
        },
        retry: () => {
          this.$tcsl.resetDeviceMgr();
        },
      });
    },
    signMenu() {
      delay(() => {
        this.$log.info('标菜开始');
        this.$devices.ETag.beginWrite();
      }, 1000);
      this.$refs.signMenu.open();
    },
    // 更多操作
    // 自助押金更改为押金管理，data参数目前只有押金管理用到
    moreOperation(operation, data = {}) {
      const timer = new Date().getTime();
      switch (operation) {
        case 'gblBusinessInfo':
          this.$refs.gblBusinessInfo.open();
          break;
        case 'withdrawBigCash':
          this.$refs.withdrawBigCash.open();
          break;
        case 'buffetDeposit':
          this.$refs.buffetDeposit.open(data);
          break;
        case 'moneyBox':
          this.$refs.moneyBoxModal.open();
          break;
        case 'itemQuery':
          this.$refs.itemQueryModal.open();
          break;
        case 'kvsBox':
          this.$refs.kvsQueryModal.open();
          break;
        case 'limitQuantity':
          ajax('canyin.pos.itemLimit.itemLimitView', {
            params: {
              loadmodule: 1, _t: timer,
            },
          }).then((data) => {
            this.limitData = data;
            this.$refs.limitQuantity.open();
          });
          break;
        case 'billed':
          this.$refs.billedModal.open();
          break;
        case 'report':
          this.$refs.reportsModal.open();
          break;
        case 'arrangeMenu':
          // 这里从顶部Header更多, 打开的排菜页面,为主功能显示, 传参true,显示新建/复制等功能按钮
          this.$vemit('openArrangeMenu', true);
          break;
        case 'itemsSellOut':
          // 查询估清品项接口
          ajax('canyin.pos.itemSellout.itemSelloutView', {
            params: {
              loadmodule: 1, _t: timer,
            },
          }).then((data) => {
            this.sellOutData = data;
            this.$refs.itemsSellOut.open();
          });
          break;
        case 'methodsSellOut':
          // 查询估清做法接口
          ajax('canyin.pos.methodsellout.methodSelloutView', {
            contentType: 'json',
          }).then((itemInfo) => {
            this.methodSellOutData = itemInfo;
            this.$refs.methodsSellOut.open();
          });
          break;
        case 'setPriceByTime':
          ajax('canyin.pos.itemtimeprice.list', {
            params: {
              loadmodule: 1, _t: timer,
            },
          }).then((data) => {
            this.priceByTimeData = data;
            this.$refs.itemsPriceByTime.open();
          });
          break;
        case 'teamBill':
          ajax('canyin.pos.teamlog.teamlogview', {
            params: {
              loadmodule: 1,
              _t: new Date().getTime(),
            },
          }).then((data) => {
            this.$refs.teamBill.open(data, {
              submit: () => {
                // 该处不用做什么处理
              },
            });
          });
          break;
        case 'crm7CardCharge':
          this.$refs.Crm7CardCharge.open();
          break;
        case 'crm7SellCard':
          ajax('canyin.pos.settlement.pay.crmPayWay.crmCardSelling', {
            params: {
              crmVersion: 1,
            },
          }).then((res) => {
            if (res.crmHtml) {
              this.$refs.Crm7SellCard.open();
            }
          }).catch((code, msg) => {
            this.$message({
              message: msg,
              type: 'warning',
            });
          });
          break;
        // 功能迁移至用户桌面, 代码注释
        // case 'posIpLoginInfo':
        //   this.$refs.posIpLoginInfo.open();
        //   break;
        // case 'managerLog':
        //   this.$refs.managerLog.open();
        //   break;
        // case 'discardDishRecord':
        //   this.$refs.discardDishRecord.open();
        //   break;
        case 'easySignMenu':
          this.signMenu();
          break;
        case 'negativeSettlement':
          this.negativeSettlement();
          break;
        default:
          // console.log(operation);
          break;
      }
    },
    // 负结算
    negativeSettlement() {
      if (this.$refs.ngtSetment) {
        // 请求下数据{
        ajax('canyin.pos.negativesettle.view', {
          params: {},
        }).then((res) => {
          // 数据
          if (res.success) {
            this.$refs.ngtSetment.open(res.data);
          }
        });
      }
    },
    otherOperation(action) {
      if (this[action]) {
        this[action]();
      }
    },
    // 修改密码
    modifyPassword() {
      this.$refs.modifyPassword.open();
    },
    // 结班
    offWork(authData = {}) {
      this.$vonce('authCode', (code) => {
        this.offWork(code);
      });
      // 结班的时候先check权限
      ajax('canyin.pos.posserial.checkopauth', {
        contentType: 'paramsEncoded',
        data: {
          ...authData,
        },
      }).then((data) => {
        // 认证成功则走判断弹出结班页面的处理
        if (data.success) {
          this.clearOffWork();
        }
        // CONTEXTPATH + "/canyin/pos/posserial/clearing"
        // )
        // this.$refs.offWork.open(result)
      });
    },
    /** 结班弹框类型请求接口 函数
     * 马秋瑶 2018/6/28
     *
    */
    clearOffWork() {
      ajax('canyin.pos.posserial.clearing').then((data) => {
        if (+data === 1) {
          // "ClearOffWorkMsg": "本班尚有未结算的客位，请结算后再结班！"
          this.$message.error(this.$t('Biz.Order.ClearOffWorkMsg'));
        } else if (+data === 2) {
          // 成功过来的数据是2 的话 弹出结班的 报表信息
          const type = data;
          ajax('canyin.pos.posserial.view1').then((res) => {
            this.queryCrmPosSerialInfoException = res.queryCrmPosSerialInfoException;
            this.$refs.offWork.open(res, {
              submit: () => {
                this.bizpsMessageBox(type);
              },
            });
          }).catch((errCode, msg) => {
            this.$message.error(msg);
          });
          //
        } else {
          this.bizpsMessageBox(data);
        }
      }).catch((errorCode, msg) => {
        if (msg) {
          this.$message.error(msg);
        }
      });
    },
    // 获取cookie值
    getCookie(cname) {
      const name = `${cname}=`;
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i += 1) {
        const c = ca[i].trim();
        if (c.indexOf(name) === 0) {
          return c.substring(name.length, c.length);
        }
      }
      return '';
    },
    // 请求crm7的退出登录接口
    requestCrm7LoginOut() {
      const session = this.getCookie('CRMSESSIONID');
      $.ajax({
        url: `http://scrm.wuuxiang.com/crm7/login/${session}/logout.do`,
        async: true,
        type: 'GET',
        success(res) {
          if (res.errMessage) {
            this.$message.error(`${res.errMessage}`);
          }
        },
        error(err) {
          if (err.errMessage) {
            this.$message.error(`${err.errMessage}`);
          }
        },
      });
    },
    /** 结班弹框提示  函数
     * 马秋瑶 2018/6/28
     *"OffworkMBox": "是否确定结班？"
    */
    bizpsMessageBox(type) {
      this.$confirm(this.$t('Biz.Order.OffworkMBox'), {
        confirmButtonText: this.$t('Dict.Sure'),
        cancelButtonText: this.$t('Dict.Cancel'),
        type: 'warning',
      }).then(() => {
        const actions = new Map([
          [2, ['checkunclosedposandishaveendbillFn']], // 标准结班 从结班界面确认事件来的
          [3, ['checkunclosedposandishaveendbillFn']], // 不显示结班页面，不弹出输入金额页面，直接结班 wds 执行盲结
          [4, ['openInputMoney']], // 不显示结班页面，弹出输入金额页面
        ]);
        const action = actions.get(+type);
        if (action) {
          this[action[0]]();
        }
        this.requestCrm7LoginOut();
      }).catch(() => {
        // "OffworkMBox01": "已取消结班操作"
        this.$message({
          type: 'info',
          message: this.$t('Biz.Order.OffworkMBox01'),
        });
      });
    },
    /** 标准结班 的验证接口 函数
     * 马秋瑶 2018/6/28
     *
    */
    checkunclosedposandishaveendbillFn(paywayList, remark) {
      ajax('canyin.pos.posserial.checkunclosedposandishaveendbill', {
        contentType: 'json',
      }).then((res) => {
        if (res.data) {
          // 有数据情况 结班判断
          this.hasDataOffWork(res, paywayList, remark);
        } else {
          // 无数据情况 结班判断
          this.noDataOffWork(res, paywayList, remark);
        }
      }).catch((errCode, msg) => {
        this.$message.error(msg);
      });
    },
    /** 有数据结班逻辑 函数
     * 马秋瑶 2018/6/28
     *
    */
    hasDataOffWork(res, paywayList, remark) {
      if (res.isInvoicing) {
        // 执行结班
        this.isIgnoreCrmData(paywayList, remark);
      } else if (+res.type === 1) {
        this.helpCenter(85, res.msg);
      } else {
        // this.$message.error(res.msg);
        this.$alert(res.msg, this.$t('Dict.Tips'));
      }
    },
    /** 无数据结班逻辑 函数
     * 马秋瑶 2018/6/28
     *"OffworkMBox02": "监测到存在未注销的移动端用户，是否强制注销该用户，进行结班？"
    */
    noDataOffWork(res, paywayList, remark) {
      this.$confirm(this.$t('Biz.Order.OffworkMBox02'), {
        confirmButtonText: this.$t('Dict.Sure'),
        cancelButtonText: this.$t('Dict.Cancel'),
        type: 'warning',
      }).then(() => {
        if (res.isInvoicing) {
          this.isIgnoreCrmData(paywayList, remark);
        } else if (res.msg) {
          if (+res.type === 1) {
            this.helpCenter(85, res.msg);
          } else {
            // this.$message.error(res.msg);
            this.$alert(res.msg, this.$t('Dict.Tips'));
          }
        } else {
          // "ClearOffWorkMsg": "本班尚有未结算的客位，请结算后再结班！",
          this.$message.error(this.$t('Biz.Order.ClearOffWorkMsg'));
        }
      });
    },

    // 检测判断是否忽略CRM结班数据
    isIgnoreCrmData(paywayList, remark) {
      const ignoreCrm7Data = '0';
      const noIgnoreCrm7Data = '1';
      if (this.queryCrmPosSerialInfoException != null && this.queryCrmPosSerialInfoException !== '') {
        // "OffworkMBox03": "请求CRM超时或失败,没有获取到CRM结班数据,是否忽略继续结班?"
        this.$confirm(this.$t('Biz.Order.OffworkMBox03'), {
          confirmButtonText: this.$t('Dict.Sure'),
          cancelButtonText: this.$t('Dict.Cancel'),
          type: 'warning',
        }).then(() => {
          this.bizpsFn(ignoreCrm7Data, paywayList, remark);
        }).catch(() => {
          // "OffworkMBox01": "已取消结班操作",
          this.$message({
            type: 'info',
            message: this.$t('Biz.Order.OffworkMBox01'),
          });
        });
      } else {
        this.bizpsFn(noIgnoreCrm7Data, paywayList, remark);
      }
    },
    offWorkSuccess() {
      if (this.posDevice.enableVice) {
        this.$devices.SubMonitor.close();
      }
      this.$refs.offWork.close();
      this.gotoLoginPager();
    },
    handleClose() {
      this.offWorkSuccess();
    },
    handleChangeOffWorkSwitch(data) {
      this.printDetail = data;
    },
    /** 结班盲结 接口 函数
     * 马秋瑶 2018/6/28
     *
    */
    bizpsFn(isIgnoreCrm7Data, paywayList, remark) {
      if (this.outDeviceSetting.isEndOpenCashbox) {
        this.$devices.Cashbox.open();
      }
      // 获取CRM数据
      // 正在请求营业数据,请耐心等待...
      this.$message.success(this.$t('Biz.Order.OffworkMsg'));
      ajax('canyin.pos.posserial.bizps', {
        contentType: 'paramsEncoded',
        timeout: 60000,
        data: {
          controlMode: this.getVuexPosMode, // 操作模式
          ignoreCrm7Data: isIgnoreCrm7Data,
          paywayList,
          remark,
          printDetail: this.printDetail,
        },
      }).then((res) => {
        if (res.success) {
          if (this.posDevice.enableVice) {
            this.$devices.SubMonitor.close();
          }
          if (res.data.printD) {
            this.$log.info('结班盲结打印');
            this.$devices.Printer.print(JSON.parse(res.data.printD));
          }
          if (this.posFastFood.isSynTransBizData) {
            this.$refs.uploadmoduleNum.open();
          } else {
            this.offWorkSuccess();
          }
          // 销毁设备管理器
        } else {
          this.$alert(res.msg, {
            confirmButtonText: this.$t('Dict.Sure'),
            type: 'error',
            callback: () => {
              if (+res.result === -4) {
                this.gotoLoginPager();
              }
            },
          });
        }
      });
    },
    /** 结班-金额录入 接口 函数
     * 马秋瑶 2018/6/28
     *
    */
    openInputMoney() {
      ajax('canyin.pos.posserial.view1').then((res) => {
        this.$refs.offWorkInputMoney.open(res, {
          submit: (paywayList, remark) => {
            this.checkunclosedposandishaveendbillFn(paywayList, remark);
          },
        });
      });
    },
    // 路由跳转
    jump(href) {
      window.location.href = href;
    },
    gotoLoginPager() {
      this.$router.push({ name: 'deskIndex' });
      // const ENV = process.env;
      // if (ENV.NODE_ENV === 'development') {
      //   this.jump('/');
      // }
      // if (ENV.NODE_ENV === 'production') {
      //   this.jump(`${ENV.API_PATH}${ENV.DIST_PATH}/`);
      // }
    },
    // 营业状态
    businessState() {
      this.$refs.businessState.open();
    },
    // 锁定
    lockPos() {
      const { controlMode } = this.posInfo;
      if (controlMode
        && this.posBaseInfo.isOpenLockScreen[controlMode - 1].isOpen
        && this.posBaseInfo.isOpenLockScreen[controlMode - 1].lockTime > 0) {
        this.screenSaver.clear();
      }
      this.$refs.LockPage.open();
    },
    // 更多
    moreModule() {
      // 如果处于加单状态给予提示
      if (this.isOrdering && +this.posInfo.controlMode !== 3) {
        // 这是除了快餐模式下其他模式下的调弹框方法
        this.$vemit('orderingConfirm', () => {
          this.$refs.moreModule.open();
        });
      } else {
        this.$refs.moreModule.open();
      }
    },
    // 关闭notify盒子里面的所有notify
    closeNotify() {
      this.errNotify.map(item => item.close());
    },
    // 刷新
    reload() {
      window.location.reload();
      if (this.posDevice.enableVice) {
        this.$devices.SubMonitor.send({
          moduleName: 'SubMonitor',
          method: 'reloadDataItem',
          result: [],
        });
      }
    },
    // 设置默认显示模块
    setDefaultModule() {
      // 查找数据中模块列表的 default: true 的模块
      let finded = find(this.moduleList, { default: true });
      // 如果没有找到则把第一个模块设为默认显示模块
      if (!finded) {
        finded = first(this.moduleList);
      }
      // 切换模块到需要默认显示的模块
      // 路由这样判断在任何的子路由界面进行刷新就进入第一个路由界面
      // 改成根据路由的来源页 判断是否是第一次进入（路由根目录：/pos/）进入默认的子路由
      if (this.$route.meta.isposroot) {
        this.toggleModule({ moduleName: finded.moduleName });
      }
      // 切换模块到需要默认显示的模块
      // this.toggleModule({ moduleName: finded.moduleName })
    },
    // 切换模块
    toggleModule(option) {
      if (isNumber(option)) {
        const finded = this.moduleList[option];
        if (finded) {
          this.$router.push(`/pos/${finded.moduleName}`);
        }
      }
      if (isPlainObject(option)) {
        // 找到需要切换到的模块
        const finded = find(this.moduleList, option);
        // 如果找到切换路由
        if (finded) {
          this.$router.push(`/pos/${finded.moduleName}`);
        }
      }
    },
    // 获取帮助模块
    // "HelpBtn": "点击查看帮助信息"
    helpCenter(id, msg) {
      ajax('canyin.index.index.help', {
        contentType: 'paramsEncoded',
        data: {
          helpId: id,
        },
      }).then((res) => {
        this.$alert(
          `<p>${msg}</p><a target="_blank" href="${res}">${this.$t('Biz.Order.HelpBtn')}</a>`,
          this.$t('Dict.Tips'),
          {
            dangerouslyUseHTMLString: true,
          },
        );
        // console.info(`TCSLCMD=OpenURL('${res}')`)
      });
    },
    // 排菜新建、修改的弹框方法
    /**
     * arrangeMenuData 代表的是修改 排菜需要的数据， 不存在认为是新建
     */
    openArrangeMenuDetail(arrangeMenuData) {
      this.arrangeMenuOpenType = 'new';
      if (arrangeMenuData) {
        this.arrangeMenuOpenType = arrangeMenuData.openType;
        // 做法的数据整合
        arrangeMenuData.avtiveMenuItemDetail.forEach((classItem) => {
          classItem.items.forEach((item) => {
            item.name = item.itemSizeId != '-1'
              ? `(${item.sizeName})${item.name}`
              : item.name;
            if (item.methodList && item.methodList.length) {
              const newMethodList = [];
              // 因为目前排菜不支持带有价格的做法
              item.methodList.forEach((method) => {
                newMethodList.push({
                  id: method.methodId,
                  name: method.name,
                  qty: method.qty,
                  isNeedFee: false,
                  fee: 0,
                  isRelaCount: false,
                  feeChanged: false,
                });
              });
              item.methodList = newMethodList;
            }
          });
        });
      }
      // 如果单品模式
      if (this.posInfo.putItemsMode === '1') {
        let arrangeData = {
          menuTempId: '', // 排菜单id
          remark: '', // 备注
          type: 1, // 排菜单类型（线下、线上
          menuPrice: '', // 排菜单价格
          tableNum: 1, // 桌数
          name: '', // 名称
          selcetedItems: [], // 已点品项
          orderId: '', // 已关联预订单的id
        };
          // 如果是修改的话
        if (arrangeMenuData) {
          arrangeData = {
            menuTempId: arrangeMenuData.avtiveMenuItem.id, // 排菜单id
            remark: arrangeMenuData.avtiveMenuItem.remark, // 备注
            type: arrangeMenuData.avtiveMenuItem.type, // 排菜单类型（线下、线上
            menuPrice: Number(arrangeMenuData.avtiveMenuItem.itemPrice), // 排菜单价格
            tableNum: arrangeMenuData.avtiveMenuItem.tableNum, // 桌数
            name: arrangeMenuData.avtiveMenuItem.name, // 名称
            selcetedItems: arrangeMenuData.avtiveMenuItemDetail, // 已点品项
            orderId: arrangeMenuData.avtiveMenuItem.orderId || '', // 已关联预订单的id
          };
        }
        this.$refs.arrangeMenuDetail.open(arrangeData);
        return false;
      }
      ajax(`canyin.pos.arrangemenubase.${arrangeMenuData ? 'menutempmodify' : 'menutempnew'}`)
        .then((data) => {
          // 判断新建 or 修改 组装不同数据, 执行打开页面并传值
          if (arrangeMenuData) {
            // 组装下需要的参数
            const changeMenuData = {
              itemSmallClassList: data.itemSmallClassList, // 小类数据
              items: data.items, // 菜单数据暂时和小类的数据互换
              menuTempId: arrangeMenuData.avtiveMenuItem.id, // 排菜单id
              tempItemId: arrangeMenuData.avtiveMenuItem.itemId, // 模板id
              tempItemName: arrangeMenuData.avtiveMenuItem.itemName, // 模板名称
              remark: arrangeMenuData.avtiveMenuItem.remark, // 备注
              type: arrangeMenuData.avtiveMenuItem.type, // 排菜单类型（线下、线上
              menuPrice: Number(arrangeMenuData.avtiveMenuItem.itemPrice), // 排菜单价格
              tableNum: arrangeMenuData.avtiveMenuItem.tableNum, // 桌数
              name: arrangeMenuData.avtiveMenuItem.name, // 名称
              selcetedItems: arrangeMenuData.avtiveMenuItemDetail, // 已点品项
              orderId: arrangeMenuData.avtiveMenuItem.orderId || '', // 已关联预订单的id
            };
            // 打开页面
            this.$refs.arrangeMenuDetail.open(changeMenuData);
          } else {
            const newMenuData = {
              itemSmallClassList: data.itemSmallClassList, // 小类数据
              items: data.items, // 菜单数据暂时和小类的数据互换
              tempItemId: data.tempItemId, // 模板id
              tempItemName: data.tempItemName, // 模板名称
              remark: '', // 备注
              type: 1, // 排菜单类型（线下、线上
              menuPrice: '', // 排菜单价格
              selcetedItems: [], // 已点品项
              tableNum: 1, // 桌数
              name: '', // 名称
            };
            // 打开页面
            this.$refs.arrangeMenuDetail.open(newMenuData);
          }
        });
    },
    // 获取当前智能餐盘的数据
    getEasyData() {
      let easydishObject = { list: [], isyipan: true };
      if (this.posDevice.enableYiPan && this.posBaseInfo.yipanList.length) {
        easydishObject = {
          list: this.posBaseInfo.yipanList, // 设备的参数
          isyipan: true, // 是否是易盘
        };
      } else if (
        this.posDevice.enableZhiPan
        && this.posBaseInfo.zhipanList
        && this.posBaseInfo.zhipanList.length
      ) {
        easydishObject = {
          list: this.posBaseInfo.zhipanList, // 设备的参数
          isyipan: false, // 是否是易盘
        };
      }
      return easydishObject;
    },
    // 智能餐盘发送的数据
    initEasySendData(item, isyipan) {
      return {
        OpType: 2,
        IP: '',
        Port: '',
        DeviceType: isyipan ? 1 : 2,
        Com: `COM${item.port}`,
        Rate: item.rate,
        OpFrame: isyipan ? '8E1' : '8N1',
      };
    },
    // 智能餐盘的关
    closeEasydisk() {
      if (this.posBaseInfo.isEnableYiPan || this.posBaseInfo.isEnableZhiPan) {
        const getEasyDatas = this.getEasyData();
        if (getEasyDatas.list.length) {
          const easyList = cloneDeep(getEasyDatas.list);
          const shiftParam = this.initEasySendData(easyList.shift(), getEasyDatas.isyipan);
          this.$devices.ETag.init(shiftParam);
          if (easyList.length) {
            each(easyList, (item) => {
              const param = this.initEasySendData(item, getEasyDatas.isyipan);
              setTimeout(() => {
                this.$devices.ETag.init(param);
              }, 400);
            });
          }
          this.setETagItems([]);
          this.eTagItems = [];
        }
      }
    },
    // 智能餐盘的开 getRefreshBs
    openEasydisk() {
      // 判断是否开启了 易盘和智盘的功能
      if (this.posBaseInfo.isEnableYiPan || this.posBaseInfo.isEnableZhiPan) {
        const getEasyData = this.getEasyData();
        if (getEasyData.list.length) {
          const easyList = cloneDeep(getEasyData.list);
          const shiftParam = this.initEasySendData(easyList.shift(), getEasyData.isyipan);
          this.$devices.ETag.open(shiftParam, (data) => {
            this.hanldEasy(data);
          });
          // 截取第一个,剩下的缓存执行
          // const arrSlice = easyList.slice(1);
          if (easyList.length) {
            each(easyList, (item) => {
              const parameter = this.initEasySendData(item, getEasyData.isyipan);
              setTimeout(() => {
                this.$devices.ETag.open(parameter, (data) => {
                  this.hanldEasy(data);
                });
              }, 1000);
            });
          }
        }
      }
    },
    // 易盘处理逻辑 getRefreshBs
    hanldEasy(data) {
      // 因重写中餐模式所以加判断不动快餐的逻辑
      if (`${this.posInfo.controlMode}` === '3') {
        this.$log.info(`设备管理器推送过来的数据----${JSON.stringify(data['ETag.ReadETag'])}`);
        if (!data['ETag.ReadETag']) {
          return;
        }
        if (this.getSelectDiscountPlanData) {
          this.$message.warning(`请先取消打折活动方案:${this.getSelectDiscountPlanData.discountPlanName}`);
        }
        this.eTagItems = data['ETag.ReadETag'];
        this.$log.info(`当前是否打开了模态框----${this.isSendETag}`);
        if (this.isSendETag) {
          this.$log.info(`当前没有打开了模态框的易盘数据----${JSON.stringify(data['ETag.ReadETag'])}`);
          this.setETagItems(data['ETag.ReadETag']);
        }
      } else {
        if (data['ETag.ReadETag']) {
          this.eTagItems = data['ETag.ReadETag'];
        }
        this.$log.info(`当前是否打开了模态框----${this.isSendETag}`);
        if (this.isSendETag) {
          this.$log.info(`当前没有打开了模态框的易盘数据----${JSON.stringify(data['ETag.ReadETag'])}`);
          if (data['ETag.ReadETag']) {
            this.setETagItems(data['ETag.ReadETag']);
          }
        }
      }
    },
    // 负结算的二级权限判断
    setIsShowNgtModule(val) {
      this.powerNegativeSettlement = val;
    },
  },
};
</script>
<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.pos-main-container,
.pos-main-content,
.pos-main-module-list,
.pos-main-module-item {
  height: 100%;
}
.pos-main-container {
  position: relative;
  padding-top: @pos-main-header-height;
  padding-bottom: @pos-main-footer-height;
  background-color: #9dc1ca;
}
</style>
<style lang="less">
  .user-defined-message-style {
    top: 44px;
    transform: translate3d(-50%,0,0);
    transition: all 0.01s;
  }

  .message-top1 {
    top: 8px !important;
  }

  .message-top2 {
    top: 42px !important;
  }

  .message-small {
    padding-top: 8px;
    padding-bottom: 8px;

    .el-message__content {
      font-size: 12px;
    }
  }

  .errorMsgCustomClass{
    top: 80px;
  }
</style>
