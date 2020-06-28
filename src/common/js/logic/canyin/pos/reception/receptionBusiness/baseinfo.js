export const url = '/canyin/pos/reception/receptionbusiness/receptionbusinessbaseinfov2';
export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: {
      currentLanguage: data.data.currentLanguage, // 当前语言
      websocketContextPath: data.data.WS_CONTEXTPATH, // WebSocket 路径
      address: data.data.address, // 地址
      contactTel: data.data.contactTel, // 联系电话
      controlMode: data.data.controlMode, // 前台营业操作模式
      createShopName: data.data.createShopName, // 门店名称
      isDebugMode: data.data.isDebugMode, // Debug 模式
      shopId: data.data.shopId, // 当前门店 ID
      slogan: data.data.slogan, // 广告语
      title: data.data.title.split('-')[0], // 标题
      user: data.data.user, // 登录人信息
      version: data.data.version, // 版本号
      // 以下是原 posinfo 信息
      isKeBiDe: data.data.isKeBiDe ? data.data.isKeBiDe : false,
      isKeBiDeDeposit: data.data.isKeBiDeDeposit ? data.data.isKeBiDeDeposit : false,
      isHaveEndBill: data.data.IsHaveEndBill === '1', // 结班是否允许有未结账客位
      isMoneyInput: data.data.IsMoneyInput === '1', // 是否显示金额录入窗口
      isNPosShowMoney: data.data.IsNPosShowMoney === '1', // 仅在收银模式的 Pos 显示金额
      printWhenEndJob: data.data.IsNotPrintEndJob === '0', // 不打印结班报表
      isOnlyEndJob: data.data.IsOnlyEndJob === '1', // 结班是否显示结班信息
      isShowBillSerial: data.data.IsShowBillSerial === '1', // 状态栏区域显示开台信息
      isShowTotalMoney: data.data.IsShowTotalMoney === '1', // 状态栏区域显示已结金额和未结金额
      doesInputBillModeDisplayFooter: data.data.doesInputBillModeDisplayFooter === '1', // 录单模式状态栏是否显示统计信息
      hasArrangeMenuBaseMsgAuth: data.data.hasArrangeMenuBaseMsgAuth,
      putItemsMode: data.data.putItemsMode, // 排菜的 模式 '0' -老的走套餐模版模式， '1' -新的支持单品和套餐模式
      putItemsDefPrice: data.data.putItemsDefPrice, // '0' - 不自动填写排菜价格必须手动输入 '1' - 自动填写等于所有品项的和不能手动输入
      hasMultiSettle: data.data.hasMultiSettle, // 多次结算
      isAllowUpdatePosModeWhenOpening: data.data.isAllowUpdatePosModeWhenOpening === '1', // 登录系统时允许对收银/快餐模式进行切换
      isBillPrint: data.data.isBillPrint === '1', // 是否打印结账单
      isEnableHandwritingBoard: data.data.isEnableHandwritingBoard === '1', // 启用手写板
      isEnableQWEKeyboard: data.data.isEnableWholeKeyboard === '1', // 是否启用 QWERT 全键盘
      isEnableYiPan: data.data.isEnableYiPan === '1', // 是否启用易盘
      isEnableZhiPan: data.data.isEnableZhiPan === '1', // 是否启用智盘
      isFingerprintMandatory: data.data.isFingerprintMandatory === '1', // 优先使用指纹授权
      isFirstLogin: data.data.isFirstLogin === 'true', // 未知
      isOpenLockScreen: [{
        isOpen: data.data.isOpenLockScreenForCashRegistet === '1', // 收银模式-启用锁屏功能,
        lockTime: parseInt(data.data.lockScreenWaitingTime, 0), // 自动锁屏等待时间（单位秒）
      }, {
        isOpen: data.data.isOpenLockScreen === '1', // 录单模式-启用锁屏功能,
        lockTime: parseInt(data.data.lockScreenWaitingTime), // 自动锁屏等待时间（单位秒）
      }, {
        isOpen: data.data.isOpenLockScreenForFastFood === '1', // 快餐模式-启用锁屏功能,
        lockTime: parseInt(data.data.lockScreenWaitingTime, 0), // 自动锁屏等待时间（单位秒）
      }],
      // isOpenLockScreen: data.data.isOpenLockScreen === '1', // 录单模式-启用锁屏功能,
      isTransparentLockScreen: data.data.isTransparentLockScreen === '1', // 启用透明图
      isNonRMBRefundIsNotAllowed: data.data.isNonRMBRefundIsNotAllowed === '1', // 是否开启了现金部分退
      isOrderPrint: data.data.isOrderPrint === '1', // 是否启用指令打印
      lockScreenWaitingTime: parseInt(data.data.lockScreenWaitingTime, 0), // 自动锁屏等待时间（单位秒）
      nowTime: data.data.nowTime,
      openingCashierPosCount: data.data.openingCashierPosCount,
      orderCount: data.data.orderCount, // 确认到店的预点单数量
      parallelPrinter: data.data.parallelPrinter, // 为了优化快速结算的结账单打印，提前将打印机信息打给前台
      code: data.data.posCode, // 当前 Pos Code
      id: data.data.posId, // 主键
      reserveCount: data.data.reserveCount, // 已确认的预订单数量
      yipanList: data.data.yiPanList, // 易盘数据
      zhipanList: data.data.zhiPanList, // 智盘数据
      reserveUnpaid: data.data.reserveUnpaid, // 是否开启预订挂账(增值业务)
      isMingChenEnable: data.data.isMingChenEnable === '1', // 开启冥晨对接
      isPrintBillAfterAddOrder: data.data.isPrintBillAfterAddOrder === '1', // 加单后打印客用单
      guestSingleIncrementalPrinting: data.data.guestSingleIncrementalPrinting === '1', // 是否需要客单增量打印
      isFastFoodPrepare: data.data.isFastFoodPrepare, // 快餐--是否开启备餐显示
      isEnableAIAddorder: data.data.isEnableAIAddorder, // 快餐--是否启用凯景AI智能加单
      enableAIType: data.data.enableAIType, // 快餐--厂商选择.1:凯景; 2:悠络客
      enableAIParams: data.data.enableAIParams, // 快餐--设备参数集
      enableAIAddorderDev: data.data.enableAIAddorderDev, // 快餐--设备服务地址
      enableAIAddorderCamera: data.data.enableAIAddorderCamera, // 快餐--摄像头地址
      isReservePointOnlyInOpenTheStage: data.data.isReservePointOnlyInOpenTheStage, // 预订客位只能预订开台
      isGenerMarkToKDS: data.data.isGenerMarkToKDS === '1', // 根据KDS方案生成牌号(0: 不生成 1: 生成)
      isNegativeSettle: data.data.isNegativeSettle, // 负加单结算的增值功能
    },
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
