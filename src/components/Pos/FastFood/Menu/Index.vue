<template>
  <div class="pos-order-menu" :class="isOneRowPayBtn?'pos-order-menu-oneRow':''">
    <div :class="{'list-mask-layer':isMask}"></div>
    <List ref="list" @designates="designates" :guestList="guestList" :areaType ="areaType"></List>
    <FastPanel @packingBoxFn="packingBoxFn" @maskLayer="maskLayer" class="fast-panel" ref="payAndDiscount" @operation="operation" @otherOperation="otherOperation"></FastPanel>
  </div>
</template>

<script>
import List from './List';
import FastPanel from './FastPanel';
import { mapGetters, mapState } from 'vuex';
export default {
  props: {
    guestList: {
      type: Array,
      default() {
        return [];
      },
    },
    areaType: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      isMask:false
    }
  },
  components: { List, FastPanel },
  computed: {
    ...mapGetters(['posBaseInfo', 'posSettings']),
    ...mapState('fastFood', [
    ]),
    isOneRowPayBtn() { // 快捷支付按钮单行显示
      return this.posSettings.isShortcutBarSingleLineDisplayForFastFoodMode;
    },
  },
  mounted() {
    this.$von("maskLayerFucBus",(val)=>{
      this.maskLayer(val)
    })
  },
  methods: {
    packingBoxFn(item){
      this.$refs.list.packingBoxFn(item)
    },
    clearAddBeforeNum() {
      this.$refs.list.clearAddBeforeNum();
    },
    operation(action) {
      this.$emit('operation', action);
    },
    otherOperation(action) {
      this.$emit('otherOperation', action);
    },
    // 是否显示遮罩层
    maskLayer(val) {
      this.isMask = val;
    },
    //执行挂单
    designates(callBack) {
      this.$refs.payAndDiscount.designates(callBack)
    }
  }
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
  .fast-panel{
    position: absolute;
    bottom: 0;
    width: 100%;
  }
}
.list-mask-layer{
    position: absolute;
    height: 98%;
    background-color: #b1d0d7;
    width: 100%;
    opacity: 0.5;
    z-index: 100;
  }
</style>
