<template>
  <div
    class="li-body"
    :class="[timerFlg, checkedClass]"
  >
    <div class="li-body-info flex" @click="checkedBeforeChoose">
      <div
        class="checkbox"
      ></div>
      <div class="detail">
        <div class="top-wrap">
          <div class="top flex">
            <div class="number">{{ content }}</div>
            <div class="time-wrap flex">
              <div class="count-down">
                <i class="iconfont-kds icon-yongshi"></i>
                <span>{{ timer | kdstime }}</span>
              </div>
              <div class="time">
                <i class="iconfont-kds icon-shijian"></i>
                <span>{{ dish.createTimeForTimeStamp | dateFormat('%H:%I') }}</span>
              </div>
            </div>
            <div v-if="dishStatus" class="dish-status">{{ dishStatus }}</div>
            <div class="mark-wrap">
              <div v-if="dish.prepare" class="ready">备</div>
              <div v-if="dish.discFlg" class="gift">赠</div>
              <div v-if="dish.hastenFlg" class="hurry">催</div>
              <div v-if="dish.coUnknowQty > 0" class="back">退{{ dish.coUnknowQty }}</div>
              <div v-if="!dish.ssType" class="add">加</div>
            </div>
          </div>
          <div class="dish-name flex">
            <span class="bold">
              {{dish.itemName}}
              <span v-if="config.showPackageName && dish.pkgItemName">[{{dish.pkgItemName}}]</span>
            </span>
            <span class="name">
              <i class="icon icon-user margin-t"></i>
              {{ dish.operEmpName }}
            </span>
          </div>
        </div>
        <div class="mid">
          <span v-if="dish.methodText">{{ dish.methodText }}</span>
        </div>
        <div class="warn-tip">{{ dish.remark }}</div>
        <div v-if="dish.platState" class="no-operation">该订单已接单，请勿重复操作</div>
      </div>
    </div>
    <div ref="inputWrap" class="li-body-edit flex" @click="changeNum">
      <span><strong>{{ dish.num }}</strong>{{ dish.unitName }}</span>
      <template v-if="item.list.length > 1 && !configLimit">
        <i class="icon icon-edit margin-t"></i>
        <span
          v-if="checked.length && item.list.length > checked.length"
          class="bold"
        >已选：{{ checkedNum }}{{ dish.unitName }}</span>
      </template>
    </div>
    <div class="li-body-btn" @click="confirm">{{ confirmBtnText }}</div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import {
  first, each, map, filter, find,
} from 'lodash';
import ajax from '@/common/js/ajax';
import { add } from '@/common/js/math';
import dateFormatMixin from '@/common/js/dateFormatMixin';

export default {
  mixins: [dateFormatMixin],
  props: {
    item: Object,
    refs: String,
  },
  data() {
    return {
      showInput: false,
    };
  },
  filters: {
    kdstime(time) {
      const re = parseInt(time / 1000 / 60, 0);
      return `${re}分`;
    },
  },
  computed: {
    ...mapGetters('KDS', ['time', 'mode', 'checkedArr', 'config']),
    confirmBtnText() {
      if (this.mode === '0') {
        return '配菜';
      }
      return '传菜';
    },
    checked() {
      const checked = [];
      each(this.checkedArr, (kscId) => {
        if (find(this.item.list, { kscId })) {
          checked.push(kscId);
        }
      });
      return checked;
    },
    dish() {
      const { list } = this.item;
      const firstItem = first(list);
      let lastQty = 0;
      let coUnknowQty = 0;
      each(list, (item) => {
        lastQty = add(lastQty, item.lastQty);
        coUnknowQty = add(coUnknowQty, item.coUnknowQty);
      });
      const num = add(lastQty, coUnknowQty);
      const data = {
        kscId: firstItem.kscId,
        itemName: firstItem.itemName,
        pkgItemName: firstItem.pkgItemName,
        tempItemName: firstItem.tempItemName,
        hastenFlg: firstItem.hastenFlg === 1,
        callUpTimeTimeStamp: firstItem.callUpTimeTimeStamp,
        unitName: firstItem.unitName,
        sizeId: firstItem.sizeId,
        sizeName: firstItem.sizeName,
        pkgFlg: firstItem.pkgFlg === 1,
        methodText: firstItem.methodText,
        createTimeForTimeStamp: firstItem.createTimeForTimeStamp,
        standardTime: firstItem.standardTime,
        warnTime: firstItem.warnTime,
        pointName: firstItem.pointName,
        sourcePointName: firstItem.sourcePointName,
        remark: firstItem.remark,
        kitchenFlg: firstItem.kitchenFlg,
        orderFlg: firstItem.orderFlg,
        prepare: firstItem.kitchenFlg === 0 || firstItem.kitchenFlg === 9,
        discFlg: firstItem.discFlg === 1,
        orderCode: firstItem.orderCode || '未输入',
        pointAreaId: firstItem.pointAreaId,
        saleTypeId: firstItem.saleTypeId,
        deFromName: firstItem.deFromName,
        sn: firstItem.sn,
        ssType: firstItem.ssType === 1,
        platState: firstItem.platState === 1,
        operEmpName: firstItem.operEmpName,
        coUnknowQty,
        num,
      };
      return data;
    },
    content() {
      let str = '';
      if (this.item.itemData.pointAreaId === '9') {
        str = `${this.getSaleTypeText(this.item.itemData.saleTypeId)}：${this.item.itemData.orderCode}`;
      } else if (this.item.itemData.pointAreaId === '10') {
        str = `${this.item.itemData.deFromName}：${this.item.itemData.sn}`;
      } else if (this.item.itemData.sourcePointName) {
        str = `${this.item.itemData.sourcePointName}→${this.item.itemData.pointName}`;
      } else {
        str = this.item.itemData.pointName;
      }
      return str;
    },
    timer() {
      return this.time - this.item.itemData.callUpTimeTimeStamp;
    },
    timerFlg() {
      let opt = null;
      let style = '';
      if (this.item.isTimeout) {
        opt = this.config.stateColorMap['002'];
      }
      if (this.item.isWarn) {
        opt = this.config.stateColorMap['003'];
      }
      if (opt) {
        style += opt;
      }
      return style;
    },
    checkedClass() {
      if (this.checked.length === 0) {
        return '';
      }
      if (this.checked.length === this.item.list.length) {
        return 'check-all';
      }
      return 'check-part';
    },
    ignoreCoUnknowList() {
      return filter(this.item.list, item => item.coUnknowQty === 0);
    },
    checkedNum() {
      if (this.checked.length) {
        let lastQty = 0;
        let coUnknowQty = 0;
        each(this.checked, (kscId) => {
          const finded = find(this.item.list, { kscId });
          lastQty = add(lastQty, finded.lastQty);
          coUnknowQty = add(coUnknowQty, finded.coUnknowQty);
        });
        return add(lastQty, coUnknowQty);
      }
      return 0;
    },
    configLimit() {
      // 传菜模式下是否开启了传菜准备
      return this.mode === '1' && this.config.readyToServe;
    },
    dishStatus() {
      let str = null;
      // 不联动模式 并且已配菜 显示已配标识
      if (!this.config.liandong && this.dish.kitchenFlg === 2) {
        str = '已配';
      }
      return str;
    },
  },
  methods: {
    ...mapMutations('KDS', {
      updateChecked: 'UPDATE_CHECKED',
    }),
    getSaleTypeText(type) {
      if (type === 3) {
        return '外卖';
      }
      if (type === 2) {
        return '外带';
      }
      return '牌号';
    },
    async checkedBeforeChoose() {
      // 传菜模块开启了传菜准备
      if (this.configLimit) {
        if (this.item.itemData.kitchenFlg === 4) {
          await this.cancelToServer();
        } else {
          await this.readyToServer();
        }
      } else {
        this.choose();
      }
    },
    choose() {
      if (this.checked.length) {
        this.updateChecked({
          check: [],
          unCheck: map(this.item.list, 'kscId'),
        });
      } else {
        this.updateChecked({
          check: map(this.ignoreCoUnknowList, 'kscId'),
        });
      }
    },
    // 传菜
    confirm() {
      const kcKscIdList = this.checked.length ? this.checked : map(this.ignoreCoUnknowList, 'kscId');
      this.$vemit('confirm', {
        kcKscIdList,
      });
    },
    changeNum() {
      if (this.item.list.length > 1 && !this.configLimit) {
        this.$vemit('openSelectNum', {
          code: this.content,
          dish: this.item.itemData,
          list: this.item.list,
        });
      } else {
        this.checkedBeforeChoose();
      }
    },
    readyToServer() {
      if (this.ignoreCoUnknowList.length !== this.item.list.length) {
        this.$message.error('存在退菜未知，不能备菜');
        return false;
      }
      const list = this.getListByKey(this.item.list, 'kscId');
      return ajax('canyin.kitchen.kitchenservemode.updatewhendoreadytoserve', {
        contentType: 'json',
        data: {
          kcKscIdList: list,
        },
      });
    },
    cancelToServer() {
      const list = this.getListByKey(this.item.list, 'kscId');
      return ajax('canyin.kitchen.kitchenservemode.updatewhencancelreadytoserve', {
        contentType: 'json',
        data: {
          kcKscIdList: list,
        },
      });
    },
    getListByKey(arr, key) {
      const tmp = [];
      for (let i = 0; i < arr.length; i += 1) {
        if (arr[i][key]) {
          tmp.push(arr[i][key]);
        }
      }
      return tmp;
    },
  },
};
</script>
<style lang="less" scoped>
  @import "~@/common/less/kds-dish.less";
  .li-body {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 65px;
    cursor: pointer;
    > div {
      height: 100%;
    }
    .li-body-info {
      flex: 1;
      padding: 5px;
      .checkbox {
        position: relative;
        margin-right: 10px;
        width: 25px;
        height: 25px;
        border-radius: 50%;
        border: 1px solid #C9C9C9;
        background-color: #ffffff;
        &.check-all:before {
          position: absolute;
          left: 6px;
          top: 3px;
          content: '';
          width: 10px;
          height: 16px;
          border-style: solid;
          border-width: 0 5px 5px 0;
          border-color: #009933;
          transform: rotate(45deg);
        }
        &.check-part {
          background-color: #16ABEC;
        }
      }
      .detail {
        width: calc(100% - 40px);
        .top-wrap{
          display: flex;
          flex-direction: column;
          .top {
            > div {
              margin-right: 10px;
            }
            .number {
              font-size: 18px;
              color: #415675;
              font-weight: 600;
            }
            .count-down {
              margin-right: 10px;
              padding: 0 7px;
              min-width: 72px;
              border-radius: 15px;
              color: #ffffff;
              background-color: #749ddc;
            }
            .time {
              color: #666666;
            }
            .dish-status {
              width: 32px;
              height: 18px;
              line-height: 18px;
              text-align: center;
              border-radius: 4px;
              color: #ffffff;
              background-color: #6AB7FF;
            }
            .mark-wrap {
              display: flex;
              > div {
                display: flex;
                justify-content: center;
                align-items: center;
                margin-right: 2px;
                width: 18px;
                height: 18px;
                line-height: 18px;
                text-align: center;
                border-radius: 4px;
                font-size: 12px;
                color: #ffffff;
              }
              .ready {
                background-color: #FFB61C;
              }
              .gift {
                background-color: #34D6D8;
              }
              .hurry {
                background-color: #CC0DA6;
              }
              .back {
                width: auto;
                background-color: #00A2FF;
              }
              .add {
                background-color: #24AF6E;
              }
            }
          }
          .dish-name {
            .bold {
              font-weight: bold;
              word-break: break-all;
            }
            .name {
              display: flex;
              align-items: center;
              margin-left: 10px;
              /*color: #666666;*/
              > i {
                margin-bottom: 3px;
              }
            }
          }
        }
        .mid, .dish-name {
          width: calc(100% - 95px - 65px);
        }
      }
    }
    .li-body-edit {
      position: absolute;
      right: 65px;
      z-index: 100;
      height: 70%;
      justify-content: center;
      width: 90px;
      border-left: 1px dotted #D1D3D5;
      color: #325A8C;
      strong {
        font-size: 24px;
        font-weight: bold;
      }
      input {
        display: none;
        width: 40px;
        font-size: 18px;
        border-radius: 2px;
        color: #000;
      }
      .margin-t {
        margin-top: 7px;
      }
      /*
      .icon-edit {
        display: none;
      }
      */
      .bold {
        font-weight: bold;
      }
    }
    .li-body-btn {
      position: absolute;
      right: 0;
      width: 64px;
      height: 100%;
      padding: 0 23px;
      color: #ffffff;
      background-color: #749ddc;
      font-size: 18px;
      font-weight: 600;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    &.overtime {
      .li-body-btn {
        color: #ffffff;
        background-color: #E53434;
      }
      .li-body-info {
        color: #ffffff;
        .detail {
          .top {
            .number {
              color: #ffffff;
            }
            .time-wrap {
              .count-down {
                background-color: #E53434;
              }
              .time {
                color: #ffffff;
              }
            }
          }
        }
      }
      .li-body-edit {
        color: #ffffff;
      }
    }
    &.check-all {
      .li-body-info {
        .checkbox {
          &:before {
            position: absolute;
            left: 6px;
            top: 3px;
            content: '';
            width: 10px;
            height: 16px;
            border-style: solid;
            border-width: 0 5px 5px 0;
            border-color: #009933;
            transform: rotate(45deg);
          }
        }
      }
      .li-body-edit {
        input {
          display: inline-block;
        }
      }
    }
    &.check-part {
      .li-body-info {
        .checkbox {
          background-color: orange;
        }
      }
      .li-body-edit {
        input {
          display: inline-block;
        }
      }
    }
    /*
    &.check-all:hover, &.check-part:hover {
      .li-body-edit {
        .icon-edit {
          display: inline-block;
        }
      }
    }
    */
  }
  .flex {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }
  .warn {
    background-color: #fffbc9;
  }
  .timeout {
    color: #ffffff;
    background-color: #ff7979;
  }
</style>
<style lang="less">
  .tables-dish-view {
    .li-body {
      .li-body-info{
        .detail {
          .top-wrap{
            flex-direction: column-reverse;
            .dish-name {
              .bold {
                font-size: 18px;
                color: #2A54A3;
                font-weight: bold;
                word-break: break-all;
              }
            }
            .top {
              .number {
                color: #333333;
                font-size: 14px;
                font-weight: bold;
              }
            }
          }
        }
      }
    }
  }
</style>
