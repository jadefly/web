export const url = '/canyin/takeout/takeoutdistriset/queryaddress';
export function trans(data) {
  return data.code == '1' ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
