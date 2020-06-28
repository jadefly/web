export const url = '/canyin/pos/teamlog/shifttsinfov2';
export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: data.data.data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
