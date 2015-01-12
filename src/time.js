(function(){
var _ = (typeof require !== "undefined" ? require("./lodashmixins") : window._);
function augmentWithTimeFunctions(Algol){




/**
 * Calculates property state at a given time according to startvalue and changes
 * @param {Number|String} startvalue
 * @param {Array} changes List of changes, each change is [step,value]
 * @param {Number} step
 * @return {Number|String} Value at given time
 */
Algol.calcPropVal = function(startvalue,changes,step){
	if (!changes || !changes.length ){ return startvalue; } // no change, return startval
	if ((!step) || step > changes[changes.length-1][0]){ return changes[changes.length-1][1]; } // no time given or time after last change, return last change value
	if (step < changes[0][0]){ return startvalue; } // time prior to first change, return start val
	return _.find(changes.slice().reverse(),function(change){ return change[0] <= step; })[1]; // last change val before step
};


/**
 * Calculates startvalues and changes for a single object into a given time state
 * Used only by calcCollection
 * @param {Object} startproperties Starting object
 * @param {Object} changes Per property changes
 * @param {Number} step Which step to calculate to
 * @param {String} fname internal shit
 * @return {Object} Stepstate object
 */
Algol.calcObj = function(starts,changes,step,fname){
	return !changes ? starts : _.reduce(_.union(_.keys(starts||{}),_.keys(changes)),function(memo,key){
		return _.extend(_.object([key],[this[fname||"calcPropVal"]((starts||{})[key],changes[key],step)]),memo);
	},{},this);
};


/**
 * Calculates startvalues and changes for a collection of objects into a given time state
 * @param {Object} starts Collection of starting objects
 * @param {Object} changes Collection of per object changes
 * @param {Number} step Which step to calculate to
 * @return {Object} Collection of Stepstate object
 */
Algol.calcColl = function(starts,changes,step){ return this.calcObj(starts,changes,step,"calcObj");};





// €€€€€€€€€€€€€€€€€€€€€€€€€ E X P O R T €€€€€€€€€€€€€€€€€€€€€€€€€

} // end augmentWithBoard

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = augmentWithTimeFunctions;
else
    window.augmentWithTimeFunctions = augmentWithTimeFunctions;

})();