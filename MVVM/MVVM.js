//观察者(发布订阅)  观察者 被观察者
class Dep{ //存放观察者
    constructor(){
        this.subs = []; //存放所有的watcher
    }
    //订阅
    addSub(watcher){ //添加watch
        this.subs.push(watcher);
    }
    //发布
    notify(){
        this.subs.forEach(watcher=> watcher.update()) //更新
    }
}
class Watcher{
    constructor(vm,expr,cb){
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;

        //默认先存个老值
        this.oldVal = this.get();
    }
    get(){
        Dep.target = this;
        let value = CompileUtil.getVal(this.vm,this.expr);
        Dep.target=null;
        // console.log('value-1111111111:', value)
        return value;
    }
    update(){
        //更新操作 数据变化后 会调用观察者的update方法
        let newVal = CompileUtil.getVal(this.vm,this.expr);
        if(newVal !== this.oldVal){
            this.cb(newVal);
        }
    }
}
//vm.$watch(vm,'school.name',(newVal)=>{ })


class Compiler{
    constructor(el,vm){
        //判断el属性 是不是一个元素，如果不是元素，那就获取他
        this.el = this.isElementNode(el)?el:document.querySelector(el);
        this.vm = vm;

        //把当前节点中的元素 获取到放入内存中
        let fragment= this.node2fragment(this.el);

        //把节点中的内容进行替换
        
        //数据编译
        this.compile(fragment);

        //把内容再塞到页面中

        this.el.appendChild(fragment)
    }
    isDirective(attrName){//判断是否是指令
        return attrName.startsWith('v-');
    }
    //编译元素
    compleElement(node){ //v-model v-bind
        let attributes = node.attributes; //类数组
        // console.log('elementAttr',attributes);
        
        [...attributes].forEach(attr=>{
            let {name,value:expr} = attr;  //v-model="scool.name" v-html v-on:click="change"  v-bind
            // console.log('attr:',attr,name,expr) 
            if(this.isDirective(name)){ //找到指令
                let [,directive] = name.split('-');
                // console.log(directive,expr, 'element指令')
                let [directiveName,eventName] = directive.split(':'); //on:click
                //需要调用不同的指令来处理
                CompileUtil[directiveName](node,expr,this.vm,eventName); //expr-->scool.name change
            }
        })
    }
    //编译文本
    compleText(node){//判断当前文本节点中内容是否包含{{xxx}}
        let content = node.textContent;
        // console.log('内容:', content)
        if(/\{\{(.+?)\}\}/.test(content)){
            console.log(content,'text文本')
            CompileUtil['text'](node,content,this.vm) //{{a}}
        }
    }
    compile(node){//用来编译内存中的dom节点
        let childNodes = node.childNodes; //[text, input, text, div, text, ul, text]
        // console.log(childNode)
        [...childNodes].forEach(child=>{
            if(this.isElementNode(child)){
                // console.log('element',child)
                this.compleElement(child);
                //如果是元素的话，需要把自己传进去，再去遍历子节点
                this.compile(child);
            }else{
                // console.log('text',child)
                this.compleText(child)
            }
        })
    }
    node2fragment(node){//把节点移动到内存中
        let fragment = document.createDocumentFragment(); //创建一个新的空白的文档片段
        let firstChild;
        while(firstChild=node.firstChild){
            // console.log(firstChild)
            //appendChild 具有移动性
            fragment.appendChild(firstChild);
        }
        console.log('fragment-把节点移动到内存中:',fragment)
        return fragment;
    }
    isElementNode(node){//是不是元素节点
        return node.nodeType ===1;
    }
}

//实现数据劫持功能
class Observe{
    constructor(data){
        this.observer(data)
    }
    observer(data){
        //非对象
        if(typeof data !== 'object' || data == null) return data;

        //数组

        if(data && typeof data == 'object'){
            //如果是对象
            for(let key in data){
                this.difinReactive(data,key,data[key])
            }
        }
    }
    difinReactive(obj,key,value){
        this.observer(value);
        let dep = new Dep(); //给每一个属性添加一个具有发布订阅的功能
        Object.defineProperty(obj,key,{
            get(){
                //创建watcher时，会取到对应的内容，并且把watcher放到了全局上
                Dep.target && dep.addSub(Dep.target)
                return value;
            },
            set: (newVal)=>{
                if(newVal != value){
                    this.observer(newVal);
                    value = newVal;
                    dep.notify()
                }
            }
        })
    }
}

class Vue{
    constructor(options){
        this.$el = options.el;
        this.$data = options.data;
        let methods = options.methods;
        let computed = options.computed;

        //根元素存在，编译模板
        if(this.$el){
            //把数据转化为Object.defineProperty 来定义
            new Observe(this.$data);

            //计算属性方法{{getNewValue}}  有依赖关系，如果值改变就会执行
            for(let key in computed){
                Object.defineProperty(this.$data,key,{
                    get(){
                        return computed[key].call(this);
                    }
                })
            }
            //methods方法 代理
            for(let key in methods){
                Object.defineProperty(this,key,{
                    get(){
                        return methods[key]; //方法
                    }
                })
            }


            //把数据获取操作 vm上的取值操作 都代理到 vm.$data
            this.proxyVm(this.$data);

            new Compiler(this.$el,this);
        }
    }
    proxyVm(data){
        for(let key in data){
            Object.defineProperty(this,key,{
                get(){
                    return data[key]
                },
                set(newVal){// 设置代理方法
                    data[key] = newVal;
                }
            })
        }
    }
}

CompileUtil = {
    getVal(vm,expr){ //'school.name'
        return expr.split('.').reduce((data,current)=>{
            return data[current];
        },vm.$data);
        
    },
    setVal(vm,expr,value){ //vm.$data 'school.name' 
        return expr.split('.').reduce((data,current,index,arr)=>{
            if(index == arr.length-1){
                return data[current] = value;
            }
            return data[current];
        },vm.$data)
    },
    //解析v-model这个指令
    model(node,expr,vm){ //expr是表达式{{school.name}}
        console.log('model:', node,expr,vm)
        //给输入框赋予value属性  node.value = xxx
        let fn= this.updater['modelUpdater'];
        //数据变化时--添加watch
        new Watcher(vm,expr,(newVal)=>{ //给输入框加一个观察者，如果稍后数据更新了会触发此方法，会拿新值给输入框赋值
            fn(node,newVal);
        });
        node.addEventListener('input',(e)=>{
            let value = e.target.value; //获取用户输入的内容
            // console.log(value)
            this.setVal(vm,expr,value);
        })
        let value = this.getVal(vm,expr);
        fn(node,value);
    },
    html(node,expr,vm,eventName){ //v-html="message"  expr-->message
        //node.innerHTML = xxx
        let fn = this.updater['htmlUpdater'];
        new Watcher(vm,expr,(newVal)=>{
            fn(node,newVal)
        })
        let value = this.getVal(vm,expr);
        fn(node,value);
    },
    getContentValue(vm,expr){
        return expr.replace(/{{(.+?)}}/g,(...args)=>{
            return this.getVal(vm,args[1]);
        })
    },
    text(node,expr,vm){ //{{a}} {{b}}
        let fn = this.updater['textUpdater'];
        let content = expr.replace(/{{(.+?)}}/g,(...args)=>{
            new Watcher(vm,args[1],()=>{  //args[1] 为 a,b
                //回调时要将 新的a b 返回全的字符串 {{a}} {{b}}
                fn(node,this.getContentValue(vm,expr));
            })
            return this.getVal(vm,args[1]);
        });
        fn(node,content);
    },
    on(node,expr,vm,eventName){// expr-->change(方法名称)  eventName-->click
        //绑定事件
        node.addEventListener(eventName,(e)=>{
            vm[expr].call(vm,e); //添加代理后再使用 vm.change
        })
    },
    updater:{
        modelUpdater(node,value){
            // console.log(node,value)
            node.value = value;
        },
        htmlUpdater(node,value){
            node.innerHTML = value;
        },
        textUpdater(node,value){//处理文本节点
            node.textContent = value;
        }
    }
}