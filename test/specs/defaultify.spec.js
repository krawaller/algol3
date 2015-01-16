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

describe("The defaultify functions",function(){
	describe("The defaultifyBoards function",function(){
		describe("when used on Amazons boards def",function(){
			var result = Algol.defaultifyBoards([8,10]),
				expected = {
					standard: {
						shape: "square",
						width: 8,
						height: 10,
						terrain: []
					}
				};
			it("should return correct val",function(){ expect(result).toEqual(expected); });
		});
	});
	describe("The defaultifySetups function",function(){
		describe("when used on Amazons style setups def",function(){
			var result = Algol.defaultifySetups([{"x":4,"y":1,"plr":1}]),
				expected = { standard: [{"x":4,"y":1,"plr":1}] };
			it("should return correct val",function(){ expect(result).toEqual(expected); });
		});
	});
});