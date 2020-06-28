import i18n from '@/locales/index';

export const url = '/canyin/pos/bill/findautoordercode' // 临时品项信息
export function trans(data) {
  return data || data === 0 ? {
    success: true,
    data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: i18n.t('Dict.BusinessErrorMessage'),
  };
}
