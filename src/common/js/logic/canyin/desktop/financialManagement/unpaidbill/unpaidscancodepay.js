export const url = '/canyin/desktop/unpaidbill/unpaidscancodepay';
export function trans(data) {
  return (data.result === 1 && data.data) ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
