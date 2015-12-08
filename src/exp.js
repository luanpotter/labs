var Exp = (function () {
	const DEFAULT_COMPOUND_OPERATOR = '*';

	var flatten = Utils.flatten;

	var fn = function (func) {
		func.qtds = [];
		func.one = function () {
			this.qtds.push(1);
			return this;
		}.bind(func);
		func.two = function () {
			this.qtds.push(2);
			return this;
		}.bind(func);
		func.d = function (derivative) {
			this.derivative = derivative;
			return this;
		}.bind(func);
		func.s = function (simplifier) {
			this.simplifier = simplifier;
			return this;
		}.bind(func);
		return func;
	};

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

	const FNS = {
		'+': fn(function (args) {
			return args.reduce(function (sum, value) {
				return sum + value;
			}, 0)
		}).d(function (literal, astArgs) {
			return call('+', astArgs.map(function (astArg) {
				return astArg.derivative(literal);
			}));
		}).s(function (args) {
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
		}),
		'-': fn(function (args) {
			return args.length == 2 ? args[0] - args[1] : -args[0];
		}).one().two().d(function (literal, astArgs) {
			return call('-', astArgs.map(function (astArg) {
				return astArg.derivative(literal);
			}));
		}),
		'*': fn(function (args) {
			return args.reduce(function (sum, value) {
				return sum * value;
			}, 1);
		}).d(function (literal, astArgs) {
			var first = astArgs[0];
			var rest = astArgs.length == 2 ? astArgs[1] : call('*', astArgs.slice(1));
			var p1 = call('*', [first.derivative(literal), rest]);
			var p2 = call('*', [first, rest.derivative(literal)]);
			return call('+', [p1, p2]);
		}).s(function (args) {
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
		}),
		'/': fn(function (args) {
			return args[0] / args[1];
		}).two(),
		'^': fn(function (args) {
			return Math.pow(args[0], args[1]);
		}).two(),
		'sin': fn(function (args) {
			return Math.sin(args[0]);
		}).one(),
		'cos': fn(function (args) {
			return Math.cos(args[0]);
		}).one()
	};

	var Expression = function (ast) {
		this.ast = ast;
		if (this.ast.type === 'Call') {
			if (!FNS[this.ast.fn]) {
				throw 'Unknown function/operator: ' + this.ast.fn;
			}
			if (FNS[this.ast.fn].qtds.length > 0 && !FNS[this.ast.fn].qtds.includes(ast.args.length)) {
				throw 'Wrong amount of args for ' + this.ast.fn;
			}
		}
	};

	Expression.prototype.deps = function () {
		if (this.ast.type === 'Identifier') {
			return [this.ast.name];
		} else if (this.ast.type === 'Call') {
			return flatten(this.ast.args.map(function (ast) {
				return ast.deps();
			}));
		} else {
			return [];
		}
	};

	Expression.prototype.value = function (vars) {
		if (this.ast.type === 'Literal') {
			return this.ast.value;
		} else if (this.ast.type === 'Identifier') {
			return vars[this.ast.name];
		} else {
			var parsedArgs = this.ast.args.map(function (arg) {
				return arg.value(vars);
			});
			return FNS[this.ast.fn](parsedArgs);
		}
	};

	Expression.prototype.derivative = function (dLiteral) {
		if (this.ast.type === 'Literal') {
			return literal(0);
		} else if (this.ast.type === 'Identifier') {
			return this.ast.name === dLiteral ? literal(1) : literal(0);
		} else {
			return FNS[this.ast.fn].derivative(dLiteral, this.ast.args);
		}
	};

	Expression.prototype.toString = function () {
		if (this.ast.type === 'Literal') {
			return this.ast.value.toString();
		} else if (this.ast.type === 'Identifier') {
			return this.ast.name;
		} else {
			if (this.ast.fn.length === 1) { // operator
				if (this.ast.args.length === 1) { //unary
					return this.ast.fn + this.ast.args[0].toString();
				}
				return this.ast.args.map(function (ast) {
					return ast.toString();
				}).join(' ' + this.ast.fn + ' ');
			} else { // function
				return this.ast.fn + '(' + this.ast.args.map(function (ast) {
					return ast.toString();
				}).join(', ') + ')';
			}
		}
	};

	Expression.prototype.eq = function (other) {
		if (this.ast.type !== other.ast.type) {
			return false;
		}
		if (this.ast.type === 'Literal') {
			return this.ast.value === oher.ast.value;
		} else if (this.ast.type === 'Identifier') {
			return this.ast.name === oher.ast.name;
		} else {
			if (this.ast.fn !== other.ast.fn || this.ast.args.length !== other.ast.args.length) {
				return false;
			}
			for (var i = 0; i < this.ast.args.length; i++) {
				if (!this.ast.args[i].eq(other.ast.args[i])) {
					return false;
				}
			}
			return true;
		}
	};


	Expression.prototype.simplify = function () {
		if (this.ast.type !== 'Call') {
			return this;
		}
		var s = FNS[this.ast.fn].simplifier;
		var args = this.ast.args.map(function (ast) {
			return ast.simplify();
		});
		return s ? s(args) : call(this.ast.fn, args);
	};

	var parse = function (ast) {
		if (ast.type === 'Compound') {
			return new Expression({
				type: 'Call',
				fn: DEFAULT_COMPOUND_OPERATOR,
				args: ast.body.map(parse)
			});
		} else if (ast.type === 'Identifier') {
			return new Expression(ast);
		} else if (ast.type === 'Literal') {
			if (typeof ast.value !== 'number') {
				throw 'AST Primitives can only be numbers; found ' + ast.value;
			}
			return new Expression(ast);
		} else if (ast.type === 'CallExpression') {
			if (ast.callee.type !== 'Identifier') {
				throw 'AST CallExpressions must have Identifier as callees; found: ' + ast.callee.type;
			}
			return new Expression({
				type: 'Call',
				fn: ast.callee.name,
				args: ast.arguments.map(parse)
			});
		} else if (ast.type === 'UnaryExpression') {
			return new Expression({
				type: 'Call',
				fn: ast.operator,
				args: [ast.argument].map(parse)
			});
		} else if (ast.type === 'BinaryExpression') {
			return new Expression({
				type: 'Call',
				fn: ast.operator,
				args: [ast.left, ast.right].map(parse)
			});
		} else {
			throw 'Unsupported AST expression type: ' + ast.type;
		}
	};

	//config
	jsep.allowImplicitCompound = true;

	return {
		parse: function (str) {
			return parse(jsep(str));
		}
	};
}());
