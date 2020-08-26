<template>
  <div class="home">
    22222
    <button @click="toPage1">返回</button>
  </div>
</template>

<script>
  export default {
    components: {
    },
    data() {
      return {
      }
    },
    mounted() {
      console.log(222)
      history.pushState(null, null, document.URL);
      window.addEventListener('popstate', function () {
        history.pushState(null, null, document.URL);
      })
    },
    methods:{
      toPage1(){
        this.$router.replace('/t1');
        this.$router.go(1)
      }
    }
  }
</script>