<template>
    <subMenu>
        <!-- 标题 -->
      <template slot="title">{{data.name}}</template>
     
      <!-- 内容 -->
      <template v-for="menu in data.children">
          <!-- 3） 递归当前自己 -->
          <reSub v-if="menu.children" :key="menu.id" :data="menu"></reSub>
          <menu-item v-else :key="menu.id">{{menu.name}}</menu-item>
      </template>
      
    </subMenu>
</template>

<script>
    import subMenu from '@/components/menu/sub.vue'
    import menuItem from '@/components/menu/menuItem'
    export default{
        name: 'reSub',
        props:{
            data:{
                type: Object,
                default:()=> ({})
            }
        },
        components:{
            subMenu,
            menuItem
        }
    }
</script>