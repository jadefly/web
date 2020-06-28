export const url = '/canyin/desktop/bizdayaccept/dodailysettleback';
export function trans(data) {
  return (data.code === '1' && data.data) ? {
    success: true,
    data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
