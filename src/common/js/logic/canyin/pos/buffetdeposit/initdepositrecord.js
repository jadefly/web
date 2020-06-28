export const url = '/canyin/pos/module/buffetdeposit/initdepositrecord'; // 初始化押金登记记录
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
