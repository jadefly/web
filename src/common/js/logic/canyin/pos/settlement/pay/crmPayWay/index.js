import * as view from './view'; // 会员卡支付页面
import * as doGetConsumeInfo from './doGetConsumeInfo';
import * as registermember from './registermember'; // 绑定会员与桌位
import * as crmmemberquery from './crmmemberquery'; // 绑定会员与桌位
import * as getcrmmemberinfo from './getcrmmemberinfo'; // 得到当前桌位会员卡信息
import * as cancelmember from './cancelmember'; // 解绑会员
import * as calc from './calc'; // 读卡
import * as settle from './settle'; // CRM结算
import * as teamsettle from './teamsettle'; // CRM团队结算
import * as cancel from './cancel'; // CRM取消结算
import * as undo from './undo'; // CRM取消结算
import * as teamundo from './teamundo'; // CRM取消结算
import * as printcardcharge from './printcardcharge'; // CRM打印充值
import * as getcardnofromreserveorder from './getcardnofromreserveorder'; // 获取预点单数据
import * as crmCardCharge from './crmCardCharge'; // 获取CRM7充值页面
import * as crmCardSelling from './crmCardSelling'; // 获取CRM7售卡页面
import * as printcardselling from './printcardselling'; // crm售卡打印
import * as getcrmversion from './getcrmversion'; // 获取crm版本
import * as getcrmticketlistbymemberid from './getcrmticketlistbymemberid'; // 获取crm优惠券-验证会员用
import * as fastsettlecancel from './fastsettlecancel'; // 获取crm优惠券-验证会员用
import * as mingchenquerymember from './mingchenquerymember'; // 冥晨验证会员用
import * as mingchenregistermember from './mingchenregistermember';
import * as mingchencancelmember from './mingchencancelmember';
import * as mingchengetcrmticketlistbymemberid from './mingchengetcrmticketlistbymemberid';
import * as mingchensettle from './mingchensettle';
import * as mingchenundo from './mingchenundo';
import * as mingchenconsumeticket from './mingchenconsumeticket';
import * as mingchengetcrmmemberinfo from './mingchengetcrmmemberinfo';
// 还挂账-crm7支付-卡查询接口
import * as querycrmmemberandrule from './querycrmmemberandrule'; // 卡信息
import * as getmemberallcards from './getmemberallcards'; // 多卡列表

export default {
  view,
  doGetConsumeInfo,
  registermember,
  crmmemberquery,
  getcrmmemberinfo,
  cancelmember,
  calc,
  settle,
  teamsettle,
  cancel,
  undo,
  teamundo,
  printcardcharge,
  getcardnofromreserveorder,
  crmCardCharge,
  crmCardSelling,
  printcardselling,
  getcrmversion,
  getcrmticketlistbymemberid,
  fastsettlecancel,
  mingchenquerymember,
  mingchenregistermember,
  mingchencancelmember,
  mingchengetcrmticketlistbymemberid,
  mingchensettle,
  mingchenundo,
  mingchenconsumeticket,
  mingchengetcrmmemberinfo,
  querycrmmemberandrule,
  getmemberallcards,
};
