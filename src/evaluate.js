(function(){
var _ = (typeof require !== "undefined" ? require("./lodashmixins") : window._);
function augmentWithEvaluateFunctions(Algol){


// €€€€€€€€€€€€€€€€€€€€€€€€€€€ E V A L U A T E  F U N C T I O N S €€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€*/



var c = Algol.constants;

if (!c) throw Error("Evaluate module requires Compile module");
var TRUE = c.TRUE;
var FALSE = c.FALSE;
var NOT = c.NOT;
var SAME = c.SAME;
var DIFFERENT = c.DIFFERENT;
var AND = c.AND;
var OR = c.OR;
var ONEOF = c.ONEOF;
var ANYAT = c.ANYAT;
var NONEAT = c.NONEAT;
var EMPTY = c.EMPTY;
var NOTEMPTY = c.NOTEMPTY;
var MATCHAT = c.MATCHAT;

Algol.evaluateBoolean = function(ctx,def){
	switch(def[0]){
		case TRUE: return true;
		case FALSE: return false;
		case NOT: return !this.evaluateBoolean(ctx,def[1]);
		case SAME: return this.evaluateValue(ctx,def[1]) === this.evaluateValue(ctx,def[2]);
		case DIFFERENT: return this.evaluateValue(ctx,def[1]) !== this.evaluateValue(ctx,def[2]);
		case AND: return _.every(_.tail(def),this.evaluateBoolean.bind(this,ctx));
		case OR: return _.some(_.tail(def),this.evaluateBoolean.bind(this,ctx));
		case ONEOF: return _.contains(_.tail(def,2),def[1]);
		default: throw "Couldn't eval boolean: "+def.join(" --- ");
	}
};

var RAW = c.RAW;

Algol.evaluateValue = function(ctx,def){
	switch(def[0]){
		case RAW: return def[1];
		default: throw "Couldn't eval value: "+def.join(" --- ");
	}
};

// returns result
Algol.evaluateGenerator = function(ctx,def){
	
};

// €€€€€€€€€€€€€€€€€€€€€€€€€ E X P O R T €€€€€€€€€€€€€€€€€€€€€€€€€

} // end augmentWithEvaluateFunctions

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = augmentWithEvaluateFunctions;
else
    window.augmentWithEvaluateFunctions = augmentWithEvaluateFunctions;

})();