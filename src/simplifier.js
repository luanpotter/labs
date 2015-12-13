(function () {

	var literal = Exp.literal,
		identifier = Exp.identifier,
		call = Exp.call;

	var isMultipleOfIdentifier = function (arg) {
		if (arg.isIdentifier()) {
			return true;
		}
		if (arg.isCall() && arg.fn === '*' && arg.args.length === 2) {
			var xTimesTwo = arg.args[0].isIdentifier() && arg.args[1].isLiteral();
			var twoTimesX = arg.args[1].isIdentifier() && arg.args[0].isLiteral();
			return xTimesTwo || twoTimesX;
		}
	};

	var getMultiple = function (arg) {
		if (arg.isIdentifier()) {
			return 1;
		}
		var multiple = arg.args[0].isLiteral() ? arg.args[0] : arg.args[1];
		return multiple.value;
	};

	var getIdentifier = function (arg) {
		if (arg.isIdentifier()) {
			return arg.name;
		}
		var identifier = arg.args[0].isIdentifier() ? arg.args[0] : arg.args[1];
		return identifier.name;
	};

	const SIMPLIFIERS = {
		'+': function (args) {
			var newArgs = [];
			while (args.length > 0) {
				var arg = args.pop();
				if (arg.isLiteral()) {
					var acc = arg.value;
					args = args.filter(function (otherArg) {
						if (!otherArg.isLiteral()) {
							return true;
						}
						acc = acc.plus(otherArg.value);
						return false;
					});
					newArgs.push(literal(acc));
				} else if (isMultipleOfIdentifier(arg)) {
					var acc = getMultiple(arg);
					args = args.filter(function (otherArg) {
						if (isMultipleOfIdentifier(otherArg) && getIdentifier(otherArg) === getIdentifier(arg)) {
							acc = acc.plus(getMultiple(otherArg));
							return false;
						}
						return true;
					});
					newArgs.push(acc.toNumber() === 1 ? arg : call('*', [literal(acc), getIdentifier(arg)]));
				} else {
					newArgs.push(arg);
				}
			}
			newArgs = newArgs.filter(function (arg) {
				return !(arg.isLiteral() && arg.value.toNumber() === 0);
			});
			if (newArgs.length === 1) {
				return newArgs[0];
			}
			if (newArgs.length === 0) {
				return literal(0);
			}
			return call('+', newArgs);
		},
		'-': function (args) {
			if (args.length === 1) {
				if (args[0].isLiteral()) {
					return literal(args[0].value.neg());
				}
			} else {
				if (args[0].isLiteral() && args[1].isLiteral()) {
					return literal(args[0].value.minus(args[1].value));
				}
			}
			return call('-', args);
		},
		'*': function (args) {
			var splat = [];
			args.forEach(function (arg) {
				if (arg.isCall() && arg.fn === '*') {
					splat = splat.concat(arg.args);
				} else {
					splat.push(arg);
				}
			});
			args = splat;
			var hasZeroes = args.filter(function (arg) {
				return arg.isLiteral() && arg.value.toNumber() === 0;
			}).length > 0;
			if (hasZeroes) {
				return literal(0);
			}
			var newArgs = [];
			while (args.length > 0) {
				var arg = args.pop();
				if (arg.isLiteral()) {
					var acc = arg.value;
					args = args.filter(function (otherArg) {
						if (otherArg.type !== 'Literal') {
							return true;
						}
						acc = acc.times(otherArg.value);
						return false;
					});
					newArgs.push(literal(acc));
				} else if (arg.isIdentifier()) {
					var acc = new Decimal(1);
					args = args.filter(function (otherArg) {
						if (otherArg.isIdentifier() && otherArg.name === arg.name) {
							acc = acc.plus(1);
							return false;
						}
						return true;
					});
					newArgs.push(acc.toNumber() === 1 ? arg : call('^', [arg, literal(acc)]));
				} else {
					newArgs.push(arg);
				}
			}
			newArgs = newArgs.filter(function (arg) {
				return !(arg.isLiteral() && arg.value.toNumber() === 1);
			});
			if (newArgs.length === 1) {
				return newArgs[0];
			}
			if (newArgs.length === 0) {
				return literal(1);
			}
			var prevLength = newArgs.length;
			newArgs = newArgs.filter(function (arg) {
				return !(arg.isLiteral() && arg.value.toNumber() === -1);
			});
			var hasMinusOne = prevLength !== newArgs.length;
			if (newArgs.length === 1) {
				return hasMinusOne ? call('-', newArgs[0]) : newArgs[0];
			}
			var r = call('*', newArgs);
			return hasMinusOne ? call('-', r) : r;
		},
		'^': function (args) {
			if (args[1].isLiteral() && args[1].value.toNumber() === 1) {
				return args[0];
			}
			if (args[1].isLiteral() && args[1].value.toNumber() === 0) {
				if (args[0].isLiteral() && args[0].value.toNumber() === 0) {
					throw 'oops... 0^0...';
				}
				return literal(1);
			}
			if (args[0].isLiteral() && args[0].value.toNumber() === 0) {
				return literal(0);
			}

			if (args[0].isLiteral() && args[0].value.isInteger()) {
				if (args[1].isLiteral() && args[1].value.isInteger()) {
					return literal(args[0].pow(args[1]));
				}
			}

			return call('^', args);
		}
	};

	var simplify = function (that) {
		if (that.type !== 'Call') {
			return that;
		}
		var s = SIMPLIFIERS[that.fn];
		var args = that.args.map(function (arg) {
			return simplify(arg);
		});
		return s ? s(args) : call(that.fn, args);
	};

	Exp.Expression.prototype.simplify = function () {
		return simplify(this);
	};

}());
