import * as abandonbillreason from './abandonbillreason'; // 废单原因列表
import * as resettlereasonview from './resettlereasonview'; // 废单原因列表
import * as getempidname from './getempidname';
import * as billitemtempview from './billitemtempview';
import * as updateitemtemp from './updateitemtemp';
import * as billremarkview from './billremarkview';
import * as itempkgnormal from './itempkgnormal';
import * as itempkgpart from './itempkgpart';
import * as updatetempmethod from './updatetempmethod';// 临时做法
import * as presentreasonview from './presentreasonview';// 赠单原因
import * as pointbsinfo from './pointbsinfo';// 刷新账单的接口
import * as moremethodandserveway from './moremethodandserveway';// 做法的请求
import * as itemmethodgroupinfo from './itemmethodgroupinfo';// 做法分组的请求
import * as findautoordercode from './findautoordercode'; // 快餐-牌号设置, 读取后台数据接口
import * as getbsinfo from './getbsinfo'; // 快餐-牌号设置, 读取后台数据接口
import * as updatepacktempmethod from './updatepacktempmethod'; // 打包更新接口
import * as pointscorderinfo from './pointscorderinfo';// 读取点菜单的接口
export default {
  abandonbillreason,
  resettlereasonview,
  getempidname,
  itempkgnormal,
  billitemtempview,
  updateitemtemp,
  itempkgpart,
  billremarkview,
  updatetempmethod,
  presentreasonview,
  pointbsinfo,
  moremethodandserveway,
  itemmethodgroupinfo,
  findautoordercode,
  getbsinfo,
  updatepacktempmethod,
  pointscorderinfo,
};
