const deepClone = (value,hash=new WeakMap) => {
  if (value == null) return value;
  if (typeof value !== "object") return value;
  if (value instanceof RegExp) return new RegExp(value);
  if (value instanceof Date) return new Date(value);

  //clone的如果是数组或是对象 （循环） for in
  let instance = new value.constructor(); //根据当前的属性构造一个新的实例
  // console.log(instance);
  console.log(hash)
  if(hash.has(value)){
    return hash.get(value);
  }
  hash.set(value,instance); //没放过就放进去
  
  for(let key in value){
    if(value.hasOwnProperty(key)){//过滤掉原型链上的属性
      instance[key] = deepClone(value[key],hash); //递归
      // instance[key] = value[key];
    }
  }
  return instance;
};

// let arr = [1, 2, 3,[4,5,6,[11]]];
// let newArr = deepClone(arr);  
// newArr[3][1] = 100;
// console.log(newArr);
let obj = {a:1,b:{c:3}};
obj.e = 2;
let newObj = deepClone(obj)
newObj.c = 100;
console.log(obj,newObj);
