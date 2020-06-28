export const url = '/canyin/pos/businessreport/b07abandonedreport'; // 废单报表-庆丰包子

export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    msg: data.msg,
  };
}
