(function () {

	var Expression = Exp.Expression;

	var literal = function (value) {
		return new Expression({
			type: 'Literal',
			value: value,
			raw: value.toString()
		});
	};

	var call = function (fn, args) {
		return new Expression({
			type: 'Call',
			fn: fn,
			args: args
		});
	};

	var isMultipleOfIdentifier = function (arg) {
		if (arg.type === 'Identifier') {
			return true;
		}
		if (arg.type === 'Call' && arg.args.length === 2) {
			var xTimesTwo = arg.args[0].ast.type === 'Identifier' && arg.args[1].ast.type === 'Literal';
			var twoTimesX = arg.args[1].ast.type === 'Identifier' && arg.args[0].ast.type === 'Literal';
			return xTimesTwo || twoTimesX;
		}
	};

	var getMultiple = function (arg) {
		if (arg.type === 'Identifier') {
			return 1;
		}
		var multiple = arg.args[0].ast.type === 'Literal' ? arg.args[0] : arg.args[1];
		return multiple.ast.value;
	};

	var getIdentifier = function (arg) {
		if (arg.type === 'Identifier') {
			return arg.name;
		}
		var identifier = arg.args[0].ast.type === 'Identifier' ? arg.args[0] : arg.args[1];
		return identifier.ast.name;
	};

	const SIMPLIFIERS = {
		'+': function (args) {
			var newArgs = [];
			while (args.length > 0) {
				var exp = args.pop();
				var arg = exp.ast;
				if (arg.type === 'Literal') {
					var acc = arg.value;
					args = args.filter(function (ohterExp) {
						var otherArg = ohterExp.ast;
						if (otherArg.type !== 'Literal') {
							return true;
						}
						acc += otherArg.value;
						return false;
					});
					newArgs.push(literal(acc));
				} else if (isMultipleOfIdentifier(arg)) {
					var acc = getMultiple(arg);
					args = args.filter(function (otherExp) {
						var otherArg = otherExp.ast;
						if (isMultipleOfIdentifier(otherArg) && getIdentifier(otherArg) === getIdentifier(arg)) {
							acc += getMultiple(otherArg);
							return false;
						}
						return true;
					});
					newArgs.push(acc === 1 ? exp : call('*', [literal(acc), exp]));
				} else {
					newArgs.push(exp);
				}
			}
			newArgs = newArgs.filter(function (exp) {
				return !(exp.ast.type === 'Literal' && exp.ast.value === 0);
			});
			if (newArgs.length === 1) {
				return newArgs[0];
			}
			return call('+', newArgs);
		},
		'-': function (args) {
			if (args.length === 1) {
				if (args[0].ast.type === 'Literal') {
					return literal(-args[0].ast.value);
				}
			} else {
				if (args[0].ast.type === 'Literal' && args[1].ast.type === 'Literal') {
					return literal(args[0].ast.value - args[1].ast.value);
				}
			}
			return call('-', args);
		},
		'*': function (args) {
			var hasZeroes = args.filter(function (exp) {
				return exp.ast.type === 'Literal' && exp.ast.value === 0;
			}).length > 0;
			if (hasZeroes) {
				return literal(0);
			}
			var newArgs = [];
			while (args.length > 0) {
				var exp = args.pop();
				var arg = exp.ast;
				if (arg.type === 'Literal') {
					var acc = arg.value;
					args = args.filter(function (ohterExp) {
						var otherArg = ohterExp.ast;
						if (otherArg.type !== 'Literal') {
							return true;
						}
						acc *= otherArg.value;
						return false;
					});
					newArgs.push(literal(acc));
				} else if (arg.type === 'Identifier') {
					var acc = 1;
					args = args.filter(function (otherExp) {
						var otherArg = otherExp.ast;
						if (otherArg.type === 'Identifier' && otherArg.name === arg.name) {
							acc++;
							return false;
						}
						return true;
					});
					newArgs.push(acc === 1 ? exp : call('^', [exp, literal(acc)]));
				} else {
					newArgs.push(exp);
				}
			}
			newArgs = newArgs.filter(function (exp) {
				return !(exp.ast.type === 'Literal' && exp.ast.value === 1);
			});
			var prevLength = newArgs.length;
			newArgs = newArgs.filter(function (exp) {
				return !(exp.ast.type === 'Literal' && exp.ast.value === -1);
			});
			var hasMinusOne = prevLength !== newArgs.length;
			if (newArgs.length === 1) {
				return hasMinusOne ? call('-', newArgs[0]) : newArgs[0];
			}
			var r = call('*', newArgs);
			return hasMinusOne ? call('-', r) : r;
		}
	};

	var simplify = function (that) {
		if (that.ast.type !== 'Call') {
			return that;
		}
		var s = SIMPLIFIERS[that.ast.fn];
		var args = that.ast.args.map(function (ast) {
			return simplify(ast);
		});
		return s ? s(args) : call(that.ast.fn, args);
	};

	Expression.prototype.simplify = function () {
		return simplify(this);
	};

}());
