export const url = '/canyin/pos/opening/dobizv2';

export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: data.data.success ? {
      success: true,
      posId: data.data.data.posId,
      posState: data.data.data.posState,
      URL: data.data.data.URL,
    } : {
      success: false,
      message: data.data.msg,
    },
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
