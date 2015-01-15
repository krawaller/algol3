
var Algol = {};
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
	require("./analyze")(Algol);
	require("./board")(Algol);
	require("./generate")(Algol);
	require("./time")(Algol);
	require("./validate")(Algol);
	require("./report")(Algol);
	require("./defaultify")(Algol);
	require("./compile")(Algol);
	require("./evaluate")(Algol);
	require("./flow")(Algol);
	module.exports = Algol;
} else {
	window.augmentWithAnalyzeFunctions(Algol);
	window.augmentWithBoardFunctions(Algol);
	window.augmentWithGenerateFunctions(Algol);
	window.augmentWithTimeFunctions(Algol);
	window.augmentWithValidateFunctions(Algol);
	window.augmentWithReportFunctions(Algol);
	window.augmentWithDefaultifyFunctions(Algol);
	window.augmentWithCompileFunctions(Algol);
	window.augmentWithEvaluateFunctions(Algol);
	window.augmentWithFlowFunctions(Algol);
}