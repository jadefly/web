export const url = '/canyin/pos/printaddbilltag/getaddbillprintdata'//打印账单
export function trans(data) {
  return data.success ? {
    success: true,
    data: data
  } : {
    success: false,
    // errCode: data.errCode,
    msg: data.msg
  }
}
