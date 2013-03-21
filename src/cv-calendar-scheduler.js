/**
 * CalendarView
 * @author JuliaRechkunova
 * @namespace
 */
window.calendarView = window.calendarView || {};
calendarView.config = calendarView.config || {};

// if false - scheduler will create new events array and check input events structure
calendarView.config.canModifyOriginalEventsAndAllEventsAreCorrect = false;

/**
 * Events container config
 * @type {Object}
 */
calendarView.config.container = {
	start: 0,
	end: 720,
	width: 620,
	height: 720,
	paddingLeft: 10,
	paddingRight: 10
};

/**
 * Events Scheduler
 * @type {Object}
 */
calendarView.scheduler = null; // will be set later

/**
 * Lays out events for a single  day
 * @param {Array.<Object>} events   An array of event objects. Each event object consists of a start and end
 *	time  (measured in minutes) from 9am, as well as a unique id. The
 *	start and end time of each event will be [0, 720]. The start time will
 *	be less than the end time.
 *
 * @return {Array.<Object>} An array of event objects that has the width, the left and top positions set, in addition to the id,
 *	start and end time. The object should be laid out so that there are no overlapping
 *  events.
 */
calendarView.scheduleEvents = function (events) {
	if (!calendarView.scheduler) {
		return [];
	}
	return calendarView.scheduler.layOutDay(events, calendarView.config.canModifyOriginalEventsAndAllEventsAreCorrect);
}


calendarView.scheduler = (function (calendarContainerParams) {

	/**
	 * Scheduler for events
	 * that can be customized by eventBuilder.
	 * Only eventBuilder know event object structure
	 * @param {EventBuilder} eventBuilder
	 * @constructor
	 */
	var SchedulerEvents = function (eventBuilder) {
		this._eventBuilder = eventBuilder;
	};

	/**
	 * Lay out a series of events on the calendar.
	 * Every event must have start and end properties
	 * @param {Array.<Object>} originalEvents
	 * @param {boolean} canModifyOriginalEvents
	 * @return {Array.<Object>}
	 */
	SchedulerEvents.prototype.layOutDay = function (originalEvents, canModifyOriginalEvents) {
		canModifyOriginalEvents = canModifyOriginalEvents || false;

		// if can not modify original events array - clone to other array
		var events = (canModifyOriginalEvents)
			? originalEvents
			: this._cloneEvents(originalEvents);

		// sort events array by start time (ascending)
		this._sortEventsByTimeStart(events);

		// schedule between items (calendar columns) in circular order
		// (minimum number of items, non overlapping event for every items)
		this._scheduleEventsBetweenItems(events);

		return events;
	};

	/**
	 * Schedule events between items.
	 * Items are columns in a calendar, processes or persons, etc.
	 * Like Round-robin scheduling (in circular order).
	 * Example: Number of items == 1 if all events are non overlapping,
	 * Number of items == number of events if all events are overlapping, etc
	 * @param {Array.<Object>} events
	 * @private
	 */
	SchedulerEvents.prototype._scheduleEventsBetweenItems = function (events) {
		var currentOverlappingEventsByItems = [],
			maxEventTimeEnd = 0,
			eventIndex,
			itemIndex,
			itemEventWithLastEndTime,
			itemsCount,
			itemEventsCount, // non overlapping events for item (in calendar column)
			isInserted; // if current event has been just scheduled

		for (eventIndex = 0; eventIndex < events.length; eventIndex++) {
			isInserted = false;

			// if this event does not overlap previous events
			if (this._eventBuilder.getTimeStart(events[eventIndex]) >= maxEventTimeEnd
				&& currentOverlappingEventsByItems.length > 0) {
				// solve coordinates for last overlapping events
				this._processCurrentOverlappingEvents(currentOverlappingEventsByItems);
				// now array currentOverlappingEventsByItems is empty
			}

			itemsCount = currentOverlappingEventsByItems.length;

			for (itemIndex = 0; itemIndex < itemsCount && !isInserted; itemIndex++) {

				itemEventsCount = currentOverlappingEventsByItems[itemIndex].length;
				itemEventWithLastEndTime = currentOverlappingEventsByItems[itemIndex][itemEventsCount - 1];

				if (this._eventBuilder.getTimeStart(events[eventIndex]) >= this._eventBuilder.getTimeEnd(itemEventWithLastEndTime)) {
					// insert event to item's array with non overlapping events
					currentOverlappingEventsByItems[itemIndex].push(events[eventIndex]);
					maxEventTimeEnd = Math.max(maxEventTimeEnd, this._eventBuilder.getTimeEnd(events[eventIndex]));
					isInserted = true; // break iterations of searching position for event
				}
			}

			// use new item (add calendar column) for this event
			// because this event overlapping to previous events
			if (!isInserted) {
				currentOverlappingEventsByItems.push([events[eventIndex]]);
				maxEventTimeEnd = Math.max(maxEventTimeEnd, this._eventBuilder.getTimeEnd(events[eventIndex]));
			}
		}

		this._processCurrentOverlappingEvents(currentOverlappingEventsByItems);
	};

	/**
	 * Process current overlapping events set.
	 * The length of this array is equal to number of necessary items.
	 * currentOverlappingEventsByItems[i] consist of non overlapping events for i-item.
	 * @param {Array.<Array.<Object>>} currentOverlappingEventsByItems
	 * @private
	 */
	SchedulerEvents.prototype._processCurrentOverlappingEvents = function (currentOverlappingEventsByItems) {
		var count = currentOverlappingEventsByItems.length,
			itemIndex,
			itemEventsCount,
			itemEventIndex;

		if (!count) {
			return;
		}

		for (itemIndex = 0; itemIndex < currentOverlappingEventsByItems.length; itemIndex++) {

			itemEventsCount = currentOverlappingEventsByItems[itemIndex].length;

			for (itemEventIndex = 0; itemEventIndex < itemEventsCount; itemEventIndex++) {
				this._eventBuilder.solveCoordinates(currentOverlappingEventsByItems[itemIndex][itemEventIndex], itemIndex, count);
			}
		}

		// clear current overlapping events set
		currentOverlappingEventsByItems.splice(0, count);
	};

	/**
	 * Clone events array
	 * @param {Array.<Object>} events
	 * @return {Array.<Object>}
	 * @private
	 */
	SchedulerEvents.prototype._cloneEvents = function (events) {
		var clonedEvents = [],
			eventIndex,
			length = events.length;
		for (eventIndex = 0; eventIndex < length; eventIndex++) {
			if (!this._eventBuilder.isEventCorrect(events[eventIndex])) {
				continue;
			}
			clonedEvents.push(this._eventBuilder.clone(events[eventIndex]));
		}
		return clonedEvents;
	};

	/**
	 * Sort in increasing events start time
	 * @param {Array.<Object>} events
	 * @private
	 */
	SchedulerEvents.prototype._sortEventsByTimeStart = function (events) {
		events.sort(this._eventBuilder.sortByTimeStartCompareHandler);
	};



	/**
	 * Describe and modify structure of event
	 * @param {Object} dayTimeIntervalParams
	 * @constructor
	 */
	var EventBuilder = function (dayTimeIntervalParams) {

		this._width = dayTimeIntervalParams.width - dayTimeIntervalParams.paddingLeft
			- dayTimeIntervalParams.paddingRight;
		this._paddingLeft = dayTimeIntervalParams.paddingLeft;
		this._heightRatio = dayTimeIntervalParams.height / (dayTimeIntervalParams.end - dayTimeIntervalParams.start);

		this._timeInterval = {
			start: dayTimeIntervalParams.start,
			end: dayTimeIntervalParams.end
		};
	};

	/**
	 * Customize position of event
	 * @param {Object} event
	 * @param {number} itemIndex
	 * @param {number} countOverlappingEventsWithCurrentEvent
	 */
	EventBuilder.prototype.solveCoordinates = function (event, itemIndex, countOverlappingEventsWithCurrentEvent) {
		event.top = (event.start - this._timeInterval.start) * this._heightRatio;
		event.width = this._width / countOverlappingEventsWithCurrentEvent;
		event.left = this._paddingLeft + itemIndex * event.width;
		event.height = (event.end - event.start) * this._heightRatio;
	};

	/**
	 * Is event correct?
	 * @param {Object} event
	 * @return {boolean}
	 */
	EventBuilder.prototype.isEventCorrect = function (event) {
		if (!event || typeof event != 'object') {
			return false;
		}
		if (typeof event.id != 'number') {
			return false;
		}
		if (typeof event.start != 'number'
			|| event.start < this._timeInterval.start) {
			return false;
		}
		if (typeof event.end != 'number'
			|| event.end > this._timeInterval.end
			|| event.start > event.end) {
			return false;
		}
		return true;
	};

	/**
	 * Compare events to sort its
	 * @param {Object} event1
	 * @param {Object} event2
	 * @return {number}
	 */
	EventBuilder.prototype.sortByTimeStartCompareHandler = function (event1, event2) {
		return (event1.start - event2.start);
	};

	/**
	 * Get time start of event
	 * @param {Object} event
	 * @return {number}
	 */
	EventBuilder.prototype.getTimeStart = function (event) {
		return event.start;
	};

	/**
	 * Get time end of event
	 * @param {Object} event
	 * @return {number}
	 */
	EventBuilder.prototype.getTimeEnd = function (event) {
		return event.end;
	};

	/**
	 * Clone event
	 * @param {Object} event
	 * @return {Object}
	 */
	EventBuilder.prototype.clone = function (event) {
		return {
			id: event.id,
			start: event.start,
			end: event.end
		};
	};

	return new SchedulerEvents(
		new EventBuilder(calendarContainerParams)
	);

})(calendarView.config.container);