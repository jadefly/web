export const url = '/canyin/pos/reserveorderbill/doreserveorderauto';

export function trans(data) {
  return data ? {
    success: true,
    data,
  } : {
    success: false,
    data: data.errorMsg,
  };
}
