export const url = '/canyin/pos/bill/billitemtempviewv2'// 临时品项信息
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
