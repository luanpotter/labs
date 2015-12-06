var Exp = (function () {

	const OPS = {
		'+': function (a1, a2) {
			return a1 + a2;
		},
		'-': function (a1, a2) {
			return a1 - a2;
		},
		'*': function (a1, a2) {
			return a1 * a2;
		},
		'/': function (a1, a2) {
			return a1 / a2;
		}
	};

	var Operator = function (fn) {
		//
	};

	var Atom = function (val) {
		this.val = val;
	};

	Atom.prototype.value = function () {
		return this.val;
	};

	var Operation = function (exp1, op, exp2) {
		//
	};

	return function (str) {};
}());
