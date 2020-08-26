function strUpperToLine(str){//str 驼峰写法转-
	return str.replace(/[A-Z]+/g,function(match,p1,offset){
    return '-' + match.toLowerCase()
  });
}

function lineToUpper(str){//str -转驼峰写法
	return str.replace(/-(\w)/g,function(match,p1,offset){
    return p1.toUpperCase()
  });
}
console.log(lineToUpper('ad-bodyHead'))


// JS找字符串中出现最多的字符
function getMaxWord(str) {
  // let json = {}; // 每个字符出现的次数
  // for(let i=0; i<str.length; i++) {
  //   let w = str.charAt(i);
  //   json[w] ? json[w]++ : json[w]=1;
  // }
  let json = str.split('').reduce(function(res, cur) {
    res[cur] ? res[cur] ++ : res[cur] = 1
    return res;
  }, {});
  let maxNum = 0;
  let maxWords = []
  for (let key in json) {
    if (json[key]>maxNum) maxNum = json[key];
  }
  // 取最大值的字符串
  for (let key in json) {
    if (json[key] === maxNum) {
      maxWords.push(key);
    }
  }
  return { maxWords, maxNum };
}
let result = getMaxWord('abcab');
console.log('最多的字符串是：', result.maxWords); // [ 'a', 'b' ]
console.log('出现的次数是：', result.maxNum); // 2


/**JS重复输出一个给定的字符串 */
function repeatStringNumTimes(str, times) {
  // return times > 0 ? str.repeat(times) : ""; // es6 方法二
  let res = '';
  while(times>0) {
    res += str;
    times--;
  }
  return res;
}
console.log(repeatStringNumTimes("*", 3)); //应该返回 "***".
console.log(repeatStringNumTimes("abc", 3)) //应该返回 "abcabcabc".

let iterable = new Map([["a", 1], ["b", 2], ["c", 3]]);
for (let entry of iterable) {
  console.log(entry);
}

let iterable = new Set([1, 1, 2, 2, 3, 3]);
for (let value of iterable) {
  console.log(value);
}