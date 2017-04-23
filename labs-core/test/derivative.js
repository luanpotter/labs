const Exp = require('../src').Exp;
const expect = require('expect.js');

describe('derivative', function() {
    it('potency law', function() {
        var exp = Exp.parse('k^2').derivative('k');
        expect(exp.simplify().toPrettyString()).to.be('2*k');
    });
    it('sum, ignore other variable', function() {
        var exp = Exp.parse('3*x + 7*y').derivative('x');
        expect(exp.simplify().toPrettyString()).to.be('3');
    });
    it('complex', function() {
        var exp = Exp.parse('sin(k^2 + 3*k*x + 7*x)').derivative('k');
        expect(exp.simplify().toPrettyString()).to.be('3*x+2*k*cos(7*x+x*3*k+k^2)');
    });
});
