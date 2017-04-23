const Exp = require('../src').Exp;
const expect = require('expect.js');

describe('simplifier', function() {
    it('multiply by inverse', function() {
        var exp = Exp.parse('1/m * m');
        expect(exp.simplify().toPrettyString()).to.be('1');
    });
    it('sum', function() {
        var exp = Exp.parse('2*x + 3*x + 7*x^2/x');
        expect(exp.simplify().toPrettyString()).to.be('12*x');
    });
    it('potency of potency', function() {
        var exp = Exp.parse('(x^2)^2');
        expect(exp.simplify().toPrettyString()).to.be('x^4');
    });
    it('product of product', function() {
        var exp = Exp.parse('(x*y)*x');
        expect(exp.simplify().toPrettyString()).to.be('x^2*y');
    });
});
