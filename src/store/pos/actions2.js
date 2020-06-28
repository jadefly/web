import * as types from './mutation-types';
import ajax from '@/common/js/ajax';

export default {
  getReception({ commit }, { list }) {
    commit(types.SET_RECEPTION_DATA, list); // 客位
  },
  getShowPos({ commit }, { list }) {
    commit(types.SET_SHOW_POS, list); // 是否显示选择Pos页
  },
  getShowLogin({ commit }, { list }) {
    commit(types.SET_SHOW_LOGIN, list); // 是否显示登录页
  },
  getShowKaiban({ commit }, { list }) {
    commit(types.SET_SHOW_KAIBAN, list); // 是否显示开班页
  },
  getIsLoginOrLogoutEnterKaiban({ commit }, { list }) {
    commit(types.SET_ISLOGINORLOGOUT_ENTERKAIBAN, list); // 进入开班页方式
  },
  getOrderBill({ commit }, { list }) {
    commit(types.SET_POS_ORDER_BILL, list); // 客位账单数据
  },
  setTableInfo({ commit }, data) {
    commit(types.SET_TABLES_AREAS, data.areas);
    commit(types.SET_TABLES_TYPES, data.types);
    commit(types.SET_TABLES, data.tables);
    commit(types.SET_POIONTS_LAST_MODIFY_TIOME, data.pointsLastModifyTime);
    commit(types.SET_POIONT_CONTENT_LAYOUT, data.pointContentLayout);
    commit(types.SET_TABLES_INDEX, data.tableIndexObject);
  },
  setPosSetting({ commit }, data) {
    commit(types.SET_POS_DEVICE, data.device);
    commit(types.SET_POS_SETTING, data.pos);
    commit(types.SET_OUT_DEVICE_SETTING, data.outDeviceSetting);
    commit(types.SET_BOOKING, data.booking);
    commit(types.SET_TAKEOUT, data.takeout);
  },
  getSettlementBillData({ commit }, { list }) {
    commit(types.SET_SETTLEMENT_BILL_DATA, list); // 结算账单信息
  },
  setSettleDiscType({ commit }, { list }) {
    commit(types.SET_SETTLE_DISCTYPE, list); // 结算页面添加的优惠类型数据
  },
  removeSettleDiscType({ commit }, { list }) {
    commit(types.REMOVE_SETTLE_DISCTYPE, list); // 结算页面移除的优惠类型数据
  },
  getReserveNotifyCount({ commit }) { // 得到预点通知数量
    ajax('canyin.pos.reserveorderbill.getreserveorderbyposid').then(({ count }) => {
      commit(types.SET_RESERVE_NOTIFY_COUNT, count);
    });
  },
  // 设置代金券数据
  setSelectVoucherData({ commit }, { list }) {
    commit(types.SET_SELECT_VOUCHER_DATA, list);
  },
  // 设置会员卡数据
  setSelectCrmData({ commit }, { list }) {
    commit(types.SET_SELECT_CRM_DATA, list);
  },
  // 快餐 设置执行验证会员方案(会员价和N杯打折)的状态参数对象
  setFastFoodMemberPlanFlg({ commit }, { data }) {
    commit(types.SET_FASTFOODMEMBERPLAN_FLG, data);
  },
  // 品相查询模式设置
  setSearchMode({ commit }, model) {
    commit(types.SET_SEARCH_MODE, model);
  },
  // 接收ws推送的数据 更新品项限量
  setPosItemsLimitNum({ commit }, list) {
    commit(types.SET_ITEMLIMITSMAP, list);
  },
  // 客位和加单页面的软键盘样式
  setDefaultKyeBoardType({ commit }, data) {
    commit(types.SET_DEFAULT_KEYBOARD_TYPE, data);
  },
};
