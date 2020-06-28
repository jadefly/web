import i18n from '@/locales/index';

export const url = '/canyin/sys/ip/kickout';
export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: {
      success: true,
    },
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg ? data.msg : i18n.t('Biz.UserDesktop.SystemTools.PosIpLogin.Msg2'),
  };
}
