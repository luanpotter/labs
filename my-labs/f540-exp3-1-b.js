const labs = require('../test/labs');
const plot = require('../src/plot');

const erro_r = rs => rs.map(r => [r, 0.01 * r + 1]);
const erro_v = vs => vs.map(v => [v, 0.02 * v + .05 * .01]);

let rs = erro_r([9.9, 19.8, 49.5, 98.3, 195.2, 391, 686]);
let vdec = erro_v([0.42, 0.45, 0.47, 0.48, 0.49, 0.5, 0.51]);
let vce = erro_v([2.71, 3.04, 3.23, 3.29, 3.32, 3.31, 3.33]);

let create = () => {
    let b = new labs.EnvBuilder();

    b.constObj({ name: 'v_cc', latexName: 'V_{CC}', unit: 'V', value: 15, error: 0 });
    b.constObj({ name: 'r4', latexName: 'R_4', unit: '\\Omega', value: 1, multiplier: 'k', error: 0 });

    b.variableObj({ name: 'r_dec', latexName: 'R_{dec}', unit: '\\Omega' });
    b.variableObj({ name: 'v_dec', latexName: 'V_{dec}', unit: 'V' });
    b.variableObj({ name: 'i_dec', latexName: 'I_{dec}', unit: 'A', formula: 'v_dec/r_dec' });

    b.variableObj({ name: 'v_ce', latexName: 'V_{CE}', unit: 'V' });
    b.variableObj({ name: 'i_ce', latexName: 'I_{CE}', unit: 'A', formula: '(v_cc - v_ce)/r4' });

    return b;
};

let b = create();
let e = b.build();
e.add('r_dec', rs, 'k');
e.add('v_dec', vdec);
e.add('v_ce', vce);

console.log('latex');
console.log(e.fullLatexTable(['i_ce', 'i_dec'], 'nome', 'label'));
console.log('origin');
console.log(e.originTable(['i_ce', 'i_dec']));

plot.plot(e, ['i_ce', 'i_dec'], 'beta');