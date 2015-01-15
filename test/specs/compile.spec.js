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

var c = Algol.constants;

describe("the compile functions",function(){
	describe("the compileValue func",function(){
		it("is defined",function(){ expect(typeof Algol.compileValue).toEqual("function"); });
		describe("when called with primitives",function(){
			var val = R(),
				expected = [c.RAW,val],
				ctx = {},
				res = Algol.compileValue(ctx,val);
			it("returns value wrapped in raw",function(){
				expect(res).toEqual(expected);
			});
		});
		describe("when called with CURRENTPLAYER",function(){
			var val = "CURRENTPLAYER",
				ctx = {compFor:R()},
				expected = [c.RAW,ctx.compFor],
				res = Algol.compileValue(ctx,val);
			it("returns ctx.compFor wrapped in raw",function(){
				expect(res).toEqual(expected);
			});
		});
	});
	describe("the compileBoolean func",function(){
		it("is defined",function(){ expect(typeof Algol.compileBoolean).toEqual("function"); });
		describe("when called with true",function(){
			var expected = [c.TRUE],
				ctx = {},
				val = true,
				res = Algol.compileBoolean(ctx,val);
			it("returns constant true",function(){ expect(res).toEqual(expected); });
		});
		describe("when called with false",function(){
			var expected = [c.FALSE],
				ctx = {},
				val = false,
				res = Algol.compileBoolean(ctx,val);
			it("returns constant false",function(){ expect(res).toEqual(expected); });
		});
	});
	describe("the compileQueryref func",function(){
		it("is defined",function(){ expect(typeof Algol.compileQueryref).toEqual("function"); });
		describe("when called with MYUNITS for plr 1",function(){
			var expected = [c.PLR1UNITS],
				ctx = {compFor:1},
				val = "MYUNITS",
				res = Algol.compileQueryref(ctx,val);
			it("returns PLR1UNITS",function(){ expect(res).toEqual(expected); });
		});
		describe("when called with MYUNITS for plr 2",function(){
			var expected = [c.PLR2UNITS],
				ctx = {compFor:2},
				val = "MYUNITS",
				res = Algol.compileQueryref(ctx,val);
			it("returns PLR2UNITS",function(){ expect(res).toEqual(expected); });
		});
		describe("when called with OPPUNITS for plr 1",function(){
			var expected = [c.PLR2UNITS],
				ctx = {compFor:1,compNext:2},
				val = "OPPUNITS",
				res = Algol.compileQueryref(ctx,val);
			it("returns PLR2UNITS",function(){ expect(res).toEqual(expected); });
		});
		describe("when called with OPPUNITS for plr 2",function(){
			var expected = [c.PLR1UNITS],
				ctx = {compFor:2,compNext:1},
				val = "OPPUNITS",
				res = Algol.compileQueryref(ctx,val);
			it("returns PLR1UNITS",function(){ expect(res).toEqual(expected); });
		});
	});
	describe("the compilePositionref func",function(){
		describe("when called with MARKREF",function(){
			var expected = [c.MARKPOS,"foo"],
				ctx = {def:{marks:{foo:1}}},
				val = "foo",
				res = Algol.compilePositionref(ctx,val);
			it("returns MARKREF",function(){ expect(res).toEqual(expected); });
		});
	});
	describe("the compileSetup func",function(){
		var setup = [{x:1,y:1,plr:1,group:"foo"},{x:2,y:2,plr:2}];
		var context = {posToYkx:Algol.posToYkx};
		var expected = {
			groups: {
				PLR1UNITS: [0],
				PLR2UNITS: [1],
				NONPLR1UNITS: [1],
				NONPLR2UNITS: [0],
				foo: [0]
			},
			start: [{x:1,y:1,plr:1,group:"foo",id:0,ykx:1001},{x:2,y:2,plr:2,id:1,ykx:2002}]
		};
		var res = Algol.compileSetup(context,setup);
		it("compiles correctly",function(){ expect(res).toEqual(expected); });
	});
});