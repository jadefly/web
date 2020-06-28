export const url = '/canyin/pos/settlement/judgeempifhaspaywayopset';
export function trans(data) {
  if (data.code === '1') {
    if (!data.data) {
      return {
        success: true,
        data: data.data,
      };
    }
    return {
      success: false,
      errCode: -2,
      msg: data.data,
    };
  }
  return {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
