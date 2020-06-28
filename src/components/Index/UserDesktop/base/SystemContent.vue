<template>
  <div class="system-content" :class="{
    'has-head': $slots.head || title,
    'has-foot': $slots.foot
  }">
    <slot name="head" v-if="$slots.head || title">
      <div class="system-content-head">
        <h3 v-html="title"></h3>
      </div>
    </slot>
    <div class="system-content-body" :class="{ 'no-padding': !padding }">
      <slot></slot>
    </div>
    <div class="system-content-foot" v-if="$slots.foot">
      <slot name="foot"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '',
    },
    padding: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

@system-content-head-height: 56px;
@system-content-foot-height: 40px;

.system-content {
  position: relative;
  height: 100%;

  &.has-head {
    padding-top: @system-content-head-height;
  }

  &.has-foot {
    padding-bottom: @system-content-foot-height;
  }
}

.system-content-head {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: @system-content-head-height;
  border-bottom: 1px solid #d9d9d9;

  h3 {
    padding-left: 24px;
    line-height: @system-content-head-height;
    font-size: 18px;
  }
}

.system-content-body {
  height: 100%;
  overflow: auto;
  padding: 15px;

  &.no-padding {
    padding: 0;
  }
}

.system-content-foot {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  padding-left: 10px;
  padding-right: 10px;
  height: @system-content-foot-height;
}
</style>
