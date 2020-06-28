/* 所有参数必须加注释,并声明参数的作用 */

const state = {
  payPageOpen: 0, // 支付页面是否打开 0默认 1开 2关闭
  currentPointId: null, // 当前客位id
  timerImgDetect: null, // AI图片识别定时器
  isNeedTableWsHandle: true, // 控制客位推送的处理
  selectVoucherData: null, // 快餐当前选择的代金券数据
  selectCrmData: null, // 快餐当前选择会员卡的数据
  selectDiscountPlanData: null, // 快餐当前选择的打折活动方案的数据
  fastFood: null, // 快餐相关信息
  config: { // 前端配置（一般针对客户个性需求）static/config/index.json 配置文件会修改这里
    showLoadingMessage: false, // 点击Loading是否出提示（维护一般会用到，分析点不动问题）
    bigContinuedBillTag: false, // 是否显示超大块头的客位续单标识
    printLeaveTableAfterDesignates: false, // 挂单后是否打印留台单
    highlightBSRemark: false, // 是否突出显示整单备注
    jijihongHotkey: false, // 季季红特殊快捷键（加单页*键触发数量）
    kdsCustomScreenWidth: false, // 厨房管理按单传菜适应1280宽度屏幕
    tableActiveYellow: false, // 九田家定制：选中客位边框颜色变黄色
    dontPrintStatementAfterCancelOrder: false, // 废单后不打印
    // 郑州分（产品：李建福）用户桌面屏蔽CRM和云供应链按钮
    hideCrmAndCloudSupplyChain: false,
    kdsTimeStepping: 10,
    isOpenNewWesocket: false, // 是否开启新的推送
  },
  locale: '', // 国际化：当前语言（与后台数据统一的值）
  footInfo: { // 底部信息
    currentBusinessDay: { // 当前营业日
      notSettlementMoney: 0, // 未结金额
      opened: null, // 开台数
      settled: 0, // 结算数
      settlementMoney: 0, // 已结金额
      unsettle: null, // 未结算数
      settledPeople: 0, // 结算人数
      unsettledPeople: 0, // 未结人数
    },
    currentShift: { // 当前市别信息
      notSettlementMoney: 0, // 未结金额
      opened: null, // 开台数
      settled: null, // 结算数
      settlementMoney: 0, // 已结金额
      unsettle: null, // 未结算数
      settledPeople: 0, // 结算人数
      unsettledPeople: 0, // 未结人数
    },
  },
  posBaseInfo: {
    currentLanguage: '', // 当前语言
    websocketContextPath: null, // WebSocket 路径
    createShopName: '', // 门店名称
    address: '', // 地址
    contactTel: '', // 联系电话
    controlMode: null, // 前台营业操作模式
    crmVersion: null, // CRM 版本
    isDebugMode: false, // Debug 模式
    shopId: 0, // 当前门店 ID
    title: '', // 标题
    slogan: '', // 广告语
    version: '', // 版本号
    user: { // 登录人信息
      name: '',
    },
    centerId: null, // 貌似只有分店才有
    isKeBiDe: false, // 开启客必得增值
    isKeBiDeDeposit: false, // 开启客必得退押金
    isHaveEndBill: false, // 结班是否允许有未结账客位
    isMoneyInput: false, // 是否显示金额录入窗口
    isNPosShowMoney: false, // 仅在收银模式的 Pos 显示金额
    printWhenEndJob: false, // 不打印结班报表
    isOnlyEndJob: false, // 结班是否显示结班信息
    isShowBillSerial: false, // 状态栏区域显示开台信息
    isShowTotalMoney: false, // 状态栏区域显示已结金额和未结金额
    putItemsMode: '0', // 排菜的 模式 '0' -老的走套餐模版模式， '1' -新的支持单品和套餐模式（如果开启了食尚订增值业务走单品模式）
    putItemsDefPrice: '0', // '0' - 不自动填写排菜价格必须手动输入 '1' - 自动填写等于所有品项的和不能手动输入
    doesInputBillModeDisplayFooter: false, // 录单模式状态栏是否显示统计信息
    hasArrangeMenuBaseMsgAuth: false,
    isAllowUpdatePosModeWhenOpening: false, // 登录系统时允许对收银/快餐模式进行切换
    isBillPrint: false, // 是否打印结账单
    isEnableHandwritingBoard: false, // 启用手写板
    isEnableQWEKeyboard: false, // 是否启用 QWERT 全键盘
    isEnableYiPan: false, // 是否启用易盘
    isEnableZhiPan: false, // 是否启用智盘
    isFingerprintMandatory: false, // 优先使用指纹授权
    isFirstLogin: false, // 未知
    isOpenLockScreen: [], // 启用锁屏功能,
    isOrderPrint: false, // 是否启用指令打印
    lockScreenWaitingTime: 60, // 自动锁屏等待时间（单位秒）
    nowTime: '',
    openingCashierPosCount: 0,
    orderCount: 0, // 确认到店的预点单数量
    parallelPrinter: {}, // 为了优化快速结算的结账单打印，提前将打印机信息打给前台
    code: '', // 当前 Pos Code
    id: '', // 主键
    reserveCount: 0, // 已确认的预订单数量
    yipanList: [], // 易盘数据
    zhipanList: [], // 智盘数据
    isMingChenEnable: false, // 是否开启冥晨对接
    isPrintBillAfterAddOrder: false, // 加单后打印客用单
    isReservePointOnlyInOpenTheStage: '0', // 预订客位只能预订开台
  }, // Pos 基础信息
  booking: {
    enable: false, // 是否允许使用预订模块
    isOpenBookCancelReason: false, // 必须输入取消原因
    bookedPlatform: null, // 当前预订对接业务模式: -1:自有业务(吾享线上), 4:食尚订, 5:新荣记, 6:客必得
    devicePathNum: 1, // 预定业务-来电设备线路路数
    deviceType: '', // 设备类型
    isOpenBookCallerID: false, // 是否启用来电显示
    reservePointMap: '{}', // 预订客位
    executedPoints: [], // 预订执行后的客位id(数组)
  }, // 预订模块相关信息
  crm: null, // 会员模块相关信息
  order: {
    autoTaggingPackingStatus: false, // 销售类型选择非堂食时，已选品项自动标记打包状态
    packTempMethod: null, // 打包做法
    isEnableSmallItemAddOrderMoreItem: false,
    addOrderMultiSpecification: false, // 加单时多规格品项自动添加默认规格
    isForbiddenEditBillAmount: false, // 争鲜不允许修改账单金额设置 isForbiddenEditBillAmount   1开启；0未开启
    // 快餐特供
    codeMode: null, // 快餐-牌号设置
    isEnableSushiExpress: false, // 争鲜增值设置 IsEnableSushiExpress   1开启；0未开启
    // isShowTotalMoney: false, // 状态栏区域显示已结金额和未结金额
    bsOrderCodeMode: null, // 快餐模式-牌号设置
    buffetPointId: null, // 默认客位id
    cashBoxReasons: null,
    discountPlanList: [], // 打折和优惠列表
    existsTsPayway: false, // 忘了
    btns: [], // 结算,结算及优惠业务按钮列表
    customListBtn: [], // 自定义客单按钮
    customPositionBtn: [], // 自定义客位按钮
    customMenuBtn: [], // 自定义加单按钮
    customFastFoodMenuBtn: [], // 快餐自定义加单按钮
    serviceBtns: [],
    // haveTakeoutPhone: data.data.haveTakeoutPhone, // 是否启用电话外卖
    showOtherPOSCheckoutBills: false, // 是否显示其他POS的已结账单
    saleTypeVal: false, // 销售类型: 堂食/外带/外卖. 1:堂食+外带,返回值为true; 2:堂食+外带+外卖 ,返回值false
    // takeoutDeviceType: data.data.takeoutDeviceType, // 电话设备类型
    vouchers: [], // 自己去百度
    wipeZeroModeKey: null, // 抹零方案
    wipeZeroPositionKey: null, // 抹零位置

    isSynTransBizData: false, // 是否结班后立即传输营业数据
    isWriteManagerDiary: false, // 结班时提醒填写经理日记
    isAutoClearKey: false, // 是否在选择菜品后自动清空助记符
    isBackMain: false, // 是否在提交菜品后自动返回客位界面
    isOnlyAddBillByItemCode: false, // 只通过编码加单
    isShowAvgMoney: false, // 客位列表显示人均消费金额
    isShowFastInputNum: false,
    isShowMoney: false, // 客位列表是否显示消费金额
    isShowMoneyAndNumOfPeople: false, // 同时显示就餐人数、消费金额
    isShowSpendTime: false, // 是否显示消费时长
    isShowSpendTimeOutAlert: false, // 启用消费超时预警提醒, 1启用，0不启用
    saleType: 1, // 默认销售类型 1:堂食, 2:外带, 3:外卖
    spendTimeLimit: null, // 消费超时的设置时间
    allPosModule: [], // 所有功能按钮
    checkBillAuthOpers: [], // 核对单据中的二级权限，目前用于修改点菜员
    allPosModuleOper: null, // 加单，结算二级权限
    customButtons: {}, // 按钮自定义
    dedicatedMethodsDefaultPopup: false, // 专用做法默认弹窗选择
    defaultCancelReason: '', // 默认返位原因
    defaultPresentReason: '', // 默认赠送原因
    discountGiveItemFlg: '', // 惠赠品项
    discountGiveItems: '[]', // 惠赠品项
    isOnlyShowSmallClass: false, // 加单页面的类别过滤只显示小类
    isSingleLineDisplayForSmallClassAndCustomClass: false, // 小类/自定义类别单行显示
    isShortcutBarSingleLineDisplayForFastFoodMode: false, // 快餐模式快捷工具栏单行显示（快捷支付btn）
    isAllowAddOrderWhenLimitZero: false, // 允许限量为 0 时继续加单
    isAllowDarkScan: false, // 模糊搜索下是否可以扫码加单
    isChangeItemLimitWhenAddOrder: false, // 加单时改变品项限量数量
    isDefaultEmptyByOpenTable: false, // 开台时就餐人数默认为空
    isEnableAlertWhenPrintSettleBill: false, // 是否启用结账单打印提醒功能
    isForceMemberQuery: false, // 启用销售方案会员价之后是否启用强制验证会员
    isHaveMemberPriceItem: false, // 是否是会员价品项
    isItemMoreBarcode: false, // 是否启用多条码
    isEnterKeyAllowsInlyOneItem: false, // 回车键只允许添加一个品项
    isMergeAddBill: false, // 加单时允许增加重复品项（false：合并 true：重复）该选项仅对收银和录单模式生效
    isMergeAddBillForBuffet: false, // 加单时允许增加重复品项（false：合并 true：重复）该选项仅对快餐模式生效
    isNetWeight: false, // 是否启用电子称去皮功能
    disableBarcodeScanner: false, // 禁用扫码枪点餐
    isOpenSelf: false, // 是否开通自助功能
    isOpenBuffetDeposit: false, // 是否开通自助功能
    isPincaiZeroPrice: false, // 拼菜时，附菜销售价格显示为0
    isShowCancelReason: false, // 是否显示选择返位原因
    isShowItemCode: false, // 是否显示菜品编号
    isShowPresentReason: false, // 是否显示选择赠送原因
    isWithdrawCashEnable: false, // 是否启用提现功能
    itemServeWays: [], // 上菜方式
    presentReasons: [], // 赠单原因
    scaleItemCodeLength: 0, // 电子秤扫描条码品项代码长度
    scaleItemCodeStart: 0, // 电子秤扫描条码品项代码开始位置
    scaleItemQuantityIntegerLength: 0, // 电子秤扫描条码品项数量整数部分长度
    scaleItemQuantityLength: 0, // 电子秤扫描条码品项数量长度
    scaleItemQuantityStart: 0, // 电子秤扫描条码品项数量开始位置
    searchMode: '1',
    serviceFunctionBtns: [], // 业务功能按钮
    pointKeyboardMode: 1, // 客位页面的软键盘默认模式 1-九宫格 2-拼音
    addOrderKeyboardMode: 1, // 加单页面的软键盘默认模式 1-九宫格 2-拼音  中餐快餐通用
    submitDoodConstraintSelectWaiter: false, // 加单是否强制选择点菜员]
    noWeighingItemAllowDiscountPrejunction: false, // 录单模式未称重
    depositItemId: null, // 押金费品项id，自助餐登记押金
    isOpenDepositSet: 0, // 前台押金金额是否可编辑，0:可编辑;1:不可编辑 （默认可编辑）
    depositModel: 0, // 押金金额：0:押金金额固定为押金费品项; 1:押金金额为 人数 * 押金费品项
    depositItemPrice: 0, // 自助押金的固定押金金额(默认空)
    lastAdditionWhenAddingOrders: '0', // 控制加单是否回显之前已点品项 182-1191 by L.R
    openSoundReminderforScanPayment: true, // 是否开启扫码付声音提醒
    turnOnThePreOrderSingleToneReminder: true, // 是否开启预点单声音提醒
    openTheTableAndPayvoiceReminder: true, // 是否开启桌边付声音提醒
    openTakeawaySingleSoundReminder: true, // 是否开启外卖单声音提醒
    openOutOrderVoiceRemind: true, // 是否开启了外卖退单声音提醒
    isAddOrderReadMenu: false, // 加单默认读取点菜单品项
    isFishCoolEnable: false, // 是否是鱼酷
    isUsePercentageTab: false, // 是否启用自定义标签(开台时)
    isHaveFullGift: false, // 是否有满赠方案
    isHaveFullExchange: false, // 是否有换购方案
    eaters: [], // 自助餐-客人类型数据集
    xianGuoAddOrderBarType: -1, // 加单工具栏设置,0:平铺显示 1:工具栏显示
    xianGuoFastSettleBarType: 0, // 快速结算打折设置, 默认值0(0:抽屉显示 1:弹框显示)
  }, // 点餐模块相关信息
  tableInfo: {
    areas: [],
    tables: [],
    types: [],
    pointsLastModifyTime: '', // 客位最后更新时间, 传到前台, 更新时将此值发回, 后台将比此时间新的客位传回去, 实现增量逻辑
    pointContentLayout: {}, // 客位框上显示信息的自定义数据
    tableIndexObject: {}, // 客位数据根据客位id映射的下标
    tablesClone: [],
  },
  activePointGroupId: null,
  itemMethodSellout: [], // 做法估清
  itemInfo: {
    publicMethodClass: [], // 所有通用做法类别
    itemBigClasses: [], // 品项大类
    itemLimitsMap: {}, // 限量信息
    promoteLimitMap: {}, // 促销限量信息
    itemTimePricesMap: {}, // 时价信息
    itemSelloutsMap: {},
    itemSmallClasses: [], // 品相小类
    itemTempBigClasses: [], // 临时品项大类
    itemTempSmallClasses: [], // 临时品项小类
    items: [],
    mateIdGetItemsIndex: {}, // id和规格id主键值内容下标
    mateBarcodeItemsIndex: {}, // 商品条码主键 下标
    mateCodeGetItemsIndex: {}, // code主键值内容下标
    mateAidcodeItemsIndex: {}, // 辅助code主键值内容下标
    itemsMoreBarcode: [],
    ArrangeMenu: [],
    createItemBarCodeObj: null,
    privateMethodListJson: [], // 所有专用做法
    publicMethodClassJson: [], // 所有通用做法
    publicMethodListJson: [], // 所有通用做法
    itemCustomClasses: null, // 品项自定义分类
    tempItemModuleAuth: false, // 临时品项权限
  },
  device: {
    baudRate: 0, // 客显波特率
    cashboxBrand: '', // 钱箱品牌
    cashboxBrandType: '', // 钱箱型号
    cashboxPrint: '', // 钱箱-打印机
    cashboxStartCommand: '', // 打开钱箱指令
    cashboxStyle: '', // 用于区分类型标志位 '1'：按接口设置 '2'：按厂商设置
    cashboxUseMode: '', // 按接口设置
    // code: data.data.SYS_SETTING.pos.code,  // 未知 值为 null
    enableCashbox: false, // 是否启用钱箱
    enableScale: false, // 是否启用电子秤
    enableScreen: false, // 是否启用客显
    enableVice: false, // 是否启用副屏
    enableYiPan: false, // 是否启用易盘
    enableZhiPan: false, // 是否启用智盘
    isEnable1: false, // 选中的设置类型（结账单）
    qrcodeType2: 0, // 预结单二维码打印类型
    scaleMode: 0, // 电子秤类型
    isSupportNewWeight: false, // 当前电子秤是否是支持去皮功能的电子秤
    scalePort: 0, // 电子秤端口
    screenMode: 0, // 客显类型
    screenPort: 0, // 客显端口
    settingValue: null, // 设置类型实际值，这里对应[厂商] 值为 null
    readCardOpt: '', // 获取会员卡号需要用到的参数
    groupLightReadCardOpt: null, // 群光会员卡所用的参数
    isNetWeight: false, // 电子秤去皮
  },
  outDeviceSetting: {
    isAccounAutoOpenCashbox: false,
    isEndOpenCashbox: false, // 未知
    isOthersOpenCashbox: false, // 未知
    isStartOpenCashbox: false, // 未知
    scaleItemCodeLength: 0, // 未知
    scaleItemCodeStart: 0, // 未知
    scaleItemQuantityIntegerLength: 0,
    scaleItemQuantityLength: 0,
    scaleItemQuantityStart: 0,
  }, // 未知
  setting: {
    electronicScaleUnit: 0, // 电子秤点位，0：公斤 1：斤
    POSReservedDecimal: 3, // 终端保留位数，默认3位
    POSWeighingUnit: 0, // pos称重单位 0：公斤 1：斤 2：克
    crmVersion: 0, // CRM 版本
    enableCrm: false, // 是否允许使用会员模块
    enableCrm7: false, // 是否允许使用会员模块
    websocketContextPath: '',
    controlMode: null, // Pos 操作模式
    createShopId: '', // 创建店 ID 值为 null
    createShopName: '', // （虚列）创建店 值为 null
    createTime: '', // 创建时间 值为 null
    creatorId: '', // 创建人 ID 值为 null
    creatorName: '', // （虚列）创建人 值为 null
    delflg: null, // 删除标识 值为 null
    downloadFlg: null, // 下载标识 值为 null
    enableBill: '', // 是否结账单
    enableGuestBill: '', // 是否客用单
    enableGuestQtyChange: '', // 是否更改人数单
    enableItemToBill: '', // 是否单品转台单
    enableOnlineConfirm: '', // 是否线上点菜确认单
    enablePointChange: '', // 是否更换客位单
    enablePosWipeZero: false, // 是否启用按 Pos 设置抹零方式
    enablePreBill: '', // 是否预结单
    enableTotalPart: '', // 是否总单与分单
    enterMainBiz: false, // 录单模式再次登录不进行 Pos 选择
    isBuffetOrderPos: null, // 未知 值为 null
    isFoodPlazaPos: null, // 未知 值为 null
    isLimitItemClass: false, // 未知
    isPosToTakeout: false,
    isShieldReserveOrder: false, // 是否屏蔽预点单（快餐模式专用）
    isShieldReserveOrderAfterPay: false, // 是否屏蔽在线付（收银模式专用）
    modifierId: null, // 修改人 ID 值为 null
    modifierName: null, // （虚列）修改人 值为 null
    modifyTime: null, // 最后修改时间 值为 null
    name: null, // 未知 值为 null
    pinyin: null, // 拼音字母 值为 null
    pk: null, // 未知
    posBanFastFoodBtnJson: null, // 未知 值为 null
    posEmpLimit: null, // 未知 值为 null
    posId: '',
    posItemClassLimit: null, // 未知 值为 null
    posItemExcludeLimit: null, // 未知 值为 null
    posItemLimit: null, // 未知 值为 null
    posKitchenItemFilter: '', // 未知 值为 ''
    posKitchenKDSMode: '0', // 未知 值为 '0'
    posKitchenMode: '', // 未知 值为 ''
    posReservePoint: '[]', // Pos 管理的预点单客位
    posSetId: null, // 配置项目 ID 值为 null
    posSetType: null, // 配置项目类型 值为 null
    posSetValue: null, // 配置项目值 值为 null
    saleType: null, // 默认销售类型 1：堂食 2：外带 3：外卖
    uploadFlg: null, // 上传标识 值为 null
    wipeZeroMode: '', // 抹零方式
    wipeZeroModeName: '', // 抹零方式名称
    wipeZeroPosition: '', // 抹零位置
    wipeZeroPositionName: '', // 抹零位置名称
    yiPanListJson: null, // 未知
    zhiPanListJson: null, // 未知
    isEnableMakeMethodGroup: false, // 是否开启了做法分组设置
    isAuthCardMandatory: false, // 是否开启了授权强制使用员工卡
    defaultInvoiceType: 0, // 开发票默认类型
    baseCurrency: {}, // 本位币
    isInternational: false, // 是否开启了国际化增值(本位币)
    isUseSeat: '0', // 是否启用席数 1-是 0-否 v187新增
  },
  reserve: null, // 预点模块相关信息
  takeout: {
    enable: false, // 是否开启外卖
    autoMakeTime: 0, // 自动制作提前时间
    isAutoConfim: false, // 是否自动接单,
    isAutoDistributionPrint: false, // 是否自动打印配送单,
    isAutoMake: false, // 是否自动制作
    isAutoSettleGlobal: false, // 是否自动结算
    isAutoSettleNoPay: false, // 是否自动结算货到付款单
    isPrintSettle: false, // 是否打印结账单
    lunchboxItemId: null, // 餐盒费品项
    psFeeItemID: null, // 配送费品项
    haveTakeoutPhone: false, // 是否启用电话外卖
    takeoutDeviceType: false, // 电话设备类型
    isNewTakeoutPhoneOrder: false, // 是否启用电话外卖单业务
  }, // 外卖模块相关信息
  // logoMode:null, // logo显示标识
  showPos: null, // 是否显示选择Pos页
  showLogin: null, // 是否显示登录页
  showKaiban: null, // 是否显示开班页
  isLoginOrLogoutEnterKaiban: null, // 进入开班页面的方式  true 为登录进入 false为退出进入
  pointData: null, // 当前正操作的point 客位信息
  // 客位页面的数据
  posOrderBill: null,
  // posOrderBill:{
  //   bsData:{}, //客位账单数据
  //   scList:[], // 就餐客位信息
  //   crmMemberQueryData:{} // 会员信息
  // },
  menu: {
    itemCustomClasses: null,
    itemBigClasses: null,
    itemSmallClasses: null,
    items: [],
  },
  // 头部通知计数
  headerNotifyCount: {
    reserveCount: 0, // 预点计数
  },
  settlementBillData: {// 结算数据
    pointBillList: [], // 结算账单
    pointList: [], // 结算客位列表
    billMap: {}, // 账单信息
    pointDiscList: [], // 结算折扣活动方案
    preSettlePayWayList: [], // 结算方式
  },
  // 结算页面添加的优惠类型数据
  settleDiscType: [],
  eTagItems: [],
  serviceFunctionBtns: [], // 业务按钮
  // allPosModule: [], // 所有Pos按钮
  customButtons: {}, // 按钮自定义
  reserveOrderList: null, // 修改预点单过来的数据

  // 暂不使用
  // // 快餐 设置快餐的根组件(路由进入)创建DOM的状态, 用于判断该组件状态
  // fastFoodStatus: null,

  fastFoodBillData: null, // 快餐模式下的账单数据
  // 快餐模式下 会员的方案(验证会员的'会员价(同外部'会员价'按钮)'和'N杯打折')状态数据
  fastFoodMemberPlanFlg: {
    isDoMemberPrice: false, // 是否已执行会员价
    isDoNcupPlan: false, // 是否已执行N杯打折
    nCupDiscountPlanId: null, // N杯打折的方案ID
  },
  timeCompareData: {
    timeOver: false,
    systemTime: 0,
    interTime: 0,
  }, // 系统时间与互联网时间
  member: {
    enable: false, // 是否允许使用荣管家会员模块
  }, //
  newWeightData: {}, // 中餐电子秤信息
  isExitData: false, // 标记是不是废单重结
  isbatchOperation: false, // 批量操作
  multisettleArr: [], // 多次结算的菜品
  dialogArr: [],
  refreshBs: true,
  // fastFoodDoMemberPriceState: false, //快餐模式下的
  isSetUpGroupMethod: false, // 是否开启了做法分组设置
  // 快餐打折和结算方式信息
  discplayAndPayway: {
    discTypeList: {
      discTypeList: [],
      discountPlanList: [],
      discountPlanSelect: '',
      fulloffList: [],
    },
    payWayList: [],
  },
  settleBsCode: null, // 更多结算窗口、快餐快捷支付宝、微信、银联、二码合一打开时的bsCode
  creditAccount: null, // 用户桌面挂账账户ID
  // 用户桌面页面基础数据
  deskPageBaseInfo: {
    versionInfo: {
      version: '',
      versionTypeName: '',
      releaseDate: '',
      dbVersion: '',
    },
    cy7CenterUrl: '',
    user: {
      name: '',
      shopId: '',
      code: '',
      password: '',
    },
    isGroupEmp: false,
    HTTP_CONTEXTPATH: 'http://127.0.0.1:7001/cy7',
  },
  // 用户桌面权限数据
  deskPageAuthModules: {},
};

export default state;
