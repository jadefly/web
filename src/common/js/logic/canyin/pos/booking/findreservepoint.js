export const url = '/canyin/pos/reservebill/findreservepointv2';
export function trans(res) {
  return res.code === '1' ? {
    success: true,
    data: res.data,
  } : {
    success: false,
    msg: res.msg,
    errCode: res.errCode,
  };
}
