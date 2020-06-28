export const url = '/canyin/pos/settlement/pay/crmpayway/registermember';

export function trans(data) {
  return data.success ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
