<template>
  <button type="button" class="item" :class="[statusClass]">
    <span class="top-info">
      <span class="code">{{ item.code }}</span>
      <span v-if="item.prepare" class="ready">备</span>
      <span v-if="item.ssType" class="add">加</span>
    </span>
    <span class="mid-info">
      <span v-if="item.pkgFlg">套</span>
      <span>{{ item.name }}<br></span>
    </span>
    <span class="bottom-info">
      <span class="time">{{ formatTime(item.createTimeForTimeStamp) }}</span>
      <span class="people">
        <i class="icon icon-user"></i>
        {{item.peopleQty}}
      </span>
    </span>
    <span
      v-if="item.lastQty + item.coUnknowQty !== 0"
      class="num-info"
    >{{ item.lastQty + item.coUnknowQty }}</span>
  </button>
</template>

<script>
import { mapGetters } from 'vuex';
import { add } from '@/common/js/math';

export default {
  props: {
    item: Object,
    active: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters('KDS', ['config']),
    // 状态样式 （催，超时）
    statusClass() {
      let opt = null;
      let style = '';
      if (this.item.hasten) {
        opt = this.config.stateColorMap['001'];
      } else if (this.item.timeout) {
        opt = this.config.stateColorMap['002'];
      } else if (this.item.warn) {
        opt = this.config.stateColorMap['003'];
      } else if (this.item.prepare) {
        opt = 'prepare';
      } else if (add(this.item.lastQty, this.item.coUnknowQty) === 0) {
        opt = 'no-dishes';
      }
      if (opt) {
        style += opt;
      }
      if (this.item.coUnknowQty > 0 || this.item.hasten) {
        style += ' coUnknowQty'; // 退菜或催菜情况下有闪烁效果
      }
      return style;
    },
  },
  data() {
    return {
      msg: 'hello world',
    };
  },
  methods: {
    formatTime(stamp) {
      if (!stamp) return '';
      const addZero = (str) => {
        if (str.length < 2) {
          return `0${str}`;
        }
        return str;
      };
      const date = new Date(stamp);
      const hour = addZero(date.getHours());
      const min = addZero(date.getMinutes());
      return `${hour}:${min}`;
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/kds-table.less";

.active {
  background-color: #f0f;
}
button {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 64px;
  padding: 0 5px;
  font-size: 14px;
  font-weight: bold;
  color: #394f6f;
  border-radius: 4px;
  background-color: #ffffff;
  &.prepare {
    border: 1px solid #C0C0C0;
    background-color: #CCCCCC;
  }
  &.no-dishes {
    color: #7f93b0;
    background-color: #313341;
    border: #313341 1px solid;
    opacity: 0.5;
    .top-info .code {
      color: #7f93b0;
    }
  }
  .top-info {
    height: 20px;
    .code {
      font-size: 8px;
      color: #666666;
    }
    .ready, .add {
      display: inline-block;
      width: 14px;
      height: 14px;
      text-align: center;
      line-height: 14px;
      font-weight: normal;
      font-size: 11px !important;
      color: #ffffff;
      border-radius: 2px;
    }
    .ready {
      background-color: #FF7800;
    }
    .add {
      background-color: #24AF6E;
    }
  }
  .mid-info {
    width: 100px;
    height: 44px;
    overflow: hidden;
    font-size: 16px;
  }
  .bottom-info {
    display: none;
  }
  .num-info {
    position: absolute;
    min-width: 22px;
    height: 22px;
    border-radius: 12px;
    font-size: 15px;
    color: #ffffff;
    border: 2px solid #ffffff;
    background-color: #415065;
    right: -6px;
    top: -5px;
  }
}
.active {
  color: #ffffff !important;
  border: 1px solid #fcfdff !important;
  background-color: #749ddc !important;
  .top-info {
    .code {
      color: #ffffff !important;
    }
    .add {
      color: #ffffff !important;
      background-color: #24AF6E !important;
    }
  }
}
.zero {
  color: #999999 !important;
  border: 1px solid #C0C0C0 !important;
  background-color: #F0F0F0 !important;
}
.warn {
  border: 1px solid #FFC24B;
  background-color: #FFFBC9;
}
.timeout {
  border: 1px solid #F76464;
  background-color: #FFD2D2;
}
.hasten {
  border: 1px solid #f00;
  background-color: #f00;
}
.coUnknowQty {
  animation: flash1 2s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-play-state: running;
}
</style>
<style lang="less">
  .tables-screen-view {
    button {
      .mid-info {
        height: auto;
        text-align: center;
        overflow: hidden;
      }
      .bottom-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        .people {
          display: flex;
          i {
            margin-right: 3px;
            font-size: 10px !important;
          }
        }
      }
    }
  }
</style>
