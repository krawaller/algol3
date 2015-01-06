(function(){

var Algol = {},
	_ = (typeof require !== "undefined" ? require("./lodashmixins") : window._);

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


// €€€€€€€€€€€€€ EXPORTS

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Algol;
  else
    window.Algol = Algol;
})();