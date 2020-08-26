<template>
  <div class="home">
    111-首页
    <button @click="toPage2">page2</button>
  </div>
</template>

<script>
  export default {
    // name: 'home',
    components: {
    },
    data() {
      return {
      }
    },
    mounted() {
      console.log(111)
    },
    methods: {
      toPage2(){
        this.$router.push('/t2');
      }
    }
  }
</script>