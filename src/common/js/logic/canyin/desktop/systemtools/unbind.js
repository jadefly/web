export const url = '/canyin/bm/pos/poslock/unbindv2';
export function trans(data) {
  return (data.code === '1') ? {
    success: true,
    data: true,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
