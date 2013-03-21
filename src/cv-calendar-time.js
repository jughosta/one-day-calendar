/**
 * CalendarView
 * @author JuliaRechkunova
 * @namespace
 */
window.calendarView = window.calendarView || {};
calendarView.config = calendarView.config || {};

/**
 * Time period config
 * @type {Object}
 */
calendarView.config.timePeriod = {
	startTime: 9,
	startPeriod: 'am',
	endTime: 9,
	endPeriod: 'pm'
};

/**
 * Set of times
 * @type {Array.<Object>}
 */
calendarView.timesSet = (function (timePeriodParams) {

	/**
	 * Time builder
	 * @constructor
	 */
	var TimeBuilder = function () {

	};

	/**
	 * Build times set
	 * @param {number} startTime
	 * @param {string} startPeriod
	 * @param {number} endTime
	 * @param {string} endPeriod
	 * @return {Array.<Object>}
	 */
	TimeBuilder.prototype.buildTimesSet = function (startTime, startPeriod, endTime, endPeriod) {
		var times = [],
			lastHour = (startPeriod != endPeriod)? endTime + 12 : endTime;
		for (var i = startTime; i <= lastHour; i++) {
			times.push({
				hour: (i > 12)? i - 12 : i,
				period: (i > 12)? endPeriod : startPeriod
			});
		}
		return times;
	};

	return (new TimeBuilder()).buildTimesSet(
		timePeriodParams.startTime,
		timePeriodParams.startPeriod,
		timePeriodParams.endTime,
		timePeriodParams.endPeriod
	);

})(calendarView.config.timePeriod);
