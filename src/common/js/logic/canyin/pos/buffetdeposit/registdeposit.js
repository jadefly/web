export const url = '/canyin/pos/module/buffetdeposit/registdeposit'; // 登记押金
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
