<template>
  <ul class="pos-menu-btns">
    <li v-for="(btn,index) in btns" :key="index" >
      <button type="button" :class="{active:btn == activeNum}" @click="addNum(btn)">{{btn}}</button>
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    isClearActive:{
      type: Boolean,
      default: false,
    }
  },
  data () {
    return {
      btns: [0,1,2,3,4,5,6,7,8,9,'←'],
      activeNum :null,
    }
  },
  methods: {
    addNum(num) {
      this.activeNum = num;
      this.$emit('changeAddNum', num);
    }
  },
  watch: {
    'isClearActive'(val) {
      val && (this.activeNum = null);
    },
  },

}
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

@pos-order-menu-btns-space: 1px;
@pos-order-menu-btns-text-shadow: 1px 1px 1px #091346;
@pos-order-menu-btns-item-bg: @pos-btn-bg-dark;

.pos-menu-btns {
  position: absolute;
  top: @pos-order-menu-filter-height;
  left: 0;
  .size(100%, @pos-order-menu-btns-height);

  > li {
    float: left;
    .size(9.09%, @pos-order-menu-btns-height);
    padding-right: @pos-order-menu-btns-space;

    > button {
      display: block;
      .square(100%);
      border: none;
      color: #273844;
      background-color: @pos-order-menu-btns-item-bg;
      &.active {
        background-color: rgba(255, 255, 255, 0.1)
      }
    }

    &:last-child {
      padding-right: 0;
      font-size: 28px;
    }
  }

}
</style>
