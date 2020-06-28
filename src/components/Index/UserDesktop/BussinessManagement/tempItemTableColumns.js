import i18n from '@/locales/index';

export default () => ([{
  prop: 'index',
  label: i18n.t('Dict.SerialNumber'),
  width: '50',
}, {
  prop: 'name',
  label: i18n.t('Dict.Name'),
  width: '170',
}, {
  prop: 'stdPrice',
  label: i18n.t('Dict.Price'),
}, {
  prop: 'unitName',
  label: i18n.t('Dict.UnitName'),
}, {
  prop: 'addTimes',
  label: i18n.t('Dict.FrequencyOfUse'),
}, {
  prop: 'createDate',
  label: i18n.t('Dict.CreationTime'),
  width: '170',
}, {
  prop: 'creatorName',
  label: i18n.t('Dict.Founder'),
}]);
