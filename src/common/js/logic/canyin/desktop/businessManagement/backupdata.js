export const url = '/canyin/kitchen/kitchenbackup/backupdata';
export function trans(data) {
  return (data.success === true) ? {
    success: true,
    data,
  } : {
    success: false,
    errCode: data.error_code,
    msg: data.msg,
  };
}
