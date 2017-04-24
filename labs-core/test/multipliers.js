const Multipliers = require('../src').Multipliers;
const expect = require('expect.js');

describe('multipliers', function() {
    it('exists', function() {
        let k = Multipliers.MULTIPLIERS.k;
        expect(k.multiplier).to.equal('+3');
    });
});
