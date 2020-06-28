export const url = '/canyin/pos/fillininvoice/tsinvoicemoneyv2'// 发票信息
export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: data.data
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg
  }
}
