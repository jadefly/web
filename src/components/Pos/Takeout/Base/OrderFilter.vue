<template>
  <div :id="filterId" class="order-filter-wrapper">
    <div class="filter-btn">
      <button type="button" class="btn"
        :class="{'riderFilter':posTakeout.isNewTakeoutPhoneOrder}"
        @click="selectTab(0)">{{ sourceTitle }}<i class="icon icon-arr-down"></i>
      </button>
      <button type="button" class="btn"
        :class="{'riderFilter':posTakeout.isNewTakeoutPhoneOrder}"
        @click="selectTab(1)">{{ stateTitle }}<i class="icon icon-arr-down"></i>
      </button>
      <button type="button" class="btn"
        :class="{'riderFilter':posTakeout.isNewTakeoutPhoneOrder}"
        @click="selectTab(2)">{{ payTypeTitle }}<i class="icon icon-arr-down"></i>
      </button>
      <button type="button" class="btn"
        :class="{'riderFilter':posTakeout.isNewTakeoutPhoneOrder}"
        @click="selectTab(3)">{{$t('Dict.Sort')}}{{ sortTitle }}<i class="icon icon-arr-down"></i>
      </button>
      <button type="button" class="btn riderFilter"
        v-if="posTakeout.isNewTakeoutPhoneOrder"
        @click="selectTab(4)">{{courierTitle}}<i class="icon icon-arr-down"></i>
      </button>
    </div>
    <div class="filter-content">
      <transition name="slide-fade">
        <ul v-if="tabIndex === 0">
          <li :key="index" v-for="(item, index) in orderSource" @click="selectSource(item, index)" :class="{ active: sourceIndex === index }">
            {{ item.name }}
          </li>
        </ul>
        <ul v-if="tabIndex === 1">
          <li :key="index" v-for="(item, index) in orderState" @click="selectState(item, index)" :class="{ active: stateIndex === index }">
            {{ item.name }}
          </li>
          <transition name="dev-slide-fade">
            <ul v-if="stateIndex === 1">
              <li :key="index" v-for="(item, index) in haveOrder" @click="selectOrderedState(item, index)" :class="{ active: hasOrderIndex === index }">
                {{ item.name }}
              </li>
            </ul>
            <ul v-if="stateIndex === 2">
              <li :key="index" v-for="(item, index) in haveCancel" @click="selectCanceledState(item, index)" :class="{ active: hasCancelIndex === index }">
                {{ item.name }}
              </li>
            </ul>
          </transition>
        </ul>
        <ul v-if="tabIndex === 2">
          <li :key="index" v-for="(item, index) in orderPayType" @click="selectPayType(item, index)" :class="{ active: payTypeIndex === index }">
            {{ item.name }}
          </li>
        </ul>
        <ul v-if="tabIndex === 3">
          <li :key="index" v-for="(item, index) in orderSort" @click="selectSort(item, index)" :class="{ active: sortIndex === index }">
            {{ item.name }}
          </li>
        </ul>
        <ul v-if="tabIndex === 4">
          <li :key="index" v-for="(item, index) in courierList" @click="selectCourier(item, index)" :class="{ active: courierIndex === index }">
            {{ item.name }}
          </li>
        </ul>
      </transition>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { excluded } from '@/common/js/dom';
import { ERR_OK } from '@/common/api/takeoutConfig';
import ajax from '@/common/js/ajax';

export default {
  props: {
    filterId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      tabIndex: -1,
      sourceIndex: -1,
      stateIndex: -1,
      hasOrderIndex: -1,
      hasCancelIndex: -1,
      payTypeIndex: -1,
      sortIndex: -1,
      courierIndex: -1,
      sourceTitle: this.$t('Dict.AllSources'),
      stateTitle: this.$t('Dict.AllStates'),
      payTypeTitle: this.$t('Dict.AllPaymentTypes'),
      sortTitle: this.$t('Biz.Pos.Takeout.TakeoutMsg037'),
      courierTitle: this.$t('Dict.AllRiders'),
      // 来源
      orderSource: [{
        name: this.$t('Dict.All'),
        id: -1,
      }, {
        name: this.$t('Dict.WeChat'),
        id: 3,
      }, {
        name: this.$t('Dict.Baidu'),
        id: 7,
      }, {
        name: this.$t('Dict.CanDao'),
        id: 9,
      }, {
        name: this.$t('Dict.AmericanRegiment'),
        id: 11,
      }, {
        name: this.$t('Dict.Eleme'),
        id: 13,
      }, {
        name: this.$t('Dict.YouZan'),
        id: 16,
      }],
      // 状态
      orderState: [{
        name: this.$t('Dict.All'),
        id: -1,
      }, {
        name: this.$t('Dict.ReceivedOrders'),
        id: 1,
      }, {
        name: this.$t('Dict.Cancelled'),
        id: 3,
      }, {
        name: this.$t('Dict.UnrecordedList'),
        id: 0,
      }],
      // 状态：已接单
      haveOrder: [{
        name: this.$t('Dict.ToBeMade'),
        id: 1,
      }, {
        name: this.$t('Dict.ToBeDelivered'),
        id: 3,
      }, {
        name: this.$t('Dict.Distribution'),
        id: 6,
      }, {
        name: this.$t('Dict.Delivered'),
        id: 7,
      }],
      // 状态：已取消
      haveCancel: [{
        name: this.$t('Biz.Pos.Takeout.TakeoutMsg038'),
        id: 1,
      }, {
        name: this.$t('Biz.Pos.Takeout.TakeoutMsg039'),
        id: 3,
      }, {
        name: this.$t('Biz.Pos.Takeout.TakeoutMsg040'),
        id: 6,
      }, {
        name: this.$t('Biz.Pos.Takeout.TakeoutMsg041'),
        id: 2,
      }, {
        name: this.$t('Dict.PlatformCancellation'),
        id: 4,
      }],
      // 支付类型
      orderPayType: [{
        name: this.$t('Dict.All'),
        id: -1,
      }, {
        name: this.$t('Dict.OnlinePayment'),
        id: 1,
      }, {
        name: this.$t('Dict.CashOnDelivery'),
        id: 2,
      }],
      // 排序
      orderSort: [{
        name: this.$t('Biz.Pos.Takeout.TakeoutMsg037'),
        id: 1,
        orderBy: 'DESC',
      }, {
        name: this.$t('Biz.Pos.Takeout.TakeoutMsg042'),
        id: 1,
        orderBy: 'ASC',
      }, {
        name: this.$t('Biz.Pos.Takeout.TakeoutMsg043'),
        id: 2,
        orderBy: 'DESC',
      }, {
        name: this.$t('Biz.Pos.Takeout.TakeoutMsg044'),
        id: 2,
        orderBy: 'ASC',
      }],
      // 骑手
      courierList: [{
        name: this.$t('Dict.All'),
        id: 0,
      }],
    };
  },
  created() {
    this.getOrderSource();
    this.getRiderListData();
  },
  mounted() {
    window.addEventListener('click', (event) => {
      this.globalClick(event);
    });
  },
  computed: {
    ...mapGetters(['posTakeout']),
  },
  methods: {
    // 查询全部骑手
    getRiderListData() {
      ajax('canyin.takeout.takeoutdistriset.selectridelist')
        .then((res) => {
          if (res.data.code === ERR_OK) {
            const { data } = res.data;
            this.courierList = [{
              name: this.$t('Dict.All'),
              id: 0,
            }];
            this.courierList = this.courierList.concat(data.riderList);
          } else {
            this.$message.error(res.data.msg);
          }
        }).catch((err) => {
          this.$message.error(err);
        });
    },
    // 获取外卖来源信息列表
    getOrderSource() {
      ajax('canyin.takeout.takeoutview.queryfrom').then((res) => {
        if (res.data.code === ERR_OK) {
          this.orderSource = res.data.data.fromList;
          this.orderSource.unshift({
            name: this.$t('Dict.All'),
            id: -1,
          });
        } else {
          this.$message.error(res.data.msg);
        }
      });
    },
    // 判断点击焦点
    globalClick(event) {
      excluded(event.target, `#${this.filterId}`, () => {
        this.tabIndex = -1;
      });
    },
    selectTab(index) {
      this.tabIndex = index;
    },
    // 选择来源
    selectSource(item, index) {
      this.sourceIndex = index;
      this.tabIndex = -1; // 关闭筛选框
      if (item.id === -1) {
        this.sourceTitle = this.$t('Dict.AllSources');
      } else {
        this.sourceTitle = item.name;
      }
      this.$emit('searchSource', item.id);
    },
    // 选择状态
    selectState(item, index) {
      this.stateIndex = index;
      switch (item.id) {
        case -1: // 点击全部
          this.stateTitle = this.$t('Dict.AllStates');
          this.tabIndex = -1; // 关闭筛选框
          this.hasOrderIndex = -1; // 取消已接单里选中的状态
          this.hasCancelIndex = -1; // 取消已取消里选中的状态
          this.$emit('searchState', item.id);
          break;
        case 0: // 点击未录单
          this.stateTitle = item.name;
          this.tabIndex = -1;
          this.hasOrderIndex = -1;
          this.hasCancelIndex = -1;
          this.$emit('searchRecordBs', item.id);
          break;
        default: // 已接单和已取消，二级子状态筛选
          this.stateTitle = item.name;
          this.hasOrderIndex = -1;
          this.hasCancelIndex = -1;
          this.$emit('searchState', item.id);
          break;
      }
    },
    // 选择已接单状态
    selectOrderedState(item, index) {
      this.hasOrderIndex = index;
      this.hasCancelIndex = -1;
      this.tabIndex = -1;
      this.stateTitle = item.name;
      this.$emit('searchOrderedState', item.id);
    },
    // 选择已取消状态
    selectCanceledState(item, index) {
      this.hasCancelIndex = index;
      this.hasOrderIndex = -1;
      this.tabIndex = -1;
      this.stateTitle = item.name;
      this.$emit('searchCanceledState', item.id);
    },
    // 选择支付类型
    selectPayType(item, index) {
      this.payTypeIndex = index;
      this.tabIndex = -1;
      if (item.id === -1) {
        this.payTypeTitle = this.$t('Dict.AllPaymentTypes');
      } else {
        this.payTypeTitle = item.name;
      }
      this.$emit('searchPayType', item.id);
    },
    // 选择排序
    selectSort(item, index) {
      this.sortIndex = index;
      this.tabIndex = -1;
      this.sortTitle = item.name;
      this.$emit('searchSort', item.id, item.orderBy);
    },
    // 选择骑手
    selectCourier(item, index) {
      this.courierIndex = index;
      this.tabIndex = -1;
      this.courierTitle = item.name === this.$t('Dict.All') ? this.$t('Dict.AllRiders') : item.name;
      this.$emit('searchRider', item.mid);
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.order-filter-wrapper {
  position: relative;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.6);
  padding: 12px 24px 0 24px;
  .filter-btn {
    color: #273844;
    .clearfix();

    > button {
      float: left;
      width: 20%;
      border-right: 1px solid #aaa;
      border-radius: 0;
      background-color: #9dc1ca;
      padding-left: 5px;
      &:last-child {
        width: 40%;
        border-right: none;
      }
      &:hover {
        color: black;
        opacity: .9;
      }
    }

    > button.riderFilter {
      float: left;
      width: 15%;
      border-right: 1px solid #aaa;
      border-radius: 0;
      background-color: #9dc1ca;
      padding-left: 5px;
      &:nth-child(3) {
        width: 21%;
      }
      &:nth-child(4) {
        width: 34%;
      }
      &:last-child {
        border-right: none;
      }
      &:hover {
        color: black;
        opacity: .9;
      }
    }
  }

  .filter-content {
    > ul {
      position: absolute;
      top: 48px;
      left: 24px;
      right: 24px;
      z-index: 1;
      .clearfix();
      padding: 0 12px 12px 12px;
      background-color: rgba(46, 74, 89, 0.95);
      border: none;

      > ul {
        .clearfix();
        padding-top: 48px;
      }

      li {
        float: left;
        color: white;
        border: 1px solid #aaa;
        border-radius: 4px;
        padding: 6px 18px;
        margin-right: 6px;
        margin-top: 12px;
        cursor: pointer;
        &:hover {
          background-color: #0babb9;
        }
        &.active {
          background-color: #0babb9;
          color: white;
          &:hover {
            background-color: #0babb9;
          }
        }
      }
    }
  }
}

// 动画效果
.slide-fade-enter-active {
  transition: all 0.4s ease;
}
.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.dev-slide-fade-enter-active {
  transition: all 0.4s ease;
}
.dev-slide-fade-left-leave-active {
  transition: all 0.4s cubic-bezier(1, 0.5, 0.8, 1);
}
.dev-slide-fade-enter,
.dev-slide-fade-leave-to {
  transform: translateX(-10px);
  opacity: 0;
}
.lang-enUS{
  .order-filter-wrapper {
    font-size: 12px;
    .filter-btn {
      > button {
        font-size: 12px;
      }
      > button.riderFilter {
        font-size: 12px;
      }
    }
  }
}
</style>
