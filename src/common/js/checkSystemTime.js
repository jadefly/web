import { MessageBox } from 'element-ui';
import ajax from '@/common/js/ajax';
import i18n from '@/locales/index';

// 校验系统时间
function doBiz() {
  return new Promise((resolve) => {
    ajax('canyin.pos.checkSystemTime.doBiz').then((data) => {
      resolve(data.success);
    });
  });
}

// 路由跳转
function jumpUrl(href) {
  window.location.href = href;
}

// 回到登录页
function gotoLoginPager() {
  MessageBox.alert(i18n.t('Dict.SysTimeErrorMessage'), {
    confirmButtonText: i18n.t('Dict.Sure'),
    type: 'error',
    callback: () => {
      const ENV = process.env;
      if (ENV.NODE_ENV === 'development') {
        jumpUrl('/');
      }
      if (ENV.NODE_ENV === 'production') {
        jumpUrl(`${ENV.API_PATH}${ENV.DIST_PATH}/`);
      }
    },
  });
}

export default async function checkSystemTime() {
  const result = await doBiz();
  if (result) {
    return true;
  }
  await gotoLoginPager();
  return Promise.reject(new Error(i18n.t('Dict.SysTimeErrorMessage')));
}
