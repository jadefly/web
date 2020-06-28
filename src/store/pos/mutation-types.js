/* 所有参数必须加注释,并声明参数的作用 */
// 前台配置
export const SET_CONFIG = 'SET_CONFIG';
export const SET_LOCALE = 'SET_LOCALE'; // 保存当前语言
export const SET_LOGIN_DATA = 'SET_LOGIN_DATA'; // 登陆数据
// export const SET_LOGOMODE = 'SET_LOGOMODE' // 产品logo显示标识
export const SET_SHOW_POS = 'SET_SHOW_POS'; // 是否显示选择Pos页
export const SET_SHOW_LOGIN = 'SET_SHOW_POS'; // 是否显示登录页
export const SET_SHOW_KAIBAN = 'SET_SHOW_POS'; // 是否显示开班页
export const SET_ISLOGINORLOGOUT_ENTERKAIBAN = 'SET_ISLOGINORLOGOUT_ENTERKAIBAN'; // 进入开班页面的方式
export const SET_RECEPTION_DATA = 'SET_RECEPTION_DATA'; // 客位
export const SET_POS_ORDER_BILL = 'SET_POS_ORDER_BILL'; // 客位账单
export const SET_POS_ORDER_MENU = 'SET_POS_ORDER_MENU';
export const SET_POS_POINT_DATA = 'SET_POS_POINT_DATA'; // 当前正处理的客位信息
export const SET_POS_BASE_INFO = 'SET_POS_BASE_INFO';
export const SET_POS_INFO = 'SET_POS_INFO';
export const SET_FOOT_INFO = 'SET_FOOT_INFO';
export const SET_POS_DEVICE = 'SET_POS_DEVICE';
export const SET_POS_SETTING = 'SET_POS_SETTING';
export const SET_POS_FASTFOOD = 'SET_POS_FASTFOOD';
export const SET_POS_INFOFOOTER = 'SET_POS_INFOFOOTER';
export const SET_BOOKING = 'SET_BOOKING';
export const SET_CRM = 'SET_CRM';
export const SET_MEMBER = 'SET_MEMBER'; // 荣管家会员模块
export const SET_OUT_DEVICE_SETTING = 'SET_OUT_DEVICE_SETTING';
export const SET_RESERVE = 'SET_RESERVE';
export const SET_TAKEOUT = 'SET_TAKEOUT';
export const SET_ORDER = 'SET_ORDER';
export const SET_ORDER_INFO = 'SET_ORDER_INFO';
export const SET_ITEM_INFO = 'SET_ITEM_INFO';
export const SET_ORDER_TABLES = 'SET_ORDER_TABLES';
export const UDATE_ORDER_TABLES = 'UDATE_ORDER_TABLES';
export const SET_POIONTS_LAST_MODIFY_TIOME = 'SET_POIONTS_LAST_MODIFY_TIOME'; // 客位最后更新时间,yyyy-MM-dd HH:mm:ss
export const SET_SETTLEMENT_BILL_DATA = 'SET_SETTLEMENT_BILL_DATA';// 获取结算账单信息
export const SET_SETTLE_DISCTYPE = 'SET_SETTLE_DISCTYPE';// 结算页面添加的优惠类型数据
export const SET_ETAG_ITEMS = 'SET_ETAG_ITEMS'; // 智能餐盘数据
export const SET_METHODSELLOUT = 'SET_METHODSELLOUT'; // 做法估清
export const SET_ITEMSELLOUTSMAP = 'SET_ITEMSELLOUTSMAP'; // 估清
export const SET_ITEMLIMITSMAP = 'SET_ITEMLIMITSMAP'; // 限量
export const SET_PROMOTELIMITMAP = 'SET_PROMOTELIMITMAP'; // 促销限量
export const SET_ITEMTIMEPRICESMAP = 'SET_ITEMTIMEPRICESMAP'; // 时价

export const SET_RESERVE_NOTIFY_COUNT = 'SET_RESERVE_NOTIFY_COUNT'; // 预点通知计数

// export const SET_SERVICE_FUNCTION_BTNS = 'SET_SERVICE_FUNCTION_BTNS'; // 按钮设置
// export const SET_ALL_POS_MODULE = 'SET_ALL_POS_MODULE'; // 所有Pos模块
export const SET_BOOKING_POINT_LIST = 'SET_BOOKING_POINT_LIST'; // 预订客位的列表信息
export const SET_BOOK_EXECUTED_POINTS = 'SET_BOOK_EXECUTED_POINTS'; // 预订单执行后的客位id
export const SET_POS_TEAMPOINTFLG = 'SET_POS_TEAMPOINTFLG'; // 当前的客位的团队标识状态
export const SET_POS_CANCELTRANSFERPOINTSTATE = 'SET_POS_CANCELTRANSFERPOINTSTATE'; // 撤销转账的时候进行的更新客位
export const SET_POS_POINTSHOWSTATE = 'SET_POS_POINTSHOWSTATE'; // 客位按钮上的状态显示
export const SET_TIME_COMPARE_DATA = 'SET_TIME_COMPARE_DATA'; // 系统时间和互联网时间

export const SET_POS_ITEMS = 'SET_POS_ITEMS'; // 品项设置
export const CLEAR_STATE_ON_LOGOUT = 'CLEAR_STATE_ON_LOGOUT'; // 注销时清空信息
export const SET_RESERVEORDER_LIST = 'SET_RESERVEORDER_LIST'; // 修改预点单过来的数据

// 暂不使用
// // 快餐 设置快餐的根组件(路由进入)创建DOM的状态, 用于判断该组件状态
// export const SET_FASTFOODSTATUS = 'SET_FASTFOODSTATUS';

export const SET_FASTTFOODBILL_DATA = 'SET_FASTTFOODBILL_DATA'; // 快餐模式下的账单数据
export const SET_SELECT_DISCOUNTPLAN_DATA = 'SET_SELECT_DISCOUNTPLAN_DATA'; // 快餐模式下的当前执行打折活动方案的数据
export const SET_SELECT_VOUCHER_DATA = 'SET_SELECT_VOUCHER_DATA';// 快餐模式下当前的代金券数据
export const SET_SELECT_CRM_DATA = 'SET_SELECT_CRM_DATA';// 快餐模式下当前的会员卡数据
// export const SET_DOMEMBERPRCIE_STATE = 'SET_DOMEMBERPRCIE_STATE';// 快餐模式下当前营业流水对应的执行会员价状态
export const SET_FASTFOODMEMBERPLAN_FLG = 'SET_FASTFOODMEMBERPLAN_FLG_DATA';// 执行验证会员方案(会员价和N杯打折)的状态参数对象
export const SET_TIME_DIFFERENT_OVER = 'SET_TIME_DIFFERENT_OVER'; // 系统时间与互联网时间差值
export const SET_SEARCH_MODE = 'SET_SEARCH_MODE'; // 设置品相查询模式(1模糊，2精准，3汉字)
export const SET_ITEMSMOREBARCODE = 'SET_ITEMSMOREBARCODE'; // 更新全部多条码数据
export const SET_ITEMSMOREBARCODE_SINGLE = 'SET_ITEMSMOREBARCODE_SINGLE'; // 更新单条多条码数据
export const REMOVE_SETTLE_DISCTYPE = 'REMOVE_SETTLE_DISCTYPE';// 结算页面移除的优惠类型数据
export const SET_NEWWEIGHTDATA = 'SET_NEWWEIGHTDATA';// 中餐电子秤数据
export const IS_EXIT_DATA = 'IS_EXIT_DATA'; // 标记废单重结
export const IS_BATCH_OPERATION = 'IS_BATCH_OPERATION'; // 批量操作
export const SET_TABLES_AREAS = 'SET_TABLES_AREAS'; // 客位区域
export const SET_TABLES_TYPES = 'SET_TABLES_TYPES'; // 客位类型
export const SET_TABLES = 'SET_TABLES'; // 客位列表
export const UPDATE_TABLES = 'UPDATE_TABLES'; // 更新客位数据
export const DELETE_XUNI_TABLES = 'DELETE_XUNI_TABLES';// 删除虚拟客位
export const SET_MULTISETTLE = 'SET_MULTISETTLE'; // 多次结算的菜品
export const SET_MENU_BTNS = 'SET_MENU_BTNS';
export const SET_FASTFOOD_MENU_BTNS = 'SET_FASTFOOD_MENU_BTNS';
export const SET_POIONT_CONTENT_LAYOUT = 'SET_POIONT_CONTENT_LAYOUT'; // 客位框上的显示信息自定义数据
export const SET_TABLES_INDEX = 'SET_TABLES_INDEX'; // 客位根据id映射的下标 数据
export const SET_DEFAULT_KEYBOARD_TYPE = 'SET_DEFAULT_KEYBOARD_TYPE'; // 客位和加单页面的软键盘样式
export const SET_DIALOG = 'SET_DIALOG';
export const SET_RERFESHBS = 'SET_RERFESHBS';
export const SET_DISCPLAN_AND_PAYWAY = 'SET_DISCPLAN_AND_PAYWAY';
export const SET_SETTLE_BS_CODE = 'SET_SETTLE_BS_CODE';
export const SET_CREDIT_ACCOUNT = 'SET_CREDIT_ACCOUNT';
// 用户桌面页面基础数据
export const SET_DESK_PAGE_BASE_INFO = 'SET_DESK_PAGE_BASE_INFO';
// 用户桌面权限数据
export const SET_DESK_PAGE_AUTH_MODULES = 'SET_DESK_PAGE_AUTH_MODULES';
// 客位的有关推送是否需要对推送过来的数据处理
export const SET_ISNEED_TABLE_WsHANDLE = 'SET_ISNEED_TABLE_WsHANDLE';
export const SET_POINTGROUPID = 'SET_POINTGROUPID'; // 获取当前客位所在的分组id
export const SET_TABLES_CLONE = 'SET_TABLES_CLONE'; // 更新下客位备份的数据
