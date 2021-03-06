/*
* 造别人的轮子，开自己的车.
* 分页器插件 开始了
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
    
    //元素类名
    var CLASS_NAME = {
        ITEM: 'pagination-item',
        LINK: 'paginstion-link'
    };

    // 事件操作 使用跨浏览器 EventUtil 对象,兼容各类浏览器
    // https://www.cnblogs.com/hykun/p/EventUtil.html
    var EventUtil = {
        //添加事件
        addHandler: function(element, type, handler){
            if(element.addEventListener){
                //使用dom2级方法添加事件
                element.addEventListener(type, handler, false);20 
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
                    case 2:
                    case 6:
                        return 2; //按下的事中间的鼠标按钮
                    case 4:
                        return 1; //鼠标次按钮(一般是右键)
                };
            }
        },
        //获取表示鼠标滚轮方向的数值
        getWheelDelta: function(event){
            if(event.wheelDelta){
                return event.wheelDelta;
            }else {
                return -event.detail*40;
            }
        },
        //以跨浏览器取得相同的字符编码,需在 keypress 事件中使用
        getCharCode: function(event){
            if(typeof event.charCode=="number"){
                return event.charCode;
            }else {
                return event.keyCode;
            }
        }
    };

    //浅拷贝对象属性,用户自定义属性覆盖默认属性
    //赋值 栈 堆, 基本数据类型 值传递, 引用数据类型 地址传递, 浅拷贝 深拷贝 
    function extend(o, n, override){
        for(var p in n){
            if(n.hasOwnProperty(p) && (!o.hasOwnProperty(p) || override)){
                o[p] = n[p];
            }
        }
    }
    //模仿 jQquery $()
    //
    function $(selector, context){
        context = arguments.length>1 ? context : document;
        return context ? context.querySelectorAll(selector) : null;
    }
    //插件对象配置
    var Pagination = function(selector, pageOption){
        //默认参数
        this.options = {
            curr: 1, //当前页
            pageShow: 2, //左右页数偏移量
            ellipsis: true, //是否显示缩略点
            hash: false //url # 锚点
        };
        //用户定义参数覆盖默认参数
        extend(this.options, pageOption, true);
        //分页器元素
        this.pageElement = $(selector)[0];
        //数据总数
        this.dataCount = this.options.count;
        //当前页码
        this.pageNumber = this.options.curr;
        //总页数
        this.pageCount = Math.ceil(this.options.count/this.options.limit);
        //渲染
        this.renderPages();
        //执行回调函数
        this.options.callback && this.options.callback({
            curr: this.pageNumber,
            limit: this.options.limit,
            isFirst: true
        });
        //改变页数并触发事件
        this.changePage();
    };
    //添加到 Pagination 原型上 省资源 继承同一套
    // _proto_ 原型链 constructor 表示构成此对象的构造函数 prototype 函数特有 表示函数的原型对象包含 constructor 和继承过来 _proto_
    Pagination.prototype = {
        //创建对象的构造函数
        constructor: Pagination,
        pageInfos: [
            {
                id: 'first',
                content: '首页'
            },
            {
                id: 'prev',
                content: '前一页'
            },
            {
                id: 'next',
                content: '后一页'
            },
            {
                id: 'last',
                content: '尾页'
            },
            {
                id: '',
                content: '...'
            }
        ],
        getPageInfos: function(className, content){
            return {
                id: "page",
                className: className,
                content: content
            };
        },
        changePage: function(){
            var self = this;
            var pageElement = self.pageElement;
            EventUtil.addEvent(pageElement, 'click', function(ev){
                var e = ev || window.event;
                var target = e.target || e.srcElement;
                if(target.nodeName.toLocaleLowerCase() == 'a'){
                    if(target.id === 'prev'){
                        self.prevPage();
                    }else if(target.id === 'next'){
                        self.nextPage();
                    }else if(target.id === 'first'){
                        self.firstPage();
                    }else if(target.id === 'last'){
                        self.lastPage();
                    }else if(target.id === 'page'){
                        self.goPage(parseInt(target.innerHTML));
                    }else {
                        return;
                    }
                    self.renderPages();
                    self.options.callback && self.options.callback({
                        curr: self.pageNumber,
                        limit: self.options.limit,
                        isFirst: false
                    });
                    self.pageHash();
                }
            });
        },
        //跳转到 # 锚点 让 ajax 刷新数据之后浏览器有历史记录
        pageHash: function(){
            if(this.options.hash){
                window.location.hash = '#!'+this.options.hash+'='+this.pageNumber;
            }
        },
        //渲染
        renderPages: function(){
            this.pageElement.innerHTML = '';
            if(this.options.ellipsis){
                this.pageElement.appendChild(this.renderEllipsis());
            }else {
                this.pageElement.appendChild(this.renderNoEllipsis());
            }
        },
        //渲染无省略点
        renderNoEllipsis: function(){
            var fragment = document.createDocumentFragment(); //先创建个虚拟节点, 这个方法能更安全地改变文档的结构及节点
            if(this.pageNumber < this.options.pageShow+1){
                //从第一页开始
                fragment.appendChild(this.renderDom(1,this.options.pageShow*2+1));
            }else if( this.pageNumber > this.pageCount-this.options.pageShow ){
                //到最后一页
                fragment.appendChild(this.renderDom(this.pageCount-this.options.pageShow*2,this.pageCount));
            }else {
                //中间的页数
                fragment.appendChild(this.renderDom(this.pageNumber-this.options.pageShow,this.pageNumber+this.options.pageShow));
            }
            if(this.pageNumber>1){
                this.addFragmentBefore(fragment,[
                    this.pageInfos[0],
                    this.pageInfos[1]
                ]);
            }
            if(this.pageNumber<this.pageCount){
                this.addFragmentAfter(fragment,[
                    this.pageInfos[2],
                    this.pageInfos[3]
                ]);
            }
            return fragment;
        },
        //有省略点
        renderEllipsis: function(){
            var fragment = document.createDocumentFragment();
            this.addFragmentAfter(fragment,[
                this.getPageInfos(CLASS_NAME.LINK+' current', this.pageNumber)
            ]);
            for(var i=1;i<=this.options.pageShow;i++){
                if(this.pageNumber-i>1){
                    this.addFragmentBefore(fragment,[
                        this.getPageInfos(CLASS_NAME.LINK, this.pageNumber-i)
                    ]);
                }
                if(this.pageNumber+i<this.pageCount){
                    this.addFragmentAfter(fragment,[
                        this.getPageInfos(CLASS_NAME.LINK, this.pageNumber+i)
                    ]);
                }
            }
            if(this.pageNumber-(this.options.pageShow+1)>1){
                this.addFragmentBefore(fragment,[
                    this.pageInfos[4]
                ]);
            }
            if(this.pageNumber>1){
                this.addFragmentBefore(fragment, [
                    this.pageInfos[0],
                    this,this.pageInfos[1],
                    this.getPageInfos(CLASS_NAME.LINK, 1)
                ])
            }
            if(this.pageNumber+this.options.pageShow+1<this.pageCount){
                this.addFragmentAfter(fragment, [
                    this.pageInfos[4]
                ]);
            }
            if(this.pageNumber<this.pageCount){
                this.addFragmentAfter(fragment, [
                    this.getPageInfos(CLASS_NAME.LINK, this.pageCount),
                    this.pageInfos[2],
                    this.pageInfos[3]
                ]);
            }
            return fragment;
        },
        //渲染左边
        addFragmentBefore: function(fragment, datas){
            fragment.insertBefore(this.creatHtml(datas), fragment.firstChild);
        },
         //渲染左边
         addFragmentAfter: function(fragment, datas){
            fragment.appendChild(this.creatHtml(datas));
        },
        creatHtml: function(elemDatas){
            var seft = this;
            var fragment = document.createDocumentFragment();
            var liEle = document.createElement('li');
            var aEle = document.createElement('a');
            elemDatas.forEach(function(elementData,index){
                liEle = liEle.cloneNode(false);
                aEle = aEle.cloneNode(false);
                liEle.setAttribute('class',CLASS_NAME.ITEM);
                aEle.setAttribute('href',"javascrit:;");
                aEle.setAttribute('id',elementData.id);
                if(elementData.id!=='page'){
                    aEle.setAttribute('class',CLASS_NAME.ITEM);
                }else {
                    aEle.setAttribute('id',elementData.className);
                }
                aEle.innerHTML = elementData.content;
                liEle.appendChild(aEle);
                fragment.appendChild(liEle);
            });
            return fragment;
        },
        //渲染DOM
        renderDom: function(begin, end){
            var fragment = document.createDocumentFragment();
            var str = '';
            for(var i=begin;i<=end;i++){
                str = this.pageNumber===i?CLASS_NAME.LINK+"current":CLASS_NAME.LINK;
                this.addFragmentAfter(fragment, [this.getPageInfos(str,i)]);
            }
            return fragment;
        },
        prevPage: function(){
            this.pageNumber--;
        },
        nextPage: function(){
            this.pageNumber++;
        },
        goPage: function(pageNumber){
            this.pageNumber = pageNumber;
        },
        firstPage: function(){
            this.pageNumber = 1;
        },
        lastPage: function(){
            this.pageNumber = this.pageCount;
        }
    };

    return Pagination;


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
   /* 3.0 优化版 
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
    */
}));