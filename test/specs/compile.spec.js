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
});