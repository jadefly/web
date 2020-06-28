<script>
import { mapGetters } from 'vuex';

export default {
  render() {
    return null;
  },
  data() {
    return {
      warnTimer: null,
      timeoutTimer: null,
      hastenTimer: null,
    };
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters('KDS', ['time', 'remindConfig']),
    isHasten() {
      return this.data.hastenFlg > 0;
    },
    isTimeout() {
      const calledTime = this.time - this.data.callUpTimeTimeStamp;
      return this.data.standardTime && calledTime > this.data.standardTime * 60 * 1000;
    },
    isWarn() {
      const calledTime = this.time - this.data.callUpTimeTimeStamp;
      return !this.isTimeout && this.data.warnTime && calledTime > this.data.warnTime * 60 * 1000;
    },
  },
  methods: {
    deleteHandler() {
      this.$vemit('removeCalling', this.data.scId);
      clearInterval(this.warnTimer);
      clearInterval(this.timeoutTimer);
      clearInterval(this.hastenTimer);
    },
  },
  watch: {
    isWarn: {
      handler(value) {
        if (
          this.remindConfig.timeout.enable
          && value
          && !this.isHasten
          && !this.isTimeout
        ) {
          this.$vemit('dishCalling', this.data, 5);
          if (this.remindConfig.timeout.repeat) {
            this.warnTimer = setInterval(() => {
              this.$vemit('dishCalling', this.data, 5);
            }, this.remindConfig.timeout.cycle * 60 * 1000);
          }
        }
      },
      immediate: true,
    },
    isTimeout: {
      handler(value) {
        if (
          this.remindConfig.timeout.enable
          && value
          && !this.isHasten
        ) {
          this.$vemit('removeCalling', this.data.scId);
          clearInterval(this.warnTimer);
          this.$vemit('dishCalling', this.data, 6);
          if (this.remindConfig.timeout.repeat) {
            this.timeoutTimer = setInterval(() => {
              this.$vemit('dishCalling', this.data, 6);
            }, this.remindConfig.timeout.cycle * 60 * 1000);
          }
        }
      },
      immediate: true,
    },
    'data.hastenFlg': {
      handler(value) {
        if (
          this.remindConfig.hasten.enable
          && value
        ) {
          this.$vemit('removeCalling', this.data.scId);
          clearInterval(this.warnTimer);
          clearInterval(this.timeoutTimer);
          this.$vemit('dishCalling', this.data, 7);
          if (this.remindConfig.hasten.repeat) {
            this.hastenTimer = setInterval(() => {
              this.$vemit('dishCalling', this.data, 7);
            }, this.remindConfig.hasten.cycle * 60 * 1000);
          }
        }
      },
      immediate: true,
    },
  },
  destroyed() {
    this.deleteHandler();
  },
};
</script>
