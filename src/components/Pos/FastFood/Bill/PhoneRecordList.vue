<template>
  <div class="phone-record-wrapper" ref="phoneRecordWrapper">
    <div class="topbar">
      <i class="icon icon-pager-prev" @click="backBillAndRefresh"></i>
      <span>{{ $t('Dict.IncomingCalls') }}</span>
    </div>
    <ul class="tab-header">
      <li v-for="(item, index) in tableState" :key="index" :class="{ 'active': seletedTab === index }" @click="seletedTab = index">{{ item }}</li>
    </ul>
    <PhoneStateCard class="new-phone-card"
      @handlePhone="backBillAndHandle(newPhone)"
      :phoneInfo="newPhone" :isShowPhoneRecord="isShowPhoneRecord"
      v-if="newPhone"></PhoneStateCard>
    <ul class="tab-content" ref="tabContent">
      <li :key="'phoneList'+index" v-for="(item, index) in phoneList"
        :class="{'handling': item.takeoutState === phoneState.ISHANDLING, 'done': item.takeoutState === phoneState.ISDONE}">
        <div class="phone-info">
          <span class="name">{{ item.telName ? item.telName : `${$t('Dict.UnknownCall')}` }}</span>
          <span class="number">{{ item.telNo }}</span>
          <span class="time">{{ formatCallingTime(item.callsTime) }}</span>
        </div>
        <button v-if="item.takeoutState === phoneState.ISHANDLING">{{ $t('Dict.InProcessing') }}</button>
        <button v-else-if="item.takeoutState === phoneState.ISDONE">{{ $t('Dict.Handled') }}</button>
        <button v-else @click="backBillAndHandle(item)">{{ $t('Dict.Processing') }}</button>
      </li>
    </ul>
    <div class="content-pager">
      <Pager :total="total" :limit="limit" @getPager="getPager" ref="phoneListPager"></Pager>
    </div>
  </div>
</template>

<script>
import { debounce } from 'lodash';
import PhoneStateCard from './PhoneStateCard';
import Pager from '@/components/Pos/Takeout/Base/Pager';
import ajax from '@/common/js/ajax';
import dateFormat from '@/common/js/dateformat';
import * as phoneState from '@/common/dictionary/pos-phone-state';

export default {
  components: { Pager, PhoneStateCard },
  props: {
    phoneInfo: {
      type: Object,
      default: null,
    },
    isShowPhoneRecord: {
      type: Boolean,
      default: false,
    },
    newCallNumberWithHandling: null,
  },
  data() {
    return {
      phoneState,
      phoneList: null,
      total: 0,
      seletedTab: 0,
      takeoutState: null,
      newPhone: null,
      limit: 5,
      tableState: [this.$t('Dict.All'), this.$t('Dict.PendingDisposal'), this.$t('Dict.Handled')],
    };
  },
  created() {
    this.onResizeScreen();
    this.takeoutNewCall();
    this.backBillAndRefresh({});
    this.onTakeoutPhoneSuccess();
  },
  methods: {
    // 获取电话列表 返回 thenable 对象
    getPhoneRecordList({ start = 0, limit = 5, takeoutState = null }) {
      return ajax('canyin.pos.booking.getincomingcallslistbypage', {
        contentType: 'json',
        data: {
          params: {
            start, limit, takeoutState, beginTime: null,
          },
        },
      });
    },
    // 请求后赋值分页、列表
    async setListAndPager({ start = 0, limit = 5, takeoutState = null }) {
      // 不请求新来电
      if (this.newPhone && start === 0 && takeoutState !== phoneState.ISDONE) { start = 1; }
      const { id, takeoutState: state } = this.phoneInfo || {};
      const { list, total } = await this.getPhoneRecordList({ start, limit, takeoutState });
      // 回显处理中
      if (state === phoneState.ISHANDLING) {
        const handlingPhone = list.find(item => item.id === id);
        if (handlingPhone) {
          handlingPhone.takeoutState = phoneState.ISHANDLING;
        }
      }
      this.phoneList = list;
      this.total = total;
    },
    // 返回到加单页 优先级：处理中 > 未处理 > 已处理
    async backBillAndRefresh({ isSuccess = false }) {
      let { list } = await this.getPhoneRecordList({ takeoutState: phoneState.QUERYNOHANDLE, limit: this.limit }); // 请求未处理
      if (!list[0]) { // 请求处理中
        list = (await this.getPhoneRecordList({ takeoutState: phoneState.ISDONE, limit: this.limit })).list;
      }
      if (list[0]) {
        this.$emit('backBillAndRefresh', list[0], isSuccess);
      }
    },
    // 处理当前电话
    backBillAndHandle(phone) {
      this.$vemit('handleTakeoutPhone', { disable: false, handlingPhone: null });
      this.$vemit('handleTakeoutPhone', { disable: true, handlingPhone: this.phoneInfo }); // 禁用按钮
      this.$vemit('clearTakoutPhoneBill');
      this.$emit('backBillAndHandle', phone);
    },
    // 来电话啦 两种情况：来电显示页、加单页
    takeoutNewCall() {
      this.$vonce('takeoutNewCall', (data) => {
        Object.assign(data, { takeoutState: phoneState.NEWCALL });
        if (this.isShowPhoneRecord) {
          if (this.newPhone && this.$refs.phoneListPager.currentPager === 1) { // 又来电啦
            this.setListAndPager({ limit: this.limit });
          }
          this.newPhone = data;
        } else {
          this.$emit('newCallAtBill', data);
        }
      });
    },
    // 电话外卖落单成功
    onTakeoutPhoneSuccess() {
      this.$vonce('takeoutPhoneSuccess', () => {
        this.backBillAndRefresh({ isSuccess: true });
      });
    },
    // 初始化数据
    initPhoneData() {
      if (this.newCallNumberWithHandling) {
        this.newPhone = this.newCallNumberWithHandling;
      } else {
        this.newPhone = null;
      }
      this.phoneList = [];
      this.seletedTab = 0;
      this.$refs.phoneListPager.init();
    },
    // 获取分页数量
    getPager(index) {
      this.setListAndPager({ start: (index - 1) * this.limit, takeoutState: this.takeoutState, limit: this.limit });
    },
    // 格式化时间
    formatCallingTime(timeString) {
      const date = new Date(timeString);
      return dateFormat('%H:%I:%S', Date.parse(date));
    },
    onResizeScreen() {
      window.addEventListener('resize', debounce(() => {
        this.calculateContainableSize();
        this.setListAndPager({ limit: this.limit });
      }, 500));
    },
    // 计算容器容纳量
    calculateContainableSize() {
      const LIHEIGHT = 76;
      const { height } = this.$refs.tabContent.getBoundingClientRect();
      const limit = Math.floor(height / LIHEIGHT);
      if (limit > 0) {
        this.limit = limit;
      }
    },
    // 模拟电话外卖来电
    fakeCalling() {
      const number = prompt('模拟电话外卖来电', parseInt(Math.random() * Math.pow(10, 11)));
      ajax('canyin.pos.booking.saveorupdateincomingcallsinfo', {
        contentType: 'json',
        data: { telNo: number, takeoutState: 0, telLineNo: 0},
      }).then((res) => {
        this.$vemit('takeoutNewCall', res.data);
      });
    },
  },
  watch: {
    // 进入来电记录页 初始化数据
    isShowPhoneRecord(isShow) {
      if (isShow) {
        this.calculateContainableSize();
        this.initPhoneData();
        this.setListAndPager({ limit: this.limit });
        this.$vemit('handleTakeoutPhone', { disable: true, allBtn: true }); // 禁用按钮
      }
    },
    // Tab 状态过滤
    seletedTab(index) {
      if (index === 0) { // 全部
        this.takeoutState = phoneState.QUERYNALL;
      } else if (index === 1) { // 未处理
        this.takeoutState = phoneState.QUERYNOHANDLE;
      } else if (index === 2) { // 已处理
        this.takeoutState = phoneState.ISDONE;
      }
      this.setListAndPager({ takeoutState: this.takeoutState, limit: this.limit });
      this.$refs.phoneListPager.init();
    },
  },

};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";

  @default-color: #666;
  @handling-color: #0babb9;
  @border-color: #ccc;

  .phone-record-wrapper {
    position: relative;
    > .topbar {
      padding: 10px;
      text-align: center;
      border-top: 1px solid #c4d3dc;
      background-color: #ebf3f4;
      > .icon-pager-prev {
        position: absolute;
        top: 6px;
        left: 4px;
        padding-left: 4px;
        padding-bottom: 4px;
        font-size: 20px;
        cursor: pointer;
      }
    }
    > .tab-header {
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding-bottom: 1px;
      border-bottom: 1px solid @border-color;
      color: @default-color;
      > li {
        padding: 12px 6px;
        cursor: pointer;
        &.active {
          color: @handling-color;
          border-bottom: 2px solid @handling-color;
        }
      }
    }
    > .tab-content {
      height: calc(100% - 41px - 48px - 56px);
      overflow: hidden;
      > li  {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 14px;
        border-bottom: 1px solid @border-color;
        > .phone-info {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          font-size: 14px;
          color: @default-color;
          > .number {
            font-size: 16px;
            color: @handling-color;
          }
          > .time {
            font-size: 12px;
          }
        }
        > button {
          min-width: 74px;
          padding: 6px 16px;
          border: none;
          border-radius: 16px;
          color: white;
          background-color: @handling-color;
        }
        &.handling > button {
          border: 1px solid @handling-color;
          color: @handling-color;
          background-color: white;
          cursor: default;
        }
        &.done {
          > .phone-info > .number{
            color: @default-color;
          }
          > button {
            border: 1px solid @border-color;
            color: @default-color;
            background-color: white;
            cursor: default;
          }
        }
      }
    }
    > .content-pager {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 100%;
      text-align: right;
      padding: 10px 14px;

    }
  }
</style>
