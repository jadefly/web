export const url = '/canyin/kitchen/kitchencookmode/updatewhendoreadytocookorder';

export function trans(data) {
  return data.success === true ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: 1,
    msg: data.msg,
  };
}
