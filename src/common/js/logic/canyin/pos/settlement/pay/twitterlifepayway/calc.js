export const url = '/canyin/pos/settlement/pay/twitterlifepayway/calc';
export function trans(data) {
  return data.success ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.code,
    msg: data.message,
  };
}
