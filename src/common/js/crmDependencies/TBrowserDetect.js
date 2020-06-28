/**
 * @模块说明 判断浏览器
 * 
 * @版权所有 
 * 		天津市神州商龙科技股份有限公司
 * @修改历史
 * 		2014-11-18	李小龙	创建了该模块
 * 
 * @requires JQuery
 */
(function (w) {

	var ua = w.navigator.userAgent, p = w.navigator.platform, t = w.navigator.maxTouchPoints;
	function version() { return (ua.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || []); }
	function isSafari() { return (/Safari/gi).test(w.navigator.appVersion); }
	function isWebkit() { return (/webkit/i).test(ua); }
	function isOpera() { return (/opera/i).test(ua); }
	function isMsIE() { return (/msie/i).test(ua) && !this.opera; }
	function isChrome() { return (/Chrome/i).test(ua); }
	function isFirefox() { return (/Firefox/i).test(ua); }
	function isFennec() { return (/Fennec/i).test(ua); }
	function isMozilla() { return (/mozilla/i).test(ua) && !/(compatible|webkit)/.test(ua); }
	function isAndroid() { return (/android/i).test(ua); }
	function isCyAndroid() { return (/canyin/i).test(ua); }
	function isBlackBerry() { return (/blackberry/i).test(ua); }
	function isIOS() { return (/iphone|ipod|ipad/gi).test(p); }
	function isIPad() { return (/ipad/gi).test(p); }
	function isIPhone() { return (/iphone/gi).test(p); }
	function isIPod() { return (/ipod/gi).test(p); }
	function isWin() { return (/Win32|Win64/gi).test(p); }
	function isTouch() { return (t > 1); }
	
	w.browser = {
		getVersion: version,
		isSafari: isSafari,
		isWebkit: isWebkit,
		isOpera: isOpera,
		isMsIE: isMsIE,
		isChrome: isChrome,
		isFirefox: isFirefox,
		isFennec: isFennec,
		isMozilla: isMozilla,
		isAndroid: isAndroid,
		isBlackBerry: isBlackBerry,
		isIOS: isIOS,
		isIPhone: isIPhone,
		isIPad: isIPad,
		isIPod: isIPod,
		isWin:isWin,
		isCyAndroid:isCyAndroid,
		isTouch:isTouch
	};

	if (w.jQuery)
		w.jQuery.browser = w.browser;

})(window);