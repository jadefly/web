//克隆一份数组的方法，并重写方法
let arrayProto = Array.prototype; //数组原型上的方法
let proto = Object.create(arrayProto); //克隆一份
['push','unshift','splice'].forEach(method=>{
    proto[method] = function(...args){ //重写方法--这个数组应该也被监控        
        let inserted; //默认没有插入的数据
        switch(method){
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice':
                inserted =args.slice(2); //数组的splic 的第三个参数为插入项
                break;
            default:
                break;
        }
        observerArray(inserted);

        console.log('数组试图更新',...args,inserted);
        //Array.prototype.push.call([1,2,3],4,5,6);
        arrayProto[method].call(this, inserted); //原型方法
    }
})

function observerArray(obj){
    for(let i=0; i<obj.length; i++){
        let item = obj[i];
        observer(item); //如果是对象，会被defineReactive
    }
}

function observer(obj){
    //非对象
    if(typeof obj !== 'object' || obj == null) return obj;

    //数组
    if(Array.isArray(obj)){
        //处理数组的格式如果是push，unshift,splice,应该把这个值判断一下是否是对象
        // obj.__proto__ = proto;
        Object.setPrototypeOf(obj,proto); //实现一个对数组的方法进行重写
        observerArray(obj); //循环数组 添加observer
    }

    //对象
    for(let key in obj){
        defineReactive(obj,key,obj[key]);
    }

}

function defineReactive(obj,key,value){
    observer(value); //递归创建，响应式数据，性能不好（层级多的时候）
    Object.defineProperty(obj,key,{
        get(){
            return value;
        },
        set(newVal){//给某个key设置值的时候，可能也是一个对象
            if(newVal !== value){
                observer(newVal);
                value = newVal;
                console.log('试图更新')
            }
        }
    })
}

let data = {
    name:{a:'jade'},
    arr:[{name:'jd'},2,4]
}
observer(data);
// data.name.a = '123'
// data.name.a = {age:10}
// data.arr[0].name  = 'zf'
// data.arr.push({name:'zz'});
data.arr.splice(0,0,100);
// data.arr[3].name = '111'
console.log(data.arr)
//更新数组中的某一项是个对象 也能被监控
console.log(data.arr[0])

/*
1. 增加不存在的属性，不能更新试图  可用 vm.$set()实现
2. 递归所有数据，增加getter和setter
*/