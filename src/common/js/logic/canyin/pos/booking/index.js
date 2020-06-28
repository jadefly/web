import * as findreservepoint from './findreservepoint'; // 预订-线上订单-执行-获取营业流水及客位信息
import * as doreserve from './doreserve'; // 预订-预订单执行接口
import * as doreserveteam from './doreserveteam'; // 预订-预订单执行接口(团队预订)
import * as printorder from './printorder'; // 预订-打印接口
import * as getcrminfo from './getcrminfo'; // 预订-会员信息接口
import * as cancelorder from './cancelorder'; // 预订-取消预订单(提交原因)
import * as getbasicinfo from './getbasicinfo'; // 预订-基本数据接口(最早加载)
import * as getorderlist from './getorderlist'; // 预订-基本数据接口(最早加载)
import * as getorderdetailinfo from './getorderdetailinfo'; // 预订-已预订客位详情/预订单详情
import * as getincomingcallslist from './getincomingcallslist'; // 预订-预订记录列表
import * as getbookingstatistics from './getbookingstatistics'; // 预订-会员预订信息
import * as getbookingviewdetailsdata from './getbookingviewdetailsdata'; // 预订-预订图客位
import * as saveorupdateorderinfo from './saveorupdateorderinfo'; // 预订-新建/修改预订单 保存接口
import * as savebookingviewsetting from './savebookingviewsetting'; // 预订-新建/修改预订单 保存接口
import * as saveorupdateincomingcallsinfo from './saveorupdateincomingcallsinfo'; // 预订-模拟来电执行接口
import * as getbookingdetailinfolistbyparam from './getbookingdetailinfolistbyparam'; // 预订-已预订客位信息列表接口
import * as getincomingcallslistbypage from './getincomingcallslistbypage'; // 电话外卖-来电记录
import * as getorderlistunpaid from './getorderlistunpaid'; // 预订挂账-与订单查询接口
import * as previewprintordercollect from './previewprintordercollect'; // 预订-[排菜] 预订品项汇总-预览接口
import * as printordercollect from './printordercollect'; // 预订-[排菜] 预订品项汇总-执行打印接口

export default {
  findreservepoint,
  doreserve,
  doreserveteam,
  printorder,
  getcrminfo,
  cancelorder,
  getbasicinfo,
  getorderlist,
  getorderdetailinfo,
  getincomingcallslist,
  getbookingstatistics,
  getbookingviewdetailsdata,
  saveorupdateorderinfo,
  savebookingviewsetting,
  saveorupdateincomingcallsinfo,
  getbookingdetailinfolistbyparam,
  getincomingcallslistbypage,
  getorderlistunpaid,
  previewprintordercollect,
  printordercollect,
};
