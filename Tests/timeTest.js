const Time = require('./../Time.js')

let t = new Time();
console.log("End: " + t.getUTCGetLastEndOfWeekSeconds());
console.log("Start: " + t.getUTCGetLastStartOfWeekSeconds());