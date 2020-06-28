const state = {
  mode: '0', // 传配菜模式 '0'：配菜 '1'：传菜
  time: new Date(), // 时钟
  userName: '', // 用户名
  apiPath: '/cy7', // 服务端跟目录
  config: {
    enable: true, // 是否开启厨房管理
    barcodeScanner: false, // 是否开启扫码传菜
    // addOrderToTop: false, // 加单置顶判断
    autoClearKey: false, // 是否自动清空助记符
    onlyShowSmallClass: false, // 只显示小类
    dishesFixed: false, // 固定菜品模式
    tablesFixed: false, // 固定客位模式
    readyToServe: false, // 传菜准备功能
    // timeoutToTop: false, // 超时置顶
    methodsFilter: false, // 做法筛选
    methodsGroup: false, // 做法分组筛选
    countPrepareEmp: false, // 是否统计配菜员业绩
    countCookEmp: false, // 是否统计厨师业绩
    countServeEmp: false, // 是否统计传菜员业绩
    liandong: false, // 联动模式
    quickDoing: false, // 是否开启一键传配
    fixedKeyboard: false, // 固定快捷键盘
    leftCellNum: 0, // 固定列数
    showPackageName: false, // 显示套餐名
    limitModule: false, // 限量模块
    selloutModule: false, // 估清模块
    stateColorMap: {},
    stateOrderList: [],
    isNotDisplayOnPassScreen: false, // 叫起的菜品不显示在传菜屏上
    kitchenKeyBoardSysHabit: {}, // 虚拟键盘切换数据
  },
  filter: { // 过滤方案
    dishes: [], // 菜品过滤
    areas: [], // 区域过滤
    smallClasses: [], // 小类过滤
    saleTypes: [], // 就餐类型过滤
  },
  remindConfig: { // 语音提醒设置
    timeout: { // 超时提醒
      enable: false, // 是否开启
      times: 1, // 提醒次数
      repeat: false, // 是否重复
      cycle: 1, // 重复周期
    },
    hasten: { // 催菜提醒
      enable: false,
      times: 1,
      repeat: false,
      cycle: 1,
    },
    serveDone: false, // 传菜完成提醒
  },
  areas: [], // 区域数据
  tableTypes: [], // 客位类型数据
  bigClasses: [], // 大类数据
  smallClasses: [], // 小类数据
  existingDishes: [], // 固定菜品数据
  existingTables: [], // 固定客位数据
  dishes: {}, // 菜品数据
  screenAction: [], // 筛选后的kscId列表
  checkedArr: [], // 选中菜品
};
export default state;
