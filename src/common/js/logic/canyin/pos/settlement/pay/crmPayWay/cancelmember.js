export const url = '/canyin/pos/settlement/pay/crmpayway/cancelmember';

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
