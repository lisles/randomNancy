const { Chance } = require('chance');
var chance= new Chance();

var d = new Date();
console.log(d.getTime().toLocaleString())
console.log(Date.now())

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
