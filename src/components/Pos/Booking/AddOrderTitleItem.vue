<template>
  <span class="itemTitle-box">
    <!-- 新建预订单 子项 标题组件 -->
      <i>*</i>
      <em @click.stop="dd">{{ itemTitle }}{{$t("Dict.Colon")}}</em>
  </span>
</template>

<script>
export default {
  props: [
    'itemTitle',
    'cc',
  ],
  methods: {
    dd() {
      if (this.cc) {
        this.cc('123123');
      }
    },
  },
};

</script>

<style lang="less" scoped>
  .itemTitle-box {
    > i {
      margin-right: 2px;
      vertical-align: middle;
      font-style: normal;
      font-weight: bold;
      font-size: 20px;
      color: #f45333;
    }
    > em {
      font-style: normal;
    }
  }
</style>
