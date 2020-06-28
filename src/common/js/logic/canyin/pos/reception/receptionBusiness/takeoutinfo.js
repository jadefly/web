export const url = '/canyin/pos/reception/receptionbusiness/receptionbusinesstakeoutv2';

export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: {
      websocketContextPath: data.data.WS_CONTEXTPATH, // WebSocket 路径
      enable: data.data.isOpenTakeout && data.data.takeoutPOS == data.data.posId, // 是否开启外卖
      controlMode: data.data.controlMode,
      autoMakeTime: parseInt(data.data.autoMakeTime), // 自动制作提前时间
      isAutoConfim: data.data.ifAutoConfirm, // 是否自动接单,
      isAutoDistributionPrint: data.data.isAutoDistributionPrint, // 是否自动打印配送单,
      isAutoMake: data.data.isAutoMake, // 是否自动制作
      isAutoSettleGlobal: data.data.isAutoSettleGlobal, // 是否自动结算
      isAutoSettleNoPay: data.data.isAutoSettleNoPay, // 是否自动结算货到付款单
      isPrintSettle: data.data.isPrintSettleTakeOut, // 是否打印结账单
      lunchboxItemId: data.data.lunchboxItemId, // 餐盒费品项
      psFeeItemID: data.data.psFeeItemID, // 配送费品项
      haveTakeoutPhone: data.data.haveTakeoutPhone, // 是否启用电话外卖
      takeoutDeviceType: data.data.takeoutDeviceType, // 电话设备类型
    },
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
