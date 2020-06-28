export const url = '/canyin/pos/module/buffetdeposit/depositscancodeenfore'; // 登记押金线上支付强制确认
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
