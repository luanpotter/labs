const fitter = require('../src');
const Decimal = require('decimal.js');
const expect = require('expect.js');

// TODO : zero errors wont work!
const ZERO = new Decimal('10e-100');

describe('labs-fitter', function() {
    it('perfect line', function() {
      let data = [1, 2, 3, 4, 5];
      let toVal = e => ({ value : new Decimal(e), error: ZERO  });

      let xv = data.map(toVal);
      let yv = data.map(e => 3*e).map(toVal);

      let r = fitter.fitLin(xv, yv);

      expect(r[0].value.toFixed()).to.be('3');
      expect(r[0].error.toFixed()).to.be.below(ZERO);
      expect(r[1].value.toFixed()).to.be('0');
      expect(r[1].error.toFixed()).to.be.below(ZERO);
    });
});
