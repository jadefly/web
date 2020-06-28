export const url = '/canyin/pos/settlement/pay/twitterlifepayway/undo'; // 撤销微生活结算方式
export function trans(data) {
  return data.success ? {
    success: true,
  } : {
    success: false,
    data: {
      msg: data.msg,
    },
  }
}
