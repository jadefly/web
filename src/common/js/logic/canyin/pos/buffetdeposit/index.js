import * as queryshiftlist from './queryshiftlist'; // 市别列表
import * as querydepositdetail from './querydepositdetail'; // 查询押金列表
import * as confiscateDeposit from './confiscateDeposit'; // 罚没押金
import * as registdeposit from './registdeposit'; // 登记押金
import * as editdeposit from './editdeposit'; // 登记押金
import * as canceldeposit from './canceldeposit'; // 退押金
import * as querypointlistwithdeposit from './querypointlistwithdeposit'; // 查询客位列表
import * as depositwithpoint from './depositwithpoint'; // 关联客位
import * as initdepositrecord from './initdepositrecord'; // 初始化押金登记记录
import * as preregistdeposit from './preregistdeposit'; // 押金线上预支付
import * as depositscancodepay from './depositscancodepay'; // 登记押金扫码支付
import * as depositscancodecheckandsettle from './depositscancodecheckandsettle'; // 登记押金扫码手动确认
import * as depositscancodeenfore from './depositscancodeenfore'; // 登记押金扫码强制确认
import * as printbuffetdeposit from './printbuffetdeposit'; // 自助模式押金单打印

export default {
  queryshiftlist,
  querydepositdetail,
  confiscateDeposit,
  editdeposit,
  registdeposit,
  canceldeposit,
  querypointlistwithdeposit,
  depositwithpoint,
  initdepositrecord,
  preregistdeposit,
  depositscancodepay,
  depositscancodecheckandsettle,
  depositscancodeenfore,
  printbuffetdeposit,
};
