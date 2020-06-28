import {
  each, map, differenceBy, keys, chunk,
} from 'lodash';
import * as types from './mutation-types';

export default {
  updateDishes({ commit, state }, newDishes) {
    const { dishes } = state;
    commit(types.DELETE_DISHES, differenceBy(keys(dishes), map(newDishes, 'kscId')));
    each(chunk(newDishes, 300), (item, index) => {
      setTimeout(() => {
        commit(types.SET_DISHES, item);
      }, index * 300);
    });
  },
  startTimer({ commit, rootGetters }) {
    const interval = Number(rootGetters.config.kdsTimeStepping) || 10;
    setInterval(() => {
      commit(types.SET_TIME, new Date());
    }, interval * 1000);
  },
  setBaseInfo({ commit }, data) {
    commit(types.SET_APIPATH, data.HTTP_CONTEXTPATH);
    commit(types.SET_USERNAME, data.username);
    commit(types.SET_CONFIG, {
      enable: data.isKitchenEnable === 1,
      barcodeScanner: data.DoOpenBarcodeScanner === '1',
      addOrderToTop: data.isAddOrderItemToTop === '1',
      autoClearKey: data.IsAutoClearKeyForKitchen === '1',
      onlyShowSmallClass: data.IsKitchenOnlyShowSmallClass === '1',
      dishesFixed: data.isItemFixedPosition === '1',
      tablesFixed: data.isPointFixedPosition === '1',
      readyToServe: data.isReadyToServeEnable === '1',
      timeoutToTop: data.isItemAutoToTopWhenOverTime === '1',
      methodsFilter: data.isEnableMethodFilter === '1',
      methodsGroup: data.isEnableMethodGroup === '1',
      countPrepareEmp: data.isCountPrepareEmp === '1',
      countCookEmp: data.isCountCookEmp === '1',
      countServeEmp: data.isCountServeEmp === '1',
      liandong: data.lianDong === '0', // 联动0 不联动1
      quickDoing: data.isEnablingOneKeyDish === '1',
      fixedKeyboard: data.isEnableFixedKeyboard === '1',
      leftCellNum: Number(data.leftCellNum),
      stateColorMap: { '001': 'BE1A1D', '002': 'FE2C23', '003': 'FF9900' },
      stateOrderList: ['001'],
      kitchenKeyBoardSysHabit: data.kitchenKeyBoardSysHabit,
    });
  },
  setKitchenInfo({ commit }, data) {
    commit(types.SET_CONFIG, {
      showPackageName: data.isNotShowPkgItemName === '1',
      limitModule: data.itemLimitEnable === true,
      selloutModule: data.itemSelloutEnable === true,
      isNotDisplayOnPassScreen: data.isNotDisplayOnPassScreen === '1',
      kitchenKeyBoardSysHabit: data.kitchenKeyBoardSysHabit,
    });
    commit(types.SET_FILTER, {
      dishes: data.itemIdList,
      areas: map(data.posHasAreaList, 'id'),
      smallClasses: data.smallClassIdList,
      saleTypes: map(data.posHasSaleTypes, saleType => Number(saleType.saleTypeId)),
    });
    commit(types.SET_REMIND_CONFIG, {
      timeout: {
        enable: data.isEnabledRemindItemTimeout === '1',
        times: parseInt(data.remindItemTimeoutTimes, 0),
        repeat: data.isRemindItemTimeoutRepeatPlay === '1',
        cycle: parseInt(data.remindItemTimeoutRepeatPlayCycle, 0),
      },
      hasten: {
        enable: data.isEnabledRemindItemUrging === '1',
        times: parseInt(data.enabledRemindItemUrgingTimes, 0),
        repeat: data.isEnabledRemindItemUrgingRepeatPlay === '1',
        cycle: parseInt(data.remindItemUrgingRepeatPlayCycle, 0),
      },
      serveDone: data.isEnabledRemindPassItemSuccess === '1',
    });
    commit(types.SET_AREAS, data.areaList);
    commit(types.SET_TABLETYPES, data.pointTypeList);
    commit(types.SET_BIGCLASSES, data.itemBigClasseList);
    commit(types.SET_SMALLCLASSES, data.itemSmallClasseList);
    commit(types.SET_EXISTINGDISHES, data.allExistingItemInfo || []);
    commit(types.SET_EXISTINGTABLES, data.allExistingPointInfo || []);
  },
  updateKitchenKeyBoardSysHabit({ commit }, data) {
    console.log('zzzzzzzzzzz', data);
    commit(types.UPDATE_KEYBOARDSYSHABIT, {
      ...data,
    });
  },
};
