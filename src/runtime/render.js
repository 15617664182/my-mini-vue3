/*
 * @Description: render
 * @Author: smile
 * @Date: 2025-05-29 23:53:18
 * @LastEditors: smile
 * @LastEditTime: 2025-06-02 02:33:26
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
function processElement(n1,n2,container,anchor){
    // todo
    if(n1){
        patchElement(n1,n2,container,anchor)
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


function patchElement(n1,n2,container,anchor){
    // todo
    n2.el = n1.el 
    patchProps(n1.props,n2.props,n2.el)
    patchChildren(n1,n2,n2.el,anchor)
}


function unmountChildren(children){
    children.forEach(el =>{
        unmount(el)
    })
}

function patchKeyArrayChildren(c1,c2,container,anchor){
    let i = 0 ,//当前元素
        e1= c1.length - 1, // old元素的长度
        e2 = c2.length - 1;// new元素的长度
    //1. 从左往右依次对比
    while (i <= e1 && i <= e2 && c1[i].key === c2[i].key){
        patch(c1[i],c2[i],container,anchor)
        i++
    }
    //2. 从右至左比对
    while (e1 <= i && e2 <= i && c1[e1]['key'] === c2[e2]['key']){
        patch(c1[e1],c2[e2],container.anchor)
        e1--
        e2--
    }
    // a b c 
    // a d b c
    // i =1 
    // e1 = 0
    // e2 = 1
    // 3.1  i > e1 代表着旧节点全部对比完成, 剩下的新节点全部mount(patch)
    if(i > e1){
        for (let j = i;j <= e2;j++){
            const nextPos =  e2 + 1 
            const curAnchor = (c2[nextPos]&& c2[nextPos].el)||anchor
            patch(null,c2[j],container,anchor)
        }
    // 3.2 i > e2 新节点已经部mount 只需将旧节点 unmount
    }else if( i > e2){ 
        for (let k = i;k <= e1;k++){
            unmount(e1[k])
        }
    }else{ 
    //3.2 中间一部分是乱序的情况 需要for循环进行标记和删除操作 
        const map = new Map();
        // 将老元素存入map
        c1.forEach((prev,j)=>{
            map.set(prev.key,{prev,j})
        })
        const source = new Array(e2-i).fill(-1)
        const toMounted = []
        let maxNewIdxSoFar = 0
        let move = false
        for (let l = 0;l<c2.length;l++){
            const next  = c2[l]
            let isFind = false// 标识是否从c1中找到了元素，
            // 判断老元素策略中是否存在新元素，如果存在  则进行patch 
            if(map.has(next.key)){
                const { prev,j}=map.get(next.key)
                isFind = true
                patch(prev,next,container,anchor)
                if(j<maxNewIdxSoFar){
                    move = true
                    const curAnchor =c2[l - 1].el.nextSibling
                    container.insertBefore(next.el,curAnchor)
                }else{
                    maxNewIdxSoFar = j
                }
                source[l] = j
                // patch操作及真正插入后,将该元素从策略桶中删除
                map.delete(next.key)
            }else{
                // todo
                toMounted.push(l+i)
            }
            if(!isFind){
                const curAnchor = l === 0 ? c1[0].el:c2[l-1].el
                patch(null,next,container,curAnchor)
            }
        }
        // 所有对比完成，删除
        map.forEach(old =>{
            unmount(old)
        })
        if(move){
            // todo 需要移动,最长递增子序列算法
            const seq = getSequence(source)
            let max = seq.length - 1
            for (let k = source.length - 1;k>=0;k--){
                if(seq[max]===k){// 在子序列不需要移动
                    max--;
                }else {
                    let pos = k+i // sql的位置加上原始i的位置
                    const nextPos = pos + i
                    const curAnchor = (c2[nextPos] && c2[nextPos].el) || anchor
                    source[k] === -1 ?   patch(null,c2[pos],curAnchor): container.insertBefore(c2[pos].el,curAnchor)
                }
                // if(source[k] === -1){
                //     // mount
                //     let pos = k+i // sql的位置加上原始i的位置
                //     const nextPos = pos + i
                //     const curAnchor = (c2[nextPos] && c2[nextPos].el) || anchor
                //     patch(null,c2[pos],curAnchor)
                // }else if(seq[max]===k){// 在子序列不需要移动
                //    max--;
                // }else{
                //     let pos = k+i // sql的位置加上原始i的位置
                //     const nextPos = pos + i
                //     const curAnchor = (c2[nextPos] && c2[nextPos].el) || anchor
                //     container.insertBefore(c2[pos].el,curAnchor)
                // }
            }
        }else if(toMounted.length&&toMounted.length>0){
            for (let k = 0;k<toMounted.length;k++){
                let pos = toMounted[k] // sql的位置加上原始i的位置
                const nextPos = pos + i
                const curAnchor = (c2[nextPos] && c2[nextPos].el) || anchor
                patch(null,c2[pos],container,curAnchor)
            }
        }
    }
    
}

function getSequence(arr){}
// react diff 算法
function patchKeyArrayChildrenReact(c1,c2,container,anchor){
    const map = new Map();
    // 将老元素存入map
    c1.forEach((prev,j)=>{
        map.set(prev.key,{prev,j})
    })
    let maxNewIdxSoFar = 0
    for (let i = 0;i<c2.length;i++){
        const next  = c2[i]
        let isFind = false// 标识是否从c1中找到了元素，
        // 判断老元素策略中是否存在新元素，如果存在  则进行patch 
        if(map.has(next.key)){
            const { prev,j}=map.get(next.key)
            isFind = true
            patch(prev,next,container,anchor)
            if(j<maxNewIdxSoFar){
                const curAnchor =c2[i - 1].el.nextSibling
                container.insertBefore(next.el,curAnchor)
            }else{
                maxNewIdxSoFar = j
            }
            // patch操作及真正插入后,将该元素从策略桶中删除
            map.delete(next.key)
        }
        if(!isFind){
            const curAnchor = i === 0 ? c1[0].el:c2[i-1].el
            patch(null,next,container,curAnchor)
        }
    }
    // 所有对比完成，删除
    map.forEach(old =>{
        unmount(old)
    })
    // for (let i = 0 ;i <c1.length;i++){
    //     const prev = c1[i]
    //     if(!c2.find(next => next.key === prev.key)){
    //         unmount(prev)
    //     }
    // }
}

function patchUnkeyArrayChildren(c1,c2,container,anchor){
    const oldLen = c1.length 
    const newLen = c2.length
    const commonLen = Math.min(oldLen,newLen)
    for (var idx = 0;idx<commonLen;idx++){
        patch(c1[idx],c2[idx],container)
    }
    if(oldLen > newLen){
        unmountChildren(c1.slice(commonLen))
    }else if(oldLen < newLen){
        mountChildren(c2.slice(commonLen),anchor)
    }
}
function patchChildren(n1,n2,container,anchor){
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
            mountChildren(c2,container,anchor)
            // 老节点是ARRAY_CHILDREN, 
        }else if(oldShapeFlag & ShapeFlags.ARRAY_CHILDREN){ 
            // 只要第一个有key 就都当有有key
            if(c1[0] && c1[0]['key'] && c2[0] && c2[0]['key']){
                patchKeyArrayChildren(c1, c2, container, anchor)
            }else{
                patchUnkeyArrayChildren(c1, c2, container, anchor)
            }
            // 老节点不存在
        }else{
            mountChildren(c2,container,anchor)
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

