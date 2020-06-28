import i18n from "@/locales/index";

export default [{
    prop: 'index',
    label: i18n.t('Dict.SerialNumber'),
    width: '50',
},
{
    prop: 'name',
    label: i18n.t('Dict.Name'),
    width: '180',
},
{
    prop: 'fee',
    label: i18n.t('Dict.Price'),
},
{
    prop: 'createDate',
    label: i18n.t('Dict.CreationTime'),
    width: '180',
}, {
        prop: 'creatorName',
        label: i18n.t('Dict.Founder'),
}];
