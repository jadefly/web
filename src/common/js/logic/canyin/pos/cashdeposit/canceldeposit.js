export const url = '/canyin/pos/canceldeposit/canceldepositv2'
export function trans(data) {
  return data.code == "1"? {
    success: true,
    data: data.data
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg ? data.msg : data.data.msg
  }
}
