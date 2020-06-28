import * as openscore from './openscore'; // 打开积分页面
import * as querymember from './querymember'; // 读卡
import * as scoredeletemember from './scoredeletemember'; // 积分页面删除会员
import * as scoresavemember from './scoresavemember'; // 积分页面确认会员
import * as settle from './settle'; // 储值卡支付
import * as couponpay from './couponpay'; // 优惠券支付
import * as uncouponpayeach from './uncouponpayeach'; // 删除券
import * as unsettle from './unsettle';// 删除结算方式储值
import * as uncouponpaylist from './uncouponpaylist'; // 删除结算方式券
import * as getcouponlist from './getcouponlist';
import * as getsettlelist from './getsettlelist'; // 查询储值消费列表

export default {
  openscore, // 打开积分页面
  querymember, // 读卡
  scoredeletemember, // 积分页面删除会员
  scoresavemember, // 积分页面确认会员
  settle, // 储值卡支付
  couponpay, // 优惠券支付
  uncouponpayeach, // 删除券
  unsettle, // 删除结算方式储值
  uncouponpaylist, // 删除结算方式券
  getcouponlist, // 打开优惠券结算界面
  getsettlelist, // 查询储值消费列表
};
