
//  让track和effect 进行联系
// activeEffect 记录 当前正在执行的effect
 import {isEmpty} from "../utils";

let activeEffect;
const effectStack = [];
 /**
  *     weakMap和Map 的区别
  *     1、key的类型
  *          weakMap key必须为object
  *          Map key可以为任意值
  *     2、内存管理（主要区别）
  *         weakMap  是弱引用,当对象不存在引用时,会被正常gc
  *         Map 是强引用， key对象在其他地方无引用时，map仍会保留改建，阻止gc回收，造成内存泄漏
  *     3、迭代(可遍历性)
  *         weakMap 不能迭代
  *         Map 可以迭代
  *  将effect 存储到targetMap中
  *  targetMap 设计结构
  *const obj1 = reactive({count:1,count2:0,obj:{}})
  * const obj2 = reactive({test:1,test2:0,arr:[]}) *{
  *     "{count:1,count2:0,obj:{}}":{
  *         "count":[effect1,effect2],
  *         "count2":[effect1,effect2],
  *         "obj":[effect1,effect2]
  *     },
  *     "{test:1,test2:0,arr:[]}":{
  *         "test":[effect1,effect2],
  *         "test2":[effect1,effect2],
  *         "arr":[effect1,effect2]
  *     }
  *}
  *  {
  *   [target]: { // key是reactiveObject({count:1,count2:0,obj:{}}), value是一个Map
  *     [key]: [] // key是reactiveObject的键值(count,count2,obj),    value是一个Set=>存储的 effect
  *   }
  * }
  * */

// 存储effect桶
const targetMap = new WeakMap()
// 副作用函数 就是以函数为参数的函数 然后运行
export function effect(fn,options = {}){
    var {lazy,scheduler} = options
    //  包装原始fn
    const effectFn = ()=>{
        // 获取原始fn的返回值
        try {
            // 记录依赖关系
            activeEffect = effectFn;
            effectStack.push(activeEffect)
           return fn();
        }catch (err){
            effectStack.pop()
            activeEffect = effectStack.length-1
        } finally {
            // todo
        }
    }
    if(!isEmpty(lazy,false)){
        effectFn()
    }
    effectFn.scheduler = scheduler;
    console.dir("effect桶",effectStack)
    return effectFn;
}

// track 主要是  收集依赖 或者说是储存
export function track(target,key){
    // todo
    if(!activeEffect) return
    let depsMap = targetMap.get(target);
    if(!depsMap){
        targetMap.set(target,(depsMap = new Map()))
    }
    let deps = depsMap.get(key);
    if(!deps){
        depsMap.set(key,(deps = new Set()))
    }
    deps.add(activeEffect)
    console.log("查看是否已经收集依赖",targetMap)
}

// 触发依赖 ->通知
export function trigger(target,key){
    // todo
    const depsMap = targetMap.get(target);
    if(!depsMap) {
        return
    }
    const deps = depsMap.get(key);
    if(!deps){
        return
    }
    deps.forEach(effectFn => {
        if(effectFn.scheduler){
            effectFn.scheduler(effectFn)
        }else{
            effectFn()
        }
    })
    console.log("查看依赖",targetMap)
}
