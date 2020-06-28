/**
 * @模块说明 虚拟键盘管理器
 *
 * 在input获取焦点的时候, 记录input的id, 再次点击键盘的时候对该input操作.
 * 会给input加上select事件,记录select的文字,用于选中的时候直接修改全部文字.(初始化的时候, input先focus触发一下, 再select)
 *
 * ftl 添加div
 *
 * 	黏贴使用 注id不要重名
    <div id="PkgNormal-numberKeyboard" style="display:none;position: absolute;border:1px solid #CCCCCC;background:#FAFAFA;">
		<#assign vk_id="PkgNormal-vk-numberKeyboard">
		<#assign isDepositDisable="true">
		<#include "/canyin/pos/common/VirtualKeyboard.ftl">
	</div>
 * @版权所有
 * 		天津市神州商龙科技股份有限公司
 * @修改历史
 * 		2014-07-16	刘庆魁	创建了该模块
 * 		2014-07-31	杨明宇	增加输入后触发keyup事件，触发表单验证
 * 		2014-08-05	刘庆魁	选中文本时,点击虚拟键盘直接更改选中的文字
 * 		2014-08-15	孟庆禹	抽取方法initFilter，filterItemByKeyFilter
 * 		2015-01-08	孟庆禹	移除了filterItemByKeyFilter 统一修改使用ReceptionModule.filterItemByKeyFilter
 * 		2016-07-12	杨家华	绑定虚拟键盘时添加自定义回调函数设置
 * 		2016-07-13	杨家华	根据后台设置禁用虚拟键盘
 *
 * @requires JQuery
 * @requires JQuery.selection
 */
import EventKey from './EventKey'

var VirtualKeyboard = new function(){
	this.disabled = false;

	// $.ajax({
	// 	url: CONTEXTPATH + "/canyin/sys/syssetting/getisshowvirtualkeyboard",
	// 	dataType:"text",
	// 	success:function(data){
	// 		if(data=='0'){
	// 			VirtualKeyboard.disabled = true
	// 		}
	// 	}
	// });

	this.keyboards = {};//键盘对象cache, key键盘id, value键盘对象

	var vkb_state = "vkb_state_";
	/**
	 * 映射小键盘key和js键盘事件代码关系
	 */
	var KEY_EVENT_MAP = {
		"dot": EventKey.NUM_PERIOD,
		"clear": EventKey.DELETE,
		"enter": EventKey.ENTER,
		1: EventKey.NUM_ONE,
		2: EventKey.NUM_TWO,
		3: EventKey.NUM_THREE,
		4: EventKey.NUM_FOUR,
		5: EventKey.NUM_FIVE,
		6: EventKey.NUM_SIX,
		7: EventKey.NUM_SEVEN,
		8: EventKey.NUM_EIGHT,
		9: EventKey.NUM_NINE,
		0: EventKey.NUM_ZERO,
		'close': 'close',
		'change': 'change',
		'lock': 'lock',
		'backspace': EventKey.BACKSPACE,
		'#abc': '#abc',
		'#def': '#def',
		'#ghi': '#ghi',
		'#jkl': '#jkl',
		'#mno': '#mno',
		'#pqrs': '#pqrs',
		'#tuv': '#tuv',
		'#wxyz': '#wxyz',
		'a': EventKey.A,
		'b': EventKey.B,
		'c': EventKey.C,
		'd': EventKey.D,
		'e': EventKey.E,
		'f': EventKey.F,
		'g': EventKey.G,
		'h': EventKey.H,
		'i': EventKey.I,
		'j': EventKey.J,
		'k': EventKey.K,
		'l': EventKey.L,
		'm': EventKey.M,
		'n': EventKey.N,
		'o': EventKey.O,
		'p': EventKey.P,
		'q': EventKey.Q,
		'r': EventKey.R,
		's': EventKey.S,
		't': EventKey.T,
		'u': EventKey.U,
		'v': EventKey.V,
		'w': EventKey.W,
		'x': EventKey.X,
		'y': EventKey.Y,
		'z': EventKey.Z
	};

	/**
	 * @函数说明 键盘默认显示位置和隐藏功能
	 * @修改历史
	 * 2014-10-24	孟庆禹  添加键盘默认显示位置和隐藏功能
	 * @param {String} keyboardId 键盘区域的id, 默认pos_vk,与ftl中一致
	 * @param {Object} obj 选填参数 input 输入框dom对象 作用：根据输入框位置自动设置弹出键盘位置
	 * @param {int} top 选填参数 弹出键盘位置纵坐标偏移量
	 * @param {int} left 选填参数 弹出键盘位置横坐标偏移量
	 */
	function initPosition(keyboardId, obj, top, left) {
		if(obj!=null&&keyboardId!=null) {//输入框对象和小键盘divID不为空才可执行
			var keyboardDiv = $("#"+keyboardId).parent();
			var divX = $(obj).offset().left + (left|0);
			var divY = $(obj).offset().top + (top|0);
			var height = $(obj).css("height").replace("px","");
			keyboardDiv.css("left",divX + "px");
			keyboardDiv.css("top",divY + (10 - parseFloat(height)) + "px");

			//隐藏键盘事件
			$(document).unbind("click.keyboard");
			$(document).bind("click.keyboard",function(e){
				var target  = $(e.target);
				if(target.attr("id")!=obj.id){//判断冒泡事件流的id，不相等才是外层事件
					if(target.attr("class")==undefined || target.attr("class").indexOf("pos-vk-btn")==-1){
						keyboardDiv.hide();
						$(document).unbind("click.keyboard");
					}
				}
			});
		}
	}

	/**
	 * @函数说明 获取键盘对象, 采用cache.
	 *	自定义事件:vkbclick(event[inputkey,key,tcslFilter])
		说明:
		inputkey:	当前绑定小键盘的输入框的 value
		key: 		当前点击小键盘的 data-key 参考VirtualKey.ftl
		tcslFilter: VirtualKeyboard.initFilter函数所生成的对象,当发现绑定的input中data("tcslFilter")中包含此对象则直接使用,
					否则生成新的filter(调用VirtualKeyboard.initFilter生成),键盘点击时候会自动调用filter.add和filter.clear函数,外部不用做处理.
	 * @修改历史
	 * 		2014-07-17	刘庆魁	创建了该函数
	 * 		2014-10-24	孟庆禹  添加键盘默认显示位置
	 * 		2015-02-10	李小龙	添加vkbclick事件
	 * 		2016-07-12	杨家华	添加自定义回调函数
	 * @param {String} keyboardId 键盘区域的id, 默认pos_vk,与ftl中一致
	 * @param {Boolean} setIsRead 平板是否设置readonly，true为设置
	 * @param {JqueryEventObject} e
	 */
	this.get = function(keyboardId,opt,setIsRead){
		var _this=this;

		TResponsive.judgeInput(); //判断设备 如果是移动端 禁止弹出键盘

		keyboardId = keyboardId || "pos_vk";

		var _opt = {}

		$.extend(_opt,opt || {});

		//initPosition(keyboardId, obj, top, left);//初始化小键盘弹出位置，及隐藏功能

		var keyboard = this.keyboards[keyboardId];
		//初始化内部键盘对象
		if( !keyboard ){
			keyboard = {};
			keyboard.opt = _opt;
			keyboard.id = keyboardId;//键盘dom的id
			keyboard.bind = this.bind;//内部事件
			keyboard.inputId = null;//当前绑定的输入框id
			keyboard.reloadState = function(vkbState){ //刷新状态
				if(vkbState){
					this.vkbStateKey = vkbState;
				}
				if($.cookie(this.vkbStateKey) == "1"){
					$("#" + this.id + " .key-number").hide();
					$("#" + this.id + " .key-zimu").show();
				}else{
					$("#" + this.id + " .key-number").show();
					$("#" + this.id + " .key-zimu").hide();
				}
				return this;
			}
			this.keyboards[keyboardId] = keyboard;
		}

		//初始化键盘dom事件
		var keyboardEl = $("#"+keyboardId);
		var vkPopover = keyboardEl.parents('.popover');
		var vkNumber = keyboardEl.find(".key-number");
		var vkZimu = keyboardEl.find(".key-zimu");
		var vkQWE = keyboardEl.find('.key-qwe');
		var changeBtn = keyboardEl.find(".pos-vk-btn-switch");
		//状态记录
		keyboard.vkbStateKey = _opt.vkbStateKey || vkb_state;
		if(changeBtn.length > 0){
			if(typeof(_opt.defaultType) == 'string' || (_opt.defaultType == undefined && $.cookie(keyboard.vkbStateKey ) == '1')){
				if(_opt.isQWEKeyboard){
					vkQWE.show();
					vkPopover.addClass('popover-qwe').css({'left': '-270px','z-index': '999'});
				}else{
					vkZimu.show();
				}
				vkNumber.hide();
			}else{
				vkNumber.show();
				vkZimu.hide();
				vkQWE.hide();
				if(_opt.isQWEKeyboard){
					vkPopover.removeClass('popover-qwe').css('left', '-2px');
				}
			}
		}

		if( keyboardEl.data("isVkInited")!="1" ){
			//使用data isVkInited='1' 标记键盘被绑定了事件
			var keyboardEvent = function(e){
				var keyboard = e.data;//键盘对象
				var key = $(this).data("key");
				var input = $("#"+ keyboard.inputId);//绑定的输入框

				//获取filter
				var tcslFilter = input.data("tcslFilter");
				if(!tcslFilter){
					tcslFilter = VirtualKeyboard.initFilter();
					input.data("tcslFilter",tcslFilter);
				}

				var val = input.val();


				if (key == "dot"){
					//小数点
					if( val.indexOf(".")==-1 ){
						val += ".";
					}
				} else if (key == "clear"){
					//清除
					val = "";
					tcslFilter.clear();
				} else if( key=="enter" ){
					//回车
				} else if ( key == 'lock' ) {
					// 锁
					if(keyboardEl.data('isLock')){
						// 从锁到不锁
						keyboardEl.data('isLock', false).removeClass('lock');
						VirtualKeyboard.lock = false;
					}else{
						// 从不锁定到锁时
						keyboardEl.data('isLock', true).addClass('lock');
						VirtualKeyboard.lock = true;
					}
				} else if(key == 'backspace'){
					tcslFilter.remove();
					val = tcslFilter.getText();
				}else if (key=="close"){
					input.popover("hide");
				}else if (key=="change"){
					if(!vkNumber.is(":visible")){
						vkNumber.show();
						vkZimu.hide();
						vkQWE.hide();
						VirtualKeyboard.fromChangeAction = true;
						if(_opt.isQWEKeyboard){
							vkPopover.removeClass('popover-qwe').css('left', '-2px');
						}
						//记录状态
						if(_opt.defaultType == undefined){
						 $.cookie(keyboard.vkbStateKey,"0");
						}
						VirtualKeyboard.lock = false;
					} else {
						if(_opt.isQWEKeyboard){
							vkQWE.show();
							vkPopover.addClass('popover-qwe').css({'left': '-270px','z-index': '999'});
						}else{
							vkZimu.show();
						}
						vkNumber.hide();
						if(keyboardEl.data('isLock')==true){
							VirtualKeyboard.lock = true;
						}
						if(_opt.defaultType == undefined){
						$.cookie(keyboard.vkbStateKey,"1");
						}
					}
				} else {

					//判断如果绑定了列表, 列表数据中size == 0,则不管了
					if(keyboard.opt.filterItems && $(keyboard.opt.filterItems).size() == 0) return;
					//如果是0，不去判断数字格式，因为不能确认输入框是文本还是数字，除非给小键盘加入‘模式’概念
					var rkey = key;
					if(key.toString().indexOf("#") == 0){
						rkey = "("+rkey.substring(1)+")";
					}
					//去掉上次选中的
					val = val.replace(input.data("vkSelectedText"),"");
          // 第一次输入后vkSelectedText值还是0，第二次时等于'0.8'.replace('0', '') = 8
          // 这里判断如果小数点前面没有值的话，添加一个0
          if(val.indexOf('.') === 0) {
            val = '0' + val;
          }
					input.data("vkSelectedText", "");//清掉上次选中的text
					val += rkey;
					tcslFilter.add(key);
				}
				if(_opt.validateFloat && /^\d*(?:\.\d{0,2})?$/.test(tcslFilter.getText()) == false){
					tcslFilter.remove();
					val = tcslFilter.getText();
				}
				// 加入最大长度录入限制
				if(input.attr("maxlength")) {
					if(val.length > input.attr("maxlength"))
						return;
				}
				if(_opt.customCallback){
					_opt.customCallback(jQuery.Event("keyup", {
						which: KEY_EVENT_MAP[key],
						target: {
							id: keyboard.inputId
						}
					}));
				}else{
					input.val(val);
					input.focus();

					//触发事件
					input.trigger(jQuery.Event( "vkbclick", { inputkey:val,key:$(this).data("key"),tcslFilter:tcslFilter} ));

					//通过keyup触发表单验证的事件，放在赋值后面，不然验证时获取的field值是按键之前的
					input.trigger(jQuery.Event( "keyup", { which: KEY_EVENT_MAP[key] } ));

					//触发回车切焦点事件
					if( key=="enter" ){//回车
						input.trigger(jQuery.Event( "keypress", { which: EventKey.ENTER } ));
					}
					if(_opt.done){
						_opt.done(jQuery.Event('keyup', {
							which: KEY_EVENT_MAP[key],
							target: {
								id: keyboard.inputId
							}
						}), val);
					}
				}
			};
			//按键点击事件
			if(TResponsive.judgeDeviceIsPad() ||(keyboard.opt && keyboard.opt.event && keyboard.opt.event == 'click')){
				keyboardEl.find(".pos-vk-btn").click(keyboard, keyboardEvent);
			}else{
				keyboardEl.find(".pos-vk-btn").mousedown(keyboard, keyboardEvent);
			}
			keyboardEl.data("isVkInited", "1");//标记键盘click事件已经绑定好
		}



		return keyboard;
	};


	/**
	 * @函数说明 绑定当前键盘对象的输入框, 通过vkSelectedText绑定控件select后记录选中文字数据
	 * @修改历史
	 * 		2014-07-17	刘庆魁	创建了该函数
	 * @param {String} inputId 输入框的id
	 * @private
	 */
	this.bind = function(inputId){

		if( !inputId )
			return;

		var input = $("#"+inputId);
		//上一个输入框,移除虚拟键盘焦点标志位
		$("#"+inputId).removeData("isVkFocus");

		var keyboard = this;
		keyboard.inputId = inputId;

		//标识为被虚拟键盘焦点
		input.data("isVkFocus", true);

		//如果是第一次被bind, 加入select时更新选取文字的事件
		if( input.data("vkSelectedText") === undefined ){
			input.select(function(){
				input.data("vkSelectedText", input.selection());
			});
		}

	};

	/**
	 * @函数说明 获取键盘输入过滤器
	 * @修改历史
	 * 		2014-08-15	孟庆禹	创建该函数
	 * 		2015-02-19	刘庆魁	从reception.js中复制新版修复九宫格4个字母的bug;
	 * 		2015-02-19	刘庆魁	在套餐中也用到了, 作用域标识为public
	 * @return {Object} 过滤器对象, api参考代码
	 * @public
	 */
	this.initFilter = function(){

		//键盘输入过滤器
		var _filter = new function(){

			var _stack = [];//内部栈, 记录每一次按键, 用于拼接查询条件

			this.stack = _stack;

			//增加条件, 参数是 字面值, 例如 1 a 或者 #abc
			this.add = function(c){
				_stack.push(c);
			};

			//减少条件
			this.remove = function(){
				_stack.pop();
			};

			//清空条件
			this.clear = function(){
				_stack = [];
				this.stack = _stack;
			};
			//获取显示文字, 例如 abc(def)12
			this.getText = function(){
				var text = "";
				for( var i=0;i<_stack.length;i++ ){
					var f = _stack[i]+"";
					if(f.indexOf("#")==0){
						text += "(" + f.substring(1,f.length) + ")";
					} else {
						text += f;
					}
				}
				return text;
			};

			//过滤条件生成
			this.getFilterTexts = function(result, index) {
				if(this.stack.length == 0) return [];
				if(!result){//初始化
					result = new Array();
					index = 0;
				}
				var str = this.stack[index] + "";//取栈中第n个字符串
				if(str.indexOf("#") == 0) {//九宫格
					var characters = str.substring(1).split("");//拆开得到字符数组 'abc' -> ['a','b','c']
					if(result.length == 0) {//长度为0, 合并数组
						result = result.concat(characters);
					} else {//字符数组每个字符拼接在所有字符串后['a','b','c'] -(#def)-> ['ad', 'bd', 'cd', 'ae', 'af', 'be', 'bf', 'ce', 'cf']
						for(var i in result) {
							var temp = result[i];
							result[i] = temp + characters[0];
							for(var j = 1; j < characters.length; j++) {
								result.push(temp + characters[j]);
							}
						}
					}
				} else {//键盘输入
					if(result.length == 0) {//[] -> ['a']
						result.push(str);
					} else {
						for(var i in result) {//['a'] -> ['as']
							var temp = result[i];
							result[i] = temp + str;
						}
					}
				}

				if(index == this.stack.length - 1) {
					return result;
				} else {
					return this.getFilterTexts(result, index + 1);
				}
			};

		};
		return _filter;
	};

	/**
	 * @函数说明 绑定输入框的浮动小键盘带切换
	 * 	绑定 vkbclick 事件回传数据{inputkey:录入的数据,key:当前点击的值,tcslFilter:<initFilter>生成的对象}
	 * @修改历史
	 * 		2015-01-13	李小龙	创建了该函数
	 * @param {String} jq 输入框的id
	 * @param {opt} 弹出框配置参考popover
	 *
	 */
	this.bindSwitchPopoverKeybored = function(jq,opt,call){
		var _opt = {
 			content:function(){
 				var ct = $("#module-bill-globle-switch-keypad").clone();
 				ct.find(".pos-vk").attr("id","key_" + $(this).attr("id"));
 				return ct.html();
 			}
 		}
 		if(opt) $.extend(_opt,opt);
 		return this.bindPopoverKeybored(jq,_opt);
	};

	/**
	 * @函数说明 绑定输入框的浮动小键盘
	 * @修改历史
	 * 		2015-01-13	李小龙	创建了该函数
	 * @param {String} jq 输入框的id
	 * @param {opt} 弹出框配置参考popover
	 */
	this.bindPopoverKeybored = function(jq,opt){
		//绑定的时候
		TResponsive.judgeInput(); //判断设备 如果是移动端 禁止弹出键盘

		$(jq).each(function(i){
			if(!$(this).attr("id")){ //如果没有id 分配一个id
				$(this).attr("id","inp_" + (new Date().getTime() + i));
			}
		});
		//默认设置
		var _opt = {
 			content:function(){
 				var ct = $("#module-bill-globle-number-keypad").clone();
 				ct.find(".pos-vk").attr("id","key_" + $(this).attr("id"));
 				return ct.html();
 			},
 			html:true,
 			placement: function (context, source) {
		        var position = $(source).position();
		        var pWinHeight = $(jq).parents(".panel-default").height();
		        if(pWinHeight){
					if(pWinHeight - position.top < 280 ) return "top";
		        }
		        return "bottom";
		   },
		   vkbopt: {validateFloat: true},
 			trigger:'manual',
 			'z-index':2000
 		};
 		if(opt) $.extend(_opt,opt);
		//使用bootstrap定位
		return $(jq).popover(_opt).on("click", function (event) {
			event.stopPropagation();
            var _this = this;
            var inp_id = $(this).attr("id");
            var key_id = "key_" + inp_id;
            var inp = $("#" + inp_id);
            //$(".popover.fade.in").hide();
//          $("#" + inp_id).on("blur",function(){
//          	$(_this).popover("hide");
//          });
//			var _this = this;
			$("#pos-main-tab").find("li").click(function(){
				$(_this).popover("hide");
			});

			$("#pos-sub-tab").find("li").click(function(){
				$(_this).popover("hide");
			});
			$(".module-header-msg").find("div").click(function(){
				$(_this).popover("hide");
			});

//			$("#pointBtnListDiv").find("button").click(function(){
//				$(_this).popover("hide");

//			})

            //显示小键盘
			$(_this).popover("show");
            //焦点定位在输入框中
			inp.data("vkSelectedText",inp.val()).focus();
			//显示tips
            $("#" + key_id + ' button[data-toggle="tooltip"]').tooltip();
            //绑定小键盘事件
            VirtualKeyboard.get(key_id,_opt.vkbopt || {}).bind(inp_id);
       
            $("#" + key_id + " .pos-vk-btn").mousedown(function(){
        	//call();
            	$("#" + inp_id).focus();
            	return false;
            });
          
            //移除时隐藏
            $(_this).siblings(".popover").on("mouseleave blur", function () {
            	if(!VirtualKeyboard.fromChangeAction && !VirtualKeyboard.lock&&($(_this)[0].id!="pos-main-filterBillText"&&$(_this)[0].id!="pos-main-filterText") ){
//            		if(($(_this)[0].id="pos-main-filterBillText") ||($(_this)[0].id="pos-main-filterText")){
//            			$(_this).popover('show');
//            		}else{
            			$(_this).popover('hide');
//            		}
            	}
            }).on('mouseenter', function(){
            	VirtualKeyboard.fromChangeAction = false;
            }).on("click", function(e){
            	inp.focus();
            	e.stopPropagation();
            });

        }).on("mouseleave blur", function () {
            var _this = this;
            setTimeout(function () {
                if (!$(".popover:hover").length && !VirtualKeyboard.fromChangeAction && !VirtualKeyboard.lock&&($(_this)[0].id!="pos-main-filterBillText"&&$(_this)[0].id!="pos-main-filterText")) {
//                	if(($(_this)[0].id="pos-main-filterBillText") ||($(_this)[0].id="pos-main-filterText")){
//            			$(_this).popover('show');
//            		}else{
            			$(_this).popover('hide');
//            		}
                }
            }, 300);
        });
	};

	function judgeClose(){
		var _this = this;
		if($(this).siblings(".popover")){

			$('body').on('touchstart', function(e){
				$(".popover.fade.in").hide();
//			    $("div[id^='tiptip_holder']").fadeOut("slow");
				e.stopPropagation();
			});
		}
	}

};

export default VirtualKeyboard