export const url = '/canyin/pos/abandonitem/abandonitem';

export function trans(data) {
  return (data.code === '1') ? {
    success: true,
    data,
  } : {
    success: false,
    errCode: data.errCode ? data.errCode : data.data.result,
    msg: data.data.msg,
  };
}
