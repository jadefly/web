export const url = '/canyin/pos/settlement/pay/twitterlifepayway/getuseraccount';
export function trans(data) {
  if (+data.code === 0) {
    return {
      success: true,
      data: data.data
    }
  }
  return {
    success: false,
    errCode: data.code,
    msg: data.message,
  }
}
