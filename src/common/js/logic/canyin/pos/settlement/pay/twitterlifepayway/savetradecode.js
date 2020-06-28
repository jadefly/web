export const url = '/canyin/pos/settlement/pay/twitterlifepayway/savetradecode'; // 微生活验证短信或密码
export function trans(data) {
  return data.success ? {
    success: true,
    data: { success: true },
  } : {
    success: true,
    data: {
      success: false,
      msg: data.msg,
    },
  }
}
