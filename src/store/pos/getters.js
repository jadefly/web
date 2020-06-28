/* eslint-disable no-param-reassign */
/* 所有参数必须加注释,并声明参数的作用 */
// 获取前端自定义配置文件
export const config = state => state.config;
// 获取当前语言
export const locale = state => state.locale;
// export const logoMode = state => state.logoMode // 显示logo
export const showPos = state => state.showPos; // 是否显示选择Pos页
export const showLogin = state => state.showLogin; // 是否显示登录页
export const showKaiban = state => state.showKaiban; // //是否显示开班页
export const isLoginOrLogoutEnterKaiban = state => state.isLoginOrLogoutEnterKaiban; // 进入开班页面的方式
// 当前处理的point 主要客位信息
export const getVuexPointData = state => (state.pointData ? state.pointData : {});
// 品项的 上菜方式信息
export const getVuexItemServeWays = state => (state.order ? state.order.itemServeWays : []);
// 还有个自定分类
export const posOrderBill = state => state.posOrderBill; // 客位账单信息
export const orderBillSum = (state) => {
  if (state.posOrderBill && state.posOrderBill.scList.length > 0) {
    return state.posOrderBill.scList.reduce((sum, item) => sum + item.lastQty, 0);
  }
  return 0;
};
// export const getVuexBsData = state => state.posOrderBill.bsData //就餐客位信息
// export const getVuexCrmMemberQueryData = state => state.posOrderBill.crmMemberQueryData //会员信息
export const posOrderMenu = state => state.menu;
// export const posOrderMenuCustomClasses = state => state.menu.itemCustomClasses
// export const posOrderMenuBigClasses = state => state.menu.itemBigClasses
// export const posOrderMenuSmallClasses = state => state.menu.itemSmallClasses
export const posOrderMenuItems = state => state.menu.items;

export const posTables = state => state.tableInfo.tables;
export const getPosTablesIndex = state => state.tableInfo.tableIndexObject;
export const posAreas = state => state.tableInfo.areas;
// 客位框上显示信息的自定义数据
export const pointContentLayout = state => state.tableInfo.pointContentLayout;
export const posItemBigClasses = state => (state.order ? state.itemInfo.itemBigClasses : null);

export const posItemSmallClasses = state => state.itemInfo.itemSmallClasses;
// 获取需要含有限定的小类数据 limitNum
export const haveLimitSmallClasses = (state) => {
  const hanveLimitSmallClsId = {};
  if (!state.itemInfo.itemCustomClasses) {
    for (let i = 0; i < state.itemInfo.itemSmallClasses.length; i += 1) {
      if (state.itemInfo.itemSmallClasses[i].limitNum) {
        const key = state.itemInfo.itemSmallClasses[i].id;
        hanveLimitSmallClsId[key] = state.itemInfo.itemSmallClasses[i].limitNum;
      }
    }
  }
  return hanveLimitSmallClsId;
};
// 获取当前客位已点品项的小类总和
export const getActiveOrderItemSmClsTotal = state => (_id, items = null, key = 'lastQty') => {
  // 9800000000000244
  // 过滤出当前同一小类已点菜品 排除掉称重确认品项
  items = items || state.posOrderBill.scList;
  const allSameItems = items.filter(list => (list.smallClassId === _id && !list.isConfirmWeigh));
  // 不包含套餐的已点菜的小类和
  const allSameItemsNum = allSameItems.reduce(
    (sum, item) => (sum * 10000 + item[key] * 10000) / 10000,
    0,
  );
  // 过滤出是套餐的
  const isPackageItems = items.filter(list => list.isPackage);
  // 计算下套餐里还有小类的总和
  const pkgListSmallClsNum = isPackageItems.reduce(
    (sum, pkList) => (
      sum * 10000 + pkList.pkgList.reduce(
        (num, item) => (
          num * 10000 + ((item.smallClassId === _id && !item.isConfirmWeigh) ? item[key] * 10000 : 0)
        ) / 10000,
        0,
      ) * 10000
    ) / 10000,
    0,
  );
  // 需要添加下套餐明细的
  return (allSameItemsNum * 10000 + pkgListSmallClsNum * 10000) / 10000;
};
export const posItemTempSmallClasses = state => state.itemInfo.itemTempSmallClasses;
// 临时品项权限
export const tempItemModuleAuth = state => state.itemInfo.tempItemModuleAuth;

export const posItemCustomClasses = state => state.itemInfo.itemCustomClasses;

export const allPosModule = state => state.order.allPosModule;
export const allPosModuleOper = state => state.order.allPosModuleOper; // 二级权限
export const posItems = state => state.itemInfo.items;
export const mateIdGetItemsIndex = state => state.itemInfo.mateIdGetItemsIndex;
export const mateCodeGetItemsIndex = state => state.itemInfo.mateCodeGetItemsIndex;
export const mateBarcodeItemsIndex = state => state.itemInfo.mateBarcodeItemsIndex;
export const mateAidcodeItemsIndex = state => state.itemInfo.mateAidcodeItemsIndex;
// 多条码品相数据
export const itemsMoreBarcode = state => state.itemInfo.itemsMoreBarcode;
// 单品排菜的品项数据
export const ArrangeMenu = state => state.itemInfo.ArrangeMenu;
// 散列化的多条码品相数据
export const createItemBarCodeObj = state => state.itemInfo.createItemBarCodeObj;
// 是否启用多条码数据
export const isItemMoreBarcode = state => (state.order ? state.order.isItemMoreBarcode : null);
// 外部设置的一些相关配置
export const outDeviceSetting = state => state.outDeviceSetting;
// Pos 相关设置
export const setting = state => state.setting;
// 设备的一些相关设置
export const posSettings = state => state.order;
// 客位最后更新时间,yyyy-MM-dd HH:mm:ss
export const getPointsLastModifyTime = (state) => {
  if (state.tableInfo.pointsLastModifyTime.length > 0) {
    return state.tableInfo.pointsLastModifyTime;
  }
  return '';
};

// 品项的估清信息
export const getVuexItemSelloutsMap = state => state.itemInfo.itemSelloutsMap;
// 品项的限量信息

export const getVuexItemLimitsMap = state => state.itemInfo.itemLimitsMap;
export const getVuexitemTimePricesMap = state => state.itemInfo.itemTimePricesMap;
export const getVuexPromoteItemLimitsMap = state => state.itemInfo.promoteLimitMap; // 促销品项数量限制
export const getSettlementPointBillList = state => state.settlementBillData.pointBillList; // 结算账单
export const getSettlementPointList = state => state.settlementBillData.pointList; // 结算客位列表
export const getSettlementBillMap = state => state.settlementBillData.billMap; // // 账单信息
// 结算折扣活动方案
export const getSettlementPointDiscList = state => state.settlementBillData.pointDiscList;
// 结算方式
export const getSettlementPreSettlePayWayList = state => (
  state.settlementBillData.preSettlePayWayList
);
export const getSettleDiscType = state => state.settleDiscType; // 结算页面添加的优惠类型数据
export const posInfo = state => (state.posBaseInfo ? state.posBaseInfo : null);

export const posDevice = state => state.device;

export const posBaseInfo = state => (state.posBaseInfo ? state.posBaseInfo : null); // Pos 基础信息
// Pos 底部信息
export const posFootInfo = state => (state.footInfo ? state.footInfo : null);

export const posFastFood = state => state.order;

export const posBooking = state => state.booking;

export const posTakeout = state => state.takeout;

export const posCrm = state => (state.crm ? state.crm : null);

export const posMember = state => (state.member ? state.member : null);// 荣管家会员模块

export const eTagItems = state => (state.eTagItems ? state.eTagItems : []);
export const getReserveOrderList = state => state.reserveOrderList;
// 搜索模式
export const getVuexPosMode = state => (
  state.posBaseInfo
    ? state.posBaseInfo.controlMode
    : null
);
// 快餐模式下的账单数据
export const getFastFoodBillData = state => state.fastFoodBillData;
// 快餐模式下当前进行打折活动方案的数据
export const getSelectDiscountPlanData = state => state.selectDiscountPlanData;
// 快餐模式下当前代金券的数据
export const getSelectVoucherData = state => state.selectVoucherData;
// 快餐模式下当前会员卡的数据
export const getSelectCrmData = state => state.selectCrmData;

// 暂不使用
// // 快餐模式下 设置快餐的根组件(路由进入)创建DOM的状态, 用于判断该组件状态
// export const getFastFoodStatus = state => state.fastFoodStatus;

// 快餐模式下 执行验证会员方案(会员价和N杯打折)的状态参数对象
export const getFastFoodMemberPlanFlg = state => state.fastFoodMemberPlanFlg;
// 快餐模式下 当前营业流水的执行会员价的状态
// export const getFastFoodDoMemberPriceState = state => state.fastFoodDoMemberPriceState;
// 业务逻辑按钮
export const SERVICE_FUNCTION_BTNS = state => state.order.serviceFunctionBtns;

// 所有模块
export const ALL_POS_MODULE = state => state.order.allPosModule;
// 所有结算自定义按钮
export const CUSTOM_BUTTONS = state => state.order.customButtons;
// 核对单据中修改点菜员权限
export const CHECK_BILL_AUTHOPERS = state => state.order.checkBillAuthOpers;
// 系统时间和互联网
export const timeCompareData = state => state.timeCompareData;
// 中餐电子秤信息
export const newWeightData = state => state.newWeightData;
// 搜索模式
export const searchModel = state => state.order.searchMode;
export const getIsExitData = state => state.isExitData;
export const getIsbatchOperation = state => state.isbatchOperation;
export const getMultisettleArr = state => state.multisettleArr; // 多次结算的菜品
export const getCustomListBtn = state => state.order.customListBtn; // 自定义客单按钮
export const getCustomPositionBtn = state => state.order.customPositionBtn;// 自定义客位按钮
export const getCustomMenuBtn = state => state.order.customMenuBtn;// 自定义加单按钮
export const getCustomFastFoodMenuBtn = state => state.order.customFastFoodMenuBtn;// 自定义快餐加单按钮
export const getDialog = state => state.dialogArr;
export const getRefreshBs = state => state.refreshBs;
// 做法分组的设置是否开启
export const getisSetUpGroupMethod = state => state.setting.isEnableMakeMethodGroup;
// 快餐获取打折和结算方式信息
export const getDiscPlanAndPayway = state => state.discPlanAndPayway;
// 获取当前打开的结算窗口的bsCode
export const getSettleBsCode = state => state.settleBsCode;
// 获取用户桌面挂账账户ID
export const getCreditAccount = state => state.creditAccount;

// 打包做法
export const packMethod = state => state.order.packTempMethod;
// 用户桌面页面基础数据
export const deskPageBaseInfo = state => state.deskPageBaseInfo;
// 用户桌面权限数据
export const deskPageAuthModules = state => state.deskPageAuthModules;
// 是否需要对客位有关的推送处理
export const getIsNeedTableWsHandle = state => state.isNeedTableWsHandle;
// 获取当前客位所属的客位分组id
export const getPointGroupId = state => state.activePointGroupId;
