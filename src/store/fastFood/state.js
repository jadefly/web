export default {
  saleActiveState: 0, // 堂食外带切换状态: 0/1/2 -堂食/外带/外卖
  orderCode: '', // 牌号
  peopleQty: '', // 人数/自助餐总人数
  isContainKDS: false, // 加单中是否包含KDS方案品项
  buffetDeposit: '', // 自助餐押金

  maxPrice: 99999.99, // 品项价格最大值
  billSelected: false, // 左侧菜单被选中
  billCurrentElId: null, // 左侧当前选中项 字符串(lid.id.sizeId.disFlg.reasonId.priceType)
  billCurrentIndex: -1, // 根据当前选择的品项获取品项的下标
  hasDailog: false, // 平铺式中-是否有弹框,如有弹框不关闭平铺弹层

  isLimitOrSellout: false, // 是否进行了限量或估清设置，如果设置了，修改规格时需重新获取最新数据
};
