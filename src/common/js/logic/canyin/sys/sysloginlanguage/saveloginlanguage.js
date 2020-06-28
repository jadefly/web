export const url = '/canyin/sys/sysloginlanguage/saveloginlanguage';

export function trans(data) {
  return data && data.code === '1' ? {
    success: true,
    data: data.data.code,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
