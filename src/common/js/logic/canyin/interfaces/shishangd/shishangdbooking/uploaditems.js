export const url = '/canyin/interfaces/shishangd/shishangdbookingv2/uploaditems';

export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: data.msg,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
