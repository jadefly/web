<template>
  <div class="footer">
    <div class="info">
      <i class="icon icon-user"></i>
      <div class="user">{{ userName }}</div>
      <div class="time">{{ time | dateFormat }}</div>
    </div>
    <div class="status">
      <div ref="statusCircle" :class="status"></div>
      <div class="status-text">信息推送状态</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import dateFormatMixin from '@/common/js/dateFormatMixin';

export default {
  mixins: [dateFormatMixin],
  computed: {
    ...mapGetters('KDS', ['userName']),
  },
  data() {
    return {
      status: 'status-circle-close',
      time: new Date(),
    };
  },
  mounted() {
    setInterval(() => {
      this.time = new Date();
    }, 1000);
    // 改变推送状态
    this.$von('changeStatus', (str) => {
      switch (str) {
        case 'connect':
        case 'open':
        case 'close':
        case 'error':
          this.status = `status-circle-${str}`;
          break;
        case 'message':
          this.status = `status-circle-${str}`;
          setTimeout(() => {
            this.status = 'status-circle-open';
          }, 1000);
          break;
        default:
          this.status = 'status-circle-close';
          break;
      }
    });
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
    .status{
      display: flex;
      align-items: center;
      justify-content: space-between;
      .status-circle{
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 7px;
      }
      .status-circle-close{
        .status-circle;
        background: #9c9c9c;
      }
      .status-circle-open{
        .status-circle;
        background: #09aa91;
      }
      .status-circle-connect{
        .status-circle;
        background: #e1be19;
      }
      .status-circle-error{
        .status-circle;
        background: #f56355;
      }
      .status-circle-message{
        .status-circle;
        background: #428bcb;
      }
      .status-text{
        .common-text;
      }
    }
  }
</style>
