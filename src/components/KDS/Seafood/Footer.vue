<template>
  <div class="footer">
    <div class="info">
      <i class="icon icon-user"></i>
      <div class="user">{{ userName }}</div>
      <div class="time">{{ time | dateFormat }}</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import dateFormatMixin from '@/common/js/dateFormatMixin';

export default {
  mixins: [dateFormatMixin],
  computed: {
    ...mapGetters('KDS', ['userName', 'time']),
  },
};
</script>

<style lang="less" scoped>
  .footer{
    display: flex;
    height: 30px;
    padding: 0 12px;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    .common-text{
      color: #FFFFFF;
      font-size: 14px;
      font-weight: 400;
      opacity: 0.8;
    }
    .info{
      display: flex;
      align-items: center;
      justify-content: space-around;
      .icon-user{
        font-size: 14px;
        color: #ffffff;
      }
      .user{
        .common-text;
        padding: 0 7px;
      }
      .time{
        .common-text;
      }
    }
  }
</style>
