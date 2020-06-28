import { includes } from 'lodash';
import State from './State';
import {
  SERVE, COOK_AND_SERVE, ONLY_SERVE, ONLY_PACKAGE,
} from '../orderConfig';
import { cookDishesIsDone } from './StateCook';

export const serveDishesIsDone = item => includes([3, 4, 6], item.kitchenFlg);

// 按单传 eslint问题（无意义的eslint，无需修改，个人观点，现对个别 eslint 进行 disable）
export default class StateServe extends State {
  /* eslint-disable class-methods-use-this */
  constructor(params) {
    super(params);
    this.currentState = SERVE;
    // websocket path
    this.websocketPath = 'serveordermodewebsocketserver';
    // 菜小完成
    this.dishesReadyURL = 'kitchenservemode.updatewhendoreadytoserveorder';
    // 菜小取消
    this.dishesCancelURL = 'kitchenservemode.updatewhencancelreadytoserveorder';
    // 单大完成
    this.orderCompleteURL = 'kitchenservemode.updatewhencompleteserveorder';
    // 单大撤销
    this.orderRevokeURL = 'kitchenhis.updatewhencancelwholeserve';
    // 单小撤销
    this.revokeUrl = 'kitchenhis.getkitchenhisservemode';
    // 单小撤销提交
    this.submitRevokeUrl = 'kitchenhis.updatewhencancelwholeservebykckscids';
  }

  isShow() {
    const { kitchenMode, kitchenModeMap } = this;
    return includes([
      kitchenModeMap[COOK_AND_SERVE],
      kitchenModeMap[ONLY_SERVE],
      kitchenModeMap[ONLY_PACKAGE],
    ], kitchenMode);
  }

  dishesIsShow(item) {
    return includes([0, 2], item.orderFlg);
  }

  dishesIsDone(item) {
    return serveDishesIsDone(item);
  }

  dishesIsPrevDone(item) {
    return cookDishesIsDone(item);
  }

  dishesCanEnables(item) {
    return !this.linkage ? true : includes([2, 4, 9], item.kitchenFlg);
  }

  dishesCanCancel(item) {
    return includes([3, 6], item.kitchenFlg);
  }

  dishesState(item) {
    const { dishesStateList } = this;
    const dishesState = this.dishesStateMap[item.kitchenFlg];
    return dishesStateList[
      dishesState > dishesStateList.length - 1
        ? dishesStateList.length - 1
        : dishesState
    ];
  }

  orderIsShow(items) {
    return items.some(item => this.dishesIsShow(item));
  }

  orderCanDone(items) {
    if (!this.linkage) return true;
    return items.every(item => includes([2, 3, 4, 6, 9], item.kitchenFlg));
  }
}
