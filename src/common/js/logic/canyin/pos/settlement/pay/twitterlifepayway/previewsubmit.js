export const url = '/canyin/pos/settlement/pay/twitterlifepayway/previewsubmit';
export function trans(data) {
  return +data.code === 0 ? {
    success: true,
    data: data.data
  } : {
    success: false,
    errCode: data.code,
    msg: data.message,
  }
}
