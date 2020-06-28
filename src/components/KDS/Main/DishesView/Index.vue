<template>
  <div
    class="kds-dishview"
    :class="practiceList.length < 1 ? 'practice-style-0' : 'practice-style-2'">
    <div class="top-filter">
      <!--做法选择列表-->
      <PracticeFilter
        ref="practiceFilter"
        :practiceList="practiceList"
        @choosePractice="choosePractice"
      ></PracticeFilter>
    </div>
    <div class="list-wrap">
      <ul class="list-wrap-ul" id="dishListWrap" ref="dishListWrap">
        <li
          v-for="(item) in dishesList"
          class="list-wrap-li"
          :key="item.key"
        >
          <DishItem
            :item="item">
          </DishItem>
        </li>
      </ul>
    </div>
    <div class="control">
      <div v-if="!configLimit" class="btn-wrap">
        <template v-if="!isShowNumberInput && checkedArr.length === 0">
          <el-button-group>
            <el-button
              type="default"
              v-if="!haveOneDish"
              @click="confirmPart"
            >{{ currentMode.confirmPartBtnText }}</el-button>
            <el-button
              type="primary"
              @click="confirmAll"
            >{{ currentMode.confirmAllBtnText }}</el-button>
          </el-button-group>
        </template>
        <template v-else>
          <input
            ref="kdsDishesViewInput"
            id="kdsDishesViewInput1"
            class="el-input"
            v-model="checkedNum"
          >
          <el-button-group>
            <el-button type="primary" @click="confirm">{{ currentMode.confirmBtnText }}</el-button>
            <el-button type="default" @click="cancel">取消</el-button>
          </el-button-group>
        </template>
      </div>
      <div v-else class="btn-wrap">
        <template>
          <el-button-group>
            <el-button
              type="primary"
              @click="confirmAll"
            >{{ currentMode.confirmAllBtnText }}</el-button>
          </el-button-group>
        </template>
      </div>
      <Pager
        pagerId="dishListWrap"
        scrollMode="simple"
        arrowDirection="up-down"
        class="pager"
        ref="dishListBtn"
      ></Pager>
    </div>
    <ChangeNum ref="changeNum"></ChangeNum>
  </div>
</template>

<script>
import {
  map, groupBy, each, first, sortBy,
} from 'lodash';
import { mapGetters, mapMutations } from 'vuex';
import { add, sub } from '@/common/js/math';
import Pager from '@/components/Pos/Common/Pager';
import PracticeFilter from './PracticeFilter';
import DishItem from './Item';
import ChangeNum from './ChangeNum';

export default {
  components: {
    Pager,
    PracticeFilter,
    DishItem,
    ChangeNum,
  },
  data() {
    return {
      isShowNumberInput: false,
      currentPractice: null, // 当前选中的做法
    };
  },
  created() {
    // 快捷键 Ctrl + 上下 翻页
    this.$von('turnPageUD', (key) => {
      if (key === 'up') {
        this.$refs.dishListBtn.prev();
      } else if (key === 'down') {
        this.$refs.dishListBtn.next();
      }
    });
    this.$von('openSelectNum', (data) => {
      this.$refs.changeNum.open(data);
    });
  },
  computed: {
    ...mapGetters('KDS', ['mode', 'dishes', 'screenAction', 'checkedArr', 'config', 'time']),
    currentMode() {
      if (this.mode === '0') {
        return {
          confirmAllBtnText: '全部配菜',
          confirmPartBtnText: '部分配菜',
          confirmBtnText: '配菜',
        };
      }
      return {
        confirmAllBtnText: '全部传菜',
        confirmPartBtnText: '部分传菜',
        confirmBtnText: '传菜',
      };
    },
    dishList() {
      return map(
        groupBy(
          map(
            this.screenAction,
            kscId => this.dishes[kscId],
          ),
          (item) => {
            const {
              scId,
              kitchenFlg,
            } = item;
            return [scId, kitchenFlg];
          },
        ),
        (list, key) => {
          const firstItem = first(list);
          let lastQty = 0;
          let coUnknowQty = 0;
          each(list, (item) => {
            lastQty = add(lastQty, item.lastQty);
            coUnknowQty = add(coUnknowQty, item.coUnknowQty);
          });
          const num = add(lastQty, coUnknowQty);
          const itemData = {
            itemName: firstItem.itemName,
            pkgItemName: firstItem.pkgItemName,
            tempItemName: firstItem.tempItemName,
            hastenFlg: firstItem.hastenFlg === 1,
            firstHastenTimeStamp: firstItem.firstHastenTimeStamp,
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
          return {
            key,
            list,
            itemData,
          };
        },
      );
    },
    // 所有做法（普通）
    practiceList() {
      const allMethodText = []; // 所有做法['清蒸','麻辣','红烧']
      const hashTable = new Map();
      const result = [];
      let score = 0;
      for (let i = 0; i < this.dishList.length; i += 1) {
        const dish = this.dishList[i].list[0];
        let arr = [];
        if (dish.methodText) {
          if (this.config.methodsFilter) {
            arr = dish.methodText.split(' | ');
          } else if (this.config.methodsGroup) {
            arr = [dish.methodText];
          }
          allMethodText.push(...arr);
        }
      }
      for (let j = 0; j < allMethodText.length; j += 1) {
        if (hashTable.has(allMethodText[j])) {
          result[hashTable.get(allMethodText[j])].num += 1;
        } else {
          hashTable.set(allMethodText[j], score);
          score += 1;
          result.push({
            name: allMethodText[j],
            num: 1,
          });
        }
      }
      return result;
    },
    filterDishList() {
      if (this.currentPractice && this.currentPractice.num) {
        return this.dishList.filter((item) => {
          const text = item.list[0].methodText;
          if (text) {
            return text.indexOf(this.currentPractice.name) > -1;
          }
          return false;
        });
      }
      return this.dishList;
    },
    dishesList() {
      return sortBy(map(this.filterDishList, (item) => {
        const { itemData } = item;
        const {
          callUpTimeTimeStamp, // 起菜时间
          createTimeForTimeStamp, // 点菜时间
          firstHastenTimeStamp, // 催菜时间
          hastenFlg, // 催菜
          kitchenFlg, // 厨房状态
          ssType, // 二次加单
          standardTime, // 标准制作时长
          warnTime, // 预警时长
        } = itemData;
        let isTimeout = false;
        let isWarn = false;
        if (kitchenFlg !== 0 && kitchenFlg !== 9) {
          const timer = this.time - callUpTimeTimeStamp;
          isTimeout = standardTime && timer > standardTime * 60 * 1000;
          isWarn = !isTimeout && warnTime && timer > warnTime * 60 * 1000;
        }
        return {
          ...item,
          isTimeout,
          isWarn,
          callUpTimeTimeStamp,
          createTimeForTimeStamp,
          firstHastenTimeStamp,
          hastenFlg,
          kitchenFlg,
          ssType,
        };
      }), this.mapSortHandler);
    },
    mapSortHandler() {
      const sortHandlerList = [];
      each(this.config.stateOrderList, (code) => {
        if (code === '001') {
          sortHandlerList.push(({ hastenFlg }) => !hastenFlg);
          sortHandlerList.push(({ firstHastenTimeStamp }) => firstHastenTimeStamp);
        }
        if (code === '002') {
          sortHandlerList.push(({ isTimeout }) => !isTimeout);
        }
        if (code === '003') {
          sortHandlerList.push(({ isWarn }) => !isWarn);
        }
        if (code === '004') {
          // Todo: 这个后台还没做，前台也做不了，等着吧
        }
        if (code === '005') {
          sortHandlerList.push(({ ssType }) => !ssType);
        }
      });
      sortHandlerList.push(({ kitchenFlg, callUpTimeTimeStamp, createTimeForTimeStamp }) => {
        if (kitchenFlg === 0 || kitchenFlg === 9) {
          return `1.${createTimeForTimeStamp}`;
        }
        return `0.${callUpTimeTimeStamp}`;
      });
      return sortHandlerList;
    },
    haveOneDish() {
      return this.filterDishList.length === 1 && this.filterDishList[0].list.length === 1;
    },
    checkedNum: {
      get() {
        if (this.checkedArr.length) {
          let lastQty = 0;
          let coUnknowQty = 0;
          each(this.checkedArr, (kscId) => {
            const dish = this.dishes[kscId];
            if (dish) {
              lastQty = add(lastQty, dish.lastQty);
              coUnknowQty = add(coUnknowQty, dish.coUnknowQty);
            }
          });
          return add(lastQty, coUnknowQty);
        }
        return 0;
      },
      set(val) {
        this.clearChecked();
        const check = [];
        let inputNum = val;
        let groupEnd = false;
        each(this.dishesList, (group) => {
          if (groupEnd) {
            return false;
          }
          each(group.list, (dish) => {
            if (inputNum < dish.lastQty) {
              groupEnd = true;
              return false;
            }
            if (dish.coUnknowQty !== 0) {
              return true;
            }
            check.push(dish.kscId);
            inputNum = sub(inputNum, dish.lastQty);
            return true;
          });
          return true;
        });
        this.updateChecked({ check });
      },
    },
    configLimit() {
      // 当传菜模式下开启了传菜准备功能，屏蔽部分传菜按钮
      return this.mode === '1' && this.config.readyToServe;
    },
  },
  watch: {
    dishList() {
      this.$nextTick(() => {
        this.refreshPager();
      });
    },
  },
  methods: {
    ...mapMutations('KDS', {
      updateChecked: 'UPDATE_CHECKED',
      clearChecked: 'CLEAR_CHECKED',
    }),
    choosePractice(practice) {
      this.currentPractice = practice;
    },
    refreshPager() {
      if (this.$refs.dishListBtn) {
        this.$refs.dishListBtn.pushRefresh();
      }
    },
    confirmPart() {
      this.isShowNumberInput = true;
      this.$nextTick(() => {
        this.$refs.kdsDishesViewInput.focus();
        this.$refs.kdsDishesViewInput.select();
      });
    },
    cancel() {
      this.isShowNumberInput = false;
      this.clearChecked();
    },
    confirm() {
      if (this.checkedArr.length) {
        this.$vemit('confirm', {
          kcKscIdList: this.checkedArr,
        });
      }
    },
    confirmAll() {
      const kscIds = [];
      each(this.dishesList, (group) => {
        each(group.list, (dish) => {
          if (dish.coUnknowQty === 0) {
            kscIds.push(dish.kscId);
          }
        });
      });
      if (kscIds.length) {
        this.$vemit('confirm', {
          kcKscIdList: kscIds,
        });
      }
    },
    // 修改传配菜数量
    selectNum(data = {}) {
      this.$refs[data.refs][0].checkedNum = data.num;
    },
  },
};
</script>
<style lang="less" scoped>
  .kds-dishview {
    position: relative;
    padding: 0 15px 60px 15px;
    height: 100%;
    background-color: #2A4163;
    &.practice-style-1 {
      padding: 45px 15px 60px;
    }
    &.practice-style-2 {
      padding: 90px 15px 60px;
    }
    .top-filter {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 90px;
      padding: 6px 15px;

      .select-wrap {
        position: relative;
        .select {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          padding: 0 15px;
          width: 200px;
          height: 40px;
          cursor: pointer;
          border-radius: 20px;
          color: #273844;
          background-color: #E1E3E5;
          > span {
            flex: 1;
            overflow: hidden;
            text-overflow:ellipsis;
            white-space: nowrap;
          }
        }
        .dish-practice {
          position: absolute;
          top: 48px;
          z-index: 999999;
          right: 0;
          padding: 9px;
          width: 245px;
          border-radius: 1px;
          box-shadow: 0 0 8px rgba(0, 0, 0, .5);
          color: #FFFFFF;
          background: #3d557a;
          &.hide {
            display: none;
          }
          .item-wrap {
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-around;
            .item {
              position: relative;
              margin: 4px;
              padding: 0 5px;
              width: 104px;
              height: 34px;
              cursor: pointer;
              text-align: center;
              line-height: 34px;
              border-radius: 3px;
              overflow: hidden;
              text-overflow:ellipsis;
              white-space: nowrap;
              border: 1px solid #959392;
            }
            .active {
              color: #ffffff;
              background-color: #16ABEC;
            }
          }
        }
      }
    }
    .list-wrap {
      height: 100%;

      .list-wrap-ul {
        height: 100%;
        overflow-y: auto;
        .list-wrap-li {
          margin-top: 5px;
          border-radius: 2px;
          background-color: white;
          .flex {
            display: flex;
            align-items: center;
          }
        }
      }
    }
    .control {
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 8px 140px 8px 15px;
      width: 100%;
      height: 60px;

      .btn-wrap {
        font-weight: bold;
        .el-button--primary {
          background-color: #749ddc;
          border-color: #749ddc;
        }
        .el-button--default {
          background-color: #1a3153;
          border-color: #ffffff;
          color: #ffffff;
        }
        .el-button-group {
          display: flex;

          .el-button {
            flex: 1;
          }
        }

        .el-input {
          float: left;
          width: 50%;
          height: 40px;
          border-radius: 3px;
          border: 1px solid #c8c8c8;
          padding: 0 5px;

          + .el-button-group {
            float: left;
            width: 50%;
          }
        }
      }

      .pager {
        position: absolute;
        right: 15px;
        top: 8px;
      }
    }
  }
</style>
<style lang="less">
  .kds-dishview{
    .control{
      .pos-pager{
        >span{
          color: #ffffff;
        }
        .pager-btn:disabled{
          background: #9ca7b7;
          i{
            color: #2a4163;
          }
        }
        .pager-btn{
          background: #749ddc;
          i{
            color: #ffffff;
          }
        }
      }
    }
  }
</style>
