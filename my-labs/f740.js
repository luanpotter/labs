var labs = require ('./labs');

var b = new labs.EnvBuilder();

b.constObj({
	name: 'epsilon',
	latexName: '\\epsilon',
	formula: 'V/d',
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
	error: '0.00001'
});

b.constObj({
	name: 'rho',
	latexName: '\\rho',
	unit: 'kg/m^3',
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
	name: 'dt',
	unit: 's',
	value: 4,
	error: 0
});

b.constObj({
	name: 'q',
	unit: 'm',
	value: 0.1,
	error: 0
});

b.constObj({
	name: 'q_prime',
	unit: 'm\'',
	value: 1.1,
	error: 0.05
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
	formula: 'df_prime*q/q_prime/1000'
});

b.variableObj({
	name: 'dr',
	latexName: '\delta_r',
	unit: 'm',
	formula: 'dr_prime*q/q_prime/1000'
});

b.variableObj({
	name: 'vf',
	latexName: 'v_f',
	unit: 'm/s',
	formula: 'df/dt'
});

b.variableObj({
	name: 'vr',
	latexName: 'v_r',
	unit: 'm/s',
	formula: 'dr/dt'
});

b.variableObj({
	name: 'a',
	description: 'Raio da gotícula',
	unit: 'm',
	formula: '((b^2)/(2*p) + 9*eta*vf/(2*g*p))^(1/2) - b/(2*p)'
})

b.variableObj({
	name: 'Vol',
	description: 'Volume da esfera',
	unit: 'm^3',
	formula: '4/3*pi*a^3'
});

b.variableObj({
	name: 'm',
	description: 'Massa da esfera',
	unit: 'kg',
	formula: 'rho * Vol'
});

b.variableObj({
	name: 'charge',
	latexName: 'q',
	description: 'Carga da esfera',
	unit: 'C',
	formula: 'm*g*(vf+vr)/(epsilon*vf)'
});

b.variableObj({
	name: 'p1',
	unit: '?',
	formula: '(vf+vr)/vf'
});

b.variableObj({
	name: 'p2',
	unit: '?',
	formula: 'm*g/epsilon'
});
var e = b.build();

e.add('df_prime', [ 3.0,  1.0,  2.0,  5.5], 0.05);
e.add('dr_prime', [-1.0, -2.3, -4.5, -7.0], 0.05);

console.log(e.fullLatexTable(['vr', 'vf', 'charge'], 'Minha tabela', 'charge'));