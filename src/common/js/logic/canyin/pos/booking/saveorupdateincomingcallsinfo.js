export const url = '/canyin/pos/booking/saveorupdateincomingcallsinfo';
export function trans(res) {
  return res.success ? {
    success: true,
    data: res,
  } : {
    success: false,
    msg: res.msg,
  };
}
