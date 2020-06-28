import Vue from 'vue';
import VueI18n from 'vue-i18n';
import ElementUILocale from 'element-ui/lib/locale';
import ElementUIZhCNLang from 'element-ui/lib/locale/lang/zh-CN';
import ElementUIEnUSLang from 'element-ui/lib/locale/lang/en';
import ElementUIZhHKLang from 'element-ui/lib/locale/lang/zh-TW';
import zhCN from './zh_CN.json';
import enUS from './en_US.json';
import zhHK from './zh_HK.json';

Object.assign(zhCN, ElementUIZhCNLang);
Object.assign(enUS, ElementUIEnUSLang);
Object.assign(zhHK, ElementUIZhHKLang);

Vue.use(VueI18n);

const DEFAULT_LANG = 'zhCN';
const LOCALE_KEY = 'localeLanguage';

const locales = {
  zhCN,
  enUS,
  zhHK,
};

const i18n = new VueI18n({
  locale: DEFAULT_LANG,
  fallbackLocale: DEFAULT_LANG,
  messages: locales,
  silentTranslationWarn: true,
});

export const setup = (lang) => {
  let la;
  if (lang === undefined) {
    la = window.localStorage.getItem(LOCALE_KEY);
    if (locales[la] === undefined) {
      la = DEFAULT_LANG;
    }
  } else {
    la = lang;
  }
  window.localStorage.setItem(LOCALE_KEY, la);

  Object.keys(locales).forEach((it) => {
    document.body.classList.remove(`lang-${it}`);
  });
  document.body.classList.add(`lang-${la}`);
  document.body.setAttribute('lang', la);

  Vue.config.lang = la;
  i18n.locale = la;
  ElementUILocale.i18n((key, value) => i18n.t(key, value));
};

setup();
export default i18n;
