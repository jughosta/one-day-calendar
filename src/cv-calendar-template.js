/**
 * CalendarView
 * @author JuliaRechkunova
 * @namespace
 */
window.calendarView = window.calendarView || {};
calendarView.config = calendarView.config || {};

calendarView.config.templates = {
	timeBlock: '<div class="calendarTimeBlock">{timeBlock}</div>',
	hour: '<div class="calendarTimeHour">'
		+ '<span class="calendarTime">{hour}:00</span>&nbsp;'
		+ '<span class="calendarTimePeriod">{period}</span>'
		+ '</div>',
	midHour: '<div class="calendarTimeMidHour">'
		+ '<span class="calendarTime">{hour}:30</span>'
		+ '</div>',

	eventBlock: '<div class="calendarEventBlock" title="Sample item (Sample location)" '
		+ 'style="top: {top}px; left: {left}px; width: {width}px; height: {height}px;">'
		+ '<div class="calendarEvent {eventState}" style="height: {innerHeight}px">'
		+ '<div class="calendarEventData calendarEventTitle">Sample item</div>'
		+ '<div class="calendarEventData calendarEventLocation">Sample location</div>'
		+ '</div></div>',

	shortEvent: 'shortEvent',
	shorterEvent: 'shorterEvent',
	shortestEvent: 'shortestEvent'
};

calendarView.config.containersId = {
	timeContainer: 'cvCalendarTimeContainer',
	eventsContainer: 'cvCalendarEventsContainer'
};

/**
 * Builder for update DOM
 * @type {Object}
 */
calendarView.layoutBuilder = (function (templatesParams, containersId, doc) {

	/**
	 * Template builder
	 * @param {Object} templates
	 * @constructor
	 */
	var TemplateBuilder = function (templates) {
		this._templates = templates;
	};

	/**
	 * Fill template
	 * @param {string} template
	 * @param {Object} data
	 * @private
	 */
	TemplateBuilder.prototype._fillWithData = function (template, data) {
		var pattern = /\{\w+\}/g;
		return template.replace(pattern,
			function (capture) {
				return (typeof data[capture.match(/\w+/)] != 'undefined')
					? data[capture.match(/\w+/)]
					: capture;
			}
		);
	};

	/**
	 * Fill times template
	 * @param {Array.<Object>} times
	 * @return {String}
	 */
	TemplateBuilder.prototype.fillTimesTemplate = function (times) {
		var filledTemplate = '',
			timesLength = times.length,
			currentTimeTemplate = '';

		for (var i = 0; i < timesLength; i++) {
			currentTimeTemplate = this._fillWithData(this._templates.hour, times[i]);
			if (i < timesLength - 1) {
				currentTimeTemplate += this._fillWithData(this._templates.midHour, times[i]);
			}
			filledTemplate += this._fillWithData(this._templates.timeBlock, {
				timeBlock: currentTimeTemplate
			})
		}

		return filledTemplate;
	};

	/**
	 * Fill times template
	 * @param {Array.<Object>} events
	 * @return {String}
	 */
	TemplateBuilder.prototype.fillEventsTemplate = function (events) {
		var filledTemplate = '', state,
			eventsLength = events.length,
			currentEventTemplate = '';

		for (var i = 0; i < eventsLength; i++) {
			currentEventTemplate = this._fillWithData(this._templates.eventBlock, events[i]);
			state = '';
			if (events[i].height < 3) {
				state = this._templates.shortestEvent;
			}
			else if (events[i].height < 20) {
				state = this._templates.shorterEvent;
			}
			else if (events[i].height < 40) {
				state = this._templates.shortEvent;
			}
			filledTemplate += this._fillWithData(currentEventTemplate, {
				innerHeight: events[i].height - 2,
				eventState: state
			})
		}

		return filledTemplate;
	};

	/**
	 * Layout builder (will update DOM)
	 * @param {TemplateBuilder} templateBuilder
	 * @param {Object} containers
	 * @constructor
	 */
	var LayoutBuilder = function (templateBuilder, containers) {
		this._containers = containers;
		this._templateBuilder = templateBuilder;
	};

	/**
	 * Update DOM container
	 * @param {string} containerId
	 * @param {string} content
	 * @private
	 */
	LayoutBuilder.prototype._updateContainer = function (containerId, content) {
		var container = doc.getElementById(containerId);
		if (!container) {
			return;
		}
		container.innerHTML = content;
	};

	/**
	 * Update times container
	 * @param {Array.<Object>} times
	 */
	LayoutBuilder.prototype.updateTimesContainer = function (times) {
		var content = this._templateBuilder.fillTimesTemplate(times);
		this._updateContainer(this._containers.timeContainer, content);
	};

	/**
	 * Update events container
	 * @param {Array.<Object>} events
	 */
	LayoutBuilder.prototype.updateEventsContainer = function (events) {
		var content = this._templateBuilder.fillEventsTemplate(events);
		this._updateContainer(this._containers.eventsContainer, content);
	};

	return new LayoutBuilder(new TemplateBuilder(templatesParams), containersId);

})(calendarView.config.templates, calendarView.config.containersId, document);