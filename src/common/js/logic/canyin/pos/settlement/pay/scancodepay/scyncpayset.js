import i18n from '@/locales/index';

export const url = '/canyin/pos/settlement/pay/scancodepay/scyncpayset';
export function trans(data) {
  return (data.code === '1') ? {
    success: true,
    data: data.data || { msg: i18n.t('Biz.UserDesktop.ParameterSetting.SyncSuccessMessage') },
  } : {
    success: false,
    errCode: data.errCode ? data.errCode : 0,
    msg: data.msg,
  };
}
