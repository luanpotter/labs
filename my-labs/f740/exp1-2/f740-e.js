const labs = require('labs');

var b = new labs.EnvBuilder();

b.constObj({
	name: 'epsilon',
	latexName: '\\epsilon',
	formula: '-V/d',
	unit: 'V/m'
});

b.constObj({
	name: 'V',
	unit: 'V',
	value: 500,
	error: 1
});

b.constObj({
	name: 'd',
	unit: 'm',
	value: '0.0072',
	error: '0.00005'
});

b.constObj({
	name: 'rho',
	latexName: '\\rho',
	unit: 'g/m^3',
	multiplier: 'k',
	value: '886',
	error: 0
});

b.constObj({
	name: 'g',
	unit: 'm/s^2',
	value: '9.887',
	error: '0.001'
});

b.constObj({
	name: 'b',
	description: 'Constante de Stokes',
	unit: 'J/m^2',
	value: '0.008226',
	error: 0
});

b.constObj({
	name: 'eta',
	latexName: '\\eta',
	description: 'Viscosidade do ar na sala',
	multiplier: '\\mu',
	unit: 'Pa*s',
	value: '18.61',
	error: '0.01'
});

b.constObj({
	name: 'p',
	description: 'Pressão atmosférica na sala',
	multiplier: 'k',
	unit: 'Pa',
	value: '94',
	error: 0
});

b.constObj({
	name: 'q',
	unit: 'm',
	multiplier: 'm',
	value: 0.1,
	error: 0
});

b.constObj({
	name: 'q_prime',
	unit: 'cm\'',
	value: 0.80,
	error: 0.05
});


b.variableObj({
	name: 'dtf',
	latexName: '\Delta_{t_f}',
	unit: 's'
});

b.variableObj({
	name: 'dtr',
	latexName: '\Delta_{t_r}',
	unit: 's'
});

b.variableObj({
	name: 'df_prime',
	latexName: '\delta_f^\prime',
	unit : 'cm\''
});

b.variableObj({
	name: 'dr_prime',
	latexName: '\delta_r^\prime',
	unit : 'cm\''
});

b.variableObj({
	name: 'df',
	latexName: '\delta_f',
	unit: 'm',
	formula: 'df_prime*q/q_prime'
});

b.variableObj({
	name: 'dr',
	latexName: '\delta_r',
	unit: 'm',
	formula: 'dr_prime*q/q_prime'
});

b.variableObj({
	name: 'vf',
	latexName: 'v_f',
	unit: 'm/s',
	formula: 'df/dtf'
});

b.variableObj({
	name: 'vr',
	latexName: 'v_r',
	unit: 'm/s',
	formula: 'dr/dtr'
});

b.variableObj({
	name: 'a',
	description: 'Raio da gotícula',
	unit: 'm',
	formula: '((b/(2*p))^2 + 9*eta*vf/(2*g*p))^(1/2) - b/(2*p)'
})

b.variableObj({
	name: 'Vol',
	description: 'Volume da gotícula',
	unit: 'm^3',
	formula: '4/3*pi*a^3'
});

b.variableObj({
	name: 'm',
	description: 'Massa da gotícula',
	unit: 'g',
	formula: 'rho * Vol'
});

b.variableObj({
	name: 'charge',
	latexName: 'q',
	description: 'Carga da gotícula',
	unit: 'C',
	formula: 'm*g*(vf-vr)/(epsilon*vf)'
});

b.constObj({
	name: 'e',
	description: 'Electron\'s charge',
	unit: 'C',
	multiplier: 'z',
	value: -160.21766,
	error: 0
});

b.variableObj({
	name: 'n',
	unit: '',
	formula: 'charge/e'
});

var e = b.build();

e.add('df_prime', [ 1.40, 1.40, 1.50, 1.90, 1.15, 1.45, 1.20, 1.30, 0.90, 0.95, 1.05 ]);
e.add('dtf', [ 12.0, 7.0, 16.0, 14.0, 9.0, 8.0, 11.0, 12.0, 7.0, 10.0, 10.0 ]);
e.add('dr_prime', [ 3.00, 4.90, 4.50, 5.85, 4.30, 2.40, 2.35, 7.80, 3.65, 2.90, 2.80 ]);
e.add('dtr', [ 2.0, 14.0, 3.0, 2.0, 1.5, 2.5, 3.0, 6.0, 4.0, 3.0, 4.0 ]);

console.log('---------------------------------------')
console.log(e.fullLatexTable(['df_prime', 'dr_prime', 'dtf', 'dtr', 'df', 'dr'], 'Medições M', 'medicoes_m'));
console.log('---------------------------------------')
console.log(e.fullLatexTable(['vr', 'vf', 'a'], 'Caracteriação M', 'caracterizacao_m'));
console.log('---------------------------------------')
console.log(e.fullLatexTable(['a', 'Vol', 'm', 'charge'], 'Cargas M', 'cargas_m'));
console.log('---------------------------------------')
