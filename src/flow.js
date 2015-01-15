(function(){
var _ = (typeof require !== "undefined" ? require("./lodashmixins") : window._);
function augmentWithFlowFunctions(Algol){


// €€€€€€€€€€€€€€€€€€€€€€€€€€€ F L O W   F U N C T I O N S €€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€*/

function add(query,pos,unit){
	if (query.data[pos]){
		query.data[pos].push(unit);
	} else {
		query.positions.push(pos);
		query.data[pos] = [unit];
	}
}

Algol.updateContextToNewTurn = function(ctx,plr){
	this.updateTerrainQueries(ctx);
	this.updateUnitQueries(ctx);
};

// updates ALLTERRAIN and TERRAIN. optimise in future. for now should be called when initialising each step
Algol.updateTerrainQueries = function(ctx){
	var q = ctx.queries;
	q.TERRAIN = {positions:[],data:{}};
	q.ALLTERRAIN = {positions:[],data:{}};
	_.each(this.calcColl(ctx.board.terrain,ctx.state.terrainchanges,ctx.step),function(t,ykx){
		add(q.ALLTERRAIN,ykx,t);
		if (t.alive) add(q.TERRAIN,ykx,t);
	});
};

// updates all unit stuff in the queries object. should be called when initialising each step.
Algol.updateUnitQueries = function(ctx){
	var q = ctx.queries, customgroupnames = ctx.setup.customgroupnames;
	_.each(["ALLUNITS","UNITS","PLR1UNITS","PLR2UNITS","DEADUNITS"].concat(customgroupnames),function(n){
		q[n] = {positions:[],data:{}};
	},this);
	_.each(this.calcColl(ctx.setup.units,ctx.state.unitchanges,ctx.step),function(unit){
		var ykx = this.posToYkx(unit);
		unit.ykx = ykx;
		add(q.ALLUNITS,ykx,unit);
		if (unit.alive){
			add(q.UNITS,ykx,unit);
			add(q[["foo","PLR1UNITS","PLR2UNITS"][unit.plr]],ykx,unit);
			_.each(customgroupnames,function(cgn){
				add(q[cgn],ykx,unit);
			},this);
		} else {
			add(q.DEADUNITS,ykx,unit);
		}
	},this);
};


// €€€€€€€€€€€€€€€€€€€€€€€€€ E X P O R T €€€€€€€€€€€€€€€€€€€€€€€€€

} // end augmentWithFlowFunctions

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = augmentWithFlowFunctions;
else
    window.augmentWithFlowFunctions = augmentWithFlowFunctions;

})();