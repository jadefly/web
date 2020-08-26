function addZero(n) {
  if (n < 10) return '0' + n
  return n
}
/**
 * date 时间戳
 * fmt为时间格式, 默认为yyyy-MM-dd
 */
function formatDate (date, fmt) { 
  if (!date) return ''
  fmt = fmt || 'yyyy-MM-dd'
  date = new Date(date)
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + ''
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : addZero(str))
    }
  }
  return fmt
}

export default {
  formatDate
}
