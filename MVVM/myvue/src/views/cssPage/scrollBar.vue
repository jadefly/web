<template>
<div class="content">
  <div class="scrollBox">
    <h1>不可思议的纯 CSS 滚动进度条效果</h1>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
    <p>内容</p>
  </div>
</div>
</template>

<style scoped>
.content {
  background-image: linear-gradient(to right top, #ffcc00 50%, #eee 50%);
  background-size: 100% calc(100% - 100vh + 5px);
  background-repeat: no-repeat;
  
}
.content::after {
    content: "";
    position: fixed;
    top: 5px;
    left: 0;
    bottom: 0;
    right: 0;
    background: #fff;
    /* z-index: -1; */
}
.scrollBox{
  height: 100%;
  width: 100%;
  overflow-y: auto;
  position: relative;
  z-index: 100;
}
</style>