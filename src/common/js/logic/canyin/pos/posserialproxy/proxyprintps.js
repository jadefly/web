export const url = '/canyin/pos/posserialproxy/proxyprintps';
export function trans(data) {
  return (data.code === 1) ? {
    success: true,
    data,
    msg: data.msg,
    errCode: data.errCode,
  } : {
    success: false,
    msg: data.msg,
    errCode: data.errCode ? data.errCode : data.result,
  };
}
