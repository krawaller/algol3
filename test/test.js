// manual node tests

var Algol = require("../algol"),
	amazon = require("../games/amazon.json"),
	archers = require("../games/archers.json"),
	daggers = require("../games/daggers.json");

Algol.validate_game(Algol.validationreporter("amazon"),{},amazon);
Algol.validate_game(Algol.validationreporter("archers"),{},archers);
Algol.validate_game(Algol.validationreporter("daggers"),{},daggers);

//console.log(Algol.analyze_commandeffects(daggers.commands));