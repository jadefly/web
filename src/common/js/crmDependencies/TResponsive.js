/**
 * @模块说明 TResponsive 如果是移动设备 赋予readonly属性 禁止弹出键盘
 * 
 * @版权所有 
 * 		天津市神州商龙科技股份有限公司
 * @修改历史
 * 		2015-05-20	金星	创建了该模块
 * 
 * @requires JQuery
 */

var TResponsive = new function(){
	this._otherStatus = null;
	/**
	 * @函数说明 判断是否是平板设备
	 * @修改历史
	 * 		2015-05-20 金星		创建该函数
	 * 		2016-04-01 扈健成		增加otherStatus 用于强行返回某些状态		
	 */
	this.judgeDeviceIsPad = function(otherStatus){
		if(otherStatus != null) {
			TResponsive._otherStatus = otherStatus;
		}
		
		if(TResponsive._otherStatus != null ){
			return TResponsive._otherStatus;
		}
//		return browser.isAndroid()||browser.isIPad()||browser.isTouch(); 暂不判断 win平板
		return browser.isAndroid()||browser.isIPad();
	};
	/**
	 * @函数说明 判断是否是iPad
	 * @修改历史
	 * 		2015-05-20 金星     创建该函数
	 */
	this.judgeDeviceIsiPad = function(){
		return browser.isIPad();
	};
	/**
	 * @函数说明 全局追加readonly
	 * @修改历史
	 * 		2015-05-20 金星     创建该函数
	 */
	this.judgeInput = function(){//判断添加readonly
		var me = this;
		if(me.judgeDeviceIsPad()){
			var $inputs = $("input:text,input:password");
			for(i=0;i<$inputs.length;i++){
				if($inputs[i].dataset.padread != 0){//input标签中设置data-padread=0, 则可弹出平板的系统键盘
					$inputs[i].readOnly = true;
					$inputs[i].className = $inputs[i].className + " readonly-white";
				}
			}
			$inputs.on("touchend", function () {
				$(this)[0].focus();
			});
		}
	};
		/**
		 * @函数说明 id如果是text追加readonly
		 * @修改历史
		 * 		2015-05-22 金星     创建该函数
		 */
	this.judgeInputById = function(id){//判断添加readonly
		if(me.judgeDeviceIsPad()){
			var textid = $("#"+id);
			if(textid.is(":input:text")){
				textid.attr("readonly", true);
				textid.addClass("readonly-white");
			}
		}
	};
	
	/**
	 * @函数说明 输入框移除只读
	 * @修改历史
	 * 		2016-04-01 扈健成		创建该函数
	 */
	this.unReadonly = function(){
		var $inputs = $("input:text,input:password");
		$inputs.each(function(){
			$(this).removeAttr("readonly");
			$(this).removeClass("readonly-white");
		});
		$inputs.on("touchend", function () {
			$(this)[0].focus();
		});
	};
};

export default TResponsive