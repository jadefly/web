export const url = '/canyin/desktop/bizsyssetting/saveenablepaymentcodedirect';
export function trans(data) {
  return (data.code === '1') ? {
    success: true,
    data: {},
  } : {
    success: false,
    errCode: data.errCode ? data.errCode : 0,
    msg: data.msg,
  };
}
