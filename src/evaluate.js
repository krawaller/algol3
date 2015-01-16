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
var ARTIFACT = c.ARTIFACT;
var TURNVAR = c.TURNVAR;
var GAMEQUERY = c.GAMEQUERY;
var GENQUERY = c.GENQUERY;

Algol.evaluateValue = function(ctx,def){
	switch(def[0]){
		case TURNVAR: return ctx.turn.var[def[1]];
		case ARTIFACT: return ctx.artifact[def[1]];
		case RAW: return def[1];
		default: throw "Couldn't eval value: "+def.join(" --- ");
	}
};

var UNITORTERRAIN = c.UNITORTERRAIN;

// returns result
Algol.evaluateQueryRef = function(ctx,def){
	switch(def[0]){
		case UNITORTERRAIN: return ctx.queries[def[1]]; // will always be loaded!
		case GAMEQUERY: return ctx.queries[def[1]] || (ctx.queries[def[1]] = this.evaluateGameQueryRef(ctx,def[0]));
		case GENQUERY: return ctx.queries[def[1]] || (ctx.queries[def[1]] = this.evaluateGeneratedQueryRef(ctx,def[0]));
	}
};

// returns result
Algol.evaluatePos = function(ctx,def){
	return def;
};

var OVERLAPLEFT = c.OVERLAPLEFT;
var MERGE = c.MERGE;

function steal(from,plan){
	return _.reduce(plan,function(ret,newname,oldname){
		ret[newname] = from[oldname];
		return ret;
	},{});
}

Algol.evaluateGameQueryRef = function(ctx,q){
	switch(q[0]){
		case OVERLAPLEFT:
			var left = this.evaluateQueryRef(ctx,q[1]), right = this.evaluateQueryRef(ctx,q[2]);
			return _.reduce(left.positions,function(ret,pos){
				if (right.data[pos]){
					ret.positions.push(pos);
					ret.data[pos] = left.data[pos];
				}
				return ret;
			},{positions:[],data:{}});
		case MERGE: 
			var mleft = this.evaluateQueryRef(ctx,q[1]), mright = this.evaluateQueryRef(ctx,q[3]);
			return _.reduce(mleft.positions,function(ret,pos){
				if (mright.data[pos]){
					ret.positions.push(pos);
					ret.data[pos] = _.extend(steal(mleft.data[pos],q[2]),steal(mright.data[pos],q[4]));
				}
				return ret;
			},{positions:[],data:{}});
	}
};

Algol.evaluateGeneratedQueryRef = function(ctx,gdef){

};


// €€€€€€€€€€€€€€€€€€€€€€€€€ E X P O R T €€€€€€€€€€€€€€€€€€€€€€€€€

} // end augmentWithEvaluateFunctions

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = augmentWithEvaluateFunctions;
else
    window.augmentWithEvaluateFunctions = augmentWithEvaluateFunctions;

})();