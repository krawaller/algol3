(function(){
var _ = (typeof require !== "undefined" ? require("./lodashmixins") : window._);
function augmentWithDefaultifyFunctions(Algol){


// €€€€€€€€€€€€€€€€€€€€€€€€€€€ C O M P I L E  F U N C T I O N S €€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€*/

Algol.defaultifyBoardsDef = function(boards){
	return _.isArray(boards) ? this.defaultifyBoardsDef({standard:boards}) : _.mapValues(boards,this.defaultifyBoardDef,this);
};

Algol.defaultifyBoardDef = function(board){
	if (_.isArray(board)) board = {width:board[0],height:board[1]};
	if (board.size){
		board.width=board.size[0];
		board.height=board.size[1];
	}
	return _.extend({shape:"square",terrain:[]},board);
};

Algol.defaultifySetupsDef = function(setups){
	return _.isArray(setups) ? this.defaultifySetupsDef({standard:setups}) : _.mapValues(setups,this.defaultifySetupDef,this);
};

Algol.defaultifySetupDef = function(setup){
	return setup;
};

Algol.defaultifyEndturn = function(endturn){
	return _.extend({passto:"NEXTPLAYER"},board);
}

// €€€€€€€€€€€€€€€€€€€€€€€€€ E X P O R T €€€€€€€€€€€€€€€€€€€€€€€€€

} // end augmentWithDefaultifyFunctions

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = augmentWithDefaultifyFunctions;
else
    window.augmentWithDefaultifyFunctions = augmentWithDefaultifyFunctions;

})();