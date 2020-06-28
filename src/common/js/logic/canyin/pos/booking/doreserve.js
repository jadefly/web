export const url = '/canyin/pos/reservebill/doreserve';
export function trans(res) {
  return +res.result === 1 ? {
    success: true,
    data: res,
  } : {
    success: false,
    msg: res.msg,
    errCode: res.errCode,
  };
}
