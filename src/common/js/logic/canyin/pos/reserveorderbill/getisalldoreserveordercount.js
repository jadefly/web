export const url = '/canyin/pos/reserveorderbill/getisalldoreserveordercount'
export function trans(data) {
  return data ? {
    success: true,
    data: data
  } : {
    success: false,
  }
}
