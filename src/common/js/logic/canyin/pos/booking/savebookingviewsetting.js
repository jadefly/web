export const url = '/canyin/pos/booking/savebookingviewsetting';
export function trans(res) {
  return res.success ? {
    success: true,
    data: { success: true },
  } : {
    success: false,
    msg: res.msg,
  };
}
