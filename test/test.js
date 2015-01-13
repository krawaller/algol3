// manual node tests

var Algol = require("../src/"),
	amazons = require("../games/amazons.json"),
	archers = require("../games/archers.json"),
	daggers = require("../games/daggers.json"),
	_ = require('lodash');

Algol.validate_game(Algol.reporter("amazons"),{},amazons);
Algol.validate_game(Algol.reporter("archers"),{},archers);
Algol.validate_game(Algol.reporter("daggers"),{},daggers);

var a = Algol.analyze_game(amazons);
_.each(a,function(o,kind){
	console.log("-------",kind,"--------");
	_.each(o,function(val,key){
		console.log(key,val);
	});
});
