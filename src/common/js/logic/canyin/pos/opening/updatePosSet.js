export const url = '/canyin/pos/opening/updatepossetv2';

export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: {
      success: data.data.success,
    },
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
