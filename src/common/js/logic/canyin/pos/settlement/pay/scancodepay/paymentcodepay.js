export const url = '/canyin/pos/settlement/pay/scancodepay/paymentcodepay'
export function trans(data) {
  return data ? {
    success: true,
    data: data
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg
  }
}
