const fs = require('fs');
const findMax = (data, x1, x2) => data.slice(x1, x2).reduce((a, b) => a[1] > b[1] ? a : b, [0,0]);

const files = [ 'Co0.tsv', 'CoAl0.02.tsv', 'CoAl0.063.tsv' ];

let picos = files.map(file => {
  let data;
  
  data = fs.readFileSync(file, 'utf-8');
  data = data.split('\r\n').filter(line => line.match(/^[0-9]*\s[0-9]*$/g));
  data = data.map(el => el.split('\t').map(parseFloat));
  
  let pico1 = findMax(data, 50, 70)[1];
  let pico2 = findMax(data, 70, 120)[1];
  return [ pico1, pico2 ];
});

console.log(picos);
