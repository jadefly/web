export const url = '/canyin/pos/settlement/enforcesettlelockv2'
export function trans(data) {
  return data ? {
    success: true,
    data: data.data
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg
  }
}
