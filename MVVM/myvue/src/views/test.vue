<template>
<div class="testPage">
  <ul class="box">
    <li>等高等高等高等高等高等高等高等高ddddddddddddd等高</li>
    <li>等高盒子</li>
    <li>等高test</li>
    <li>等高test</li>
  </ul>


</div>
</template>
<script>
export default {
  
}

// 思路：将要改变this指向的方法挂到目标this上执行并返回
Function.prototype.mycall = function (context) {
  if (typeof this !== 'function') {
    throw new TypeError('not funciton')
  }
  context = context || window
  context.fn = this
  let arg = [...arguments].slice(1)
  let result = context.fn(...arg)
  delete context.fn
  return result
}
function fn(){
  console.log(arguments);
}
fn(3,3)
</script>
<style scoped>
ul,li{ list-style:none;}
.box{
  display: flex; /* 水平排列*/
  background: #f1f1f1;
  width: 100%;
}
.box li{
  border: 1px solid #999;
  display:flex;  /* 相当于嵌套了一层 做居中使用*/
  align-items:center;/*垂直居中*/
  justify-content: center;/*水平居中*/
  width: 25%;
}
</style>

