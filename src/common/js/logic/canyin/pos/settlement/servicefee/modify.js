export const url = '/canyin/pos/settlement/servicefee/modify';
export function trans(data) {
  const errCode = data.result === -2 ? -2 : null;
  return (data && data.result === 1) ? {
    success: true,
    data,
  } : {
    success: false,
    errCode,
    msg: data.msg,
  };
}
