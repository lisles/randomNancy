require('dotenv').config();
const settings = require('./settings.json');

const { Chance } = require('chance');
const { DateTime, Interval } = require('luxon');

/* 
looking at luxon for date compare stuff. 
maybe config should be in ET and let luxon manage translating that to UTC
so that we don't have to worry about dst/est offsets
*/
const postWindow = settings.config.postWindowUTC

const dtNow = DateTime.utc().toISO();
const dtStart = DateTime.fromFormat(postWindow.start, 'H:mm', {zone: 'utc'}).toISO();
const dtEnd = DateTime.fromFormat(postWindow.end, 'H:mm', {zone: 'utc'}).toISO();
const nHoursOpen = Interval.fromDateTimes(DateTime.fromISO(dtStart), DateTime.fromISO(dtEnd)).count('hours');

console.log(`now: ${dtNow} \nstart: ${dtStart} \nend: ${dtEnd}`)
console.log( (dtNow >= dtStart && dtNow <= dtEnd) ? 'between' : 'outside' )
