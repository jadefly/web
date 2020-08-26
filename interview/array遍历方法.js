/*arr.every(callback);
如果数组中检测到有一个元素不满足，则整个表达式返回 false ，且剩余的元素不会再进行检测。
如果所有元素都满足条件，则返回 true。
若收到一个空数组，此方法在一切情况下都会返回 true。

arr.some(callback(element[, index[, array]])[, thisArg])
数组中有至少一个元素通过回调函数的测试就会返回true；
所有元素都没有通过回调函数的测试返回值才会为false。
如果用一个空数组进行测试，在任何情况下它返回的都是false。
*/

//问： 如何判断两个数组完全相同
function isSame(arr1,arr2){
    if(arr1.length !== arr2.length) return false;
    return arr1.every((item,index)=>{
        console.log(item,index)
        return item==arr2[index];
    })
}

let arr1 = [1,1,4];
let arr2 = [1,2,4];
console.log(isSame(arr1,arr2))

//arr.map() 数组遍历，并返回一个新数组
//forEach() 数组遍历,无返回值
let arr = [10,20,30];
var newArr = arr.map((item,index,array)=> {
    return item*2;
})

console.log(newArr);

console.log(arr.includes(20))

