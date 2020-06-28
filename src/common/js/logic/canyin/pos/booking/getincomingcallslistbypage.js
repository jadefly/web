export const url = '/canyin/pos/booking/getincomingcallslistbypage';
export function trans(res) {
  return res.success ? {
    success: true,
    data: res.data,
  } : {
    success: false,
    data: res.msg,
  };
}
