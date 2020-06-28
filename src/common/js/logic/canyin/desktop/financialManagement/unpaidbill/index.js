import * as list from './list';
import * as listunpaidpersons from './listunpaidpersons';
import * as getaccountinfo from './getaccountinfo';
import * as loadnew from './loadnew';
import * as inserttzrecord from './inserttzrecord';
import * as paywaylist from './paywaylist';
import * as gettslist from './gettslist';
import * as insert from './insert';
// 用户桌面-还挂账执行接口: 普通(原流水)还款, 批量(原账户)还款, 指定还款,三合一接口
import * as insertorupdatebmrecord from './insertorupdatebmrecord';
// 用户桌面-还挂账-扫码付-还款的code(打开时请求)
import * as gethkcode from './gethkcode';
// 用户桌面-还挂账-扫码支付请求(仅限微信支付宝二合一付款码)
import * as unpaidscancodepay from './unpaidscancodepay';
// 用户桌面-还挂账-扫码付-强制确认支付接口
import * as unpaidscancodeenfore from './unpaidscancodeenfore';
// 用户桌面-还挂账-扫码付-手动确认支付接口
import * as unpaidscancodecheckandsettle from './unpaidscancodecheckandsettle';
// 补打还挂账还款凭证接口
import * as supplementprintunpaidbill from './supplementprintunpaidbill';


export default {
  list,
  listunpaidpersons,
  getaccountinfo,
  loadnew,
  inserttzrecord,
  paywaylist,
  gettslist,
  insert,
  insertorupdatebmrecord,
  unpaidscancodepay,
  unpaidscancodeenfore,
  unpaidscancodecheckandsettle,
  gethkcode,
  supplementprintunpaidbill,
};
