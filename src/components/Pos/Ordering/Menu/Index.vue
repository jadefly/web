<template>
  <div class="pos-order-menu">
    <List ref="list" :guestList="guestList" :areaType ="areaType"></List>
  </div>
</template>

<script>
import List from './List';

export default {
  props: {
    guestList: {
      type: Array,
      default: [],
    },
    areaType: {
      type: Number,
      default: 0,
    },
  },
  components: { List },
  methods: {
    clearAddBeforeNum() {
      this.$refs.list.clearAddBeforeNum();
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-order-menu {
  position: relative;
  height: 100%;
  padding-left: @pos-order-menu-padding-base-horizontal;
  padding-right: @pos-order-menu-padding-base-horizontal;
  padding-bottom: @pos-order-menu-control-offset-bottom;
}
</style>
