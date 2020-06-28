export const url = '/canyin/pos/tourguidescommission/tourguidescommissionviewv2';
export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data,
  } : {
    success: false,
    errCode: data.errCode ? data.errCode : data.result,
    msg: data.msg ? data.msg : data.data.msg,
  };
}
