(function(){
var _ = (typeof require !== "undefined" ? require("./lodashmixins") : window._);
function augmentWithValidateFunctions(Algol){


// €€€€€€€€€€€€€€€€€€€€€€€€€€€ V A L I D A T E   F U N C T I O N S €€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€*/


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

Algol.validate_game = function(report,ctx,def){
	ctx.game = def;
	ctx.A = this.analyze_game(def);
	this.validate_ids(report,ctx,ctx.A.ids);
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

Algol.validate_ids = function(report,ctx,def){
	_.each(def,function(usedfor,n){
		report(usedfor.length>1 && "Identifiers should be unique, but '"+n+"' is used for: "+usedfor.join(", "));
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
		INCREASETURNVAR: ["turnvarsetname","value"],
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
	report(!ctx.game.queries[def] && !_.contains(ctx.A.generatednames.concat(["UNITS","MYUNITS","OPPUNITS","DEADUNITS","TERRAIN"]),def) && "unknown query ref: "+def);
};

Algol.validate_unitturnvarqueryname = function(report,ctx,def){
	report(!_.contains(ctx.A.unitturnvars||[],def) && "asks for unitturnvar '"+def+"' which is never set");
};

Algol.validate_turnvarqueryname = function(report,ctx,def){
	report(!_.contains(["CURRENTPLAYER"].concat(ctx.A.turnvars||[]),def) && "asks for turnvar '"+def+"' which is never set");
};

Algol.validate_turnposqueryname = function(report,ctx,def){
	report(!_.contains(ctx.A.turnpositions||[],def) && "asks for turnposition '"+def+"' which is never set");
};

Algol.validate_unitvarsetname = function(report,ctx,def){
	report(!_.isString(def) && "uses invalid unitvar name: "+def);
	report(_.contains(["x","y","status"],def) && "uses reserved unitvar name '"+def+"', use specific effects instead!");
};

Algol.validate_unitturnvarsetname = function(report,ctx,def){
	report(!_.isString(def) && "uses invalid unitturnvar name: "+def);
	report(_.contains(["x","y"],def) && "uses reserved unitturnvar name: "+def);	
};

Algol.validate_winner = function(){};
Algol.validate_intpropname = function(){};
Algol.validate_idpropname = function(){};
Algol.validate_propname = function(){};
Algol.validate_stealobj = function(){};
Algol.validate_propobj = function(){};
Algol.validate_unitvarqueryname = function(){};
Algol.validate_turnpossetname = function(){};
Algol.validate_turnvarsetname = function(){};
Algol.validate_commandname = function(){};
Algol.validate_generatorname = function(){};
Algol.validate_endgamename = function(){};
Algol.validate_customqueryname = function(){};
Algol.validate_markname = function(){};


// €€€€€€€€€€€€€€€€€€€€€€€€€ E X P O R T €€€€€€€€€€€€€€€€€€€€€€€€€

} // end augmentWithValidateFunctions

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = augmentWithValidateFunctions;
else
    window.augmentWithValidateFunctions = augmentWithValidateFunctions;

})();