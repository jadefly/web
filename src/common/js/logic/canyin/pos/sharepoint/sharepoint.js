export const url = '/canyin/pos/sharepoint/sharepoint';
export function trans(data) {
  return data.success === true && data.data ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg ? data.msg : data.data.msg,
  };
}
