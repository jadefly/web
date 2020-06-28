export const url = '/canyin/pos/module/buffetdeposit/updatedeposit'; // 修改押金备注
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
