export const url = '/canyin/desktop/unpaidbill/unpaidscancodecheckandsettle'; // 用户桌面-还挂账-扫码付-手动确认支付接口
export function trans(data) {
  // return (data.code === '1' && data.data) ? {
  return +data.result === 1 ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
