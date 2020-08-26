let obj = {
	one: { name: 'one'},
	a:{
		name:'zhang',
		age:10
	},
	b:{
		c:100
	}
}
let {one, ...newObj} = obj; //
obj.a.name = 'zhao';
// console.log(obj)
// console.log(newObj)


// 正则 -- 命名捕获 --- 模式的头部添加“问号 + 尖括号 + 组名”
let reg = /(\d{4})-(\d{2})-(\d{2})/;
let regNew = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
let str = '2019-12-06'
let result = reg.exec(str);
console.log(result)

// 想提取下列对象obj中所有value大于21的键值对，如何操作呢??
const object = { x: 23, y:24,z:15 };
let oEntries = Object.entries(object) //对象转为键值对  
//oEntries --> [ [ 'x', 23 ], [ 'y', 24 ], [ 'z', 15 ] ]
let res = oEntries.filter(([key,value])=>{
  return value>20;
})
let newRes = Object.fromEntries(res); //键值对 转为 对象
// let newRes = {}
// for(let [key,value] of res){
//   newRes[key] = value;
// }
console.log(newRes)

//简写
let r = Object.fromEntries(Object.entries(object).filter(([key,val])=>val>20));
console.log(r)


let flag = /foo.f*/s.test('foo\nfa')
console.log(333,flag)
