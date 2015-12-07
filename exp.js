var Exp = (function () {
	const DEFAULT_COMPOUND_OPERATOR = '*';

	var flatten = function (arr) {
		return arr.reduce(function (flat, toFlatten) {
			return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
		}, []);
	};

	const FNS = {
		'+': function (args) {
			return args.reduce(function (sum, value) {
				return sum + value;
			}, 0);
		},
		'*': function (args) {
			return args.reduce(function (sum, value) {
				return sum * value;
			}, 1);
		},
		'^': function (args) {
			return Math.pow(args[0], args[1]);
		},
		sin: function (args) {
			return Math.sin(args[0]);
		}
	};

	var Expression = function (ast) {
		this.ast = ast;
		if (this.ast.type === 'Call' && !FNS[this.ast.fn]) {
			throw 'Unknown function/operator: ' + this.ast.fn;
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
