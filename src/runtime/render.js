/*
 * @Description: render
 * @Author: smile
 * @Date: 2025-05-29 23:53:18
 * @LastEditors: smile
 * @LastEditTime: 2025-06-01 07:20:28
 */

// vNode 是一个虚拟节点
// container是一个dom节点
import {isBoolean} from "../utils";
import {ShapeFlags} from "./vNode";
import {patchProps} from "./patchProps";
const domPropsRE = /[A-Z]|^(value|checked|selected|muted|disabled)$/;

/**
 * render函数的作用就是 将虚拟dom处理成真正的dom并且挂载
 *  @params vNode  虚拟dom。描述dom的对象
 *  @params container 实际dom（节点）
 * */
export function render(vNode, container) {
    const prevNode = container._vnode
    if(!vNode){
        if(prevNode){
            unmount(prevNode)
        }
    }else{
        patch(prevNode,vNode,container)
    }
    container._vnode = vNode
}
function unmount(vnode){
    const {shapeFlag,el}= vnode
    if(shapeFlag & ShapeFlags.COMPONENT){
        unmountComponent(vnode)
    }else if(shapeFlag & shapeFlag.FRAGMENT){
        unmountFragment(vnode)
    }else{
        el.parentNode.removeChild(vnode)
    }
    
}


// 卸载组件
function unmountComponent(){}
// 卸载fragment
function unmountFragment(vnode){
    let {el:cur,anchor:end} = vnode
    const parentNode = cur.parentNode
    while (cur !== end){
        let next = cur.nextSibling;
        parentNode.removeChild(cur);
        cur = next
    }
    parentNode.removeChild(end)
}

function processComponent(n1,n2,container){}
// 
function patch(n1,n2,container,anchor){
    // 如果当前节点1 和 节点2 type类型不一致 直接卸载 n1 重新生成n2
    if(n1 && !isSameVNode(n1,n2)){
        anchor = (n1.anchor|| n1.el).nextSibling
        unmount(n1);
        n1=null
    }
    const {shapeFlag} = n2
    // 是否为组件
    if(shapeFlag & ShapeFlags.COMPONENT){
        processComponent(n1,n2,container,anchor)
    }else if(shapeFlag & ShapeFlags.TEXT){
        processText(n1,n2,container,anchor)
    }else if(shapeFlag & ShapeFlags.FRAGMENT){
        processFragment(n1,n2,container,anchor)
    }else{
        processElement(n1,n2,container,anchor)
    }
}

function mountTextNode(vNode,container,anchor){
    const textNode = document.createTextNode(vNode.children)
    // container.appendChild(textNode)
    container.insertBefore(anchor)
    vNode.el = textNode
}
function  processText(n1,n2,container,anchor){
    // todo
    if(n1){// n1 存在就是更新
        n2.el = n1.el
        n1.el.textContent = n2.children
    }else{
         mountTextNode(n2,container,anchor)
    }
}
function processFragment(n1,n2,container,anchor){
    // todo 
    const fragmentStartAnchor =  (n2.el = n1?n1.el: document.createTextNode(""));
    const fragmentEndAnchor = (n2.el = n1?n1.anchor: document.createTextNode(""));
    if(n1){
        patchChildren(n1,n2,container)
    }else{
        // container.appendChild(fragmentStartAnchor)
        // container.appendChild(fragmentEndAnchor)
        container.insertBefore(fragmentStartAnchor,anchor)
        container.insertBefore(fragmentEndAnchor,anchor)
        mountChildren(n2.children,container,anchor)
    }
}
function processElement(n1,n2,container){
    // todo
    if(n1){
        patchElement(n1,n2,container)
    }else{
        mountElement(n2,container)
    }
}
function isSameVNode(n1,n2){
    return n1.type === n2.type
}
// 渲染vnode
function mountElement(vNode,container){
    const {type,props,shapeFlag,children} = vNode // type : div h1 p
    const el = document.createElement(type) // <div></div>
    // 处理属性 style class 事件...
    // mountProps(props,el)
    patchProps(null,props,el)
    if(shapeFlag & shapeFlag.TEXT_CHILDREN){ // 如果是文字 
        mountTextNode(vNode,el)
    }else if(shapeFlag & shapeFlag.ARRAY_CHILDREN){// 如果是数组
        mountChildren(children,el)
    }
    container.appendChild(el)
    vNode.el = el
}


function patchElement(n1,n2,container){
    // todo
    n2.el = n1.el 
    patchProps(n1.props,n2.props,n2.el)
    patchChildren(n1,n2,n2.el)
}


function unmountChildren(children){
    children.forEach(el =>{
        unmount(el)
    })
}

function patchArrayChildren(c1,c2,container){
    const oldLen = c1.length 
    const newLen = c2.length
    const commonLen = Math.min(oldLen,newLen)
    for (var idx = 0;idx<commonLen;idx++){
        patch(c1[idx],c2[idx],container)
    }
    if(oldLen > newLen){
        unmountChildren(c1.slice(commonLen))
    }else if(oldLen < newLen){
        mountChildren(c2.slice(commonLen))
    }
}
function patchChildren(n1,n2,container){
    const {shapeFlag:oldShapeFlag,children:c1} = n1
    const {shapeFlag,children:c2} = n2
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN){ // 当前节点是text 处理
        // 如果老节点是ARRAY_CHILDREN  先卸载老的children
        if(oldShapeFlag & ShapeFlags.ARRAY_CHILDREN){
            unmountChildren(c1)
        }
        // 老节点内容不等于新节点内容才会去更新
        if(c1 !== c2){
            container.textContent = n2.textContent
        }
    }else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){// 如果新子节点是数组
        if(oldShapeFlag & ShapeFlags.TEXT_CHILDREN){
            container.textContent = ""
            mountChildren(c2,container)
            // 老节点是ARRAY_CHILDREN, 
        }else if(oldShapeFlag & ShapeFlags.ARRAY_CHILDREN){ 
            patchArrayChildren()
            // 老节点不存在
        }else{
            mountChildren(c2,container)
        }
    }else{//新节点为null
        // 老节点为TEXT
        if(oldShapeFlag & ShapeFlags.TEXT_CHILDREN){
            container.textContent = ""
            // 老节点为array
        }else if (oldShapeFlag & ShapeFlags.ARRAY_CHILDREN){
            unmountChildren(c1)
        }
        // 如果老节点为null不做处理
    }
}
function mountChildren(children,container,anchor){
    children.forEach(child => {
        patch(null,child,container,anchor)
    })
}

