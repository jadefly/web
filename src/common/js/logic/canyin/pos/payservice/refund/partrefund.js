export const url = '/canyin/pos/payservice/refund/partrefund';
export function trans(data) {
  return data.result === 1 ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
