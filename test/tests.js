var Env = require('./labs');

var assert = require('chai').assert;
describe('simple tests', function() {
    it('simple test should double values', function() {
        var env = new Env({
            'x': ['x', 'N'],
            'y': ['y', 'N', '2*x']
        });
        env.add('x', [1, 2, 3, 4.5], 0.5);
        var table = env.table(['x', 'y']);
        var result = [
            [
                { value: '1.0', error: '0.5', multiplier: '' },
                { value: '2', error: '1', multiplier: '' }
            ],
            [
                { value: '2.0', error: '0.5', multiplier: '' },
                { value: '4', error: '1', multiplier: '' }
            ],
            [
                { value: '3.0', error: '0.5', multiplier: '' },
                { value: '6', error: '1', multiplier: '' }
            ],
            [
                { value: '4.5', error: '0.5', multiplier: '' },
                { value: '9', error: '1', multiplier: '' }
            ]
        ];
        assert.deepEqual(result, table);
    });
});
