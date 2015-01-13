(function(){
var _ = (typeof require !== "undefined" ? require("./lodashmixins") : window._);
function augmentWithCompileFunctions(Algol){


// €€€€€€€€€€€€€€€€€€€€€€€€€€€ C O M P I L E   F U N C T I O N S €€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€*/

var c = Algol.constants = _.extend(Algol.constants||{},{
	// booleans
	TRUE: 101,
	FALSE: 102,
	NOT: 103,
	SAME: 104,
	DIFFERENT: 105,
	AND: 106,
	OR: 107,
	ONEOF: 108,
	ANYAT: 109,
	NONEAT: 110,
	EMPTY: 111,
	NOTEMPTY: 112,
	MATCHAT: 113,
	// values
	RAW: 201
});

Algol.compileValue = function(ctx,value){
	return [c.RAW,{CURRENTPLAYER:ctx.compFor,NEXTPLAYER:ctx.compNext}[value]||value];
};


// €€€€€€€€€€€€€€€€€€€€€€€€€ E X P O R T €€€€€€€€€€€€€€€€€€€€€€€€€

} // end augmentWithCompileFunctions

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = augmentWithCompileFunctions;
else
    window.augmentWithCompileFunctions = augmentWithCompileFunctions;

})();