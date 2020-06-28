export const url = '/canyin/pos/teammangergroup/groupteamv2';
export function trans(data) {
  return data.code === '1' && data.data.success ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg ? data.msg : data.data.msg,
  };
}
