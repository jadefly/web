import { find } from 'lodash';

const supportNewWeight = [{
  name: '中科英泰ACS-S373',
  id: '8',
}, {
  name: '顶尖PS1X (30CDS[模式:C2])',
  id: '3',
}, {
  name: '容大',
  id: '7',
}, {
  name: '有安(ACS-UAPS-T)',
  id: '9',
}, {
  name: '智崎(SMART-A188)',
  id: '10',
}, {
  name: '顶尖（PBX-OS2）',
  id: '5',
}, {
  name: '托利多',
  id: '11',
}];

function judgeElectronicScaleId(scaleId) {
  const finded = find(supportNewWeight, { id: scaleId });
  if (finded) {
    return true;
  }
  return false;
}

function judgeBookingPos(currPos, bookPoslist) {
  const finded = find(bookPoslist, ['posId', currPos]);
  if (finded) {
    return true;
  }
  return false;
}

export const url = '/canyin/pos/reception/receptionbusiness/receptionbusinesssyssettingv2';
export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: {
      booking: {
        enable: data.data.isUseBook === '1' && judgeBookingPos(data.data.SYS_SETTING.pos.posId, data.data.bookingPos), // 使用预订权限
        isOpenBookCancelReason: data.data.IsOpenBookCancelReason === '1', // 必须输入取消原因
        // 当前预订对接业务模式: -1:自有业务(吾享线上), 4:食尚订, 5:新荣记, 6:客必得
        bookedPlatform: data.data.bookedPlatform ? data.data.bookedPlatform : null,
        // 预定业务-来电设备线路总数
        devicePathNum: data.data.devicePathNum ? data.data.devicePathNum : 1,
        deviceType: data.data.deviceType, // 设备类型
        isOpenBookCallerID: data.data.isOpenBookCallerID === '1', // 是否启用来电显示
        reservePointMap: data.data.reservePointMap ? data.data.reservePointMap : null, // 预订客位
        executedPoints: [], // 预订执行后的客位id(数组)-setting接口中不含，初始写死
      },
      takeout: {
        // 是否开启外卖
        enable: data.data.isOpenTakeout && data.data.takeoutPOS === data.data.SYS_SETTING.pos.posId,
        autoMakeTime: parseInt(data.data.autoMakeTime, 0), // 自动制作提前时间
        isAutoConfim: data.data.ifAutoConfirm, // 是否自动接单,
        isAutoDistributionPrint: data.data.isAutoDistributionPrint, // 是否自动打印配送单,
        isAutoMake: data.data.isAutoMake, // 是否自动制作
        isAutoSettleGlobal: data.data.isAutoSettleGlobal, // 是否自动结算
        isAutoSettleNoPay: data.data.isAutoSettleNoPay, // 是否自动结算货到付款单
        isPrintSettle: data.data.isPrintSettleTakeOut, // 是否打印结账单
        lunchboxItemId: data.data.lunchboxItemId, // 餐盒费品项
        psFeeItemID: data.data.psFeeItemID, // 配送费品项
        haveTakeoutPhone: data.data.haveTakeoutPhone, // 是否启用电话外卖
        takeoutDeviceType: data.data.takeoutDeviceType, // 电话设备类型
        isNewTakeoutPhoneOrder: data.data.isNewTakeoutPhoneOrder, // 是否开启电话外卖单业务
      },
      device: {
        deviceManagerVersion: data.data.SYS_SETTING.site.dmVersion, // 设备管理器版本号
        baudRate: Number(data.data.SYS_SETTING.pos.baudRate), // 客显波特率
        cashboxBrand: data.data.SYS_SETTING.pos.cashboxBrand, // 钱箱品牌
        cashboxBrandType: data.data.SYS_SETTING.pos.cashboxBrandType, // 钱箱型号
        cashboxPrint: data.data.SYS_SETTING.pos.cashboxPrint, // 钱箱-打印机
        cashboxStartCommand: data.data.SYS_SETTING.pos.cashboxStartCommand, // 打开钱箱指令
        cashboxStyle: data.data.SYS_SETTING.pos.cashboxStyle, // 用于区分类型标志位 '1'：按接口设置 '2'：按厂商设置
        cashboxUseMode: data.data.SYS_SETTING.pos.cashboxUseMode, // 按接口设置
        // code: data.data.SYS_SETTING.pos.code,  // 未知 值为 null
        enableCashbox: data.data.SYS_SETTING.pos.enableCashbox === 'true', // 是否启用钱箱
        enableScale: data.data.SYS_SETTING.pos.enableScale === 'true', // 是否启用电子秤
        enableScreen: data.data.SYS_SETTING.pos.enableScreen === 'true', // 是否启用客显
        enableVice: data.data.SYS_SETTING.pos.enableVice === 'true', // 是否启用副屏
        enableYiPan: data.data.SYS_SETTING.pos.enableYiPan === 'true', // 是否启用易盘
        enableZhiPan: data.data.SYS_SETTING.pos.enableZhiPan === 'true', // 是否启用智盘
        isEnable1: data.data.SYS_SETTING.pos.isEnable1 === 'true', // 选中的设置类型（结账单）
        printQty1: parseInt(data.data.SYS_SETTING.pos.printQty1, 10), // 结账单打印份数
        printer1: data.data.SYS_SETTING.pos.printer1, // 结账单打印机
        styleId1: data.data.SYS_SETTING.pos.styleId1, // 结账单打印样式 ID
        isEnable2: data.data.SYS_SETTING.pos.isEnable2 === 'true', // 选中的设置类型（预结单）
        printQty2: parseInt(data.data.SYS_SETTING.pos.printQty2, 10), // 预结单打印份数
        printer2: data.data.SYS_SETTING.pos.printer2, // 预结单打印机
        styleId2: data.data.SYS_SETTING.pos.styleId2, // 预结单打印样式 ID
        isEnable3: data.data.SYS_SETTING.pos.isEnable3 === 'true', // 选中的设置类型（客用单）
        printQty3: parseInt(data.data.SYS_SETTING.pos.printQty3, 10), // 客用单打印份数
        printer3: data.data.SYS_SETTING.pos.printer3, // 客用单打印机
        styleId3: data.data.SYS_SETTING.pos.styleId3, // 客用单打印样式 ID
        isEnable4: data.data.SYS_SETTING.pos.isEnable4 === 'true', // 选中的设置类型（结班单）
        printQty4: parseInt(data.data.SYS_SETTING.pos.printQty4, 10), // 结班单打印份数
        printer4: data.data.SYS_SETTING.pos.printer4, // 结班单打印机
        styleId4: data.data.SYS_SETTING.pos.styleId4, // 结班单打印样式 ID
        isEnable5: data.data.SYS_SETTING.pos.isEnable5 === 'true', // 选中的设置类型（团队结账单）
        printQty5: parseInt(data.data.SYS_SETTING.pos.printQty5, 10), // 团队结账单打印份数
        printer5: data.data.SYS_SETTING.pos.printer5, // 团队结账单打印机
        styleId5: data.data.SYS_SETTING.pos.styleId5, // 团队结账单打印样式 ID
        isEnable6: data.data.SYS_SETTING.pos.isEnable6 === 'true', // 选中的设置类型（团队预结单）
        printQty6: parseInt(data.data.SYS_SETTING.pos.printQty6, 10), // 团队预结单打印份数
        printer6: data.data.SYS_SETTING.pos.printer6, // 团队预结单打印机
        styleId6: data.data.SYS_SETTING.pos.styleId6, // 团队预结单打印样式 ID
        isEnable7: data.data.SYS_SETTING.pos.isEnable7 === 'true', // 未知（可能是留台单）
        printQty7: parseInt(data.data.SYS_SETTING.pos.printQty7, 10), // 留台单打印份数
        printer7: data.data.SYS_SETTING.pos.printer7, // 留台单打印机
        styleId7: data.data.SYS_SETTING.pos.styleId7, // 留台单打印样式 ID
        isEnable8: data.data.SYS_SETTING.pos.isEnable8 === 'true', // 未知（可能是加单标签）
        printQty8: parseInt(data.data.SYS_SETTING.pos.printQty8, 10), // 加单标签打印份数
        printer8: data.data.SYS_SETTING.pos.printer8, // 加单标签打印机
        styleId8: data.data.SYS_SETTING.pos.styleId8, // 加单标签打印样式 ID
        isEnable10: data.data.SYS_SETTING.pos.isEnable10 === 'true', // 未知（可能是退单总单）
        printQty10: parseInt(data.data.SYS_SETTING.pos.printQty10, 10), // 退单总单打印份数
        printer10: data.data.SYS_SETTING.pos.printer10, // 退单总单打印机
        styleId10: data.data.SYS_SETTING.pos.styleId10, // 退单总单打印样式 ID
        isEnable11: data.data.SYS_SETTING.pos.isEnable11 === 'true', // 未知（可能是更换客位单）
        printQty11: parseInt(data.data.SYS_SETTING.pos.printQty11, 10), // 更换客位打印份数
        printer11: data.data.SYS_SETTING.pos.printer11, // 更换客位打印机
        styleId11: data.data.SYS_SETTING.pos.styleId11, // 更换客位打印样式 ID
        isEnable12: data.data.SYS_SETTING.pos.isEnable12 === 'true', // 未知
        printQty12: parseInt(data.data.SYS_SETTING.pos.printQty12, 10), // 未知
        printer12: data.data.SYS_SETTING.pos.printer12, // 未知 值为 null
        styleId12: data.data.SYS_SETTING.pos.styleId12, // 未知打印样式 ID
        isEnable13: data.data.SYS_SETTING.pos.isEnable13 === 'true', // 未知
        printQty13: parseInt(data.data.SYS_SETTING.pos.printQty13, 10), // 未知
        printer13: data.data.SYS_SETTING.pos.printer13, // 未知 值为 null
        styleId13: data.data.SYS_SETTING.pos.styleId13, // 未知打印样式 ID
        isEnable14: data.data.SYS_SETTING.pos.isEnable14 === 'true', // 未知
        printQty14: parseInt(data.data.SYS_SETTING.pos.printQty14, 10), // 未知
        printer14: data.data.SYS_SETTING.pos.printer14, // 未知 值为 null
        styleId14: data.data.SYS_SETTING.pos.styleId14, // 未知打印样式 ID
        isEnable15: data.data.SYS_SETTING.pos.isEnable15 === 'true', // 未知
        printQty15: parseInt(data.data.SYS_SETTING.pos.printQty15, 10), // 未知
        printer15: data.data.SYS_SETTING.pos.printer15, // 未知 值为 null
        styleId15: data.data.SYS_SETTING.pos.styleId15, // 未知打印样式 ID
        isEnable16: data.data.SYS_SETTING.pos.isEnable16 === 'true', // 未知
        printQty16: parseInt(data.data.SYS_SETTING.pos.printQty16, 10), // 未知
        printer16: data.data.SYS_SETTING.pos.printer16, // 未知 值为 null
        styleId16: data.data.SYS_SETTING.pos.styleId16, // 未知打印样式 ID
        isEnable17: data.data.SYS_SETTING.pos.isEnable17 === 'true', // 未知
        printQty17: parseInt(data.data.SYS_SETTING.pos.printQty17, 10), // 未知
        printer17: data.data.SYS_SETTING.pos.printer17, // 未知 值为 null
        styleId17: data.data.SYS_SETTING.pos.styleId17, // 未知打印样式 ID
        isEnable18: data.data.SYS_SETTING.pos.isEnable18 === 'true', // 未知
        printQty18: parseInt(data.data.SYS_SETTING.pos.printQty18, 10), // 未知
        printer18: data.data.SYS_SETTING.pos.printer18, // 未知 值为 null
        styleId18: data.data.SYS_SETTING.pos.styleId18, // 未知打印样式 ID
        isEnable19: data.data.SYS_SETTING.pos.isEnable19 === 'true', // 未知
        printQty19: parseInt(data.data.SYS_SETTING.pos.printQty19, 10), // 未知
        printer19: data.data.SYS_SETTING.pos.printer19, // 未知 值为 null
        styleId19: data.data.SYS_SETTING.pos.styleId19, // 未知打印样式 ID
        isEnable20: data.data.SYS_SETTING.pos.isEnable20 === 'true', // 未知
        printQty20: parseInt(data.data.SYS_SETTING.pos.printQty20, 10), // 未知
        printer20: data.data.SYS_SETTING.pos.printer20, // 未知 值为 null
        styleId20: data.data.SYS_SETTING.pos.styleId20, // 未知打印样式 ID
        isEnable21: data.data.SYS_SETTING.pos.isEnable21 === 'true', // 厨房管理传菜单
        printQty21: parseInt(data.data.SYS_SETTING.pos.printQty21, 10), // 厨房管理传菜单打印份数
        printer21: data.data.SYS_SETTING.pos.printer21, // 厨房管理传菜单打印机
        styleId21: data.data.SYS_SETTING.pos.styleId21, // 厨房管理传菜单打印样式 ID
        isEnable22: data.data.SYS_SETTING.pos.isEnable22 === 'true', // 鲜果时间 - 时段统计报表
        printQty22: parseInt(data.data.SYS_SETTING.pos.printQty22, 10), // 鲜果时间 - 时段统计报表打印份数
        printer22: data.data.SYS_SETTING.pos.printer22, // 鲜果时间 - 时段统计报表打印机
        styleId22: data.data.SYS_SETTING.pos.styleId22, // 鲜果时间 - 时段统计报表打印样式 ID
        isEnable23: data.data.SYS_SETTING.pos.isEnable23 === 'true', // 厨房管理配菜单
        printQty23: parseInt(data.data.SYS_SETTING.pos.printQty23, 10), // 厨房管理配菜单打印份数
        printer23: data.data.SYS_SETTING.pos.printer23, // 厨房管理配菜单打印机
        styleId23: data.data.SYS_SETTING.pos.styleId23, // 厨房管理配菜单打印样式 ID
        isEnable24: data.data.SYS_SETTING.pos.isEnable24 === 'true', // 会员业务 - 充值
        printQty24: parseInt(data.data.SYS_SETTING.pos.printQty24, 10), // 会员业务 - 充值打印份数
        printer24: data.data.SYS_SETTING.pos.printer24, // 会员业务 - 充值打印机
        styleId24: data.data.SYS_SETTING.pos.styleId24, // 会员业务 - 充值打印样式 ID
        isEnable25: data.data.SYS_SETTING.pos.isEnable25 === 'true', // 会员业务 - 退临时卡
        printQty25: parseInt(data.data.SYS_SETTING.pos.printQty25, 10), // 会员业务 - 退临时卡打印份数
        printer25: data.data.SYS_SETTING.pos.printer25, // 会员业务 - 退临时卡打印机
        styleId25: data.data.SYS_SETTING.pos.styleId25, // 会员业务 - 退临时卡打印样式 ID
        isEnable26: data.data.SYS_SETTING.pos.isEnable26 === 'true', // 会员业务 - 卡消费查询
        printQty26: parseInt(data.data.SYS_SETTING.pos.printQty26, 10), // 会员业务 - 卡消费查询打印份数
        printer26: data.data.SYS_SETTING.pos.printer26, // 会员业务 - 卡消费查询打印机
        styleId26: data.data.SYS_SETTING.pos.styleId26, // 会员业务 - 卡消费查询打印样式 ID
        isEnable27: data.data.SYS_SETTING.pos.isEnable27 === 'true', // 会员业务 - 充值撤销
        printQty27: parseInt(data.data.SYS_SETTING.pos.printQty27, 10), // 会员业务 - 充值撤销打印份数
        printer27: data.data.SYS_SETTING.pos.printer27, // 会员业务 - 充值撤销打印机
        styleId27: data.data.SYS_SETTING.pos.styleId27, // 会员业务 - 充值撤销打印样式 ID
        isEnable28: data.data.SYS_SETTING.pos.isEnable28, // 未知 值为 null
        printQty28: data.data.SYS_SETTING.pos.printQty28, // 位置 职位 null
        printer28: data.data.SYS_SETTING.pos.printer28, // 未知 值为 null
        styleId28: data.data.SYS_SETTING.pos.styleId28, // 未知 值为 null
        qrcodeType2: data.data.SYS_SETTING.pos.qrcodeType2, // 预结单二维码打印类型
        scaleMode: Number(data.data.SYS_SETTING.pos.scaleMode), // 电子秤类型
        isSupportNewWeight: data.data.SYS_SETTING.pos.scaleMode
          ? judgeElectronicScaleId(data.data.SYS_SETTING.pos.scaleMode)
          : false, // 当前电子秤是否是支持去皮功能的电子秤
        isNetWeight: data.data.isNetWeight === '1', // 是否开启电子秤去皮功能
        scalePort: Number(data.data.SYS_SETTING.pos.scalePort), // 电子秤端口
        screenMode: Number(data.data.SYS_SETTING.pos.screenMode), // 客显类型
        screenPort: Number(data.data.SYS_SETTING.pos.screenPort), // 客显端口
        settingValue: data.data.SYS_SETTING.pos.settingValue, // 设置类型实际值，这里对应[厂商] 值为 null
        readCardOpt: data.data.readCardOpt, // 获取会员卡号需要用到的参数
        groupLightReadCardOpt: data.data.groupLightReadCardOpt, // 获取群光会员卡号需要用到的参数
      },
      pos: {
        electronicScaleUnit: Number(data.data.electronicScaleUnit), // 电子秤点位，0：公斤 1：斤
        POSReservedDecimal: Number(data.data.POSReservedDecimal), // pos保留位数 默认3位
        POSWeighingUnit: Number(data.data.POSWeighingUnit), // pos称重单位 0：公斤 1：斤 2：克
        crmVersion: data.data.crmVersion, // CRM 版本
        enableCrm: data.data.isDisplayMemberTab !== 0, // 是否允许使用会员模块
        enableCrm7: data.data.isDisplayCrm7Tab !== 0, // 是否允许使用crm7会员模块
        websocketContextPath: data.data.WS_CONTEXTPATH, // WebSocket 路径
        controlMode: data.data.SYS_SETTING.pos.controlMode, // Pos 操作模式
        createShopId: data.data.SYS_SETTING.pos.createShopId, // 创建店 ID 值为 null
        createShopName: data.data.SYS_SETTING.pos.createShopName, // （虚列）创建店 值为 null
        createTime: data.data.SYS_SETTING.pos.createTime, // 创建时间 值为 null
        creatorId: data.data.SYS_SETTING.pos.creatorId, // 创建人 ID 值为 null
        creatorName: data.data.SYS_SETTING.pos.creatorName, // （虚列）创建人 值为 null
        delflg: data.data.SYS_SETTING.pos.delflg, // 删除标识 值为 null
        downloadFlg: data.data.SYS_SETTING.pos.downloadFlg, // 下载标识 值为 null
        enableBill: data.data.SYS_SETTING.pos.enableBill, // 是否结账单
        enableGuestBill: data.data.SYS_SETTING.pos.enableGuestBill, // 是否客用单
        enableGuestQtyChange: data.data.SYS_SETTING.pos.enableGuestQtyChange, // 是否更改人数单
        enableItemToBill: data.data.SYS_SETTING.pos.enableItemToBill, // 是否单品转台单
        enableOnlineConfirm: data.data.SYS_SETTING.pos.enableOnlineConfirm, // 是否线上点菜确认单
        enablePointChange: data.data.SYS_SETTING.pos.enablePointChange, // 是否更换客位单
        enablePosWipeZero: data.data.SYS_SETTING.pos.enablePosWipeZero === 'true', // 是否启用按 Pos 设置抹零方式
        enablePreBill: data.data.SYS_SETTING.pos.enablePreBill, // 是否预结单
        enableTotalPart: data.data.SYS_SETTING.pos.enableTotalPart, // 是否总单与分单
        enterMainBiz: data.data.SYS_SETTING.pos.enterMainBiz === '1', // 录单模式再次登录不进行 Pos 选择
        isBuffetOrderPos: data.data.SYS_SETTING.pos.isBuffetOrderPos, // 未知 值为 null
        isFoodPlazaPos: data.data.SYS_SETTING.pos.isFoodPlazaPos, // 未知 值为 null
        isLimitItemClass: data.data.SYS_SETTING.pos.isLimitItemClass === 'true', // 未知
        isPosToTakeout: data.data.SYS_SETTING.pos.isPosToTakeout,
        isShieldReserveOrder: data.data.SYS_SETTING.pos.isShieldReserveOrder === 'true', // 是否屏蔽预点单（快餐模式专用）
        isShieldReserveOrderAfterPay: data.data.SYS_SETTING.pos.isShieldReserveOrderAfterPay === 'true', // 是否屏蔽在线付（收银模式专用）
        modifierId: data.data.SYS_SETTING.pos.modifierId, // 修改人 ID 值为 null
        modifierName: data.data.SYS_SETTING.pos.modifierName, // （虚列）修改人 值为 null
        modifyTime: data.data.SYS_SETTING.pos.modifyTime, // 最后修改时间 值为 null
        name: data.data.SYS_SETTING.pos.name, // 未知 值为 null
        pinyin: data.data.SYS_SETTING.pos.pinyin, // 拼音字母 值为 null
        pk: data.data.SYS_SETTING.pos.pk, // 未知
        posBanFastFoodBtnJson: data.data.SYS_SETTING.pos.posBanFastFoodBtnJson, // 未知 值为 null
        posEmpLimit: data.data.SYS_SETTING.pos.posEmpLimit, // 未知 值为 null
        posId: data.data.SYS_SETTING.pos.posId,
        posItemClassLimit: data.data.SYS_SETTING.pos.posItemClassLimit, // 未知 值为 null
        posItemExcludeLimit: data.data.SYS_SETTING.pos.posItemExcludeLimit, // 未知 值为 null
        posItemLimit: data.data.SYS_SETTING.pos.posItemLimit, // 未知 值为 null
        posKitchenItemFilter: data.data.SYS_SETTING.pos.posKitchenItemFilter, // 未知 值为 ''
        posKitchenKDSMode: data.data.SYS_SETTING.pos.posKitchenKDSMode, // 未知 值为 '0'
        posKitchenMode: data.data.SYS_SETTING.pos.posKitchenMode, // 未知 值为 ''
        posReservePoint: data.data.SYS_SETTING.pos.posReservePoint, // Pos 管理的预点单客位
        // posSecondSet: data.data.SYS_SETTING.pos.posSecondSet.isSecondPos ? {
        //   id: data.data.SYS_SETTING.pos.posSecondSet.posId, // 主键
        //   isSecondPos: data.data.SYS_SETTING.pos.posSecondSet.isSecondPos,
        //   // 是否是二级 Pos
        //   secondPosType: data.data.SYS_SETTING.pos.posSecondSet.secondPosType,
        //   二级 Pos 类型 值为 null
        // } : null,
        posSetId: data.data.SYS_SETTING.pos.posSetId, // 配置项目 ID 值为 null
        posSetType: data.data.SYS_SETTING.pos.posSetType, // 配置项目类型 值为 null
        posSetValue: data.data.SYS_SETTING.pos.posSetValue, // 配置项目值 值为 null
        saleType: parseInt(data.data.SYS_SETTING.pos.saleType, 0), // 默认销售类型 1：堂食 2：外带 3：外卖
        uploadFlg: data.data.SYS_SETTING.pos.uploadFlg, // 上传标识 值为 null
        wipeZeroMode: data.data.SYS_SETTING.pos.wipeZeroMode, // 抹零方式
        wipeZeroModeName: data.data.SYS_SETTING.pos.wipeZeroModeName, // 抹零方式名称
        wipeZeroPosition: data.data.SYS_SETTING.pos.wipeZeroPosition, // 抹零位置
        wipeZeroPositionName: data.data.SYS_SETTING.pos.wipeZeroPositionName, // 抹零位置名称
        yiPanListJson: data.data.SYS_SETTING.pos.yiPanListJson, // 未知
        zhiPanListJson: data.data.SYS_SETTING.pos.zhiPanListJson, // 未知
        isEnableMakeMethodGroup: data.data.isEnableMakeMethodGroup === '1', // 是否启用了制作方法
        isAuthCardMandatory: data.data.isAuthCardMandatory === '1', // 是否开启了授权强制使用员工卡
        defaultInvoiceType: Number(data.data.defaultInvoiceType), // 开发票默认类型
        baseCurrency: data.data.baseCurrency, // 本位币
        isInternational: data.data.isInternational, // 是否开启了国际化增值(本位币)
        isUseSeat: data.data.isUseSeat, // 是否启用席数 v187新增
      },
      outDeviceSetting: {
        isAccounAutoOpenCashbox: data.data.SYS_SETTING.sys.outDeviceSetting.IsAccounAutoOpenCashbox === '1',
        isEndOpenCashbox: data.data.SYS_SETTING.sys.outDeviceSetting.IsEndOpenCashbox === '1', // 未知
        isOthersOpenCashbox: data.data.SYS_SETTING.sys.outDeviceSetting.IsOthersOpenCashbox === '1', // 未知
        isStartOpenCashbox: data.data.SYS_SETTING.sys.outDeviceSetting.IsStartOpenCashbox === '1', // 未知
        scaleItemCodeLength:
          parseInt(data.data.SYS_SETTING.sys.outDeviceSetting.scaleItemCodeLength, 0), // 未知
        scaleItemCodeStart:
          parseInt(data.data.SYS_SETTING.sys.outDeviceSetting.scaleItemCodeStart, 0), // 未知
        scaleItemQuantityIntegerLength:
          parseInt(data.data.SYS_SETTING.sys.outDeviceSetting.scaleItemQuantityIntegerLength, 0),
        scaleItemQuantityLength:
          parseInt(data.data.SYS_SETTING.sys.outDeviceSetting.scaleItemQuantityLength, 0),
        scaleItemQuantityStart:
          parseInt(data.data.SYS_SETTING.sys.outDeviceSetting.scaleItemQuantityStart, 0),
      },
      shopId: data.data.shopId,
    },
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
