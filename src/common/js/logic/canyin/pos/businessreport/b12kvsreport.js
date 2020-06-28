export const url = '/canyin/pos/businessreport/b12kvsreport' // 备餐报表
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
