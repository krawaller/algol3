/* jshint jasmine: true */

if (typeof require === 'function' && typeof module === 'object') {
	var sinon = require('sinon'),
		jasmineSinon = require('jasmine-sinon'),
		Algol = require("../../src/"),
		_ = require("../../src/lodashmixins.js");
}
var R = function(){ return parseInt(_.uniqueId(),10); };
var RS = function(howmany){ return _.map(_.range(0,howmany),function(){return R();}); };
var SERIES = function(arr){ var i = 0; return function(){ return arr[i++];}; };

describe("the board functions",function(){

	describe("the neighbours func",function(){
		it("is defined",function(){ expect(typeof Algol.neighbours).toEqual("function"); });
		describe("when used on square board",function(){
			var pos = {x:1,y:1},
				dirs = [1,3,5,7],
				board = {shape:"square"},
				res = Algol.neighbours(pos,dirs,board);
			it("returns correct obj",function(){
				expect(res).toEqual({
					1002: {x:2,y:1,ykx:1002},
					2001: {x:1,y:2,ykx:2001}
				});
			});
		});
	});

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
				[{forward:2,right:1},[ [5,3],[7,7],[6,12],[3,13],[1,9],[2,4] ]],
				[{forward:2,right:-1},[ [3,5],[5,5],[6,8],[5,11],[3,11],[2,8] ]]
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
	});

	describe("the dirRelativeTo",function(){
		it("is defined",function(){ expect(typeof Algol.dirRelativeTo).toEqual("function"); });
		describe("when turning on a rectangle board",function(){
			it("should calc southeast relative to west as northeast",function(){
				expect(Algol.dirRelativeTo(4,7)).toEqual(2);
			});
		});
		describe("when turning on a hex board",function(){
			var board = {shape:"hex"}, tests = [ [1,1,1], [2,1,2], [6,3,2] ];
			_.each(tests,function(test){
				var initial = test[0],
					lookin = test[1],
					expected = test[2];
				it("should correctly answer "+expected+" when starting in "+initial+" and looking in dir "+lookin,function(){
					expect(Algol.dirRelativeTo(initial,lookin,board)).toEqual(expected);
				});
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
		describe("for square boards",function(){
			it("returns correct objs",function(){
				var boarddef = {x:3,y:2,shape:"square"},
					clrs = {1001:{colour:"white",x:1,y:1},1002:{colour:"black",x:2,y:1},1003:{colour:"white",x:3,y:1},
							2001:{colour:"black",x:1,y:2},2002:{colour:"white",x:2,y:2},2003:{colour:"black",x:3,y:2}};
				expect(Algol.generateBoardSquares(boarddef)).toEqual(clrs);
			});
		});
		describe("for hex board",function(){
			describe("when 1;1 exists",function(){
				var boarddef = {x:4,y:8,shape:"hex"},
					clrdata = [
						[1001,"red","red","red",1,1],[2002,"green","green","red",2,2],[1003,"blue","green","blue",3,1],[2004,"red","blue","blue",4,2],
						[3001,"red","green","green",1,3],[4002,"green","blue","green",2,4],[3003,"blue","blue","red",3,3],[4004,"red","red","red",4,4],
						[5001,"red","blue","blue",1,5],[6002,"green","red","blue",2,6],[5003,"blue","red","green",3,5],[6004,"red","green","green",4,6],
						[7001,"red","red","red",1,7],[8002,"green","green","red"],[7003,"blue","green","blue",3,7],[8004,"red","blue","blue",4,8]
					],
					clrs = _.reduce(clrdata,function(memo,data){
						return _.extend(memo,_.object([data[0]],[{
							x: data[4],
							y: data[5],
							columncolour: data[1],
							uphillcolour: data[2],
							downhillcolour: data[3]
						}]));
					},{}),
					result = Algol.generateBoardSquares(boarddef);
				it("contains the expected number of hexes",function(){
					expect(_.keys(result).length).toEqual(_.keys(clrs).length);
				});
				_.each(clrs,function(val,key){
					it("contains hex "+key,function(){
						expect(result.hasOwnProperty(key)).toEqual(true);
					});
					var square = result[key], compto = clrs[key];
					it("painted "+key+" with the correct colors",function(){
						expect([square.columncolour,square.uphillcolour,square.downhillcolour]).toEqual([compto.columncolour,compto.uphillcolour,compto.downhillcolour]);
					});
				});
			});
			describe("when 1;1 doesnt exists",function(){
				var boarddef = {x:4,y:8,shape:"hex",notopleft:true},
					clrdata = [
						[2001,"red","red","red",1,2],[1002,"green","red","blue",2,1],[2003,"blue","green","blue",3,2],[1004,"red","green","green",4,1],
						[4001,"red","green","green",1,4],[3002,"green","green","red",2,3],[4003,"blue","blue","red",3,4],[3004,"red","blue","blue",4,3],
						[6001,"red","blue","blue",1,6],[5002,"green","blue","green",2,5],[6003,"blue","red","green",3,6],[5004,"red","red","red",4,5],
						[8001,"red","red","red",1,8],[7002,"green","red","blue",1,8],[8003,"blue","green","blue",3,8],[7004,"red","green","green",4,7]
					],
					clrs = _.reduce(clrdata,function(memo,data){
						return _.extend(memo,_.object([data[0]],[{
							x: data[4],
							y: data[5],
							columncolour: data[1],
							uphillcolour: data[2],
							downhillcolour: data[3]
						}]));
					},{}),
					result = Algol.generateBoardSquares(boarddef);
				it("contains the expected number of hexes",function(){
					expect(_.keys(result).length).toEqual(_.keys(clrs).length);
				});
				_.each(clrs,function(val,key){
					it("contains hex "+key,function(){
						expect(result.hasOwnProperty(key)).toEqual(true);
					});
					var square = result[key], compto = clrs[key];
					it("painted "+key+" with the correct colors",function(){
						expect([square.columncolour,square.uphillcolour,square.downhillcolour]).toEqual([compto.columncolour,compto.uphillcolour,compto.downhillcolour]);
					});
				});
			});
		});
	});
});