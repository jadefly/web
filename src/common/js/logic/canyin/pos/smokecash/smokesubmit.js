export const url = '/canyin/pos/smokecashprocess/smokesubmit';
export function trans(data) {
  return +data.code === 1 ? {
    success: true,
    data: {
      data: data.data,
      msg: data.msg,
    },
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg ? data.msg : data.data.msg,
  };
}
