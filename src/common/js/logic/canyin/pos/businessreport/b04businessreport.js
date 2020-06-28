export const url = '/canyin/pos/businessreport/b04businessreport'; // 营业报表-庆丰包子

export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    msg: data.msg,
  };
}
