<template>
  <div class="seafood-header">
    <div class="seafood-logo">
      <img src="../images/logo.png" alt="">
      <span class="title">海鲜称重</span>
    </div>
    <div class="seafood-control">
      <div class="more-option" @click="refresh"><i class="icon icon-refresh"></i>刷新</div>
      <div class="more-option" @click="logout"><i class="icon icon-shutdown"></i>注销</div>
    </div>
  </div>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: 'Header',
  computed:{
    ...mapGetters('KDS', ['apiPath']),
  },
  methods:{
    // 刷新
    refresh() {
      window.location.reload();
    },
    // 注销
    logout() {
      window.location = `${this.apiPath}/platform/login/login/logout`;
    },
  }
};
</script>

<style lang="less" scoped>
  .seafood-header{
    padding: 0 10px;
    .seafood-logo {
      height: 100%;
      display: flex;
      align-items: center;
      > img {
        margin-right: 10px;
        width: 30px;
        height: 30px;
      }
      .title {
        font-size: 16px;
        font-weight: bold;
        color: white;
      }
    }
    .seafood-control{
      position: absolute;
      right: 10px;
      top: 15px;
      color: #ffffff;
      font-size: 16px;
      i{
        margin-right: 6px;
        vertical-align:middle
      }
      >div{
        display: inline-block;
        vertical-align:middle;
        margin-right: 10px;
        cursor: pointer;
      }
    }
  }
</style>
