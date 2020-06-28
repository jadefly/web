export const url = '/canyin/pos/settlement/pay/twitterlifepayway/settle'; // 微生活预结算
export function trans(data) {
  return data.success ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errorCode,
    msg: data.msg,
  }
}
