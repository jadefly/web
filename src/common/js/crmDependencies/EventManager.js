/**
 * @模块说明 事件管理器
 * 
 * 使用说明
 * 1.需要初始化: EventManager.init();//注册全局事件处理
 * 2.调用keydown方法注册事件, 参数参考方法说明
 * 
 * @版权所有 
 * 		天津市神州商龙科技股份有限公司
 * @修改历史
 * 		2013-12-12	刘庆魁	创建了该模块 		
 * 		2014-07-21	刘庆魁	加入临时停止事件响应的api
 * 		2014-08-15	孟庆禹	抽取KEYCODE_MAP属性
 * 		2015-01-16	扈健成	补充96-105键盘对照属性
 * 
 * @requires ModuleManager 获取当前的模块, 发送事件. 
 */
var EventManager = new function(){

	/** 键盘事件与按键值的对应 */
    this.KEYCODE_MAP = {48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 54:"6", 55:"7", 
    		56:"8", 57:"9", 65:"a", 66:"b", 67:"c", 68:"d", 69:"e", 70:"f", 71:"g", 
    		72:"h", 73:"i", 74:"j", 75:"k", 76:"l", 77:"m", 78:"n", 79:"o", 80:"p", 
    		81:"q", 82:"r", 83:"s", 84:"t", 85:"u", 86:"v", 87:"w", 88:"x", 89:"y", 
    		90:"z", 96:"0", 97:"1", 98:"2", 99:"3", 100:"4", 101:"5", 102:"6", 103:"7",
    		104:"8", 105:"9"
    };
    var errorKeyCode = 229;
    
	/** 标记是否响应事件, 例如在弹出alert时不响应事件 */
	this._isStop = false;
	
	/** 事件容器,key是 模块名称_按键代码_ctrl_shift_alt, 例如 Billing_65_1_0_0表示ctrl a 组合键, value是回调函数 */
	this.ctx = {};
	
	/** 记录模块的所有事件, key是模块名, value是事件名称数组 ; 在模块关闭时移除事件 */
	this.modulesEvents = {};
	
	/**
	 * 绑定事件
	 * @param {Object} config 
	 * @param {String} config.moduleName: 模块名称
	 * @param {EventKey} config.keyCode 按钮代码,EventKey的常量
	 * @param {Boolean} config.ctrlKey 是否按下ctrl键
	 * @param {Boolean} config.shiftKey 是否按下shift键
	 * @param {Boolean} config.altKey 是否按下alt键
	 * @param {Function} config.handler: 事件处理函数, 作用域是模块实例, 第一个参数是jq的event对象, 返回false停止事件继续处理.
	 */
	this.keydown = function(config){
		var moduleName = config.moduleName;//模块名称
		var keyCode = config.keyCode;//按键代码
		var eventType = config.eventType || "keydown"; //事件类型
		var on = config.on || true; //是否执行
		
		var ctrlKey = config.ctrlKey ? 1 : 0;//是否按下ctrl
		var shiftKey = config.shiftKey ? 1 : 0;//是否按下shift
		var altKey = config.altKey ? 1 : 0;////是否按下alt
		
		var ctxKey = moduleName + "_"+ keyCode + "_"+ ctrlKey + "_"+ shiftKey + "_"+ altKey;

		//将事件放入队列
		this.ctx[ctxKey] = {
			on:on,
			moduleName:moduleName,
			keyCode:keyCode,
			eventType:eventType,
			handler:config.handler,
			alias:config.alias || moduleName
		};
		
		//记录该模块事件
		var moduleEventsList = null;
		if(!this.modulesEvents[moduleName]){
			this.modulesEvents[moduleName] = [];//初始化数组
		}
		moduleEventsList = this.modulesEvents[moduleName];
		
		moduleEventsList.push(ctxKey);
	};
	
	/**
	 * @函数说明 移除模块的全部键盘事件
	 * @修改历史
	 * 		2013-12-16	刘庆魁	创建了该函数
	 * @param {String} moduleName 模块名称
	 */
	this.removeModuleKeyEvents = function(moduleName){
		var eventKeys = this.modulesEvents[moduleName];//ctx中事件的key集合
		if( eventKeys ){
			for( var i=0;i<eventKeys.length; i++ ){
				delete this.ctx[eventKeys[i]];
			}
			delete this.modulesEvents[moduleName];
		}
	};
	
	/**
	 * @函数说明 是否处在停止响应状态
	 * @修改历史
	 * 		2014-07-21	刘庆魁	创建了该函数
	 * @return {Boolean}
	 */
	this.isStop = function(){
		return this._isStop;
	};
	
	/**
	 * @函数说明 暂停事件响应
	 * @修改历史
	 * 		2014-07-21	刘庆魁	创建了该函数
	 * @public
	 */
	this.pauseEvent = function(){
		this._isStop = true;
	};
	
	/**
	 * @函数说明 恢复事件响应
	 * @修改历史
	 * 		2014-07-21	刘庆魁	创建了该函数
	 * @public
	 */
	this.resumeEvent = function(){
		this._isStop = false;
	}
	
	/**
	 * @函数说明 根据模块名称检索
	 * @修改历史
	 * 		2014-07-21	刘庆魁	创建了该函数
	 * @public
	 */
	this.findReg = function(alias){
		for(var c in this.ctx ){
			if(alias == this.ctx[c].alias)
				return this.ctx[c];
		}
	}
	
	/**
	 * @函数说明 注册全局事件响应, 分发处理keydown方法注册的内部事件
	 * @修改历史
	 * 		2013-12-16	刘庆魁	创建了该函数
	 * @param {String} moduleName 模块名称
	 */
	this.init = function(){
		 $(document).keydown(function(e){
		 	var rs = eventHandle(e);
		 	if(typeof rs != undefined){
		 		return rs;
		 	}
		 }).keyup(function(e){
		 	var rs = eventHandle(e);
		 	if(typeof rs != undefined){
		 		return rs;
		 	}
		 });
	}
	
	/**
	 * @函数说明 分发处理keydown,keyup方法注册的内部事件
	 * @修改历史
	 * 		2013-12-16	刘庆魁	创建了该函数
	 * @param {String} moduleName 模块名称
	 */
	function eventHandle(event){
		if( EventManager.isStop() ){
	 		return;//停止状态不触发事件.
	 	}
	 	
	 	var moduleName = ModuleManager.getCurrentModule().name;
		var keyCode = event.which;
		var eventType = event.type;
		
		var ctrlKey = event.ctrlKey ? 1 : 0;
		var shiftKey = event.shiftKey ? 1 : 0;
		var altKey = event.altKey ? 1 : 0;
		//事件名称的key
		var ctxKey = moduleName + "_"+ keyCode + "_"+ ctrlKey + "_"+ shiftKey + "_"+ altKey;
		
		var co = EventManager.ctx[ctxKey];
		
		if(keyCode == errorKeyCode && eventType != "keyup"){
			if(isValidTarget(event)){ //如果不是录入控件
				$.toast("[快捷键失效]：请切换到英文输入状态。",{type:"danger"});
				event.preventDefault();	
				return false;	
			}
		}
		
		//console.debug(ctxKey);
		if(co && co.on && co.eventType === eventType){
			var result = co.handler.call(ModuleManager.getCurrentModule().object, event);
			if( result===false ){
				event.preventDefault();	
			}
		}
		
		//屏蔽f1
		if( event.which==EventKey.F1 ){
			event.preventDefault();
		}
	}
	
	/**
	 * @函数说明 过滤输入框
	 * @修改历史
	 * 		2015-03-26	李小龙	创建了该函数
	 * @param {Object} e 事件
	 */
	 function isValidTarget(e) {
        if (e.target && e.target.nodeName) {
            var name = e.target.nodeName.toLowerCase();
            return [
                'input'    === name,
                'textarea' === name,
                'select'   === name
            ].indexOf(true) === -1;
        }
        return true;
    }
	
};

export default EventManager