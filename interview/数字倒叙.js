//数字倒叙，不使用类型转换（消耗性能），利于性能的提高
function reverceNum(n){
	let newN = 0;
	let len = 0
	
	while(n!=0){
		let ge = n%10; //个位数
		n = parseInt(n/10); 
		newN = newN*10 + ge; //逆转得到新数字
		len++; //记录长度
	}
	return newN;	
}

console.log(reverceNum(12383))