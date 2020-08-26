<template>
    <li>
        <span @click="change" class="menu_title">
            <slot name="title"></slot>
        </span>
        <ul class="menu_subUl" v-if="isShow">
            <slot></slot>
        </ul>
    </li>
</template>

<script>
    export default{
        data(){
            return{
                isShow: false
            }
        },
        methods:{
            change(){
                this.isShow = !this.isShow;
            }
        }
    }
</script>
<style scoped>
.menu_title{
    font-size:18px;
    cursor: pointer;
    display: block;
}
.menu_title:hover{
    /* color:crimson; */
}
.menu_subUl{
    padding-left: 2em;
}
</style>
