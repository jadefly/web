// 读取点菜单
export const url = '/canyin/pos/bill/pointscorderinfo'
export function trans(data) {
  return `${data.result}` === '1' ? {
    success: true,
    data:{data}
  } : {
    success: false,
    errCode: data.errorCode ? data.errorCode : 0,
    msg: data.msg
  }
}
