export const url = '/canyin/pos/module/buffetdeposit/canceldeposit'; // 退押金
export function trans(data) {
  return +data.result === 1 ? {
    success: true,
    data,
  } : {
    success: false,
    errCode: data.errorCode,
    msg: data.msg,
  };
}
