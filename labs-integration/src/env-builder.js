const { Util } = require('labs-core');
const Env = require('./env');

let EnvBuilder = (function () {
    const build = Util.build;

    const CONSTANTS = {
        'pi': { name : '\pi', value : Math.PI, unit : '', error : 0 },
        'e': { name : 'e', value : Math.E, unit : '', error : 0 }
    };

    var EnvBuilder = function () {
        this.vars = {};
        this.consts = {};
    }

    EnvBuilder.prototype.variableObj = function (obj) {
        this.vars[obj.name] = obj;
    };

    EnvBuilder.prototype.var = function (name, latex, unit, formula) {
        this.vars[name] = [latex, unit, formula];
    };

    EnvBuilder.prototype.varWithFormula = function (name, latex, formula) {
        this.vars[name] = [latex, '', formula];
    };

    EnvBuilder.prototype.constObj = function (obj) {
        this.consts[obj.name] = obj;
    }

    EnvBuilder.prototype.constantWithValue = function (name, latex, value, error, unit) {
        this.consts[name] = {
            name : latex,
            value : value,
            error : error,
            unit : unit
        }
    };

    EnvBuilder.prototype.constantWithFormula = function (name, latex, formula) {
        this.consts[name] = {
            name : latex,
            formula : formula
        };
    };

    EnvBuilder.prototype.build = function () {
        var vars = this.vars;
        var consts = this.consts;
        Object.keys(CONSTANTS).forEach(function (constant) {
            if (!(consts[constant]) && !(vars[constant])) {
                consts[constant] = CONSTANTS[constant];
            }
        });
        return new Env(vars, consts);
    };

    return EnvBuilder;
})();

module.exports = EnvBuilder;
