<template>
  <ul class="served-ul">
    <li class="max-width-30 text-center no-border no-padding">{{ index + 1 }}</li>
    <li class="flex-2 no-wrap">{{ data.itemName }}</li>
    <li class="max-width-50 text-center no-padding">1</li>
    <li class="process flex-8">
      <div class="step">
        <!-- 下单 PlaceAnOrder -->
        <span class="all">{{ $t('Dict.PlaceAnOrder') }}({{ data.lastQty }})</span>
        <span class="time">{{ formatDate(data.createTime) }}</span>
      </div>
      <div class="step" v-if="+data.callUpQty !== 0 || +data.servewayid !== 0">         <!--callUpQty和servewayid都为0的时候 没有等叫和起菜 等叫-->
        <span class="all">{{ this.$t('Biz.Order.EqualCall') }}</span>
        <span class="time">12:12:44</span>
      </div>
      <div class="step" v-if="+data.callUpQty !== 0 || +data.servewayid !== 0">
        <span class="half">{{ $t('Dict.Btn.Serving') }}</span>
        <span class="time visibility-hide">12:16:23</span>
      </div>
      <div class="step" v-if="toggle.arrangeDish">
        <!-- "Garnish": "配菜" -->
        <span class="half">{{ $t('Dict.Garnish') }}</span>
        <span class="time">12:20:23</span>
      </div>
      <div class="step"  v-if="toggle.transferDish">
        <!-- "PassDish": "传菜", -->
        <span class="waiting">{{ $t('Dict.PassDish') }}</span>
        <span class="time">12:55:23</span>
      </div>
      <div class="step">
        <!-- Served 上菜 -->
        <span class="waiting">{{ $t('Dict.Btn.Served') }}({{ data.callUpQty }})</span>
        <span class="time">12:58:23</span>
      </div>
    </li>
    <li class="text-center pointer">
      <!-- ServerNum 上菜数量-->
      <img :src="imgages[0]" :alt="$t('Dict.ServeNum')" @click="servedNum">
    </li>
    <li class="pointer">
      <img :src="imgages[1]" :alt="$t('Dict.Btn.Served')">
    </li>
    <changeServedNum ref="changeServedNum" submitId="998"></changeServedNum>
  </ul>
</template>


<script>
  import transfer from '@/common/images/pos/singleItemTransfer/transfer.png';
  import repeal from '@/common/images/pos/singleItemTransfer/repeal.png';
  import changeServedNum from './changeServedNum';
  export default {
    components: {
      changeServedNum,
    },
    props: {
      data: {
        type: Object,
        default() {
          return {};
        },
      },
      toggle: {
        type: Object,
        default() {
          return {};
        },
      },
      index: {
        type: Number,
        default: '',
      }
    },
    data() {
      return {
        imgages: [transfer,repeal],
      }
    },
    mounted() {
      console.log(this.data)
    },
    methods: {
      /**
       * 打开上菜数量弹框
       */
      servedNum() { this.$refs.changeServedNum.open() },
      /**
       * 格式化时间
       */
      formatDate(time) {
        //转为正常时间字符串
        const date = new Date(time);
        let hour = date.getHours();
        let min = addZero(date.getMinutes());
        let seconds = addZero(date.getSeconds());
        // 数字不足两位，在前面补0
        function addZero(num) {
          let str = `${num}`;
          if (str.length === 1) return `0${str}`;
          return str;
        }
        return `${hour}:${min}:${seconds}`
      },
    }
  }
</script>

<style lang="less" scoped>
  /*公共样式*/
  .served-ul {
    display: flex;
    align-items: center;
    padding: 3px;
    > li {
      flex: 1;
      padding-left: 5px;
      & > img {
        width: 25px;
        height: 25px;
      }
    }
    .process {
      display: flex;
      align-items: center;
      height: 60px;
      > div:first-child > span:first-child {
        margin-left: 0;
        &:before {
          display: none;
          content: '';
        }
      }
      > div:last-child > span:first-child {
        margin-right: 0;
        &:after {
          display: none;
          content: '';
        }
      }
      > div {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin: 0 10px;
        width: 60px;
        height: 25px;
        line-height: 25px;
        > span:first-child {
          display: inline-block;
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          border-radius: 10px;
          color: white;
          &:before {
            position: absolute;
            top: 12.5px;
            left: -10px;
            content: '';
            width: 10px;
            height: 4px;
          }
          &:after {
            position: absolute;
            top: 12.5px;
            right: -10px;
            content: '';
            width: 10px;
            height: 4px;
          }
        }
        .visibility-hide {
          position: relative;
          visibility: hidden;
        }
        .all {
          background-color: yellowgreen;
          &:before {
            background-color: yellowgreen;
          }
          &:after {
            background-color: yellowgreen;
          }
        }
        .half {
          background-color: orange;
          &:before {
            background-color: orange;
          }
          &:after {
            background-color: orange;
          }
        }
        .waiting {
          background-color: #bbbbbb;
          &:before {
            background-color: #bbbbbb;
          }
          &:after {
            background-color: #bbbbbb;
          }
        }
      }
    }
    .white {
      border-left: 1px solid #ffffff;
      color: #ffffff;
    }
    .text-center {
      text-align: center;
    }
    .no-border {
      border: none;
    }
    .no-padding {
      padding: 0;
    }
    .flex-2 {
      flex: 2;
    }
    .no-wrap {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .flex-8 {
      flex: 8
    }
    .max-width-50 {
      max-width: 50px;
    }
    .max-width-30 {
      max-width: 30px;
    }
    .pointer {
      cursor: pointer;
    }
  }
</style>
