one-day-calendar
================

Calendar view for scheduling and display events of one day.

Input data: events array
```javascript
/**
 * An array of event objects. Each event object consists of a start and end
 *  time  (measured in minutes) from 9am, as well as a unique id. The
 *	start and end time of each event will be [0, 720]. The start time should
 *	be less than the end time.
 */
var events = [
  {
    /**
    * @type {Number}
    */
    id: 0,
    
    /**
    * @type {Number} time in minuts from 0
    */
    start: 60, // 10am
    
    /**
    * @type {Number} time in minuts from 0
    */
    end: 120 // 11am
  } /*, other events*/
];
```

Demo: http://jughosta.github.com/one-day-calendar/
