export const url = '/canyin/pos/settlement/pay/twitterlifepayway/cancel';
export function trans(data) {
  return data.success ? {
    success: true,
    data: {},
  } : {
    success: false,
    data: {},
  };
}
