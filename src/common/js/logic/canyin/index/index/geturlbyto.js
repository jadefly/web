export const url = '/canyin/index/index/geturlbyto';

export function trans(data) {
  return data.success ? {
    success: true,
    data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
