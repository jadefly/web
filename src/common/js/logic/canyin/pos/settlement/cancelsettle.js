export const url = '/canyin/pos/settlement/cancelsettle';
export function trans(data) {
  return data.success ? {
    success: true,
    data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
