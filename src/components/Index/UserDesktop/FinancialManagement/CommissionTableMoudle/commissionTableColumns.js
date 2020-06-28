import i18n from '@/locales/index';

export default () => [{
  prop: 'index',
  label: i18n.t('Dict.SerialNumber'),
  width: '50',
}, {
  prop: 'name',
  label: i18n.t('Biz.UserDesktop.CommissionTableName'),
  minwidth: '180',
}, {
  prop: 'planName',
  label: i18n.t('Biz.UserDesktop.RoyaltyScheme'),
  minwidth: '150',
}, {
  prop: 'beginTime',
  label: i18n.t('Biz.UserDesktop.BillingStartTime'),
  minwidth: '180',
}, {
  prop: 'endTime',
  label: i18n.t('Biz.UserDesktop.BillEndTime'),
  minwidth: '180',
}, {
  prop: 'createTime',
  label: i18n.t('Biz.UserDesktop.GenerationTime'),
  minwidth: '180',
}];
