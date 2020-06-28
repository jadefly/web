export const url = '/canyin/kitchen/kitchenhis/updatewhencancelwholeserve';
export function trans(data) {
  return data.success === true ? {
    success: true,
    data: {},
  } : {
    success: false,
    errCode: 1,
    msg: data.msg,
  };
}
