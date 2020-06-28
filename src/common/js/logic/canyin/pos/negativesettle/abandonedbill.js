export const url = '/canyin/pos/negativesettle/abandonedbill';

export function trans(data) {
  return data.code === '1' && data.data.result !== -2 ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode ? data.errCode : data.data.result,
    msg: data.msg ? data.msg : data.data.msg,
  };
}
