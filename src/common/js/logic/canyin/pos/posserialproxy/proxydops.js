export const url = '/canyin/pos/posserialproxy/proxydops';

export function trans(data) {
  return (data.code === '1' && data.data) ? {
    success: true,
    data: data.data,
    msg: data.data.msg,
  } : {
    success: false,
    msg: data.msg,
    errCode: data.errCode ? data.errCode : data.result,
  };
}
