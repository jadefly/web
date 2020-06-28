export const url = '/canyin/pos/gbticketbill/showticketlistv2'// 显示团购券列表
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
