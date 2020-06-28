export const url = '/canyin/pos/booking/printordercollect';
export function trans(res) {
  return res.code === '1' ? {
    success: true,
    data: res,
  } : {
    success: false,
    msg: res.msg,
    errCode: res.errCode,
  };
}
