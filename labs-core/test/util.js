const Util = require('../src/util');
const expect = require('expect.js');

describe('Util', function() {
    it('values', function() {
        let obj = { a : 1, b : 2 };
        let v = Util.values(obj);
        expect(v).to.contain(1);
        expect(v).to.contain(2);
    });
});
