import * as readcard from './readcard'          // 读卡
import * as salecard from './salecard'          // 售卡
import * as paywaylist from './paywaylist'      // 充值支付方式
import * as charge from './charge'              // 充值
import * as undocharge from './undocharge'      // 撤销充值
import * as backcard from './backcard'          // 退卡
import * as consumelist from './consumelist'    // 查询CRM消费记录
import * as printconsume from './printconsume'  // 打印CRM消费记录
import * as tradequery from './tradequery'      // 交易查询
import * as printcrmconsumelist from './printcrmconsumelist'    // 卡消费记录打印
import * as crm6offworklist from './crm6offworklist'            // crm6结班单

export default {
  readcard,
  salecard,
  paywaylist,
  charge,
  undocharge,
  consumelist,
  printconsume,
  backcard,
  tradequery,
  printcrmconsumelist,
  crm6offworklist
}
