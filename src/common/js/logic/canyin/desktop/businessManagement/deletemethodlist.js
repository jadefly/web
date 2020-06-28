export const url = '/canyin/bm/other/tempmethodhis/deletemethodlist';
export function trans(data) {
  return (data.code === '1') ? {
    success: true,
    data,
  } : {
    success: false,
    errCode: data.error_code,
    msg: data.msg,
  };
}
