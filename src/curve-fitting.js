const _ = require('lodash');

const ONE = new Decimal(1);

const times = (a, b) => a.times(b);
const plus = (a, b) => a.plus(b);
const square = a => times(a, a);
const sqrt = a => a.sqrt();

const fullSum = (size, ...data) => {
    return [...Array(size).keys()].map(i => data.map(d => d(i)).reduce(times, ONE)).reduce(plus);
};

const fitLin = (env, xKey, yKey) => {
    const data = id => env.fetchValues(env.obj(id));
    const yv = data(yKey);
    const xv = data(xKey);

    const N = xv.length;
    if (N !== yv.length) {
        throw 'Incompatible datasets!';
    }
    const sum = (...data) => fullSum(N, ...data);

    const x = i => xv[i].value;
    const y = i => yv[i].value;

    const w = i => ONE.dividedBy(square(yv[i].error)); // TODO consider errors on X
    const xsq = i => square(x(i));

    let delta = (sum(w).times(sum(w, xsq))).minus(square(sum(w, x)));
    let a = ((sum(w).times(sum(w, x, y))).minus(sum(w, y).times(sum(w, x)))).dividedBy(delta);
    let b = ((sum(w, y).times(sum(w, xsq))).minus(sum(w, y, x).times(sum(w, x)))).dividedBy(delta);
    let da = sqrt(sum(w).dividedBy(delta));
    let db = sqrt(sum(w, xsq).dividedBy(delta));

    // f = ax + b
    return [{ value: a, error: da }, { value: b, error: db }];
};

module.exports = { fitLin };
