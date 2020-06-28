<template>
  <div class="pos-order-btns">
    <ul class="pos-order-btns-list" id="posOrderingBtns">
      <li v-for="(item,index) of addMenuBtnsTest" :key="index">
        <button
          :id="!item.name ? 'GiveStateBtn':item.name + 'Btn'"
          type="button"
          @click="clickHandler(item.name ? item.name : checkGiveState)"
          :disabled="!item.disabled"
        >
          {{item.text}}
          <span class="hotKeyTip" v-show="item.hotKey">{{item.hotKetTip !== undefined ? item.hotKetTip:`(${item.hotKey})`}}</span>
        </button>
      </li>
    </ul>
  </div>
</template>
<script>

export default {
  data() {
    return {
      activeItem: null,
    };
  },
  props: {
    checkGiveState: String,
    addMenuBtnsTest: Array,
  },
  methods: {
    clickHandler(method) {
      this.$emit('control', method);
    },
    setActiveItem(item) {
      this.activeItem = item || null;
    },
  },
};

</script>
<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
@import "~@/components/Pos/Order/Bill/btns.less";

.pos-order-btns-list .scaleFontSize {
  font-size: 22px;
}
.lang-enUS {
  .pos-order-btns {
    right: -24px;
    width: 84px;
    .pos-order-btns-list {
      > li {
        > button {
          font-size: 12px;
        }
      }
    }
  }
}
</style>
