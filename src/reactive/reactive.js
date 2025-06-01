import {hasChanged, isArray, isObject} from "../utils/index.js";
import {track,trigger} from "./effect.js";

const proxyMap = new WeakMap();
export function reactive(target){
    // 判断如果不是对象||已经代理过直接返回，不代理
    // 处理isReactive-  reactive(reactive({}))
    if(!isObject(target) || isReactive(target)){
        return target;
    }
    // var a = {a:2,g}  var ra = reactive(a) var rb = reactive(a)
    if(proxyMap.has(target)){
        return proxyMap.get(target);
    }
    /* Reflect 反射
      //反射 是一种用于操作对象
       var object = {a:1,b:2}
      // 1. 获取属性值 get // 返回值
              Reflect.get(object,'a') // 1
      // 2. 设置属性值 set  返回值 true/false
          Reflect.set(object,'a',3)// true
          console.log(object)// {a:3,b:2}
      // 3. 删除属性 delete
          Reflect.deleteProperty(object,'a')
       ...
      */
    // 开始代理
    var proxy = new Proxy(target,{
        // 收集依赖
        get(target,key,receiver){
            if(key === '__v_isReactive'){
                return true
            }
            track(target,key);
            const result = Reflect.get(target,key,receiver);
            return isObject(result) ? reactive(result) : result;
        },
        // 触发依赖 trigger
        set(target,key,value,receiver){
            // 数组记录oldLen
            let oldLen = target.length;
            // 记录oldVal
            const oldVal = target[key];
            const result = Reflect.set(target,key,value,receiver);
            // 如果发生了改变才会去trigger
            if(hasChanged(oldVal,value)){
                trigger(target,key)
                // 如果原始长度和新长度不一样，说明是数组新增了元素，那么也要触发数组的length的依赖收集
                if(hasChanged(oldLen,target.length)){
                    trigger(target,"length")
                }
            }
            return result;
        }
    })
    proxyMap.set(target,proxy)
    return proxy
}

export function isReactive(target){
    return !!(target && target.__v_isReactive);
}
