export const url = '/canyin/pos/reception/receptionbusiness/receptionbusinessbookingv2';

export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: {
      enable: data.data.isUseBook === '1' && data.data.bookPOS === data.data.posId, // 是否允许使用预订模块
      isOpenBookCancelReason: data.data.IsOpenBookCancelReason === '1', // 必须输入取消原因
      bookedPlatform: data.data.bookedPlatform ? data.data.bookedPlatform : null, // 当前预订对接业务模式: -1:自有业务(吾享线上), 4:食尚订, 5:新荣记, 6:客必得
      deviceType: data.data.deviceType, // 设备类型
      isOpenBookCallerID: data.data.isOpenBookCallerID === '1', // 是否启用来电显示
      reservePointMap: JSON.parse(data.data.reservePointMap), // 预订客位
    },
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
