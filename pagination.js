/*
* 造别人的轮子，开自己的车.
* 分页器插件
*/

; //弱语法 避免前面函数没有";”造成错误
(function(root,factory){
    // UMD规范，兼容浏览器、Node环境及AMD规范
   if( typeof define === 'function' && define.amd ){
        define( [], factory );
   } else if( typeof module === 'object' && module.exports ) {
        module.exports = factory();
   } else {
       root.Pagination = factory();
   }
}(typeof self !== 'undefined' ? self : this, function(){
    'use strict';
    
    // 事件操作 使用跨浏览器 EventUtil 对象
    var EventUtil = {
        //添加事件
        addHandler: function(element, type, handler){
            if(element.addEventListener){
                //使用dom2级方法添加事件
                element.addEventListener(type, handler, false);
            }else if(element.attachEvent){
                //使用ie方法添加事件
                element.attachEvent('on'+type, handler);
            }else{
                //使用DOM0级方法添加事件
                element['on'+type] = handler;
            }
        },
        //取消事件
        removeHandler: function(element, type, handler){
            if(element.removeEventListener){
                element.removeEventListener(type,handler,false);
            }else if(element.detachEvent){
                element.detachEvent('on'+type, handler);
            }else {
                element['on'+type] = null;
            }
        },
        //跨浏览器取得 event 对象
        getEvent: function(event){
            return event ? event : window.event;
        },
        //返回事件的实际目标
        getTarget: function(event){
            return event.target || event.srcElement;
        },
        //阻止事件的默认行为
        preventDefault: function(event){
            if(event.preventDefault){
                event.preventDefault();
            }else {
                event.returnValue = false;
            }
        },
        //阻止事件传播,避免触发注册在 document.body 上面的事件
        stopPropagation: function(event){
            if(event.stopPropagation){
                event.stopPropagation();
            }else {
                event.cancelBubble = true;
            }
        },
        //获取 mouseover 和 mouseout 相关元素
        getRelatedTarget: function(event){
            if(event.relatedTarget){
                return event.redatedTarget;
            }else if(event.toElement){
                //兼容IE8-
                return event.toElement;
            }else if (event.formElement){
                event.formElement;
            }else {
                return null;
            }
        },
        //获取mousedown 或 mouseup 按下或释放的按钮是鼠标中的哪一个
        getButton: function(event){
            if(document.implementation.hasFeatrue('MouseEvent', '2.0')){
                return event.button;
            }else {
                //将IE模型下的 button 属性影射为 DOM 模型下的 button 属性
                switch(event.button){
                    case 0:
                    case 1:
                    case 3:
                    case 5:
                    case 7: 
                        return 0; //按下的是鼠标主按钮(一般是左键)
                }
            }
        }
    };

    // 分页
    /*
    * page 当前页码， total 总页数， show 显示列数偏移量
    */

    /* 1.0
    function showPages(page, total, show){
         var str = '';
         if( total < show*2+1 ){
            for (var i=1;i<=total;i++){
                str = str+' '+i;
            }
         } else {
            if (page < show+1 ){
                for( var i=1; i <= show*2+1; i++){
                    str = str+' '+i;
                }
            } else if (page > total-show ){
                for (var i=total-show*2;i<=total;i++){
                    str = str+' '+i;
                }
            } else {
                for (var i=page-show; i<=page+show; i++){
                    str = str+' '+i;
                }
            }
         }
         return str.trim();
    }
    */
    /* 2.0 有缩略号 首尾页 
    function showPages(page, total, show){
        var str = '';
        var preIndex = page-(show+1);
        var aftIndex = page+(show+1);
        if( total < show*2+1 ){
            for (var i=1;i<=total;i++){
                str = str+' '+i;
            }
        } else {
            if (page < show+3 ){
                for( var i=1; i <= show*2+3; i++){
                    if( (i!==preIndex && i!==aftIndex ) || (i===1 || i===total) ){
                        str = str+' '+i
                    }else{
                        str = str+' ... '+total;
                        break;
                    }
                }
            } else if (page > total-(show+2) ){
                for (var i=total; i>=total-(show*2+2);i--){
                    if((i!==preIndex && i!==aftIndex ) || (i===1 || i===total)) {
                        str = i+' '+str;
                    } else {
                        str = '1 ... '+str;
                        break;
                    }
                }
            } else {
                for (var i=preIndex+1; i<=aftIndex-1; i++){
                    str = str+' '+i;
                }
                str = '1 ... '+str+' ... '+total;
            }
        }
        return str.trim();
    }
    */
   /* 3.0 优化版 */
   function showPages(page, total, show) {
        var str = page+'';
        for(var i=1; i<=show;i++){
            if(page-i>1) {
                str = page-i+' '+str;
            }
            if(page+i<total){
                str = str+' '+(page+i);
            }
        }
        if(page-(show+1)>1){
            str = '...'+str;
        }
        if(page>1){
            str = 1+' '+str;
        }
        if(page+show+1<total){
            str = str+'...';
        }
        if(page<total){
            str = str+' '+total;
        }
        return str.trim();
    }

}));