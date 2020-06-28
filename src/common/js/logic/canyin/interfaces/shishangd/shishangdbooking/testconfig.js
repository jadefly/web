export const url = '/canyin/interfaces/shishangd/shishangdbookingv2/testconfig';

export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: {},
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
