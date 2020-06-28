<template>
  <SystemContent>
    <div class="pic">
        <img src="@static/img/manager-log.png" :alt="$t('Biz.UserDesktop.ManagerDiary')">
      <div class="text">
          <h3>{{$t('Biz.UserDesktop.ManagerDiary')}}</h3>
          <p>{{$t('Biz.UserDesktop.UserDesktopMsg026')}}</p>
          <p>{{$t('Biz.UserDesktop.UserDesktopMsg027')}}</p>
      </div>
    </div>
      <button type="button" class="btn" @click="openManagerLog">{{$t('Biz.UserDesktop.StartRecording')}}</button>
    <ManagerLog ref="managerLog" :needToken="false"></ManagerLog>
  </SystemContent>
</template>

<script>
    import SystemContent from '../base/SystemContent';
    // 经理日记
const ManagerLog = (resolve) => {
  import('@/components/Pos/More/ManagerLog.vue').then((module) => {
    resolve(module);
  });
};

export default {
  components: {
    SystemContent,
    ManagerLog,
  },
  methods: {
    openManagerLog() {
      this.$refs.managerLog.open();
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pic {
  position: relative;

  img {
    display: block;
    width: 100%;
  }
}

.text {
  position: absolute;
  left: 90px;
  top: 75px;
  width: 260px;

  h3 {
    line-height: 50px;
    font-size: 24px;
    font-weight: bold;
    color: #057695;
  }

  p {
    line-height: 24px;
  }
}

.btn {
  margin-top: 50px;
  display: block;
  width: 280px;
  height: 40px;
  background-color: #f0b017;
  margin-left: auto;
  margin-right: auto;
  font-size: 15px;
  color: #fff;
}
</style>
