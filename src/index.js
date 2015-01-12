
var Algol = {};
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
	require("./analyze")(Algol);
	require("./board")(Algol);
	require("./generator")(Algol);
	require("./time")(Algol);
	require("./validate")(Algol);
	module.exports = Algol;
} else {
	var Algol = {};
	window.augmentWithAnalyzerFunctions(Algol);
	window.augmentWithBoardFunctions(Algol);
	window.augmentWithGeneratorFunctions(Algol);
	window.augmentWithTimeFunctions(Algol);
	window.augmentWithValidateFunctions(Algol);
}