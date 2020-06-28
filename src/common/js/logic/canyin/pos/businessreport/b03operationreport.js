export const url = '/canyin/pos/businessreport/b03operationreportv2'; // 巴庄火锅运营报表
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
