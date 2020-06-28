import axios from 'axios';
import qs from 'qs';
import $ from 'jquery';
import { extend, find } from 'lodash';
import { Message, MessageBox, Loading } from 'element-ui';
import Vue from 'vue';
import dateFormat from '@/common/js/dateformat';
import i18n from '@/locales/index';
import langTable from '@/common/dictionary/lang-table';
import logic from './logic';
import HotKey from './HotKey';

function backToHome() {
  if (process.env.NODE_ENV === 'development') {
    window.location.href = '/';
  } else {
    window.location.href = `${process.env.API_PATH}${process.env.DIST_PATH}/`;
  }
}

const hotKey = new HotKey();
const ajaxVM = new Vue();
class Ajax {
  constructor(api, options) {
    this.thenCallback = (data) => {
      Message.success(data);
    };
    this.catchCallback = (errCode, msg, title = i18n.t('Dict.Tips'), showDetails = false) => {
      if (!$('.ajax-error-alert:visible').length) {
        if (showDetails) {
          MessageBox.alert(`${msg}<br><small>(${errCode} - ${this.api})</small>`, title, {
            dangerouslyUseHTMLString: true,
            customClass: 'ajax-error-alert',
          });
        } else {
          MessageBox.alert(msg, title, {
            customClass: 'ajax-error-alert',
            dangerouslyUseHTMLString: true,
          });
        }
      }
    };
    this.api = api;
    this.retry = 3;
    const defaults = {
      timeout: 15000,
      error: null,
      needToken: false,
      contentType: null,
      loading: true,
      errorCallBack: null,
      needLog: false,
    };
    this.options = extend(defaults, options);
    if (this.options.needToken && this.options.data) {
      this.getToken((tokenId) => {
        this.transOptions(tokenId);
      });
    } else {
      this.transOptions();
    }
  }

  transOptions(tokenId) {
    const finded = find(langTable, { name: i18n.locale });
    const headers = {
      'X-Requested-With': 'XMLHttpRequest',
      cy_locale: finded.lang,
    };
    extend(this.options, { headers });
    if (tokenId && this.options.data) {
      extend(this.options.data, { token_id: tokenId });
    }
    if (this.options.contentType === 'URLEncoded' || this.options.contentType === 'URLEncoded.qs') {
      extend(this.options, {
        method: 'post',
        headers: extend({}, headers, { 'Content-Type': 'application/x-www-form-urlencoded' }),
        transformRequest: [data => qs.stringify(data)],
      });
    }
    if (this.options.contentType === 'paramsEncoded' || this.options.contentType === 'URLEncoded.params') {
      extend(this.options, {
        method: 'post',
        headers: extend({}, headers, { 'Content-Type': 'application/x-www-form-urlencoded' }),
        transformRequest: [data => `params=${encodeURIComponent(JSON.stringify(data))}`],
      });
    }
    if (this.options.contentType === 'URIEncodedToken' || this.options.contentType === 'URIEncoded.token') {
      extend(this.options, {
        method: 'post',
        headers: extend({}, headers, { 'Content-Type': 'application/x-www-form-urlencoded' }),
        transformRequest: [data => qs.stringify({
          params: JSON.stringify(data),
        })],
      });
    }
    if (this.options.contentType === 'URIEncoded' || this.options.contentType === 'URLEncoded.URI') {
      extend(this.options, {
        method: 'post',
        headers: extend({}, headers, { 'Content-Type': 'application/x-www-form-urlencoded' }),
        transformRequest: [data => encodeURI(qs.stringify(data))],
      });
    }
    if (this.options.contentType === 'json') {
      extend(this.options, {
        method: 'post',
        headers: extend({}, headers, { 'Content-Type': 'application/json' }),
        transformRequest: [data => JSON.stringify(data)],
      });
    }
    if (this.options.contentType === 'diy') {
      extend(this.options, {
        method: 'post',
        headers: extend({}, headers, { 'Content-Type': 'application/x-www-form-urlencoded' }),
        transformRequest: [data => data],
      });
    }
    this.submit();
  }

  submit(timeout) {
    const getLogic = logic(this.api);
    let ajaxLoading = null;
    if (getLogic && getLogic.url && getLogic.trans) {
      if (this.options.loading) {
        hotKey.stop();
        ajaxLoading = Loading.service({
          background: 'rgba(0, 0, 0, 0)',
          spinner: 'ajax-loading-none',
          customClass: 'ajax-loading',
        });
      }
      let opt = {};
      if (timeout) {
        opt = extend({}, this.options, { timeout });
      } else {
        opt = this.options;
      }
      // axios.defaults.baseURL = process.env.API_PATH;
      axios(extend({ url: process.env.API_PATH + getLogic.url }, opt)).then((res) => {
        if (this.options.needLog) {
          const logStr = JSON.stringify(res.data);
          ajaxVM.$log.info(`接口：${this.api} | 返回：${logStr}`);
        }
        if (this.options.loading) {
          hotKey.start();
          ajaxLoading.close();
        }
        // 如果不是 login 接口的请求，返回的 msg 信息为'platform/login/login/loginNew'，则强制跳转到登录页
        if (res.data.msg === 'closePs-redirect-loginPage') {
          if (res.data.data) {
            MessageBox.alert(res.data.data, i18n.t('Dict.Tips'), {
              callback: () => {
                backToHome();
              },
            });
          } else {
            backToHome();
          }
        } else if (
          this.api !== 'platform.login.login.login'
          && this.api !== 'canyin.pos.reception.receptionbusiness.exitreceptionbusiness'
          && (
            res.data.msg === 'platform/login/login/loginNew'
            || JSON.stringify(res.data).includes('redirect:/canyin/pos/opening/page')
          )
        ) {
          backToHome();
        } else {
          const transformed = getLogic.trans(res.data);
          if (transformed.success) {
            this.thenCallback(transformed.data);
          } else if (transformed.errCode === -2 || transformed.errCode === '-2') {
            ajaxVM.$vemit('posAuthCheck', {
              message: transformed.msg,
            });
            // setTimeout(() => {
            //   Message.error(transformed.msg)
            // },100)
          } else {
            console.log(transformed.errCode, transformed.msg);
            this.errorHandler(transformed.errCode, transformed.msg);
          }
        }
      }).catch((error) => {
        if (
          error.toString().indexOf('null') !== -1
          || error.toString().indexOf('undefined') !== -1
          || error.toString().indexOf('defined') !== -1
        ) {
          console.warn(error);
        }
        if (this.options.loading) {
          hotKey.start();
          ajaxLoading.close();
        }
        if (this.options.errorCallBack) {
          this.options.errorCallBack();
        }
        let message = '';
        if (error.response === undefined) {
          this.catchCallback(
            'error',
            i18n.t('Dict.AjaxMessage.Message1'),
            i18n.t('Dict.SystemError'),
            true,
          );
        }
        if (error.response) {
          // 请求已发出，但服务器响应的状态码不在 2xx 范围内
          // error.response.status 错误码
          if (error.response.status === 504) {
            this.catchCallback(
              '504',
              i18n.t('Dict.AjaxMessage.Message1'),
              i18n.t('Dict.SystemError'),
              true,
            );
            return;
          }
          if (error.response.status === 404) {
            this.catchCallback(
              '404',
              i18n.t('Dict.AjaxMessage.Message2'),
              i18n.t('Dict.SystemError'),
              true,
            );
            return;
          }
          if (error.response.status === 405) {
            this.catchCallback(
              '405',
              i18n.t('Dict.AjaxMessage.Message3'),
              i18n.t('Dict.Tips'),
              true,
            );
            return;
          }
          if (error.response.status === 406) {
            MessageBox.alert(
              i18n.t('Dict.AjaxMessage.Message4'),
              i18n.t('Dict.Tips'),
              {
                callback: () => {
                  backToHome();
                },
              },
            );
            return;
          }
          if (
            error.response.status === 410
            || error.response.status === 500
          ) {
            this.errorHandler(error.response.status, (error.response.data && error.response.data.msg ? error.response.data.msg : ''));
            return;
          }
          message = error.response.status + (error.response.data && error.response.data.msg ? (` - ${error.response.data.msg}`) : '');
        } else {
          // Something happened in setting up the request that triggered an Error
          message = error.message || error.response.data.msg;
        }
        // error.config.url url
        // error.config.method 请求方式
        // error.config.params 请求参数
        let errMessage = '';
        if (error.config) {
          errMessage = `${message} - ${error.config.method}:${error.config.url}${error.config.params ? (`(${JSON.stringify(error.config.params)})`) : ''}`;
        } else {
          errMessage = `${message} - ${error.toString()}`;
        }
        const log = [
          dateFormat(),
          '请求错误',
          errMessage,
        ].join(' | ');
        window.console.error(log);
        if (this.options.needToken) {
          if (this.retry > 0) {
            MessageBox.confirm(i18n.t('Dict.AjaxMessage.Message5'), i18n.t('Dict.SystemError'), {
              showCancelButton: false,
              closeOnPressEscape: false,
              closeOnClickModal: false,
              showClose: false,
              confirmButtonText: i18n.t('Dict.AjaxMessage.RetryBtn', [this.retry]),
            }).then(() => {
              this.retry -= 1;
              this.submit(3000);
            }).catch(() => {});
          } else {
            window.location.reload();
          }
        } else {
          window.console.error(log);
          ajaxVM.$log.error(log);
          this.catchCallback(
            'timeout',
            i18n.t('Dict.AjaxMessage.Message6'),
            i18n.t('Dict.WrongInfo'),
            true,
          );
        }

        // 如果设置了 error 则执行自定义的错误处理
        if (this.options.error) {
          this.options.error(error);
        }
      });
    } else {
      Message.error(i18n.t('Dict.AjaxMessage.Message8', [this.api]));
    }
  }

  getToken(next) {
    window.console.log(this.api);
    new Ajax('canyin.pos.token.get').then((tokenId) => {
      next(tokenId);
    });
  }

  then(callback) {
    this.thenCallback = callback;
    return this;
  }

  catch(callback) {
    this.catchCallback = callback;
    return this;
  }

  errorHandler(errCode, msg) {
    // 前置方法
    this.catchCallback(errCode, msg || i18n.t('Dict.AjaxMessage.Message7'));
  }
}

function createInstance(api, options) {
  return new Ajax(api, options);
}

const ajax = createInstance;

export default ajax;
