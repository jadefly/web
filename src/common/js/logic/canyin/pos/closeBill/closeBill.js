export const url = '/canyin/pos/closebill/closebillv2';
export function trans(data) {
  return data.code === '1' && data.data.success ? {
    success: true,
    data: data.data.data,
  } : {
    success: false,
    // 接口转赋值data.result, 实际输出, 并不是真正的errCode
    errCode: data.data ? data.data : '',
    msg: data.msg ? data.msg : data.data.msg,
    // result: data.result ? data.result : '',
  };
}
