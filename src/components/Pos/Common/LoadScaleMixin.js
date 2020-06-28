import { delay } from 'lodash';
import i18n from '@/locales/index';

export default {
  methods: {
    loadScale(next) {
      const loading = this.$loading({
        // text: '正在称重...',
        text: i18n.t('Biz.Pos.Common.CommTip02'),
        background: 'rgba(255, 255, 255, 0)',
      });
      this.$devices.Scale.get((data) => {
        loading.close();
        if (data.returnCode === 0 && data.value > 0) {
          next(data.value);
        } else {
          if (data.returnCode === -100) {
            // this.$alert('点击确定添加品项数量为1', '设备管理器连接异常').then(() => {
            this.$alert(i18n.t('Biz.Pos.Common.CommTip03'), i18n.t('Biz.Pos.Common.CommTip04')).then(() => {
              next(1, true);
            });
            return;
          }
          const errLoading = this.$loading({
            // text: '称重错误，正在重试...',
            text: i18n.t('Biz.Pos.Common.CommTip05'),
            background: 'rgba(255, 255, 255, 0)',
          });
          delay(() => {
            this.$devices.Scale.get((scale) => {
              errLoading.close();
              if (scale.returnCode === 0 && scale.value > 0) {
                next(scale.value);
              } else {
                // 彻底失败了
                // $t-请将物品重新稳定放在电子秤上，然后点击.....
                // $t-称重失败，是否重试？
                // $t-重试
                this.$confirm(
                  i18n.t('Biz.Pos.Common.CommTip06'),
                  i18n.t('Biz.Pos.Common.CommTip07'),
                  { confirmButtonText: i18n.t('Biz.Pos.Common.CommTip07') },
                ).then(() => {
                  this.loadScale(next);
                }).catch(() => {
                  next(1, true);
                });
              }
            });
          }, 500);
        }
      });
    },
  },
};
