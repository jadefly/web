import pay from './pay'; // 支付
import * as fiexd from './discount/fiexd'; // 手工定额
import * as scale from './discount/scale';
import * as disctypeView from './disctypeView';
import * as disctypeFulloffPlan from './disctypeFulloffPlan'; // 满减(账单)
import * as fulloffplanview from './fulloffplanview'; // 满减(品项)
import * as disctypeDiscountPlan from './disctypeDiscountPlan';
import * as CheckBill from './CheckBill';
import * as BackCheckBill from './BackCheckBill';
import * as TeamCheckBill from './TeamCheckBill';
import * as TeamBackCheckBill from './TeamBackCheckBill';
import paybottombtn from './paybottombtn'; // 结算底下按钮
import settle from './settle'; // 结算
import * as teamfiexd from './discount/teamfiexd'; // 手工定额
import * as teamscale from './discount/teamscale';
import servicefee from './servicefee';
import miniMumCharge from './miniMumCharge';
import * as getDiscplanAndPayway from './getDiscplanAndPayway';
import * as settle2 from './settle2';
import * as settlecheck from './settlecheck';
import * as cashfastsettle from './cashfastsettle';
import * as cashsettle from './cashsettle';
import * as cancelpresettle from './cancelpresettle';
import * as fastenforcesettle from './fastenforcesettle';
import * as newtakeoutsettle from './newtakeoutsettle';
import * as exclusiveagain from './exclusiveagain';
import * as closeexclusive from './closeexclusive';
import * as leastbuyview from './leastbuyview';
import * as servicefeeview from './servicefeeview';
import * as docancelofflinetspayway from './docancelofflinetspayway';
import * as crmmixsettle from './crmmixsettle';
import * as fastsettle from './fastsettle';
import * as otherfastsettle from './otherfastsettle';
import * as undocrmsettle from './undocrmsettle';
import * as settleunlock from './settleunlock';
import * as judgeempifhaspaywayopset from './judgeempifhaspaywayopset';
import * as cancelsettle from './cancelsettle';
import * as electronicinvoice from './electronicinvoice';
import * as updatebswipeflg from './updatebswipeflg'; // 结算账单金额执行抹零接口
import * as getdiscplanbyexchange from './getdiscplanbyexchange';
import * as getdiscplanbyfullgift from './getdiscplanbyfullgift';
import * as checkcontainkdsitem from './checkcontainkdsitem';
import * as getItemswithexchange from './getItemswithexchange';
import * as canonlinepayrefund from './canonlinepayrefund';
import * as onlinepayrefund from './onlinepayrefund';
import * as checkmutex from './checkmutex'; // 结算方式互斥校验接口

export default {
  fiexd,
  scale,
  disctypeView,
  disctypeFulloffPlan,
  fulloffplanview,
  disctypeDiscountPlan,
  CheckBill,
  BackCheckBill,
  pay,
  paybottombtn,
  settle,
  TeamCheckBill,
  TeamBackCheckBill,
  teamfiexd,
  teamscale,
  servicefee,
  miniMumCharge,
  getDiscplanAndPayway,
  settle2,
  settlecheck,
  cashfastsettle,
  cashsettle,
  cancelpresettle,
  fastenforcesettle,
  newtakeoutsettle,
  docancelofflinetspayway,
  crmmixsettle,
  fastsettle,
  otherfastsettle,
  undocrmsettle,
  exclusiveagain,
  closeexclusive,
  leastbuyview,
  servicefeeview,
  settleunlock,
  judgeempifhaspaywayopset,
  cancelsettle,
  electronicinvoice,
  updatebswipeflg,
  getdiscplanbyexchange,
  checkcontainkdsitem,
  getItemswithexchange,
  canonlinepayrefund,
  onlinepayrefund,
  checkmutex,
  getdiscplanbyfullgift,
};
