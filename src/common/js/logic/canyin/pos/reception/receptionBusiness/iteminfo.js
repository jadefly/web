import { map, keys, each } from 'lodash';
import transItems from '@/common/js/logic/transitems';

function transItemLimitsMap(limits) {
  if (keys(limits).length) {
    each(limits, (item) => {
      // eslint-disable-next-line no-param-reassign
      item.maxLimit = item.restQuantity;
    });
    return limits;
  }
  return {};
}

function createItemBarCodeObj(arr) {
  const obj = Object.create(null);
  arr.map((item, index) => {
    const { itemBarcodeStr } = item;
    let codeArr = [];
    if (itemBarcodeStr) {
      if (itemBarcodeStr.indexOf(',') > -1) {
        codeArr = itemBarcodeStr.split(',');
      }
      if (codeArr && codeArr.length > 0) {
        codeArr.map((item2) => {
          obj[item2] = index;
          return item2;
        });
      } else {
        obj[itemBarcodeStr] = index;
      }
    }
    return item;
  });
  return Object.freeze(obj);
}


export const url = '/canyin/pos/reception/receptionbusiness/receptionbusinessiteminfov2';
export function trans(data) {
  let itemsMoreBarcode = null;
  if (+data.code === 1) {
    itemsMoreBarcode = map(data.data.itemsMoreBarcode, (item) => {
      const otherPrice = {};
      for (let i = 0; i < 10; i += 1) {
        if (item[`other_price${i}`] || item[`other_price${i}`] === 0) {
          otherPrice[i] = item[`other_price${i}`];
        }
      } // 品项列表
      return Object.preventExtensions({
        itemBarcodeStr: item.itemBarcodeStr,
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
        isCancelDepositItem: !!item.isCancelDepositItem, // 是否是退押金品项
        haveRequiredMethod: item.haveRequiredMethod, // 菜品是否关联了必选的做法
        classCode: item.classCode,
        className: item.className,
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
        promoteLimit: item.promoteLimitedQty, // 促销限定数量
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
        pkgType: item.pkgType, // 套餐类型
        rownumber: item.rownumber, // 行数
        customGroupId: item.customGroupId,
        isMultiPrice: item.is_multi_price_plan, // 一菜多价
        memberPrice: item.memberPrice, // 会员价
        minAddQty: item.minAddQty, // 最小加单数
        maxAddQty: item.maxAddQty, // 最大加单数
        isItemTimePrice: item.isItemTimePrice, // 是否是时价品项
        isPincai: item.isPincai,
        memberPlanId: item.memberPlanId ? item.memberPlanId : null, // 销售会员价方案ID
        promotePlanId: item.promotePlanId ? item.promotePlanId : null, // 促销价方案ID
        isPack: false, // 打包默认值
        pointGroupId: item.pointGroupId, // 关联客位的分组id
        auxiliaryUnitQty: item.auxiliaryUnitQty, // 辅助单位数量
        auxiliaryUnitName: item.auxiliaryUnitName, // 辅助单位名称
        auxiliaryUnitId: item.auxiliaryUnitId, // // 辅助单位id
        isMemberExclusive: item.isMemberExclusive, // 促销价格是否是会员专享
        isExchange: item.isExchange, // 是否是单品按数量换购方案
      });
    });
  }
  return data.code === '1' ? {
    success: true,
    data: {
      publicMethodClass: data.data.allPublicMethodClassJson, // 所有通用做法类别
      itemBigClasses: data.data.itemBigClasses, // 品项大类
      itemLimitsMap: transItemLimitsMap(data.data.itemLimitsMap), // 限量信息
      promoteLimitMap: data.data.promoteLimitMap, // 促销限量数信息
      itemSelloutsMap: data.data.itemSelloutsMap,
      itemTimePricesMap: data.data.itemTimePricesMap || {},
      itemSmallClasses: data.data.itemSmallClasses, // 品相小类
      itemTempBigClasses: data.data.itemTempBigClasses, // 临时品项大类
      itemTempSmallClasses: data.data.itemTempSmallClasses, // 临时品项小类
      tempItemModuleAuth: data.data.tempItemModuleAuth, // 临时品项权限
      itemTemps: map(data.data.itemTemps, item => ({
        id: item.itemId,
        code: item.code,
        pinyin: item.pinyin,
        smallClassId: item.smallClassId,
        name: item.name,
      })),
      items: transItems(data.data.items),
      mateIdGetItemsIndex: Object.freeze(data.data.items.reduce((prev, cur, index) => ({ ...prev, [`${cur.realItemId}_${cur.itemSizeId}`]: index }), {})),
      mateCodeGetItemsIndex: Object.freeze(data.data.items.reduce((prev, cur, index) => {
        if (cur.code) {
          return { ...prev, [cur.code]: index };
        }
        return prev;
      }, {})),
      mateBarcodeItemsIndex: Object.freeze(data.data.items.reduce((prev, cur, index) => {
        if (cur.barcode) {
          return { ...prev, [cur.barcode]: index };
        }
        return prev;
      }, {})),
      mateAidcodeItemsIndex: Object.freeze(data.data.items.reduce((prev, cur, index) => {
        if (cur.aidCode) {
          return { ...prev, [cur.aidCode]: index };
        }
        return prev;
      }, {})),
      itemsMoreBarcode, // 多条码数据
      ArrangeMenu: data.data.itemsMoreBarcode.map(item => Object.freeze(item)), // 没经过key转变的品项数据
      createItemBarCodeObj: createItemBarCodeObj(itemsMoreBarcode),
      privateMethodListJson: data.data.privateMethodListJson, // 所有专用做法
      publicMethodClassJson: data.data.publicMethodClassJson, // 所有通用做法
      publicMethodListJson: data.data.publicMethodListJson, // 所有通用做法
      itemCustomClasses: data.data.itemCustomClasses
        ? data.data.itemCustomClasses
        : null, // 品项自定义分类
    },
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
