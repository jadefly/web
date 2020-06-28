import { includes } from 'lodash';
import State from './State';
import { PACKAGE, KITCHEN_NOT_ENABLE } from '../orderConfig';
import { serveDishesIsDone } from './StateServe';

// 按单外卖 eslint问题（无意义的eslint，无需修改，个人观点，现对个别 eslint 进行 disable）
export default class StatePackage extends State {
  /* eslint-disable class-methods-use-this */
  constructor(params) {
    super(params);
    this.currentState = PACKAGE;
    // websocket path
    this.websocketPath = 'packageordermodewebsocketserver';
    // 菜小完成
    this.dishesReadyURL = '';
    // 菜小取消
    this.dishesCancelURL = '';
    // 单大完成
    this.orderCompleteURL = 'kitchenpackagemode.updatewhencompletepackageorder';
    // 单大撤销
    this.orderRevokeURL = 'kitchenhis.updatewhencancelwholepackage';
    // 单小撤销
    this.revokeUrl = 'kitchenhis.getkitchenhispackagemode';
    // 单小撤销提交
    this.submitRevokeUrl = 'kitchenhis.updatewhencancelwholepackagebykckscids';
  }

  isShow() {
    const { kitchenMode, kitchenModeMap } = this;
    return kitchenMode !== kitchenModeMap[KITCHEN_NOT_ENABLE];
  }

  dishesIsShow(item) {
    return includes([0, 2, 4], item.orderFlg);
  }

  dishesIsDone(item) {
    return includes([3, 6, 7], item.kitchenFlg);
  }

  dishesIsPrevDone(item) {
    return serveDishesIsDone(item);
  }

  dishesCanEnables(item) {
    return !this.linkage ? true : item.kitchenFlg === 3;
  }

  dishesCanCancel(item) {
    return item.kitchenFlg === 6;
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
    return items.every(item => includes([3, 6, 7], item.kitchenFlg));
  }
}
