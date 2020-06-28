export const url = '/canyin/kitchen/kitchenhis/updatewhencancelwholeservebykckscids';
export function trans(data) {
  return data.success ? {
    success: true,
    data: true,
  } : {
    success: false,
    errCode: 1,
    msg: data.msg,
  };
}
