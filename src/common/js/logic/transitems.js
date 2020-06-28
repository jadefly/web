import { map } from 'lodash';

export default function transItems(list) {
  return map(list, (item) => {
    const otherPrice = {};
    for (let i = 0; i < 10; i += 1) {
      if (item[`other_price${i}`] || item[`other_price${i}`] === 0) {
        otherPrice[i] = item[`other_price${i}`];
      }
    } // 品项列表
    return Object.preventExtensions({
      aidCode: item.aidCode,
      id: item.realItemId, // 菜品真是 ID
      realItemId: item.realItemId, // 菜品真是 ID
      barcode: item.barcode, // 商品条码
      itemId: item.itemId, // 带规格的品项 ID
      sizeId: item.itemSizeId, // 规格 ID
      sizeName: item.sizeName,
      smallClassId: item.smallClassId, // 小类 ID
      bigClassId: item.bigClassId, // 大类 ID
      name: item.name, // 品项名称
      itemName: item.itemName, // 带规格的品项名称
      pinyin: item.pinyin, // 拼音
      unitId: item.unitId, // 单位 ID
      unitName: item.unitName, // 单位名称
      methodCount: item.methodCount, // 做法数量
      haveRequiredMethod: item.haveRequiredMethod, // 菜品是否关联了必选的做法
      classCode: item.classCode,
      isCancelDepositItem: !!item.isCancelDepositItem, // 是否是退押金品项
      className: item.className,
      promoteLimit: item.promoteLimitedQty, // 促销限定数量
      code: item.code, // Code
      price: item.price, // 价格
      otherPrice, // 区域价格的组合
      salePrice: item.salePrice, // 销售价格
      priceType: item.priceType, // 价格类型
      promotePrice: item.promotePrice, // 促销价格
      stdPrice: item.stdPrice, // 原始价格
      costPrice: item.costPrice, // 成本价格
      oldPrice: item.oldPrice, // 原始价格
      oldPriceType: item.oldPriceType, // 原始价格类型
      defaultPriceType: item.priceType,
      discFlg: item.discFlg, // 打折状态
      oldDisFlg: item.discFlg,
      enableHalf: item.enableHalf, // 允许半价
      enableMutiSize: item.enableMutiSize, // 允许多规格
      isBuffet: item.isBuffet, // 是否是自助
      isCanDiscount: item.isCanDiscount, // 是否允许打折
      isConfirmWeigh: item.isConfirmWeigh, // 是否是称重确认品项
      isEnable: item.isEnable, // 是否允许
      isNegativePrice: item.isNegativePrice, // 是否允许负金额品项
      isPackage: item.isPackage, // 是否为套餐
      isSellout: item.isSellout === 1, // 是否被估清
      isSingleMethod: item.isSingleMethod, // 专用做法是多选还是单选
      isWeighed: item.isWeighed, // 是否是称重品项
      isDefault: item.isDefault, // 当前多规格品项是否有默认规格
      pkgType: item.pkgType, // 套餐类型
      rownumber: item.rownumber, // 行数
      customGroupId: item.customGroupId,
      isMultiPrice: item.is_multi_price_plan, // 一菜多价
      memberPrice: item.memberPrice, // 会员价
      minAddQty: item.minAddQty, // 最小加单数
      maxAddQty: item.maxAddQty, // 最大加单数
      isItemTimePrice: item.isItemTimePrice, // 是否是时价品项
      isPincai: item.isPincai,
      enableEasyDiskModifyQty: item.enableEasyDiskModifyQty, // 快速修改数量
      memberPlanId: item.memberPlanId ? item.memberPlanId : null, // 销售会员价方案ID
      promotePlanId: item.promotePlanId ? item.promotePlanId : null, // 促销价方案ID
      isPack: false, // 打包默认值
      pointGroupId: item.pointGroupId, // 关联客位分组的id
      auxiliaryUnitQty: item.auxiliaryUnitQty || 1, // 辅助单位数量 默认为1
      auxiliaryUnitName: item.auxiliaryUnitName, // 辅助单位名称
      auxiliaryUnitId: item.auxiliaryUnitId, // // 辅助单位id
      isMemberExclusive: item.isMemberExclusive, // 促销价格是否是会员专享
      isExchange: item.isExchange, // 是否是单品按数量换购方案
    });
  });
}
