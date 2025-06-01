import {hasChanged, isObject} from "../utils";
import {reactive} from "./reactive";
import {track, trigger} from "./effect";

export function ref(value){
    if(isRef(value)) {
        return value
    }
    return new RefImp(value);
}

export function isRef(value){
    return !!(value && value.__isRef);
}
class RefImp{
    constructor(value) {
        this.__isRef = true
        this._value = convert(value)
    }
    get value(){
        // 收集依赖
        track(this,"value")
        return this._value
    }
    set value(newValue){
        // 判断是否改变
        if(hasChanged(newValue,this._value)){
            this._value = convert(newValue)
            // trigger 放在赋值动作后面
            // 触发依赖
            trigger(this,"value")
        }
    }
}
function convert(value){
    return isObject(value) ? reactive(value) : value
}
