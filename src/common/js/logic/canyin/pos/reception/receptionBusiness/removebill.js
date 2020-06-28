export const url = '/canyin/pos/reception/receptionbusiness/removebill';

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
