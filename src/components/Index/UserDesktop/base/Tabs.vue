<template>
  <div class="system-left-slide">
    <el-tabs v-model="activeModule" tab-position="left" @tab-click="handleClick">
      <el-tab-pane
        v-for="item of tabs"
        :key="item.label"
        :name="item.name"
      >
        <span slot="label">
          <span class="tab-item">{{item.label}}</span>
        </span>
     </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
export default {
  name: 'Tabs',
  props: {
    activeName: {
      type: String,
      default() {
        return '';
      },
    },
    tabs: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      activeModule: this.activeName,
    };
  },
  methods: {
    handleClick() {
      this.$emit('handleClick', this.activeModule);
    },
  },
};
</script>
<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .icon-user{
      vertical-align: top;
    }
  .system-left-slide{
    width: 163px;
    height: 100%;
    float: left;
  }
</style>
<style lang="less">
  .system-left-slide{
    .el-tabs--left .el-tabs__header.is-left{
      float: none;
      margin-right: 1px;
    }
    .el-tabs--left .el-tabs__item.is-left{
      text-align: left;
    }
    .el-tabs__item.is-active{
      color: #3e71f7;
      background: #f2f3f7;
    }
    .el-tabs__item{
      &:hover{
        color: #3e71f7;
      }
    }
    .el-tabs__active-bar{
      background-color: #3e71f7;
    }
  }
</style>
