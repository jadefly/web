import * as M_TYPES from './mutation-types';
import { COOK, SERVE, PACKAGE } from './orderConfig';
import StateCook from './state/StateCook';
import StateServe from './state/StateServe';
import StatePackage from './state/StatePackage';
// import { Message } from 'element-ui';

// 按单配、传、外卖
export default {
  namespaced: true,
  state: {
    currentMode: null,
    remindConfig: null,
  },
  getters: {

  },
  mutations: {
    [M_TYPES.KITCHEN_INIT](state, params) {
      const modeMap = { [COOK]: StateCook, [SERVE]: StateServe, [PACKAGE]: StatePackage };
      state.currentMode = modeMap[params.mode];
      if (state.currentMode) {
        state.currentMode = new modeMap[params.mode](params);
      } else {
        throw new Error(`${params.mode}, 无此模式，请检查参数是否正确`);
      }
    },
    [M_TYPES.KITCHEN_REMINDCONFIG](state, data) {
      state.remindConfig = data;
    },
  },
};
