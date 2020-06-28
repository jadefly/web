import {
  map, pick, extend, cloneDeep, filter, find,
} from 'lodash';
import { guestListBtn, guestMenuBtn, guestPositionBtn } from '@/common/dictionary/pos-custom-btn';
import fastPanelBtn from '@/common/dictionary/pos-fast-footer-btnoptions';
import i18n from '@/locales/index';
import btnOptions from '@/common/dictionary/pos-order-btnoptions';

//  快餐模式下的自定义功能按钮的数据处理
function initFastFoodBtn(fastFoodBtnData, isHiddenHotkey) {
  const btns = isHiddenHotkey ? fastPanelBtn().hiddenHotkey : fastPanelBtn().haveHotkey;
  return map(fastFoodBtnData, (btn) => {
    const fastBtnItem = btns.find(item => item.btnId === btn.btnId);
    // 如果是退押金的按钮对其iconName转化下对应的前端iconName
    if (btn.btnName === 'cancelDeposit') {
      return extend({}, btn, { iconName: 'backDeposit' });
    }
    /** LUNCHBOX(24, "lunchBox", "餐盒"), BAG(25, "bag", "袋子"), LAID(26, "laid", "餐具")
    这三个比较特殊目前先都走默认图标 */
    if (btn.iconName === 'lunchBox' || btn.iconName === 'bag' || btn.iconName === 'laid') {
      return extend({}, btn, { iconName: null });
    }
    if (fastBtnItem && fastBtnItem.hotKey) {
      return extend({}, btn, { hotKeyText: fastBtnItem.hotKeyText, hotKey: fastBtnItem.hotKey });
    }
    return btn;
  });
}
/**
 * @description: 从前台定义好的客位、客单、加单数据中过滤出需要的数据
 * @Author: wy
 * @param {btnData:后台给的数据, initBtnData:自己前台定义好的数据表}
 * @return: 过滤之后的前台数据表
 * @Date: 2019-04-24 15:09:18
 */
function filterCustomBtn(btnData, initBtnData) {
  let initParam = 'text';
  const filterBtnData = btnData.map((items) => {
    const item = items;
    let btnParam = 'text';
    if (item && item.btn_name) {
      btnParam = 'btn_name';
      initParam = 'name';
    }
    const findBtnData = initBtnData.find(itemChild => itemChild[initParam] === item[btnParam]);
    return findBtnData;
    // return Object.assign({}, findBtnData, {
    //   text2: findBtnData ? findBtnData.text : '没有这个按钮！！！',
    // }, item);
  });
  return cloneDeep(filterBtnData.filter(item => item && item[initParam]));
}

function resetCustomBtn(btnData, initBtnData) {
  const transformBtnData = btnData.map((item) => {
    if (item.text.includes('/')) {
      item.text = item.text.split('/')[0];
      if (item.btn_name === 'orderSave') {
        item.text += i18n.t('Biz.Order.OrderMenu');
      }
    }
    return item;
  }).filter(item => item.text);
  return filterCustomBtn(transformBtnData, initBtnData);
}

// 过滤所有按钮
function filterAllBtn(btnData, isDisableShortcutKey) {
  const result = {
    addOrderMenu: [],
    fastfoodAddOrderMenu: [],
    orderMenu: [],
    seatMenu: [],
    settleMenu: [],
  };
  if (btnData) {
    if (btnData.orderMenu && btnData.orderMenu.length) {
      const orderMenu = filter(btnData.orderMenu, item => find(btnOptions(), {
        name: item.btn_name,
      }));
      result.orderMenu = filterCustomBtn(orderMenu, guestListBtn());
    }
    if (btnData.seatMenu && btnData.seatMenu.length) {
      const seatMenu = filter(btnData.seatMenu, item => find(btnOptions(), {
        name: item.btn_name,
      }));
      result.seatMenu = filterCustomBtn(seatMenu, guestPositionBtn());
    }
    if (btnData.addOrderMenu && btnData.addOrderMenu.length) {
      result.addOrderMenu = resetCustomBtn(btnData.addOrderMenu, guestMenuBtn().haveHotkey);
    }
    if (btnData.fastfoodAddOrderMenu && btnData.fastfoodAddOrderMenu.length) {
      result.fastfoodAddOrderMenu = resetCustomBtn(
        btnData.fastfoodAddOrderMenu,
        `${isDisableShortcutKey}` === '1'
          ? guestMenuBtn().noNeedHotKey
          : guestMenuBtn().haveHotkey,
      );
    }
    if (btnData.settleMenu && btnData.settleMenu.length) {
      result.settleMenu = filter(btnData.settleMenu, item => find(btnOptions(), {
        name: item.btn_name,
      }));
    }
  }
  return result;
}

export const url = '/canyin/pos/reception/receptionbusiness/receptionbusinessorderv2';
export function trans(data) {
  const customButtons = filterAllBtn(data.data.customButtons, data.data.isDisableShortcutKey);
  return data.code === '1' ? {
    success: true,
    data: {
      isHaveFullGift: data.data.isHaveFullGift, // 是否有满赠方案
      isHaveFullExchange: data.data.isHaveFullExchange, // 是否有换购方案
      autoTaggingPackingStatus: data.data.autoTaggingPackingStatus === '1', // 销售类型选择非堂食时，已选品项自动标记打包状态
      packTempMethod: data.data.packTempMethod
        ? Object.assign({}, data.data.packTempMethod, { packFlg: true, qty: 1 }) : null, // 打包临时做法
      isForbiddenEditBillAmount: data.data.isForbiddenEditBillAmount === '1', // 争鲜不允许修改账单金额设置 isForbiddenEditBillAmount   1开启；0未开启
      // 快餐特供
      codeMode: data.data.GetCodeMode ? data.data.GetCodeMode : null, // 快餐-牌号设置
      isEnableSushiExpress: data.data.IsEnableSushiExpress === '1', // 争鲜增值设置 IsEnableSushiExpress   1开启；0未开启
      // isShowTotalMoney: data.data.IsShowTotalMoney === '1', // 状态栏区域显示已结金额和未结金额
      bsOrderCodeMode: data.data.bsOrderCodeMode, // 快餐模式-牌号设置data.data.bsOrderCodeMode
      buffetPointId: data.data.buffetPointId ? data.data.buffetPointId : null, // 默认客位id
      cashBoxReasons: data.data.cashBoxReasons ? data.data.cashBoxReasons : null,
      discountPlanList: data.data.discountPlanList ? data.data.discountPlanList : null, // 打折和优惠列表
      existsTsPayway: data.data.existsTsPayway === '1', // 忘了
      fastFoodIsHiddenShortcutKeys: `${data.data.isDisableShortcutKey}` === '1', // 快餐模式下加单界面是否显示快捷键
      btns: data.data.fastFoodBtns ? initFastFoodBtn(data.data.fastFoodBtns, `${data.data.isDisableShortcutKey}` === '1') : [], // 结算,结算及优惠业务按钮列表
      customListBtn: customButtons.orderMenu, // 客单自定义按钮
      customPositionBtn: customButtons.seatMenu, // 客位自定义按钮
      customMenuBtn: customButtons.addOrderMenu,
      customFastFoodMenuBtn: customButtons.fastfoodAddOrderMenu,
      serviceBtns: data.data.fastFoodServiceFunctionBtns
        ? data.data.fastFoodServiceFunctionBtns
        : null,
      // haveTakeoutPhone: data.data.haveTakeoutPhone, // 是否启用电话外卖
      showOtherPOSCheckoutBills: data.data.showOtherPOSCheckoutBills === '1', // 是否显示其他POS的已结账单
      saleTypeVal: data.data.sysSettingSaleTypeVal === '1', // 销售类型: 堂食/外带/外卖. 1:堂食+外带,返回值为true; 2:堂食+外带+外卖 ,返回值false
      // takeoutDeviceType: data.data.takeoutDeviceType, // 电话设备类型
      vouchers: data.data.vouchers, // 自己去百度
      wipeZeroModeKey: data.data.wipeZeroModeKey, // 抹零方案
      wipeZeroPositionKey: data.data.wipeZeroPositionKey, // 抹零位置

      isEnableSmallItemAddOrderMoreItem: data.data.IsEnableSmallItemAddOrderMoreItem === '1', // 大小品项切换
      isSynTransBizData: data.data.IsSynTransBizData === '1', // 是否结班后立即传输营业数据
      isWriteManagerDiary: data.data.isWriteManagerDiary === '1', // 结班时提醒填写经理日记
      addOrderMultiSpecification: data.data.addOrderMultiSpecification === '1', // 加单时多规格品项自动添加默认规格
      isAutoClearKey: data.data.IsAutoClearKey === '1', // 是否在选择菜品后自动清空助记符
      isBackMain: data.data.IsBackMain === '1', // 是否在提交菜品后自动返回客位界面
      isOnlyAddBillByItemCode: data.data.IsOnlyAddBillByItemCode === '1', // 只通过编码加单
      isShowAvgMoney: data.data.IsShowAvgMoney === '1', // 客位列表显示人均消费金额
      isShowFastInputNum: data.data.IsShowFastInputNumKeyboard === '1',
      isShowMoney: data.data.IsShowMoney === '1', // 客位列表是否显示消费金额
      isShowMoneyAndNumOfPeople: data.data.IsShowMoneyAndNumOfPeople === '1', // 同时显示就餐人数、消费金额
      isShowSpendTime: data.data.IsShowSpendTime === '1', // 是否显示消费时长
      isShowSpendTimeOutAlert: data.data.IsShowSpendTimeOutAlert === '1',
      saleType: parseInt(data.data.SaleType, 0), // 默认销售类型 1:堂食, 2:外带, 3:外卖
      spendTimeLimit: data.data.SpendTimeLimit ? parseInt(data.data.SpendTimeLimit, 0) : null,
      allPosModule: data.data.allPosModule, // 老版本：更多功能按钮组
      allPosModuleOper: data.data.allPosModuleOper, // 加单、结算二级权限设置
      checkBillAuthOpers: data.data.checkBillAuthOpers, // 核对单据中 修改点菜员权限
      customButtons, // 结算按钮自定义
      dedicatedMethodsDefaultPopup: data.data.dedicatedMethodsDefaultPopup === '1', // 专用做法默认弹窗选择
      defaultCancelReason: data.data.defaultCancelReason, // 默认返位原因
      defaultPresentReason: data.data.defaultPresentReason, // 默认赠送原因
      discountGiveItemFlg: data.data.discountGiveItemFlg, // 惠赠品项
      discountGiveItems: data.data.discountGiveItems, // 惠赠品项
      isOnlyShowSmallClass: data.data.isAddBillFilterOnlyShowSmallClass === '1', // 加单页面的类别过滤只显示小类
      isSingleLineDisplayForSmallClassAndCustomClass: data.data.isSingleLineDisplayForSmallClassAndCustomClass === '1', // 小类/自定义类别单行显示
      isShortcutBarSingleLineDisplayForFastFoodMode: data.data.isShortcutBarSingleLineDisplayForFastFoodMode === '1', // 快餐模式快捷工具栏单行显示
      isAllowDarkScan: data.data.findAccuratelyWhenEnteringNumbers === '1', // 模糊搜索下是否可以扫码加单
      isAllowAddOrderWhenLimitZero: data.data.isAllowAddOrderWhenLimitZero === '1', // 允许限量为 0 时继续加单
      isChangeItemLimitWhenAddOrder: data.data.isChangeItemLimitWhenAddOrder === '1', // 加单时改变品项限量数量
      isDefaultEmptyByOpenTable: data.data.isDefaultEmptyByOpenTable === '1', // 开台时就餐人数默认为空
      isEnableAlertWhenPrintSettleBill: data.data.isEnableAlertWhenPrintSettleBill === '1', // 是否启用结账单打印提醒功能
      isForceMemberQuery: data.data.isForceMemberQuery, // 启用销售方案会员价之后是否启用强制验证会员
      isHaveMemberPriceItem: data.data.isHaveMemberPriceItem, // 是否是会员价品项
      isItemMoreBarcode: data.data.isItemMoreBarcode, // 是否启用多条码
      isEnterKeyAllowsInlyOneItem: data.data.isEnterKeyAllowsInlyOneItem, // 回车键只允许添加一个品项
      isMergeAddBill: data.data.isMergeAddBill, // 加单时允许增加重复品项（false：合并 true：重复）该选项仅对收银和录单模式生效
      // 加单时允许增加重复品项（false：合并 true：重复）该选项仅对快餐模式生效
      isMergeAddBillForBuffet: data.data.isMergeAddBillForBuffet,
      isNetWeight: data.data.isNetWeight === '1', // 是否启用电子称去皮功能
      disableBarcodeScanner: data.data.isNotEnableRecptionBarcodeScanner === '1', // 禁用扫码枪点餐
      isOpenSelf: data.data.isOpenSelf, // 是否开通自助功能(开启管理平台增值的状态,一般不用,可使用下面参数作为自助判断依据)
      isOpenBuffetDeposit: data.data.isOpenBuffetDeposit, // 是否开通自助功能
      isPincaiZeroPrice: data.data.isPincaiZeroPrice === '1', // 拼菜时，附菜销售价格显示为0
      isShowCancelReason: data.data.isShowCancelReason === '1', // 是否显示选择返位原因
      isShowItemCode: data.data.isShowItemCode === '1', // 是否显示菜品编号
      isShowPresentReason: data.data.isShowPresentReason === '1', // 是否显示选择赠送原因
      isWithdrawCashEnable: data.data.isWithdrawCashEnable, // 是否启用提现功能
      itemServeWays: map(data.data.itemServeWays, item => pick(item, ['id', 'name'])), // 上菜方式
      presentReasons: data.data.presentReasons, // 赠单原因
      scaleItemCodeLength: parseInt(data.data.scaleItemCodeLength, 0), // 电子秤扫描条码品项代码长度
      scaleItemCodeStart: parseInt(data.data.scaleItemCodeStart, 0), // 电子秤扫描条码品项代码开始位置
      // 电子秤扫描条码品项数量整数部分长度
      scaleItemQuantityIntegerLength: parseInt(data.data.scaleItemQuantityIntegerLength, 0),
      scaleItemQuantityLength: parseInt(data.data.scaleItemQuantityLength, 0), // 电子秤扫描条码品项数量长度
      scaleItemQuantityStart: parseInt(data.data.scaleItemQuantityStart, 0), // 电子秤扫描条码品项数量开始位置
      searchMode: data.data.searchMode ? data.data.searchMode : '1',
      serviceFunctionBtns: data.data.serviceFunctionBtns, // 业务功能按钮
      pointKeyboardMode: data.data.pointKeyboardMode, // 客位页面的软键盘默认模式 1-九宫格 2-拼音
      addOrderKeyboardMode: data.data.addOrderKeyboardMode, // 加单页面的软键盘默认模式 1-九宫格 2-拼音  中餐快餐通用
      submitDoodConstraintSelectWaiter: data.data.submitDoodConstraintSelectWaiter, // 是否加单时强制选择点菜员
      noWeighingItemAllowDiscountPrejunction: data.data.noWeighingItemAllowDiscountPrejunction, // 录单模式是否未称重
      depositItemId: data.data.depositItemId, // 押金费品项id，自助餐登记押金
      isOpenDepositSet: data.data.isOpenDepositSet, // 前台押金金额是否可编辑，0:可编辑;1:不可编辑s
      depositModel: data.data.depositModel, // 押金金额：0:押金金额固定为押金费品项; 1:押金金额为 人数 * 押金费品项
      lastAdditionWhenAddingOrders: data.data.lastAdditionWhenAddingOrders === '1', // 控制加单是否回显之前已点品项
      openSoundReminderforScanPayment: data.data.openSoundReminderforScanPayment === '1', // 是否开启扫码付声音提醒
      turnOnThePreOrderSingleToneReminder: data.data.turnOnThePreOrderSingleToneReminder === '1', // 是否开启预点单声音提醒
      openTheTableAndPayvoiceReminder: data.data.openTheTableAndPayvoiceReminder === '1', // 是否开启桌边付声音提醒
      openTakeawaySingleSoundReminder: data.data.openTakeawaySingleSoundReminder === '1', // 是否开启外卖单声音提醒
      openOutOrderVoiceRemind: data.data.openOutOrderVoiceRemind === '1', // 是否开启了外卖退单声音提示
      isAddOrderReadMenu: data.data.isAddOrderReadMenu === '1', // 加单默认读取点菜单品项
      isFishCoolEnable: data.data.isFishCoolEnable, // 是否是鱼酷
      isUsePercentageTab: data.data.isUsePercentageTab, // 是否启用自定义标签(开台时)
      eaters: data.data.eaters, // 自助餐快餐-客人类型数据集
      takeawayPlatformList: data.data.takeawayPlatformList, // 所有外卖平台
      depositItemPrice: data.data.depositItemPrice, // 自助押金的固定押金金额
      xianGuoAddOrderBarType: data.data.xianGuoAddOrderBarType ? 1 : 0, // 加单工具栏设置, 默认值0(0:平铺显示，1:工具栏显示) 用于本地测试需更改??
      xianGuoFastSettleBarType: data.data.xianGuoFastSettleBarType ? 1 : 0, // 快速结算打折设置, 默认值0(0:抽屉显示 1:弹框显示)
    },
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
