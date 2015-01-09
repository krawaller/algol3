(function(){

var Algol = {},
	_ = (typeof require !== "undefined" ? require("./lodashmixins") : window._);



// €€€€€€€€€€€€€€€€€€€€€€€€€€€ B A T T L E €€€€€€€€€€€€€€€€€€€€€€€€€€€

Algol.performEffectsOnSave = function(game,save,cache,effects){
	// needs eval...
};

Algol.endTurnOnSave = function(game,save,cache){
	// needs bool eval and shit...
};



// €€€€€€€€€€€€€€€€€€€€€€€€€€€ B O A R D  F U N C T I O N S €€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€*/


// each movemod is [xforward,xright,yforward,yright]. indexed using DIR-1
var movemods = {
	hex: [ [0,1,-2,-1], [1,1,-1,1], [1,0,1,2], [0,-1,2,1], [-1,-1,1,-1], [-1,0,-1,-2] ],
	square: [ [0,1,-1,0], [1,1,-1,1], [1,0,0,1], [1,-1,1,1], [0,-1,1,0], [-1,-1,1,-1], [-1,0,0,-1], [-1,1,-1,-1] ]
};

/**
 * Finds a new position on the board
 * @param {Object} pos A position object with x and y props
 * @param {Number} dir The direction in which to walk
 * @param {Object} instruction Object with forward and right prop
 * @param {Object} board The board definition
 * @returns {Object} A new position object
 */
Algol.moveInDir = function(pos,dir,instruction,board){
	var forward = instruction.forward||0,
		right = instruction.right||0,
		shape = (board||{}).shape||"square",
		mods = movemods[shape][dir-1],
		newpos = {x: pos.x+forward*mods[0]+right*mods[1], y: pos.y+forward*mods[2]+right*mods[3] };
	if (!newpos) throw "Illegal direction "+dir+" for shape "+shape;
	return _.extend({ykx:this.posToYkx(newpos)},newpos);
};

/**
 * Calculates a new direction, relative to another
 * @param {Number} dir The relative direction you want to face
 * @param {Number} relativeTo The direction you're turning relative to
 * @returns {Number} The new direction
 */
Algol.dirRelativeTo = function(dir,relativeto,board){
	switch((board || {}).shape){
		case "hex": return [1,2,3,4,5,6,1,2,3,4,5,6][relativeto-2+dir];
		default: return [1,2,3,4,5,6,7,8,1,2,3,4,5,6,7,8][relativeto-2+dir];
	}
};

/**
 * @returns {Object} Object of position objects for neighbours
 */
Algol.neighbours = function(pos,dirs,board){
	return _.reduce(dirs,function(ret,dir){
		var n = this.moveInDir(pos,dir,{forward:1},board);
		if (!this.outOfBounds(n,board)){
			ret[n.ykx]=n;
		}
		return ret;
	},{},this);
};

/**
 * Tests whether or not a given squares is within board bounds
 * Used by artifactgenerator utility functions
 * @param {Object} pos Coordinates of position to test
 * @param {Object} board Object of board dimensions and shape
 * @return {Boolean} whether or not the position is within bounds
 */
Algol.outOfBounds = function(pos,board){
	switch((board || {}).shape){
		default: return pos.x < 1 || pos.x > board.x || pos.y<1 || pos.y > board.y;
	}
};

/**
 * Converts coordinates into a ykx number
 * @params {Object} pos Coordinates to convert
 * @returns {Number} A ykx number of the coordinates
 */
Algol.posToYkx = function(pos){ return pos.y*1000+pos.x; };

/**
 * Converts ykx number into coordinates
 * @params {Number} ykx A ykx number to convert
 * @returns {Object} A position object with x and y props, as well as ykx
 */
Algol.ykxToPos = function(ykx){ return {y:Math.floor(ykx/1000),x:ykx%1000,ykx:ykx}; };

/**
 * Takes a board definition and returns obj for each pos, with colours and coords
 * @params {Object} board A board definition
 * @returns {Object} An aspect object
 */
Algol.generateBoardSquares = function(board){
	board = board || {};
	switch(board.shape){
		case "hex":
			var coords = _.combine(_.range(1,board.x+1),_.range(1,board.y+1)).filter(function(coord){
					return (coord[0]+coord[1])%2 === (board.notopleft ? 1 : 0);
				}),
				rgb = ["red","green","blue"];
			return _.reduce(coords,function(memo,coord){
				var x = coord[0], y = coord[1], ykx = this.posToYkx({x:x,y:y});
				return _.extend(memo,_.object([ykx],[{
					x: x,
					y: y,
					ykx: ykx,
					columncolour: rgb[(x+2)%3],
					uphillcolour: rgb[(Math.floor((x+y)/2)-1)%3],
					downhillcolour: rgb[(Math.floor((y-x+100002)/2))%3]
				}]));
			},{},this);
		default: return _.reduce(_.range(1,board.x*board.y+1),function(ret,num){
			var y = Math.floor((num-1)/board.x)+1, x = num-((y-1)*board.x);
			return _.extend(ret,_.object([this.posToYkx({x:x,y:y})],[{ y: y, x: x, colour: ["white","black"][(x+(y%2))%2] }]));
		},{},this);
	}
};

// €€€€€€€€€€€€€€€€€€€€€€€€€€€ T I M E   F U N C T I O N S €€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€

/**
 * Calculates property state at a given time according to startvalue and changes
 * @param {Number|String} startvalue
 * @param {Array} changes List of changes, each change is [step,value]
 * @param {Number} step
 * @return {Number|String} Value at given time
 */
Algol.calcPropVal = function(startvalue,changes,step){
	if (!changes || !changes.length ){ return startvalue; } // no change, return startval
	if ((!step) || step > changes[changes.length-1][0]){ return changes[changes.length-1][1]; } // no time given or time after last change, return last change value
	if (step < changes[0][0]){ return startvalue; } // time prior to first change, return start val
	return _.find(changes.slice().reverse(),function(change){ return change[0] <= step; })[1]; // last change val before step
};


/**
 * Calculates startvalues and changes for a single object into a given time state
 * Used only by calcCollection
 * @param {Object} startproperties Starting object
 * @param {Object} changes Per property changes
 * @param {Number} step Which step to calculate to
 * @param {String} fname internal shit
 * @return {Object} Stepstate object
 */
Algol.calcObj = function(starts,changes,step,fname){
	return !changes ? starts : _.reduce(_.union(_.keys(starts||{}),_.keys(changes)),function(memo,key){
		return _.extend(_.object([key],[this[fname||"calcPropVal"]((starts||{})[key],changes[key],step)]),memo);
	},{},this);
};


/**
 * Calculates startvalues and changes for a collection of objects into a given time state
 * @param {Object} starts Collection of starting objects
 * @param {Object} changes Collection of per object changes
 * @param {Number} step Which step to calculate to
 * @return {Object} Collection of Stepstate object
 */
Algol.calcColl = function(starts,changes,step){ return this.calcObj(starts,changes,step,"calcObj");};



// €€€€€€€€€€€€€€€€€€€€€€€€€€€ G E N E R A T O R   F U N C T I O N S €€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€

/**
 * Tries to offset from pos into all given dirs. Won't include outofbounds results.
 * @param {Object} def An object defining the offset. Here we use the forward and right props.
 * @param {Object} startpos A location object with x and y coords of starting position.
 * @param {Array} dirs An array of direction numbers to offset in.
 * @param {Object} board The board definition, used to check out of bounds for generated squares.
 * @returns {Object} ykx object of all generated positions, each containing dir.
 */
Algol.offsetInDirs = function(def,startpos,dirs,board){
	return _.reduce(dirs,function(ret,dir){
		var newpos = this.moveInDir(startpos,dir,def,board);
		return this.outOfBounds(newpos,board) ? ret : _.extend(ret,_.object([this.posToYkx(newpos)],[{DIR:dir}]));
	},{},this);
};

/**
 * Determines if the walk should stop for any reason. Used in walkInDir
 * @param {Object} pos The position object for where we are currently at
 * @param {Number} distance How far we've currently walked
 * @param {Number} max Maximum allowed length, if any
 * @param {Object} stops A ykx object of squares to stop at, if any
 * @param {Object} steps A ykx object of squares we can walk on, if any.
 * @param {Object} board The board definition
 * @returns {String} Reason to stop, or undefined if no reason
 */
Algol.walkCheck = function(pos,distance,max,stops,steps,board){
	if (max && distance > max) return "exceededmax";
	if (this.outOfBounds(pos,board)) return "outofbounds";
	var ykx = this.posToYkx(pos);
	if (stops && stops[ykx]) return "hitstop";
	if (steps && !steps[ykx]) return "nostep";
};

/**
 * Walks in the given dir, creating step/stop squares accordingly. Used in walkInDirs
 * @param {Object} def The walk definition
 * @param {Object} startpos The x-y position to start from
 * @param {Number} dir The direction to walk in
 * @param {Object} stops A ykx object of stops, if any
 * @param {Object} steps A ykx object of steps, if any
 * @param {Object} board The board definition
 * @returns {Object}
 */
Algol.walkInDir = function(def,startpos,dir,stops,steps,board){
	var pos = startpos, instr = {forward:1}, stopstate, distance = 0, sqrs = [];
	while (!(stopstate = this.walkCheck((pos = this.moveInDir(pos,dir,instr,board)),++distance,def.max,stops,steps,board) )){
		if (def.drawatstep) { sqrs.push(_.extend({WALKKIND:"walkstep",WALKDISTANCE:distance},pos)); }
	}
	if (def.drawatstop && stopstate !== "outofbounds" && distance++) { sqrs.push(_.extend({WALKKIND:"walkstop",WALKDISTANCE:distance-1},pos)); }
	return _.reduce(sqrs,function(ret,sqr){
		return _.extend(ret,_.object([this.posToYkx(sqr)],[_.extend({DIR:dir,WALKLENGTH: distance-1, WALKSTOPREASON: stopstate},sqr)]));
	},{},this);
};


/* in progress */
Algol.floatFromSquareInDir = function(def,pos,dir,distance,stops,steps,board){
	var to = this.moveInDir(pos,dir,{forward:1},board),
		stop = this.walkCheck(to,distance+1,def.max,stops,steps,board);
	return stop ? {FLOATKIND:"floatstop",FLOATSTOPREASON:stop,FLOATDISTANCE:distance+1} : {FLOATKIND:"floatstep",FLOATDISTANCE:distance+1};
};

Algol.floatFromSquare = function(def,pos,dirs,distance,stops,steps,board,ret){
	ret = ret || {};

};

// €€€€€€€€€€€€€€€€€€€€€€€€€€€ A N A L Y Z E R S €€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€

var jot = function(obj,listname,item){
	obj[listname] = _.unique((obj[listname]||[]).concat([item]));
};

Algol.analyze_game = function(def){
	var rec = {queries:{},generators:{},marks:{}}, ctx = {game:def};
	_.each(def.queries,function(qdef,qname){
		this.analyze_querydef(ctx,qdef,(rec.queries[qname]={}));
	},this);
	_.each(def.generators,function(gdef,gname){
		this.analyze_generator(ctx,gdef,(rec.generators[gname]={}));
	},this);
	_.each(def.marks,function(mdef,mname){
		this.analyze_mark(ctx,mdef,(rec.marks[mname]={}));
	},this);
	return rec;
};

Algol.analyze_mark = function(ctx,def,rec){
	if (!_.isObject(def)) def = {from:def};
	this.analyze_boolean(ctx,def.condition,rec);
	this.analyze_queryref(ctx,def.from,rec);
};

Algol.analyze_querydef = function(ctx,def,rec){
	switch(def[0]){
		case "FILTER":
			jot(rec,"querydeps",def[1]);
			this.analyze_propobj(ctx,def[2],rec);
			//_.each(def[2],function(val){ this.analyze_value(ctx,val,rec); },this);
			break;
		case "MERGE":
			jot(rec,"querydeps",def[1]);
			jot(rec,"querydeps",def[3]);
			break;
		default: throw "Unknown querydef: "+def[0];
	}
};

Algol.analyze_propobj = function(ctx,def,rec){
	if (_.isArray(def)){
		switch(def[0]){
			case "LOOKUPALL":
				this.analyze_queryref(ctx,def[1],rec);
				this.analyze_positionref(ctx,def[2],rec);
				break;
			default: throw "Unknown propobjdef: "+def[0];
		}
	} else _.each(def,function(val){ this.analyze_value(ctx,val,rec); },this);
};

Algol.analyze_generator = function(ctx,def,rec){
	var genctx = _.extend({generatename:true},ctx);
	_.each({
		generatornames:["name","stepname","stopname"],
		positionref: ["frompos"],
		queryref: ["fromquery","stops","steps"],
		value: ["name","stepname","stopname"],
		propobj: ["include"]
	},function(props,key){
		_.each(props,function(n){
			if (def[n]) this["analyze_"+key](genctx,def[n],rec);
		},this);
	},this);
};

Algol.analyze_generatornames = function(ctx,def,rec){
	if (_.isArray(def)){
		switch(def[0]){
			case "IFELSE":
				this.analyze_generatornames(ctx,def[2],rec);
				this.analyze_generatornames(ctx,def[3],rec);
				break;
			case "IF":
			case "UNLESS": this.analyze_generatornames(ctx,def[2],rec); break;
			default: throw "Unknown namegendef: "+JSON.stringify(def);
		}
	} else {
		jot(rec,"generates",def);
	}
};

Algol.analyze_command = function(ctx,def,rec){
	if (_.isArray(def)){
		switch(def[0]){
			case "MOVEUNIT":
				this.analyze_value(ctx,def[1],rec);
				this.analyze_positionref(ctx,def[2],rec);
				break;
			case "KILLUNIT":
			case "TURNUNIT":
				this.analyze_value(ctx,def[1],rec);
				break;
			
			default: throw "Unknown namegendef: "+JSON.stringify(def);
		}
	}
};

Algol.analyze_value = function(ctx,def,rec){
	if (_.isArray(def)){
		switch(def[0]){
			case "TURNVAR": jot(rec,"turnvardeps",def[1]); break;
			case "IDAT": this.analyze_positionref(ctx,def[1],rec); break;
			case "ISNT": this.analyze_value(ctx,def[1],rec); break;
			case "IFELSE":
				this.analyze_boolean(ctx,def[1],rec);
				this.analyze_value(ctx,def[2],rec);
				this.analyze_value(ctx,def[3],rec);
				break;
			case "LOOKUP":
				this.analyze_queryref(ctx,def[1],rec);
				this.analyze_positionref(ctx,def[2],rec);
				break;
			case "IF":
			case "UNLESS":
				this.analyze_boolean(ctx,def[1],rec);
				this.analyze_value(ctx,def[2],rec);
				break;
			case "ARTIFACT": break;
			default: throw "Unknown valuedef: "+JSON.stringify(def);
		}
	}
};

Algol.analyze_boolean = function(ctx,def,rec){
	if (_.isArray(def)){
		switch(def[0]){
			case "NOT": this.analyze_boolean(ctx,def[1],rec); break;
			case "SAME":
			case "DIFFERENT":
				this.analyze_value(ctx,def[1],rec);
				this.analyze_value(ctx,def[2],rec);
				break;
			case "ANYAT":
			case "NONEAT":
				this.analyze_queryref(ctx,def[1],rec);
				this.analyze_positionref(ctx,def[2],rec);
				break;
			case "EMPTY":
			case "NOTEMPTY":
				this.analyze_queryref(ctx,def[1],rec);
				break;
			case "MATCHAT":
				this.analyze_queryref(ctx,def[1],rec);
				this.analyze_positionref(ctx,def[2],rec);
				this.analyze_propobj(ctx,def[3],rec);
				break;
			case "AND":
			case "OR":
				_.each(_.tail(def),function(b){
					this.analyze_boolean(ctx,b,rec);
				},this);
				break;
			case "ONEOF":
				_.each(_.tail(def),function(b){
					this.analyze_value(ctx,b,rec);
				},this);
				break;
			default: throw "Unknown booldef: "+def[0];
		}
	}
};

Algol.analyze_positionref = function(ctx,def,rec){
	if (_.isArray(def)){
		switch(def[0]){
			case "ONLYIN": this.analyze_queryref(ctx,def[1],rec); break;
			case "TURNPOS": jot(rec,"turnposdeps",def[1]); break;
			default: throw "Unknown positiondef: "+def[0];
		}
	} else if (ctx.game.marks[def]){
		jot(rec,"markdeps",def);
	}
};

Algol.analyze_queryref = function(ctx,def,rec){
	jot(rec,"querydeps",def);
};

// --------------------- old analysis

Algol.analyze_generatednames = function(generators){
	return _.unique(_.flatten(_.reduce(generators,function(ret,gendef){
		return ret.concat(_.reduce(["name","stepname","stopname"],function(mem,prop){
			return mem.concat(gendef[prop] ? this.analyze_namesinnamedef(gendef[prop]) : []);
		},[],this));
	},[],this)));
};

Algol.analyze_namesinnamedef = function(ndef){
	var A = this.analyze_namesinnamedef.bind(this);
	return ndef[0]==="IFELSE" ? [A(ndef[2]),A(ndef[3])] : _.contains(["IF","UNLESS"],ndef[0]) ? [A(ndef[2])] : [ndef];
};

Algol.analyze_commandeffects = function(commands){
	return _.reduce(commands,function(ret,cmnd){
		return _.reduce(_.isArray(cmnd)?cmnd:cmnd.effects,function(o,effect){
			return this.analyze_effect(effect,o);
		},ret,this);
	},{},this);
};

Algol.analyze_effect = function(effect,o){
	switch(effect[0]){
		case "SETTURNVAR": o.turnvars = _.uniq((o.turnvars||[]).concat(effect[1])); break;
		case "SETUNITTURNVAR": o.unitturnvars = _.uniq((o.unitturnvars||[]).concat(effect[2])); break;
		case "SETTURNPOS": o.turnpositions = _.uniq((o.turnpositions||[]).concat(effect[1])); break;
		case "CREATETERRAIN": o.spawnsterrain = true;
	}
	return o;
};

// €€€€€€€€€€€€€€€€€€€€€€€€€€€ V A L I D A T O R S €€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€

Algol.validationreporter = function(name){
	name = [].concat(name);
	var rep = function(error,callback){
		if (error){ console.log("Error:",name.join("_"),error);
		} else if (callback) { callback.call(Algol); }
	};
	rep.sub = function(sub){ return Algol.validationreporter(name.concat(sub)); };
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

Algol.validate_game = function(report,ctx,def){
	ctx.game = def;
	ctx.generatednames = this.analyze_generatednames(def.generators);
	ctx.commandeffects = this.analyze_commandeffects(def.commands);
	report.flexobj("generators",ctx,def.generators,"generatorname","generatordef");
	report.flexobj("queries",ctx,def.queries,"customqueryname","customquerydef");
	report.flexobj("marks",ctx,def.marks,"markname","markdef");
	report.flexobj("commands",ctx,def.commands,"commandname","commanddef");
	report.flexobj("endgame",ctx,def.endgame,"endgamename","endgamedef");
	report.fixobj("endturn",ctx,def.endturn,{
		condition: ["boolean"],
		commandcap: "boolean",
		passto: ["player"]
	});
};

Algol.validate_endgamedef = function(report,ctx,def){
	report((!_.isArray(def)||def.length!==2) && "has wrong format",function(){
		this.validate_boolean(report.sub("condition"),ctx,def[0]);
		this.validate_winner(report.sub("winner"),ctx,def[1]);
	});
};

Algol.validate_markdef = function(report,ctx,def){
	if (!_.isObject(def)) def = {from:def};
	report.fixobj(undefined,ctx,def,{
		from: ["queryref"],
		condition: "boolean"
	});
};

Algol.validate_generatordef = function(report,ctx,def){
	ctx = _.extend({generator:(def||{}).type},ctx);
	report(def.frompos && def.fromquery && "has both frompos and fromquery!");
	report(!def.frompos && !def.fromquery && "has neither frompos nor fromquery!");
	report(!_.isArray(def.dirs) && "has no dirs array!",function(){
		_.each(def.dirs,function(dir,n){
			this.validate_dir(report.sub("dir-"+n),ctx,dir);
		}.bind(this));
	});
	report.fixobj(undefined,ctx,def,{
		frompos: "positionref",
		fromquery: "queryref",
		relativeto: "dir",
		include: "propobj"
	},true);
	report(!_.contains(["walker","offset"],def.type) && "has no valid type!",function(){
		this["validate_generator_"+def.type](report,ctx,def);
	});
};

Algol.validate_generator_walker = function(report,ctx,def){
	report(!def.stepname && !def.stopname && "has neither stepname nor stopname!");
	report.fixobj(undefined,ctx,def,{
		max: "int",
		stepname: "generatorname",
		stopname: "generatorname",
		stops: "queryref",
		steps: "queryref"
	},["type","dirs","relativeto","frompos","fromquery","include"]);
};

Algol.validate_generator_offset = function(report,ctx,def){
	report(!def.forward && !def.right && "has neither forward nor right!");
	report.fixobj(undefined,ctx,def,{
		name: ["generatename"],
		forward: "int",
		right: "int"
	},["type","dirs","relativeto","frompos","fromquery","include"]);
};

Algol.validate_customquerydef = function(report,ctx,def){
	report.cmnd(ctx,def,{
		FILTER: ["queryref","matchobj"],
		MERGE: ["queryref","stealobj","queryref","stealobj"]
	},function(){
		// TODO - validate propnames and shit in stealobjs
	});
};

Algol.validate_matchobj = function(report,ctx,def,queryref){
	report(!_.isObject(def) && "wasn't an object",function(){
		_.each(def,function(matcher,name){
			this.validate_matchpropname(report.sub("matchpropname_"+name),ctx,name,queryref);
			this.validate_matchproptest(report.sub("test_"+name),ctx,matcher,queryref,name);
		},this);
	});
};

Algol.validate_matchproptest = function(report,ctx,def){
	if (_.isArray(def)){
		report.cmnd(ctx,def,{
			ISNT: ["matchproptest"],
			TURNVAR: ["turnvarqueryname"],
			IDAT: ["positionref"]
		});
	} else this.validate_value(report,ctx,def);
};

Algol.validate_matchpropname = function(report,ctx,def){
	// TODO: make sure def can be a propname in queryref
};

Algol.validate_boolean = function(report,ctx,def){
	if (def!==true && def!==false){
		report.cmnd(ctx,def,{
			NOT: ["boolean"],
			SAME: ["value","value"],
			DIFFERENT: ["value","value"],
			EMPTY: ["queryref"],
			NOTEMPTY: ["queryref"],
			AND: ["__LISTOF","boolean",2],
			OR: ["__LISTOF","boolean",2],
			ONEOF: ["__LISTOF","value",2],
			ANYAT: ["queryref","positionref"],
			NONEAT: ["queryref","positionref"],
		});
	}
};
//rep.fixobj = function(sub,ctx,obj,map){
Algol.validate_commanddef = function(report,ctx,def){
	if (_.isArray(def)) def = {effects:def};
	report.fixobj(undefined,ctx,def,{condition:"boolean",effects:"effectlist"});
};

Algol.validate_effectlist = function(report,ctx,def){
	report(!_.isArray(def) && "isn't a list!",function(){
		_.each(def,function(edef,n){
			this.validate_effect(report.sub(n),ctx,edef);
		},this);
	});
};

Algol.validate_effect = function(report,ctx,def){
	report.cmnd(ctx,def,{
		MOVEUNIT: ["id","positionref"],
		SETTURNVAR: ["turnvarsetname","value"],
		SETTURNPOS: ["turnpossetname","positionref"],
		CREATETERRAIN: ["positionref","propobj"],
		SETUNITTURNVAR: ["id","unitturnvarsetname","value"],
		SETUNITVAR: ["id","unitvarsetname","value"],
		KILLUNIT: ["id"]
	});
};

Algol.validate_value = function(report,ctx,def){
	if (_.isArray(def)){
		if (def[0]==="ARTIFACT"){
			report(!ctx.generator && "used ARTIFACT outside of generator context!",function(){
				report.cmnd(ctx,def,{ ARTIFACT: ["artifactname"] });
			});
		} else report.cmnd(ctx,def,{
			TURNVAR: ["turnvarqueryname"],
			UNITTURNVAR: ["id","unitturnvarqueryname"],
			SUM: ["__LISTOF","value"],
			IDAT: ["positionref"],
			TURN: ["dir","int"],
			IFELSE: ["boolean","value","value"],
			LOOKUP: ["queryref","positionref","propname"]
		});
	} else if (!((_.isString(def)&&def!==def.toUpperCase())||_.isNumber(def)||_.isBoolean(def))){
		report("has illegal value: "+def);
	}
};

Algol.validate_int = function(report,ctx,def){
	if (_.isArray(def)){
		report.cmnd(ctx,def,{
			IDAT: ["positionref"],
			LOOKUP: ["queryref","positionref","intpropname"]
		});
	}
	// TODO - otherwise!
};

Algol.validate_player = function(report,ctx,def){
	if (_.isArray(def)){
		report.cmnd(ctx,def,{
			IFELSE: ["boolean","player","player"]
		});
	}
	// TODO - otherwise!
};

Algol.validate_generatename = function(report,ctx,def){
	if (_.isArray(def)){
		report.cmnd(ctx,def,{
			IFELSE: ["boolean","generatename","generatename"],
			IF: ["boolean","generatename"],
			UNLESS: ["boolean","generatename"]
		});
	}
};

Algol.validate_artifactname = function(report,ctx,def){
	report(!_.contains({
		"walker": ["dir","originaldir"],
		"offset": ["dir","originaldir"]
	}[ctx.generator] || [],def) && "used unknown artifact "+def+" for "+ctx.generator+" generator");
};


Algol.validate_positionref = function(report,ctx,def){
	if (_.isArray(def)){
		report.cmnd(ctx,def,{
			OFFSET: ["positionref","dir","instruction"],
			ONLYIN: ["queryref"],
			TURNPOS: ["turnposqueryname"]
		});
	} else if (_.contains(["START","TARGET"],def)){
		report(!ctx.generator && "artifact position "+def+" used outside generator context!");	
	} else {
		report(!ctx.game.marks[def] && "has invalid positionref: "+def);
	}
};

Algol.validate_id = function(report,ctx,def){
	if (_.isArray(def)){
		report.cmnd(ctx,def,{
			IDAT: ["positionref"],
			LOOKUP: ["queryref","positionref","idpropname"]
		});
	}
	// TODO - otherwise!
};

Algol.validate_dir = function(report,ctx,def){
	_.isArray(def) ? report.cmnd(ctx,def,{DIRAT:["positionref"]}) : report(!_.contains(_.range(1,9),def) && "has illegal dir "+def); // TODO - allow for shape!
};

Algol.validate_queryref = function(report,ctx,def){
	report(!ctx.game.queries[def] && !_.contains(ctx.generatednames.concat(["UNITS","MYUNITS","OPPUNITS","DEADUNITS","TERRAIN"]),def) && "unknown query ref: "+def);
};

Algol.validate_unitturnvarqueryname = function(report,ctx,def){
	report(!_.contains(ctx.commandeffects.unitturnvars||[],def) && "asks for unitturnvar '"+def+"' which is never set");
};

Algol.validate_turnvarqueryname = function(report,ctx,def){
	report(!_.contains(["CURRENTPLAYER"].concat(ctx.commandeffects.turnvars||[]),def) && "asks for turnvar '"+def+"' which is never set");
};

Algol.validate_turnposqueryname = function(report,ctx,def){
	report(!_.contains(ctx.commandeffects.turnpositions||[],def) && "asks for turnposition '"+def+"' which is never set");
};

Algol.validate_unitvarsetname = function(report,ctx,def){
	report(!_.isString(def) && "uses invalid unitvar name: "+def);
	report(_.contains(["x","y","status"],def) && "uses reserved unitvar name '"+def+"', use specific effects instead!");
};

Algol.validate_unitturnvarsetname = function(report,ctx,def){
	report(!_.isString(def) && "uses invalid unitturnvar name: "+def);
	report(_.contains(["x","y"],def) && "uses reserved unitturnvar name: "+def);	
};

Algol.validate_winner = function(report,ctx,def){};
Algol.validate_intpropname = function(report,ctx,def){};
Algol.validate_idpropname = function(report,ctx,def){};
Algol.validate_propname = function(report,ctx,def){};
Algol.validate_stealobj = function(report,ctx,def){};
Algol.validate_propobj = function(report,ctx,def){};
Algol.validate_unitvarqueryname = function(report,ctx,def){};
Algol.validate_turnpossetname = function(report,ctx,def){};
Algol.validate_turnvarsetname = function(report,ctx,def){};
Algol.validate_commandname = function(report,ctx,def){};
Algol.validate_generatorname = function(report,ctx,def){};
Algol.validate_endgamename = function(report,ctx,def){};
Algol.validate_customqueryname = function(report,ctx,def){};
Algol.validate_markname = function(report,ctx,def){};


// €€€€€€€€€€€€€ E X P O R T €€€€€€€€€€€€€€€€€€€€€€€€€€

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Algol;
  else
    window.Algol = Algol;
})();