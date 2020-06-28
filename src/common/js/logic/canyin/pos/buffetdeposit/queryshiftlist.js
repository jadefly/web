export const url = '/canyin/pos/module/buffetdeposit/queryshiftlist'; // 市别列表
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
