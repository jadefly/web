import i18n from '@/locales/index';
import * as tableState from '@/common/dictionary/pos-order-table-state';
import * as virtualSource from '@/common/dictionary/pos-virtual-table-source';

// 点餐系统按钮名称
export default () => ([{ // 退单
  id: '179',
  name: 'revoke',
  text: i18n.t('Dict.Btn.Chargeback'),
  hotKeyTip: '-',
  method: 'revoke',
  allowState: [tableState.OCCUPY, tableState.PRE_PAY],
}, { // 赠单
  id: '213',
  name: 'give',
  text: i18n.t('Dict.Btn.Give'),
  hotKeyTip: 'F1',
  method: 'give',
  allowState: [tableState.OCCUPY, tableState.PRE_PAY],
}, { // 催单
  id: '180',
  name: 'hasten',
  text: i18n.t('Dict.Btn.Hasten'),
  hotKeyTip: 'F2',
  method: 'hasten',
  allowState: [tableState.OCCUPY, tableState.PRE_PAY, tableState.LOCK, tableState.CHECK_BILL],
}, { // 起菜
  id: '907',
  name: 'serving',
  text: i18n.t('Dict.Btn.Serving'),
  hotKeyTip: 'F3',
  method: 'serving',
  allowState: [tableState.OCCUPY, tableState.PRE_PAY, tableState.LOCK, tableState.CHECK_BILL],
}, { // 上菜
  id: '1158',
  name: 'served',
  text: i18n.t('Dict.Btn.Served'),
  hotKeyTip: 'F4',
  method: 'served',
  allowState: [tableState.OCCUPY, tableState.PRE_PAY, tableState.LOCK, tableState.CHECK_BILL],
}, { // 单品转台
  id: '197',
  name: 'transfer',
  text: i18n.t('Dict.Btn.Transfer'),
  method: 'transfer',
  allowState: [tableState.OCCUPY],
}, { // 品项变价
  id: '196',
  name: 'changePrice',
  text: i18n.t('Dict.Btn.ChangePrice'),
  method: 'changePrice',
  allowState: [tableState.OCCUPY],
}, { // 称重确认
  id: '925',
  name: 'confirmWeight',
  text: i18n.t('Dict.Btn.ConfirmWeight'),
  hotKeyTip: 'F5',
  method: 'confirmWeight',
  allowState: [tableState.OCCUPY, tableState.PRE_PAY],
}, { // 核对单据
  id: '190',
  name: 'checkingBills',
  text: i18n.t('Dict.Btn.CheckingBills'),
  hotKeyTip: 'F6',
  method: 'checkingBills',
  allowState: [tableState.OCCUPY, tableState.CHECK_BILL, tableState.PRE_PAY, tableState.LOCK],
}, { // 打印客单
  id: '191',
  name: 'printGuestList',
  text: i18n.t('Dict.Btn.PrintGuestList'),
  hotKeyTip: 'F9',
  method: 'printGuestList',
  allowState: [tableState.OCCUPY, tableState.CHECK_BILL, tableState.PRE_PAY, tableState.LOCK],
}, { // 验证会员
  id: '995',
  name: 'verifiedMember',
  text: i18n.t('Dict.Btn.VerifiedMember'),
  method: 'verifiedMember',
  allowState: [tableState.OCCUPY],
}, { // 改点菜员
  name: 'changeWaiter',
  text: i18n.t('Dict.Btn.ChangeWaiter'),
  method: 'changeWaiter',
}, { // 免厨打
  name: 'skipKitchenList',
  text: i18n.t('Dict.Btn.SkipKitchenList'),
  method: 'skipKitchenList',
}, { // 团队加单
  name: 'teamAdd',
  text: i18n.t('Dict.Btn.TeamAdd'),
  method: 'teamAdd',
}, { // 团购验券
  name: 'groupon',
  text: i18n.t('Dict.Btn.GroupOn'),
  method: 'groupon',
}, { // 复制菜品
  name: 'copyDishes',
  text: i18n.t('Dict.Btn.OpenCopy'),
  method: 'copyDishes',
}, { // 选择排菜单
  name: 'arrangeMenu',
  text: i18n.t('Dict.Btn.ChoiceArraMenu'),
  method: 'arrangeMenu',
}, { // 清空
  name: 'clearItem',
  text: i18n.t('Dict.Btn.ClearItem'),
  method: 'clearItem',
}, { // 其他
  name: 'other',
  text: i18n.t('Dict.Btn.Other'),
  method: 'other',
}, { // 搭台
  id: '1168',
  name: 'shareTable',
  text: i18n.t('Dict.Btn.ShareTable'),
  hotKeyTip: 'F7',
  method: 'shareTable',
  allowState: [tableState.OCCUPY, tableState.CHECK_BILL, tableState.LOCK, tableState.PRE_PAY],
}, { // 换台
  id: '194',
  name: 'changeTable',
  text: i18n.t('Dict.Btn.ChangeTable'),
  hotKeyTip: 'F8',
  method: 'changeTable',
  allowState: [tableState.OCCUPY, tableState.PRE_PAY, virtualSource.SHARETABLE],
}, { // 转账
  id: '186',
  name: 'transferAccount',
  text: i18n.t('Dict.Btn.TransferAccount'),
  hotKeyTip: 'F10',
  method: 'transferAccount',
  allowState: [tableState.OCCUPY, virtualSource.TRANSFERTABLE],
}, { // 撤销转账
  id: '186',
  name: 'cancelTransfer',
  text: i18n.t('Dict.Btn.CancelTransfer'),
  method: 'cancelTransfer',
  hotKeyTip: 'F10',
  allowState: [tableState.OCCUPY, virtualSource.TRANSFERTABLE],
}, { // 并账
  id: '184',
  name: 'mergeAccount',
  text: i18n.t('Dict.Btn.MergeAccount'),
  hotKeyTip: 'F11',
  method: 'mergeAccount',
  allowState: [tableState.OCCUPY],
}, { // 关台
  id: '185',
  name: 'closeAccount',
  text: i18n.t('Dict.Btn.CloseAccount'),
  hotKeyTip: 'F12',
  method: 'closeAccount',
  allowState: [tableState.OCCUPY, virtualSource.SHARETABLE],
}, { // 团队开单
  id: '385',
  name: 'teamOrder',
  text: i18n.t('Dict.Btn.TeamOrder'),
  method: 'teamOrder',
}, { // 组成团队
  name: 'teamConstitute',
  text: i18n.t('Dict.Btn.TeamConstitute'),
  method: 'teamConstitute',
}, { // 加入团队
  name: 'teamJoin',
  text: i18n.t('Dict.Btn.TeamJoin'),
  method: 'teamJoin',
  allowState: [tableState.OCCUPY],
}, { // 退出团队
  name: 'teamQuit',
  text: i18n.t('Dict.Btn.TeamQuit'),
  method: 'teamQuit',
  allowState: [tableState.OCCUPY],
}, { // 押金
  id: '181',
  name: 'deposit',
  text: i18n.t('Dict.Btn.Deposit'),
  method: 'deposit',
  allowState: [
    tableState.OCCUPY,
    tableState.CHECK_BILL,
    tableState.LOCK,
    virtualSource.SHARETABLE,
    virtualSource.TRANSFERTABLE,
  ],
}, { // 清空
  name: 'clearItem',
  text: i18n.t('Dict.Btn.ClearItem'),
  method: 'clearItem',
}, { // 押金
  id: '1231',
  name: 'payDesposit',
  text: `${i18n.t('Dict.Btn.Deposit')}(F8)`,
  method: 'payDesposit',
}, { // 线上支付查询
  id: '1232',
  name: 'payOnlinePayment',
  text: i18n.t('Dict.Btn.OnlinePayQuery'),
  tipHotkeys: '(F9)',
  method: 'payOnlinePayment',
  isNeedDialog: 0,
}, { // 结算备注
  id: '1233',
  name: 'paySettlementNote',
  text: i18n.t('Dict.SettlementNote'),
  tipHotkeys: '(F10)',
  method: 'paySettlementNote',
}, { // 开发票
  id: '1234',
  name: 'payDrawInvoice',
  text: `${i18n.t('Dict.Btn.DrawInvoice')}(F11)`,
  method: 'payDrawInvoice',
}, { // 开钱箱
  id: '1235',
  name: 'payMoneyBox',
  text: i18n.t('Dict.OpenCashBox'),
  tipHotkeys: '(F1)',
  method: 'payMoneyBox',
  isNeedDialog: 0,
}, { // 现金等额
  id: '1236',
  name: 'payCashEquivalents',
  text: i18n.t('Dict.Btn.CashFastSettle'),
  tipHotkeys: '(F2)',
  method: 'payCashEquivalents',
  isNeedDialog: 0,
}, { // 预结单打印
  id: '1237',
  name: 'payPreformPrint',
  text: i18n.t('Dict.Btn.PayPreformPrint'),
  tipHotkeys: '(F3)',
  method: 'payPreformPrint',
  isNeedDialog: 0,
}, { // 埋单
  id: '1238',
  name: 'payPayBill',
  text: i18n.t('Dict.Btn.PayBill'),
  tipHotkeys: '(PgUp)',
  method: 'payPayBill',
  isNeedDialog: 0,
}, { // 撤销埋单
  id: '1239',
  name: 'undoPayPayBill',
  text: i18n.t('Dict.Btn.UndoPayBill'),
  tipHotkeys: '(PgUp)',
  method: 'undoPayPayBill',
  isNeedDialog: 0,
}, { // 群光积分
  id: '1240',
  name: 'payGroupLightIntegral',
  text: i18n.t('Dict.Btn.GroupLightIntegral'),
  // tipHotkeys: '(F10)',
  method: 'payGroupLightIntegral',
}, { // 更多
  name: 'payMore',
  text: i18n.t('Dict.Btn.More'),
  tipHotkeys: '(Ctrl+F12)',
  method: 'payMore',
}, { // 导游提成
  name: 'billedTourGuideFee',
  text: i18n.t('Dict.Btn.TourGuideFee'),
  method: 'billedTourGuideFee',
}, { // 服务费
  id: '1240',
  name: 'payServiceCharge',
  text: `${i18n.t('Dict.Btn.ServiceCharge')}(F4)`,
  tipHotkeys: '(F4)',
  method: 'payServiceCharge',
}, { // 最低消费
  id: '1241',
  name: 'payMinimumConsumption',
  text: `${i18n.t('Dict.Btn.MinimumConsumption')}(F5)`,
  tipHotkeys: '(F5)',
  method: 'payMinimumConsumption',
}, { // 预付
  id: '1243',
  name: 'payPayAdvance',
  text: `${i18n.t('Dict.Btn.PrePay')}`,
  tipHotkeys: '(Insert)',
  method: 'payPayAdvance',
  isNeedDialog: 0,
}, { // 撤销预付
  id: '1244',
  name: 'undoPayPayAdvance',
  text: `${i18n.t('Dict.Btn.UndoPrePay')}`,
  tipHotkeys: '(Insert)',
  method: 'undoPayPayAdvance',
  isNeedDialog: 0,
}, { // 提现
  id: '1242',
  name: 'payWithdrawDeposit',
  text: i18n.t('Dict.Btn.DrawDeposit'),
  method: 'payWithdrawDeposit',
  isNeedDialog: 0,
}, { // 取消抹零
  id: '1274',
  name: 'cancelWipe',
  text: i18n.t('Dict.Btn.CancelWipe'),
  method: 'wipeOpration',
  isNeedDialog: 0,
}, { // 账单查询
  name: 'billQuery',
  text: i18n.t('Dict.Btn.BillQuery'),
  method: 'billQuery',
  allowState: [tableState.OCCUPY, tableState.CHECK_BILL],
}, { // 批量操作
  name: 'batchOperation',
  text: i18n.t('Dict.Btn.BatchOperation'),
  method: 'batchOperation',
  allowState: [tableState.OCCUPY, tableState.PRE_PAY, tableState.LOCK, tableState.BOOKING],
}, { // 更多
  name: 'moreBillBtns',
  text: i18n.t('Dict.Btn.More'),
  method: 'moreBillBtns',
  hotKeyTip: 'Ctrl+F9',
}]);