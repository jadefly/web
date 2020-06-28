export const url = '/canyin/pos/gbticketbill/unsettlev2'; // 撤销美团代金券

export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
