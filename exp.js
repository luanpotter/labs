var Exp = (function () {
	const DEFAULT_COMPOUND_OPERATOR = '*';

	var flatten = function (arr) {
		return arr.reduce(function (flat, toFlatten) {
			return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
		}, []);
	};

	var parse = function (ast) {
		if (ast.type === 'Compound') {
			return {
				type: 'Call',
				fn: DEFAULT_COMPOUND_OPERATOR,
				args: ast.body.map(parse)
			};
		} else if (ast.type === 'Identifier') {
			return ast;
		} else if (ast.type === 'Literal') {
			if (typeof ast.value !== 'number') {
				throw 'AST Primitives can only be numbers; found ' + ast.value;
			}
			return ast;
		} else if (ast.type === 'CallExpression') {
			if (ast.callee.type !== 'Identifier') {
				throw 'AST CallExpressions must have Identifier as callees; found: ' + ast.callee.type;
			}
			return {
				type: 'Call',
				fn: ast.callee.name,
				args: ast.arguments.map(parse)
			};
		} else if (ast.type === 'UnaryExpression') {
			return {
				type: 'Call',
				fn: ast.operator,
				args: [ast.argument].map(parse)
			};
		} else if (ast.type === 'BinaryExpression') {
			return {
				type: 'Call',
				fn: ast.operator,
				args: [ast.left, ast.right].map(parse)
			};
		} else {
			throw 'Unsupported AST expression type: ' + ast.type;
		}
	};

	var deps = function (ast) {
		if (ast.type === 'Identifier') {
			return [ast.name];
		} else if (ast.type === 'Call') {
			return flatten(ast.args.map(deps));
		} else {
			return [];
		}
	};

	//config
	jsep.allowImplicitCompound = true;

	return {
		parse: function (str) {
			return parse(jsep(str));
		},
		deps: deps
	};
}());
