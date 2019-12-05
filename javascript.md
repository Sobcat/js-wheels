# JavaScript 
### JS 数据类型
>* 布尔值 boolean
>* null 对象
>* 未定义 undefined
>* 数字 number
>* 字符串 string
>* symbol
>* bigint
>* 引用数据类型: 对象 Object
>   >* 函数对象 Function 
>   >* 普通对象 Object
>   >* 数组对象 Array
>   >* 正则对象 RegExp
>   >* 日期对象 Date
>   >* 数学函数 Math   
>
> [百度一下](https://www.baidu.com "百度")
---
```
function test(person){

}
```
---
### null 不是对象
---
>'1'.toString() 为什么可以调用   
>基本包装类型
>   > ECMAScript 提供了3个特殊的引用类型: Boolean Number String   
>   > 即用即消
---
### biglnt
---
### 闭包
>能够访问另一个函数作用域中的变量的函数
```
function f1(){
    var a = 2;
    function f2(){
        console.log(a);
    }
    return f2;
}
```