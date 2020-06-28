function getRegArr(n) {
  return [
    ['[^\\d\\.]+$', ''], // 禁止录入任何非数字和点
    ['\\.(\\d?)\\.+', '.$1'], // 禁止录入两个以上的点
    [`^(\\d+\\.\\d{${n}}).+`, '$1'], // 禁止录入小数点后两位以上
  ];
}
/* 超出小数点n位不允许输入,params:
  val 数值
  n 保留n位小数
*/
const decimal = (val, n = 2) => {
  if (val !== '' && val !== 0) {
    let regArr = getRegArr(n);
    for (let i = 0; i < regArr.length; i++) {
      const reg = new RegExp(regArr[i][0]);
      val = val.replace(reg, regArr[i][1]);
    }
  }
  return val;
};

export {
  decimal, // 非“n位小数的验证或整数的正则验证”禁止录入
};
