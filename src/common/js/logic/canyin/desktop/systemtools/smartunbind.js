export const url = '/canyin/desktop/bizmobilesnacklock/unbind';

export function trans(data) {
  return (data.code === '1') ? {
    success: true,
    data: true,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
