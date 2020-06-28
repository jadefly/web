import * as getcardtype from './getcardtype'; // 获取卡型
import * as queryismember from './queryismember'; // 查询是否为会员
import * as getrechargerule from './getrechargerule'; // 打开开卡页面时获取的门店充值规则
import * as querymember from './querymember'; // 查询会员信息
import * as opencard from './opencard'; // 老会员开卡
import * as registandopencard from './registandopencard'; // 非会员注册并开卡
import * as getprincipalamount from './getprincipalamount'; // 查询赠送金额
import * as querycardmessage from './querycardmessage'; // 查询赠送金额
import * as payways from './payways'; // 获取支付方式
import * as recharge from './recharge'; // 充值请求
import * as selectrecharge from './selectrecharge'; // 获取充值记录
import * as checkoperationauth from './checkoperationauth'; // 是否有撤销权限
import * as undosinglerecharge from './undosinglerecharge'; // 撤销充值记录
import * as printrecharge from './printrecharge'; // 打印小票接口
import * as sendvalidatesms from './sendvalidatesms'; // 发送短信验证码
import * as settle from './settle'; // 荣管家结算
import * as undosettle from './undosettle'; // 荣管家撤销结算
import * as altermember from './altermember'; // 荣管家修改会员信息（第三方页面）
import * as readcard from './readcard'; // 读取读卡器后台设置信息
import * as suppleCard from './suppleCard'; // 补卡

export default {
  getcardtype,
  queryismember,
  getrechargerule,
  querymember,
  opencard,
  registandopencard,
  getprincipalamount,
  querycardmessage,
  payways,
  recharge,
  selectrecharge,
  undosinglerecharge,
  printrecharge,
  sendvalidatesms,
  settle,
  undosettle,
  checkoperationauth,
  altermember,
  readcard,
  suppleCard,
};
