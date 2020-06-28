export const url = '/canyin/sys/syshabit/updatehabit';
export function trans(data) {
  return data ? {
    success: true,
    data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
