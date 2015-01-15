/* jshint jasmine: true */

if (typeof require === 'function' && typeof module === 'object') {
	var sinon = require('sinon'),
		jasmineSinon = require('jasmine-sinon'),
		Algol = require("../../src/"),
		_ = require("../../src/lodashmixins.js");
}
var R = function(){ return parseInt(_.uniqueId(),10); },
	SERIES = function(arr){
	var i = 0;
	return function(){ return arr[i++];};
};

var c = Algol.constants;

describe("The evaluate functions",function(){
	describe("The evaluateBoolean function",function(){
		describe("when called with TRUE",function(){
			var input = [c.TRUE],
				ctx = {},
				result = Algol.evaluateBoolean(ctx,input),
				expected = true;
			it("should return true",function(){ expect(result).toEqual(expected); });
		});
		describe("when called with FALSE",function(){
			var input = [c.FALSE],
				ctx = {},
				result = Algol.evaluateBoolean(ctx,input),
				expected = false;
			it("should return false",function(){ expect(result).toEqual(expected); });
		});
		describe("the NOT command",function(){
			describe("when called with true",function(){
				var input = [c.NOT,[c.TRUE]],
					ctx = {},
					result = Algol.evaluateBoolean(ctx,input),
					expected = false;
				it("should return false",function(){ expect(result).toEqual(expected); });
			});
		});
		describe("the AND command",function(){
			describe("when called with all true",function(){
				var input = [c.AND,[c.TRUE],[c.TRUE],[c.TRUE]],
					ctx = {},
					result = Algol.evaluateBoolean(ctx,input),
					expected = true;
				it("should return true",function(){ expect(result).toEqual(expected); });
			});
			describe("when called with one false",function(){
				var input = [c.AND,[c.TRUE],[c.FALSE],[c.TRUE]],
					ctx = {},
					result = Algol.evaluateBoolean(ctx,input),
					expected = false;
				it("should return false",function(){ expect(result).toEqual(expected); });
			});
		});
		describe("the OR command",function(){
			describe("when called with all false",function(){
				var input = [c.OR,[c.FALSE],[c.FALSE],[c.FALSE]],
					ctx = {},
					result = Algol.evaluateBoolean(ctx,input),
					expected = false;
				it("should return false",function(){ expect(result).toEqual(expected); });
			});
			describe("when called with one true",function(){
				var input = [c.OR,[c.TRUE],[c.FALSE],[c.TRUE]],
					ctx = {},
					result = Algol.evaluateBoolean(ctx,input),
					expected = true;
				it("should return true",function(){ expect(result).toEqual(expected); });
			});
		});
		describe("the ONEOF command",function(){
			describe("when needle isn't in list",function(){
				var input = [c.ONEOF,2,3,4],
					ctx = {},
					result = Algol.evaluateBoolean(ctx,input),
					expected = false;
				it("should return false",function(){ expect(result).toEqual(expected); });
			});
			describe("when needle is in list",function(){
				var input = [c.ONEOF,2,2,3],
					ctx = {},
					result = Algol.evaluateBoolean(ctx,input),
					expected = true;
				it("should return true",function(){ expect(result).toEqual(expected); });
			});
		});
		describe("the SAME command",function(){
			describe("when called with different values",function(){
				var input = [c.SAME,[c.RAW,2],[c.RAW,3]],
					ctx = {},
					result = Algol.evaluateBoolean(ctx,input),
					expected = false;
				it("should return false",function(){ expect(result).toEqual(expected); });
			});
			describe("when called with same values",function(){
				var input = [c.SAME,[c.RAW,3],[c.RAW,3]],
					ctx = {},
					result = Algol.evaluateBoolean(ctx,input),
					expected = true;
				it("should return true",function(){ expect(result).toEqual(expected); });
			});
		});
		describe("the DIFFERENT command",function(){
			describe("when called with different values",function(){
				var input = [c.DIFFERENT,[c.RAW,2],[c.RAW,3]],
					ctx = {},
					result = Algol.evaluateBoolean(ctx,input),
					expected = true;
				it("should return true",function(){ expect(result).toEqual(expected); });
			});
			describe("when called with same values",function(){
				var input = [c.DIFFERENT,[c.RAW,3],[c.RAW,3]],
					ctx = {},
					result = Algol.evaluateBoolean(ctx,input),
					expected = false;
				it("should return false",function(){ expect(result).toEqual(expected); });
			});
		});
	});
	describe("The evaluateValue function",function(){
		describe("when evaluating RAW",function(){
			var input = [c.RAW,R()],
				ctx = {},
				result = Algol.evaluateValue(ctx,input),
				expected = input[1];
			it("should return raw value",function(){ expect(result).toEqual(expected); });
		});
		describe("when evaluating ARTIFACT",function(){
			var artifact = {foo:R()},
				input = [c.ARTIFACT,"foo"],
				ctx = {artifact:artifact},
				result = Algol.evaluateValue(ctx,input),
				expected = artifact.foo;
			it("should return requested value from artifact",function(){ expect(result).toEqual(expected); });
		});
		describe("when evaluating TURNVAR",function(){
			var turn = {var:{foo:R()}},
				input = [c.TURNVAR,"foo"],
				ctx = {turn:turn},
				result = Algol.evaluateValue(ctx,input),
				expected = turn.var.foo;
			it("should return requested value from artifact",function(){ expect(result).toEqual(expected); });
		});
	});
});