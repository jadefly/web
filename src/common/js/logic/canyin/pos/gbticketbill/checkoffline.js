export const url = '/canyin/pos/gbticketbill/checkofflinev2'// 团购离线验券页面
export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: data.data
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg
  }
}
