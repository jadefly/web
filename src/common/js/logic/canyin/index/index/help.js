export const url = '/canyin/index/index/help';

export function trans(data) {
  return data.success ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: JSON.parse(data.responseText).msg,
  };
}
