/*
 * @Description: 
 * @Author: smile
 * @Date: 2025-05-31 16:18:33
 * @LastEditors: smile
 * @LastEditTime: 2025-05-31 16:21:55
 */
import {isBoolean} from "../utils";

export function  patchProps(oldProp, newProps, container){
    if(oldProp === newProps){
        return
    }
    newProps = newProps || {}
    oldProp = oldProp || {}
    // 遍历新的props属性 patch进去
    for (const key in newProps){
        const next = newProps[key]
        const prev = oldProp[key]
        patchDomProp(prev,next,key,container)
    }
    // 遍历老的props 从新props属性中剔除掉已经删除了的老的属性
    for (const key in oldProp){
        if(newProps[key] == null){
            patchDomProp(oldProp[key],newProps[key],key,container)
        }
    }
}
function patchDomProp(prev,next,key,el){
    switch (key) {
        case "class":// ===处理class 字段
            el.className = next || ""
            break;
        case "style"://===处理style 字段
            for(const styleKey in next){
                el.style[styleKey] = next[styleKey]
            }
            // 处理老节点得style
            if(prev){
                for (let key in prev){
                    if(next[key] == null){
                        el.style[key] = ''
                    }
                }
            }
            break;
        default:
            if(/^on[^a-z]/.test(key)){ // ===处理事件// onClick onxxx
                const eventName = key.slice(2).toLowerCase()
                if(prev){
                    prev.removeEventListener(eventName,prev)
                }
                if(next){
                    el.addEventListener(eventName,next)
                }
            }else if(domPropsRE.test(key)){ // 处理 
                // 处理 {checked :""}
                if(next === '' && typeof isBoolean(el[key])){
                    next = true
                }
                el[key] =next
            }else{ //其他的属性 id=xx  style=xxx
                key == null || next === false ? el.removeAttribute(key):el.setAttribute(key,next)
            }
            break;
    }
}


// mountProps(props,el)
