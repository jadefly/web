export const url = '/canyin/desktop/bizbmsallot/update';
export function trans(data) {
  return (data.code === '1') ? {
    success: true,
    data: {
      success: true,
    },
  } : {
    success: false,
    errCode: data.errCode ? data.errCode : 0,
    msg: data.msg,
  };
}