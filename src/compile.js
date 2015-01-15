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
	RAW: 201,
	ARTIFACT: 202,
	TURNVAR: 203,
	// position references
	ARTIFACTPOS: 301,
	MARKPOS: 302,
	// query references
	CUSTOMGROUP: 401,
	PLR1UNITS: 402,
	PLR2UNITS: 403,
	DEADUNITS: 404,
	ALLUNITS: 405,
	UNITS: 406,
	GENQUERY: 407,
	UNITORTERRAIN: 408,
	TERRAIN: 409,
	ALLTERRAIN: 410
});

Algol.compileContext = function(ctx){
	return _.extend({
		setup: this.compileSetup(ctx,ctx.def[ctx.save.setup]),
		board: this.compileBoard(ctx.def[ctx.save.board]),
		compdefs: _.reduce([1,2],function(plr){ // TODO: figure out plrmax
			return this.compileGameForPlayer(_.extend({compFor:plr},ctx));
		},this)
	},ctx);
};

Algol.compileGameForPlayer = function(ctx){
	return ctx.def;
};

/*
Make ykx id instead. terrain never moves around, and only 1 is allowed per square.
*/
Algol.compileBoard = function(ctx,board){
	return _.extend({
		terrain: _.reduce(board.terrain,function(ret,b){
			var ykx = this.posToYkx(b);
			ret[ykx] = _.extend({id:ykx,ykx:ykx},b);
		},{},this)
	},board);
};

Algol.compileSetup = function(ctx,setup){
	return _.reduce(setup,function(ret,unit,id){
		ret.units[id].id = id;
		ret.units[id].ykx = this.posToYkx(unit);
		ret.units[id].alive = true;
		if (unit.plr) { // TODO support more than 2 plrs
			ret.groups["PLR"+unit.plr+"UNITS"] = (ret.groups["PLR"+unit.plr+"UNITS"]||[]).concat(id);
			ret.groups["NONPLR"+["foo",2,1][unit.plr]+"UNITS"] = (ret.groups["NONPLR"+["foo",2,1][unit.plr]+"UNITS"]||[]).concat(id);
		}
		if (unit.group) {
			ret.customgroupnames.push(unit.group);
			ret.groups[unit.group] = (ret.groups[unit.group]||[]).concat(id);
		}
		return ret;
	},{groups:{},units:setup,customgroupnames:[]},this);
};

Algol.compileValue = function(ctx,value){
	if (value[0] === "IDAT") return this.compileValue(["LOOKUP","UNITS",value[1],"id"]);
	if (value[0] === "DIRAT") return this.compileValue(["LOOKUP","UNITS",value[1],"dir"]);
	if (value === "ARTIFACTDIR") return [c.ARTIFACT,"dir"];
	if (value === "ARTIFACTORIGDIR") return [c.ARTIFACT,"originaldir"];
	return [c.RAW,{CURRENTPLAYER:ctx.compFor,NEXTPLAYER:ctx.compNext}[value]||value];
};

Algol.compileBoolean = function(ctx,bool){
	return bool === true ? [c.TRUE] : bool === false ? [c.FALSE] : bool;
};

Algol.compilePositionref = function(ctx,posref){
	if ({TARGET:1,START:1}[posref]) return [c.ARTIFACTPOS,posref];
	if (ctx.def.marks[posref]) return [c.MARKPOS,posref];
	return posref;
};

Algol.compileQueryref = function(ctx,queryref){
	if (queryref === "MYUNITS") return [c.UNITORTERRAIN,"PLR"+ctx.compFor+"UNITS"];
	if (queryref === "OPPUNITS") return [c.UNITORTERRAIN,"PLR"+["foo",2,1][ctx.compFor]+"UNITS"]; // TODO: support more than 2 plrs!
	if (_.contains(["DEADUNITS","UNITS","ALLUNITS","TERRAIN","ALLTERRAIN"],queryref)) return [c.UNITORTERRAIN,queryref];
	if (ctx.A.plrgroups[queryref]) return [c.UNITORTERRAIN,queryref];
	if ((ctx.A.dependencymap[queryref]||[])[0]==="genquery") return [c.GENQUERY,ctx.A.dependencymap[queryref][1]];
	return queryref;
};


// €€€€€€€€€€€€€€€€€€€€€€€€€ E X P O R T €€€€€€€€€€€€€€€€€€€€€€€€€

} // end augmentWithCompileFunctions

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = augmentWithCompileFunctions;
else
    window.augmentWithCompileFunctions = augmentWithCompileFunctions;

})();