var Env = (function () {

	var Numbers = (function () {
		return {
			is: function (n) {
				return /^[\+\-]?\d*\.?\d*$/.test(n);
			}
		};
	})();

	var build = function (map, values, defaults) {
		return Object.keys(map).reduce(function (result, key) {
			result[key] = {};
			values.forEach(function (current, i) {
				result[key][current] = map[key][i] || (defaults ? defaults[i] : undefined);
			});
			return result;
		}, {});
	};

	const UNITS = build({
		'm': 'Metro',
		's': 'Segundo',
		'g': 'Grama',
		'C': 'Coulomb',
		'K': 'Kelvin',

		'Hz': ['Hertz', '1/s'],
		'N': ['Newton', 'kg m / s^2'],
		'J': ['Joule', 'N m'],
		'Pa': ['Pascal', 'N / m^2'],
		'W': ['Pascal', 'J / s'],

		'A': ['Ampère', 'C/s'],
		'V': ['Volt', 'W / A'],
		'\\Omega': ['Ohm', 'V / A'],
		'F': ['Farad', 'C / V'],
		'H': ['Henry', 'Wb / A'],
		'Wb': ['Webber', 'J / A'],
		'T': ['Tesla', 'Wb / m^2']
	}, ['name', 'formula']);

	const MULTIPLIERS = build({
		'G': ['+9', 'Giga'],
		'M': ['+6', 'Mega'],
		'k': ['+3', 'Kilo'],
		'': ['0', ''],
		'm': ['-3', 'Mili'],
		'\\mu': ['-6', 'Micro'],
		'n': ['-9', 'Nano'],
		'p': ['-12', 'Pico']
	}, ['multiplier', 'name']);

	var defaultMultiplier = function (unit) {
		return unit.name === 'Grama' ? 'k' : '';
	};

	var Env = function (vars) {
		this.vars = build(vars, ['name', 'unit', 'formula', 'values'], [undefined, '', undefined, []]);
	};

	Env.prototype.addValues = function (variable, list) {
		this.vars[variable].values = this.vars[variable].values.concat(list);
	};

	Env.prototype.add = function (name, list, errorOrMultiplier, error) {
		var variable = this.vars[name];
		if (!variable) {
			throw 'Variable name \'' + name + '\' not found in vars list.';
		}
		if (variable.formula) {
			throw 'Variable name \'' + name + '\' has a formula associated with it, so you cannot add values.';
		}

		var multiplier = errorOrMultiplier;
		if (errorOrMultiplier && Numbers.is(errorOrMultiplier)) {
			error = errorOrMultiplier;
			multiplier = '';
		}
		multiplier = multiplier || defaultMultiplier(variable.unit);

		list = list.map(function (el) {
			var value = {
				value: el[0],
				multiplier: el[1],
				error: el[2]
			};
			if (value.multiplier && Numbers.is(value.multiplier)) {
				value.error = value.multiplier;
				value.multiplier = undefined;
			}

			value.multiplier = value.multiplier || multiplier;
			value.error = value.error || error;

			return value;
		});

		this.addValues(name, list);
	};

	Env.prototype.parse = function (values) {

	};

	Env.prototype.get = function (name) {
		var variable = this.vars[name];
		if (!variable) {
			throw 'Variable name \'' + name + '\' not found in vars list.';
		}
		var values = variable.formula ? ['todo'] : variable.values;

		return parse(values);
	};

	return Env;
})();
