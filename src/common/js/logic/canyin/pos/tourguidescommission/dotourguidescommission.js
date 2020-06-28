export const url = '/canyin/pos/tourguidescommission/dotourguidescommission';
export function trans(data) {
  return data.success ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode ? data.errCode : data.result,
    msg: data.msg,
  };
}
