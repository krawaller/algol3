(function(){
var _ = (typeof require !== "undefined" ? require("./lodashmixins") : window._);
function augmentWithaultifyFunctions(Algol){


// €€€€€€€€€€€€€€€€€€€€€€€€€€€ C O M P I L E  F U N C T I O N S €€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€*/

Algol.defaultifyGame = function(game){
	return _.extend(game,{
		boards: this.defaultifyBoards(game.boards),
		endturn: this.defaultifyEndturn(game.endturn),
		setups: this.defaultifySetups(game.setups),
		commands: _.mapValues(game.commands,function(q){return this.defaultifyCommand(q);},this),
		marks: _.mapValues(game.marks,function(q){return this.defaultifyMark(q);},this)
	});
};

Algol.defaultifyMark = function(mark){
	return _.isString(mark) ? {from:mark} : mark;
};

Algol.defaultifyCommand = function(cmnd){
	return _.isArray(cmnd) ? {effects:cmnd} : cmnd;
};

Algol.defaultifyBoards = function(boards){
	return _.isArray(boards) ? this.defaultifyBoards({standard:boards}) : _.mapValues(boards,this.defaultifyBoard,this);
};

Algol.defaultifyBoard = function(board){
	if (_.isArray(board)) board = {width:board[0],height:board[1]};
	if (board.size){
		board.width=board.size[0];
		board.height=board.size[1];
	}
	return _.extend({shape:"square",terrain:[]},board);
};

Algol.defaultifySetups = function(setups){
	return _.isArray(setups) ? this.defaultifySetups({standard:setups}) : _.mapValues(setups,this.defaultifySetup,this);
};

Algol.defaultifySetup = function(setup){
	return setup;
};

Algol.defaultifyEndturn = function(endturn){
	return _.extend({passto:"NEXTPLAYER"},endturn);
};

// €€€€€€€€€€€€€€€€€€€€€€€€€ E X P O R T €€€€€€€€€€€€€€€€€€€€€€€€€

} // end augmentWithaultifyFunctions

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = augmentWithaultifyFunctions;
else
    window.augmentWithaultifyFunctions = augmentWithaultifyFunctions;

})();