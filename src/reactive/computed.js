import {effect, track, trigger} from "./effect";
import {isFunc} from "../utils";

export function computed(getterOptions){
    let getter,setter;
    if(isFunc(getterOptions)){
        getter = getterOptions
        setter = ()=>{
            console.warn("setter is readonly")
        }
    }else{
        getter = getterOptions.get
        setter = getterOptions.set
    }
    return new computedImpl(getter,setter)
}
class computedImpl{
    constructor(getter,setter) {
        this._setter = setter
        // 缓存值
        this._value = undefined
        // 缓存依赖
        this._dirty = true
        /**
         * 用effect 第一次 会执行
         * 而computed 不需要执行，而是需要依赖值发生变化后才进行重新计算，
         * 所以需要传入一个lazy， lazy为true时不直接调用
         * getter发生变化值不会直接发生变化，而是会讲dirty置为true 执行调度程序
         * */
        this.effect = effect(
            getter,
            {
                lazy:true,
                scheduler:()=>{
                    if(!this._dirty){
                        // dirty 置为true，并触发依赖
                        this._dirty = true
                        trigger(this,'value')
                    }

                }
            }
        )
    }
    get value(){
        // 如果缓存依赖 dirty 则重新计算
        if(this._dirty){
            this._value =this.effect() ;
            this._dirty = false;
            track(this,"value")
        }
        return this._value
    }
    set value(newVal){
        this._setter(newVal)
    }
}
