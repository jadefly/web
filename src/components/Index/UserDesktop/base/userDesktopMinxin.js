import { mapMutations } from 'vuex';
import ajax from '@/common/js/ajax';
import i18n from '@/locales/index';

export default {
  data() {
    return {
      title: i18n.t('Dict.TCSL'),
      logoMode: 1,
      customLogo: '',
    };
  },
  created() {
    this.getLoginTitle();
    this.getLogoMode();
  },
  methods: {
    ...mapMutations({
      setLocale: 'SET_LOCALE',
    }),
    getLoginTitle() {
      ajax('platform.login.login.login').then((data) => {
        this.title = data.title;
        this.setLocale(data.currentLanguage);
      });
    },
    getLogoMode() {
      ajax('canyin.sys.logo.getLogoImgMode').then((data) => {
        this.logoMode = data.logoImgMode;
        if (+this.logoMode === 0) {
          this.customLogo = {
            backgroundImage: `url(${window.location.origin}/custom/logo/logo.png)`,
          };
        }
      });
    },
  },
};
