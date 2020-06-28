import i18n from "@/locales/index";

export default () => [
  {
    width: '170',
    prop: 'code',
    label: i18n.t('Dict.SettlementFlow'),
  },
  {
    prop: 'unpaidMoney',
    label: i18n.t('Dict.AmountOfAccount'),
    width: i18n.locale === 'enUS' ? '140' : '100',
  },
  {
    prop: 'paymenntMoney',
    label: i18n.t('Dict.AmountPaid'),
    width: i18n.locale === 'enUS' ? '140' : '100',
  },
  {
    prop: 'unPaymenntMoney',
    label: i18n.t('Dict.UnpaidAmount'),
    width: i18n.locale === 'enUS' ? '140' : '100',
  },
  {
    prop: 'settleTime',
    label: i18n.t('Dict.SettlingTime'),
    width: '170',
  },
];
