/*
 * @Description: vNode
 * @Author: smile
 * @Date: 2025-05-29 23:41:31
 * @LastEditors: smile
 * @LastEditTime: 2025-05-31 22:58:04
 */
import {isNumber, isString} from "../utils";

export const ShapeFlags = {
    ELEMENT: 1, // 00000001 
    TEXT: 1 << 1, // 00000010
    FRAGMENT: 1 << 2, // 00000100
    COMPONENT: 1 << 3, // 00001000
    TEXT_CHILDREN: 1 << 4, // 00010000
    ARRAY_CHILDREN: 1 << 5, // 00100000
    CHILDREN: (1 << 4) | (1 << 5), //00110000
};
// 定义 文本类型
export const Text = Symbol('Text');
export const Fragment = Symbol('Fragment');
/**
 * @Description: h()主要就是为了判断节点类型
 * @param { String | Text | Fragment | Object } type  节点类型
 * @param { Object | null} props  节点属性
 * @param { String | array | null} children 节点子
 * @return { VNode }
 * */ 
export function h(type, props, children){
    let shapeFlag = 0;
    
    // 判断类型 (使用策略模式进行代码优化)
    shapeFlag = getShapeFlag(type)
    // if(isString(type)){
    //     shapeFlag = ShapeFlags.ELEMENT;
    // }else if(type === Text){
    //     shapeFlag = ShapeFlags.TEXT;
    // }else if(type === Fragment){
    //     shapeFlag = ShapeFlags.FRAGMENT;
    // }else{
    //     shapeFlag = ShapeFlags.COMPONENT;
    // }
    // 判断子节点 
    if(isString(children) || isNumber(children)){
        shapeFlag |= ShapeFlags.TEXT_CHILDREN;
        children = children.toString();
    }else if(Array.isArray(children)){
        shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    }
    return {
        type,
        props,
        children,
        shapeFlag,
        el:null,
        anchor:null
    }
}
// 策略模式的 实现
const typeStrategy = [
    {
        matcher:(type)=> isString(type),
        flag:ShapeFlags.ELEMENT
    },
    {
        matcher:(type)=> type === Text,
        flag: ShapeFlags.TEXT
    },
    {
        matcher:(type)=> type === Fragment,
        flag:ShapeFlags.ELEMENT
    },
]

// getShapeFlag是 获取shapeFlag的
// 策略模式中 的匹配
function getShapeFlag(type){
    var matched = typeStrategy.find((item)=>item.matcher(type)) 
    return  matched && matched.length >0 ?  matched.flag : ShapeFlags.ARRAY_CHILDREN
}

