<template>
  <div class="itemDiv">
    <div class="tableNum">{{data.sn ? data.deFromName + data.sn : data.pointName}}</div>
    <div class="time">{{dateFormat('%H:%I', new Date(data.createTime))}}</div>
    <div class="name" :style="{'font-size':fontSize(displayName+'')}">{{displayName}}</div>
<!--  外卖预点单 显示主单位  -->
    <div class="num">x{{!showWight && data.orderType && data.orderType > 2 ? data.lastQty : data.auxiliaryUnitQty}}</div>
    <div v-if="showWight" class="weight"><span class="weightNum">{{data.lastQty}}</span>{{unit}}</div>
    <p class="clearFloat"></p>
  </div>
</template>

<script>

import dateFormat from '@/common/js/dateformat';

export default {
  name: 'Item',
  props: {
    data: {
      type: Object,
      default: null,
    },
    unit: {
      type: String,
      default: null,
    },
    showWight: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dateFormat,
    };
  },
  computed: {
    displayName() {
      if (this.data) {
        if (this.data.sizeId !== '-1') {
          return `(${this.data.sizeName})${this.data.itemName}`;
        }
        return this.data.itemName;
      }
      return '';
    },
  },
  methods: {
    // 动态设置字体大小
    fontSize(name) {
      if (!this.showWight && name.length > 12) {
        return '16px';
      }
      if (this.showWight && name.length > 14) {
        return '16px';
      }
      return '18px';
    },
  },
};
</script>

<style scoped lang="less">
  .itemDiv{
    padding: 4px 10px;
    background: white;
    font-size:14px;
    border-radius:4px;
    border: #C3C3C3 solid 1px;
    line-height: 22px;
    cursor: pointer;
    .tableNum{
      font-weight:bold;
      float: left;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      width: 75px;
    }
    .time{
      font-weight:400;
      color: #666666;
      float: right;
    }
    .name{
      clear: both;
      color: #333333;
      font-weight:bold;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      height: 50px;
      line-height: 28px;
      font-size: 18px;
    }
    .num{
      float: left;
    }
    .weight{
      float: right;
      .weightNum{
        color: #0E75DF;
        font-size:16px;
        font-weight: bold;
      }
    }
    .clearFloat{
      clear: both;
    }
  }
  .itemDiv-active{
    .itemDiv;
    color: #ffffff;
    background: #008DCC;
    .time{
      color: #ffffff;
    }
    .name{
      color: #ffffff;
    }
  }
</style>
