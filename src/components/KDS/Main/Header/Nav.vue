<template>
  <ul class="kds-nav">
    <router-link
      class="my-btn"
      :to="{ name: 'kds.main.dishes', query: $route.query }"
      tag="li"
    >按菜品(F1)</router-link>
    <router-link
      class="my-btn"
      :to="{ name: 'kds.main.tables', query: $route.query }"
      tag="li"
    >按客位/牌号(F2)</router-link>
  </ul>
</template>

<script>
export default {
  name: 'Nav',
  data() {
    return {
      active: '1',
    };
  },
  created() {
    // 快捷键切换类型
    this.$vonce('kdsSwitchType', (key) => {
      const name = key === 'F1' ? 'kds.main.dishes' : 'kds.main.tables';
      this.$router.push({ name, query: this.$route.query });
    });
  },
};
</script>

<style lang="less" scoped>
  .kds-nav {
    display: flex;
    align-items: center;
    margin-left: 50px;
    > li {
      display: flex;
      align-items: center;
      text-align: center;
      margin-left: 20px;
      height: 40px;
      color: #C3C5D2;
    }
    .my-btn {
      font-weight: 400;
      text-align: center;
      white-space: nowrap;
      vertical-align: middle;
      touch-action: manipulation;
      cursor: pointer;
      background-image: none;
      border: 1px solid transparent;
      padding: 6px 12px;
      font-size: 14px;
      border-radius: 20px;
    }
    .router-link-active {
      font-size: 16px;
      font-weight: bold;
      color: #ffffff;
      background-color: #749ddc;
    }
  }
</style>
