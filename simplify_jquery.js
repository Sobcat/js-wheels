/*
*
* 造别人的轮子, 开自己的车
* JavaScript 练习
* 简化版的 JQuery
*
*/

;(function(){
    var $ = function(){
        return new Base();
    }
    function Base() {
        this.$ = function(id){
            return document.getElementById(id);
        };
        this.$$ = function(calssName){
            return document.getElementsByClassName(calssName);
        }
        this.css = function(){}
    }
})();