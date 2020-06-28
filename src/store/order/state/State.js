import {
  IS_CALLING_MAP, DONE_BTN_TXT_MAP, DISHES_STATE_LIST, DISHES_STATE_MAP, KITCHEN_MODE_MAP,
} from '../orderConfig';

export default class State {
  constructor(params) {
    Object.keys({ mode: '', linkage: '', kitchenMode: '' }).forEach((k) => {
      if (params[k] === undefined) throw new Error(`(INIT_STATE ERROR) 必要参数:${k} 值为空`);
    });
    const { mode, linkage, kitchenMode } = params;
    // 是否联动
    this.linkage = linkage;
    // 当前pos模式
    this.kitchenMode = kitchenMode;
    // 是否存在叫号屏
    this.hasCalling = IS_CALLING_MAP[mode];
    // 大完成按钮显示的文字
    this.doneBtnTxt = DONE_BTN_TXT_MAP[mode];
    // 菜品状态
    this.dishesStateMap = DISHES_STATE_MAP;
    // 菜品状态列表
    this.dishesStateList = DISHES_STATE_LIST;
    // pos模式
    this.kitchenModeMap = KITCHEN_MODE_MAP;
  }
}
