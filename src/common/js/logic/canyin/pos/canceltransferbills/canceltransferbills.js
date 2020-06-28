export const url = '/canyin/pos/canceltransferbills/canceltransferbills';

export function trans(data) {
  return data.result === 1 && data.success ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode ? data.errCode : data.result,
    msg: data.msg ? data.msg : data.data.msg,
  };
}
