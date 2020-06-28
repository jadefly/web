export const url = '/canyin/desktop/bizpsreport/psdetail';
export function trans(data) {
  return (data.success) ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
