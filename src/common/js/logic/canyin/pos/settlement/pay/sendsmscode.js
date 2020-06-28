export const url = '/canyin/pos/settlement/pay/onticktypepayway/sendsmscode'
export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: data.msg,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg
  }
}
