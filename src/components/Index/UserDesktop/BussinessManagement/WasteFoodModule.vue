<template>
  <SystemContent>
    <div class="pic">
      <img src="@static/img/waste-food.png" :alt="$t('Biz.UserDesktop.StatisticsOfWasteVegetables')">
      <div class="text">
        <h3>{{$t('Biz.UserDesktop.StatisticsOfWasteVegetables')}}</h3>
        <p>{{$t('Biz.UserDesktop.UserDesktopMsg028')}}</p>
        <p>{{$t('Biz.UserDesktop.UserDesktopMsg029')}}</p>
        <p>{{$t('Biz.UserDesktop.UserDesktopMsg030')}}</p>
      </div>
    </div>
    <button type="button" class="btn" @click="openDiscardDishRecord">{{$t('Biz.UserDesktop.UserDesktopMsg031')}}
    </button>
    <DiscardDishRecord ref="discardDishRecord"></DiscardDishRecord>
  </SystemContent>
</template>

<script>
  import SystemContent from '../base/SystemContent';
  // 废菜统计
const DiscardDishRecord = (resolve) => {
  import('@/components/Pos/More/DiscardDishRecord.vue').then((module) => {
    resolve(module);
  });
};

export default {
  components: {
    SystemContent,
    DiscardDishRecord,
  },
  methods: {
    openDiscardDishRecord() {
      this.$refs.discardDishRecord.open();
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
  right: 90px;
  top: 75px;
  width: 260px;

  h3 {
    line-height: 50px;
    font-size: 24px;
    font-weight: bold;
    color: #574841;
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
