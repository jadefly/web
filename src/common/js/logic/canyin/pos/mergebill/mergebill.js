export const url = '/canyin/pos/mergebill/mergebillv2';

export function trans(data) {
  return (data.code === '1' && data.data && data.data.result === 1) ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode ? data.errCode : data.data.result,
    msg: data.msg ? data.msg : data.data.msg,
  };
}
