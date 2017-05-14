const fs = require('fs');
const _ = require('lodash');
const product = require('cartesian-product');

const extract = (haystack, needle) => needle.exec(haystack)[1];
const mapObj = (obj, fn) => {
    let res = {};
    Object.keys(obj).forEach(key => res[key] = fn(obj[key]));
    return res;
};
const counter = (data, fn) => {
    let ref_count = {};
    const getCount = level => !ref_count[level] ? ref_count[level] = 1 : ++ref_count[level];
    const toText = count => count == 1 ? '' : ' (' + String.fromCharCode(96 + count) + ')';
    const getCountChar = level => level + toText(getCount(level));
    return mapObj(data, el => fn(el, getCountChar));
};
const lambda = (e1, e2) => 299.792458/(Math.abs(e1 - e2)*1.60218/6.62607004);

let data;
data = fs.readFileSync('helium.dat', 'utf-8').split('\r\n').map(row => row.split(' | '));
data = _.groupBy(data, row => parseFloat(extract(row[0], /\s*([0-9\.]*)\s*eV\s*/g)));
data = mapObj(data, el => el.map(row => row.slice(1)));
data = mapObj(data, el => el.map(row => row.map((el, i) => i == 0 ? extract(el, /1s\^1(.*)/g).trim() : el)));
data = mapObj(data, el => _.uniq(el.map(r => r[0])));
data = counter(data, (el, getCount) => el.map(e => getCount(e)).join(', '));
data = Object.keys(data).map(v => [data[v], v]);

let heLevels = data;

data = data.map(row => row.join('\t')).join('\n');
//console.log(data);

data = product([heLevels, heLevels]).filter(pair => pair[0][0] !== pair[1][0] && pair[0][1] >= pair [1][1]);
data = data.map(pair => ({ n1 : pair[0][0], n2 : pair[1][0], lambda : lambda(pair[0][1], pair[1][1]) }));
let heSpectrum = data;

data = _.sortBy(heSpectrum, e => e.lambda);
data = data.filter(el => el.lambda < 993).map(el => [el.lambda, el.n1 + ' e ' + el.n2]);
data = _.unzip(_.chunk(data, data.length / 2));
const slap = a => a.length >= 6 ? '\\specialcell{$' + a.slice(0, a.length/2).join(',').trim() + '$\\\\$' + a.slice(a.length/2).join(',').trim() + '$}' : '$' + a.join(',') + '$';
const wrap = str => '$' + str + '$'
const crop = str => wrap(extract(str, /([0-9]*.[0-9]{3}).*/g))
const line = l => crop(l[0]) + ' & ' + slap(l[1].split(','));
//console.log(data.map(as => line(as[0]) + ' & ' + line(as[1]) + ' \\\\').join('\n'));

data = _.sortBy(heSpectrum, e => e.lambda);
data = data.filter(el => el.lambda > 430 && el.lambda < 670).map(el => [el.lambda, el.n1 + ' e ' + el.n2]);
data = _.groupBy(data, el => (''+el[0]).substring(0, 3));
data = Object.keys(data).map(key => data[key]).map(value => [_.meanBy(value, el => el[0]), value.map(el => el[1]).join(' ou ')]);
console.log(data.map(as => crop(as[0]) + ' & ' + wrap(as[1]) + ' \\\\').join('\n'));
