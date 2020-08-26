import store from '@/store'
const cloneDeep = (value, hash=new WeakMap) => {
  if (value == null) return value;
  if (typeof value !== 'object') return value;
  if (value instanceof RegExp) return new RegExp(value);
  if (value instanceof Date) return new Date(value);

  // clone的如果是数组或是对象 （循环） for in
  let instance = new value.constructor(); // 根据当前的属性构造一个新的实例
  if (hash.has(value)) {
    return hash.get(value);
  }
  hash.set(value, instance); // 没放过就放进去

  for (let key in value) {
    if (value.hasOwnProperty(key)) { // 过滤掉原型链上的属性
      instance[key] = cloneDeep(value[key], hash); // 递归
    }
  }
  return instance;
}

function isString(val) {
  if (Object.prototype.toString.call(val) === '[object String]') {
    return true
  }
  return false;
}
function isArray(val) {
  if (Object.prototype.toString.call(val) === '[object Array]') {
    return true
  }
  return false;
}
/* 日期时间的格式化 */
function dateFormat(date, fmt) {
  let ret;
  date = new Date(date)
  const opt = {
    'y+': date.getFullYear().toString(),        // 年
    'm+': (date.getMonth() + 1).toString(),     // 月
    'd+': date.getDate().toString(),            // 日
    'H+': date.getHours().toString(),           // 时
    'M+': date.getMinutes().toString(),         // 分
    'S+': date.getSeconds().toString()          // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (let k in opt) {
    ret = new RegExp('(' + k + ')').exec(fmt);
    if (ret) {
      fmt = fmt.replace(ret[1], (ret[1].length === 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, '0')))
    };
  };
  return fmt;
}

// 日期加天数 方法
//   dataStr日期字符串(可以包含时分秒)
//   dayCount 要增加的天数
//   type 返回时间的格式（如：'yy-mm-dd HH:MM:SS'）
//   return 增加n天后的日期字符串
function dateAddDays(dataStr, dayCount, type) {
  var strdate = dataStr; // 日期字符串
  var isdate = new Date(strdate.replace(/-/g, '/'));  // 把日期字符串转换成日期格式
  isdate = new Date((isdate / 1000 + ( 86400 * dayCount)) * 1000);  // 日期加1天
  // var pdate = isdate.getFullYear() + '-' + (isdate.getMonth() + 1) + '-' + (isdate.getDate()) + ' ' + isdate.getHours() + ':' + isdate.getMinutes() + ':' + isdate.getSeconds();   //把日期格式转换成字符串 带时分秒
  
  let result = dateFormat(isdate, type)
  return result;
}

// 当前账户的角色中，是否包含某角色
function isContainRole(role) {
  const arrRoleCode = store.state.userAndRoleInfo.roleCode.split(',');
  for (let i = 0; i < arrRoleCode.length; i++) {
    if (arrRoleCode[i] === role) return true;
    return false;
  }
}
// 是否是自己创建的单子
function isCreateByOwn(createBy) {
  const username = store.state.userAndRoleInfo.username;
  if (username === createBy) return true;
  return false;
}

// export default {
//   install (Vue, options) {
//     Vue.prototype.$cloneDeep = cloneDeep;
//   }
// }
export default {
  cloneDeep,
  isString,
  isArray,
  isContainRole,
  isCreateByOwn,
  dateAddDays
}
