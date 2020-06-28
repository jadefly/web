export const url = '/platform/login/login/logoutv2';
export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: {
      success: true,
    },
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
