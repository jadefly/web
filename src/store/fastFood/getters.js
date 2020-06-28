const getters = {
  saleTypeId: (state) => { // 当前激活的销售类型
    return state.saleActiveState + 1;
  },
  buffetDeposit: (state) => { // 自助餐押金
    return state.buffetDeposit;
  },
};

export default getters;
