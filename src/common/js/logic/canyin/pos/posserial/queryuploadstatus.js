export const url = '/canyin/pos/posserial/queryuploadstatus';
export function trans(data) {
  return (data.code === '1' && data.data) ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
