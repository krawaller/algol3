if (typeof require === 'function' && typeof module === 'object') {
	var sinon = require('sinon'),
		jasmineSinon = require('jasmine-sinon'),
		Algol = require("../../algol.js"),
		_ = require("../../lodashmixins.js");
}
R = function(){ return parseInt(_.uniqueId(),10); };
RS = function(howmany){ return _.map(_.range(0,howmany),function(){return R();}); };
SERIES = function(arr){ var i = 0; return function(){ return arr[i++];}; };

describe("the board functions",function(){

	describe("the moveInDir",function(){
		it("is defined",function(){ expect(typeof Algol.moveInDir).toEqual("function"); });
		it("should include posToYkx in the result",function(){
			var position = {x:3,y:4},
				dir = 3,
				instruction = { forward: 4, right: 1 },
				ykx = R(),
				context = {posToYkx:sinon.stub().returns(ykx)},
				res = Algol.moveInDir.call(context,position,dir,instruction);
			expect(res.ykx).toEqual(ykx);
			expect(context.posToYkx).toHaveBeenCalledOnce();
			expect(context.posToYkx.firstCall.args).toEqual([{x:7,y:5}]);
		});
		var sets = [
			["square",{x:5,y:5},[
				[{forward:2,right:1},[ [6,3],[8,4],[7,6],[6,8],[4,7],[2,6],[3,4],[4,2] ]]
			]],
			["hex",{x:4,y:8},[
				[{forward:2,right:1},[ [5,3],[7,7],[6,12],[3,13],[1,9],[2,4] ]]
			]]
		];
		_.each(sets,function(set){
			var shape=set[0], board = {shape:shape}, start = set[1], tests = set[2];
			describe("when moving from ["+start.x+";"+start.y+"] on a "+shape+" board",function(){
				_.each(tests,function(test){
					var instruction = test[0], dirtargets = test[1];
					describe("when heading "+instruction.forward+" forward and "+instruction.right+" right",function(){
						_.each(dirtargets,function(dirtarget,n){
							var dir = n+1;
							describe("in direction "+dir,function(){
								var result = Algol.moveInDir(start,dir,instruction,board);
								it("should land on expected x coordinate",function(){
									expect(result.x).toEqual(dirtarget[0]);
								});
								it("should land on expected y coordinate",function(){
									expect(result.y).toEqual(dirtarget[1]);
								});
							});
						});
					});
				});
			});
		});
		describe("when moving on a rectangle board",function(){
			var start = {x:5,y:5}, instruction = {forward:2,right:1}, tests = [
				[6,3],[8,4],[7,6],[6,8],[4,7],[2,6],[3,4],[4,2]
			];
			_.each(tests,function(test,n){
				var result = Algol.moveInDir(start,n+1,instruction);
				it("should land on right x when walking in dir "+(n+1),function(){
					expect(result.x).toEqual(test[0]);
				});
				it("should land on right y when walking in dir "+(n+1),function(){
					expect(result.y).toEqual(test[1]);
				});
			});
		});
		describe("when moving on a hex board",function(){
			var start = {x:4,y:8}, board = {shape:"hex"};
			describe("with a positive right value",function(){
				var instruction = {forward:2,right:1}, tests = [
					[5,3],[7,7],[6,12],[3,13],[1,9],[2,4]
				];
				_.each(tests,function(test,n){
					var result = Algol.moveInDir(start,n+1,instruction,board);
					it("should land on right x when walking in dir "+(n+1),function(){
						expect(result.x).toEqual(test[0]);
					});
					it("should land on right y when walking in dir "+(n+1),function(){
						expect(result.y).toEqual(test[1]);
					});
				});
			});
		});
	});

	describe("the dirRelativeTo",function(){
		it("is defined",function(){ expect(typeof Algol.dirRelativeTo).toEqual("function"); });
		describe("when turning on a rectangle board",function(){
			it("should calc southeast relative to west as northeast",function(){
				expect(Algol.dirRelativeTo(4,7)).toEqual(2);
			});
		});
	});

	describe("the outOfBounds",function(){
		it("is defined",function(){ expect(typeof Algol.outOfBounds).toEqual("function"); });
		describe("when testing on a rectangle board",function(){
			var board = {x:5,y:5,shape:"rectangle"};
			it("warns when outside",function(){
				[{x:0,y:1},{y:0,x:1},{x:666,y:1},{x:1,y:666}].forEach(function(outside){
					expect(Algol.outOfBounds(outside,board)).toEqual(true);
				});
			});
			it("returns false when not outside",function(){
				[{x:1,y:5},{y:5,x:1},{x:1,y:1},{x:5,y:5},{x:3,y:3}].forEach(function(outside){
					expect(Algol.outOfBounds(outside,board)).toEqual(false);
				});
			});
		});
	});

	describe("the posToYkx function",function(){
		it("is defined",function(){ expect(typeof Algol.posToYkx).toEqual("function"); });
		it("returns correct val",function(){
			expect(Algol.posToYkx({x:4,y:3})).toEqual(3004);
		});
	});

	describe("the posToYkx function",function(){
		it("is defined",function(){ expect(typeof Algol.posToYkx).toEqual("function"); });
		it("returns correct val",function(){ expect(Algol.posToYkx({x:4,y:3})).toEqual(3004); });
	});

	describe("the ykxToPos function",function(){
		it("is defined",function(){ expect(typeof Algol.ykxToPos).toEqual("function"); });
		it("returns correct val",function(){ expect(Algol.ykxToPos(3004)).toEqual({x:4,y:3,ykx:3004}); });
	});

	describe("the generateBoardSquares function",function(){
		it("is defined",function(){ expect(typeof Algol.generateBoardSquares).toEqual("function"); });
		it("returns correct objs",function(){
			var boarddef = {x:3,y:2,shape:"rectangle"},
				clrs = {1001:{colour:"white",x:1,y:1},1002:{colour:"black",x:2,y:1},1003:{colour:"white",x:3,y:1},
						2001:{colour:"black",x:1,y:2},2002:{colour:"white",x:2,y:2},2003:{colour:"black",x:3,y:2}};
			expect(Algol.generateBoardSquares(boarddef)).toEqual(clrs);
		});
	});
});