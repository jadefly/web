<template>
  <div
    class="kitchen-fastfood-region"
    :class="{
      'kitchen-fastfood-region-chose': regionChosed,
      'custom-screen-width': config.kdsCustomScreenWidth,
    }"
  >
    <div class="kitchen-fastfood-item">
      <div class="h eat" :class="regionType.class">
        <div class="i index" :class="regionType.class">{{ index + 1 }}</div>
        <div v-if="regionData.tableCode" class="ns" :class="{'ns-short':!(isServe && isPassVegetablesBeforeTableware && regionData.type === 1 && !showModal)}">
          <div class="label">{{ regionData.source }} {{ regionData.name }}</div>
          <div class="label">{{ regionData.labelName }} {{ regionData.tableCode }}</div>
        </div>
        <div v-else class="n" :class="regionType.class">
          <strong class="source">{{ regionData.source }}</strong>
          <span class="name">{{ regionData.name }}</span>
        </div>
        <div class="s">
          <p>
            <i class="iconfont-kds icon-kds-user"></i>
            <span class="people">{{ regionData.people }}</span>
          </p>
          <p>
            <i class="iconfont-kds icon-cai"></i>
            <span class="number">{{ regionData.num }}</span>
          </p>
        </div>
        <!--  将整单备注的显示挪到品项做法上，取消该处的显示 bugfix97128 by L.R -->
        <!-- <div class="r" v-if="regionData.remark">
          {{ regionData.remark }}
        </div> -->
        <div class="t"><span></span> <strong class="type">{{ regionType.name }}</strong></div>
        <div class="t revoke">
          <el-button
            v-if="isServe && isPassVegetablesBeforeTableware && regionData.type === 1 && !showModal"
            type="danger"
            @click="tableware(regionData, 0)">
            <img src="@/components/KDS/images/tableware.png" />
            {{$t('Dict.Revoke')}}
          </el-button>
        </div>
      </div>
      <ul class="l" :class="'size' + size">
        <li
          v-for="(item, index) in regionData.items"
          :key="item.id"
          :class="{
            dishedChosed: regionChosed && (currentDishes === index),
            dishesOverStandardTime: getIsOverStandardTime(item),
            dishesOverWarnTime: getIsOverWarnTime(item)
          }"
        >
          <DishesItem
            :dishesData="item"
            :getIsDone="getIsDone"
            :dishesChosed="regionChosed && (currentDishes === index)"
            :isOverStandardTime="getIsOverStandardTime(item)"
            :isOverWarnTime="getIsOverWarnTime(item)"
          ></DishesItem>
        </li>
      </ul>
      <div class="f">
        <div class="c">
          <i class="iconfont-kds icon-shijian"></i>
          <span class="timer">{{ regionTime }}</span>
        </div>
        <div class="p" v-if="regionData.platState">
          <span v-html="$t('Biz.KDS.TakeoutOrderRemind')"></span>
        </div>
        <div class="b">
          <button
            :disabled="!allowCall"
            type="button"
            class="btn-call"
            :class="{disabled: !allowCall}"
            v-if="currentMode.hasCalling"
            @click="call"
          >{{ $t('Biz.KDS.CallNumber') }}</button>
          <button
            :disabled="!allowHandle"
            type="button"
            class="btn-confirm"
            :class="{disabled: !allowHandle}"
            @click="confirm"
          >{{ this.currentMode.doneBtnTxt }}</button>
        </div>
      </div>
    </div>
    <RegionItemModal
      v-if="isServe && isPassVegetablesBeforeTableware && regionData.type === 1 && showModal"
      :regionData="regionData"
      @tableware="tableware"
    ></RegionItemModal>
  </div>
</template>

<script>
import {
  map,
  flatten,
} from 'lodash';
import { mapState, mapGetters } from 'vuex';
import dateFormat from '@/common/js/dateformat';
import ajax from '@/common/js/ajax';
import DishesItem from '@/components/KDS/components/DishesItem';
import RegionItemModal from '@/components/KDS/components/RegionItemModal';

export default {
  components: {
    DishesItem,
    RegionItemModal,
  },
  props: {
    regionData: {
      type: Object,
      default: null,
    },
    index: {
      type: Number,
      default: 0,
    },
    size: {
      type: Number,
      default: 1,
    },
    now: {
      type: Number,
      required: true,
    },
    regionChosed: {
      type: Boolean,
      default: false,
    },
    currentDishes: {
      type: Number,
      default: 0,
    },
    doOpenBarcodeScanner: {
      type: Boolean,
      default: true,
    },
    // 传菜前是否上餐具
    isPassVegetablesBeforeTableware: {
      type: Boolean,
      default: false,
    },
    // 只有传菜模式才显示上餐具
    isServe: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState('order', ['currentMode']),
    ...mapGetters(['config']),
    allowCall() {
      return this.regionData.items.find(item => this.currentMode.dishesIsPrevDone(item));
    },
    allowHandle() {
      return this.currentMode.orderCanDone(this.regionData.items);
    },
    regionType() {
      const { type } = this.regionData;
      switch (type) {
        case 1:
          return {
            name: this.$t('Dict.SaleType.ForHere'),
            class: 'eat',
          };
        case 2:
          return {
            name: this.$t('Dict.SaleType.TakeAway'),
            class: 'pack',
          };
        case 3:
          return {
            name: this.$t('Dict.SaleType.TakeOut'),
            class: 'takeout',
          };
        case 4:
          return {
            name: this.$t('Dict.SaleType.SelfTake'),
            class: 'ziti',
          };
        default:
          return {
            name: this.$t('Dict.UnknownType'),
            class: 'default',
          };
      }
    },
    regionTime() {
      const { time } = this.regionData;
      const offsetSecond = this.now - time;
      return dateFormat('%I:%S', offsetSecond);
    },
    showModal() {
      const { items } = this.regionData;
      return items.some(item => item.tablewareState === 0 || item.tablewareState === null);
    },
  },
  methods: {
    tableware(item, type) {
      if (!item) {
        console.warn('item is undefined');
        return;
      }
      ajax('canyin.kitchen.kitchenservemode.updatetablewarebeforecompleteserve', {
        contentType: 'json',
        data: {
          tablewareState: type,
          bsId: item.bsId,
          itemfilterId: this.$route.params.filterid,
        },
      }).then((res) => {
        console.log('xxxxxxxxx', res);
      });
    },
    setHotKey() {
      const hotkey = {};
      hotkey[this.index + 1] = this.confirm;
      hotkey[`${this.index + 1}.alt`] = this.call;
      this.$hotKey.set('KDS.fastFood.Resgion', hotkey);
    },
    // 判断是否小完成 by L.R
    getIsDone(item) {
      return this.currentMode.dishesIsDone(item);
    },
    // 判断是否超过预警时间 by L.R
    getIsOverWarnTime(item) {
      if (this.getIsDone(item)) return false;
      // 若存在加单时间，采用加单时间，否则使用当前的this.regionData.time(叫起时间)
      const calledTime = this.now - item.callUpTimeTimeStamp;
      // 预警： 叫起时间 > 预警时间(返回的单位是分钟) && 已开台时间 < 标准时间(返回的单位是分钟)
      return item.warnTime
        && (
          calledTime > item.warnTime * 60 * 1000
          && (
            item.standardTime
              ? calledTime <= item.standardTime * 60 * 1000
              : true
          )
        );
    },
    // 判断是否超过完成时间 by L.R
    getIsOverStandardTime(item) {
      if (this.getIsDone(item)) return false;
      const calledTime = this.now - item.callUpTimeTimeStamp;
      return item.standardTime && calledTime > item.standardTime * 60 * 1000;
    },
    // 完成
    confirm() {
      const { bsId, name, type } = this.regionData;
      const kscIdArr = flatten(map(this.regionData.items, 'kscIdArr'));
      this.$emit('confirm', bsId, kscIdArr, name, type === 3);
    },
    // 叫号
    call() {
      this.$emit('calling', this.regionData);
    },
  },
};
</script>
<style lang="less">
  .kitchen-fastfood-region {
    .el-button {
      display: flex;
      align-items: center;
      margin-top: 9px;
      img {
        width: 15px;
      }
    }
  }
</style>
<style lang="less" scoped>
.kitchen-fastfood-region {
  width: 100%;
  height: 100%;
  font-size: 14px;
}
.kitchen-fastfood-region-chose {
  // box-shadow: 0 0 20px #2BA0EA;
  outline: 3px solid #2BA0EA /*#e6c3aa*/;

  .dishedChosed {
    outline: 2px solid #ffffff;
    box-shadow: 0 0 10px #ffffff inset;
  }
}

.kitchen-fastfood-item {
  position: relative;
  height: 100%;
  padding-top: 60px;
  padding-bottom: 60px;
  background-color: #394551;
  color: white;

  .red {
    color: red;
  }

  .h {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 60px;
    background-color: #4b6886;
    border-bottom: 1px solid #242b33;

    &.eat {
      background-color: #4b6886;
    }

    &.pack {
      background-color: #684a86;
    }

    &.takeout {
      background-color: #86551b;
    }

    &.ziti {
      background-color: #62861a;
    }
  }

  .i {
    float: left;
    width: 24px;
    height: 60px;
    line-height: 60px;
    text-align: center;
    font-weight: bold;
    color: #bec3d9;
    background-color: #1d69d1;

    &.eat {
      background-color: #1d69d1;
    }

    &.pack {
      background-color: #701691;
    }

    &.takeout {
      background-color: #b73c0c;
    }
  }

  .n {
    float: left;
    width: 90px;
    height: 60px;
    background-color: #2faeff;
    border-radius: 0 30px 30px 0;
    margin-right: 10px;
    text-align: center;
    strong,
    span {
      display: block;
    }

    strong {
      height: 24px;
      line-height: 28px;
      font-weight: normal;
    }

    span {
      height: 28px;
      line-height: 28px;
      font-weight: bold;
      font-size: 20px;
      overflow: hidden;
      white-space: nowrap;
    }

    &.eat {
      background-color: #2faeff;
    }

    &.pack {
      background-color: #c14bb7;
    }

    &.takeout {
      background-color: #ff872f;
    }
  }
  .ns{
    .n;
    text-align: left;
    width: 130px;
    .label{
      font-size: 18px;
      font-weight: unset;
      width: 100%;
      display: block;
      white-space: nowrap;
      text-overflow: ellipsis;
      text-align: left;
      overflow: hidden;
    }
  }
  .ns-short{
    .ns;
    width: 160px;
    .label{
      width: 140px;
    }
  }
  .s {
    width: 40px;
    float: left;
    padding-top: 5px;
    padding-bottom: 5px;

    p {
      height: 21px;
      line-height: 20px;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
    }

    .iconfont-kds {
      margin-right: 5px;
      color: #aab1cb;
    }

    .icon-cai {
      font-size: 24px;
      margin-left: -5px;
      margin-right: 2px;
    }

    span {
      color: #bfc4da;
    }
  }

  .r {
    float: left;
    margin-left: 5px;
    width: 33.3%;
    word-break: break-all;
    overflow: hidden;
    height: 40px;
    line-height: 1.2;
    font-size: 18px;
    border-left: 1px solid #bfc4da;
    padding-left: 5px;
    margin-top: 10px;
    color: #e2e2e2;
  }

  .t {
    float: right;
    padding-right: 5px;
    height: 60px;
    line-height: 60px;
    font-size: 18px;

    span {
      font-weight: bold;
    }

    strong {
      margin-left: 8px;
    }
    &.revoke {
      button {
        width: 60px;
        padding: 10px 5px;
      }
      img {
        width: 15px;
      }
    }
  }
  .l {
    overflow: hidden;
    height: 100%;
    margin: 0;

    li {
      height: 50px;
      padding-left: 12px;
      padding-right: 12px;
      margin: 2px;

      &.done {
        background-color: #5bb95b;

        .item button {
          border: none;
          color: white;

          .iconfont-kds {
            display: inline-block;
          }
        }
      }
    }

    &.size4 > li {
      width: calc(50% - 4px);
      float: left;
    }

    &.size6 > li {
      width: calc(33.32% - 4px);
      float: left;
    }

    &.size8 > li {
      width: calc(25% - 4px);
      float: left;
    }

    &.size10 > li {
      width: calc(20% - 4px);
      float: left;
    }
  }

  .f {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 60px;
    border-top: 1px solid #1f262c;
    background-color: #2b2d3a;
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: 0;
  }

  .c {
    float: left;
    height: 40px;
    line-height: 40px;
    padding-left: 10px;

    .iconfont-kds {
      vertical-align: middle;
      margin-right: 5px;
      color: #bfc4da;
    }

    span {
      color: #bfc4da;
      vertical-align: middle;
      font-size: 20px;
    }
  }

  .p {
    float: left;
    padding-left: 10px;
    color: yellow;
  }

  .b {
    float: right;
    padding-right: 10px;

    .btn-call.disabled,
    .btn-confirm.disabled {
      background-color: #4E6781;
    }

    button {
      float: left;
      width: 64px;
      height: 40px;
      border: none;
      border-radius: 3px;
      color: white;
      margin-left: 12px;
      font-weight: bold;
      background-color: #394551;
      cursor: pointer;
      &.btn-call {
        background-color: #e89b2f;
      }

      &.btn-confirm {
        background-color: #5bb95b;
      }
    }
  }
}

.dishesOverStandardTime {
  background-color: #D14242;
}
.dishesOverWarnTime {
  background-color: #6B4148;
}
.lang-enUS{
  .b {
    button {
      width: auto;
    }
  }
}
</style>
