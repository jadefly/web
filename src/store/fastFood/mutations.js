import types from './mutation-types';
const mutations = {
  SetSaleActiveState(state, index) {
    state.saleActiveState = index;
  },
  setOrderCode(state, val) { // 设置牌号
    state.orderCode = val;
  },
  setPeopleQty(state, val) { // 设置人数
    state.peopleQty = val;
  },
  setIsContainKDS(state, val) { // 设置-加单中是否包含KDS方案品项
    state.isContainKDS = val;
  },
  setBuffetDeposit(state, val) { // 自助餐的押金金额
    state.buffetDeposit = val;
  },
  setHasDialog(state, val) {
    state.hasDailog = val;
  },
  setIsLimitOrSellout(state, val) {
    state.isLimitOrSellout = val;
  },
  [types.SET_BILLCURRENTITEM](state, val) { // 左侧当前选中项
    if ('current' in val) state.billCurrentElId = val.current; // 字符串
    if ('index' in val) {
      if (typeof val.index === 'number') {
        state.billCurrentIndex = val.index;
      } else if (Object.prototype.toString.call(val.index) === '[object Array]') {
        state.billCurrentIndex = val.index.length ? val.index[0] : -1;
      }
    }
  },
  [types.SET_BILLSELECTED](state, val) { // 设置-是否选中左侧品项 0 关闭 1 点击 2 切换-更换品项时
    state.billSelected = val;
  },
};
export default mutations;
