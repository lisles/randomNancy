require('dotenv').config();

const { Chance } = require('chance');
const { DateTime } = require('luxon');

/* 
looking at luxon for date compare stuff. 
maybe config should be in ET and let luxon manage translating that to UTC
so that we don't have to worry about dst/est offsets
*/
const postWindow = JSON.parse(process.env.POST_WINDOW_UTC)

const dtNow = DateTime.utc().toISO();
const dtStart = DateTime.fromFormat(postWindow.start, 'H:mm', {zone: 'utc'}).toISO()
const dtEnd = DateTime.fromFormat(postWindow.end, 'H:mm', {zone: 'utc'}).toISO()

console.log(`now: ${dtNow} \nstart: ${dtStart} \nend: ${dtEnd}`)
console.log( (dtNow >= dtStart && dtNow <= dtEnd) ? 'between' : 'outside' )


//  chance stuff
// var chance= new Chance();
// for (i = 0; i < 100; i++) {
//   console.log(chance.weighted([false, true], [100, 1]));
// }

// const data = [
//   ['Apples', 10],
//   ['Bananas', 2],
//   ['Carrots', 5],
//   ['Dates', 1],
//   ['Eggplant', 3],
//   ['Figs', 1],
//   ['Gourds', 1],
// ];

// console.log(data)

// let out = [];

// // Loop through the master entries.
// for (let i = 0; i < data.length; ++i) {
//     // Push the value over and over again according to its
//     // weight.
//     for (let j = 0; j < data[i][1]; ++j) {
//         out.push(data[i][0]);
//     }
// }

// // And done!
// console.log(out[Math.floor(Math.random() * out.length)]);
