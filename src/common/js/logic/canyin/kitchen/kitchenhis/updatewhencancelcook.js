export const url = '/canyin/kitchen/kitchenhis/updatewhencancelcook';

export function trans(data) {
  return data.success === true ? {
    success: true,
    data: {
      success: true,
    },
  } : {
    success: false,
    errCode: 1,
    msg: data.msg,
  };
}
