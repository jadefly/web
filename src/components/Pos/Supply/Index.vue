<template>
  <div id="supply">f6</div>
</template>

<script>

export default {
  created() {

  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.$hotKey.set('Pos.Supply', true);
    });
  },
};
</script>
