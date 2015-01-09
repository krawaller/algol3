// manual node tests

var Algol = require("../algol"),
	amazon = require("../games/amazon.json"),
	archers = require("../games/archers.json"),
	daggers = require("../games/daggers.json"),
	_ = require('lodash');

Algol.validate_game(Algol.validationreporter("amazon"),{},amazon);
Algol.validate_game(Algol.validationreporter("archers"),{},archers);
Algol.validate_game(Algol.validationreporter("daggers"),{},daggers);

var a = Algol.analyze_game(amazon);
_.each(a,function(o,kind){
	console.log("-------",kind,"--------");
	_.each(o,function(val,key){
		console.log(key,val);
	});
});
