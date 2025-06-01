import {reactive} from "./reactive/reactive.js";
import {effect} from "./reactive/effect.js";

import {render,h,Fragment,Text} from "./runtime";

import {ref} from "./reactive/ref";
import {computed} from "./reactive/computed";
// const arr = (window.arr = reactive([1,2,3]))
// effect(()=>{o
//     console.log("length===>这个是mainjs",arr.length)
// })
// effect(()=>{
//     console.log("index 4 is",arr[4])
// })

const obs = (window.obs = reactive({name:"zhangsan",age:18}))
effect(()=>{
    console.log('------',obs.age)
})

const vnode = h(
    "div",
    {
        class:"a b",
        style:{
            width:"100px",
            height:"100px",
            backgroundColor:"skyblue"
        },
        onClick:()=>{console.log("点击了")},
        id:"foo",
    },
    [
        h(
            "ul",
            null,
            [
                h("li",{style:{backgroundColor:"skyblue"}},2),
                h("li",{style:{backgroundColor:"green"}},1),
                h("li",null,[h(Text,null,"你好")]),

            ]
        )
    ]
)

render(vnode,document.body)

// var  test = (window.test = ref(1))
// effect(()=>{
//     console.log("test====>",test.value)
// })
// const num1 = (window.num1 = ref(1))
// const num2 = (window.num2 = ref(2))
// const computedValue = (window.computedValue = computed(()=>{
//     console.log("-----",num1.value)
//     return num1.value*2
// }))
//
// effect(()=>{
//     console.log("-----number",num1,num2)
//     console.log("computed----",computedValue)
// })
