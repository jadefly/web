import { includes } from 'lodash';
import i18n from '@/locales/index';

export const url = '/platform/login/login/loginv2';
export function trans(data) {
  if (data.code !== '1') {
    return {
      success: false,
      errCode: data.errCode,
      msg: data.msg,
    };
  }
  if (data.code === '1' && data.msg == 'canyin/index/index/authProduct') {
    return {
      success: false,
      errCode: -110,
      msg: i18n.t('Biz.Login.ProductNotCertified'),
    };
  }
  const langList = data.data.languageList;
  const languageList = langList && langList.length ? langList : [];
  const finded = includes(languageList, data.data.currentLanguage);
  const currentLanguage = finded ? data.data.currentLanguage : 'zh_CN';
  return {
    success: true,
    data: {
      title: data.data.title ? data.data.title.split('-')[0] : '',
      isBeta: data.data.title ? data.data.title.indexOf('测试环境') !== -1 : false,
      shopId: data.data.currentShopName ? data.data.currentShopName.split('-')[0] : null,
      shopName: data.data.currentShopName ? data.data.currentShopName.split('-')[1] : '',
      isKitchenEnable: data.data.isKitchenEnable == 'true',
      isEmpCardMandatory: data.data.isEmpCardMandatory != '0',
      AboutUs: data.data.AboutUs,
      ContactUs: data.data.ContactUs,
      WSContextPath: data.data.WS_CONTEXTPATH, // 增加返回推送服务主地址
      crmVersion: data.data.crmVersion === 1 ? '7' : '6', // crm环境版本
      languageList, // 语言列表
      currentLanguage, // 当前语言
    },
  };
}
