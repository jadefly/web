<template>
  <Container>
    <Screen slot="screen" ref="screen"></Screen>
    <DishesView
      class="dishes-dish-view"
      slot="dishView"
      type="dishes"
    ></DishesView>
  </Container>
</template>

<script>
import Container from '../Container';
import Screen from './Screen';
import DishesView from '../DishesView/Index';

export default {
  components: { Container, Screen, DishesView },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.setEvents();
    });
  },
  methods: {
    setEvents() {
      this.$vonce('kdsSearchText', (key, event) => {
        if (event.target.id !== 'kdsDishesViewInput') {
          this.$refs.screen.inputSearchText(key);
        }
      });
    },
  },
};
</script>
