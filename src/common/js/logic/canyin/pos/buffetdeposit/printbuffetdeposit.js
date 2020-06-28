export const url = '/canyin/pos/module/buffetdeposit/printbuffetdeposit'; // 自助模式押金单打印
export function trans(data) {
  return +data.result === 1 ? {
    success: true,
    data: data.msg,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
