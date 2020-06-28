<template>
  <div class="daily-settlement-wrapper">
    <div class="pic">
      <img src="@static/img/settlement-daily.png" :alt="$t('Dict.DailyKnots')">
      <div class="text">
        <h3>{{$t('Dict.DailyKnots')}}</h3>
        <p>{{$t('Biz.UserDesktop.UserDesktopMsg024')}}</p>
        <p>{{$t('Biz.UserDesktop.UserDesktopMsg025')}}</p>
      </div>
    </div>
    <button type="button" class="btn" @click="settleDaily">{{$t('Biz.UserDesktop.GoDailyKnots')}}
    </button>
    <DailySettlementDialog ref="dailySettlementDialog"></DailySettlementDialog>
  </div>
</template>

<script>
import DailySettlementDialog from './DailySettlementDialog';

export default {
  name: 'DailySettlementModule',
  components: { DailySettlementDialog },
  methods: {
    settleDaily() {
      this.$refs.dailySettlementDialog.open();
    },
  },
};
</script>

<style lang="less" scoped>
.daily-settlement-wrapper {
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
    width: 330px;

    h3 {
      line-height: 50px;
      font-size: 24px;
      font-weight: bold;
      color: #634ccf;
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
}
</style>
