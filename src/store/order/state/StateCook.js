import { includes } from 'lodash';
import State from './State';
import {
  COOK,
  COOK_AND_SERVE,
  ONLY_COOK,
  ONLY_PACKAGE,
} from '../orderConfig';

export const cookDishesIsDone = item => includes([2, 3, 4, 6], item.kitchenFlg);

// 按单配 eslint问题（无意义的eslint，无需修改，个人观点，现对个别 eslint 进行 disable）
export default class StateCook extends State {
  /* eslint-disable class-methods-use-this */
  constructor(params) {
    super(params);
    this.currentState = COOK;
    // websocket path
    this.websocketPath = 'cookordermodewebsocketserver';
    // 菜小完成
    this.dishesReadyURL = 'kitchencookmode.updatewhendoreadytocookorder';
    // 菜小取消
    this.dishesCancelURL = 'kitchencookmode.updatewhencancelreadytocookorder';
    // 单大完成
    this.orderCompleteURL = 'kitchencookmode.updatewhencompletecookorder';
    // 单大撤销
    this.orderRevokeURL = 'kitchenhis.updatewhencancelwholecook';
    // 单小撤销
    this.revokeUrl = 'kitchenhis.getkitchenhiscookmode';
    // 单小撤销提交
    this.submitRevokeUrl = 'kitchenhis.updatewhencancelwholecookbykckscids';
  }

  isShow() {
    const { kitchenMode, kitchenModeMap } = this;
    return includes([
      kitchenModeMap[COOK_AND_SERVE],
      kitchenModeMap[ONLY_COOK],
      kitchenModeMap[ONLY_PACKAGE],
    ], kitchenMode);
  }

  dishesIsShow(item) {
    return item.orderFlg === 0;
  }

  dishesIsDone(item) {
    return cookDishesIsDone(item);
  }

  dishesIsPrevDone() {
    return false;
  }

  dishesCanEnables() {
    return true;
  }

  dishesCanCancel(item) {
    // 仅配模式下与其他模式下处理的方式不同
    return this.kitchenMode === this.kitchenModeMap[ONLY_COOK]
      ? item.kitchenFlg === 3
      : item.kitchenFlg === 2;
  }

  dishesState(item) {
    const dishStateList = this.dishesStateList.slice(0, 2);
    const dishesState = this.dishesStateMap[item.kitchenFlg];
    return dishStateList[dishesState > dishStateList.length - 1
      ? dishStateList.length - 1
      : dishesState];
  }

  orderIsShow(items) {
    return items.some(item => this.dishesIsShow(item));
  }

  orderCanDone() {
    return true;
  }
}
