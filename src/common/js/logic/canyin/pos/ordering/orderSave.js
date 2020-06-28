// 保存点餐单
export const url = '/canyin/pos/addorder/addscorder'
export function trans(data) {
  return (data.code === '1') ? {
    success: true,
    data: data,
  } : {
    success: false,
    errCode: data.errCode ? data.errCode : 1,
    msg: data.msg ? data.msg : data.data.msg
  }
}


