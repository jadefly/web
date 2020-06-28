export const url = '/canyin/pos/cashbox/cashboxreasonviewv2'
export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: {
      reasonsJson: data.data.reasonsJson
    }
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg
  }
}
