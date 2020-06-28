<template>
  <div class="kds-header">
    <Logo class="logo"></Logo>
    <Nav class="nav"></Nav>
    <AuthCardInfo class="authCardInfo"></AuthCardInfo>
    <Control ref="control" class="control"></Control>
  </div>
</template>

<script>
import Logo from './Logo';
import Nav from './Nav';
import Control from './Control';
import AuthCardInfo from './AuthCardInfo';

export default {
  components: {
    Logo,
    Nav,
    Control,
    AuthCardInfo,
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.kds-header {
  padding: 10px;
}

.logo {
  float: left;
  height: 100%;
}

.nav {
  float: left;
  height: 100%;
}

.authCardInfo {
  float: left;
  height: 100%;
}

.control {
  float: right;
  height: 100%;
}
</style>
