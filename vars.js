env = new Env({
	n: ['N'],
	'2n': ['2N', '', '2 * N + sin(3x^2)']
});

env.add('n', ['1', '2', '3'], '0.5');
env.add('lambda', [
	['1', '0.1'],
	['2', 'n', '0.02'], '3'
], 'n');
env.add('xp', ['1', '2', '3'], 'm', '0.01');

env.get('f'); // [4, 5, 6]

env.table('Valores de...', ['N', 'lambda', 'xp', 'f']); // <generated latex>

Exp.parse('2x sin(theta/2)')
