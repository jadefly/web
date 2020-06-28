export const url = '/canyin/pos/designatesreturnpoint/returnpointandsettle';

export function trans(data) {
  return data ? {
    success: true,
    data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
