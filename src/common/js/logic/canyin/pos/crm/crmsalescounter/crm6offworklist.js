export const url = '/canyin/pos/crm/crmsalescounter/crm6offworklist'
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
