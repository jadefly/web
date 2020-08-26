<template>
    <ul class="myMenu">
        <!-- 默认插槽是没有名字 -->
        <slot name="default"></slot>
    </ul>
</template>
<style scoped>
ul,li{ list-style:none;
    padding: 0;
    margin: 0;
    line-height: 1.5;
}
.myMenu{
    width: 200px;
    background:cadetblue;
}
</style>