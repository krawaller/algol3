(function(){

var _ = (typeof require !== "undefined" ? require("lodash") : window._);

_.mixin({
	quickfind: function(arr,tester){
		if (!arr.length) { return undefined; }
		var index = Math.floor(arr.length/2);
		switch(tester(arr[index])){
			case -1: return _.quickfind(_.first(arr,index-1),tester);
			case 1: return _.quickfind(_.rest(arr,index),tester);
			default: return arr[index];
		}
	},
	combine: function(arr1,arr2){
		return _.reduce(arr1,function(memo,i1){
			return memo.concat(_.map(arr2,function(i2){
				return [i1,i2];
			}));
		},[]);
	}
});


if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = _;
})();