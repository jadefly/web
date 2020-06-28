export const url = '/canyin/pos/settlement/electronicinvoiceunauth'; // 可开发票查询

export function trans(data) {
  return data.code == '1' ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
