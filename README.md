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
      @type {Number}
    */
    id: <id>,
    
    /**
      @type {Number} time in minuts from 0
    */
    start: <time>,
    
    /**
      @type {Number} time in minuts from 0
    */
    end: <time>
  } /*, other events*/
];
```

Demo: http://juliarechkunova.github.com/one-day-calendar/
