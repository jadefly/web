export const url = '/canyin/pos/reception/receptionbusiness/receptionbusinessposinfov2';
export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: {
      isHaveEndBill: data.data.IsHaveEndBill === '1', // 结班是否允许有未结账客位
      isMoneyInput: data.data.IsMoneyInput === '1', // 是否显示金额录入窗口
      isNPosShowMoney: data.data.IsNPosShowMoney === '1', // 仅在收银模式的 Pos 显示金额
      printWhenEndJob: data.data.IsNotPrintEndJob === '0', // 不打印结班报表
      isOnlyEndJob: data.data.IsOnlyEndJob === '1', // 结班是否显示结班信息
      isShowBillSerial: data.data.IsShowBillSerial === '1', // 状态栏区域显示开台信息
      isShowTotalMoney: data.data.IsShowTotalMoney === '1', // 状态栏区域显示已结金额和未结金额
      doesInputBillModeDisplayFooter: data.data.doesInputBillModeDisplayFooter === '1', // 录单模式状态栏是否显示统计信息
      isAllowUpdatePosModeWhenOpening: data.data.isAllowUpdatePosModeWhenOpening === '1', // 登录系统时允许对收银/快餐模式进行切换
      isBillPrint: data.data.isBillPrint === '1', // 是否打印结账单
      isEnableHandwritingBoard: data.data.isEnableHandwritingBoard === '1', // 启用手写板
      isEnableQWEKeyboard: data.data.isEnableWholeKeyboard === '1', // 是否启用 QWERT 全键盘
      isEnableYiPan: data.data.isEnableYiPan === '1', // 是否启用易盘
      isEnableZhiPan: data.data.isEnableZhiPan === '1', // 是否启用智盘
      isFingerprintMandatory: data.data.isFingerprintMandatory === '1', // 优先使用指纹授权
      isFirstLogin: data.data.isFirstLogin === 'true', // 是否是首次登录
      isOpenLockScreen: data.data.isOpenLockScreen === '1', // 启用锁屏功能,
      isOrderPrint: data.data.isOrderPrint === '1', // 是否启用指令打印
      lockScreenWaitingTime: parseInt(data.data.lockScreenWaitingTime, 0), // 自动锁屏等待时间（单位秒）
      nowTime: data.data.nowTime,
      openingCashierPosCount: data.data.openingCashierPosCount,
      parallelPrinter: data.data.parallelPrinter, // 为了优化快速结算的结账单打印，提前将打印机信息打给前台
      code: data.data.posCode, // 当前 Pos Code
      id: data.data.posId, // 主键
      yipanList: data.data.yiPanList, // 易盘数据
      zhipanList: data.data.zhiPanList, // 智盘数据
    },
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
