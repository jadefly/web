import i18n from '@/locales/index';

export const url = '/canyin/pos/cashdeposit/changebizdate';

export function trans(data) {
  return data.success === true ? {
    success: true,
    data: data.cashDeposit,
  } : {
    success: false,
    errCode: data.errCode ? data.errCode : false,
    msg: data.msg ? data.msg : i18n.t('Biz.CashDeposit.QueryErrorMessage'),
  };
}
