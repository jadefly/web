export const url = '/canyin/pos/reserveorderbill/doreserveorderaddbill'
export function trans(data) {
  return data.result === 1 ? {
    success: true,
    data: data.data
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg
  }
}
