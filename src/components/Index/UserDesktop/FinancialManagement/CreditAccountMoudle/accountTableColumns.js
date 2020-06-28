import i18n from '@/locales/index';

export default () => [{
  prop: 'index',
  label: i18n.t('Dict.SerialNumber'),
  width: '50',
}, {
  prop: 'code',
  label: i18n.t('Dict.Code'),
  width: '60',
}, {
  prop: 'name',
  label: i18n.t('Dict.AccountName'),
}, {
  prop: 'unpaidSum',
  label: i18n.t('Dict.Credits'),
}, {
  prop: 'remainingSum',
  label: i18n.t('Dict.AccountBalance'),
}, {
  prop: 'availableSum',
  label: i18n.t('Dict.AvailableCredit'),
  width: '150',
}, {
  prop: 'companyName',
  label: i18n.t('Dict.CorporateName'),
}, {
  prop: 'isEnable',
  label: i18n.t('Dict.State'),
}];
