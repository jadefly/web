<template>
  <div class="pos-takeout-list" v-if="takeOutList.length !== 0">
    <!-- 外卖单列表 -->
    <ul class="pos-takeout-orderlist">
      <li
        v-for="(item, index) in takeOutList"
        :key="index"
        :class="{active: tabIndex === index}"
        @click="dispatchData(item, index)"
      >
        <div class="t">
          <h3>
            <i :class="orderSource(item.deFrom)"></i>
            <em v-if="item.sn"><span v-if="item.sn.indexOf('#') == -1">#</span>{{ item.sn }}</em>
            <strong>{{ item.o2oTakeoutDinerDTOList[0].contactName }}</strong>
            <span>{{ item.o2oTakeoutDinerDTOList[0].contactTel }}</span>
          </h3>
          <!-- 骑手信息，订单来源为电话外卖单 且 开启了电话外卖单业务的情况下显示 -->
          <div class="rider" v-if="item.deFrom===19998 && posTakeout.isNewTakeoutPhoneOrder">
            <i class="icon icon-waimai-rider icon-rider"></i>
            <span>{{item.o2oTakeoutDistributionDTOList[0].riderName}}</span>
          </div>
          <div class="i">
            <strong>{{ item.o2oTakeoutDetailDTO.deBeginDateTime | dateFormat('%H:%I') }}</strong>
            <span>{{
              item.o2oTakeoutDetailDTO.deBeginDateTime
                ? $t('Dict.MealTime')
                : ''
            }} {{ item.o2oTakeoutDetailDTO.deBeginDateTime | dateFormat('%Y-%M-%D') }}</span>
          </div>
        </div>
        <div class="c">
          <div class="l">
            <div class="p">
              <i class="icon icon-pos-takeout-position"></i>
              <el-popover
                placement="bottom-start"
                trigger="hover"
                :content="item.o2oTakeoutDistributionDTOList[0].deAddress">
                <span slot="reference">{{ item.o2oTakeoutDistributionDTOList[0].deAddress }}</span>
              </el-popover>
            </div>
            <div class="m">
              {{ $t('Dict.Number201') }}{{ item.deNo }}
              <span>|</span>
              {{ $t('Dict.OrderTime') }}
              {{ item.createDateTime | dateFormat('%Y-%M-%D %H:%I') }}
            </div>
          </div>
          <div class="r">
            <div class="a">
              <span v-if="ABNORMAL_ORDER === requestType && item.sendWarnMsg">
              </span>
            </div>
            <div class="b">
              <span v-if="item.o2oTakeoutBasePayDTO.payType === 1">
                {{ $t('Dict.OnlinePayment') }}
              </span>
              <span
                  v-if="item.o2oTakeoutBasePayDTO.payType === 2"
                  :class="whitchLanguage === 'en' ? 'cash-on-delivery-en': whitchLanguage === 'chhk' ? 'cash-on-delivery-f' : 'cash-on-delivery'"
              >{{ $t('Dict.CashOnDelivery') }}</span>
              <em :class="orderState(item.dealState, item.cancelReason, item.selfGetOrderCheckoutMode).class">{{ orderState(item.dealState, item.cancelReason, item.selfGetOrderCheckoutMode).name }}</em>
            </div>
          </div>
          </div>
      </li>
    </ul>
  </div>
  <!-- 无外卖单状态 待改进：根据不同状态显示不同文字 -->
  <div v-else class="pos-takeout-no-orderlist">
    <ul class="no-order">
      <li><i class="icon icon-add-item"></i></li>
      <li><strong>{{$t('Dict.NoTime')}}{{ checkRequestType }}</strong></li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Vue from 'vue';
import dateFormatMixin from '@/common/js/dateFormatMixin';
import {
  NEW_ORDER, BACK_ORDER, HANDLING_ORDER, HISTORY_ORDER, ABNORMAL_ORDER,
} from '@/common/api/takeoutConfig';

export default {
  props: {
    takeOutList: {
      type: Array,
      default: () => [],
    },
    requestType: {
      type: String,
      default: '0',
    },
  },
  mixins: [dateFormatMixin],
  data() {
    return {
      ABNORMAL_ORDER,
      tabIndex: -1,
      orderItem: {},
    };
  },
  computed: {
    whitchLanguage() {
      if (Vue.config.lang === 'enUS') {
        return 'en';
      } if (Vue.config.lang === 'zhHK') {
        return 'zhhk';
      } return 'zhcn';
    },
    // 判断请求类型
    checkRequestType() {
      let str = '';
      switch (this.requestType) {
        case NEW_ORDER:
          str = this.$t('Dict.NewOrder');
          break;
        case BACK_ORDER:
          str = this.$t('Dict.Chargeback');
          break;
        case HANDLING_ORDER:
          str = this.$t('Dict.InProcessing');
          break;
        case HISTORY_ORDER:
          str = this.$t('Dict.HistoricalOrder');
          break;
        case ABNORMAL_ORDER:
          str = '配送异常';
          break;
        case ABNORMAL_ORDER:
          str = '配送异常';
          break;
        default:
          str = this.$t('Dict.UnknownType');
          break;
      }
      return str;
    },
    ...mapGetters(['posTakeout']),
  },
  created() {
    this.dispatchData(this.takeOutList[0], 0);
  },
  methods: {
    // 订单状态
    orderState(dealState, cancelReason, selfGetOrderCheckoutMode) {
      let obj = null;
      if (cancelReason === 0) {
        switch (dealState) {
          case 0:
            obj = {
              name: this.$t('Dict.NewOrder'),
              class: 'new',
            };
            break;
          case 1:
            obj = {
              name: this.$t('Dict.ToBeMade'),
              class: 'wait-make',
            };
            break;
          case 2:
            obj = {
              name: this.$t('Dict.InProduction'),
              class: 'making',
            };
            break;
          case 3:
            if (selfGetOrderCheckoutMode) {
              obj = { name: '待取餐', class: 'delivering' };
            } else {
              obj = { name: this.$t('Dict.ToBeDelivered'), class: 'wait-delivery' };
            }
            break;
          case 4:
            obj = {
              name: this.$t('Dict.Equestrian'),
              class: 'wait-delivery',
            };
            break;
          case 5:
            obj = {
              name: this.$t('Biz.Pos.Takeout.TakeoutMsg045'),
              class: 'wait-delivery',
            };
            break;
          case 6:
            obj = {
              name: selfGetOrderCheckoutMode ? '待取餐' : this.$t('Dict.Distribution'),
              class: 'delivering',
            };
            break;
          case 7:
            obj = {
              name: this.$t('Dict.Delivered'),
              class: 'done',
            };
            break;
          case 8:
            obj = {
              name: this.$t('Dict.Paid'),
              class: 'done',
            };
            break;
          case 9:
            obj = {
              name: this.$t('Dict.AlreadyEvaluated'),
              class: 'delivering',
            };
            break;
          case 10:
            obj = {
              name: '已取餐',
              class: 'done',
            };
            break;
          default:
            obj = {
              name: this.$t('Dict.Unknown'),
              class: 'error',
            };
            break;
        }
      } else if (cancelReason === 1) {
        obj = {
          name: this.$t('Biz.Pos.Takeout.TakeoutMsg038'),
          class: 'error',
        };
      } else if (cancelReason === 2) {
        obj = {
          name: this.$t('Biz.Pos.Takeout.TakeoutMsg046'),
          class: 'error',
        };
      } else if (cancelReason === 3) {
        obj = {
          name: this.$t('Biz.Pos.Takeout.TakeoutMsg039'),
          class: 'error',
        };
      } else if (cancelReason === 4) {
        obj = {
          name: this.$t('Dict.PlatformCancellation'),
          class: 'error',
        };
      } else if (cancelReason === 5) {
        obj = {
          name: this.$t('Biz.Pos.Takeout.TakeoutMsg047'),
          class: 'error',
        };
      } else if (cancelReason === 6) {
        obj = {
          name: this.$t('Biz.Pos.Takeout.TakeoutMsg040'),
          class: 'error',
        };
      } else {
        obj = {
          name: this.$t('Dict.Unknown'),
          class: 'error',
        };
      }
      return obj;
    },
    // 订单来源
    orderSource(id) {
      let str = '';
      switch (id) {
        case 3:
          str = 'wechat';
          break;
        case 7:
          str = 'baidu';
          break;
        case 9:
          str = 'candao';
          break;
        case 11:
          str = 'meituan';
          break;
        case 13:
          str = 'elm';
          break;
        case 16:
          str = 'youzan';
          break;
        case 19998:
          str = 'phone';
          break;
        case 19999:
          str = 'self';
          break;
        case 33:
          str = 'ebai';
          break;
        default:
          str = 'default';
      }
      return str;
    },
    // 点击派发出订单状态
    dispatchData(item, index) {
      this.$emit('getItem', item);
      this.tabIndex = index;
      this.orderItem = item;
    },
  },
  watch: {
    // 监听数据 联动右侧状态按钮（触发频率过高待改进）
    takeOutList() {
      if (this.takeOutList.length) {
        // 特殊情况：新订单或退单
        if (this.takeOutList[this.tabIndex]) {
          this.dispatchData(this.takeOutList[this.tabIndex], this.tabIndex);
        } else {
          this.dispatchData(this.takeOutList[this.tabIndex - 1], this.tabIndex - 1);
        }
      } else {
        // 边界状态：取消到最后一个 清空右侧按钮
        this.$emit('cancelLast');
      }
    },
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";

  .pos-takeout-list {
    position: relative;
    height: 100%;
    padding-top: 6px;
    padding-left: 20px;
    padding-right: 20px;
    padding-bottom: 50px;
    background-color: rgba(255, 255, 255, 0.6);
    border-radius: 0 3px 3px 0;
  }

  .pos-takeout-orderlist {
    height: 100%;

    > li {
      position: relative;
      height: 104px;
      padding-top: 42px;
      margin-bottom: 8px;
      border: 1px solid #d2e2f2;
      border-radius: 3px;
      cursor: pointer;

      &:hover {
        > .t {
          background-color: rgb(218, 213, 213);
        }
      }

      > .t {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 42px;
        background-color: #ccc;
        color: #333;
        border-radius: 3px 3px 0 0;

        > h3 {
          float: left;
          padding-left: 20px;
          height: 42px;
          line-height: 42px;
          font-size: 16px;
          font-weight: bold;

          > strong,
          > em,
          > span {
            margin-left: 5px;
            margin-right: 5px;
            vertical-align: middle;
          }

          > i {
            display: inline-block;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            overflow: hidden;
            background-repeat: no-repeat;
            background-position: 50% 50%;
            background-size: 28px 28px;
            vertical-align: middle;
            margin-right: 2px;

            &.elm {
              background-image: url(~@/common/images/pos/takeout/elm.jpg);
            }

            &.baidu {
              background-image: url(~@/common/images/pos/takeout/baidu.jpg);
            }

            &.meituan {
              background-image: url(~@/common/images/pos/takeout/meituan.jpg);
            }

            &.wechat {
              background-image: url(~@/common/images/pos/takeout/wechat.jpg);
            }

            &.youzan {
              background-image: url(~@/common/images/pos/takeout/youzan.jpg);
            }

            &.candao {
              background-image: url(~@/common/images/pos/takeout/candao.png);
            }

            &.phone {
              background-image: url(~@/common/images/pos/takeout/phone.png);
            }
            &.self {
              background-image: url(~@/common/images/pos/takeout/self.png);
            }
            &.ebai {
              background-image: url(~@/common/images/pos/takeout/ebai.png);
            }
            &.default {
              background-image: url(~@/common/images/pos/takeout/default.png);
            }
          }

          > em {
            font-style: normal;
          }
        }

        > .rider{
          float: left;
          height: 25px;
          line-height: 25px;
          min-width: 70px;
          padding: 0 10px;
          font-size: 13px;
          margin: 10px;
          border-radius: 15px;
          background: #fff;
          > i{
            float: left;
            font-size: 14px;
            margin-top: 1px;
            margin-right: 5px;
          }
        }
        > .i {
          float: right;
          padding-top: 5px;
          padding-right: 25px;
          text-align: right;

          > strong,
          > span {
            display: block;
          }

          > strong {
            height: 18px;
            line-height: 18px;
            font-size: 16px;
          }

          > span {
            height: 16px;
            line-height: 16px;
            font-size: 12px;
          }
        }
      }

      > .c {
        position: relative;
        height: 100%;
        padding-left: 20px;
        padding-right: 20px;
        border-radius: 0 0 3px 3px;
        background-color: rgb(255, 255, 255);

        > .l {
          padding-top: 5px;

          .p {
            position: relative;
            height: 26px;
            line-height: 26px;
            padding-left: 18px;
            .text-overflow();
            color: #565656;

            > i.icon {
              position: absolute;
              left: -4px;
              top: 0;
              color: #a8b8c7;
              font-size: 20px;
            }
          }

          > .m {
            height: 22px;
            line-height: 22px;
            font-size: 12px;
            color: #999;
            .text-overflow();
            > span {
              margin-left: 5px;
              margin-right: 5px;
            }
          }
        }

        > .r {
          position: absolute;
          right: 0;
          top: 0;
          width: 190px;
          height: 100%;

          > .a {
            height: 27px;
            color: #FF0000;
            text-align: right;
            font-weight: bold;
            padding-right: 20px;
          }
          > .b {
            position: relative;
            text-align: right;
            padding-right: 20px;

            > span,
            > em {
              display: inline-block;
              height: 24px;
              line-height: 24px;
              font-weight: bold;
            }

            > span {
              color: #0babb9;

              &.cash-on-delivery {
                position: absolute;
                left: 0px;
                top: -20px;
                width: 93px;
                height: 54px;
                font-size: 0;
                background-repeat: no-repeat;
                background-image: url(~@/common/images/pos/takeout/cash-on-delivery.png);
              }
              &.cash-on-delivery-en {
                position: absolute;
                left: 0px;
                top: -20px;
                width: 113px;
                height: 54px;
                font-size: 0;
                background-repeat: no-repeat;
                background-image: url(~@/common/images/pos/takeout/cash-on-delivery_en.png);
              }
              &.cash-on-delivery-f {
                position: absolute;
                left: 0px;
                top: -20px;
                width: 93px;
                height: 54px;
                font-size: 0;
                background-repeat: no-repeat;
                background-image: url(~@/common/images/pos/takeout/cash-on-delivery_f.png);
              }
            }

            > em {
              padding-left: 10px;
              padding-right: 10px;
              border-radius: 12px;
              background-color: #c8c8c8;
              color: @white;
              font-style: normal;
              margin-left: 10px;

              &.new {
                background-color: #5bb85d;
              }

              &.wait-make {
                background-color: #3f77ce;
              }

              &.making {
              background-color: #53b1e1;
              }

              &.wait-delivery {
                background-color: #f0b017;
              }

              &.delivering {
                background-color: #b54bdc;
              }

              &.done {
                background-color: #5bb85d;
              }

              &.error {
                background-color: #eb6d6d;
              }
            }
          }
        }
      }

      &.active {
        border-color: #0babb9;
        .box-shadow(0 0 8px #bacded);

        > .t {
          background-color: #0babb9;
          color: @white;
          > .rider {
            background: rgb(5,148,161);
          }
        }

        > .c {
          background-color: white;

          > .l .p,
          > .l .p > i.icon,
          > .l .m,
          > .r > .b > span {
            color: #0babb9;
          }
        }

        &:hover {
          > .t {
            background-color: #06bdce;
          }
        }
      }
    }
  }

  .pos-takeout-no-orderlist {
    position: relative;
    background-color: rgba(255, 255, 255, 0.6);
    .square(100%);

    .no-order {
      position: absolute;
      top: 40%;
      left: 50%;
      transform: translate(-50%, -50%);

      > li {
        text-align: center;
        color: #9dc1ca;

        > i {
          font-size: 124px;
          color: #9dc1ca;
        }

        > strong {
          font-weight: normal;
          font-size: 22px;
        }
      }
    }
  }
</style>
