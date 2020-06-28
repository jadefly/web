<template>
  <div class="phone-card-wrapper" :class="stateCardClass">
    <!-- 电话图标 -->
    <div class="phone-icon" v-if="!isDone" :class="{ 'border-animate': this.isExecuteAnimation }">
      <i class="icon icon-telephone" v-if="isNewCall"></i>
      <i class="icon icon-takeout-phone" v-else></i>
    </div>
    <!-- 来电信息 -->
    <div class="phone-info">
      <!-- 注释  未知电话 -->
      <span class="name">{{ phoneInfo.telName ? phoneInfo.telName : $t('Dict.UnknownCall') }}</span>
      <strong class="number">{{ phoneInfo.telNo }}</strong>
      <span class="time">{{ callingTime }}</span>
    </div>
    <!-- 来电状态 -->
    <div class="phone-btn">
      <!-- 处理 -->
      <button v-if="isNoHandle || isNewCall" @click="handlePhone">{{ $t('Dict.Processing') }}</button>
      <!-- 取消 -->
      <button v-else-if="isHandling" @click="$emit('cancelHandlingPhone')">{{ $('Dict.Cancel') }}</button>
      <!-- 已处理 -->
      <button v-else-if="isDone">{{ $t('Dict.Handled') }}</button>
    </div>
    <!-- 更多 -->
    <div class="phone-more" v-if="!isHandling" @click="$emit('toPhoneRecord')" v-show="!isShowPhoneRecord">
      <span>{{$t('Dict.Btn.More')}}</span>
      <i class="icon icon-pager-next"></i>
    </div>
    <div class="phone-more" v-else @click="$emit('toPhoneRecord')" v-show="isNewCallWithHandling">
      <span>{{$t('Dict.Btn.NewCall')}}</span>
      <i class="icon icon-pager-next"></i>
    </div>
  </div>
</template>

<script>
import {
  NOHANDLE, ISDONE, NEWCALL, ISHANDLING, QUERYNOHANDLE,
} from '@/common/dictionary/pos-phone-state';
import ajax from '@/common/js/ajax';
import dateFormat from '@/common/js/dateformat';

export default {
  props: {
    // 电话信息
    phoneInfo: {
      type: Object,
      default: null,
    },
    // 处理中的新来电
    isNewCallWithHandling: {
      type: Boolean,
      default: false,
    },
    // 为了显示隐藏更多
    isShowPhoneRecord: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isExecuteAnimation: false, // 是否执行来电动画
    };
  },
  computed: {
    stateCardClass() {
      const {
        isNoHandle, isNewCall, isHandling, isDone, isNewCallWithHandling, isShowPhoneRecord,
      } = this;
      return {
        default: isNoHandle,
        new: isNewCall,
        handling: isHandling,
        done: isDone,
        'handling-and-new': isNewCallWithHandling,
        'at-phone-record': isShowPhoneRecord,
      };
    },
    // 电话状态管理
    state() {
      return this.phoneInfo.takeoutState;
    },
    isNoHandle() {
      return this.state === NOHANDLE || this.state === QUERYNOHANDLE;
    },
    isNewCall() {
      return this.state === NEWCALL;
    },
    isHandling() {
      return this.state === ISHANDLING;
    },
    isDone() {
      return this.state === ISDONE;
    },
    // 格式化时间
    callingTime() {
      const date = new Date(this.phoneInfo.callsTime);
      return dateFormat('%H:%I:%S', Date.parse(date));
    },
  },
  methods: {
    handlePhone() {
      this.$vemit('clearTakoutPhoneBill');
      this.$emit('handlePhone');
    },
    // 模拟电话外卖来电
    fakeCalling() {
      const ptomptText = this.$t('Biz.Order.AnalogTakeOutCall');
      const number = prompt(ptomptText, parseInt(Math.random() * Math.pow(10, 11)));
      ajax('canyin.pos.booking.saveorupdateincomingcallsinfo', {
        contentType: 'json',
        data: { telNo: number, takeoutState: 0 },
      }).then((res) => {
        this.$vemit('takeoutNewCall', res.data);
      });
    },
  },
  watch: {
    phoneInfo(value) {
      if (this.isExecuteAnimation) {
        this.isExecuteAnimation = false;
      }
      if (value.takeoutState === NEWCALL) {
        setTimeout(() => {
          this.isExecuteAnimation = true;
        }, 200);
      }
    },
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";

  // 默认变量
  @default-font-color: #889294;
  // 处理状态
  @handling-font-color: #0babb9;
  @handling-bg-color: #c5e0e5;
  // 新来电状态
  @new-font-color: #6fc176;
  @new-bg-color: #44a14c;

  .phone-card-wrapper {
    // 公用样式
    display: flex;
    justify-content: space-between;
    align-items: center;
    > .phone-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      font-size: 14px;
      > .number {
        font-size: 16px;
      }
      > .time {
        font-size: 12px;
      }
    }
    > .phone-btn > button {
      padding: 6px 20px;
      border: none;
      border-radius: 16px;
    }
    > .phone-more {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 12px 10px;
      font-size: 12px;
      line-height: 1;
      cursor: pointer;
    }
    // 默认（处理）样式
    &.default,
    &.handling {
      padding-left: 12px;
      background-color: @handling-bg-color;
      > .phone-icon {
        padding-left: 4px;
        padding-right: 4px;
        border: 1px solid @handling-font-color;
        border-radius: 50%;
        > i {
          font-size: 20px;
          color: @handling-font-color;
        }
      }
      > .phone-info {
        color: @default-font-color;
        > .number {
          color: @handling-font-color;
        }
      }
      > .phone-btn {
        flex-grow: .5;
        text-align: center;
        > button {
          background-color: @handling-font-color;
          color: white;
        }
      }
      > .phone-more {
        color: white;
        background-color: @handling-font-color;
      }
    }
    // 新来电样式
    &.new {
      padding-left: 8px;
      background-color: @new-font-color;
      @keyframes border-scale {
        from {
          border: 4px solid @new-font-color;
        }
        to {
          border: 4px solid #bfe4c2;
        }
      }
      > .phone-icon {
        padding: 1px 6px;
        border: 4px solid @new-font-color;
        border-radius: 50%;
        background-color: white;
        > i {
          font-size: 24px;
          color: @new-font-color;
        }
        &.border-animate {
          animation: 2.5s border-scale 4;
        }
      }
      > .phone-info {
        color: white;
      }
      > .phone-btn {
        flex-grow: .7;
        text-align: center;
        > button {
          background-color: white;
          color: @new-font-color;
        }
      }
      > .phone-more {
        color: white;
        background-color: @new-bg-color;
      }
      &.at-phone-record {
        padding-top: 2px;
        padding-bottom: 2px;
      }
    }
    // 处理中样式
    &.handling {
      padding-top: 2px;
      padding-bottom: 2px;
      > .phone-btn {
        flex-grow: .7;
        > button {
          background-color: white;
          color: #666;
        }
      }
      &.handling-and-new {
        padding-top: 0;
        padding-bottom: 0;
        > .phone-more {
          padding: 6px 10px;
          color: red;
          background-color: white;
        }
      }

    }
    // 已处理样式
    &.done {
      padding-left: 12px;
      border-bottom: 1px solid #d1dadf;
      background-color: white;
      > .phone-info {
        color: @default-font-color;
        > .number {
          color: #666;
          font-weight: normal;
        }
      }
      > .phone-btn {
        flex-grow: .4;
        text-align: right;
        > button {
          padding-left: 16px;
          padding-right: 16px;
          color: @default-font-color;
          border: 1px solid #d1dadf;
          background-color: white;;

        }
      }
      > .phone-more {
        padding-bottom: 11px;
        color: white;
        background-color: @handling-font-color;
      }
    }
  }
</style>
