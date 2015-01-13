(function(){
var _ = (typeof require !== "undefined" ? require("./lodashmixins") : window._);
function augmentWithGenerateFunctions(Algol){



// €€€€€€€€€€€€€€€€€€€€€€€€€€€ G E N E R A T O R  F U N C T I O N S €€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€*/




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



// €€€€€€€€€€€€€€€€€€€€€€€€€ E X P O R T €€€€€€€€€€€€€€€€€€€€€€€€€

} // end augmentWithGenerateFunctions

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = augmentWithGenerateFunctions;
else
    window.augmentWithGenerateFunctions = augmentWithGenerateFunctions;

})();