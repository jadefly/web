import { extend } from 'lodash'
export const url = '/canyin/pos/bill/updateitemtempv2'// 提交临时品项
export function trans(data) {
  if (data.data) {
    let itData = data.data.itData
    let price = itData.stdPrice
    let itemType = 2 // 临时品项类型为2
    extend(itData, { price, itemType })
  }
  return data.code === '1' ? {
    success: true,
    data: data.data
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg
  }
}
