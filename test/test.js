// manual node tests

var Algol = require("../algol"),
	amazon = require("../games/amazon.json"),
	archers = require("../games/archers.json"),
	daggers = require("../games/daggers.json"),
	_ = require('lodash');

Algol.validate_game(Algol.validationreporter("amazon"),{},amazon);
Algol.validate_game(Algol.validationreporter("archers"),{},archers);
Algol.validate_game(Algol.validationreporter("daggers"),{},daggers);

var a = Algol.analyze_game(daggers);
console.log("---QUERIES----");
_.each(a.queries,function(val,key){
	console.log(key,val);
});
console.log("---GENERATORS----");
_.each(a.generators,function(val,key){
	console.log(key,val);
});
console.log("---MARKS----");
_.each(a.marks,function(val,key){
	console.log(key,val);
});