export const url = '/canyin/pos/settlement/pay/onticktypepayway/insertbybookid'
export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: data.data
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg
  }
}
