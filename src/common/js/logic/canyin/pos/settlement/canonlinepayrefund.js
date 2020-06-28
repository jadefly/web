export const url = '/canyin/pos/settlement/canonlinepayrefund'; // 是否可以线上部分退
export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: { data },
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
