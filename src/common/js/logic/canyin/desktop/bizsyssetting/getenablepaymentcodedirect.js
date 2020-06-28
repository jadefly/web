export const url = '/canyin/desktop/bizsyssetting/getenablepaymentcodedirect';
export function trans(data) {
  return (data.code === '1' && data.data) ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode ? data.errCode : 0,
    msg: data.msg,
  };
}
