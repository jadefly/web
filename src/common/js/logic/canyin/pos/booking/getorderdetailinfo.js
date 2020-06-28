export const url = '/canyin/pos/booking/getorderdetailinfo';
export function trans(res) {
  return res.success ? {
    success: true,
    data: res,
  } : {
    success: false,
    data: res.msg,
  };
}
