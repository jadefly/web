<template>
  <footer class="pos-main-footer">
    <div class="pos-main-info">
      <i class="icon icon-pos"></i>
      {{ posInfo.code }}
      {{ now | dateFormat('%Y-%M-%D %H:%I:%S') }}
      {{ $t(`Dict.WhichDay${(new Date()).getDay()}`)}}
    </div>
    <ul v-if="fastFoodHide && isShowBillSerial" class="pos-main-statistical">
      <li>{{ $t('Biz.Order.OpenTable1') }}<em>{{ posFootInfo.currentBusinessDay.opened }}</em></li>
      <li>{{ $t('Biz.Order.Settlement') }}<em>{{ posFootInfo.currentBusinessDay.settled }}</em></li>
      <!-- "Unsettled": "未结算", -->
      <li>{{ $t('Biz.Order.Unsettled1') }}<em class="unsettled">{{ posFootInfo.currentBusinessDay.unsettle }}</em></li>
      <li><a href="javascript:;" @click="businessState">{{ $t('Biz.Order.Details') }}&gt;</a></li>
    </ul>
    <div class="pos-main-footer-btns">
      <a href="javascript:;" class="text-btn" @click="openGuide">
        <img src="@static/img/icon-doc.png" :alt="$t('Biz.Order.EmergencyGuide')">
        {{ $t('Biz.Order.EmergencyGuide') }}
      </a>
      <!-- "SystemErrorMsg": "系统时间与互联网时间不一致" -->
      <i
        class="icon icon-tishi"
        v-if="timeWarningShow"
        @click="$message.error($t('Biz.Order.SystemErrorMsg'))"
      ></i>
      <button type="button" class="btn" @click="startFullScreen">
        {{ fullScreenOn ? $t('Dict.CancelFullScreen') : $t('Dict.FullScreen') }}
      </button>
      <!-- <button type="button" class="btn" @click="lockPos">取消全屏</button> -->
      <button
        type="button" class="btn"
        @click="lockPos">
        {{ $t('Dict.Locking') }}
      </button>
      <button type="button" class="btn" @click="reload">{{ $t('Dict.Btn.Refresh') }}</button>
    </div>
    <Guide ref="guide"></Guide>
  </footer>
</template>

<script>
/* eslint-disable no-console */

import { mapGetters, mapMutations } from 'vuex';
import { now } from 'lodash';
import axios from 'axios';
import dateFormatMixin from '@/common/js/dateFormatMixin';
import ajax from '@/common/js/ajax';
import Guide from './Guide';

const TENMINUTES = 1000 * 60 * 10; // 十分钟
const ONEDAY = 1; // 一天
export default {
  components: { Guide },
  mixins: [dateFormatMixin],
  data() {
    return {
      now: now(),
      fullScreenOn: false,
      // fullScreenOn:false,
      timeWarningShow: false,
    };
  },
  computed: {
    ...mapGetters(['posInfo', 'posFootInfo', 'posBaseInfo', 'getVuexPosMode', 'posDevice']),
    // 快餐模式下, 屏蔽footer'开台 结算 未结算'信息
    fastFoodHide() {
      return +this.posBaseInfo.controlMode !== 3;
    },
    isShowBillSerial() {
      return this.posInfo.isShowBillSerial;
    },
  },
  mounted() {
    this.setCurrentTime();
    // 获取系统时间 与互联网时间的比较 每十分钟检测一次 大于十分钟给予警告
    this.compareTime();
    setInterval(() => {
      this.compareTime();
    }, TENMINUTES);
  },
  watch: {
    posBaseInfo() {
      if (+this.posBaseInfo.controlMode !== 1 && typeof (console) !== 'undefined') {
        // 录单模式
        if (+this.posBaseInfo.controlMode === 2) {
          this.changeScreen('recordFood');
        } else {
          //  快餐
          this.changeScreen('fastFood');
        }
      } else {
        // 中餐
        this.changeScreen('chineseFood');
      }
    },
  },
  methods: {
    // 全屏切换
    changeScreen(str) {
      if (window.localStorage.getItem(str)) {
        this.fullScreenOn = window.localStorage.getItem(str) !== 'false';
        if (this.fullScreenOn) {
          console.info('TCSLCMD=FullScreenOn');
        } else {
          console.info('TCSLCMD=FullScreenOff');
        }
      } else if (str === 'chineseFood') {
        this.fullScreenOn = false;
        console.info('TCSLCMD=FullScreenOff');
      } else {
        this.fullScreenOn = true;
        console.info('TCSLCMD=FullScreenOn');
      }
    },
    // 点击锁定按钮
    lockPos() {
      this.$emit('lockPos');
    },
    // 点击刷新按钮
    reload() {
      this.$emit('reload');
    },
    // 点击详情
    businessState() {
      this.$emit('businessState');
    },
    startFullScreen() {
      if (typeof (console) !== 'undefined' && !this.fullScreenOn) {
        this.fullScreenOn = true;
        console.info('TCSLCMD=FullScreenOn');
      } else if (typeof (console) !== 'undefined' && this.fullScreenOn) {
        this.fullScreenOn = false;
        console.info('TCSLCMD=FullScreenOff');
      }
      switch (this.getVuexPosMode) {
        case '3':
          window.localStorage.setItem('fastFood', this.fullScreenOn);
          break;
        case '1':
          window.localStorage.setItem('chineseFood', this.fullScreenOn);
          break;
        default:
          window.localStorage.setItem('recordFood', this.fullScreenOn);
          break;
      }
    },
    // 设置当前时钟
    setCurrentTime() {
      // 每秒时间 + 1 实现时钟显示
      setInterval(() => {
        this.now = now();
      }, 1000);
    },
    // 获取服务器时间
    getSystemTime() {
      return new Promise((resolve) => {
        ajax('canyin.pos.reception.systemtime.getcurrenttimemillis', { loading: false }).then((res) => {
          resolve(Number(res.data));
        }).catch(() => {
          this.$log.debug(`获取服务器时间日志：接口地址：canyin.pos.reception.systemtime.getcurrenttimemillis ${new Date()}`);
          resolve(Date.parse(new Date()));
        });
      });
    },
    // 获取互联网时间
    getInterTime() {
      return new Promise((resolve) => {
        axios.get('http://quan.suning.com/getSysTime.do').then((res) => {
          resolve(res.data.sysTime2);
        }).catch(() => {
          this.$log.debug(`获取苏宁时间: ${new Date()}`);
          resolve(Date.parse(new Date()));
        });
      });
    },
    // 比较互联网时间 进行警告和加单限制
    async compareTime() {
      const systemTime = new Date(await this.getSystemTime());
      const interTime = new Date(await this.getInterTime());
      // 差别大于十分钟显示时间警告
      this.timeWarningShow = Math.abs(systemTime - interTime) > TENMINUTES;
      // 差别隔天进行加单限制（防止生成相同流水）
      const timeOver = Math.abs(interTime.getDate() - systemTime.getDate()) >= ONEDAY;
      this.setTimeCompareData({ timeOver, systemTime, interTime });
    },
    openGuide() {
      this.$refs.guide.open();
    },
    ...mapMutations({
      setTimeCompareData: 'SET_TIME_COMPARE_DATA',
    }),
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

// Component Footer

//== background color
@pos-main-footer-bg: rgba(0, 0,0, 0.6);
//== text color
@pos-main-footer-color: rgba(255, 255, 255, .9);
//== padding horizontal
@pos-main-footer-padding-horizontal: 10px;

//== info space
@pos-main-info-space: 5px;

//== statistical

//** item space
@pos-main-statistical-item-space: 10px;

//** unsettled text color
@pos-main-statistical-unsettled-color: #ccc;

//== btns

//** height
@pos-main-footer-btns-height: 30px;
//** space
@pos-main-footer-btns-space: 2px;
//** line height
@pos-main-footer-btns-line-height: 12px;

.pos-main-footer {
  position: absolute;
  left: 0;
  bottom: 0;
  .size(100%, @pos-main-footer-height);
  background-color: @pos-main-footer-bg;
}

.pos-main-info {
  position: absolute;
  left: @pos-main-footer-padding-horizontal;
  top: 0;
  color: @pos-main-footer-color;
  line-height: @pos-main-footer-height;

  .icon {
    margin-right: @pos-main-info-space;
  }
}
.pos-main-statistical {
  text-align: center;
  color: @pos-main-footer-color;
  line-height: @pos-main-footer-height;

  > .sign-menu{
    position:absolute;
    right:302px;
  }

  > li {
    display: inline;
    padding-left: @pos-main-statistical-item-space / 2;
    padding-right: @pos-main-statistical-item-space / 2;

    > em {
      font-style: normal;

      &.unsettled {
        color: @pos-main-statistical-unsettled-color;
      }
    }

    > a {
      color: @pos-main-footer-color;
    }
  }
}

.pos-main-footer-btns {
  position: absolute;
  right: @pos-main-footer-padding-horizontal;
  top: 0;
  padding-top: (@pos-main-footer-height - @pos-main-footer-btns-height) / 2;

  > .text-btn {
    color: #ccc;
    margin-right: 10px;
  }

  > i {
    color: red;
    font-size: 20px;
    padding-right: 3px;
    cursor: pointer;
  }

  > .btn {
    height: @pos-main-footer-btns-height;
    background: none;
    border: 1px solid @pos-main-footer-color;
    color: @pos-main-footer-color;
    margin-left: @pos-main-footer-btns-space;
    margin-right: @pos-main-footer-btns-space;
    line-height: @pos-main-footer-btns-line-height;

    &:hover {
      color: @white;
      border-color: @white;
    }
  }
}
.lang-enUS {
  .pos-main-footer {
    font-size: 12px;
    .pos-main-statistical {
      & > li:last-child{
        margin-right: 80px;
      }
    }
    .pos-main-footer-btns {
      > .btn {
        font-size: 12px;
      }
    }
  }
}
</style>
