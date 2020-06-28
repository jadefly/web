export const url = '/canyin/pos/billremark/billremarkviewv2'// 账单页面添加备注
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
