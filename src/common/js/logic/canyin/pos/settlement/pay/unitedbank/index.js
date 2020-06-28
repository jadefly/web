import * as settle from './settle'; // 通联pos支付
import * as unsettle from './unsettle'; // 通联pos删除个人支付
import * as unsettleteam from './unsettleteam'; // 通联pos删除团队支付
import * as settlecheck from './settlecheck'; // 通联pos手动确认
import * as settleforce from './settleforce'; // 通联pos强制结算

export default {
  settle,
  settleforce,
  settlecheck,
  unsettle,
  unsettleteam,
};
