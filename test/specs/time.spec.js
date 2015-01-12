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

describe("The time functions",function(){
	describe("The calcPropVal function",function(){
		var cpv = Algol.calcPropVal;
		describe("When called with undefined changes",function(){
			var startval = R(),
				result = cpv(startval);
			it("should return the startval",function(){ expect(result).toEqual(startval); });
		});
		describe("When called with empty changes array",function(){
			var startval = R(),
				result = cpv(startval,[]);
			it("should return the startval",function(){ expect(result).toEqual(startval); });
		});
		describe("When called with time prior to first change",function(){
			var startval = R(),
				time = R(),
				changetime = time+1,
				changeval = R(),
				changes = [[changetime,changeval]],
				result = cpv(startval,changes,time);
			it("should return the startval",function(){ expect(result).toEqual(startval); });
		});
		describe("When called with changes and undefined time",function(){
			var startval = R(),
				changetime = R(),
				changeval = R(),
				changes = [[changetime,changeval]],
				result = cpv(startval,changes,undefined);
			it("should return the last change val",function(){ expect(result).toEqual(changeval); });
		});
		describe("When called with changes and time after last change",function(){
			var startval = R(),
				changetime = R(),
				changeval = R(),
				time = changetime+1,
				changes = [[changetime,changeval]],
				result = cpv(startval,changes,time);
			it("should return the last change val",function(){ expect(result).toEqual(changeval); });
		});
		describe("When called with time prior to first change",function(){
			var startval = R(),
				time = R(),
				changetime = time+1,
				changeval = R(),
				changes = [[changetime,changeval]],
				result = cpv(startval,changes,time);
			it("should return the startval",function(){ expect(result).toEqual(startval); });
		});
		describe("When called with time between changes",function(){
			var startval = R(),
				firstchangetime = R(),
				firstchangeval = R(),
				secondchangetime = firstchangetime+R(),
				secondchangeval = R(),
				time = secondchangetime+R(),
				thirdchangetime = time+R(),
				thirdchangeval = R(),
				changes = [[firstchangetime,firstchangeval],[secondchangetime,secondchangeval],[thirdchangetime,thirdchangeval]],
				result = cpv(startval,changes,time);
			it("should return closest change prior to time",function(){ expect(result).toEqual(secondchangeval); });
		});
	});
	describe("the calcObj func",function(){
		it("is defined",function(){ expect(typeof Algol.calcObj).toEqual("function"); });
		it("should just return startprops if no changes",function(){
			var startprops = _.uniqueId(),
				context = { calcPropVal: sinon.stub() },
				res = Algol.calcObj.call(context,startprops);
			expect(res).toEqual(startprops);
			expect(context.calcPropVal).not.toHaveBeenCalled();
		});
		it("should use calcprop for all in start/change",function(){
			var startprops = {
					prop1: "a",
					prop2: "b"
				},
				propchanges = {
					prop2: "c",
					prop3: "d"
				},
				step = _.uniqueId(),
				retvals = [_.uniqueId(),_.uniqueId(),_.uniqueId()],
				context = { calcPropVal: sinon.spy( SERIES(retvals) ) },
				res = Algol.calcObj.call(context,startprops,propchanges,step);
			expect(res).toEqual({
				prop1: retvals[0],
				prop2: retvals[1],
				prop3: retvals[2]
			});
			expect(context.calcPropVal.callCount).toEqual(3);
			expect(context.calcPropVal.firstCall.args).toEqual([startprops.prop1,propchanges.prop1,step]);
			expect(context.calcPropVal.secondCall.args).toEqual([startprops.prop2,propchanges.prop2,step]);
			expect(context.calcPropVal.thirdCall.args).toEqual([startprops.prop3,propchanges.prop3,step]);
		});
		it("should use fname flag if given",function(){
			var startprops = {
					prop1: "a",
					prop2: "b"
				},
				propchanges = {
					prop2: "c",
					prop3: "d"
				},
				step = _.uniqueId(),
				fname = "somefname",
				context = { somefname: sinon.spy( function(s,c){return s+c;} ) },
				res = Algol.calcObj.call(context,startprops,propchanges,step,fname);
			expect(res).toEqual({
				prop1: "aundefined",
				prop2: "bc",
				prop3: "undefinedd"
			});
			expect(context.somefname.callCount).toEqual(3);
			expect(context.somefname.firstCall.args).toEqual([startprops.prop1,propchanges.prop1,step]);
			expect(context.somefname.secondCall.args).toEqual([startprops.prop2,propchanges.prop2,step]);
			expect(context.somefname.thirdCall.args).toEqual([startprops.prop3,propchanges.prop3,step]);
		});
	});
	describe("the calcColl func",function(){
		it("is defined",function(){ expect(typeof Algol.calcColl).toEqual("function"); });
		describe("when called",function(){
			var startset = _.uniqueId(),
				changeset = _.uniqueId(),
				step = _.uniqueId(),
				retval = _.uniqueId(),
				context = { calcObj: sinon.stub().returns(retval) },
				res = Algol.calcColl.call(context,startset,changeset,step);
			it("should return result from calcObj call",function(){
				expect(res).toEqual(retval);
			});
			it("should use calcObj with special flag",function(){
				expect(context.calcObj).toHaveBeenCalledOnce();
				expect(context.calcObj.firstCall.args).toEqual([startset,changeset,step,"calcObj"]);
			});
		});
		it("should pass integration test",function(){
			var startset = {
					unit1: {x:3,y:0},
					unit2: {x:2,y:1,dir:5}
				},
				step = _.uniqueId(),
				changeset = {
					unit1: {
						y: [[step-1,4]],
						dir: [[step+1,8]]
					},
					unit2: {
						y: [[step-1,3]],
						foo: [[step-1,"bar"]]
					}
				},
				res = Algol.calcColl(startset,changeset,step);
			expect(res).toEqual({
				unit1: {x:3,y:4},
				unit2: {x:2,y:3,dir:5,foo:"bar"}
			});
		});
	});
});