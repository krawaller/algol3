(function(){
var _ = (typeof require !== "undefined" ? require("./lodashmixins") : window._);
function augmentWithBoardFunctions(Algol){




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


// €€€€€€€€€€€€€€€€€€€€€€€€€ E X P O R T €€€€€€€€€€€€€€€€€€€€€€€€€

} // end augmentWithBoardFunctions

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = augmentWithBoardFunctions;
else
    window.augmentWithBoardFunctions = augmentWithBoardFunctions;

})();