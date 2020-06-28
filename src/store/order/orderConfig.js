import i18n from "@/locales/index";
// 按单配菜
export const COOK = 'COOK';
// 按单传菜
export const SERVE = 'SERVE';
// 按单外卖
export const PACKAGE = 'PACKAGE';

// loginMode
// 按单配
export const COOK_BY_ORDER = 'COOK_BY_ORDER';
// 按单传
export const SERVE_BY_ORDER = 'SERVE_BY_ORDER';
// 按单外卖
export const PACKAGE_BY_ORDER = 'PACKAGE_BY_ORDER';
// loginMode
export const LOGIN_MODE_MAP = {
  [COOK_BY_ORDER]: 5,
  [SERVE_BY_ORDER]: 3,
  [PACKAGE_BY_ORDER]: 6,
};

// kitchenMode
// 未启用
export const KITCHEN_NOT_ENABLE = 'KITCHEN_NOT_ENABLE';
// 配+传
export const COOK_AND_SERVE = 'COOK_AND_SERVE';
// 仅配
export const ONLY_SERVE = 'ONLY_SERVE';
// 仅传
export const ONLY_COOK = 'ONLY_COOK';
// 仅外卖
export const ONLY_PACKAGE = 'ONLY_PACKAGE';
// kitchenMode模式
export const KITCHEN_MODE_MAP = {
  [KITCHEN_NOT_ENABLE]: 0,
  [COOK_AND_SERVE]: 1,
  [ONLY_SERVE]: 2,
  [ONLY_COOK]: 3,
  [ONLY_PACKAGE]: 4,
};

// 菜的状态
export const DISHES_STATE_LIST = [i18n.t('Biz.Store.StoreKey001'), i18n.t('Biz.Store.StoreKey002'), i18n.t('Biz.Store.StoreKey003')];
const COOKING_STATE = 0;
const COOKED_STATE = 1;
const SERVED_STATE = 2;
export const DISHES_STATE_MAP = {
  0: COOKING_STATE, 1: COOKING_STATE, 5: COOKING_STATE,
  2: COOKED_STATE, 4: COOKED_STATE, 9: COOKED_STATE,
  3: SERVED_STATE, 6: SERVED_STATE, 7: SERVED_STATE,
};

// 大按钮文字
export const DONE_BTN_TXT_MAP = { [COOK]: i18n.t('Dict.Garnish'), [SERVE]: i18n.t('Dict.PassDish'), [PACKAGE]: i18n.t('Biz.Store.StoreKey006') };
// 是否存在叫号功能
export const IS_CALLING_MAP = { [COOK]: false, [SERVE]: true, [PACKAGE]: true };
