/*
*
* 造别人的轮子, 开自己的车
* JavaScript 练习
* 简化版的 JQuery 选择器原理
* ai
* 呵呵呵
*/

// $('id').css().css()

;(function(){
    var $ = function(str){
        var base = new Base();
        if(str[0]=="#"){
            base.$(str.substr(1,str.length-1));
        }else if(str[0]=="."){
            base.$$(str.substr(1,str.length-1));
        }else{

        }
        return base;
    }
    function Base() {
        this.elements = []; //创建数组,保存获取的节点和节点数组
        this.current = -1; //用于遍历
        this.$ = function(id){
            this.elements.push(document.getElementById(id));
            return this; //返回对象 不然无法连缀
        };
        this.$$ = function(calssName){
            var clss = document.getElementsByClassName(calssName);
            for(var i=0;i<clss.length;i++){
                this.elements.push(clss[i]);
            }
            return this;
        };
        this.eq = function(index) {
            this.current = index;
            return this;
        };
        this.css = function(attr, val){
            if(this.current !=-1 ){
                this.elements[this.current].style[attr] = val;
            }else {
                for(var i=0;i<this.elements.length;i++){
                    this.elements[i].style[attr] = val;
                }
            }
            return this;
        };
    }
})();
