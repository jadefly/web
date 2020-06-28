export const url = '/canyin/pos/presentitem/presentitemv2'; // 赠单弹框的确认接口

export function trans(data) {
  return (data.code === '1' && data.data && data.data.result === 1) ? {
    success: true,
    data: {
      success: data.data,
    },
  } : {
    success: false,
    errCode: data.errCode ? data.errCode : data.data.result,
    msg: data.msg ? data.msg : data.data.msg,
  };
}
