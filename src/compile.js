(function(){
var _ = (typeof require !== "undefined" ? require("./lodashmixins") : window._);
function augmentWithCompileFunctions(Algol){


// €€€€€€€€€€€€€€€€€€€€€€€€€€€ R E P O R T E R  F U N C T I O N S €€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€*/

Algol.compileBoardsDef = function(boards){
	return _.isArray(boards) ? this.compileBoardsDef({standard:boards}) : _.mapValues(boards,this.compileBoardDef,this);
};

Algol.compileBoardDef = function(board){
	if (_.isArray(board)) board = {width:board[0],height:board[1]};
	if (board.size){
		board.width=board.size[0];
		board.height=board.size[1];
	}
	return _.extend({shape:"square",terrain:[]},board);
};

Algol.compileSetupsDef = function(setups){
	return _.isArray(setups) ? this.compileSetupsDef({standard:setups}) : _.mapValues(setups,this.compileSetupDef,this);
};

Algol.compileSetupDef = function(setup){
	return setup;
};

// €€€€€€€€€€€€€€€€€€€€€€€€€ E X P O R T €€€€€€€€€€€€€€€€€€€€€€€€€

} // end augmentWithCompileFunctions

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = augmentWithCompileFunctions;
else
    window.augmentWithCompileFunctions = augmentWithCompileFunctions;

})();