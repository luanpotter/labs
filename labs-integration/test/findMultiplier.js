const { Env } = require('../src');
const assert = require('chai').assert;
const Decimal = require('decimal.js');

var m = function(v) {
    return Env.findMultipler(new Decimal(v));
};

describe('find multiplier', function() {
    it('finds multipliers', function() {
        assert.equal('', m('0.34').key);
        assert.equal('', m('12.2').key);
        assert.equal('', m('102.2').key);
        assert.equal('k', m('1020.2').key);
        assert.equal('m', m('.002').key);
    });
});
