//返回字符串中每个字符出现的个数
function calNum(str){
	let arr = str.split('');
	let r={};
	arr.forEach(item=>{
		r[item] ? r[item]++ : r[item]=1;
	});
	return r;
}
function getMax(str){
	let obj = calNum(str);
	let max=0;
	let maxItem=null;
	for(let [key,value] of Object.entries(obj)){
		if(value>max){
			max = value;
			maxItem = key;
		}
	}
	return maxItem;
}

var str='abcabcaaabbbbbbbbbbb';
console.log(getMax(str))