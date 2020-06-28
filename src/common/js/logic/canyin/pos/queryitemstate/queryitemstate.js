export const url = '/canyin/pos/queryitemstate/queryitemstateviewv2'

//转为正常时间字符串
function toNormalTimeStr (timeStamp) {
  const date = new Date(Number(timeStamp))
  let year = date.getFullYear();
  let month = addZero(date.getMonth()+1);
  let day = addZero(date.getDate());
  let hour = addZero(date.getHours());
  let min = addZero(date.getMinutes());
  let second = addZero(date.getSeconds());
  return `${year}-${month}-${day} ${hour}:${min}:${second}`
}

// 数字不足两位，在前面补0
function addZero(num){
  let str = `${num}`;
  if (str.length === 1) return `0${str}`
  return str
}

export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: {
      bizScDataList: data.data.bizScDataList.map((item) => {
        item.createTimeStr = toNormalTimeStr(item.createTimeForTimeStamp)
        return item
      })
    }
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg
  }
}
