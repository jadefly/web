import i18n from '@/locales/index';

export default () => [{
  prop: 'index',
  label: i18n.t('Dict.SerialNumber'),
  width: '50',
},
{
  prop: 'empName',
  label: i18n.t('Dict.EmployeeName'),
  minwidth: '120',
},
{
  prop: 'plEmpType',
  label: i18n.t('Dict.StaffPosition'),
  minwidth: '120',
},
{
  prop: 'itemName',
  label: i18n.t('Dict.ItemName'),
  minwidth: '110',
},
{
  prop: 'sizeName',
  label: i18n.t('Dict.SizeName'),
  minwidth: '140',
},
{
  prop: 'allowanceType',
  label: i18n.t('Dict.RoyaltyMethod'),
  minwidth: '150',
},
{
  prop: 'lastQty',
  label: i18n.t('Dict.SalesVolumes'),
  minwidth: '120',
},
{
  prop: 'origSubtotal',
  label: i18n.t('Dict.AmountReceivable'),
  minwidth: '150',
},
{
  prop: 'incomeTotal',
  label: i18n.t('Dict.NetIncome'),
  minwidth: '150',
},
{
  prop: 'condition',
  label: i18n.t('Dict.RoyaltyConditions'),
  minwidth: '160',
},
{
  prop: 'standard',
  label: i18n.t('Dict.RoyaltyStandard'),
  minwidth: '155',
},
{
  prop: 'pushMoney',
  label: i18n.t('Dict.RoyaltyAmount'),
  minwidth: '150',
}];
