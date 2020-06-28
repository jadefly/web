export const url = '/canyin/pos/returnpointandabandonbill/returnpointandabandonbill';

export function trans(data) {
  return (data.success) ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode ? data.errCode : data.result,
    msg: data.msg ? data.msg : data.data.msg,
  };
}
