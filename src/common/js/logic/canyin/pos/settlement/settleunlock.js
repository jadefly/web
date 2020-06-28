export const url = '/canyin/pos/settlement/settleunlock';
export function trans(data) {
  return data.result === 1 && data.data ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.result,
    msg: data.msg,
  };
}
