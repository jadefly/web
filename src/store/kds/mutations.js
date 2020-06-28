import Vue from 'vue';
import {
  extend, without, each,
} from 'lodash';
import * as types from './mutation-types';

const mutations = {
  [types.SET_MODE](state, mode) {
    state.mode = mode;
  },
  [types.SET_TIME](state, time) {
    state.time = time;
  },
  [types.SET_USERNAME](state, userName) {
    state.userName = userName;
  },
  [types.SET_APIPATH](state, path) {
    state.apiPath = path;
  },
  [types.SET_CONFIG](state, config) {
    state.config = extend(state.config, config);
  },
  [types.UPDATE_KEYBOARDSYSHABIT](state, data) {
    state.config.kitchenKeyBoardSysHabit = extend(state.config.kitchenKeyBoardSysHabit, data);
  },
  [types.SET_FILTER](state, options) {
    state.filter = options;
  },
  [types.SET_REMIND_CONFIG](state, options) {
    state.remindConfig = options;
  },
  [types.SET_AREAS](state, areas) {
    state.areas = areas;
  },
  [types.SET_TABLETYPES](state, tableTypes) {
    state.tableTypes = tableTypes;
  },
  [types.SET_BIGCLASSES](state, classes) {
    state.bigClasses = classes;
  },
  [types.SET_SMALLCLASSES](state, classes) {
    state.smallClasses = classes;
  },
  [types.SET_EXISTINGDISHES](state, dishes) {
    state.existingDishes = dishes;
  },
  [types.SET_EXISTINGTABLES](state, tables) {
    state.existingTables = tables;
  },
  [types.READY_TO_SERVER](state, { kscIds, type }) {
    each(kscIds, (id) => {
      state.dishes[id].kitchenFlg = type;
    });
  },
  [types.SET_DISHES](state, dishes) {
    const config = state.config.isNotDisplayOnPassScreen;// 获取设置
    each(dishes, (dish) => {
      // 开启设置：叫起的菜品不显示在传菜屏上则过滤掉
      if (config && state.mode === '1') { // 开启设置 并且是传菜
        if (dish.callUpTime) { // 非叫起菜品显示
          Vue.set(state.dishes, dish.kscId, dish);
        }
      } else { // 其他情况，显示菜品
        Vue.set(state.dishes, dish.kscId, dish);
      }
    });
  },
  [types.DELETE_DISHES](state, list) {
    each(list, (item) => {
      if (state.dishes[item.kscId]) {
        Vue.delete(state.dishes, item.kscId);
      }
    });
  },
  [types.CANCEL_ORDER](state, list) {
    each(list, (item) => {
      if (state.dishes[item.kcKscId]) {
        Vue.set(state.dishes[item.kcKscId], 'lastQty', item.lastQty);
        Vue.set(state.dishes[item.kcKscId], 'coUnknowQty', item.coUnknowQty);
      }
    });
  },
  [types.CHANGE_HASTEN](state, list) {
    each(list, (item) => {
      if (state.dishes[item.kscId]) {
        Vue.set(state.dishes[item.kscId], 'hastenFlg', 1);
      }
    });
  },
  [types.UPDATE_PEOPLEQTY](state, list) {
    each(list, (item) => {
      if (state.dishes[item.kscId]) {
        Vue.set(state.dishes[item.kscId], 'peopleQty', item.peopleQty);
      }
    });
  },
  [types.CHANGE_TABLE](state, list) {
    each(list, (item) => {
      if (state.dishes[item.kscId]) {
        const dish = state.dishes[item.kscId];
        Vue.set(dish, 'pointAreaId', item.pointAreaId);
        Vue.set(dish, 'pointCode', item.pointCode);
        Vue.set(dish, 'pointId', item.pointId);
        Vue.set(dish, 'pointName', item.pointName);
        Vue.set(dish, 'pointPinyin', item.pointPinyin);
        Vue.set(dish, 'sourcePointName', item.sourcePointName);
      }
    });
  },
  [types.CHANGE_KITCHENFLG](state, list) {
    each(list, (item) => {
      if (state.dishes[item.kscId]) {
        Vue.set(state.dishes[item.kscId], 'kitchenFlg', item.kitchenFlg);
      } else {
        Vue.set(state.dishes, item.kscId, item);
      }
    });
  },
  [types.CHANGE_DISCFLG](state, list) {
    each(list, (item) => {
      if (state.dishes[item.kscId]) {
        Vue.delete(state.dishes, item.kscId);
        Vue.set(state.dishes, item.kscId, item);
      }
    });
  },
  [types.CHANGE_LASTQTY](state, list) {
    each(list, (item) => {
      if (state.dishes[item.kscId]) {
        Vue.set(state.dishes[item.kscId], 'lastQty', item.lastQty);
      }
    });
  },
  [types.SET_SCREEN_ACTION](state, kscIds) {
    state.screenAction = kscIds;
  },
  [types.UPDATE_CHECKED](state, { check, unCheck }) {
    if (unCheck && unCheck.length) {
      state.checkedArr = without(state.checkedArr, ...unCheck);
    }
    if (check && check.length) {
      state.checkedArr.push(...check);
    }
  },
  [types.CLEAR_CHECKED](state) {
    state.checkedArr = [];
  },
};
export default mutations;
