export default {
  vuex: 'setting',
  url: '/canyin/pos/reception/receptionbusiness/receptionbusinesssyssettingv2',
  data: [{
    key: 'electronicScaleUnit',
    type: Number,
    text: '电子秤点位，0：公斤 1：斤',
  }, {
    key: 'POSReservedDecimal',
    type: Number,
    text: '终端保留位数，默认3位',
  }, {
    key: 'POSWeighingUnit',
    type: Number,
    text: '终端称重单位 0：公斤 1：斤 2：克',
  }, {
    key: 'crmVersion',
    type: Number,
    text: 'CRM版本 0：CRM6 1：CRM7',
  }, {
    key: 'enableCrm',
    type: Boolean,
    text: '是否允许使用会员模块',
  }, {
    key: 'websocketContextPath',
    type: String,
    text: '门店服务WebSocket路径',
  }, {
    key: 'controlMode',
    type: String,
    text: '终端模式 1：收银 2：录单 3：快餐',
  }, {
    key: 'createShopId',
    type: String,
    text: '创建店ID',
  }, {
    key: 'createShopName',
    type: String,
    text: '（虚列）创建店',
  }, {
    key: 'createTime',
    type: String,
    text: '创建时间',
  }, {
    key: 'creatorId',
    type: String,
    text: '创建人ID',
  }, {
    key: 'creatorName',
    type: String,
    text: '（虚列）创建人',
  }, {
    key: 'delflg',
    type: String,
    text: '删除标识',
  }, {
    key: 'downloadFlg',
    type: String,
    text: '下载标识',
  }, {
    key: 'enableBill',
    type: String,
    text: '是否结账单',
  }, {
    key: 'enableGuestBill',
    type: String,
    text: '是否客用单',
  }, {
    key: 'enableGuestQtyChange',
    type: String,
    text: '是否更改人数单',
  }, {
    key: 'enableItemToBill',
    type: String,
    text: '是否单品转台单',
  }, {
    key: 'enableOnlineConfirm',
    type: String,
    text: '是否线上点菜确认单',
  }, {
    key: 'enablePointChange',
    type: String,
    text: '是否更换客位单',
  }, {
    key: 'enablePosWipeZero',
    type: Boolean,
    text: '是否启用按终端设置抹零方式',
  }, {
    key: 'enablePreBill',
    type: String,
    text: '是否预结单',
  }, {
    key: 'enableTotalPart',
    type: String,
    text: '是否总单与分单',
  }, {
    key: 'enterMainBiz',
    type: String,
    text: '录单模式再次登录不进行终端选择',
  }, {
    key: 'isBuffetOrderPos',
    type: String,
    text: '是否自助点单pos',
  }, {
    key: 'isFoodPlazaPos',
    type: String,
    text: '未知',
  }, {
    key: 'isLimitItemClass',
    type: Boolean,
    text: '是否启用品项类别限定',
  }, {
    key: 'isPosToTakeout',
    type: Boolean,
    text: '当前终端是否启用外卖功能',
  }, {
    key: 'isShieldReserveOrder',
    type: Boolean,
    text: '是否屏蔽预点单（快餐模式专用）',
  }, {
    key: 'isShieldReserveOrderAfterPay',
    type: Boolean,
    text: '是否屏蔽在线付（收银模式专用）',
  }, {
    key: 'modifierId',
    type: String,
    text: '修改人ID',
  }, {
    key: 'modifierName',
    type: String,
    text: '（虚列）修改人',
  }, {
    key: 'modifyTime',
    type: String,
    text: '最后修改时间',
  }, {
    key: 'name',
    type: String,
    text: '未知',
  }, {
    key: 'pinyin',
    type: String,
    text: '未知',
  }, {
    key: 'pk',
    type: String,
    text: '未知',
  }, {
    key: 'posBanFastFoodBtnJson',
    type: String,
    text: '未知',
  }, {
    key: 'posEmpLimit',
    type: String,
    text: '未知',
  }, {
    key: 'posId',
    type: String,
    text: '终端ID',
  }, {
    key: 'posItemClassLimit',
    type: String,
    text: '终端限定的品项类别',
  }, {
    key: 'posItemExcludeLimit',
    type: String,
    text: '未知',
  }, {
    key: 'posItemLimit',
    type: String,
    text: '终端品项限定对象',
  }, {
    key: 'posKitchenItemFilter',
    type: String,
    text: '终端品项筛选方案',
  }, {
    key: 'posKitchenKDSMode',
    type: String,
    text: 'KDS模式选择',
  }, {
    key: 'posKitchenMode',
    type: String,
    text: '终端模式选择',
  }, {
    key: 'posReservePoint',
    type: String,
    text: '终端管理的预点单客位',
  }, {
    key: 'posSetId',
    type: String,
    text: '配置项目ID',
  }, {
    key: 'posSetType',
    type: String,
    text: '配置项目类型',
  }, {
    key: 'posSetValue',
    type: String,
    text: '配置项目值',
  }, {
    key: 'saleType',
    type: Number,
    text: '默认销售类型 1：堂食 2：外带 3：外卖',
  }, {
    key: 'uploadFlg',
    type: String,
    text: '上传标识',
  }, {
    key: 'wipeZeroMode',
    type: String,
    text: '抹零方式',
  }, {
    key: 'wipeZeroModeName',
    type: String,
    text: '抹零方式名称',
  }, {
    key: 'wipeZeroPosition',
    type: String,
    text: '抹零位置',
  }, {
    key: 'wipeZeroPositionName',
    type: String,
    text: '抹零位置名称',
  }, {
    key: 'yiPanListJson',
    type: String,
    text: '未知',
  }, {
    key: 'zhiPanListJson',
    type: String,
    text: '未知',
  }, {
    key: 'isEnableMakeMethodGroup',
    type: Boolean,
    text: '是否开启了做法分组设置',
  }, {
    key: 'isAuthCardMandatory',
    type: Boolean,
    text: '是否开启了授权强制使用员工卡',
  }, {
    key: 'defaultInvoiceType',
    type: Number,
    text: '开发票默认类型',
  }],
};
