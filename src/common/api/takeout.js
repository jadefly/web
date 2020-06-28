const format = mod => `${process.env.API_PATH}/canyin/takeout/${mod}`;

// 外卖WebSocket接口
export const WEBSOCKETTAKEOUT = `ws://${window.location.hostname}:7001/cy7/websocket/takeoutorder`;

// 预订、预点WebSocket接口
export const ONLINEARCHIVE = `ws://${window.location.hostname}:7001/cy7/websocket/onlinearchive`;

// 外卖营业情况
export const TAKEOUTORDERBUSINESS = format('/takeoutview/takeoutorderbusiness');
// 新订单 退单 处理中 历史订单
export const TAKEOUTORDERLIST = format('/takeoutview/takeoutorderlist');

// 接单
export const CONFIRMTAKEOUTORDER = format('/takeoutorder/confirmtakeoutorder');

// 拒接接单
export const REFUSETAKEOUTORDER = format('/takeoutorder/refusetakeoutorder');

// 制作（厨打）
export const TAKEOUTORDERMAKE = format('/takeoutmake/takeoutordermake');

// 配送
export const TAKEOUTORDERDISTRIBUTION = format('/takeoutdistribution/takeoutordedistribution');

// 确认送达
export const CONFIRMARRIVE = format('/takeoutorder/confirmarrive');

// 商家取消外卖单
export const CANCELORDER = format('/takeoutorder/canceltakeoutorder');

// 食客取消外卖单(同意)
export const CUSTOMERCANCELAGREE = format('/takeoutdispute/customercancelagree');

// 食客取消外卖单(拒绝)
export const CUSTOMERCANCELREFUSE = format('/takeoutdispute/customercancelrefuse');

// 根据外卖单id查询外卖单信息
export const TAKEOUTORDERDETAIL = format('/takeoutview/takeoutorderdetail');

// 查询外卖设置
export const QUERYTAKEOUTORDERSET = format('/takeoutorder/querytakeoutorderset');

// 更新外卖设置
export const UPDATETAKEOUTSET = format('/takeoutorder/updatetakeoutset');

// 骑手选择
export const SELECTRIDELIST = format('/takeoutdistriset/selectridelist');

// 骑手修改保存
export const UPDATETAKEOUTORDEDISTRIRIDER = format('/takeoutdistribution/updatetakeoutordedistririder');

// 手动录单
export const MANUALRECORDBS = format('/takeoutorder/manualrecordbs');

// 忽略外卖结班检查
export const UPDATETAKEOUTPSCHECK = format('/takeoutorder/updatetakeoutpscheck');

// 查询pos营业信息
export const GETPOSBUSINESSDATA = format('/takeoutview/getposbusinessdata');

// 查询外卖单配送方式：商家配送、自配送
export const QUERYTAKEOUTDISTRISET = format('/takeoutdistriset/querytakeoutdistriset');

// 获取外卖来源信息列表
export const QUERYFROM = format('/takeoutview/queryfrom');

// 获取结算方式列表
export const QUERYPAYWAY = format('/takeoutview/querypayway');

// 获取退单/取消订单原因列表
export const QUERYCANCELREASON = format('/takeoutview/querycancelreason');

// 电话外卖结算接口
export const CONFIRMARRIVEFORSETT = format('/takeoutorder/confirmarriveforsett');

// 通过posId查询预点单语音提示
export const GETRESERVEORDER = '/cy7/canyin/pos/reserveorderbill/getreserveorderbyposid';

// 图标显示 自定义状态下版本
export const GETBRANDTYPE = '/cy7/canyin/sys/logo/getbrandtype';
