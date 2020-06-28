export const url = '/canyin/pos/settlement/pay/glorybutlerpayway/altermember';

export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: JSON.parse(data.data),
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
