import * as queryallonlinepaystate from './queryallonlinepaystate' // 查询线上支付状态
import * as printpresettlebill from './printpresettlebill' // 打印预结单
import * as teamprintpresettlebill from './teamprintpresettlebill' // 团队打印预结单
import * as prepay from './prepay' // 预付
import * as backprepay from './backprepay' // 撤销预付
import * as teamprepay from './teamprepay' // 预付
import * as teambackprepay from './teambackprepay' // 撤销预付
export default {
  queryallonlinepaystate,
  printpresettlebill,
  teamprintpresettlebill,
  prepay,
  backprepay,
  teamprepay,
  teambackprepay
}
