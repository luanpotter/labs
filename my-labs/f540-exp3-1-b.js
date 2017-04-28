const { EnvBuilder } = require('labs');

const erro_r = rs => rs.map(r => [r, 0.01 * r + .001]);
const erro_v = vs => vs.map(v => [v, 0.02 * v + .05 * .01]);

let rs = erro_r([ 10, 100, 500, 1000, 2000, 3000, 4000, 5000, 7000, 8000, 10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000, 110000 ]);
let vdec = erro_v([ 0.00, 0.02, 0.14, 0.29, 0.57, 0.85, 1.11, 1.36, 1.82, 2.04, 2.44, 4.06, 4.21, 6.08, 6.75, 7.29, 7.73, 8.10, 8.40, 8.65, 8.70 ]);
let vce = erro_v([ 12.52, 12.49, 12.37, 12.24, 11.96, 11.70, 11.45, 11.22, 10.78, 10.58, 10.19, 8.66, 7.58, 6.76, 6.12, 5.61, 5.19, 4.85, 4.56, 4.32, 4.29 ]);

let create = () => {
    let b = new EnvBuilder();

    b.constObj({ name: 'v_cc', latexName: 'V_{CC}', unit: 'V', value: 15, error: 0 });
    b.constObj({ name: 'r4', latexName: 'R_4', unit: '\\Omega', value: 1, multiplier: 'k', error: 0 });

    b.variableObj({ name: 'r_dec', latexName: 'R_{dec}', unit: '\\Omega' });
    b.variableObj({ name: 'v_dec', latexName: 'V_{dec}', unit: 'V' });
    b.variableObj({ name: 'i_dec', latexName: 'I_{dec}', unit: 'A', formula: 'v_dec/r_dec' });

    b.variableObj({ name: 'v_ce', latexName: 'V_{CE}', unit: 'V' });
    b.variableObj({ name: 'i_ce', latexName: 'I_{CE}', unit: 'A', formula: 'v_ce/r4' });

    return b;
};

let b = create();
let e = b.build();
e.add('r_dec', rs);
e.add('v_dec', vdec);
e.add('v_ce', vce);

e.plot(['i_dec', 'i_ce'], 'results', 'I_{CE} por I_{DEC}', 'beta');
