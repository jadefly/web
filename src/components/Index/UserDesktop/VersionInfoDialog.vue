<template>
  <Dialog
    name="PosDialog.About"
    :title="$t('Biz.UserDesktop.VersionInfoTitle1')"
    ref="dialog"
    width="500px"
    height="290px"
  >
    <div class="about-wrapper">
      <header class="title">
        <h1>{{$t('Biz.UserDesktop.VersionInfoH1')}}</h1>
      </header>
      <main class="main">
        <div class="line">
          <span>{{$t('Biz.UserDesktop.VersionInfoSpan1')}}</span>
          <span>{{ versionInfo.version }}</span>
          <span class="name">{{ versionInfo.versionTypeName }}</span>
        </div>
        <div class="line">
          <span>{{$t('Biz.UserDesktop.VersionInfoSpan2')}}</span>
          <span>{{ versionInfo.dbVersion }}</span>
        </div>
        <div class="line">
          <span>{{$t('Biz.UserDesktop.VersionInfoSpan3')}}</span>
          <span>{{ versionInfo.releaseDate }}</span>
        </div>
        <div class="logo">
          <img src="~@/common/images/pos/main/btcsllogo.png">
        </div>
      </main>
    </div>
  </Dialog>
</template>

<script>
import Dialog from "@/components/Pos/Common/Dialog";
import DialogMixin from "@/components/Pos/Common/DialogMixin";

export default {
  props: {
    versionInfo: {
      type: Object,
      default: () => {},
    }
  },
  components: { Dialog },
  mixins: [DialogMixin],
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.about-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: white;
  padding: 32px 180px 32px 32px;
  overflow: hidden;
  .title > h1 {
    font-weight: bold;
    font-size: 18px;
    line-height: 2;
  }
  .main {
    color: #333;
    .line {
      padding: 4px 8px;
      .name {
        padding-left: 24px;
      }
    }
   .logo {
      position: absolute;
      top: 32px;
      right: 48px;
      > img {
        width: 120px;
        height: 120px;
      }
    }
  }

}
</style>

