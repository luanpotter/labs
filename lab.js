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

	var remove = function (arr) {
		var what, a = arguments,
			L = a.length,
			ax;
		while (L > 1 && arr.length) {
			what = a[--L];
			while ((ax = arr.indexOf(what)) !== -1) {
				arr.splice(ax, 1);
			}
		}
		return arr;
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

	var validateName = function (name) {
		if (!name.match(/^[_a-zA-Z]+[a-zA-Z0-9_]*$/)) {
			throw 'Invalid variable name (must start with letter or underscore and then also allowing numbers): ' + name;
		}
	};

	var validateDeps = function (deps) {
		while (Object.keys(deps).length > 0) {
			var nodeps = Object.keys(deps).find(function (k) {
				return deps[k].length === 0;
			});
			if (!nodeps) {
				throw 'Circular dependency or unknown variable found: ' + JSON.stringify(deps);
			}
			delete deps[nodeps];
			Object.keys(deps).forEach(function (d) {
				remove(deps[d], nodeps);
			});
		}
	};

	var Env = function (vars) {
		this.vars = build(vars, ['name', 'unit', 'formula', 'values'], [undefined, '', undefined, []])
		var deps = {};
		Object.keys(this.vars).forEach(function (variable) {
			validateName(variable);
			if (this.vars[variable].formula) {
				this.vars[variable].formula = Exp.parse(this.vars[variable].formula);
				deps[variable] = this.vars[variable].formula.deps();
			} else {
				deps[variable] = [];
			}
		}.bind(this));
		validateDeps(deps);
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
		return values.map(function (v) {
			return v.value + ' \pm ' + v.error + ' ' + v.multiplier;
		}).join('\n');
	};

	Env.prototype.get = function (name) {
		var variable = this.vars[name];
		if (!variable) {
			throw 'Variable name \'' + name + '\' not found in vars list.';
		}

		return this.parse(this.fetchValues(variable));
	};

	Env.prototype.fetchValues = function (variable) {
		if (!variable.formula) {
			return variable.values;
		}

		var map = {};
		variable.formula.deps().forEach(function (dep) {
			map[dep] = this.fetchValues(this.vars[dep]);
		}.bind(this));

		var sizes = Object.keys(map).map(function (dep) {
			return map[dep].length;
		}).sort();

		if (sizes[0] !== sizes[sizes.length - 1]) {
			throw 'Incompatible datasets';
		}

		var i, size = sizes[0];
		var mapis = [];
		for (i = 0; i < size; i++) {
			var mapi = {};
			Object.keys(map).forEach(function (dep) {
				mapi[dep] = map[dep][i].value; // TODO consider multipler
			});
			mapis.push(mapi);
		}

		return mapis.map(function (mapi) {
			return {
				value: variable.formula.value(mapi),
				error: 0, // TODO consider error!
				multiplier: '' // TODO consider multipler
			};
		});
	};

	Env.prototype.deps = function (name) {
		var variable = this.vars[name];
		var ast = jsep(variable.formula);
		return Exp.deps(ast);
	};

	return Env;
})();
