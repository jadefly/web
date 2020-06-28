import i18n from '@/locales/index';

export const url = '/canyin/pos/settlement/pay/scancodepay/maunaluploadpayorder';

export function trans(data) {
  return (data.code === '1') ? {
    success: true,
    data: data.data || { msg: i18n.t('Biz.UserDesktop.ParameterSetting.UploadSuccessMessage') }, // 因为传过来的是个null 暂时写死
  } : {
    success: false,
    errCode: data.errCode ? data.errCode : 0,
    msg: data.msg,
  };
}
