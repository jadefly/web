import i18n from '@/locales/index';
// 由于btn的判断逻辑非常多，显示禁用之类，为了不搅和分一个是显示快捷键的数据和不显示快捷键的数据，后期优化
export default () => ({
  haveHotkey: [{ // 微信
    btnId: '-3',
    btnName: 'wechatScancodeFastSettle',
    name: i18n.t('Dict.Btn.WeChat'),
    hotKeyText: 'Alt+1',
    hotKey: '1.alt',
  }, { // 支付宝
    btnId: '-4',
    btnName: 'aliScancodeFastSettle',
    name: i18n.t('Dict.Btn.AliPay'),
    hotKeyText: 'Alt+2',
    hotKey: '2.alt',
  }, { // 会员卡
    btnId: '-5',
    btnName: 'crmFastSettle',
    name: i18n.t('Dict.Btn.CrmCard'),
    hotKeyText: 'Alt+5',
    hotKey: '5.alt',
  }, { // 现金等额
    btnId: '-2',
    btnName: 'cashFastSettle',
    name: i18n.t('Dict.Btn.CashFastSettle'),
    hotKeyText: 'Alt+7',
    hotKey: '7.alt',
  }, { // 执行会员价
    btnId: '-13',
    btnName: 'doMemberPrice',
    name: i18n.t('Dict.Btn.DoMemberPrice'),
    hotKeyText: 'Alt+D',
    hotKey: 'D.alt',
  }, { // 取消会员价
    btnId: '-14',
    btnName: 'cancelMemberPrice',
    name: i18n.t('Dict.Btn.CancelMemberPrice'),
    hotKeyText: 'Alt+E',
    hotKey: 'E.alt',
  }, { // 现金10元
    btnId: '-7',
    btnName: 'cashFastSettle',
    name: i18n.t('Dict.Btn.Cash', [10]),
  }, { // 现金20元
    btnId: '-8',
    btnName: 'cashFastSettle',
    name: i18n.t('Dict.Btn.Cash', [20]),
  }, { // 现金50元
    btnId: '-9',
    btnName: 'cashFastSettle',
    name: i18n.t('Dict.Btn.Cash', [50]),
  }, { // 现金100元
    btnId: '-10',
    btnName: 'cashFastSettle',
    name: i18n.t('Dict.Btn.Cash', [100]),
  }, { // 挂单
    btnId: '3',
    btnName: 'designates',
    name: i18n.t('Dict.Btn.Designates'),
    hotKeyText: 'Alt+B',
    hotKey: 'B.alt',
  }, { // 读取挂单
    btnId: '2',
    btnName: 'designatesList',
    name: i18n.t('Dict.Btn.ReadDesignatesList'),
    hotKeyText: 'Alt+C',
    hotKey: 'C.alt',
  }, { // 结算
    btnId: '182',
    btnName: 'settlement',
    name: i18n.t('Dict.Btn.Settlement'),
    hotKeyText: 'Alt+0',
    hotKey: '0.alt',
  }, { // 结班
    btnId: '189',
    btnName: 'posSerial',
    name: i18n.t('Dict.Btn.PosSerial'),
  }, { // 已结账单
    btnId: '192',
    btnName: 'closedAccount',
    name: i18n.t('Dict.Btn.ClosedAccount'),
  }, { // 售卡
    btnId: '923',
    btnName: 'cardSelling',
    name: i18n.t('Dict.Btn.CardSelling'),
  }, { // 充值
    btnId: '924',
    btnName: 'cardCharge',
    name: i18n.t('Dict.Btn.CardCharge'),
  }, { // 打折
    btnId: '-6',
    btnName: 'selectDiscount',
    name: i18n.t('Dict.Btn.Discount'),
    hotKeyText: 'Alt+F',
    hotKey: 'F.alt',
  }, { // 品项限量
    btnId: '348',
    btnName: 'itemLimit',
    name: i18n.t('Dict.Btn.ItemLimit'),
  }, { // 品项估清
    btnId: '198',
    btnName: 'itemSellout',
    name: i18n.t('Dict.Btn.ItemSellout'),
  }, { // 手工操作
    btnId: '-1',
    btnName: 'cashFastSettle',
    name: i18n.t('Dict.Btn.CalcSettle'),
    hotKeyText: 'Alt+8',
    hotKey: '8.alt',
  }, { // 修改密码
    btnId: '957',
    btnName: 'changePwd',
    name: i18n.t('Dict.ChangePassword'),
  }, { // 报表查询
    btnId: '960',
    btnName: 'businessReport',
    name: i18n.t('Dict.BusinessReport'),
  }, { // 验证会员
    btnId: '-15',
    btnName: 'memberQuey',
    name: i18n.t('Dict.Btn.VerifiedMember'),
    hotKeyText: 'Alt+G',
    hotKey: 'G.alt',
  }, { // 银联
    btnId: '-16',
    btnName: 'unionPayScancodeFastSettle',
    name: i18n.t('Dict.Btn.UnionPay'),
    hotKeyText: 'Alt+3',
    hotKey: '3.alt',
  }, { // 会员卡快速结算
    btnId: '-17',
    btnName: 'crmNoDialogFastSettle',
    name: i18n.t('Dict.Btn.CrmFastSettle'),
    hotKeyText: 'Alt+6',
    hotKey: '6.alt',
  }, { // 开钱箱
    btnId: '1037',
    btnName: 'openCashBox',
    name: i18n.t('Dict.OpenCashBox'),
  }, { // 代金券
    btnId: '-19',
    btnName: 'voucher',
    name: i18n.t('Dict.Btn.Voucher'),
    hotKeyText: 'Alt+9',
    hotKey: '9.alt',
  }, { // 经理日记
    btnId: '1169',
    btnName: 'managerLog',
    name: i18n.t('Biz.UserDesktop.ManagerDiary'),
  }, { // 付款码
    btnId: '-22',
    btnName: 'paymentcode',
    name: i18n.t('Dict.Btn.PaymentCode'),
    hotKeyText: 'Alt+4',
    hotKey: '4.alt',
  }, { // 电话外卖落单
    btnId: '-21',
    btnName: 'takeoutPhone',
    name: i18n.t('Dict.Btn.TakeoutPhont'),
    hotKeyText: 'Alt+H',
    hotKey: 'H.alt',
  }, { // 礼品卡券
    btnId: '-20',
    btnName: 'cardGiftAndVoucher',
    name: i18n.t('Dict.Btn.CardGiftAndVoucher'),
  }, { // 人民币
    btnId: '1',
    btnName: 'cashFastSettle',
    name: '人民币',
  }, { // 一筷捞天下
    btnId: '34',
    btnName: 'cashFastSettle',
    name: i18n.t('Dict.Btn.OneChopsTick'),
  }],
  hiddenHotkey: [{ // 微信
    btnId: '-3',
    btnName: 'wechatScancodeFastSettle',
    name: i18n.t('Dict.Btn.WeChat'),
    hotKey: '1.alt',
  }, { // 支付宝
    btnId: '-4',
    btnName: 'aliScancodeFastSettle',
    name: i18n.t('Dict.Btn.AliPay'),
    hotKey: '2.alt',
  }, { // 会员卡
    btnId: '-5',
    btnName: 'crmFastSettle',
    name: i18n.t('Dict.Btn.CrmCard'),
    hotKey: '5.alt',
  }, { // 现金等额
    btnId: '-2',
    btnName: 'cashFastSettle',
    name: i18n.t('Dict.Btn.CashFastSettle'),
    hotKey: '7.alt',
  }, { // 执行会员价
    btnId: '-13',
    btnName: 'doMemberPrice',
    name: i18n.t('Dict.Btn.DoMemberPrice'),
    hotKey: 'D.alt',
  }, { // 取消会员价
    btnId: '-14',
    btnName: 'cancelMemberPrice',
    name: i18n.t('Dict.Btn.CancelMemberPrice'),
    hotKey: 'E.alt',
  }, { // 现金10元
    btnId: '-7',
    btnName: 'cashFastSettle',
    name: i18n.t('Dict.Btn.Cash', [10]),
  }, { // 现金20元
    btnId: '-8',
    btnName: 'cashFastSettle',
    name: i18n.t('Dict.Btn.Cash', [20]),
  }, { // 现金50元
    btnId: '-9',
    btnName: 'cashFastSettle',
    name: i18n.t('Dict.Btn.Cash', [50]),
  }, { // 现金100元
    btnId: '-10',
    btnName: 'cashFastSettle',
    name: i18n.t('Dict.Btn.Cash', [100]),
  }, { // 挂单
    btnId: '3',
    btnName: 'designates',
    name: i18n.t('Dict.Btn.Designates'),
    hotKey: 'B.alt',
  }, { // 读取挂单
    btnId: '2',
    btnName: 'designatesList',
    name: i18n.t('Dict.Btn.ReadDesignatesList'),
    hotKey: 'C.alt',
  }, { // 结算
    btnId: '182',
    btnName: 'settlement',
    name: i18n.t('Dict.Btn.Settlement'),
    hotKey: '0.alt',
  }, { // 结班
    btnId: '189',
    btnName: 'posSerial',
    name: i18n.t('Dict.Btn.PosSerial'),
  }, { // 已结账单
    btnId: '192',
    btnName: 'closedAccount',
    name: i18n.t('Dict.Btn.ClosedAccount'),
  }, { // 售卡
    btnId: '923',
    btnName: 'cardSelling',
    name: i18n.t('Dict.Btn.CardSelling'),
  }, { // 充值
    btnId: '924',
    btnName: 'cardCharge',
    name: i18n.t('Dict.Btn.CardCharge'),
  }, { // 打折
    btnId: '-6',
    btnName: 'selectDiscount',
    name: i18n.t('Dict.Btn.Discount'),
    hotKey: 'F.alt',
  }, { // 品项限量
    btnId: '348',
    btnName: 'itemLimit',
    name: i18n.t('Dict.Btn.ItemLimit'),
  }, { // 品项估清
    btnId: '198',
    btnName: 'itemSellout',
    name: i18n.t('Dict.Btn.ItemSellout'),
  }, { // 手工操作
    btnId: '-1',
    btnName: 'cashFastSettle',
    name: i18n.t('Dict.Btn.CalcSettle'),
    hotKey: '8.alt',
  }, { // 修改密码
    btnId: '957',
    btnName: 'changePwd',
    name: i18n.t('Dict.ChangePassword'),
  }, { // 报表查询
    btnId: '960',
    btnName: 'businessReport',
    name: i18n.t('Dict.BusinessReport'),
  }, { // 验证会员
    btnId: '-15',
    btnName: 'memberQuey',
    name: i18n.t('Dict.Btn.VerifiedMember'),
    hotKey: 'G.alt',
  }, { // 银联
    btnId: '-16',
    btnName: 'unionPayScancodeFastSettle',
    name: i18n.t('Dict.Btn.UnionPay'),
    hotKey: '3.alt',
  }, { // 会员卡快速结算
    btnId: '-17',
    btnName: 'crmNoDialogFastSettle',
    name: i18n.t('Dict.Btn.CrmFastSettle'),
    hotKey: '6.alt',
  }, { // 开钱箱
    btnId: '1037',
    btnName: 'openCashBox',
    name: i18n.t('Dict.OpenCashBox'),
  }, { // 代金券
    btnId: '-19',
    btnName: 'voucher',
    name: i18n.t('Dict.Btn.Voucher'),
    hotKey: '9.alt',
  }, { // 经理日记
    btnId: '1169',
    btnName: 'managerLog',
    name: i18n.t('Biz.UserDesktop.ManagerDiary'),
  }, { // 付款码
    btnId: '-22',
    btnName: 'paymentcode',
    name: i18n.t('Dict.Btn.PaymentCode'),
    hotKey: '4.alt',
  }, { // 电话外卖落单
    btnId: '-21',
    btnName: 'takeoutPhone',
    name: i18n.t('Dict.Btn.TakeoutPhont'),
    hotKey: 'H.alt',
  }, { // 礼品卡券
    btnId: '-20',
    btnName: 'cardGiftAndVoucher',
    name: i18n.t('Dict.Btn.CardGiftAndVoucher'),
  }, { // 人民币
    btnId: '1',
    btnName: 'cashFastSettle',
    name: '人民币',
  }, { // 一筷捞天下
    btnId: '34',
    btnName: 'cashFastSettle',
    name: i18n.t('Dict.Btn.OneChopsTick'),
  }],
});
