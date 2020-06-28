<template>
  <div class="kds-page">
    <Header class="header"></Header>
    <MainView class="content"></MainView>
    <Footer class="footer"></Footer>
  </div>
</template>

<script>
import Header from './Header';
import MainView from './MainView';
import Footer from './Footer';

export default {
  components: {
    Header,
    MainView,
    Footer,
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";

  .kds-page {
    position: relative;
    height: 100%;
    padding-top: @kds-main-header-height;
    padding-bottom: @kds-main-footer-height;
  }

  .header,
  .footer {
    position: absolute;
    left: 0;
    width: 100%;
    background-color: #313341;
  }

  .header {
    top: 0;
    height: @kds-main-header-height;
  }

  .content {
    height: 100%;
  }

  .footer {
    bottom: 0;
    height: @kds-main-footer-height;
  }
</style>
