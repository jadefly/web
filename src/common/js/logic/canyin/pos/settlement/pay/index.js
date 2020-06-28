import * as bankcardtypepayway from './bankcardtypepayway'; // 银行卡结算页面
import * as fetetypepayway from './fetetypepayway'; // 宴请结算页面
import * as chequetypepayway from './chequetypepayway'; // 支票结算页面
import * as onticktypepayway from './onticktypepayway'; // 挂帐结算页面
import * as sendsmscode from './sendsmscode'; // 挂帐结算发送短信
import * as smsverify from './smsverify'; // 挂帐结算验证短信
import * as skipgz from './skipgz'; // 跳过验证并挂账
import * as escapedtypepayway from './escapedtypepayway'; // 逃单结算页面
import * as tickettypepayway from './tickettypepayway'; // 代金券结算页面
import crmPayWay from './crmPayWay'; // crm支付方式
import unitedbank from './unitedbank'; // 通联pos支付方式
import * as scancodepayway from './scancodepayway'; // 查询线上支付方式是否结算成功
import * as querymember from './querymember'; // 验证会员
import scancodepay from './scancodepay'; //
import * as olprepayway from './olprepayway'; // 线上预付
import chopstickpayway from './chopstickpayway'; // 一筷捞天下
import glorybutlerpayway from './glorybutlerpayway'; // 新荣记
import coucoupayway from './coucoupayway'; // 线上礼品卡
import yukupayway from './yukupayway'; // 鱼酷会员卡支付方式
import * as insertbybookid from './insertbybookid'; // 预订挂账-新建账户
import * as showunpaidmsg from './showunpaidmsg'; // 结算前, 检查是否含有预订挂账相关信息的提示
import twitterlifepayway from './twitterlifepayway';
import * as querybsstate from './querybsstate';
import polymer from './polymer'; // 聚合支付接口
import companyonticktypepayway from './companyonticktypepayway'; // 结算-集团挂账
import shishangdingdeposit from './shishangdingdeposit'; // 结算-第三方订金(食尚订)
import * as getfeiziviewurl from './getfeiziviewurl'; // 结算-菲滋支付

// 微生活
import grouplight from './grouplight';
// 群光会员卡
export default {
  bankcardtypepayway,
  fetetypepayway,
  onticktypepayway,
  escapedtypepayway,
  tickettypepayway,
  chequetypepayway,
  crmPayWay,
  unitedbank,
  yukupayway,
  scancodepayway,
  querymember,
  scancodepay,
  olprepayway,
  chopstickpayway,
  glorybutlerpayway,
  coucoupayway,
  sendsmscode,
  smsverify,
  skipgz,
  insertbybookid,
  showunpaidmsg,
  twitterlifepayway,
  grouplight,
  querybsstate,
  polymer,
  companyonticktypepayway,
  shishangdingdeposit,
  getfeiziviewurl,
};
