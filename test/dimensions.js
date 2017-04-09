const labs = require('./labs');
const Env = labs.Env;
const EnvBuilder = labs.EnvBuilder;

var assert = require('chai').assert;
describe('dimensions', function() {

    it('simplify division', function() {
        let a = Dimensions.simplify('V/A');
        assert.deepEqual('\\Omega', a);
    });

    it('simplify product', function() {
        let a = Dimensions.simplify('N * m');
        assert.deepEqual('J', a);
    });

    it('simplify complex', function() {
        let a = Dimensions.simplify('g * (m/s^2) / (V/m)');
        assert.deepEqual('C', a);
    });

});
