const ua = window.navigator.userAgent;
const p = window.navigator.platform;
const t = window.navigator.maxTouchPoints;

export default {
  version() {
    return ua.match(/.+(?:rv|it|ra|ie)[/: ]([\d.]+)/) || [];
  },
  isSafari() {
    return (/Safari/gi).test(window.navigator.appVersion);
  },
  isWebkit() {
    return (/webkit/i).test(ua);
  },
  isOpera() {
    return (/opera/i).test(ua);
  },
  isMsIE() {
    return (/msie/i).test(ua) && !this.opera;
  },
  isChrome() {
    return (/Chrome/i).test(ua);
  },
  isFirefox() {
    return (/Firefox/i).test(ua);
  },
  ifFennec() {
    return (/Fennec/i).test(ua);
  },
  isMozilla() {
    return (/mozilla/i).test(ua) && !/(compatible|webkit)/.test(ua);
  },
  isAndroid() {
    return (/android/i).test(ua);
  },
  isCyAndroid() {
    return (/canyin/i).test(ua);
  },
  isBlackBerry() {
    return (/blackberry/i).test(ua);
  },
  isIOS() {
    return (/iphone|ipod|ipad/gi).test(p);
  },
  isIPad() {
    return (/ipad/gi).test(p);
  },
  isIPhone() {
    return (/iphone/gi).test(p);
  },
  isIPod() {
    return (/ipod/gi).test(p);
  },
  isWin() {
    return (/Win32|Win64/gi).test(p);
  },
  isTouch() {
    return t > 1;
  },
};
