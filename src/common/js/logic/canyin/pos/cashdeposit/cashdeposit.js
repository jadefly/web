export const url = '/canyin/pos/cashdeposit/cashdeposit'
export function trans(data) {
  return data.success === true ? {
    success: true,
    data: data.data
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg ? data.msg : data.data.msg
  }
}
