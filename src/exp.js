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

	const FNS = {
		'+': fn(function (args) {
			return args.reduce(function (sum, value) {
				return sum + value;
			}, 0)
		}).d(function (literal, astArgs) {
			return call('+', astArgs.map(function (astArg) {
				return astArg.derivative(literal);
			}));
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

	//config jsep
	jsep.allowImplicitCompound = true;
	['!', '~'].forEach(jsep.removeUnaryOp);
	['||', '&&', '|', '^', '&', '<<', '>>', '>>>'].forEach(jsep.removeBinaryOp);
	['==', '!=', '===', '!==', '<', '>', '<=', '>='].forEach(jsep.removeBinaryOp);
	jsep.addBinaryOp('^', 11);

	return {
		parse: function (str) {
			return parse(jsep(str));
		},
		Expression: Expression
	};
}());
