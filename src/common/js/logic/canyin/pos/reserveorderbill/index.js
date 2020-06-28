import * as reserveorderlist from './reserveorderlist' // 预点列表
import * as reserveorderitemlist from './reserveorderitemlist' // 获取预订单品项列表
import * as cancelorder from './cancelorder' // 取消预点
import * as doreserveorder from './doreserveorder' // 下单
import * as doreserveorderauto from './doreserveorderauto' // 自动下单-快餐模式下
import * as getisalldoreserveordercount from './getisalldoreserveordercount' // 自动下单-快餐模式下: 下单成功的结果, 循环调用
import * as printorder from './printorder' // 打印预点
import * as getreserveorderbyposid from './getreserveorderbyposid' // 预点数量
import * as pointstate from './pointstate' // 查询下预点当前的客位状态
import * as doreserveorderaddbill from './doreserveorderaddbill' // 空闲客位执行开台
import * as modifyreserveorderitem from './modifyreserveorderitem' // 空闲客位执行开台
export default {
  reserveorderlist,
  cancelorder,
  printorder,
  doreserveorder,
  doreserveorderauto,
  getisalldoreserveordercount,
  reserveorderitemlist,
  pointstate,
  getreserveorderbyposid,
  doreserveorderaddbill,
  modifyreserveorderitem
}
