const Exp = require('./exp-base');
const Simplifier = require('./simplifier');
const DERIVATIVES = require('./derivatives');

Exp.Expression.prototype.simplify = function () {
  return Simplifier.simplify(this);
};

Exp.Expression.prototype.derivative = function(dLiteral) {
    if (this.isLiteral()) {
        return Exp.literal(0);
    } else if (this.isIdentifier()) {
        return this.name === dLiteral ? Exp.literal(1) : Exp.literal(0);
    } else {
        var der = DERIVATIVES[this.fn],
            args = this.args;
        return Exp.call('+', args.map(function(arg, i) {
            return Exp.call('*', [der(args, i), arg.derivative(dLiteral)]);
        }));
    }
};

module.exports = Exp;
