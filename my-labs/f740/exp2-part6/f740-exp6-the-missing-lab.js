/*
 * N(x) = N_0 e^( - (rho x) mu / rho )
 * n = n0 e^(- x mu)
 * ln (n / n0) = - x mu
 */
 
const { EnvBuilder } = require('labs');
const _ = require('lodash');

// let n0 = [value, error];
// let xs = [[ 1, 2, 4, 6 ], error];
// let ns = [[ 1000, 500, 100, 10 ], error];

const run = (metal, n0, xs, ns) => {
 	let b = new EnvBuilder();
	 
	b.constObj({ name: 'n0', latexName: 'N_0', unit: '', value : n0[0], error : n0[1] });
	 
	b.variableObj({ name: 'n', latexName: 'N', unit: '' });
	b.variableObj({ name: 'x', unit: 'm' });
	 
	b.variableObj({ name: 'y', unit: '', formula: 'ln(n/n0)' });
	 
	let env = b.build();
	 
	env.add('x', xs, .1);
	env.add('n', ns, .1);
	 
	env.plot(['x', 'y'], 'ln', 'results(n/n0) por x para o ' + metal, 'mu_' + metal);
};

// run('co-al-p1', [423, 1], 
// run('pb', ...)
