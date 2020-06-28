export const url = '/canyin/pos/bill/resettlereasonviewv2'// 返位结算原因
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
