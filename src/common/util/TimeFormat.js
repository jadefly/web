// 得到标准时间
function getStanderDate(time) {
  if (!time) {
    return new Date();
  }
  if (typeof (time) === 'string') {
    let strTime = null;
    strTime = time.replace('T', ' ');
    return new Date(strTime);
  }
  return new Date(time);
}

// 数字不足两位，在前面补0
function addZero(num) {
  const str = `${num}`;
  if (str.length === 1) return `0${str}`;
  return str;
}

// 转为正常时间字符串 00:00:00
export function toNormalTimeStr(timeStamp) {
  const date = getStanderDate(timeStamp);
  const hour = addZero(date.getHours());
  const min = addZero(date.getMinutes());
  const second = addZero(date.getSeconds());
  return `${hour}:${min}:${second}`;
}

// 转为正常时间字符串1991-01-01
export function toNormalDateStr(timeStamp) {
  const date = getStanderDate(timeStamp);
  const year = date.getFullYear();
  const month = addZero(date.getMonth() + 1);
  const day = addZero(date.getDate());
  return `${year}-${month}-${day}`;
}
