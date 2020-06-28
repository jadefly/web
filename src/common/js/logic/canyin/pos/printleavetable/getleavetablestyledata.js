export const url = '/canyin/pos/printleavetable/getleavetablestyledatav2'//打印留台单
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
