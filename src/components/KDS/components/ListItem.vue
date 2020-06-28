<script>
import { mapState } from 'vuex';
import { SERVE } from '../../../store/order/orderConfig';

export default {
  render() {
    return null;
  },
  data() {
    return {
      warnTimer: null,
      timeoutTimer: null,
      hastenFlg: null,
    };
  },
  props: {
    now: {
      type: Number,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState('order', ['currentMode', 'remindConfig']),
    isHasten() {
      return this.data.hastenFlg > 0 && !this.isDone;
    },
    isDone() {
      return this.currentMode.dishesIsDone(this.data);
    },
    isOverWarnTime() {
      if (this.isDone) return false;
      const calledTime = this.now - this.data.callUpTimeTimeStamp;
      return !!this.data.warnTime
        && (
          calledTime > this.data.warnTime * 60 * 1000
          && (
            this.data.standardTime
              ? calledTime <= this.data.standardTime * 60 * 1000
              : true
          )
        );
    },
    isOverStandardTime() {
      if (this.isDone) return false;
      const calledTime = this.now - this.data.callUpTimeTimeStamp;
      return !!this.data.standardTime && calledTime > this.data.standardTime * 60 * 1000;
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
    isOverWarnTime: {
      handler(value) {
        if (
          this.remindConfig.timeout.enable
          && !this.isDone
          && value
          && !this.isHasten
          && !this.isOverStandardTime
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
    isOverStandardTime: {
      handler(value) {
        if (
          this.remindConfig.timeout.enable
          && !this.isDone
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
          && !this.isDone
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
    isDone(value) {
      if (value) {
        if (
          this.currentMode.currentState === SERVE
          && this.remindConfig.serveDone
        ) {
          this.$vemit('dishCalling', this.data, 3);
        }
        this.deleteHandler();
      }
    },
  },
  destroyed() {
    this.deleteHandler();
  },
};
</script>
