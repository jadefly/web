export const url = '/canyin/pos/settlement/onlinepayrefundv2'; // 执行线上部分退
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
