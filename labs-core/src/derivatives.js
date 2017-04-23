const Exp = require('./exp-base');

const call = Exp.call,
      literal = Exp.literal,
      identifier = Exp.identifier;

const DERIVATIVES = {
    '+': function() {
        return literal(1);
    },
    '-': function(args, i) {
        return literal(args.length == i ? -1 : +1);
    },
    '*': function(args, i) {
        var newArgs = args.slice();
        newArgs.splice(i, 1);
        return call('*', newArgs);
    },
    '/': function(args, i) {
        return i == 0 ? call('^', [args[1], literal(-1)]) : call('/', [args[0], call('^', [args[1], literal(2)])]);
    },
    '^': function(args, i) {
        return i == 0 ? call('*', [call('^', [args[0], call('-', [args[1], literal(1)])]), args[1]]) : call('*', [call('^', [args[0], args[1]]), call('ln', args[0])]);
    },
    'sin': function(args, i) {
        return call('cos', args[i]);
    },
    'cos': function(args, i) {
        return call('-', call('sin', args[i]));
    },
    'ln': function(args, i) {
        return call('/', [literal(1), args[i]]);
    },
    'exp': function(args, i) {
        return call('exp', [args[i]]);
    }
};

module.exports = DERIVATIVES;
