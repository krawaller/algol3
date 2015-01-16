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
	LOOKUP: 204,
	IFELSE: 205,
	IF: 206,
	UNLESS: 207,
	// position references
	ARTIFACTPOS: 301,
	MARKPOS: 302,
	ONLYIN: 303,
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
	ALLTERRAIN: 410,
	GAMEQUERY: 411,
	// gamequery
	MERGE: 501,
	OVERLAPLEFT: 502,
	FILTER: 503,
	// matchobj
	ISNT: 601,
	IS: 602,
	// effects
	MOVEUNIT: 701,
	TURNUNIT: 702,
	KILLUNIT: 703,
	SETTURNVAR: 704,
	SETTURNPOS: 705,
	CREATETERRAIN: 706,
	INCREASETURNVAR: 707,
	SETUNITTURNVAR: 708,
	// propobj
	LOOKUPALL: 801
});

c = Algol.constants = _.mapValues(c,function(val,key){return "_"+key;});

var rev = _.invert(c);


Algol.compileContext = function(ctx){ // expects def to be defaultified game, A to be analysis
	return _.extend(ctx,{
		setup: this.compileSetup(ctx,ctx.def.setups[ctx.save.setup]),
		board: this.compileBoard(ctx,ctx.def.boards[ctx.save.board]),
		compdefs: _.reduce([1,2],function(mem,plr){ // TODO: figure out plrmax
			mem[plr] = this.compileGameForPlayer(_.extend(ctx,{compFor:plr}),ctx.def);
			return mem;
		},{},this)
	});
};

Algol.compileGameForPlayer = function(ctx,d){
	return _.extend(_.omit(d,"boards","setups"),{
		queries: _.mapValues(d.queries,function(q){return this.compileGameQuery(ctx,q);},this),
		endgame: _.mapValues(d.endgame,function(q){return this.compileEndgame(ctx,q);},this),
		endturn: this.compileEndTurn(ctx,d.endturn),
		marks: _.mapValues(d.marks,function(q){return this.compileMark(ctx,q);},this),
		commands: _.mapValues(d.commands,function(q){return this.compileCommand(ctx,q);},this),
		generators: _.mapValues(d.generators,function(q){return this.compileGenerator(ctx,q);},this),
	});
};

Algol.compileGenerator = function(ctx,def){
	return _.extend(def,{
		frompos: def.frompos ? this.compilePositionref(ctx,def.frompos) : undefined,
		fromquery: def.fromquery ? this.compileQueryref(ctx,def.fromquery) : undefined,
		stops: def.stops ? this.compileQueryref(ctx,def.stops) : undefined,
		steps: def.steps ? this.compileQueryref(ctx,def.steps) : undefined,
		name: def.name ? this.compileValue(ctx,def.name) : undefined,
		stopname: def.stopname ? this.compileValue(ctx,def.stopname) : undefined,
		stepname: def.stepname ? this.compileValue(ctx,def.stepname) : undefined,
		startname: def.startname ? this.compileValue(ctx,def.startname) : undefined,
		relativeto: def.relativeto ? this.compileValue(ctx,def.relativeto) : undefined,
		include: def.include ? this.compilePropobj(ctx,def.include) : undefined,
	});
};

Algol.compileCommand = function(ctx,def){
	return _.extend(def,{
		condition: def.condition ? this.compileBoolean(ctx,def.condition) : undefined,
		effects: _.map(def.effects,function(e){return this.compileEffect(ctx,e);},this)
	});
};

Algol.compileEffect = function(ctx,def){
	if (rev[def[0]]) return def;
	switch(def[0]){
		case "MOVEUNIT": return [c.MOVEUNIT,this.compileValue(ctx,def[1]),this.compilePositionref(ctx,def[2])];
		case "TURNUNIT": return [c.TURNUNIT,this.compileValue(ctx,def[1]),this.compileValue(ctx,def[2])];
		case "KILLUNIT": return [c.KILLUNIT,this.compileValue(ctx,def[1])];
		case "SETTURNVAR": return [c.SETTURNVAR,def[1],this.compileValue(ctx,def[2])];
		case "SETUNITTURNVAR": return [c.SETUNITTURNVAR,this.compileValue(ctx,def[1]),def[2],this.compileValue(ctx,def[3])];
		case "INCREASETURNVAR": return [c.INCREASETURNVAR,def[1],this.compileValue(ctx,def[2])];
		case "SETTURNPOS": return [c.SETTURNPOS,def[1],this.compilePositionref(ctx,def[2])];
		case "CREATETERRAIN": return [c.CREATETERRAIN,this.compilePositionref(ctx,def[1]),this.compilePropobj(ctx,def[2])];
		default:
			console.log("Unknown effect!",def);
			throw("effect shit");
	}
};

Algol.compilePropobj = function(ctx,def){
	if (def[0] && (def[0]==="LOOKUPALL"||def[0]===c.LOOKUPALL)) return [c.LOOKUPALL,this.compileQueryref(ctx,def[1]),this.compilePositionref(ctx,def[2]),def[3]];
	return _.mapValues(def,function(val){ return this.compileValue(ctx,val);},this);
};

Algol.compileMark = function(ctx,def){
	return _.extend(def,{
		condition: def.condition ? this.compileBoolean(ctx,def.condition) : undefined,
		from: this.compileQueryref(ctx,def.from)
	});
};


Algol.compileEndTurn = function(ctx,def){
	return _.extend(def,{
		condition: this.compileBoolean(ctx,def.condition),
		passto: this.compileValue(ctx,def.passto)
	});
};

Algol.compileEndgame = function(ctx,def){
	return [this.compileBoolean(ctx,def[0]),this.compileValue(ctx,def[1])];
};


/*
Make ykx id instead. terrain never moves around, and only 1 is allowed per square.
*/
Algol.compileBoard = function(ctx,board){
	return _.extend(board,{
		terrain: _.reduce(board.terrain,function(ret,b){
			var ykx = this.posToYkx(b);
			ret[ykx] = _.extend(b,{id:ykx,ykx:ykx});
			return ret;
		},{},this)
	});
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
	if (rev[value[0]]) return value;
	if (value[0] === "IDAT") return this.compileValue(ctx,["LOOKUP","UNITS",value[1],"id"]);
	if (value[0] === "DIRAT") return this.compileValue(ctx,["LOOKUP","UNITS",value[1],"dir"]);
	if (value[0] === "PLRAT") return this.compileValue(ctx,["LOOKUP","UNITS",value[1],"plr"]);
	if (value[0] === "LOOKUP") return [c.LOOKUP,this.compileQueryref(ctx,value[1]),this.compilePositionref(ctx,value[2]),value[3]];
	if (value[0] === "IFELSE") return [c.IFELSE,this.compileBoolean(ctx,value[1]),this.compileValue(ctx,value[2]),this.compileValue(ctx,value[3])];
	if (value[0] === "IF") return [c.IF,this.compileBoolean(ctx,value[1]),this.compileValue(ctx,value[2])];
	if (value[0] === "UNLESS") return [c.UNLESS,this.compileBoolean(ctx,value[1]),this.compileValue(ctx,value[2])];
	if (value === "ARTIFACTDIR") return [c.ARTIFACT,"dir"];
	if (value === "ARTIFACTORIGDIR") return [c.ARTIFACT,"originaldir"];
	return [c.RAW,{CURRENTPLAYER:ctx.compFor,NEXTPLAYER:ctx.compNext}[value]||value];
};

Algol.compileBoolean = function(ctx,bool){
	if (rev[bool[0]]) return bool;
	if (bool === true) return [c.TRUE];
	if (bool === false) return [c.FALSE];
	switch(bool[0]){
		case "NOT": return [c.NOT,this.compileBoolean(ctx,bool[1])];
		case "SAME": return [c.SAME,this.compileValue(ctx,bool[1]),this.compileValue(ctx,bool[2])];
		case "DIFFERENT": return [c.DIFFERENT,this.compileValue(ctx,bool[1]),this.compileValue(ctx,bool[2])];
		case "AND": return [c.AND].concat(_.map(_.tail(bool),function(b){return this.compileBoolean(ctx,b);},this));
		case "OR": return [c.OR].concat(_.map(_.tail(bool),function(b){return this.compileBoolean(ctx,b);},this));
		case "ANYAT": return [c.ANYAT,this.compileQueryref(ctx,bool[1]),this.compilePositionref(ctx,bool[2])];
		case "NONEAT": return [c.NONEAT,this.compileQueryref(ctx,bool[1]),this.compilePositionref(ctx,bool[2])];
		case "EMPTY": return [c.EMPTY,this.compileQueryref(ctx,bool[1])];
		case "NOTEMPTY": return [c.NOTEMPTY,this.compileQueryref(ctx,bool[1])];
		case "ONEOF": return [c.ONEOF].concat(_.map(_.tail(bool),function(b){return this.compileValue(ctx,b);},this));
		case "MATCHAT": return [c.MATCHAT,this.compileQueryref(ctx,bool[1]),this.compilePositionref(ctx,bool[2]),,this.compileMatchobj(ctx,bool[3])];
		default:
			console.log("Unknown bool!",bool);
			throw "BOOLSHIT";
	}
};

Algol.compilePositionref = function(ctx,posref){
	if ({TARGET:1,START:1}[posref]) return [c.ARTIFACTPOS,posref];
	if (ctx.def.marks[posref]) return [c.MARKPOS,posref];
	if (posref[0]==="ONLYIN") return [c.ONLYIN,this.compileQueryref(ctx,posref[1])];
	return posref;
};

Algol.compileQueryref = function(ctx,queryref){
	if (rev[queryref[0]]) return queryref;
	if (queryref === "MYUNITS") return [c.UNITORTERRAIN,"PLR"+ctx.compFor+"UNITS"];
	if (queryref === "OPPUNITS") return [c.UNITORTERRAIN,"PLR"+["foo",2,1][ctx.compFor]+"UNITS"]; // TODO: support more than 2 plrs!
	if (_.contains(["DEADUNITS","UNITS","ALLUNITS","TERRAIN","ALLTERRAIN"],queryref)) return [c.UNITORTERRAIN,queryref];
	if (ctx.A.plrgroups[queryref]) return [c.UNITORTERRAIN,queryref]; // custom groups, also fixed with units
	if ((ctx.A.dependencymap[queryref]||[])[0]==="genquery") return [c.GENQUERY,ctx.A.dependencymap[queryref][1]];
	if (!ctx.def.queries[queryref]){
		console.log("WAAARN",queryref);
	}
	return [c.GAMEQUERY,queryref,this.compileGameQuery(ctx,ctx.def.queries[queryref])];
};

Algol.compileGameQuery = function(ctx,gq){
	if (rev[gq[0]]) return gq;
	switch(gq[0]){
		case "OVERLAPLEFT": return [c.OVERLAPLEFT,this.compileQueryref(ctx,gq[1]),this.compileQueryref(ctx,gq[2])];
		case "MERGE": return [c.MERGE,this.compileQueryref(ctx,gq[1]),gq[2],this.compileQueryref(ctx,gq[3]),gq[4]];
		case "FILTER": return [c.FILTER,this.compileQueryref(ctx,gq[1]),this.compileMatchobj(ctx,gq[2])];
		default:
			console.log("AAAH",gq);
			throw "I DONT KNOWWWW!";
	}
};

Algol.compileMatchobj = function(ctx,matchobj){
	return _.mapValues(matchobj,function(m){
		return m[0]==="ISNT" ? [c.ISNT,this.compileValue(ctx,m[1])] : [c.IS,this.compileValue(ctx,m)];
	},this);
};

// €€€€€€€€€€€€€€€€€€€€€€€€€ E X P O R T €€€€€€€€€€€€€€€€€€€€€€€€€

} // end augmentWithCompileFunctions

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = augmentWithCompileFunctions;
else
    window.augmentWithCompileFunctions = augmentWithCompileFunctions;

})();