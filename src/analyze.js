(function(){
var _ = (typeof require !== "undefined" ? require("./lodashmixins") : window._);
function augmentWithAnalyzeFunctions(Algol){


// €€€€€€€€€€€€€€€€€€€€€€€€€€€ A N A L Y Z E  F U N C T I O N S €€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€*/




var jot = function(obj,listname,item){
	obj[listname] = _.unique((obj[listname]||[]).concat([item]));
};

Algol.analyze_game = function(def){
	var rec = {queries:{},generators:{},marks:{},commands:{},ids:{},plrgroups:{}}, ctx = {def:def};
	_.each(def.queries,function(qdef,qname){ this.analyze_querydef(ctx,qdef,(rec.queries[qname]={})); },this);
	_.each(def.generators,function(gdef,gname){ this.analyze_generator(ctx,gdef,(rec.generators[gname]={})); },this);
	_.each(def.marks,function(mdef,mname){ this.analyze_mark(ctx,mdef,(rec.marks[mname]={})); },this);
	_.each(def.commands,function(cdef,cname){ this.analyze_command(ctx,cdef,(rec.commands[cname]={})); },this);
	_.each(def.setups,function(cdef,cname){ this.analyze_setupdef(ctx,cdef,rec); },this);
	rec.generatednames = _.uniq(_.compact(_.reduce(rec.generators,function(mem,o){ return mem.concat(o.generates); },[])));
	rec.turnpositions = _.uniq(_.compact(_.reduce(rec.commands,function(mem,o){ return mem.concat(o.setsturnpos); },[])));
	rec.turnvars = _.uniq(_.compact(_.reduce(rec.commands,function(mem,o){ return mem.concat(o.setsturnvar); },[])));
	rec.unitturnvars = _.uniq(_.compact(_.reduce(rec.commands,function(mem,o){ return mem.concat(o.setsunitturnvar); },[])));
	_.each(rec.generatednames,function(n){jot(rec.ids,n,"generatedquery");});
	_.each(rec.turnpositions,function(n){jot(rec.ids,n,"turnpos");});
	_.each(rec.turnvars,function(n){jot(rec.ids,n,"turnvar");});
	_.each(rec.unitturnvars,function(n){jot(rec.ids,n,"unitturnvar");});
	_.each(def.marks,function(def,n){jot(rec.ids,n,"mark");});
	_.each(def.commands,function(def,n){jot(rec.ids,n,"command");});
	_.each(def.queries,function(def,n){jot(rec.ids,n,"query");});
	_.each(def.endgame,function(def,n){jot(rec.ids,n,"endgame");});
	this.analyze_dependencies(def,rec);
	return rec;
};

Algol.analyze_setupdef = function(ctx,def,rec){
	_.each(def,function(unit,id){
		if (unit.group){
			jot(rec.plrgroups,unit.group,id);
			rec.ids[unit.group] = ["plrgroup"];
		}
	},this);
};

Algol.analyze_dependencies = function(def,rec){
	var deps = _.reduce(rec.generators,function(o,agen,gname){
		_.each(agen.generates,function(g){
			o[g] = o[g] || ["genquery",[],[]];
			jot(o[g],1,gname);
		});
		return o;
	},{},this);
	_.each(["queries","generators","marks","commands"],function(t){
		_.each(rec[t],function(itema,itemname){
			deps[itemname] = [t.replace("ies","y").replace(/s$/,""),itema.querydeps||[],itema.markdeps||[]];
		});
	});
	rec.dependencymap = deps;
	_.each(deps,function(data,name){
		data[2] = _.uniq(this.analyze_markdepsforentity(deps,name));
	},this);
};

Algol.analyze_markdepsforentity = function(deps,name){
	return deps[name] ? _.reduce(deps[name][1],function(ret,dep){
		return ret.concat(this.analyze_markdepsforentity(deps,dep));
	},deps[name][2],this) : [];
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
			break;
		case "MERGE":
			jot(rec,"querydeps",def[1]);
			jot(rec,"querydeps",def[3]);
			break;
		case "OVERLAPLEFT":
			jot(rec,"querydeps",def[1]);
			jot(rec,"querydeps",def[2]);
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
	if (_.isArray(def)) def = {effects:def};
	this.analyze_boolean(ctx,def.condition,rec);
	_.each(def.effects,function(e){
		this.analyze_effect(ctx,e,rec);
	},this);
};

Algol.analyze_effect = function(ctx,def,rec){
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
			case "SETUNITVAR":
				this.analyze_value(ctx,def[1],rec);
				this.analyze_value(ctx,def[2],rec);
				break;
			case "SETUNITTURNVAR":
				this.analyze_value(ctx,def[1],rec);
				jot(rec,"setsunitturnvar",def[2]);
				this.analyze_value(ctx,def[3],rec);
				break;
			case "SETTURNPOS":
				jot(rec,"setsturnpos",def[1]);
				this.analyze_positionref(ctx,def[2],rec);
				break;
			case "INCREASETURNVAR":
			case "SETTURNVAR":
				jot(rec,"setsturnvar",def[1]);
				this.analyze_value(ctx,def[2],rec);
				break;
			case "CREATETERRAIN":
				this.analyze_positionref(ctx,def[1],rec);
				this.analyze_propobj(ctx,def[2],rec);
				jot(rec,"createsterrain","yes");
				break;
			default: throw "Unknown effectdef: "+JSON.stringify(def);
		}
	} else throw "Bad effect: "+JSON.stringify(def);
};

Algol.analyze_value = function(ctx,def,rec){
	if (_.isArray(def)){
		switch(def[0]){
			case "TURNVAR": jot(rec,"turnvardeps",def[1]); break;
			case "UNITTURNVAR":
				this.analyze_value(ctx,def[1],rec);
				jot(rec,"turnvardeps",def[2]);
				break;
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
			case "SUM":
				_.each(_.tail(def),function(b){
					this.analyze_value(ctx,b,rec);
				},this);
				break;
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
	} else if (ctx.def.marks[def]){
		jot(rec,"markdeps",def);
	}
};

Algol.analyze_queryref = function(ctx,def,rec){
	jot(rec,"querydeps",def);
};




// €€€€€€€€€€€€€€€€€€€€€€€€€ E X P O R T €€€€€€€€€€€€€€€€€€€€€€€€€

} // end augmentWithAnalyzeFunctions

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = augmentWithAnalyzeFunctions;
else
    window.augmentWithAnalyzeFunctions = augmentWithAnalyzeFunctions;

})();