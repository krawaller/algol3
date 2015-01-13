(function(){
var _ = (typeof require !== "undefined" ? require("./lodashmixins") : window._);
function augmentWithReportFunctions(Algol){


// €€€€€€€€€€€€€€€€€€€€€€€€€€€ R E P O R T E R  F U N C T I O N S €€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€*/


Algol.reporter = function(name){
	name = [].concat(name);
	var rep = function(error,callback){
		if (error){ console.log("Error:",name.join("_"),error);
		} else if (callback) { callback.call(Algol); }
	};
	rep.sub = function(sub){ return Algol.reporter(name.concat(sub)); };
	rep.cmnd = function(ctx,arr,poss){
		if (!_.isArray(arr)) rep("isn't an array");
		else if (!poss[arr[0]]) rep("has illegal cmnd: "+arr[0]);
		else if (poss[arr[0]][0] === "__LISTOF"){
			if (arr.length < 3) rep("expected to have at least 2 items, had "+(arr.length-1));
			else _.each(_.rest(arr),function(listitem){
				Algol["validate_"+poss[arr[0]][1]](rep,ctx,listitem);
			});
		}
		else if (arr.length-1 !== poss[arr[0]].length) rep("has wrong number args for "+arr[0]+", expected "+poss[arr[0]].length+" but got "+(arr.length-1));
		else _.each(poss[arr[0]],function(datatype,n){
			Algol["validate_"+datatype](rep,ctx,arr[n+1],arr[n]); // sending in previous too for extra! :)
		});
	};
	rep.flexobj = function(sub,ctx,def,checkkey,checkval){
		var r = sub ? rep.sub(sub) : rep;
		r(!_.isObject(def) && "isn't an object!",function(){
			_.each(def,function(val,key){
				this["validate_"+checkkey](r.sub(key+"name"),ctx,key);
				this["validate_"+checkval](r.sub(key),ctx,val);
			},this);
		});
	};
	rep.fixobj = function(sub,ctx,obj,map,except){
		var r = sub ? rep.sub(sub) : rep;
		r(!_.isObject(obj) && "isn't an object!",function(){
			_.each(obj,function(val,key){
				if (!map[key]) r(!(except===true) && !_.contains(except||[],key) && "has unknown key: "+key);
				else this["validate_"+([].concat(map[key])[0])](r.sub(key),ctx,val);
			},this);
			_.each(map,function(val,key){
				r(_.isArray(val) && !obj[key] && "is missing mandatory key "+key);
			});
		});
	};
	return rep;
};



// €€€€€€€€€€€€€€€€€€€€€€€€€ E X P O R T €€€€€€€€€€€€€€€€€€€€€€€€€

} // end augmentWithReportFunctions

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = augmentWithReportFunctions;
else
    window.augmentWithReportFunctions = augmentWithReportFunctions;

})();