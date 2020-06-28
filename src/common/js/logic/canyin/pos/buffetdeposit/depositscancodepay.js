export const url = '/canyin/pos/module/buffetdeposit/depositscancodepay'; // 登记押金扫码支付
export function trans(data) {
  return +data.result === 1 ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
