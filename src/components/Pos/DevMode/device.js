export default {
  vuex: 'posDevice',
  url: '/canyin/pos/reception/receptionbusiness/receptionbusinesssyssettingv2',
  data: [{
    key: 'deviceManagerVersion',
    type: String,
    text: '设备管理器版本号',
  }, {
    key: 'baudRate',
    type: Number,
    text: '客显波特率',
  }, {
    key: 'cashboxBrand',
    type: String,
    text: '钱箱品牌',
  }, {
    key: 'cashboxBrandType',
    type: String,
    text: '钱箱型号',
  }, {
    key: 'cashboxPrint',
    type: String,
    text: '钱箱-打印机',
  }, {
    key: 'cashboxStartCommand',
    type: String,
    text: '打开钱箱指令',
  }, {
    key: 'cashboxStyle',
    type: String,
    text: '钱箱用于区分类型标志位 1：按接口设置 2：按厂商设置',
  }, {
    key: 'cashboxUseMode',
    type: String,
    text: '钱箱按接口设置',
  }, {
    key: 'enableCashbox',
    type: Boolean,
    text: '是否启用钱箱',
  }, {
    key: 'enableScale',
    type: Boolean,
    text: '是否启用电子秤',
  }, {
    key: 'enableScreen',
    type: Boolean,
    text: '是否启用客显',
  }, {
    key: 'enableVice',
    type: Boolean,
    text: '是否启用副屏',
  }, {
    key: 'enableYiPan',
    type: Boolean,
    text: '是否启用易盘',
  }, {
    key: 'enableZhiPan',
    type: Boolean,
    text: '是否启用智盘',
  }, {
    key: 'isEnable1',
    type: Boolean,
    text: '选中的设置类型（结账单）',
  }, {
    key: 'printQty1',
    type: Number,
    text: '结账单打印份数',
  }, {
    key: 'printer1',
    type: String,
    text: '结账单打印机',
  }, {
    key: 'styleId1',
    type: String,
    text: '结账单打印样式ID',
  }, {
    key: 'isEnable2',
    type: Boolean,
    text: '选中的设置类型（预结单）',
  }, {
    key: 'printQty2',
    type: Number,
    text: '预结单打印份数',
  }, {
    key: 'printer2',
    type: String,
    text: '预结单打印机',
  }, {
    key: 'styleId2',
    type: String,
    text: '预结单打印样式ID',
  }, {
    key: 'isEnable3',
    type: Boolean,
    text: '选中的设置类型（客用单）',
  }, {
    key: 'printQty3',
    type: Number,
    text: '客用单打印份数',
  }, {
    key: 'printer3',
    type: String,
    text: '客用单打印机',
  }, {
    key: 'styleId3',
    type: String,
    text: '客用单打印样式ID',
  }, {
    key: 'isEnable4',
    type: Boolean,
    text: '选中的设置类型（结班单）',
  }, {
    key: 'printQty4',
    type: Number,
    text: '结班单打印份数',
  }, {
    key: 'printer4',
    type: String,
    text: '结班单打印机',
  }, {
    key: 'styleId4',
    type: String,
    text: '结班单打印样式ID',
  }, {
    key: 'isEnable5',
    type: Boolean,
    text: '选中的设置类型（团队结账单）',
  }, {
    key: 'printQty5',
    type: Number,
    text: '团队结账单打印份数',
  }, {
    key: 'printer5',
    type: String,
    text: '团队结账单打印机',
  }, {
    key: 'styleId5',
    type: String,
    text: '团队结账单打印样式ID',
  }, {
    key: 'isEnable6',
    type: Boolean,
    text: '选中的设置类型（团队预结单）',
  }, {
    key: 'printQty6',
    type: Number,
    text: '团队预结单打印份数',
  }, {
    key: 'printer6',
    type: String,
    text: '团队预结单打印机',
  }, {
    key: 'styleId6',
    type: String,
    text: '团队预结单打印样式ID',
  }, {
    key: 'isEnable7',
    type: Boolean,
    text: '选中的设置类（留台单）',
  }, {
    key: 'printQty7',
    type: Number,
    text: '留台单打印份数',
  }, {
    key: 'printer7',
    type: String,
    text: '留台单打印机',
  }, {
    key: 'styleId7',
    type: String,
    text: '留台单打印样式ID',
  }, {
    key: 'isEnable8',
    type: Boolean,
    text: '选中的设置类（加单标签）',
  }, {
    key: 'printQty8',
    type: Number,
    text: '加单标签打印份数',
  }, {
    key: 'printer8',
    type: String,
    text: '加单标签打印机',
  }, {
    key: 'styleId8',
    type: String,
    text: '加单标签打印样式ID',
  }, {
    key: 'isEnable10',
    type: Boolean,
    text: '选中的设置类（退单总单）',
  }, {
    key: 'printQty10',
    type: Number,
    text: '退单总单打印份数',
  }, {
    key: 'printer10',
    type: String,
    text: '退单总单打印机',
  }, {
    key: 'styleId10',
    type: String,
    text: '退单总单打印样式ID',
  }, {
    key: 'isEnable11',
    type: Boolean,
    text: '选中的设置类（更换客位单）',
  }, {
    key: 'printQty11',
    type: Number,
    text: '更换客位打印份数',
  }, {
    key: 'printer11',
    type: String,
    text: '更换客位打印机',
  }, {
    key: 'styleId11',
    type: String,
    text: '更换客位打印样式ID',
  }, {
    key: 'isEnable12',
    type: Boolean,
    text: '未知',
  }, {
    key: 'printQty12',
    type: Number,
    text: '未知',
  }, {
    key: 'printer12',
    type: String,
    text: '未知',
  }, {
    key: 'styleId12',
    type: String,
    text: '未知',
  }, {
    key: 'isEnable13',
    type: Boolean,
    text: '未知',
  }, {
    key: 'printQty13',
    type: Number,
    text: '未知',
  }, {
    key: 'printer13',
    type: String,
    text: '未知',
  }, {
    key: 'styleId13',
    type: String,
    text: '未知',
  }, {
    key: 'isEnable14',
    type: Boolean,
    text: '未知',
  }, {
    key: 'printQty14',
    type: Number,
    text: '未知',
  }, {
    key: 'printer14',
    type: String,
    text: '未知',
  }, {
    key: 'styleId14',
    type: String,
    text: '未知',
  }, {
    key: 'isEnable15',
    type: Boolean,
    text: '未知',
  }, {
    key: 'printQty15',
    type: Number,
    text: '未知',
  }, {
    key: 'printer15',
    type: String,
    text: '未知',
  }, {
    key: 'styleId15',
    type: String,
    text: '未知',
  }, {
    key: 'isEnable16',
    type: Boolean,
    text: '未知',
  }, {
    key: 'printQty16',
    type: Number,
    text: '未知',
  }, {
    key: 'printer16',
    type: String,
    text: '未知',
  }, {
    key: 'styleId16',
    type: String,
    text: '未知',
  }, {
    key: 'isEnable17',
    type: Boolean,
    text: '未知',
  }, {
    key: 'printQty17',
    type: Number,
    text: '未知',
  }, {
    key: 'printer17',
    type: String,
    text: '未知',
  }, {
    key: 'styleId17',
    type: String,
    text: '未知',
  }, {
    key: 'isEnable18',
    type: Boolean,
    text: '未知',
  }, {
    key: 'printQty18',
    type: Number,
    text: '未知',
  }, {
    key: 'printer18',
    type: String,
    text: '未知',
  }, {
    key: 'styleId18',
    type: String,
    text: '未知',
  }, {
    key: 'isEnable19',
    type: Boolean,
    text: '未知',
  }, {
    key: 'printQty19',
    type: Number,
    text: '未知',
  }, {
    key: 'printer19',
    type: String,
    text: '未知',
  }, {
    key: 'styleId19',
    type: String,
    text: '未知',
  }, {
    key: 'isEnable20',
    type: Boolean,
    text: '未知',
  }, {
    key: 'printQty20',
    type: Number,
    text: '未知',
  }, {
    key: 'printer20',
    type: String,
    text: '未知',
  }, {
    key: 'styleId20',
    type: String,
    text: '未知',
  }, {
    key: 'isEnable21',
    type: Boolean,
    text: '未知',
  }, {
    key: 'printQty21',
    type: Number,
    text: '未知',
  }, {
    key: 'printer21',
    type: String,
    text: '未知',
  }, {
    key: 'styleId21',
    type: String,
    text: '未知',
  }, {
    key: 'isEnable22',
    type: Boolean,
    text: '未知',
  }, {
    key: 'printQty22',
    type: Number,
    text: '未知',
  }, {
    key: 'printer22',
    type: String,
    text: '未知',
  }, {
    key: 'styleId22',
    type: String,
    text: '未知',
  }, {
    key: 'isEnable23',
    type: Boolean,
    text: '未知',
  }, {
    key: 'printQty23',
    type: Number,
    text: '未知',
  }, {
    key: 'printer23',
    type: String,
    text: '未知',
  }, {
    key: 'styleId23',
    type: String,
    text: '未知',
  }, {
    key: 'isEnable24',
    type: Boolean,
    text: '未知',
  }, {
    key: 'printQty24',
    type: Number,
    text: '未知',
  }, {
    key: 'printer24',
    type: String,
    text: '未知',
  }, {
    key: 'styleId24',
    type: String,
    text: '未知',
  }, {
    key: 'isEnable25',
    type: Boolean,
    text: '未知',
  }, {
    key: 'printQty25',
    type: Number,
    text: '未知',
  }, {
    key: 'printer25',
    type: String,
    text: '未知',
  }, {
    key: 'styleId25',
    type: String,
    text: '未知',
  }, {
    key: 'isEnable26',
    type: Boolean,
    text: '未知',
  }, {
    key: 'printQty26',
    type: Number,
    text: '未知',
  }, {
    key: 'printer26',
    type: String,
    text: '未知',
  }, {
    key: 'styleId26',
    type: String,
    text: '未知',
  }, {
    key: 'isEnable27',
    type: Boolean,
    text: '未知',
  }, {
    key: 'printQty27',
    type: Number,
    text: '未知',
  }, {
    key: 'printer27',
    type: String,
    text: '未知',
  }, {
    key: 'styleId27',
    type: String,
    text: '未知',
  }, {
    key: 'isEnable28',
    type: Boolean,
    text: '未知',
  }, {
    key: 'printQty28',
    type: Number,
    text: '未知',
  }, {
    key: 'printer28',
    type: String,
    text: '未知',
  }, {
    key: 'styleId28',
    type: String,
    text: '未知',
  }, {
    key: 'qrcodeType2',
    type: Number,
    text: '预结单二维码打印类型',
  }, {
    key: 'scaleMode',
    type: Number,
    text: '电子秤类型',
  }, {
    key: 'isSupportNewWeight',
    type: Boolean,
    text: '当前电子秤是否是支持去皮功能的电子秤',
  }, {
    key: 'isNetWeight',
    type: Boolean,
    text: '是否开启电子秤去皮功能',
  }, {
    key: 'scalePort',
    type: Number,
    text: '电子秤端口',
  }, {
    key: 'screenMode',
    type: Number,
    text: '客显类型',
  }, {
    key: 'screenPort',
    type: Number,
    text: '客显端口',
  }, {
    key: 'settingValue',
    type: String,
    text: '设置类型实际值，这里对应【厂商】',
  }, {
    key: 'readCardOpt',
    type: Object,
    text: '获取会员卡号需要用到的参数',
  }, {
    key: 'groupLightReadCardOpt',
    type: Object,
    text: '获取群光会员卡号需要用到的参数',
  }],
};
