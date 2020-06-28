
export const url = '/canyin/pos/reception/receptionbusiness/closesettlementwin';
export function trans(data) {
  return data ? {
    success: true,
    data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
