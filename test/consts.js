const labs = require('./labs');
const Env = labs.Env;
const EnvBuilder = labs.EnvBuilder;

var assert = require('chai').assert;
describe('consts', function() {
    it('using const in a formula', function() {
        var builder = new EnvBuilder();
        builder.var('r', 'r', 'm');
        builder.var('A', 'A', 'm', 'pi*r^2');
        
        var env = builder.build();
        env.add('r', [1, 2], 0.5);
        var table = env.table(['r', 'A']);
        var result = [
            [
                { value: '1.0', error: '0.5', multiplier: '' },
                { value: '3', error: '3', multiplier: '' }
            ],
            [
                { value: '2.0', error: '0.5', multiplier: '' },
                { value: '13', error: '6', multiplier: '' }
            ]
        ];
        assert.deepEqual(result, table);
    });
});
