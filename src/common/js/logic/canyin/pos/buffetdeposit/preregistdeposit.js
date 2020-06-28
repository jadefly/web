export const url = '/canyin/pos/module/buffetdeposit/preregistdeposit'; // 押金线上预支付
export function trans(data) {
  return +data.result === 1 ? {
    success: true,
    data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
